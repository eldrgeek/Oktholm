// Parody Engine build script.
//
//   node build.mjs                      -> dist/index.html (single self-contained file) for BRAND (default: oktholm)
//   BRAND=acme node build.mjs           -> same engine, different brand pack (brands/acme/index.js)
//   node build.mjs --serve              -> rebuild on change + static server on http://localhost:8000
//   node build.mjs --game=<module-id>   -> dist/dev/<module-id>.html harness containing only that module
//
// Brand packs are pure data (no DOM, no CSS imports) so this script can import them for <head> metadata.

import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const brandId = process.env.BRAND || args.get('brand') || 'oktholm';
const brandEntry = path.join(root, 'brands', brandId, 'index.js');
if (!existsSync(brandEntry)) {
  console.error(`Unknown brand "${brandId}" — expected ${brandEntry}`);
  process.exit(1);
}
// OUTDIR lets parallel work build side by side (e.g. OUTDIR=dist-intake) without clobbering dist/.
const outdir = path.join(root, process.env.OUTDIR || 'dist');
const moduleId = args.get('game');
const serve = args.has('serve');

function findModule(id) {
  for (const kind of ['games', 'shows']) {
    const p = path.join(root, 'src', kind, id, 'index.js');
    if (existsSync(p)) return p;
  }
  throw new Error(`No module "${id}" in src/games or src/shows`);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// Preview/staging builds: SITE_URL points og:url/og:image at the deploy's own origin, and NOINDEX=true
// (or a Netlify deploy-preview/branch-deploy CONTEXT) keeps the build out of search engines.
const siteUrlOverride = process.env.SITE_URL || '';
const noindex = process.env.NOINDEX === 'true' || ['deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT);

async function loadBrandMeta() {
  // Cache-bust so --serve picks up edits to brand metadata.
  const mod = await import(pathToFileURL(brandEntry).href + `?t=${Date.now()}`);
  const b = mod.default;
  const url = siteUrlOverride || b.site?.url || '';
  const ogImage = siteUrlOverride && b.site?.url && b.site?.ogImage?.startsWith(b.site.url) ? b.site.ogImage.replace(b.site.url, siteUrlOverride.replace(/\/?$/, '/')) : b.site?.ogImage || '';
  return {
    title: b.site?.title || b.site?.name || 'Parody Engine',
    description: b.site?.description || '',
    url,
    ogImage,
    themeColor: b.theme?.['--bg'] || '#070a0f',
    fonts: b.site?.fontsHref || '',
    lang: b.site?.lang || 'en',
    sourceNote: b.site?.sourceNote || '',
  };
}

async function emitHtml(result, outFile) {
  const js = result.outputFiles.find((f) => f.path.endsWith('.js'));
  const css = result.outputFiles.find((f) => f.path.endsWith('.css'));
  const meta = await loadBrandMeta();
  const tpl = await readFile(path.join(root, 'src', 'index.html'), 'utf8');
  const html = tpl
    .replaceAll('{{lang}}', esc(meta.lang))
    .replaceAll('{{title}}', esc(meta.title))
    .replaceAll('{{description}}', esc(meta.description))
    .replaceAll('{{url}}', esc(meta.url))
    .replaceAll('{{ogImage}}', esc(meta.ogImage))
    .replaceAll('{{themeColor}}', esc(meta.themeColor))
    .replace('{{fonts}}', () => fontsTag())
    .replace('<!--{{sourceNote}}-->', () => (meta.sourceNote ? `<!-- ${meta.sourceNote.replaceAll('--', '—')} -->` : ''))
    // Function replacers: bundled code can contain "$&"-style sequences that string replacement would expand.
    .replace('/*{{css}}*/', () => (css ? css.text : ''))
    .replace('/*{{js}}*/', () => (js ? js.text.replaceAll('</script', '<\\/script') : ''))
    .replace('</head>', () => (noindex ? '<meta name="robots" content="noindex, nofollow">\n</head>' : '</head>'));
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`built ${path.relative(root, outFile)} (${kb} KB) brand=${brandId}`);
}

// Fonts are self-hosted (scripts/fetch-fonts.mjs). Production links fonts/fonts.css so fonts cache separately;
// --inline-fonts (and every --game harness) embeds them as data URIs so a single HTML file renders anywhere.
const inlineFonts = args.has('inline-fonts') || Boolean(moduleId);
let fontsCache = null;
function fontsTag() {
  const dir = path.join(root, 'public', 'fonts');
  const cssPath = path.join(dir, 'fonts.css');
  if (!existsSync(cssPath)) return '';
  if (!inlineFonts) return '<link rel="stylesheet" href="fonts/fonts.css">';
  if (!fontsCache) {
    const css = readFileSync(cssPath, 'utf8').replace(/url\(\.\/([^)]+)\)/g, (_, f) => `url(data:font/woff2;base64,${readFileSync(path.join(dir, f)).toString('base64')})`);
    fontsCache = `<style>${css}</style>`;
  }
  return fontsCache;
}

