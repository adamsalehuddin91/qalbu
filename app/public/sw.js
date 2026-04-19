const CACHE_NAME = 'qalbu-v1';
const SHELL = ['/', '/index.html'];
const DB_NAME = 'qalbu-db';
const STORE_NAME = 'wisdoms';

// Install — cache shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API — NetworkFirst, fallback to IndexedDB
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirstAPI(e.request));
    return;
  }

  // Shell — CacheFirst
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

async function networkFirstAPI(request) {
  try {
    const res = await fetch(request);
    const data = await res.clone().json();
    if (data?.data) await saveToIDB(data.data);
    return res;
  } catch {
    const cached = await getFromIDB();
    if (cached) {
      return new Response(JSON.stringify({ data: cached }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Hardcoded fallback
    return new Response(
      JSON.stringify({
        data: {
          id: 0,
          content: 'Sesungguhnya bersama kesulitan ada kemudahan.',
          source: 'Al-Quran (94:6)',
          category: 'Sabar',
          language: 'ms',
          tags: null,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(wisdom) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(wisdom);
}

async function getFromIDB() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const items = req.result;
      if (!items.length) return resolve(null);
      resolve(items[Math.floor(Math.random() * items.length)]);
    };
    req.onerror = () => resolve(null);
  });
}
