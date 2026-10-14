'use strict';
/* v3.2: иконкалар, OG-сурет және Google Play графикасы жаңа логотиптен (brand/make-brand.js) салынады.
   PW=/path/to/playwright-core node scripts/make-icons.js [store-assets-dir] [android-res-dir] */
const path = require('path'), fs = require('fs');
const { chromium } = require(process.env.PW || 'playwright-core');
const B = require('../brand/make-brand.js');
const PUB = path.join(__dirname, '..', 'public', 'img');
const STORE = process.argv[2] || path.join(__dirname, '..', '..', 'ai-bolat-publish', 'store-assets');
const W = (svg, s) => svg.replace('<svg ', `<svg width="${s}" height="${s}" `);
(async () => {
  fs.mkdirSync(STORE, { recursive: true });
  for (const f of ['logo.svg', 'favicon.svg']) fs.copyFileSync(path.join(__dirname, '..', 'brand', f), path.join(PUB, f));
  const b = await chromium.launch(); const pg = await b.newPage();
  const shot = async (html, w, h, file) => { await pg.setViewportSize({ width: w, height: h }); await pg.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`); await pg.waitForTimeout(150);
    await pg.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }); console.log('✓', path.relative(process.cwd(), file)); };
  const icon = (svg, s, file) => shot(`<div style="width:${s}px;height:${s}px">${W(svg, s)}</div>`, s, s, file);
  for (const s of [16, 32, 48]) await icon(B.icon({ detail: 0, rx: 14 }), s, path.join(PUB, `icon-${s}.png`));
  for (const s of [192, 512]) await icon(B.icon(), s, path.join(PUB, `icon-${s}.png`));
  await icon(B.icon({ full: true, scale: .72 }), 192, path.join(PUB, 'maskable-192.png'));
  await icon(B.icon({ full: true, scale: .72 }), 512, path.join(PUB, 'maskable-512.png'));
  await icon(B.icon({ full: true, scale: .9 }), 180, path.join(PUB, 'apple-touch-icon.png'));
  await icon(B.icon({ full: true, scale: .86 }), 512, path.join(STORE, 'play-icon-512.png'));
  const banner = (w, h, big, extra) => `<div style="width:${w}px;height:${h}px;position:relative;overflow:hidden;background:linear-gradient(135deg,#06264A,#0A4F86 55%,#0A7FC2);font-family:'Segoe UI',Roboto,'Noto Sans',system-ui,sans-serif;color:#fff">
    <svg style="position:absolute;right:-${h * .25}px;top:-${h * .3}px;opacity:.13" width="${h * 1.5}" height="${h * 1.5}" viewBox="0 0 100 100"><g fill="none" stroke="#FFE07A" stroke-width="1.2"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="28"/><path d="M14 38 Q50 62 86 38"/><path d="M14 62 Q50 38 86 62"/><path d="M38 12 Q26 50 38 88"/><path d="M62 12 Q74 50 62 88"/></g></svg>
    <div style="position:absolute;inset:0;background:radial-gradient(${w * .5}px ${h * .8}px at 12% 100%,rgba(41,197,246,.35),transparent 70%)"></div>
    <div style="position:absolute;left:${w * .06}px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:${w * .035}px">
      <div style="width:${big}px;height:${big}px;filter:drop-shadow(0 18px 36px rgba(0,0,0,.35))">${W(B.icon(), big)}</div>
      <div><div style="font-size:${big * .42}px;font-weight:800;letter-spacing:-.02em;line-height:1"><span style="background:linear-gradient(180deg,#FFE07A,#F4B41A 60%,#D98E04);-webkit-background-clip:text;color:transparent">AI</span>-bolat</div>
      <div style="font-size:${big * .16}px;margin-top:${big * .08}px;color:#E3F4FF;max-width:${w * .62}px;line-height:1.28">${extra}</div></div></div></div>`;
  await shot(banner(1200, 630, 230, 'Ойын арқылы оқу · 1–11 сынып · 7000+ тақырып<br><span style="font-size:.75em;color:#9FD8F5">ҰБТ · PISA · Олимпиада · AI көмекші Болат · ҚАЗ / РУС / ENG</span>'), 1200, 630, path.join(PUB, 'og-image.png'));
  await shot(banner(1024, 500, 200, 'Ойын арқылы оқу · 1–11 сынып<br><span style="font-size:.75em;color:#9FD8F5">7000+ тақырып · ҰБТ · PISA · AI көмекші</span>'), 1024, 500, path.join(STORE, 'feature-graphic-1024x500.png'));
  // Android (Bubblewrap) ресурстары үшін үлкен иконкалар
  const AND = process.argv[3]; if (AND) { fs.mkdirSync(AND, { recursive: true }); await icon(B.icon({ full: true, scale: .86 }), 512, path.join(AND, 'icon-512.png')); await icon(B.icon({ full: true, scale: .66 }), 512, path.join(AND, 'maskable-512.png')); await icon(B.icon(), 512, path.join(AND, 'splash-512.png')); }
  await b.close();
  require('child_process').execFileSync('python3', ['-c', `from PIL import Image; im=Image.open('${path.join(PUB, 'icon-48.png')}'); im.save('${path.join(__dirname, '..', 'public', 'favicon.ico')}', sizes=[(16,16),(32,32),(48,48)])`]);
  console.log('✓ public/favicon.ico');
})().catch(e => { console.error(e); process.exit(1); });
