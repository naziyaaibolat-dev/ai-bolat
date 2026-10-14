'use strict';
// v2 E2E: 3D labs, dashboard, game modes. Usage: PW=... BASE=http://localhost:8795 node tests/e2e-v2.js
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8795';
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
const LABS = ['solids', 'pendulum', 'incline', 'projectile', 'optics', 'circuit', 'waves', 'atom', 'molecules', 'cell', 'dna', 'earth', 'solar', 'seasons', 'fsurface', 'fgraph'];
const log = (...a) => console.log('✔', ...a);
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = []; let fails = 0;
  const mk = async (w = 1440, h = 900) => { const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/status of 401/.test(m.text())) errors.push('console: ' + m.text()); }); return p; };
  const shot = (p, n) => p.screenshot({ path: path.join(SHOTS, 'v2-' + n + '.png') });
  const colors = (p) => p.evaluate(() => { const c = document.querySelector('.lab-canvas'); if (!c || !c.width) return 0; const t = document.createElement('canvas'); t.width = 120; t.height = 80; const x = t.getContext('2d'); x.drawImage(c, 0, 0, 120, 80);
    const d = x.getImageData(0, 0, 120, 80).data; const s = new Set(); for (let i = 0; i < d.length; i += 4) s.add((d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3)); return s.size; });
  const p = await mk();
  await p.goto(BASE + '/#/register'); await p.waitForSelector('#phone');
  const phone = '708' + String(Date.now()).slice(-7);
  await p.fill('#phone', phone); await p.click('#smsBtn'); await p.waitForSelector('#devc'); const code = (await p.textContent('#devc')).trim();
  await p.fill('#code', code); await p.fill('#name', 'Әлия Лабова'); await p.selectOption('#grade', '9'); await p.fill('#pw', 'test1234');
  await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.goalcard'));
  await p.evaluate(() => fetch('/api/classes/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'AIBLT7' }) }));
  log('registered');
  // lab catalog
  await p.goto(BASE + '/#/lab'); await p.waitForSelector('.labcard'); const nCards = await p.$$eval('.labcard', e => e.length); log('lab catalog cards', nCards); if (nCards !== 16) { fails++; console.log('FAIL cards'); }
  await p.waitForTimeout(600); await shot(p, 'lab-catalog');
  const three0 = await p.evaluate(() => performance.getEntriesByType('resource').some(r => /three\.module/.test(r.name)));
  log('three.js loaded on catalog page (should be false):', three0); if (three0) fails++;
  for (const id of LABS) {
    await p.goto(BASE + '/#/lab/' + id); await p.waitForSelector('.lab-canvas', { timeout: 30000 }); await p.waitForTimeout(1800);
    const n = await colors(p); const ok = n > 12; if (!ok) fails++;
    const tex = await p.$$eval('.lab-formula .katex', e => e.length); const tasks = await p.$$eval('.lab-task', e => e.length);
    console.log(ok ? '✔' : '✘', 'lab', id, 'colors', n, 'katex', tex, 'tasks', tasks);
    if (id === 'solids') {
      await p.click('.chip[data-o="shape"][data-v="cylinder"]'); await p.waitForTimeout(500); await p.click('.chip[data-t="net"]'); await p.waitForTimeout(2600); await shot(p, 'lab-solids-net');
      await p.click('.chip[data-t="net"]'); await p.click('.chip[data-o="shape"][data-v="pyramid"]'); await p.click('.chip[data-t="section"]'); await p.waitForTimeout(1200); await shot(p, 'lab-solids-section');
    } else if (id === 'atom') { const pt = await p.$('.pt[data-v="20"]'); if (pt) await pt.click(); await p.waitForTimeout(900); await shot(p, 'lab-atom');
    } else if (id === 'projectile') { await p.click('[data-b="fire"]'); await p.waitForTimeout(1600); await shot(p, 'lab-projectile');
    } else if (id === 'molecules') { const b = await p.$('.chip[data-v="C6H12O6"]'); if (b) await b.click(); await p.waitForTimeout(900); await shot(p, 'lab-molecules');
    } else await shot(p, 'lab-' + id);
  }
  // lab task via UI (wrong answer -> feedback) + API XP
  await p.goto(BASE + '/#/lab/solids'); await p.waitForSelector('.lab-task input');
  await p.fill('.lab-task >> nth=0 >> input', '1'); await p.click('.lab-task >> nth=0 >> button'); await p.waitForTimeout(700);
  const fb = await p.textContent('.lab-task >> nth=0 >> .fbk'); log('lab task feedback:', fb.trim().slice(0, 60));
  const correct = await p.evaluate(async () => { const m = await import('/js/lab/geom.js'); const d = m.labs.solids; const P = {}; d.params.forEach(x => P[x.k] = x.v); d.options.forEach(o => P[o.k] = o.v); d.toggles.forEach(t => P[t.k] = !!t.v); return d.tasks(P, {})[0].ans; });
  await p.fill('.lab-task >> nth=0 >> input', String(Math.round(correct * 100) / 100)); await p.click('.lab-task >> nth=0 >> button'); await p.waitForTimeout(900);
  const okTask = await p.$eval('.lab-task >> nth=0', e => e.className); log('lab task after correct answer:', okTask); if (!/ok/.test(okTask)) fails++;
  const xpNow = await p.evaluate(async () => (await (await fetch('/api/me')).json()).user.xp); log('xp after lab task', xpNow);
  // lesson with mini-lab
  await p.goto(BASE + '/#/lesson/geom-11-7'); await p.waitForSelector('.stepper', { timeout: 60000 }); await p.waitForTimeout(600);
  const labBtns = await p.$$eval('.lab3d', e => e.map(x => x.textContent.trim())); log('lesson lab buttons', labBtns);
  await shot(p, 'lesson-steps');
  await p.click('#thNext'); await p.waitForTimeout(300);
  await p.click('#mlPlay'); await p.waitForSelector('.minilab .lab-canvas', { timeout: 30000 }); await p.waitForTimeout(1800);
  await p.$eval('.minilab', e => e.scrollIntoView()); await p.waitForTimeout(300); await shot(p, 'lesson-minilab');
  // game modes
  const openGame = async () => { await p.click('.tabs button[data-t="game"]'); await p.waitForSelector('.mode'); };
  await openGame(); const modes = await p.$$eval('.mode', e => e.map(x => x.dataset.m)); log('modes', modes.join(',')); await shot(p, 'game-modes');
  await p.click('.mode[data-m="boss"]');
  for (let i = 0; i < 12; i++) {
    await p.waitForSelector('#qa, .result h1', { timeout: 15000 }); if (await p.$('.result h1')) break;
    if (await p.$('#qa .opts, #qa .tf')) await p.click('#qa .opt >> nth=0');
    else if (await p.$('#fi')) { await p.fill('#fi', '1'); await p.click('#fc'); }
    else if (await p.$('#pool')) { const n = await p.$$eval('#pool .chipd', e => e.length); for (let k = 0; k < n; k++) { await p.click('#pool .chipd >> nth=0'); await p.click(`.drop[data-k="${k}"]`); } await p.click('#mc'); }
    else if (await p.$('#ol')) await p.click('#oc');
    if (i === 1) { await p.waitForTimeout(300); await shot(p, 'game-boss'); }
    await p.waitForSelector('#nx'); await p.click('#nx');
  }
  await p.waitForSelector('.result h1', { timeout: 15000 }); log('boss result:', (await p.textContent('.result h1')).trim());
  await openGame(); await p.click('.mode[data-m="speed"]'); await p.waitForSelector('#gt'); await p.waitForTimeout(300);
  if (await p.$('#qa .opts, #qa .tf')) await p.click('#qa .opt >> nth=0'); await p.waitForTimeout(200); await shot(p, 'game-speed');
  for (let i = 0; i < 14; i++) { await p.waitForTimeout(1500); if (await p.$('.result h1')) break;
    if (await p.$('#nx')) continue; if (await p.$('#qa .opts, #qa .tf')) await p.click('#qa .opt >> nth=0'); else if (await p.$('#fi')) { await p.fill('#fi', '2'); await p.click('#fc'); } else if (await p.$('#mc')) { const n = await p.$$eval('#pool .chipd', e => e.length); for (let k = 0; k < n; k++) { await p.click('#pool .chipd >> nth=0'); await p.click(`.drop[data-k="${k}"]`); } await p.click('#mc'); } else if (await p.$('#oc')) await p.click('#oc'); }
  await p.waitForSelector('.result h1', { timeout: 70000 }); log('speed result:', (await p.textContent('.result h1')).trim());
  if (modes.includes('memory')) {
    await openGame(); await p.click('.mode[data-m="memory"]'); await p.waitForSelector('.mcard');
    const ks = await p.$$eval('.mcard', e => e.map(x => x.dataset.k)); const seen = {};
    await p.click('.mcard >> nth=0'); await p.click('.mcard >> nth=1'); await p.waitForTimeout(250); await shot(p, 'game-memory'); await p.waitForTimeout(1100);
    ks.forEach((k, i) => (seen[k] = seen[k] || []).push(i));
    for (const k of Object.keys(seen)) { if (await p.$(`.mcard:nth-child(${seen[k][0] + 1}).ok`)) continue; await p.click(`.mcard >> nth=${seen[k][0]}`); await p.click(`.mcard >> nth=${seen[k][1]}`); await p.waitForTimeout(500); }
    await p.waitForSelector('.result h1', { timeout: 15000 }); await p.waitForTimeout(900); log('memory result:', (await p.textContent('.kpis')).replace(/\s+/g, ' ').trim()); await shot(p, 'game-memory-result');
  }
  if (modes.includes('words')) {
    await openGame(); await p.click('.mode[data-m="words"]'); await p.waitForSelector('.wtile'); await p.click('.wtile >> nth=0'); await shot(p, 'game-words');
    for (let i = 0; i < 8; i++) { if (await p.$('.result h1')) break; await p.click('#wsk'); await p.click('#nx'); await p.waitForTimeout(150); }
    await p.waitForSelector('.result h1'); log('words done');
  }
  // dashboard + profile
  await p.goto(BASE + '/#/'); await p.waitForSelector('.goalcard'); await p.waitForTimeout(1200); await shot(p, 'home-dashboard');
  await p.evaluate(() => window.scrollTo(0, 700)); await p.waitForTimeout(300); await shot(p, 'home-dashboard-2');
  const dash = await p.evaluate(async () => (await (await fetch('/api/dashboard')).json())); log('dashboard today_xp', dash.today_xp, 'badges got', dash.badges.filter(b => b.got).map(b => b.id).join(','), 'boards', dash.boards.map(b => b.name + ':' + b.users.length).join(';'));
  await p.goto(BASE + '/#/profile'); await p.waitForSelector('.badges'); await p.waitForTimeout(500); await shot(p, 'profile-badges');
  // languages on a lab
  for (const l of ['ru', 'en']) { await p.evaluate((l) => { localStorage.setItem('ab_lang', l); }, l); await p.goto(BASE + '/#/lab/cell?x=' + l); await p.reload(); await p.waitForSelector('.lab-canvas'); await p.waitForTimeout(1500); await shot(p, 'lab-cell-' + l); log('lab lang', l, (await p.textContent('.lab-side h3')).trim()); }
  await p.evaluate(() => localStorage.setItem('ab_lang', 'kk'));
  // mobile
  const m = await mk(390, 844); await m.goto(BASE + '/#/login'); await m.waitForSelector('#phone'); await m.fill('#phone', phone); await m.fill('#pw', 'test1234'); await m.click('#f button.pri');
  await m.waitForSelector('.goalcard'); await m.waitForTimeout(900); await shot(m, 'mobile-home');
  const tabOverflow = await m.evaluate(() => { const t = document.querySelector('.tabbar'); return t ? t.scrollWidth - t.clientWidth : -1; }); log('mobile tabbar overflow px', tabOverflow);
  await m.goto(BASE + '/#/lab/solar'); await m.waitForSelector('.lab-canvas'); await m.waitForTimeout(1800); await shot(m, 'mobile-lab-solar'); log('mobile solar colors', await colors(m), 'page h-overflow px', await m.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  const three1 = await p.evaluate(() => performance.getEntriesByType('resource').some(r => /three\.module/.test(r.name)));
  console.log('\nJS ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none'); console.log('FAILS:', fails);
  await browser.close(); process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(2); });
