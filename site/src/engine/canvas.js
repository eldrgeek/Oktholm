// Canvas helpers for shareable images (certificates, ransom notes, score cards).

export function wrapLines(ctx, text, maxWidth) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/);
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = w;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

/** Draws wrapped text; returns the y coordinate after the last line. */
export function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
  for (const line of wrapLines(ctx, text, maxWidth)) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wait for web fonts so canvas text doesn't render in a fallback face. Never blocks more than `ms`. */
export async function ensureFonts(specs = [], ms = 1500) {
  if (!document.fonts?.load) return;
  await Promise.race([Promise.all(specs.map((s) => document.fonts.load(s).catch(() => null))), new Promise((r) => setTimeout(r, ms))]);
}

export function canvasToBlob(canvas, type = 'image/png') {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type));
}

export async function downloadCanvas(canvas, filename = 'image.png') {
  const blob = await canvasToBlob(canvas);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

/** Fake barcode (Code-39-ish stripes) seeded from a string. Purely decorative. */
export function drawBarcode(ctx, text, x, y, w, h, color = '#111') {
  let seed = 0;
  for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  ctx.fillStyle = color;
  let cx = x;
  while (cx < x + w) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const bar = 1 + (seed % 4);
    const gap = 1 + ((seed >> 8) % 3);
    ctx.fillRect(cx, y, Math.min(bar, x + w - cx), h);
    cx += bar + gap;
  }
}
