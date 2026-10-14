'use strict';
// E2E UI test with playwright-core + bundled chromium. Usage: BASE=http://localhost:8795 node tests/e2e.js
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8795';
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
const exe = process.env.CHROME;
const log = (...a) => console.log('✔', ...a);
(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const errors = [];
  const mk = async (w = 1366, h = 860) => { const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); }); return p; };
  const shot = (p, n) => p.screenshot({ path: path.join(SHOTS, n + '.png') });
  const p = await mk();
  // --- register via DEV SMS
  await p.goto(BASE + '/#/register'); await p.waitForSelector('#phone');
  await shot(p, '01-register-kk');
  const phone = '707' + String(Date.now()).slice(-7);
  await p.fill('#phone', phone); await p.click('#smsBtn');
  await p.waitForSelector('#devc'); const code = (await p.textContent('#devc')).trim(); log('dev code shown', code);
  await p.fill('#code', code); await p.fill('#name', 'Тест Оқушы'); await p.selectOption('#grade', '7'); await p.fill('#pw', 'test1234');
  await shot(p, '02-register-code');
  await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.hero, .page'));
  await p.waitForTimeout(800); await shot(p, '03-home-student'); log('registered + home');
  // join class
  const joined = await p.evaluate(async () => { const r = await fetch('/api/classes/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'AIBLT7' }) }); return r.status; });
  log('join class status', joined);
  // --- logout + login
  await p.evaluate(() => fetch('/api/auth/logout', { method: 'POST' })); await p.goto(BASE + '/#/login'); await p.waitForSelector('#phone');
  await p.fill('#phone', phone); await p.fill('#pw', 'test1234'); await p.click('#f button.pri');
  await p.waitForFunction(() => location.hash === '#/'); log('login ok');
  // --- password change
  await p.goto(BASE + '/#/profile'); await p.waitForSelector('#pwf');
  await p.fill('#po', 'test1234'); await p.fill('#pp', 'newpass99'); await p.click('#pwf #smsBtn'); await p.waitForSelector('#devc');
  await p.click('#devc'); await p.click('#pwf button.pri:not(#smsBtn)'); await p.waitForTimeout(700);
  const perr = await p.textContent('#authErr'); if (perr.trim()) throw new Error('pw change: ' + perr);
  const relog = await p.evaluate(async (ph) => (await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: ph, password: 'newpass99' }) })).status, phone);
  if (relog !== 200) throw new Error('login with new pw failed ' + relog); log('password change ok');
  await shot(p, '04-profile');
  // --- language switch
  for (const l of ['ru', 'en', 'kk']) {
    await p.click(`.langs button[data-lang="${l}"]`); await p.waitForTimeout(500);
    await p.goto(BASE + '/#/learn'); await p.waitForTimeout(700);
    const t = await p.evaluate(() => document.querySelector('#view').innerText.slice(0, 120).replace(/\s+/g, ' '));
    log('lang', l, '→', t); if (l !== 'kk') await shot(p, '05-learn-' + l);
    await p.goto(BASE + '/#/profile'); await p.waitForSelector('.langs');
  }
  // --- lesson with formulas
  await p.goto(BASE + '/#/lesson/alg-7-9'); await p.waitForSelector('.tabs', { timeout: 60000 }); await p.waitForTimeout(800);
  await shot(p, '06-lesson-theory');
  await p.click('.tabs button[data-t="rules"]'); await p.waitForTimeout(500);
  const kat = await p.$$eval('.katex', e => e.length); log('katex elements on rules tab', kat); if (!kat) throw new Error('no katex');
  await shot(p, '07-lesson-formulas');
  // --- game
  await p.click('.tabs button[data-t="game"]'); await p.click('.mode[data-m="classic"]');
  for (let i = 0; i < 12; i++) {
    await p.waitForSelector('#qa, .result h1', { timeout: 15000 }); if (await p.$('.result h1')) break;
    const type = await p.evaluate(() => document.querySelector('.qtype').textContent);
    if (await p.$('#qa .opts, #qa .tf')) await p.click('#qa .opt >> nth=0');
    else if (await p.$('#fi')) { await p.fill('#fi', '1'); await p.click('#fc'); }
    else if (await p.$('#pool')) { const n = await p.$$eval('#pool .chipd', e => e.length); for (let k = 0; k < n; k++) { await p.click('#pool .chipd >> nth=0'); await p.click(`.drop[data-k="${k}"]`); } if (i === 2) await shot(p, '08-game-match'); await p.click('#mc'); }
    else if (await p.$('#ol')) { if (i < 4) await shot(p, '08-game-order'); await p.click('#oc'); }
    if (i === 0) await shot(p, '08-game-quiz');
    await p.waitForSelector('#nx'); await p.click('#nx');
  }
  await p.waitForSelector('.result h1', { timeout: 15000 }); await p.waitForTimeout(1500); await shot(p, '09-game-result');
  const mark = await p.textContent('.bigmark'); log('game finished, mark', mark);
  // --- message to teacher (as question)
  await p.goto(BASE + '/#/messages'); await p.waitForSelector('#cl a.citem'); await p.click('#cl a.citem >> nth=0'); await p.waitForSelector('#mb');
  await p.fill('#mb', 'Сәлеметсіз бе! $x^2=9$ теңдеуін түсінбедім.'); await p.check('#asq'); await p.click('#cf button.pri'); await p.waitForTimeout(800);
  await shot(p, '10-messages-student'); log('student message sent');
  // --- Bolat
  await p.goto(BASE + '/#/bolat'); await p.waitForSelector('#bt');
  await p.fill('#bt', '2x + 3 = 11 теңдеуін шеш'); await p.click('#bsend');
  await p.waitForFunction(() => !document.querySelector('#live') && document.querySelectorAll('#bm .msg, #bm .bmsg, #bm > div').length >= 2, null, { timeout: 30000 });
  await p.waitForTimeout(500); const btxt = await p.evaluate(() => document.querySelector('#bm').innerText.slice(-250)); log('bolat reply:', btxt.replace(/\s+/g, ' '));
  await shot(p, '11-bolat');
  // --- teacher side
  const t = await mk();
  await t.goto(BASE + '/#/login'); await t.waitForSelector('#phone'); await t.fill('#phone', '+77000000001'); await t.fill('#pw', 'demo1234'); await t.click('#f button.pri');
  await t.waitForFunction(() => location.hash === '#/'); await t.waitForTimeout(1200); await shot(t, '12-home-teacher');
  const cls = await t.evaluate(async () => (await (await fetch('/api/classes')).json()).classes[0].id);
  await t.goto(BASE + '/#/class/' + cls); await t.waitForTimeout(1500);
  const gb = await t.evaluate(() => document.querySelector('#view').innerText); if (!gb.includes('Тест Оқушы')) throw new Error('student not in class view');
  await shot(t, '13-class-teacher');
  const tabs = await t.$$eval('.tabs button', b => b.map(x => x.dataset.t)); log('class tabs', tabs.join(','));
  const gbTab = tabs.find(x => /grade|gb|journal/.test(x || '')); if (gbTab) { await t.click(`.tabs button[data-t="${gbTab}"]`); await t.waitForTimeout(800); await shot(t, '14-gradebook'); }
  const gbd = await t.evaluate(async (c) => (await (await fetch('/api/classes/' + c + '/gradebook')).json()), cls);
  log('gradebook json keys', Object.keys(gbd).join(','), JSON.stringify(gbd).includes('alg-7-9') ? '(contains alg-7-9)' : '');
  await t.goto(BASE + '/#/messages'); await t.waitForSelector('#cl a.citem');
  const unread = await t.$$eval('#cl .badge', b => b.map(x => x.textContent)); log('teacher unread badges', unread.join(','));
  await t.click('#cl a.citem >> nth=0'); await t.waitForSelector('#mb'); await t.fill('#mb', 'Жақсы сұрақ! Екі жағынан да түбір аламыз: $x=\\pm 3$.'); await t.click('#cf button.pri'); await t.waitForTimeout(800);
  await shot(t, '15-messages-teacher'); log('teacher replied');
  // mobile
  const m = await mk(390, 844); await m.goto(BASE + '/#/login'); await m.waitForSelector('#phone'); await m.fill('#phone', '+77000000002'); await m.fill('#pw', 'demo1234'); await m.click('#f button.pri'); await m.waitForFunction(() => location.hash === '#/'); await m.waitForTimeout(1200); await shot(m, '16-mobile-home');
  // light theme
  await p.evaluate(() => { localStorage.setItem('ab_theme', 'light'); }); await p.goto(BASE + '/#/learn'); await p.reload(); await p.waitForTimeout(1200); await shot(p, '17-learn-light');
  console.log(errors.length ? 'JS ERRORS:\n' + errors.join('\n') : 'no JS errors');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