async function copyPublic() {
  const pub = path.join(root, 'public');
  if (existsSync(pub)) await cp(pub, outdir, { recursive: true });
  // Rendered voice clips live with the brand (scripts/voices.mjs); the speech service reads voice/manifest.json.
  const voice = path.join(root, 'brands', brandId, 'voice');
  if (existsSync(voice)) await cp(voice, path.join(outdir, 'voice'), { recursive: true });
  // Always written, so a production build over a previous preview build can't inherit noindex.
  // Previews stay out of search (noindex header + meta) but let link-preview bots in, or shared links
  // unfurl as blank cards on LinkedIn, X, Slack and friends.
  const unfurlers = ['LinkedInBot', 'Twitterbot', 'facebookexternalhit', 'Slackbot-LinkExpanding', 'Slackbot', 'Discordbot', 'redditbot', 'WhatsApp', 'TelegramBot', 'Applebot'];
  const previewRobots = unfurlers.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n') + '\nUser-agent: *\nDisallow: /\n';
  await writeFile(path.join(outdir, 'robots.txt'), noindex ? previewRobots : 'User-agent: *\nAllow: /\n# Staff only.\nDisallow: /break-glass/\n');
  await writeFile(path.join(outdir, '_headers'), noindex ? '/*\n  X-Robots-Tag: noindex, nofollow\n' : '# Headers live in netlify.toml. Preview builds add X-Robots-Tag: noindex here.\n');
  if (noindex) console.log('noindex build: robots.txt + X-Robots-Tag');
}

// `import modules from 'virtual:modules'` -> every src/games/*/index.js and src/shows/*/index.js.
// Adding a module folder is enough; brands choose which ones to show via brand.modules.
// Pass --only=a,b to bundle a subset (handy while other modules are mid-edit).
const only = args.get('only')?.split(',').filter(Boolean);
const discoverModules = {
  name: 'virtual-modules',
  setup(build) {
    build.onResolve({ filter: /^virtual:modules$/ }, () => ({ path: 'virtual:modules', namespace: 'pe-virtual' }));
    build.onLoad({ filter: /.*/, namespace: 'pe-virtual' }, () => {
      const files = [];
      for (const kind of ['games', 'shows']) {
        const dir = path.join(root, 'src', kind);
        if (!existsSync(dir)) continue;
        for (const name of readdirSync(dir).sort()) {
          const f = path.join(dir, name, 'index.js');
          if (!name.startsWith('_') && existsSync(f) && (!only || only.includes(name))) files.push(f);
        }
      }
      const contents =
        files.map((f, i) => `import m${i} from ${JSON.stringify(f.split(path.sep).join('/'))};`).join('\n') +
        `\nexport default [${files.map((_, i) => `m${i}`).join(', ')}];\n`;
      return { contents, resolveDir: root, loader: 'js', watchDirs: [path.join(root, 'src', 'games'), path.join(root, 'src', 'shows')] };
    });
  },
};

const options = {
  plugins: [discoverModules],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  write: false,
  outdir,
  minify: !moduleId && !args.has('dev') && !serve,
  sourcemap: false,
  legalComments: 'none',
  alias: { '@brand': brandEntry },
  loader: { '.svg': 'text', '.txt': 'text' },
  define: {
    __BRAND__: JSON.stringify(brandId),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(Boolean(moduleId || serve || args.has('dev'))),
  },
  logLevel: 'warning',
};

if (moduleId) {
  const modPath = findModule(moduleId);
  options.stdin = {
    contents: `import { mountHarness } from './src/dev/harness.js';\nimport mod from ${JSON.stringify('./' + path.relative(root, modPath).split(path.sep).join('/'))};\nmountHarness(mod);\n`,
    resolveDir: root,
    sourcefile: `harness-${moduleId}.js`,
    loader: 'js',
  };
  options.outdir = path.join(outdir, 'dev');
  options.entryNames = moduleId;
} else {
  options.entryPoints = { main: path.join(root, 'src', 'main.js') };
}

const outFile = moduleId ? path.join(outdir, 'dev', `${moduleId}.html`) : path.join(outdir, 'index.html');

if (serve) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [
      discoverModules,
      {
        name: 'emit-html',
        setup(build) {
          build.onEnd(async (r) => {
            if (r.errors.length) return;
            await emitHtml(r, outFile);
          });
        },
      },
    ],
  });
  await copyPublic();
  await ctx.watch();
  const port = Number(args.get('port') || 8000);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm' };
  http
    .createServer(async (req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = path.join(outdir, p);
      if (!file.startsWith(outdir)) return res.writeHead(403).end();
      if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!existsSync(file)) file = outFile;
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(await readFile(file));
    })
    .listen(port, () => console.log(`serving dist/ on http://localhost:${port}`));
} else {
  const result = await esbuild.build(options);
  await emitHtml(result, outFile);
  if (!moduleId) await copyPublic();
  // List module harnesses available, as a convenience.
  if (!moduleId && args.has('list')) {
    for (const kind of ['games', 'shows']) {
      const dir = path.join(root, 'src', kind);
      if (existsSync(dir)) console.log(kind + ':', readdirSync(dir).join(', '));
    }
  }
}
