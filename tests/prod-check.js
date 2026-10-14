'use strict';
/* Өндіріс режимінің тексерісі (браузерсіз). Сервер: NODE_ENV=production PUBLIC_URL=https://aibolat.kz ADMIN_SETUP_TOKEN=tok123 ...
   BASE=http://localhost:8796 node tests/prod-check.js */
const BASE = process.env.BASE || 'http://localhost:8796';
let fails = 0; const ok = (c, m, x) => { console.log((c ? '✔ ' : '✘ ') + m + (x !== undefined ? ' ' + String(typeof x === 'string' ? x : JSON.stringify(x)).slice(0, 160) : '')); if (!c) fails++; };
const H = { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' };
let cookie = '';
const req = async (method, p, body, extra = {}) => { const r = await fetch(BASE + p, { method, redirect: 'manual', headers: { ...H, ...(cookie ? { Cookie: cookie } : {}), ...extra }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc && /ab_sid=/.test(sc)) cookie = sc.split(';')[0]; let j = null; const t = await r.text(); try { j = JSON.parse(t); } catch (e) { j = t; } return { r, j, sc }; };
(async () => {
  let x = await req('GET', '/healthz'); ok(x.r.status === 200 && x.j.ok, 'healthz', x.j);
  x = await req('GET', '/api/config'); ok(x.j.prod === true && x.j.demo === false && x.j.sms.configured === false, 'config prod/demo off/sms not configured', x.j.sms);
  ok(x.r.headers.get('strict-transport-security'), 'HSTS header'); ok(x.r.headers.get('x-content-type-options') === 'nosniff', 'nosniff');
  x = await req('GET', '/kk/privacy', null, { 'X-Forwarded-Proto': 'http' }); ok(x.r.status === 301 && /^https:\/\/aibolat\.kz\/kk\/privacy/.test(x.r.headers.get('location')), 'http→https redirect', x.r.headers.get('location'));
  x = await req('POST', '/api/auth/sms', { phone: '+77011112233', purpose: 'register' }); ok(x.r.status === 503 && x.j.code === 'sms_not_configured' && !x.j.dev_code, 'SMS not configured → 503, no dev code', x.j);
  x = await req('POST', '/api/auth/login', { phone: '+77000000001', password: 'demo1234' }); ok(x.r.status === 401 || x.r.status === 403, 'demo login blocked/absent', x.r.status);
  x = await req('GET', '/setup'); ok(x.r.status === 200 && /ADMIN_SETUP_TOKEN/.test(x.j), '/setup page available');
  x = await req('POST', '/api/setup', { token: 'wrong', phone: '+77011234567', name: 'Әкімші', password: 'Admin12345' }); ok(x.r.status === 403, 'setup wrong token 403');
  x = await req('POST', '/api/setup', { token: 'tok123', phone: '+77011234567', name: 'Әкімші', password: 'Admin12345' }); ok(x.r.status === 200, 'setup creates admin', x.j);
  ok(/Secure/.test(x.sc || '') && /HttpOnly/.test(x.sc || ''), 'session cookie Secure+HttpOnly', x.sc);
  x = await req('GET', '/api/me'); ok(x.j.user && x.j.user.is_admin && x.j.user.role === 'teacher', 'admin user', x.j.user && x.j.user.name);
  x = await req('GET', '/setup'); ok(x.r.status === 404, '/setup closed after admin exists');
  x = await req('GET', '/api/admin/overview'); ok(x.r.status === 200 && x.j.warnings.includes('sms_not_configured'), 'admin overview warnings', x.j.warnings);
  x = await req('POST', '/api/report', { kind: 'bolat', ref: '1:2', reason: 'harmful', text: 'test excerpt', note: 'n' }); ok(x.j.ok, 'report saved');
  x = await req('GET', '/api/admin/reports'); ok(x.j.reports.length >= 1 && x.j.reports[0].reason === 'harmful', 'admin sees report');
  x = await req('POST', '/api/admin/reports/' + x.j.reports[0].id, { status: 'resolved' }); ok(x.j.ok, 'resolve report');
  x = await req('POST', '/api/admin/backup'); ok(x.j.file && x.j.backups.length >= 1, 'backup created', x.j.file);
  x = await req('GET', '/.well-known/assetlinks.json'); ok(x.j[0].target.package_name === 'kz.aibolat.app' && x.j[0].target.sha256_cert_fingerprints.length >= 1, 'assetlinks with fingerprint', x.j[0].target.sha256_cert_fingerprints);
  x = await req('GET', '/sitemap.xml'); ok(/<loc>https:\/\/aibolat\.kz\/<\/loc>/.test(x.j) && /hreflang="ru"/.test(x.j), 'sitemap https + hreflang', (x.j.match(/<url>/g) || []).length + ' urls');
  x = await req('GET', '/robots.txt'); ok(/Sitemap: https:\/\/aibolat\.kz\/sitemap\.xml/.test(x.j), 'robots sitemap');
  const c0 = cookie; cookie = '';
  x = await req('GET', '/ru/'); ok(/<link rel="canonical" href="https:\/\/aibolat\.kz\/ru\/">/.test(x.j) && /hreflang="x-default"/.test(x.j) && /application\/ld\+json/.test(x.j) && /og:image/.test(x.j), 'ru landing SEO tags');
  x = await req('GET', '/kk/subjects/math'); ok(x.r.status === 200 && /"@type":"Course"/.test(x.j), 'subject page JSON-LD Course');
  x = await req('GET', '/en/delete-account'); ok(x.r.status === 200 && /Delete your account/.test(x.j), 'deletion page en');
  x = await req('GET', '/kk/privacy'); ok(/OpenAI API/.test(x.j) && /Қазақстан Республикасында/.test(x.j), 'privacy names AI provider + KZ location');
  cookie = c0;
  // AI шектеуі (AI_LIMIT_PER_MIN=3)
  let codes = []; for (let i = 0; i < 5; i++) { const y = await req('POST', '/api/exam/generate', { kind: 'ubt', subject: 'math', n: 1 }); codes.push(y.r.status); }
  ok(codes.includes(429), 'AI rate limit → 429', codes);
  // аккаунтты жою
  x = await req('POST', '/api/me/delete', { password: 'bad' }); ok(x.r.status === 400, 'delete with wrong password rejected');
  x = await req('POST', '/api/me/delete', { password: 'Admin12345' }); ok(x.j.ok && /Max-Age=0/.test(x.sc || ''), 'account deleted');
  x = await req('POST', '/api/auth/login', { phone: '+77011234567', password: 'Admin12345' }); ok(x.r.status === 401, 'deleted user cannot log in');
  console.log(fails ? `\nFAILS: ${fails}` : '\nALL OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
