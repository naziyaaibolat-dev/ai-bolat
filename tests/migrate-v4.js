'use strict';
// v4 деректер миграциясы: v3.2 серверімен база жасалады → v4 сол базамен іске қосылады → деректер сақталғаны тексеріледі.
// Usage: V32_DIR=/path/to/v3.2 node tests/migrate-v4.js
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs'); const os = require('os');
const V32 = process.env.V32_DIR; const V4 = path.join(__dirname, '..');
let fails = 0; const ok = (c, ...a) => { console.log(c ? '✔' : '✘', ...a); if (!c) fails++; };
const start = (dir, port, data) => new Promise((res, rej) => { const p = spawn(process.execPath, ['server/index.js'], { cwd: dir, env: { ...process.env, PORT: String(port), DATA_DIR: data, AI_API_KEY: '' } });
  let out = ''; const t = setTimeout(() => rej(new Error('start timeout\n' + out)), 20000); p.stdout.on('data', d => { out += d; if (/іске қосылды/.test(out)) { clearTimeout(t); res(p); } }); p.stderr.on('data', d => { out += d; }); });
const stop = (p) => new Promise(r => { p.on('exit', r); p.kill('SIGTERM'); });
(async () => {
  if (!V32 || !fs.existsSync(path.join(V32, 'server/index.js'))) { console.log('SKIP: V32_DIR not set'); return; }
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'abmig-'));
  let p = await start(V32, 8811, data);
  const login = async (port) => { const r = await fetch(`http://localhost:${port}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '+77000000001', password: 'demo1234' }) }); return r.headers.get('set-cookie').split(';')[0]; };
  let ck = await login(8811); const get = async (port, u) => (await fetch(`http://localhost:${port}${u}`, { headers: { cookie: ck } })).json();
  const before = { classes: (await get(8811, '/api/classes')).classes, gb: await get(8811, '/api/classes/1/gradebook'), ann: (await get(8811, '/api/announcements')).announcements };
  ok((await get(8811, '/api/config')).version === '3.2.0', 'v3.2 server ran');
  await stop(p);
  p = await start(V4, 8812, data); ck = await login(8812);
  ok((await get(8812, '/api/config')).version === '4.0.0', 'v4 server on same data');
  const after = { classes: (await get(8812, '/api/classes')).classes, gb: await get(8812, '/api/classes/1/gradebook'), ann: (await get(8812, '/api/announcements')).announcements };
  ok(JSON.stringify(after.classes) === JSON.stringify(before.classes), 'classes preserved', after.classes.length);
  ok(JSON.stringify(after.gb.rows.map(r => r.marks)) === JSON.stringify(before.gb.rows.map(r => r.marks)), 'gradebook preserved', after.gb.rows.length);
  ok(after.ann.length === before.ann.length && after.ann.every(a => a.pinned === 0), 'announcements preserved + pinned column', after.ann.length);
  const rep = await get(8812, '/api/v4/classes/1/report'); ok(rep.students.length === before.gb.rows.length && rep.assignments.length === before.gb.assignments.length, 'v4 report on migrated data');
  await stop(p);
  p = await start(V4, 8812, data); ck = await login(8812); ok((await get(8812, '/api/classes')).classes.length === before.classes.length, 'second v4 start idempotent'); await stop(p);
  console.log(fails ? `\n${fails} FAILED` : '\nmigration OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
