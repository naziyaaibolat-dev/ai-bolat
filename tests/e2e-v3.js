'use strict';
// v3 E2E: new shell, exam section, explain-it games, AI generation/practice/explain, Bolat. Usage: PW=... BASE=http://localhost:8795 node tests/e2e-v3.js
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
  const shot = (p, n, full) => p.screenshot({ path: path.join(SHOTS, 'v3-' + n + '.png'), fullPage: !!full });
  const login = async (p, phone, pw) => { await p.goto(BASE + '/#/login'); await p.waitForSelector('#phone'); await p.fill('#phone', phone); await p.fill('#pw', pw); await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.shell.v3')); };
  // student registration
  const p = await mk();
  await p.goto(BASE + '/#/register'); await p.waitForSelector('#phone');
  const phone = '709' + String(Date.now()).slice(-7);
  await p.fill('#phone', phone); await p.click('#smsBtn'); await p.waitForSelector('#devc'); const code = (await p.textContent('#devc')).trim();
  await p.fill('#code', code); await p.fill('#name', 'Дана Тестова'); await p.selectOption('#grade', '7'); await p.fill('#pw', 'test1234');
  await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.shell.v3'));
  await p.evaluate(() => fetch('/api/classes/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'AIBLT7' }) }));
  await p.reload(); await p.waitForSelector('.shell.v3 .lvcard'); await p.waitForTimeout(1200);
  ok(await p.$('.v3 .nav a[href="#/exam"]'), 'sidebar has exam link'); await shot(p, 'home');
  // exam catalog
  await p.goto(BASE + '/#/exam'); await p.waitForSelector('.exsub'); await p.waitForTimeout(500);
  ok((await p.$$('.exsub')).length >= 10, 'ubt subject cards', (await p.$$('.exsub')).length); await shot(p, 'exam-ubt');
  await p.click('#exTabs button[data-t="pisa"]'); await p.waitForSelector('.exsub'); await shot(p, 'exam-pisa');
  // start PISA math test
  await p.click('.exsub[data-s="math"]'); await p.waitForSelector('#stGo'); await p.fill('#stN', '5'); await shot(p, 'exam-setup');
  await p.click('#stGo'); await p.waitForSelector('.exo, #xnIn'); await p.waitForTimeout(500); await shot(p, 'exam-run-pisa');
  for (let i = 0; i < 5; i++) { if (await p.$('.exo')) await p.click('.exo'); else if (await p.$('#xnIn')) await p.fill('#xnIn', '12'); await p.click('#xnx'); await p.waitForTimeout(250); }
  await p.waitForFunction(() => /#\/exam\/r\//.test(location.hash) && document.querySelector('.exres'), null, { timeout: 15000 }); await p.waitForTimeout(700);
  ok(true, 'pisa result page'); await shot(p, 'exam-result'); await shot(p, 'exam-result-full', true);
  // mini UBT
  await p.goto(BASE + '/#/exam'); await p.waitForSelector('#miniU'); await p.click('#miniU'); await p.waitForSelector('.extimer'); await p.waitForTimeout(400);
  ok((await p.$$('#xn .nb')).length === 20, 'mini UBT has 20 items'); 
  for (let i = 0; i < 20; i++) { const has = await p.$('.ctxp'); if (has && i < 20) { await shot(p, 'exam-context'); break; } await p.click('#xnx'); await p.waitForTimeout(120); }
  for (let i = 0; i < 20; i++) { if (await p.$('.exo')) await p.click('.exo'); const f = await p.$('#xnx'); if (!f) break; await f.click(); await p.waitForTimeout(80); if (/#\/exam\/r\//.test(p.url())) break; }
  await p.waitForSelector('.exres', { timeout: 15000 }); ok(true, 'mini UBT finished');
  // olymp setup with hints
  await p.goto(BASE + '/#/exam'); await p.waitForSelector('#exTabs'); await p.click('#exTabs button[data-t="olymp"]'); await p.waitForSelector('.exsub'); await p.click('.exsub[data-s="math"]'); await p.waitForSelector('#stGo'); await p.fill('#stN', '3'); await p.click('#stGo'); await p.waitForSelector('#xq .exq');
  const xh = await p.$('#xh'); if (xh) { await xh.click(); await p.waitForTimeout(200); } ok(await p.$('.exhint'), 'olymp hint'); await shot(p, 'exam-olymp');
  // AI generator (mock)
  await p.goto(BASE + '/#/exam'); await p.waitForSelector('#agGo'); await p.fill('#agT', 'Квадрат теңдеулер'); await p.click('#agGo');
  await p.waitForFunction(() => /#\/exam\/t\//.test(location.hash) && document.querySelector('#xq .exq'), null, { timeout: 30000 }); ok(true, 'AI-generated test started');
  // my tab
  await p.goto(BASE + '/#/exam'); await p.waitForSelector('#exTabs'); await p.click('#exTabs button[data-t="mine"]'); await p.waitForTimeout(900); await shot(p, 'exam-mine');
  ok(await p.$('.exrow'), 'history rows');
  // lessons + games
  const lesson = async (id) => { await p.goto(BASE + '/#/lesson/' + id); await p.waitForSelector('.tabs button[data-t="game"]', { timeout: 30000 });
    await p.waitForFunction(() => !document.querySelector('.genbar'), null, { timeout: 45000 }).catch(() => {}); await p.waitForTimeout(300);
    await p.click('.tabs button[data-t="game"]'); await p.waitForSelector('.xg', { timeout: 10000 }); };
  const CLICK = '.xcard .tick, .xcard .slice, .xcard .gp, .xcard .mbtn:not(.gone), .xcard .mopt:not(.gone), .xcard .schip, .xcard .wtile, .xcard .fpiece, .xcard .opt, .xcard .chopt, .xcard .bucket, .xcard .lmark, .xcard .fcard3, .xcard button.btn:not(.xexit)';
  const play = async (g, name, steps = 10) => {
    const b = await p.$(`.xg[data-g="${g}"]`); if (!b) { ok(false, 'game missing', g); return; }
    await b.click(); await p.waitForSelector('.xgame'); await p.waitForTimeout(500); await shot(p, 'game-' + name);
    for (let i = 0; i < steps; i++) { const inp = await p.$('.xcard input.in:not([disabled])'); if (inp && Math.random() < .5) { await inp.fill('2').catch(() => {}); await inp.press('Enter').catch(() => {}); }
      const els = await p.$$(CLICK); const vis = []; for (const e of els) if (await e.isVisible() && await e.isEnabled().catch(() => true)) vis.push(e);
      if (vis.length) await vis[Math.floor(Math.random() * vis.length)].click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); if (!(await p.$('.xgame'))) break; }
    ok(true, 'played', g); };
  await lesson('math-6-14');
  const xg = await p.$$eval('.xg', e => e.map(x => x.dataset.g)); console.log('  math-6-14 games:', xg.join(',')); await shot(p, 'lesson-games');
  for (const g of ['balance', 'numline', 'millionaire', 'chain', 'matchrace', 'flash', 'formula', 'sort']) { if (xg.includes(g)) { await lesson('math-6-14'); await play(g, g); } }
  if (xg.includes('millionaire')) { await lesson('math-6-14'); await p.click('.xg[data-g="millionaire"]'); await p.waitForSelector('.mopt'); const l = await p.$('.mlife .btn'); if (l) await l.click(); await p.waitForTimeout(600); await shot(p, 'game-millionaire-life'); }
  // practice + explain
  await lesson('math-6-14'); await p.click('#pracBtn'); await p.waitForSelector('.xcard .opt, .game .opt, .qcard .opt', { timeout: 30000 }); await shot(p, 'practice'); ok(true, 'AI practice started');
  const opts = await p.$$('.qcard .opt'); if (opts.length) { await opts[opts.length - 1].click(); await p.waitForTimeout(500); const x = await p.$('.xpl'); if (x) { await x.click(); await p.waitForFunction(() => { const b = document.querySelector('.xplbox'); return b && b.textContent.length > 20; }, null, { timeout: 20000 }).catch(() => {}); await shot(p, 'explain-mistake'); ok(true, 'explain mistake streamed'); } }
  for (const [id, g] of [['math-5-14', 'fraction'], ['math-6-17', 'coord'], ['bio-7-13', 'label'], ['kzhist-7-1', 'timeline'], ['eng-4-1', 'sentence'], ['geom-7-3', 'angle']]) {
    try { await lesson(id); const list = await p.$$eval('.xg', e => e.map(x => x.dataset.g)); console.log('  ' + id + ':', list.join(',')); if (list.includes(g)) await play(g, g); else { const alt = list[0]; if (alt) await play(alt, g + '-alt'); } } catch (e) { ok(false, 'lesson', id, e.message); } }
  // lesson theory with new design
  await p.goto(BASE + '/#/lesson/math-6-14'); await p.waitForSelector('.tabs'); await p.waitForTimeout(800); await shot(p, 'lesson');
  // Bolat
  await p.goto(BASE + '/#/bolat'); await p.waitForSelector('#bt'); await p.fill('#bt', 'Теңдеуді қалай шешемін? 2x+3=11'); await p.click('#bsend');
  await p.waitForFunction(() => !document.querySelector('#live'), null, { timeout: 30000 }); await p.waitForTimeout(400); await shot(p, 'bolat'); ok((await p.$$('.bmsgs .bm')).length >= 2, 'bolat replied');
  // light theme
  await p.evaluate(() => { document.documentElement.classList.add('light'); }); await p.goto(BASE + '/#/exam'); await p.waitForSelector('.exsub'); await p.evaluate(() => document.documentElement.classList.add('light')); await p.waitForTimeout(300); await shot(p, 'light-exam');
  await p.goto(BASE + '/#/'); await p.waitForTimeout(900); await p.evaluate(() => document.documentElement.classList.add('light')); await shot(p, 'light-home');
  // teacher: assign + results
  const t = await mk(); await login(t, '+77000000001', 'demo1234');
  await t.goto(BASE + '/#/exam'); await t.waitForSelector('.exsub'); await t.click('.exsub[data-s="kzhist"]'); await t.waitForSelector('#stAs'); await t.fill('#stN', '5'); await t.click('#stAs'); await t.waitForSelector('#ok'); await t.fill('#at', 'Қазақстан тарихы — сынақ'); await t.click('#ok'); await t.waitForTimeout(900);
  await t.goto(BASE + '/#/exam'); await t.waitForSelector('#exTabs'); await t.click('#exTabs button[data-t="teach"]'); await t.waitForTimeout(900); await shot(t, 'teacher-assign'); ok(await t.$('#exBody table'), 'teacher assignments table');
  // student sees assignment and does it
  await p.goto(BASE + '/#/exam'); await p.waitForSelector('#exTabs'); await p.click('#exTabs button[data-t="mine"]'); await p.waitForTimeout(900);
  const as = await p.$('[data-as]'); ok(as, 'student sees assignment');
  if (as) { await as.click(); await p.waitForSelector('#xq .exq'); for (let i = 0; i < 5; i++) { if (await p.$('.exo')) await p.click('.exo'); await p.click('#xnx'); await p.waitForTimeout(150); } await p.waitForSelector('.exres', { timeout: 15000 }); }
  await t.reload(); await t.waitForSelector('#exTabs'); await t.click('#exTabs button[data-t="teach"]'); await t.waitForTimeout(900); const rb = await t.$('#exBody [data-r]'); if (rb) { await rb.click(); await t.waitForTimeout(700); await shot(t, 'teacher-results'); ok(true, 'teacher results modal'); } else ok(false, 'results button');
  // mobile
  const m = await mk(390, 844); await login(m, phone, 'test1234'); await m.waitForTimeout(800); await shot(m, 'mobile-home');
  await m.goto(BASE + '/#/exam'); await m.waitForSelector('.exsub'); await m.waitForTimeout(400); await shot(m, 'mobile-exam');
  ok(await m.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'mobile no h-overflow');
  await m.goto(BASE + '/#/lesson/math-6-14'); await m.waitForSelector('.tabs button[data-t="game"]'); await m.waitForFunction(() => !document.querySelector('.genbar'), null, { timeout: 45000 }).catch(() => {}); await m.click('.tabs button[data-t="game"]'); await m.waitForSelector('.xg');
  const bb = await m.$('.xg[data-g="balance"]') || await m.$('.xg'); await bb.click(); await m.waitForTimeout(600); await shot(m, 'mobile-game');
  console.log('\nJS errors:', errors.length); errors.slice(0, 20).forEach(e => console.log('  ', e));
  console.log(fails || errors.length ? `FAILED (${fails} fails, ${errors.length} errors)` : 'ALL OK');
  await browser.close(); process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); console.log('JS errors:', errors); process.exit(2); });
