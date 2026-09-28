// Renders public/og.png (1200x630 link preview) from the brand pack with the self-hosted fonts.
//   node scripts/render-og.mjs [brand]
import { launch } from '../tests/pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brandId = process.argv[2] || process.env.BRAND || 'oktholm';
const brand = (await import(pathToFileURL(path.join(root, 'brands', brandId, 'index.js')).href)).default;
// Data URIs: a setContent() page can't load file:// fonts.
const fontsCss = readFileSync(path.join(root, 'public/fonts/fonts.css'), 'utf8').replace(/url\(\.\/([^)]+)\)/g, (_, f) => `url(data:font/woff2;base64,${readFileSync(path.join(root, 'public/fonts', f)).toString('base64')})`);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const headline = brand.content.home.hero.headlines[0];
const [a, ...rest] = headline.split(/(?<=\.)\s+/);
const html = `<!doctype html><html><head><style>${fontsCss}
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#070a0f;color:#e9f0f7;font-family:'Plus Jakarta Sans';overflow:hidden;position:relative}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(54,245,154,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(54,245,154,.07) 1px,transparent 1px);background-size:24px 24px}
.wrap{position:absolute;inset:0;padding:56px 64px;display:flex;flex-direction:column}
.kicker{font:700 20px 'IBM Plex Mono';letter-spacing:.16em;color:#36f59a;text-transform:uppercase;display:flex;align-items:center;gap:12px}
.dot{width:14px;height:14px;border-radius:50%;background:#ff4757;box-shadow:0 0 14px #ff4757}
h1{font:400 118px/.9 'Anton';text-transform:uppercase;margin-top:26px;max-width:900px}
h1 em{font-style:normal;color:#36f59a;text-shadow:0 0 34px rgba(54,245,154,.5)}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end}
.chips{display:flex;gap:10px}.chips span{padding:10px 16px;border:2px solid #2b3e55;border-radius:12px;font:800 18px 'Plus Jakarta Sans';letter-spacing:.04em;text-transform:uppercase}
.url{font:700 22px 'IBM Plex Mono';color:#36f59a;text-align:right}.sp{font:600 17px 'Plus Jakarta Sans';color:#6b86ff;margin-top:6px;text-align:right}
.band{position:absolute;right:-60px;top:70px;transform:rotate(8deg);background:#f5f1e8;color:#16181d;padding:14px 90px 14px 26px;border-radius:999px;font:700 22px 'IBM Plex Mono';letter-spacing:.1em;box-shadow:0 12px 30px rgba(0,0,0,.5)}
.band b{color:#ff4757}
.stamp{position:absolute;right:70px;top:190px;transform:rotate(-12deg);border:7px double #ff4757;color:#ff4757;border-radius:12px;padding:6px 18px;font:400 54px 'Anton';letter-spacing:.06em;opacity:.9}
svg{position:absolute;left:0;right:0;bottom:118px;width:100%;height:80px}
</style></head><body><div class="grid"></div>
<svg viewBox="0 0 1200 80" preserveAspectRatio="none"><path d="M0 50 L180 50 L196 44 L210 56 L222 8 L236 72 L250 50 L520 50 L536 44 L550 56 L562 8 L576 72 L590 50 L860 50 L876 44 L890 56 L902 8 L916 72 L930 50 L1200 50" fill="none" stroke="#36f59a" stroke-width="3" opacity=".35"/></svg>
<div class="band"><b>●</b> PATIENT OKT-7F3K-2Q</div><div class="stamp">DIAGNOSED</div>
<div class="wrap"><div class="kicker"><span class="dot"></span>${esc(brand.site.hospital)} · ${esc(brand.site.network)} · Live</div>
<h1>${esc(a)} ${rest.length ? `<em>${esc(rest.join(' '))}</em>` : ''}</h1>
<div class="foot"><div class="chips"><span>Get diagnosed</span><span>Play</span><span>Stage an intervention</span></div>
<div><div class="url">${esc(brand.site.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</div><div class="sp">Treatment sponsored by ${esc(brand.sponsor.name)}</div></div></div></div></body></html>`;
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(root, 'public', 'og.png') });
await browser.close();
console.log('wrote public/og.png');
