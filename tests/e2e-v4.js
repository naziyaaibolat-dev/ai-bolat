'use strict';
// v4.0 E2E: аналитика, мұғалім есебі (CSV/PDF), дедлайндар, медиа слоттары, жылдам тексеру, Болат көмек деңгейі, PWA офлайн, қауіпсіздік, скриншоттар.
// Usage: PW=... CHROME=... BASE=http://localhost:8795 node tests/e2e-v4.js   (mock-ai серверімен)
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8795';
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const errors = [];
const ok = (c, ...a) => { console.log(c ? '✔' : '✘', ...a); if (!c) fails++; };
(async () => {
  /* --- API / қауіпсіздік --- */
  const cfg = await (await fetch(BASE + '/api/config')).json(); ok(cfg.version === '4.0.0', 'version', cfg.version);
  const app = await fetch(BASE + '/app/'); const csp = app.headers.get('content-security-policy') || '';
  ok(/script-src 'self'/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp) && /frame-ancestors 'self'/.test(csp), 'CSP on /app/');
  ok(!/<script>/.test(await app.text()), 'no inline scripts in app shell');
  ok(/microphone=\(self\)/.test(app.headers.get('permissions-policy') || ''), 'mic allowed for self (voice input)');
  const sw = await (await fetch(BASE + '/sw.js')).text(); ok(sw.includes("'4.0.0'") && !sw.includes('__VERSION__') && sw.includes('aibolat-api-'), 'sw v4 with api cache');
  ok((await fetch(BASE + '/api/v4/analytics/me')).status === 401, 'analytics requires auth');
  const lg = async (phone) => { const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, password: 'demo1234' }) }); return r.headers.get('set-cookie').split(';')[0]; };
  const tck = await lg('+77000000001'), sck = await lg('+77000000002');
  const call = async (ck, m, u, b) => { const r = await fetch(BASE + u, { method: m, headers: { cookie: ck, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined }); let j = null; try { j = await r.clone().json(); } catch (e) { /* */ } return { s: r.status, j, r }; };
  ok((await call(sck, 'GET', '/api/v4/classes/1/report')).s === 403, 'student cannot read class report');
  ok((await call(tck, 'POST', '/api/v4/lesson/alg-7-1/media', { url: 'javascript:alert(1)' })).s === 400, 'media rejects javascript: url');
  ok((await call(tck, 'POST', '/api/v4/lesson/alg-7-1/media', { url: 'https://evil.example.com/x' })).s === 400, 'media rejects non-whitelisted host');
  const md = await call(tck, 'POST', '/api/v4/lesson/alg-7-1/media', { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Дәреже — бейнесабақ' });
  ok(md.s === 200 && md.j.media.url === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'youtube → nocookie embed');
  ok((await call(sck, 'POST', '/api/v4/lesson/alg-7-1/media', { url: 'https://youtu.be/dQw4w9WgXcQ' })).s === 403, 'student cannot add media');
  const csvR = await call(tck, 'GET', '/api/v4/classes/1/report?format=csv'); const csvB = Buffer.from(await csvR.r.arrayBuffer()); const csv = csvB.toString('utf8');
  ok(csvR.s === 200 && /text\/csv/.test(csvR.r.headers.get('content-type')) && csvB[0] === 0xEF && csvB[1] === 0xBB && csvB[2] === 0xBF && csv.split('\r\n').length >= 6, 'CSV report', csv.split('\r\n').length, 'lines');
  const htmlR = await call(tck, 'GET', '/api/v4/classes/1/report?format=html'); const html = await htmlR.r.text(); ok(htmlR.s === 200 && /<table>/.test(html) && /print-report\.js/.test(html), 'printable PDF report page');
  const rep = (await call(tck, 'GET', '/api/v4/classes/1/report')).j; ok(rep.summary.students === 4 && rep.assignments.length === 3 && rep.assignments[0].dist, 'report json', JSON.stringify(rep.summary));
  const past = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
  const ed = await call(tck, 'PATCH', `/api/v4/assignments/${rep.assignments[2].id}`, { due_at: past, points: 20, allow_late: false }); ok(ed.s === 200 && ed.j.assignment.due_at === past && ed.j.assignment.points === 20 && ed.j.assignment.allow_late === 0, 'edit deadline/points');
  const sa = (await call(sck, 'GET', '/api/v4/assignments')).j.assignments; ok(sa.some(a => a.status === 'overdue') && sa.some(a => a.status === 'done'), 'student deadline statuses', sa.map(a => a.status).join(','));
  const ann = (await call(tck, 'GET', '/api/v4/classes/1/announcements')).j.announcements; const pin = await call(tck, 'POST', `/api/v4/announcements/${ann[0].id}/pin`, { pinned: 1 }); ok(pin.j.pinned === 1, 'pin announcement');
  ok((await call(sck, 'PATCH', '/api/v4/goal', { daily_goal: 5 })).s === 400 && (await call(sck, 'PATCH', '/api/v4/goal', { daily_goal: 80 })).j.goal === 80, 'daily goal validate+save');
  const an = (await call(sck, 'GET', '/api/v4/analytics/me')).j; ok(an.heat.length === 84 && an.mastery.length >= 1 && an.goal === 80 && an.ranks.length === 1, 'analytics', an.totals.games, 'games', 'rank', an.ranks[0] && an.ranks[0].rank);
  ok((await call(tck, 'GET', '/api/v4/teacher/overview')).j.classes.length === 1, 'teacher overview');

  /* --- браузер --- */
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
  const mk = async (w = 1440, h = 900, light) => { const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, acceptDownloads: true }); const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/status of 40[0-9]|ERR_INTERNET_DISCONNECTED|Failed to fetch/.test(m.text())) errors.push('console: ' + m.text()); });
    p.on('dialog', d => d.accept()); if (light) await p.addInitScript(() => localStorage.setItem('ab_theme', 'light')); return { p, ctx }; };
  const login = async (p, phone) => { await p.goto(BASE + '/app/#/login'); await p.waitForSelector('#phone'); await p.fill('#phone', phone); await p.fill('#pw', 'demo1234'); await p.click('#f button.pri'); await p.waitForFunction(() => location.hash === '#/' && document.querySelector('.shell')); };
  const shot = (p, n, full) => p.waitForTimeout(700).then(() => p.screenshot({ path: path.join(SHOTS, 'v4-' + n + '.png'), fullPage: !!full }));
  const { p: s, ctx: sctx } = await mk(); await login(s, '+77000000002');
  await s.waitForSelector('.ins4'); ok(await s.$('.ins4 .heat4') && await s.$('.dl4box'), 'student home: insights + deadlines'); ok(await s.$('.skip4'), 'skip link'); await shot(s, 'student-home');
  await s.goto(BASE + '/app/#/stats'); await s.waitForSelector('.trend4'); ok((await s.$$('.tile4')).length === 5 && await s.$('.mast4'), 'stats page'); await shot(s, 'student-stats', true);
  await s.goto(BASE + '/app/#/classes'); await s.waitForSelector('.dl4box'); ok(await s.$('.dl4.st-overdue'), 'student classes: overdue shown'); await shot(s, 'student-deadlines');
  await s.goto(BASE + '/app/#/lesson/alg-7-1'); await s.waitForSelector('.media4 .facade'); ok(true, 'lesson media slot');
  await s.waitForSelector('.quick4', { timeout: 15000 }).catch(() => {}); const q = await s.$('.quick4');
  if (q) { await s.click('.quick4 summary'); const qs = await s.$$('.qq4'); for (const x of qs) { const b = await x.$('.qo'); await b.click(); } ok((await s.$eval('.qres', e => e.textContent)).length > 3, 'quick check completes'); } else ok(false, 'quick check present');
  await shot(s, 'lesson-media-quick');
  await s.click('.media4 .facade'); await s.waitForSelector('.media4 iframe'); ok(/youtube-nocookie\.com\/embed/.test(await s.$eval('.media4 iframe', f => f.src)), 'click-to-load iframe');
  // Болат: көмек деңгейі + ағынды жауап
  await s.goto(BASE + '/app/#/bolat'); await s.waitForSelector('.hintlv'); await s.click('.hintlv .hl[data-h="3"]');
  let body = null; s.on('request', r => { if (/\/stream$/.test(r.url())) body = r.postDataJSON(); });
  await s.fill('#bt', '2x+3=11 қалай шешемін?'); await s.click('#bsend'); await s.waitForFunction(() => document.querySelectorAll('.bm:not(.user) .md').length >= 1 && !document.querySelector('#live'), null, { timeout: 30000 });
  ok(body && body.hint === 3, 'bolat sends hint level', body && body.hint); ok(await s.$eval('#bmic', b => b.hidden === false), 'voice button shown (SpeechRecognition available)'); await shot(s, 'bolat-hints');
  // PWA офлайн
  await s.goto(BASE + '/app/#/lesson/alg-7-1'); await s.waitForSelector('.tabs'); await s.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  await s.reload(); await s.waitForSelector('.tabs'); await s.waitForTimeout(800);
  await sctx.setOffline(true); await s.reload().catch(() => {}); const offOk = await s.waitForSelector('.tabs', { timeout: 15000 }).then(() => true).catch(() => false);
  ok(offOk, 'offline: app shell + cached lesson open'); await s.waitForTimeout(600); ok(await s.$('#net4'), 'offline banner'); await shot(s, 'offline-lesson'); await sctx.setOffline(false);
  // мұғалім
  const { p: t } = await mk(); await login(t, '+77000000001'); await t.waitForSelector('.ov4'); ok(await t.$('.ov4 .kpis4'), 'teacher overview card'); await shot(t, 'teacher-home');
  await t.goto(BASE + '/app/#/class/1'); await t.waitForSelector('#rep4'); await t.click('#rep4'); await t.waitForSelector('.asg4'); ok((await t.$$('.asg4')).length === 3 && await t.$('.ann.pin4'), 'report page + pinned ann'); await shot(t, 'teacher-report', true);
  const [dl] = await Promise.all([t.waitForEvent('download'), t.click('#rcsv')]); ok(/\.csv$/.test(dl.suggestedFilename()), 'CSV download from UI', dl.suggestedFilename());
  await t.click('[data-edit]'); await t.waitForSelector('#ed4'); await shot(t, 'teacher-edit-deadline'); await t.keyboard.press('Escape'); ok(!(await t.$('.modal-bg')), 'Esc closes modal');
  const [pdf] = await Promise.all([t.context().waitForEvent('page'), t.click('#rpdf')]); await pdf.waitForLoadState(); await pdf.waitForTimeout(400); await pdf.screenshot({ path: path.join(SHOTS, 'v4-teacher-report-print.png'), fullPage: true });
  await pdf.pdf({ path: path.join('/tmp', 'v4-report.pdf') }).catch(() => {}); ok(fs.existsSync('/tmp/v4-report.pdf') && fs.statSync('/tmp/v4-report.pdf').size > 5000, 'report renders to PDF');
  await t.goto(BASE + '/app/#/lesson/alg-7-1'); await t.waitForSelector('.media4 .madd'); await shot(t, 'teacher-lesson-media');
  // мобильді 390px
  const { p: m } = await mk(390, 844); await login(m, '+77000000002'); await m.waitForSelector('.ins4');
  const ov = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 1, 'mobile home no h-overflow', ov); await shot(m, 'mobile-home'); await shot(m, 'mobile-home-full', true);
  await m.goto(BASE + '/app/#/stats'); await m.waitForSelector('.trend4'); ok(await m.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, 'mobile stats no overflow'); await shot(m, 'mobile-stats', true);
  await m.goto(BASE + '/app/#/lesson/alg-7-1'); await m.waitForSelector('.media4'); await shot(m, 'mobile-lesson');
  await m.goto(BASE + '/app/#/bolat'); await m.waitForSelector('.hintlv'); await shot(m, 'mobile-bolat');
  const { p: mt } = await mk(390, 844); await login(mt, '+77000000001'); await mt.goto(BASE + '/app/#/report/1'); await mt.waitForSelector('.asg4'); ok(await mt.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, 'mobile report no overflow'); await shot(mt, 'mobile-teacher-report');
  // жарық тема
  const { p: l } = await mk(1440, 900, true); await login(l, '+77000000002'); await l.waitForSelector('.ins4'); await shot(l, 'light-student-home'); await l.goto(BASE + '/app/#/stats'); await l.waitForSelector('.trend4'); await shot(l, 'light-stats');
  await browser.close();
  ok(!errors.length, 'no JS/CSP console errors', errors.slice(0, 5).join(' | '));
  console.log(fails ? `\n${fails} FAILED` : '\nALL v4 CHECKS PASSED'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); console.log('JS ERRORS:', errors.join('\n')); process.exit(1); });
