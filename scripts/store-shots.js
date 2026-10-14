'use strict';
/* Google Play скриншоттары (1080×1920) + PWA манифест скриншоттары. Сервер демо деректермен іске қосулы болуы керек.
   PW=/path/playwright-core BASE=http://localhost:8795 node scripts/store-shots.js [outDir] */
const path = require('path'), fs = require('fs');
const { chromium } = require(process.env.PW || 'playwright-core');
const BASE = process.env.BASE || 'http://localhost:8790';
const OUT = process.argv[2] || path.join(__dirname, '..', '..', 'ai-bolat-publish', 'store-assets', 'screenshots');
const PUB = path.join(__dirname, '..', 'public', 'img', 'shots');
(async () => {
  fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(PUB, { recursive: true });
  const b = await chromium.launch();
  const mk = async (w, h, dsf, lang = 'kk') => { const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, isMobile: w < 500, hasTouch: w < 500 });
    await ctx.addInitScript((l) => { localStorage.setItem('ab_lang', l); localStorage.setItem('ab_theme', 'dark'); }, lang); return ctx.newPage(); };
  const login = async (p, phone) => { await p.goto(BASE + '/app/#/login'); await p.waitForSelector('#phone'); await p.fill('#phone', phone); await p.fill('#pw', process.env.DEMO_PW || 'demo1234');
    await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.shell.v3')); await p.waitForTimeout(900); };
  const shot = async (p, name, dir = OUT) => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(dir, name) }); console.log('✓', name); };
  const p = await mk(360, 640, 3);
  await login(p, '+77000000002');
  await shot(p, '01-home.png'); fs.copyFileSync(path.join(OUT, '01-home.png'), path.join(PUB, 'phone-home.png'));
  await p.goto(BASE + '/app/#/lesson/math-6-14'); await p.waitForSelector('.tabs button[data-t="game"]'); await p.waitForFunction(() => !document.querySelector('.genbar'), null, { timeout: 45000 }).catch(() => {});
  await p.evaluate(() => { const h = document.querySelector('.page h1'); if (h) h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -12); }); await shot(p, '02-lesson.png');
  await p.click('.tabs button[data-t="game"]'); await p.waitForSelector('.xg'); await p.evaluate(() => { const g = document.querySelector('.xg'); g.scrollIntoView({ block: 'center' }); }); await shot(p, '03-games.png');
  const bb = await p.$('.xg[data-g="balance"]') || await p.$('.xg'); await bb.click(); await p.waitForTimeout(700); await p.evaluate(() => { const x = document.querySelector('.tabs'); if (x) x.scrollIntoView({ block: 'start' }); }); await shot(p, '04-game.png');
  await p.goto(BASE + '/app/#/exam'); await p.waitForSelector('.exsub'); await shot(p, '05-exam.png');
  await p.goto(BASE + '/app/#/bolat'); await p.waitForSelector('#bt'); await p.fill('#bt', 'Теңдеуді қалай шешемін? 2x + 3 = 11'); await p.click('#bsend');
  await p.waitForFunction(() => !document.querySelector('#live'), null, { timeout: 30000 }).catch(() => {}); await shot(p, '06-bolat.png');
  // мұғалім: сынып үлгерімі
  const t = await mk(360, 640, 3); await login(t, '+77000000001');
  const cls = await t.evaluate(async () => (await (await fetch('/api/classes')).json()));
  const cid = (cls.classes || cls)[0] && (cls.classes || cls)[0].id;
  if (cid) { await t.goto(BASE + '/app/#/class/' + cid); await t.waitForTimeout(1500); await shot(t, '07-teacher-class.png'); }
  // PWA манифестке кең скриншот
  const w = await mk(1280, 800, 1); await login(w, '+77000000002'); await w.goto(BASE + '/app/#/exam'); await w.waitForSelector('.exsub'); await shot(w, 'wide-exam.png', PUB);
  // жария бет (құжаттама үшін)
  const l = await mk(1280, 800, 1); await l.goto(BASE + '/'); await shot(l, 'landing-kk.png', path.join(OUT, '..'));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
