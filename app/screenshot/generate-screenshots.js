import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'output');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const APP_URL = process.env.APP_URL || 'http://localhost:5174';

// iPhone 14 Pro resolution (shots.so standard)
const PHONE_W = 390;
const PHONE_H = 844;

// Social media output sizes
const FORMATS = {
  square:   { w: 1080, h: 1080 },  // Facebook + Threads
  portrait: { w: 1080, h: 1350 },  // Threads portrait
  story:    { w: 1080, h: 1920 },  // Stories
};

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function injectFallbackWisdom(page) {
  // Inject full wisdom data so screenshot looks great without API
  await page.evaluate(() => {
    const wisdom = {
      id: 1,
      content: 'Sesungguhnya bersama kesulitan ada kemudahan.',
      arabic_text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      meaning: 'Setiap kesukaran yang datang dalam hidup kita, Allah telah menyediakan kemudahan di sebaliknya. Ini bukan janji yang kosong — ini adalah kepastian dari Allah.',
      lesson: 'Jangan berhenti di tengah ujian. Kemudahan itu datang bersama kesukaran, bukan selepasnya. Teruskan melangkah dengan penuh keyakinan kepada Allah.',
      source: 'Al-Quran (94:5-6)',
      category: 'Sabar',
      language: 'ms',
      tags: null,
    };
    // Override fetch to return mock data
    window._mockWisdom = wisdom;
    const origFetch = window.fetch;
    window.fetch = async (url, ...args) => {
      if (url.includes('/api/v1/wisdom')) {
        return new Response(JSON.stringify({ data: wisdom }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return origFetch(url, ...args);
    };
  });
}

async function makePhoneMockup(screenshotBuffer, label) {
  const SCALE = 2.5; // retina
  const PW = Math.round(PHONE_W * SCALE);
  const PH = Math.round(PHONE_H * SCALE);

  // Resize screenshot to phone dimensions
  const resized = await sharp(screenshotBuffer)
    .resize(PW, PH, { fit: 'cover', position: 'top' })
    .toBuffer();

  // Add rounded corners mask
  const rounded = Buffer.from(
    `<svg width="${PW}" height="${PH}">
      <rect x="0" y="0" width="${PW}" height="${PH}" rx="80" ry="80" fill="white"/>
    </svg>`
  );

  return sharp(resized)
    .composite([{ input: rounded, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function compositeCard(phoneBuffer, format, bgColor = '#0a0c10') {
  const { w, h } = FORMATS[format];

  // Background
  const bg = await sharp({
    create: { width: w, height: h, channels: 4, background: bgColor }
  }).png().toBuffer();

  // Resize phone to fit
  const phoneH = Math.round(h * 0.82);
  const phoneW = Math.round(phoneH * (PHONE_W / PHONE_H));
  const resizedPhone = await sharp(phoneBuffer)
    .resize(phoneW, phoneH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Center phone
  const left = Math.round((w - phoneW) / 2);
  const top = format === 'square' ? Math.round((h - phoneH) / 2) - 40 : 60;

  // Glow overlay SVG
  const glow = Buffer.from(
    `<svg width="${w}" height="${h}">
      <radialGradient id="g" cx="50%" cy="50%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#0a0c10" stop-opacity="0"/>
      </radialGradient>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`
  );

  // Branding text SVG
  const brandingY = format === 'square' ? h - 110 : h - 140;
  const branding = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <text x="${w/2}" y="${brandingY}" text-anchor="middle"
        font-family="Georgia, serif" font-size="52" fill="#f59e0b" font-style="italic">
        Qalbu
      </text>
      <text x="${w/2}" y="${brandingY + 50}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.3)" letter-spacing="6">
        SIRAMAN ROHANI HARIAN
      </text>
    </svg>`
  );

  return sharp(bg)
    .composite([
      { input: glow, blend: 'over' },
      { input: resizedPhone, left, top },
      { input: branding, blend: 'over' },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();
}

const FALLBACK_WISDOM = {
  id: 1,
  content: 'Sesungguhnya bersama kesulitan ada kemudahan.',
  arabic_text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
  meaning: 'Setiap kesukaran yang datang dalam hidup kita, Allah telah menyediakan kemudahan di sebaliknya. Ini bukan janji yang kosong — ini adalah kepastian dari Allah.',
  lesson: 'Jangan berhenti di tengah ujian. Kemudahan itu datang bersama kesukaran, bukan selepasnya. Teruskan melangkah dengan penuh keyakinan kepada Allah.',
  source: 'Al-Quran (94:5-6)',
  category: 'Sabar',
  language: 'ms',
  tags: null,
};

async function run() {
  console.log('Starting Qalbu screenshot generator...');
  console.log(`App URL: ${APP_URL}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: PHONE_W, height: PHONE_H, deviceScaleFactor: 2 });
  await page.setCacheEnabled(false);

  // Inject mock BEFORE page load so fetch is overridden from the start
  await page.evaluateOnNewDocument((wisdom) => {
    window._mockWisdom = wisdom;
    const origFetch = window.fetch;
    window.fetch = async (url, ...args) => {
      if (typeof url === 'string' && url.includes('/api/v1/wisdom')) {
        return new Response(JSON.stringify({ data: window._mockWisdom }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return origFetch ? origFetch(url, ...args) : fetch(url, ...args);
    };
  }, FALLBACK_WISDOM);

  // === SCREEN 0: Splash screen ===
  console.log('📸 Screen 0: Splash screen...');
  await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await wait(900); // logo dah fade in, splash belum fade out
  const screenSplash = await page.screenshot({ type: 'png' });
  const splashFile = path.join(OUT, 'shots-so-splash.png');
  fs.writeFileSync(splashFile, screenSplash);
  console.log(`✅ ${splashFile}`);

  // === SCREEN 1: Main card (Sabar) ===
  console.log('📸 Screen 1: Main wisdom card...');
  await wait(3800); // tunggu splash habis + card render
  // Scroll to show Maksud + Pengajaran
  await page.evaluate(() => {
    const scrollable = document.querySelector('.overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 150;
  });
  await wait(400);
  const screen1 = await page.screenshot({ type: 'png' });

  // === SCREEN 2: Tawakal ===
  console.log('📸 Screen 2: Tawakal card...');
  const tawakalWisdom = {
    id: 2,
    content: 'Barangsiapa yang bertawakal kepada Allah, maka Dia akan mencukupkan keperluannya.',
    arabic_text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    meaning: 'Allah menjamin keselesaan orang yang benar-benar berserah kepada-Nya. Bukan bererti berdiam diri, tapi berusaha dengan tenang kerana yakin Allah yang mengurus hasilnya.',
    lesson: 'Lakukan yang terdaya, kemudian serahkan hasilnya kepada Allah. Keresahan datang apabila kita cuba kawal apa yang bukan dalam kuasa kita.',
    source: 'At-Talaq (65:3)',
    category: 'Tawakal',
    language: 'ms',
    tags: null,
  };
  await page.evaluate((w) => {
    window._mockWisdom = w;
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim() === 'Tawakal') { b.click(); break; }
    }
  }, tawakalWisdom);
  await wait(1200);
  await page.evaluate(() => {
    const scrollable = document.querySelector('.overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 150;
  });
  await wait(300);
  const screen2 = await page.screenshot({ type: 'png' });

  // === SCREEN 3: Rezeki ===
  console.log('📸 Screen 3: Rezeki card...');
  const rezekiWisdom = {
    id: 3,
    content: 'Rezeki itu bukan sahaja harta. Kesihatan, keluarga, ketenangan hati — semuanya rezeki dari Allah.',
    arabic_text: null,
    meaning: 'Kita sering menyempitkan definisi rezeki kepada wang sahaja. Sedangkan masa yang ada, orang yang sayang, dan hati yang tenang adalah nikmat yang jarang kita syukuri.',
    lesson: 'Mulai hari ini, hitung rezeki bukan sahaja dari dompet. Syukuri nafas, syukuri pandangan, syukuri mereka yang masih ada.',
    source: 'Hadis Riwayat Muslim',
    category: 'Rezeki',
    language: 'ms',
    tags: null,
  };
  await page.evaluate((w) => {
    window._mockWisdom = w;
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim() === 'Rezeki') { b.click(); break; }
    }
  }, rezekiWisdom);
  await wait(1200);
  await page.evaluate(() => {
    const scrollable = document.querySelector('.overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 150;
  });
  await wait(300);
  const screen3 = await page.screenshot({ type: 'png' });

  await browser.close();
  console.log('Browser closed. Compositing...');

  // Generate all formats
  const screens = [
    { buf: screen1, name: 'sabar' },
    { buf: screen2, name: 'tawakal' },
    { buf: screen3, name: 'rezeki' },
  ];

  for (const { buf, name } of screens) {
    // Raw screenshot for shots.so (no frame, no branding)
    const rawFile = path.join(OUT, `shots-so-${name}.png`);
    fs.writeFileSync(rawFile, buf);
    console.log(`✅ ${rawFile}`);

    // Social media composites
    const phone = await makePhoneMockup(buf, name);
    for (const [fmt] of Object.entries(FORMATS)) {
      const composed = await compositeCard(phone, fmt);
      const file = path.join(OUT, `qalbu-${name}-${fmt}.jpg`);
      fs.writeFileSync(file, composed);
      console.log(`✅ ${file}`);
    }
  }

  console.log('\n🎉 Done!');
  console.log('Upload ke shots.so: screenshot/output/shots-so-*.png');
  console.log('Social media: screenshot/output/qalbu-*-square/portrait/story.jpg');
}

run().catch(console.error);
