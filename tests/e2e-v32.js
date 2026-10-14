'use strict';
// v3.2 E2E: жаңа логотип, бөлімдері бар пән беті, іздеу, каталог статистикасы, түсіндіру формалары, слайд/проектор режимі, мұғалім редакторы, ескі id көшіру.
// Usage: PW=... BASE=http://localhost:8795 node tests/e2e-v32.js
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8795';
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const errors = [];
const ok = (c, ...a) => { console.log(c ? '✔' : '✘', ...a); if (!c) fails++; };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
  const mk = async (w = 1440, h = 900) => { const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) errors.push('console: ' + m.text()); });
    p.on('dialog', d => d.accept()); return p; };
  const shot = (p, n, full) => p.screenshot({ path: path.join(SHOTS, 'v32-' + n + '.png'), fullPage: !!full });
  const login = async (p, phone, pw) => { await p.goto(BASE + '/#/login'); await p.waitForSelector('#phone'); await p.fill('#phone', phone); await p.fill('#pw', pw); await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.shell')); };
  const api = async (u) => (await fetch(BASE + u)).json();
  const cat = await api('/api/catalog'); ok(cat.stats.topics >= 4000, 'catalog topics', cat.stats.topics, 'sections', cat.stats.sections, 'subjects', cat.stats.subjects);
  for (const s of ['music', 'pe', 'korkem', 'globe', 'avtd', 'graphics', 'biz', 'beyneleu', 'enbek', 'anatili']) ok(cat.subjects[s] && cat.counts[s].total > 0, 'new subject', s, cat.counts[s] && cat.counts[s].total);
  const sub = await api('/api/catalog/alg/8'); ok(sub.sections.length >= 4 && sub.topics.every(t => typeof t.s === 'number'), 'alg-8 sections', sub.sections.length, 'topics', sub.topics.length);
  const sr = await api('/api/search?q=' + encodeURIComponent('квадрат теңдеу') + '&lang=kk'); ok(sr.results.length >= 3 && sr.results[0].section, 'search with section', sr.results.length);
  const srf = await api('/api/search?q=' + encodeURIComponent('Абай') + '&grade=10&subject=kazadeb'); ok(srf.results.length >= 3 && srf.results.every(r => r.grade === 10 && r.subject === 'kazadeb'), 'search filters', srf.results.length);
  const mig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'shared', 'catalog', 'migrate-v32.json'), 'utf8')).map; const oldId = Object.keys(mig)[0];
  const ol = await api('/api/lesson/' + oldId + '?lang=kk'); ok(ol.topic && ol.topic.id === mig[oldId].to, 'old id resolves', oldId, '→', ol.topic && ol.topic.id);
  const tl = await api('/api/lesson/alg-8-7?lang=kk'); const c = tl.content;
  ok(c.tv === 32 && c.mistakes && c.summary && c.check && c.reallife && c.mindmap && c.compare, 'offline lesson v3.2 fields', Object.keys(c).join(','));
  ok(c.objectives && c.objectives.items.length, 'official objectives attached');
  const logo = await (await fetch(BASE + '/img/logo.svg')).text(); ok(/F4B41A|FFE07A/i.test(logo) && /29C5F6/i.test(logo), 'new logo svg (gold + sky)');
  ok((await fetch(BASE + '/favicon.ico')).ok, 'favicon');
  const t = await mk(); await login(t, '+77000000001', 'demo1234'); await t.waitForTimeout(700);
  ok(await t.$('.brand img[src*="logo"]'), 'sidebar logo'); await t.screenshot({ path: path.join(SHOTS, 'v32-logo-sidebar.png'), clip: { x: 0, y: 0, width: 420, height: 260 } }); await shot(t, 'home');
  await t.goto(BASE + '/#/learn?g=8'); await t.waitForSelector('.subj'); await t.click('.ccount summary'); await t.waitForTimeout(300); await shot(t, 'learn-counts', true);
  ok(await t.$('.ctable.cnt'), 'counts table');
  await t.goto(BASE + '/#/subject/alg/8'); await t.waitForSelector('.secblk'); ok((await t.$$('.secblk')).length >= 4, 'subject page sections', (await t.$$('.secblk')).length);
  await shot(t, 'subject-sections');
  await t.fill('#tf', 'квадрат'); await t.waitForTimeout(200); const vis = await t.$$eval('.topic', a => a.filter(x => x.style.display !== 'none').length); ok(vis >= 2, 'subject filter', vis); await t.fill('#tf', '');
  await t.goto(BASE + '/#/subject/music/3'); await t.waitForSelector('.secblk'); await shot(t, 'subject-music');
  await t.goto(BASE + '/#/'); await t.waitForSelector('#gsearch'); await t.fill('#gsearch', 'фотосинтез'); await t.waitForSelector('#gsres a'); await shot(t, 'search-dropdown');
  await t.click('#gsres .sall'); await t.waitForSelector('#sout .topic'); ok((await t.$$('#sout .topic')).length >= 2, 'search page results'); await shot(t, 'search-page');
  await t.goto(BASE + '/#/lesson/alg-8-7'); await t.waitForSelector('.tabs button[data-t="explain"]'); await t.waitForTimeout(600); await shot(t, 'lesson-theory');
  await t.click('.tabs button[data-t="explain"]'); await t.waitForSelector('.xftabs');
  for (const f of ['conspect', 'slides', 'anim', 'guided', 'compare', 'mindmap', 'timeline', 'glossary', 'narrate']) {
    await t.click(`.xft[data-f="${f}"]`); await t.waitForTimeout(f === 'timeline' ? 900 : 500);
    const html = await t.$eval('#xfBody', e => e.innerHTML.length); ok(html > 200, 'form', f, html); await shot(t, 'form-' + f);
  }
  await t.click('.xft[data-f="guided"]'); await t.waitForSelector('.gstep.cur');
  const g1 = await t.evaluate(async () => { const d = await (await fetch('/api/lesson/alg-8-7?lang=kk')).json(); return d.content.guided && d.content.guided.steps[0].a; });
  if (g1 && await t.$('#gin')) { await t.fill('#gin', '999999'); await t.click('#gchk'); await t.waitForTimeout(200); ok(/err/.test(await t.$eval('#gmsg', e => e.innerHTML)), 'guided wrong answer feedback'); await t.fill('#gin', g1); await t.click('#gchk'); await t.waitForTimeout(300); ok((await t.$$('.gstep.ok')).length === 1, 'guided correct answer'); }
  for (let i = 0; i < 5; i++) { if (!(await t.$('#grev'))) break; await t.click('#grev'); await t.waitForTimeout(150); }
  ok(await t.$('.guided .banner.ok'), 'guided solved'); await shot(t, 'form-guided-solved');
  await t.click('.xft[data-f="glossary"]'); const gc = await t.$('.gcard'); if (gc) { await gc.click(); await t.waitForTimeout(700); ok(await t.$('.gcard.flip'), 'glossary flip'); await shot(t, 'form-glossary-flip'); }
  await t.click('#presentBtn'); await t.waitForSelector('.present .slide'); await t.waitForTimeout(500); await shot(t, 'slide-mode');
  await t.keyboard.press('ArrowRight'); await t.keyboard.press('ArrowRight'); await t.waitForTimeout(400); await t.keyboard.press('n'); await t.waitForTimeout(300); await shot(t, 'slide-mode-2');
  for (let i = 0; i < 12; i++) await t.keyboard.press('ArrowRight'); await t.waitForTimeout(400); await shot(t, 'slide-mode-3');
  await t.keyboard.press('Escape'); await t.waitForTimeout(300); ok(!(await t.$('.present')), 'presentation closed');
  await t.goto(BASE + '/#/lesson/kzhist-7-1?tab=explain'); await t.waitForSelector('.xftabs'); await t.click('.xft[data-f="timeline"]'); await t.waitForSelector('.roadmap, .vtl'); await shot(t, 'form-timeline-history');
  await t.click('.xft[data-f="mindmap"]'); await t.waitForSelector('svg.mmap'); await shot(t, 'form-mindmap-history');
  await t.goto(BASE + '/#/lesson/alg-8-7'); await t.waitForSelector('#editBtn'); await t.click('#editBtn'); await t.waitForSelector('#edTitle'); await t.waitForTimeout(300); await shot(t, 'editor');
  await t.fill('#edTitle', 'Квадрат теңдеу: дискриминант (мұғалім нұсқасы)'); await t.fill('#edSum', 'D = b² − 4ac\nD > 0 болса — екі түбір');
  await t.click('#edSave'); await t.waitForFunction(() => !document.querySelector('#edTitle')); await t.waitForTimeout(800);
  const after = await t.evaluate(async () => (await (await fetch('/api/lesson/alg-8-7?lang=kk')).json()));
  ok(after.source === 'teacher' && /мұғалім нұсқасы/.test(after.content.title) && after.content.summary.length === 2, 'teacher edit saved', after.source);
  await shot(t, 'lesson-teacher-edited');
  for (const L of ['ru', 'en']) { const r = await t.evaluate(async (L) => (await (await fetch('/api/lesson/phys-8-1?lang=' + L)).json()), L); ok(r.content.tv === 32 && r.content.mistakes, 'lesson lang', L); }
  const m = await mk(390, 844); await login(m, '+77000000001', 'demo1234'); await m.goto(BASE + '/#/subject/kaztil/5'); await m.waitForSelector('.secblk'); await shot(m, 'mobile-subject');
  await m.goto(BASE + '/#/lesson/kaztil-5-1?tab=explain'); await m.waitForSelector('.xftabs'); await m.waitForTimeout(400); await shot(m, 'mobile-explain');
  await browser.close();
  console.log('\nJS errors:', errors.length); errors.slice(0, 20).forEach(e => console.log('  ', e));
  console.log(fails ? `\n✘ ${fails} failed` : '\n✔ all passed'); process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
