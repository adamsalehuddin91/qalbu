export async function shareWisdom(wisdom) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, '#0a0c10');
  gradient.addColorStop(1, '#0f1420');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Decorative border
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 1000, 1840);

  // Branding
  ctx.fillStyle = '#f59e0b';
  ctx.font = '500 48px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Qalbu', 540, 160);

  // Category
  ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.font = '300 28px Inter';
  ctx.fillText(wisdom.category.toUpperCase(), 540, 230);

  // Divider
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(240, 280);
  ctx.lineTo(840, 280);
  ctx.stroke();

  // Quote — wait for font
  await document.fonts.load('italic 600 56px "Playfair Display"');
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'italic 600 56px "Playfair Display"';
  ctx.textAlign = 'center';
  wrapText(ctx, `"${wisdom.content}"`, 540, 500, 900, 80);

  // Source
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '300 32px Inter';
  ctx.fillText(`— ${wisdom.source}`, 540, 1700);

  // Share
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'qalbu.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Qalbu' });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qalbu.png';
      a.click();
      URL.revokeObjectURL(url);
    }
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y);
}
