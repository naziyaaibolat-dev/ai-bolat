'use strict';
/* AI-bolat — сервер (Express + SQLite/sql.js) */
const path = require('path'), fs = require('fs'), crypto = require('crypto'), os = require('os');
(function loadEnv() {
  const f = path.join(__dirname, '..', '.env'); if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/); if (!m || line.trim().startsWith('#')) continue;
    let v = m[2]; if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
})();
const express = require('express');
const CFG = require('./config');
const prod = require('./prod');
const bcrypt = require('bcryptjs');
const { DB, DATA_DIR, DB_FILE } = require('./db');
const ai = require('./ai');
const sms = require('./sms');
const CAT = require('./catalog');
const C = require('./content');
const I = require('./i18n');
const { SUBJECTS, TOPICS, tTitle } = CAT;
const PORT = +process.env.PORT || 8790;
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = require('../package.json').version;
const SESSION_DAYS = 30, COOKIE = 'ab_sid';
const LANGS = ['kk', 'ru', 'en'];

const nowIso = () => new Date().toISOString();
const dayStart = (daysAgo) => { const d = new Date(Date.now() - daysAgo * 864e5); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(); };
const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function httpErr(status, key, vars) { const e = new Error(key); e.status = status; e.key = key; e.vars = vars; return e; }
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
function parseCookies(h) { const o = {}; (h || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return o; }
function normPhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length === 10 && d[0] === '7') d = '7' + d;
  return /^77\d{9}$/.test(d) ? '+' + d : null;
}
const levelOf = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
const levelBase = (lv) => (lv - 1) * (lv - 1) * 100;
function genJoin() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[crypto.randomInt(A.length)]; return s; }
function secret() {
  if (process.env.APP_SECRET) return process.env.APP_SECRET;
  if (process.env.SMS_SECRET) return process.env.SMS_SECRET;
  const f = path.join(DATA_DIR, 'secret.key'); fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(32).toString('hex')); return fs.readFileSync(f, 'utf8').trim();
}

async function main() {
  const db = await DB.open();
  try { const m = require('./migrate-v32')(db, CAT); if (!m.skipped) console.log('[catalog] v3.2 migration:', JSON.stringify(m)); } catch (e) { console.error('[catalog] migration failed', e); }
  try { const m4 = require('./v4').migrate(db); if (m4.added_columns) console.log('[db] v4 migration: +' + m4.added_columns + ' columns'); } catch (e) { console.error('[db] v4 migration failed', e); }
  ai.setDataDir(DATA_DIR);
  ai.setStore({ get: (k) => { const r = db.get('SELECT v FROM ai_cache WHERE k = ?', [k]); return r ? JSON.parse(r.v) : null; }, put: (k, v) => db.run('INSERT OR REPLACE INTO ai_cache(k, v, created_at) VALUES (?,?,?)', [k, JSON.stringify(v), nowIso()]) });
  ai.discover().catch(() => {});
  const SECRET = secret();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', CFG.TRUST_PROXY);
  const jsonSmall = express.json({ limit: '1mb' }), jsonBig = express.json({ limit: '25mb' });
  app.use((req, res, next) => (req.path.startsWith('/api/bolat') ? jsonBig : jsonSmall)(req, res, next));
  app.use((req, res, next) => {
    const h = String(req.headers['x-lang'] || '').slice(0, 2); req.lang = LANGS.includes(h) ? h : 'kk';
    const tok = parseCookies(req.headers.cookie)[COOKIE]; req.user = null;
    if (tok) { const s = db.get('SELECT * FROM sessions WHERE token = ?', [tok]); if (s && s.expires_at > nowIso()) req.user = db.get('SELECT * FROM users WHERE id = ?', [s.user_id]); }
    if (req.user && !h) req.lang = req.user.lang || 'kk';
    if (req.user && req.user.is_demo && !CFG.DEMO_LOGIN) req.user = null;
    next();
  });
  prod.early(app, { httpErr });
  function setSession(res, userId) {
    const tok = crypto.randomBytes(32).toString('hex'); const exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
    db.run('INSERT INTO sessions(token, user_id, expires_at) VALUES (?,?,?)', [tok, userId, exp]);
    res.setHeader('Set-Cookie', `${COOKIE}=${tok}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${CFG.COOKIE_SECURE ? '; Secure' : ''}`);
  }
  const auth = (role) => (req, res, next) => { if (!req.user) return next(httpErr(401, 'auth')); if (role && req.user.role !== role) return next(httpErr(403, 'forbidden')); next(); };
  const pub = (u) => u && ({ id: u.id, role: u.role, name: u.name, phone: u.phone, grade: u.grade, lang: u.lang, avatar: u.avatar, xp: u.xp, level: levelOf(u.xp),
    level_base: levelBase(levelOf(u.xp)), level_next: levelBase(levelOf(u.xp) + 1), streak: u.streak, best_streak: u.best_streak, is_demo: !!u.is_demo, is_admin: prod.isAdmin(u) });

  /* ---------- SMS кодтары ---------- */
  const hashCode = (phone, purpose, code) => crypto.createHmac('sha256', SECRET).update(`${phone}|${purpose}|${code}`).digest('hex');
  const ipHits = new Map();
  function ipLimit(key, max, windowMs) { const now = Date.now(); const arr = (ipHits.get(key) || []).filter(t => now - t < windowMs); if (arr.length >= max) return false; arr.push(now); ipHits.set(key, arr); return true; }
  function awardXp(u, xp) { // серия (streak) және XP
    const today = localDay(); const yest = localDay(new Date(Date.now() - 864e5));
    let streak = u.streak; if (u.last_day !== today) streak = u.last_day === yest ? streak + 1 : 1;
    const before = levelOf(u.xp);
    db.run('UPDATE users SET xp = xp + ?, streak = ?, best_streak = MAX(best_streak, ?), last_day = ? WHERE id = ?', [xp, streak, streak, today, u.id]);
    return { nu: db.get('SELECT * FROM users WHERE id = ?', [u.id]), before };
  }
  app.post('/api/auth/sms', wrap(async (req, res) => {
    const b = req.body || {}; const purpose = ['register', 'reset', 'change'].includes(b.purpose) ? b.purpose : null; if (!purpose) throw httpErr(400, 'not_found');
    let phone;
    if (purpose === 'change') { if (!req.user) throw httpErr(401, 'auth'); phone = req.user.phone; }
    else { phone = normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_bad');
      const exists = db.get('SELECT id FROM users WHERE phone = ?', [phone]);
      if (purpose === 'register' && exists) throw httpErr(409, 'phone_taken');
      if (purpose === 'reset' && !exists) throw httpErr(404, 'phone_unknown'); }
    const now = Date.now();
    const last = db.get('SELECT created_at FROM sms_codes WHERE phone = ? AND purpose = ? ORDER BY id DESC LIMIT 1', [phone, purpose]);
    if (last && now - last.created_at < 60000) throw httpErr(429, 'sms_wait', { s: Math.ceil((60000 - (now - last.created_at)) / 1000) });
    const hour = db.get('SELECT COUNT(*) AS n FROM sms_codes WHERE phone = ? AND created_at > ?', [phone, now - 3600000]).n;
    if (hour >= 5 || !ipLimit('sms:' + req.ip, 20, 3600000)) throw httpErr(429, 'sms_limit');
    if (sms.isDev() && !CFG.ALLOW_DEV_SMS) throw httpErr(503, 'sms_not_configured');
    const code = String(crypto.randomInt(100000, 1000000));
    db.run('UPDATE sms_codes SET used = 1 WHERE phone = ? AND purpose = ? AND used = 0', [phone, purpose]);
    db.run('INSERT INTO sms_codes(phone, purpose, code_hash, expires_at, ip, created_at) VALUES (?,?,?,?,?,?)', [phone, purpose, hashCode(phone, purpose, code), now + 5 * 60000, req.ip, now]);
    try { await sms.send(phone, I.t(req.lang, 'sms_text', { c: code })); }
    catch (e) { console.warn('SMS қатесі:', e.message); db.run('DELETE FROM sms_codes WHERE phone = ? AND created_at = ?', [phone, now]); throw httpErr(502, 'sms_fail'); }
    const out = { ok: true, phone, ttl: 300, cooldown: 60, dev: sms.isDev() };
    if (sms.isDev() && CFG.ALLOW_DEV_SMS) out.dev_code = code;
    res.json(out);
  }));
  function checkCode(phone, purpose, code) {
    const row = db.get('SELECT * FROM sms_codes WHERE phone = ? AND purpose = ? AND used = 0 ORDER BY id DESC LIMIT 1', [phone, purpose]);
    if (!row || row.expires_at < Date.now()) throw httpErr(400, 'code_bad');
    if (row.attempts >= 5) throw httpErr(429, 'code_many');
    const ok = crypto.timingSafeEqual(Buffer.from(row.code_hash), Buffer.from(hashCode(phone, purpose, String(code || '').replace(/\D/g, ''))));
    if (!ok) { db.run('UPDATE sms_codes SET attempts = attempts + 1 WHERE id = ?', [row.id]); throw httpErr(400, row.attempts + 1 >= 5 ? 'code_many' : 'code_bad'); }
    db.run('UPDATE sms_codes SET used = 1 WHERE id = ?', [row.id]);
  }
  const checkPass = (p) => { if (String(p || '').length < 6) throw httpErr(400, 'pass_short'); return String(p).slice(0, 200); };

  /* ---------- auth ---------- */
  app.post('/api/auth/register', wrap(async (req, res) => {
    const b = req.body || {}; const phone = normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_bad');
    const name = String(b.name || '').replace(/\s+/g, ' ').trim().slice(0, 80); if (name.length < 2) throw httpErr(400, 'name_req');
    const pass = checkPass(b.password); const role = b.role === 'teacher' ? 'teacher' : 'student';
    const grade = role === 'student' ? +b.grade : (+b.grade || null); if (role === 'student' && !(grade >= 1 && grade <= 11)) throw httpErr(400, 'grade_bad');
    if (db.get('SELECT id FROM users WHERE phone = ?', [phone])) throw httpErr(409, 'phone_taken');
    if (CFG.REQUIRE_CONSENT && b.consent !== true) throw httpErr(400, 'consent_req');
    checkCode(phone, 'register', b.code);
    const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    const { id } = db.run('INSERT INTO users(role, name, phone, pass_hash, grade, lang, avatar) VALUES (?,?,?,?,?,?,?)', [role, name, phone, bcrypt.hashSync(pass, 10), grade, lang, b.avatar ? String(b.avatar).slice(0, 8) : (role === 'teacher' ? '🧑‍🏫' : '🦅')]);
    if (b.consent === true) db.run('UPDATE users SET consent_at = ? WHERE id = ?', [nowIso(), id]);
    setSession(res, id); res.json({ user: pub(db.get('SELECT * FROM users WHERE id = ?', [id])) });
  }));
  const loginFails = new Map();
  app.post('/api/auth/login', wrap(async (req, res) => {
    const b = req.body || {}; const phone = normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_bad');
    const k = phone + '|' + req.ip; const f = (loginFails.get(k) || []).filter(t => Date.now() - t < 15 * 60000);
    if (f.length >= 10) throw httpErr(429, 'login_many');
    const u = db.get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!u || !bcrypt.compareSync(String(b.password || ''), u.pass_hash)) { f.push(Date.now()); loginFails.set(k, f); throw httpErr(401, 'login_bad'); }
    if (u.is_demo && !CFG.DEMO_LOGIN) throw httpErr(403, 'demo_off');
    loginFails.delete(k); setSession(res, u.id); res.json({ user: pub(u) });
  }));
  app.post('/api/auth/reset', wrap(async (req, res) => {
    const b = req.body || {}; const phone = normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_bad');
    const u = db.get('SELECT * FROM users WHERE phone = ?', [phone]); if (!u) throw httpErr(404, 'phone_unknown');
    const pass = checkPass(b.password); checkCode(phone, 'reset', b.code);
    db.run('UPDATE users SET pass_hash = ? WHERE id = ?', [bcrypt.hashSync(pass, 10), u.id]); db.run('DELETE FROM sessions WHERE user_id = ?', [u.id]);
    setSession(res, u.id); res.json({ user: pub(u) });
  }));
  app.post('/api/auth/change-password', auth(), wrap(async (req, res) => {
    const b = req.body || {}; if (!bcrypt.compareSync(String(b.old_password || ''), req.user.pass_hash)) throw httpErr(400, 'old_pass_bad');
    const pass = checkPass(b.password); checkCode(req.user.phone, 'change', b.code);
    db.run('UPDATE users SET pass_hash = ? WHERE id = ?', [bcrypt.hashSync(pass, 10), req.user.id]);
    db.run('DELETE FROM sessions WHERE user_id = ?', [req.user.id]); setSession(res, req.user.id); res.json({ ok: true });
  }));
  app.post('/api/auth/logout', (req, res) => { const tok = parseCookies(req.headers.cookie)[COOKIE]; if (tok) db.run('DELETE FROM sessions WHERE token = ?', [tok]);
    res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${CFG.COOKIE_SECURE ? '; Secure' : ''}`); res.json({ ok: true }); });
  app.get('/api/me', (req, res) => res.json({ user: pub(req.user) }));
  app.patch('/api/me', auth(), wrap(async (req, res) => {
    const b = req.body || {}; const u = req.user;
    const name = b.name !== undefined ? String(b.name).replace(/\s+/g, ' ').trim().slice(0, 80) : u.name; if (name.length < 2) throw httpErr(400, 'name_req');
    const lang = LANGS.includes(b.lang) ? b.lang : u.lang; let grade = u.grade;
    if (b.grade !== undefined) { grade = +b.grade || null; if (u.role === 'student' && !(grade >= 1 && grade <= 11)) throw httpErr(400, 'grade_bad'); }
    const avatar = b.avatar !== undefined ? String(b.avatar).slice(0, 8) : u.avatar;
    db.run('UPDATE users SET name = ?, lang = ?, grade = ?, avatar = ? WHERE id = ?', [name, lang, grade, avatar, u.id]);
    res.json({ user: pub(db.get('SELECT * FROM users WHERE id = ?', [u.id])) });
  }));
  app.get('/api/config', (req, res) => res.json({ version: VERSION, prod: CFG.IS_PROD, public_url: CFG.PUBLIC_URL, play_url: CFG.PLAY_URL || null, demo: CFG.DEMO_LOGIN, contact: CFG.CONTACT_EMAIL, sms: { provider: sms.provider(), dev: sms.isDev(), configured: !sms.isDev() || CFG.ALLOW_DEV_SMS }, ai: ai.status(), stats: CAT.stats() }));

  /* ---------- каталог ---------- */
  const progMap = (uid) => { const m = {}; if (uid) for (const r of db.all('SELECT topic_id, best_percent, stars FROM progress WHERE user_id = ?', [uid])) m[r.topic_id] = r; return m; };
  app.get('/api/catalog', (req, res) => {
    const grades = []; for (let g = 1; g <= 11; g++) { const subs = CAT.subjectsForGrade(g); grades.push({ grade: g, subjects: subs.length, topics: subs.reduce((a, s) => a + s.count, 0) }); }
    res.json({ subjects: SUBJECTS, grades, stats: CAT.stats(), counts: CAT.counts(), source: CAT.SOURCE });
  });
  app.get('/api/catalog/grade/:g', (req, res) => {
    const g = +req.params.g; const pm = progMap(req.user && req.user.id);
    res.json({ grade: g, subjects: CAT.subjectsForGrade(g).map(s => { const list = CAT.topicsOf(s.id, g); const done = list.filter(t => pm[t.id] && pm[t.id].stars > 0).length;
      const stars = list.reduce((a, t) => a + (pm[t.id] ? pm[t.id].stars : 0), 0); return { ...s, grades: undefined, done, stars }; }) });
  });
  app.get('/api/catalog/:subj/:g', wrap(async (req, res) => {
    const list = CAT.topicsOf(req.params.subj, +req.params.g); if (!list.length) throw httpErr(404, 'not_found');
    const pm = progMap(req.user && req.user.id);
    const cached = new Set(db.all('SELECT topic_id FROM lesson_cache WHERE topic_id LIKE ? AND source = ?', [req.params.subj + '-' + (+req.params.g) + '-%', 'ai']).map(r => r.topic_id));
    res.json({ subject: { id: req.params.subj, ...SUBJECTS[req.params.subj] }, grade: +req.params.g, sections: CAT.sectionsOf(req.params.subj, +req.params.g), source: CAT.SOURCE,
      topics: list.map(t => ({ ...t, best: pm[t.id] ? pm[t.id].best_percent : null, stars: pm[t.id] ? pm[t.id].stars : 0, ai: cached.has(t.id) })) });
  }));
  app.get('/api/search', (req, res) => {
    const lang = LANGS.includes(req.query.lang) ? req.query.lang : req.lang;
    res.json({ results: CAT.search(req.query.q, lang, Math.max(1, Math.min(200, +req.query.limit || 60)), { grade: +req.query.grade || 0, subject: SUBJECTS[req.query.subject] ? req.query.subject : '' }) });
  });
  const topicView = (t) => ({ ...t, subjectInfo: { id: t.subject, ...SUBJECTS[t.subject] }, section: CAT.sectionOf(t), total: CAT.topicsOf(t.subject, t.grade).length });

  /* ---------- сабақтар ---------- */
  const inflight = new Map();
  const validateLesson = (topic, lang) => (txt) => { const content = C.normalizeLesson(C.parseJson(txt), topic, lang);
    if (content.theory.length < 1 || content.exercises.length < 5) throw new Error('lesson incomplete (' + content.theory.length + ' theory, ' + content.exercises.length + ' ex)'); return content; };
  function saveLesson(topic, lang, content, source, model, ms) {
    const old = db.get('SELECT * FROM lesson_cache WHERE topic_id = ? AND lang = ?', [topic.id, lang]);
    if (old) db.run('INSERT OR REPLACE INTO lesson_hist(topic_id, lang, stamp, content) VALUES (?,?,?,?)', [topic.id, lang, old.created_at, old.content]);
    const stamp = nowIso();
    db.run('INSERT OR REPLACE INTO lesson_cache(topic_id, lang, content, source, model, gen_ms, created_at) VALUES (?,?,?,?,?,?,?)', [topic.id, lang, JSON.stringify(content), source, model || null, ms || null, stamp]);
    return stamp;
  }
  /* Сабақты AI арқылы ағынмен жасау; бірнеше клиент бір генерацияға жазыла алады */
  function generateAI(topic, lang, listener) {
    const key = topic.id + '|' + lang;
    let job = inflight.get(key);
    if (!job) {
      job = { listeners: new Set(), chars: 0 };
      const emit = (ev, d) => { for (const l of job.listeners) try { l(ev, d); } catch (e) { /* */ } };
      job.promise = (async () => {
        const t0 = Date.now();
        const r = await ai.stream(C.lessonPrompt(topic, lang), { json: true, temperature: 0.4, tier: 'quality', firstTokenMs: 35000, idleMs: 35000, rounds: 3,
          validate: validateLesson(topic, lang),
          onModel: (m) => emit('status', { model: m }), onRetry: (x) => emit('retry', x), onReset: () => { job.chars = 0; emit('progress', { chars: 0 }); },
          onDelta: (t) => { job.chars += t.length; if (job.chars % 400 < t.length) emit('progress', { chars: job.chars }); } });
        const content = C.upgradeLesson(r.value, topic, lang);
        if (content.exercises.length < 10) { const tpl = C.templateLesson(topic, lang); content.exercises = content.exercises.concat(tpl.exercises).slice(0, 10); }
        const stamp = saveLesson(topic, lang, content, 'ai', r.model, Date.now() - t0);
        return { content, source: 'ai', model: r.model, stamp, ms: Date.now() - t0 };
      })();
      inflight.set(key, job);
      job.promise.catch(e => console.warn('Сабақ генерациясы сәтсіз (' + topic.id + '/' + lang + '):', String(e.message).slice(0, 200))).finally(() => inflight.delete(key));
    }
    if (listener) job.listeners.add(listener);
    return job;
  }
  function cachedLesson(topicId, lang, stamp) {
    const r = db.get('SELECT * FROM lesson_cache WHERE topic_id = ? AND lang = ?', [topicId, lang]);
    if (stamp && r && r.created_at !== stamp) { const h = db.get('SELECT * FROM lesson_hist WHERE topic_id = ? AND lang = ? AND stamp = ?', [topicId, lang, stamp]); if (h) return { content: JSON.parse(h.content), source: 'hist', created_at: stamp }; }
    return r ? { content: JSON.parse(r.content), source: r.source, model: r.model, created_at: r.created_at } : null;
  }
  app.get('/api/lesson/:id', wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const lang = LANGS.includes(req.query.lang) ? req.query.lang : req.lang;
    let cur = cachedLesson(topic.id, lang);
    if (req.query.wait === '1' && ai.status().enabled && (!cur || cur.source !== 'ai')) { // тесттер/API үшін синхронды режим
      try { const r = await generateAI(topic, lang).promise; cur = { content: r.content, source: 'ai', model: r.model, created_at: r.stamp }; } catch (e) { /* үлгі */ }
    }
    if (!cur || (cur.source === 'template' && cur.content.tv !== 32)) { const content = C.templateLesson(topic, lang); const stamp = saveLesson(topic, lang, content, 'template'); cur = { content, source: 'template', created_at: stamp }; }
    else if (cur.source !== 'template' && cur.source !== 'hist' && cur.content.tv !== 32) { cur.content = C.upgradeLesson(cur.content, topic, lang); db.run('UPDATE lesson_cache SET content = ? WHERE topic_id = ? AND lang = ?', [JSON.stringify(cur.content), topic.id, lang]); }
    const prog = req.user ? db.get('SELECT * FROM progress WHERE user_id = ? AND topic_id = ?', [req.user.id, topic.id]) : null;
    const nextId = CAT.nextOf(topic);
    const isT = req.user && req.user.role === 'teacher'; const done = cur.source === 'ai' || cur.source === 'teacher';
    const canGen = ai.status().enabled && (!done || isT);
    res.json({ topic: topicView(topic), next: nextId, lang, content: cur.content, source: cur.source, model: cur.model || null, stamp: cur.created_at, ai: ai.status().enabled, canGen, autoGen: ai.status().enabled && !done, canEdit: !!isT, seeded: !!C.hasSeed(topic, lang), generating: inflight.has(topic.id + '|' + lang), progress: prog });
  }));
  const sseStart = (res) => { res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    const send = (ev, data) => { if (!res.writableEnded) res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`); };
    const hb = setInterval(() => { if (!res.writableEnded) res.write(': ping\n\n'); }, 12000); res.on('close', () => clearInterval(hb)); return send; };
  app.post('/api/lesson/:id/generate', auth(), wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    const cur = cachedLesson(topic.id, lang);
    if (cur && (cur.source === 'ai' || cur.source === 'teacher') && !(b.regen && req.user.role === 'teacher')) { res.json({ ok: true, already: true }); return; }
    if (!ai.status().enabled) throw httpErr(503, 'ai_off');
    const send = sseStart(res); let closed = false; res.on('close', () => { closed = true; });
    const job = generateAI(topic, lang, (ev, d) => { if (!closed) send(ev, d); });
    send('start', { chars: job.chars });
    try { const r = await job.promise; send('done', { source: 'ai', model: r.model, stamp: r.stamp, ms: r.ms }); }
    catch (e) { send('error', { error: I.t(lang, ai.errKey(e)), key: ai.errKey(e) }); }
    finally { if (!res.writableEnded) res.end(); }
  }));
  /* v3.2: мұғалім сабақты өңдеп сақтайды (нұсқа тарихы сақталады) */
  app.put('/api/lesson/:id', auth('teacher'), wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    if (!b.content || typeof b.content !== 'object') throw httpErr(400, 'bad_request');
    const cur = cachedLesson(topic.id, lang);
    const content = C.normalizeLesson(b.content, topic, lang); content.tv = 32;
    if (content.exercises.length < 3 && cur) content.exercises = cur.content.exercises || [];
    if (content.exercises.length < 3) content.exercises = C.templateLesson(topic, lang).exercises;
    for (const k of ['objectives', 'section', 'seedNote']) if (cur && cur.content[k] && !content[k]) content[k] = cur.content[k];
    content.editedBy = String(req.user.name || '').slice(0, 80); content.editedAt = nowIso();
    if (!content.theory.length) throw httpErr(400, 'bad_request');
    const stamp = saveLesson(topic, lang, content, 'teacher', null, null);
    res.json({ ok: true, stamp, source: 'teacher' });
  }));
  app.get('/api/lesson/:id/history', auth('teacher'), (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const lang = LANGS.includes(req.query.lang) ? req.query.lang : req.lang;
    res.json({ items: db.all('SELECT stamp FROM lesson_hist WHERE topic_id = ? AND lang = ? ORDER BY stamp DESC LIMIT 20', [topic.id, lang]).map(r => r.stamp) });
  });
  /* Қосымша жаттығулар (AI) */
  app.post('/api/lesson/:id/practice', auth(), wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang; const n = Math.max(3, Math.min(8, +b.n || 5));
    const level = ['easy', 'medium', 'hard'].includes(b.level) ? b.level : 'mixed';
    const cur = cachedLesson(topic.id, lang);
    try {
      const r = await ai.complete(C.practicePrompt(topic, lang, n, level, cur && cur.content), { json: true, temperature: 0.7, tier: 'quality', timeoutMs: 60000,
        validate: (txt) => { const o = C.parseJson(txt); const list = (Array.isArray(o) ? o : o.problems || o.exercises || []).map(C.validEx).filter(x => x && ['quiz', 'fill', 'tf'].includes(x.type)); if (list.length < 2) throw new Error('too few problems'); return list; } });
      res.json({ problems: r.value.slice(0, n), model: r.model });
    } catch (e) { res.status(503).json({ error: I.t(lang, ai.errKey(e)), key: ai.errKey(e) }); }
  }));
  /* Қате жауапты түсіндіру (ағынды) */
  app.post('/api/lesson/:id/explain', auth(), wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    let ex = null;
    if (b.ex && typeof b.ex === 'object') ex = C.validEx(b.ex);
    else { const cur = cachedLesson(topic.id, lang, b.stamp); ex = cur && cur.content.exercises[+b.i]; }
    if (!ex) throw httpErr(400, 'bad_request');
    if (!ai.status().enabled) throw httpErr(503, 'ai_off');
    const send = sseStart(res); const ctrl = new AbortController(); res.on('close', () => { if (!res.writableEnded) ctrl.abort(); });
    const ck = 'x:' + ai.hashKey([topic.id, lang, ex.q, b.given]); const hit = ai.cacheGet(ck);
    if (hit) { send('delta', { t: hit.reply }); send('done', { cached: true }); res.end(); return; }
    let full = '';
    try { const r = await ai.stream(C.explainPrompt(topic, lang, ex, b.given, req.user), { signal: ctrl.signal, tier: 'fast', temperature: 0.3, firstTokenMs: 20000,
        onDelta: (t) => { full += t; send('delta', { t }); }, onRetry: (x) => send('retry', x) });
      ai.cachePut(ck, { reply: r.text, model: r.model }); send('done', { model: r.model });
    } catch (e) { if (!e.aborted) send('error', { error: I.t(lang, ai.errKey(e)), key: ai.errKey(e) }); }
    finally { if (!res.writableEnded) res.end(); }
  }));
  app.get('/api/ai/health', auth(), (req, res) => res.json(ai.health()));
  app.post('/api/lesson/:id/submit', auth(), wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    const cur = cachedLesson(topic.id, lang, b.stamp); if (!cur) throw httpErr(400, 'lesson_first');
    const g = C.grade(cur.content, Array.isArray(b.answers) ? b.answers : []);
    let assignmentId = null;
    if (b.assignment_id) { const a = db.get('SELECT a.* FROM assignments a JOIN class_members m ON m.class_id = a.class_id WHERE a.id = ? AND m.student_id = ?', [+b.assignment_id, req.user.id]); if (a && a.topic_id === topic.id) assignmentId = a.id; }
    const prev = db.get('SELECT * FROM progress WHERE user_id = ? AND topic_id = ?', [req.user.id, topic.id]);
    const combo = Math.max(0, Math.min(10, +b.best_combo || 0));
    let xp = Math.round(g.score * 10) + g.stars * 10 + combo * 2 + (!prev ? 20 : 0);
    if (prev && prev.best_percent >= 100) xp = Math.round(xp / 3);
    const time = Math.max(0, Math.min(3600000, +b.time_ms || 0));
    const mode = ['classic', 'boss', 'speed'].includes(b.mode) ? b.mode : 'classic';
    const { id } = db.run('INSERT INTO results(user_id, topic_id, assignment_id, lang, score, total, percent, mark, stars, xp, details, time_ms, created_at, mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, topic.id, assignmentId, lang, g.score, g.total, g.percent, g.mark, g.stars, xp, JSON.stringify(g.per), time, nowIso(), mode]);
    if (prev) db.run('UPDATE progress SET best_percent = MAX(best_percent, ?), stars = MAX(stars, ?), attempts = attempts + 1, last_at = ? WHERE user_id = ? AND topic_id = ?', [g.percent, g.stars, nowIso(), req.user.id, topic.id]);
    else db.run('INSERT INTO progress(user_id, topic_id, best_percent, stars, attempts, last_at) VALUES (?,?,?,?,1,?)', [req.user.id, topic.id, g.percent, g.stars, nowIso()]);
    const { nu, before } = awardXp(req.user, xp);
    const review = cur.content.exercises.map((ex, i) => ({ ok: g.per[i], correct: ex.type === 'quiz' ? ex.options[ex.answer] : ex.type === 'tf' ? ex.answer : ex.type === 'fill' ? ex.answer : ex.type === 'match' ? ex.pairs.map(p => p.join(' → ')).join('; ') : ex.items.join(' → '), explain: ex.explain || '' }));
    res.json({ result: { id, ...g, xp, assignment_id: assignmentId }, review, user: pub(nu), levelUp: levelOf(nu.xp) > before });
  }));
  /* ---------- v2: ойын режимдері, 3D зертхана, басқару тақтасы ---------- */
  app.post('/api/lesson/:id/submit-mode', auth(), wrap(async (req, res) => {
    const topic = TOPICS.get(CAT.resolveId(req.params.id)); if (!topic) throw httpErr(404, 'topic_nf');
    const b = req.body || {}; const mode = /^[a-z_]{3,20}$/.test(String(b.mode || '')) && !['classic', 'boss', 'speed'].includes(b.mode) ? b.mode : null; if (!mode) throw httpErr(400, 'bad_request');
    const total = Math.max(1, Math.min(50, Math.round(+b.total || 0))); const score = Math.max(0, Math.min(total, +b.score || 0));
    const percent = Math.round(score / total * 100); const mark = C.markOf(percent); const stars = C.starsOf(percent);
    const time = Math.max(0, Math.min(3600000, +b.time_ms || 0));
    const today = db.get("SELECT COUNT(*) AS n FROM results WHERE user_id = ? AND topic_id = ? AND mode = ? AND created_at >= ?", [req.user.id, topic.id, mode, dayStart(0)]);
    let xp = Math.round(percent / 10) + stars * 5; if (today && today.n >= 3) xp = Math.round(xp / 4);
    const { id } = db.run('INSERT INTO results(user_id, topic_id, assignment_id, lang, score, total, percent, mark, stars, xp, details, time_ms, created_at, mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, topic.id, null, LANGS.includes(b.lang) ? b.lang : req.lang, score, total, percent, mark, stars, xp, null, time, nowIso(), mode]);
    const prev = db.get('SELECT * FROM progress WHERE user_id = ? AND topic_id = ?', [req.user.id, topic.id]);
    if (prev) db.run('UPDATE progress SET best_percent = MAX(best_percent, ?), stars = MAX(stars, ?), attempts = attempts + 1, last_at = ? WHERE user_id = ? AND topic_id = ?', [percent, stars, nowIso(), req.user.id, topic.id]);
    else db.run('INSERT INTO progress(user_id, topic_id, best_percent, stars, attempts, last_at) VALUES (?,?,?,?,1,?)', [req.user.id, topic.id, percent, stars, nowIso()]);
    const { nu, before } = awardXp(req.user, xp);
    res.json({ result: { id, score, total, percent, mark, stars, xp, mode }, user: pub(nu), levelUp: levelOf(nu.xp) > before });
  }));
  app.post('/api/lab/visit', auth(), wrap(async (req, res) => {
    const lab = String((req.body || {}).lab || '').replace(/[^a-z0-9-]/g, '').slice(0, 40); if (!lab) throw httpErr(400, 'bad_request');
    const ex = db.get('SELECT * FROM lab_visits WHERE user_id = ? AND lab_id = ?', [req.user.id, lab]);
    if (ex) db.run('UPDATE lab_visits SET visits = visits + 1, last_at = ? WHERE user_id = ? AND lab_id = ?', [nowIso(), req.user.id, lab]);
    else db.run('INSERT INTO lab_visits(user_id, lab_id, visits, last_at) VALUES (?,?,1,?)', [req.user.id, lab, nowIso()]);
    res.json({ ok: true, first: !ex });
  }));
  app.post('/api/lab/task', auth(), wrap(async (req, res) => {
    const b = req.body || {}; const lab = String(b.lab || '').replace(/[^a-z0-9-]/g, '').slice(0, 40); const key = String(b.key || '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 60);
    if (!lab || !key) throw httpErr(400, 'bad_request');
    let xp = 0;
    if (b.ok && !db.get('SELECT 1 AS x FROM lab_tasks WHERE user_id = ? AND lab_id = ? AND task_key = ?', [req.user.id, lab, key])) {
      const n = db.get("SELECT COUNT(*) AS n FROM lab_tasks WHERE user_id = ? AND created_at >= ?", [req.user.id, dayStart(0)]).n;
      xp = n >= 40 ? 2 : 10; db.run('INSERT INTO lab_tasks(user_id, lab_id, task_key, xp, created_at) VALUES (?,?,?,?,?)', [req.user.id, lab, key, xp, nowIso()]);
    }
    if (!xp) return res.json({ xp: 0, user: pub(req.user) });
    const { nu, before } = awardXp(req.user, xp); res.json({ xp, user: pub(nu), levelUp: levelOf(nu.xp) > before });
  }));
  const BADGES = [
    ['first_game', '🎮', (s) => s.games >= 1], ['ten_games', '🕹️', (s) => s.games >= 10], ['fifty_games', '👾', (s) => s.games >= 50],
    ['perfect', '💯', (s) => s.perfect >= 1], ['perfect5', '🏆', (s) => s.perfect >= 5], ['three_stars', '⭐', (s) => s.threeStars >= 1],
    ['streak3', '🔥', (s) => s.bestStreak >= 3], ['streak7', '☄️', (s) => s.bestStreak >= 7], ['lvl5', '🏅', (s) => s.level >= 5], ['lvl10', '👑', (s) => s.level >= 10],
    ['lab1', '🔬', (s) => s.labs >= 1], ['lab5', '🧪', (s) => s.labs >= 5], ['lab_all', '🚀', (s) => s.labs >= 16], ['lab_tasks10', '🧠', (s) => s.labTasks >= 10],
    ['boss', '🐉', (s) => s.boss >= 1], ['speed', '⚡', (s) => s.speed >= 1], ['memory', '🃏', (s) => s.memory >= 1], ['words', '🔤', (s) => s.words >= 1],
    ['subjects3', '🌈', (s) => s.subjects >= 3], ['bolat', '🦅', (s) => s.bolat >= 1]];
  function userStats(u) {
    const g = db.get("SELECT COUNT(*) AS games, SUM(CASE WHEN percent = 100 THEN 1 ELSE 0 END) AS perfect, SUM(CASE WHEN stars >= 3 THEN 1 ELSE 0 END) AS ts, SUM(CASE WHEN mode='boss' AND percent >= 65 THEN 1 ELSE 0 END) AS boss, SUM(CASE WHEN mode='speed' THEN 1 ELSE 0 END) AS speed, SUM(CASE WHEN mode='memory' THEN 1 ELSE 0 END) AS memory, SUM(CASE WHEN mode='words' THEN 1 ELSE 0 END) AS words FROM results WHERE user_id = ?", [u.id]);
    const subj = new Set(db.all('SELECT DISTINCT topic_id FROM progress WHERE user_id = ?', [u.id]).map(r => r.topic_id.split('-')[0]));
    return { games: g.games || 0, perfect: g.perfect || 0, threeStars: g.ts || 0, boss: g.boss || 0, speed: g.speed || 0, memory: g.memory || 0, words: g.words || 0,
      bestStreak: u.best_streak || 0, level: levelOf(u.xp), labs: db.get('SELECT COUNT(*) AS n FROM lab_visits WHERE user_id = ?', [u.id]).n,
      labTasks: db.get('SELECT COUNT(*) AS n FROM lab_tasks WHERE user_id = ?', [u.id]).n, subjects: subj.size,
      bolat: db.get('SELECT COUNT(*) AS n FROM bolat_chats WHERE user_id = ?', [u.id]).n };
  }
  app.get('/api/dashboard', auth(), (req, res) => {
    const u = req.user; const st = userStats(u);
    const days = []; for (let i = 6; i >= 0; i--) days.push(localDay(new Date(Date.now() - i * 864e5)));
    const xpBy = {}; const since = dayStart(6);
    for (const r of db.all('SELECT created_at, xp FROM results WHERE user_id = ? AND created_at >= ?', [u.id, since]).concat(db.all('SELECT created_at, xp FROM lab_tasks WHERE user_id = ? AND created_at >= ?', [u.id, since]))) { const d = localDay(new Date(r.created_at)); xpBy[d] = (xpBy[d] || 0) + r.xp; }
    const week = days.map(d => ({ day: d, xp: xpBy[d] || 0 }));
    const cont = db.all('SELECT * FROM progress WHERE user_id = ? ORDER BY last_at DESC LIMIT 4', [u.id]).map(p => ({ ...p, topic: TOPICS.get(p.topic_id) || null })).filter(p => p.topic);
    const labs = db.all('SELECT lab_id, visits, last_at FROM lab_visits WHERE user_id = ? ORDER BY last_at DESC LIMIT 6', [u.id]);
    const badges = BADGES.map(([id, icon, fn]) => ({ id, icon, got: !!fn(st) }));
    const boards = (u.role === 'student' ? db.all('SELECT c.id, c.name FROM classes c JOIN class_members m ON m.class_id = c.id WHERE m.student_id = ?', [u.id]) : db.all('SELECT id, name FROM classes WHERE teacher_id = ?', [u.id])).map(c => {
      const users = db.all('SELECT u.* FROM users u JOIN class_members m ON m.student_id = u.id WHERE m.class_id = ?', [c.id]).map(x => {
        const w = db.get('SELECT COALESCE(SUM(xp), 0) AS x FROM results WHERE user_id = ? AND created_at >= ?', [x.id, since]).x + db.get('SELECT COALESCE(SUM(xp), 0) AS x FROM lab_tasks WHERE user_id = ? AND created_at >= ?', [x.id, since]).x;
        return { ...pub(x), week_xp: w };
      }).sort((a, b) => b.week_xp - a.week_xp || b.xp - a.xp);
      return { id: c.id, name: c.name, users };
    });
    res.json({ goal: u.daily_goal || 60, today_xp: week[6].xp, week, stats: st, continue: cont, labs, badges, boards });
  });

  app.get('/api/results/me', auth(), (req, res) => {
    const rows = db.all('SELECT * FROM results WHERE user_id = ? ORDER BY id DESC LIMIT 100', [req.user.id]);
    res.json({ results: rows.map(r => ({ ...r, details: undefined, topic: TOPICS.get(r.topic_id) || null })) });
  });

  /* ---------- сыныптар ---------- */
  const classFor = (req, id) => { const c = db.get('SELECT * FROM classes WHERE id = ?', [+id]); if (!c) throw httpErr(404, 'not_found');
    if (req.user.role === 'teacher' ? c.teacher_id !== req.user.id : !db.get('SELECT 1 AS x FROM class_members WHERE class_id = ? AND student_id = ?', [c.id, req.user.id])) throw httpErr(403, 'forbidden'); return c; };
  app.get('/api/classes', auth(), (req, res) => {
    const rows = req.user.role === 'teacher'
      ? db.all('SELECT c.*, (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id) AS n_students, (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id) AS n_assign FROM classes c WHERE teacher_id = ? ORDER BY c.id DESC', [req.user.id])
      : db.all('SELECT c.*, u.name AS teacher_name, u.id AS teacher_uid, (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id) AS n_students FROM classes c JOIN class_members m ON m.class_id = c.id JOIN users u ON u.id = c.teacher_id WHERE m.student_id = ? ORDER BY c.id DESC', [req.user.id]);
    res.json({ classes: rows });
  });
  app.post('/api/classes', auth('teacher'), wrap(async (req, res) => {
    const b = req.body || {}; const name = String(b.name || '').trim().slice(0, 80); if (!name) throw httpErr(400, 'class_name');
    let code; do { code = genJoin(); } while (db.get('SELECT id FROM classes WHERE join_code = ?', [code]));
    const { id } = db.run('INSERT INTO classes(teacher_id, name, grade, subject, join_code) VALUES (?,?,?,?,?)', [req.user.id, name, +b.grade || null, SUBJECTS[b.subject] ? b.subject : null, code]);
    res.json({ class: db.get('SELECT * FROM classes WHERE id = ?', [id]) });
  }));
  app.post('/api/classes/join', auth('student'), wrap(async (req, res) => {
    const c = db.get('SELECT * FROM classes WHERE join_code = ?', [String((req.body || {}).code || '').trim().toUpperCase()]); if (!c) throw httpErr(404, 'class_code_bad');
    db.run('INSERT OR IGNORE INTO class_members(class_id, student_id) VALUES (?,?)', [c.id, req.user.id]); res.json({ class: c });
  }));
  app.get('/api/classes/:id', auth(), wrap(async (req, res) => {
    const c = classFor(req, req.params.id);
    const teacher = pub(db.get('SELECT * FROM users WHERE id = ?', [c.teacher_id]));
    const students = db.all('SELECT u.* FROM users u JOIN class_members m ON m.student_id = u.id WHERE m.class_id = ? ORDER BY u.xp DESC, u.name', [c.id]).map(pub);
    const assigns = db.all('SELECT * FROM assignments WHERE class_id = ? ORDER BY id DESC', [c.id]).map(a => {
      const mine = req.user.role === 'student' ? db.get('SELECT MAX(percent) AS best, MAX(mark) AS mark, COUNT(*) AS n FROM results WHERE assignment_id = ? AND user_id = ?', [a.id, req.user.id]) : null;
      const done = db.get('SELECT COUNT(DISTINCT user_id) AS n FROM results WHERE assignment_id = ?', [a.id]).n;
      return { ...a, topic: TOPICS.get(a.topic_id) || null, done, mine: mine && mine.n ? mine : null };
    });
    const ann = db.all('SELECT * FROM announcements WHERE class_id = ? ORDER BY id DESC LIMIT 50', [c.id]);
    res.json({ class: c, teacher, students, assignments: assigns, announcements: ann });
  }));
  app.delete('/api/classes/:id/members/:sid', auth('teacher'), wrap(async (req, res) => { const c = classFor(req, req.params.id); db.run('DELETE FROM class_members WHERE class_id = ? AND student_id = ?', [c.id, +req.params.sid]); res.json({ ok: true }); }));
  app.post('/api/classes/:id/assignments', auth('teacher'), wrap(async (req, res) => {
    const c = classFor(req, req.params.id); const b = req.body || {}; const t = TOPICS.get(b.topic_id); if (!t) throw httpErr(400, 'topic_nf');
    const kind = ['homework', 'classwork', 'test'].includes(b.kind) ? b.kind : 'homework';
    const title = String(b.title || '').trim().slice(0, 160) || tTitle(t, req.lang);
    const { id } = db.run('INSERT INTO assignments(class_id, title, topic_id, kind, note, due_at, created_at) VALUES (?,?,?,?,?,?,?)', [c.id, title, t.id, kind, String(b.note || '').slice(0, 1000), b.due_at ? String(b.due_at).slice(0, 20) : null, nowIso()]);
    res.json({ assignment: db.get('SELECT * FROM assignments WHERE id = ?', [id]) });
  }));
  app.delete('/api/assignments/:id', auth('teacher'), wrap(async (req, res) => {
    const a = db.get('SELECT * FROM assignments WHERE id = ?', [+req.params.id]); if (!a) throw httpErr(404, 'not_found'); classFor(req, a.class_id);
    db.run('DELETE FROM assignments WHERE id = ?', [a.id]); res.json({ ok: true });
  }));
  app.get('/api/assignments', auth('student'), (req, res) => {
    const rows = db.all('SELECT a.*, c.name AS class_name FROM assignments a JOIN class_members m ON m.class_id = a.class_id JOIN classes c ON c.id = a.class_id WHERE m.student_id = ? ORDER BY a.id DESC LIMIT 100', [req.user.id]);
    res.json({ assignments: rows.map(a => { const r = db.get('SELECT MAX(percent) AS best, MAX(mark) AS mark, COUNT(*) AS n FROM results WHERE assignment_id = ? AND user_id = ?', [a.id, req.user.id]);
      return { ...a, topic: TOPICS.get(a.topic_id) || null, mine: r.n ? r : null }; }) });
  });
  app.get('/api/classes/:id/gradebook', auth('teacher'), wrap(async (req, res) => {
    const c = classFor(req, req.params.id);
    const students = db.all('SELECT u.* FROM users u JOIN class_members m ON m.student_id = u.id WHERE m.class_id = ? ORDER BY u.name', [c.id]);
    const assigns = db.all('SELECT * FROM assignments WHERE class_id = ? ORDER BY id', [c.id]);
    const cells = {};
    for (const r of db.all('SELECT assignment_id, user_id, MAX(percent) AS best, COUNT(*) AS n, MAX(created_at) AS last FROM results WHERE assignment_id IN (SELECT id FROM assignments WHERE class_id = ?) GROUP BY assignment_id, user_id', [c.id]))
      cells[r.user_id + ':' + r.assignment_id] = { percent: r.best, mark: C.markOf(r.best), attempts: r.n, last: r.last };
    const rows = students.map(s => { const marks = assigns.map(a => cells[s.id + ':' + a.id] || null); const got = marks.filter(Boolean);
      const avgP = got.length ? Math.round(got.reduce((x, m) => x + m.percent, 0) / got.length) : null;
      const practice = db.get('SELECT COUNT(*) AS n, AVG(percent) AS p FROM results WHERE user_id = ?', [s.id]);
      return { student: pub(s), marks, avg_percent: avgP, avg_mark: got.length ? Math.round(got.reduce((x, m) => x + m.mark, 0) / got.length * 10) / 10 : null, games: practice.n, games_avg: practice.p ? Math.round(practice.p) : null }; });
    res.json({ class: c, assignments: assigns.map(a => ({ ...a, topic: TOPICS.get(a.topic_id) || null })), rows });
  }));
  app.get('/api/students/:id/results', auth('teacher'), wrap(async (req, res) => {
    const ok = db.get('SELECT 1 AS x FROM class_members m JOIN classes c ON c.id = m.class_id WHERE m.student_id = ? AND c.teacher_id = ?', [+req.params.id, req.user.id]); if (!ok) throw httpErr(403, 'forbidden');
    const s = db.get('SELECT * FROM users WHERE id = ?', [+req.params.id]);
    res.json({ student: pub(s), results: db.all('SELECT * FROM results WHERE user_id = ? ORDER BY id DESC LIMIT 100', [s.id]).map(r => ({ ...r, details: undefined, topic: TOPICS.get(r.topic_id) || null })) });
  }));

  /* ---------- хабарламалар ---------- */
  function contactsOf(u) {
    return u.role === 'teacher'
      ? db.all('SELECT DISTINCT u.* FROM users u JOIN class_members m ON m.student_id = u.id JOIN classes c ON c.id = m.class_id WHERE c.teacher_id = ?', [u.id])
      : db.all('SELECT DISTINCT u.* FROM users u JOIN classes c ON c.teacher_id = u.id JOIN class_members m ON m.class_id = c.id WHERE m.student_id = ?', [u.id]);
  }
  const canTalk = (u, otherId) => contactsOf(u).some(x => x.id === otherId);
  app.get('/api/contacts', auth(), (req, res) => {
    const list = contactsOf(req.user).map(c => {
      const last = db.get('SELECT * FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY id DESC LIMIT 1', [req.user.id, c.id, c.id, req.user.id]);
      const unread = db.get('SELECT COUNT(*) AS n FROM messages WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL', [c.id, req.user.id]).n;
      const q = db.get("SELECT COUNT(*) AS n FROM messages WHERE sender_id = ? AND recipient_id = ? AND kind = 'question' AND read_at IS NULL", [c.id, req.user.id]).n;
      return { user: pub(c), last, unread, questions: q };
    }).sort((a, b) => (b.last ? b.last.id : 0) - (a.last ? a.last.id : 0));
    res.json({ contacts: list });
  });
  app.get('/api/messages/:uid', auth(), wrap(async (req, res) => {
    const other = +req.params.uid; if (!canTalk(req.user, other)) throw httpErr(403, 'no_contact');
    const after = +req.query.after || 0;
    const rows = db.all('SELECT * FROM messages WHERE ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)) AND id > ? ORDER BY id DESC LIMIT 200', [req.user.id, other, other, req.user.id, after]).reverse();
    db.run('UPDATE messages SET read_at = ? WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL', [nowIso(), other, req.user.id]);
    res.json({ user: pub(db.get('SELECT * FROM users WHERE id = ?', [other])), messages: rows.map(m => ({ ...m, topic: m.topic_id ? TOPICS.get(m.topic_id) || null : null })) });
  }));
  app.post('/api/messages/:uid', auth(), wrap(async (req, res) => {
    const other = +req.params.uid; if (!canTalk(req.user, other)) throw httpErr(403, 'no_contact');
    const b = req.body || {}; const body = String(b.body || '').trim().slice(0, 4000); if (!body) throw httpErr(400, 'msg_empty');
    const kind = b.kind === 'question' && req.user.role === 'student' ? 'question' : 'msg';
    const topic = b.topic_id && TOPICS.has(b.topic_id) ? b.topic_id : null;
    const { id } = db.run('INSERT INTO messages(sender_id, recipient_id, body, kind, topic_id, created_at) VALUES (?,?,?,?,?,?)', [req.user.id, other, body, kind, topic, nowIso()]);
    res.json({ message: db.get('SELECT * FROM messages WHERE id = ?', [id]) });
  }));
  app.post('/api/classes/:id/announcements', auth('teacher'), wrap(async (req, res) => {
    const c = classFor(req, req.params.id); const body = String((req.body || {}).body || '').trim().slice(0, 4000); if (!body) throw httpErr(400, 'msg_empty');
    const { id } = db.run('INSERT INTO announcements(class_id, teacher_id, body, created_at) VALUES (?,?,?,?)', [c.id, req.user.id, body, nowIso()]);
    res.json({ announcement: db.get('SELECT * FROM announcements WHERE id = ?', [id]) });
  }));
  app.get('/api/announcements', auth(), (req, res) => {
    const rows = req.user.role === 'teacher'
      ? db.all('SELECT a.*, c.name AS class_name FROM announcements a JOIN classes c ON c.id = a.class_id WHERE c.teacher_id = ? ORDER BY a.id DESC LIMIT 50', [req.user.id])
      : db.all('SELECT a.*, c.name AS class_name, u.name AS teacher_name, (SELECT 1 FROM announcement_reads r WHERE r.announcement_id = a.id AND r.user_id = ?) AS is_read FROM announcements a JOIN classes c ON c.id = a.class_id JOIN class_members m ON m.class_id = c.id JOIN users u ON u.id = a.teacher_id WHERE m.student_id = ? ORDER BY a.id DESC LIMIT 50', [req.user.id, req.user.id]);
    res.json({ announcements: rows });
  });
  app.post('/api/announcements/read', auth(), (req, res) => {
    for (const a of db.all('SELECT a.id FROM announcements a JOIN class_members m ON m.class_id = a.class_id WHERE m.student_id = ?', [req.user.id]))
      db.run('INSERT OR IGNORE INTO announcement_reads(announcement_id, user_id, read_at) VALUES (?,?,?)', [a.id, req.user.id, nowIso()]);
    res.json({ ok: true });
  });
  app.get('/api/unread', auth(), (req, res) => {
    const m = db.get('SELECT COUNT(*) AS n FROM messages WHERE recipient_id = ? AND read_at IS NULL', [req.user.id]).n;
    const q = db.get("SELECT COUNT(*) AS n FROM messages WHERE recipient_id = ? AND read_at IS NULL AND kind = 'question'", [req.user.id]).n;
    const a = req.user.role === 'student' ? db.get('SELECT COUNT(*) AS n FROM announcements a JOIN class_members m ON m.class_id = a.class_id WHERE m.student_id = ? AND NOT EXISTS (SELECT 1 FROM announcement_reads r WHERE r.announcement_id = a.id AND r.user_id = ?)', [req.user.id, req.user.id]).n : 0;
    const due = req.user.role === 'student' ? db.get('SELECT COUNT(*) AS n FROM assignments a JOIN class_members m ON m.class_id = a.class_id WHERE m.student_id = ? AND NOT EXISTS (SELECT 1 FROM results r WHERE r.assignment_id = a.id AND r.user_id = ?)', [req.user.id, req.user.id]).n : 0;
    res.json({ messages: m, questions: q, announcements: a, assignments: due });
  });
  app.get('/api/leaderboard', auth(), (req, res) => {
    const ids = req.user.role === 'teacher'
      ? db.all('SELECT DISTINCT m.student_id AS id FROM class_members m JOIN classes c ON c.id = m.class_id WHERE c.teacher_id = ?', [req.user.id])
      : db.all('SELECT DISTINCT m2.student_id AS id FROM class_members m JOIN class_members m2 ON m2.class_id = m.class_id WHERE m.student_id = ?', [req.user.id]);
    const set = new Set(ids.map(r => r.id)); if (req.user.role === 'student') set.add(req.user.id);
    const users = [...set].map(id => db.get('SELECT * FROM users WHERE id = ?', [id])).filter(Boolean).sort((a, b) => b.xp - a.xp).slice(0, 30).map(pub);
    res.json({ users });
  });

  /* ---------- Болат (Сократтық көмекші) ---------- */
  require('./bolat')({ app, db, auth, wrap, httpErr, nowIso, ai, TOPICS, SUBJECTS, tTitle, DATA_DIR, I });

  /* ---------- v3: ҰБТ · PISA · Олимпиада ---------- */
  require('./exams')(app, { db, auth, wrap, httpErr, ai, I, awardXp, pub, nowIso, LANGS, CAT });

  /* ---------- v4: аналитика, есептер, медиа ---------- */
  require('./v4')(app, { db, auth, wrap, httpErr, nowIso, TOPICS, SUBJECTS, tTitle, pub, C, levelOf, localDay, dayStart });

  /* ---------- статика ---------- */
  prod.routes(app, { db, auth, wrap, httpErr, nowIso, ai, sms, I, DATA_DIR, DB_FILE, VERSION, bcrypt, setSession, CAT, normPhone, LANGS });
  const PUB = path.join(__dirname, '..', 'public');
  const APP_CSP = ["default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "connect-src 'self'", "media-src 'self' blob: data:", 'frame-src ' + require('./v4').FRAME_HOSTS.join(' '), "worker-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'"].join('; ');
  // SPA /app/ астында; түбір (/) — жария SEO беті (server/site.js)
  app.get(/^\/app(\/.*)?$/, (req, res) => { if (req.path === '/app') return res.redirect(301, '/app/'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Content-Security-Policy', APP_CSP); res.sendFile(path.join(PUB, 'index.html')); });
  app.use(express.static(PUB, { index: false, setHeaders: (res, p) => { if (/\.(js|css|html)$/.test(p)) res.setHeader('Cache-Control', 'no-cache'); else if (/\.(png|svg|woff2?)$/.test(p)) res.setHeader('Cache-Control', 'public, max-age=604800'); if (/[\\/]vendor[\\/]/.test(p)) res.setHeader('Cache-Control', 'public, max-age=2592000'); } }));
  app.use((req, res, next) => (req.path.startsWith('/api/') || req.method !== 'GET' ? next() : require('./site').notFound(req, res)));
  app.use((err, req, res, next) => {
    const st = err.status || (err.type === 'entity.too.large' ? 413 : 500);
    if (st >= 500 && !err.key) console.error(err);
    res.status(st).json({ error: err.key ? I.t(req.lang, err.key, err.vars) : (st === 413 ? I.t(req.lang, 'img_bad') : String(err.message || 'Error')), code: err.key || err.code || null });
  });

  // демо деректер (бос база болса)
  // демо деректер: әзірлеуде — бос базаға; өндірісте — тек SEED_DEMO=1 болса (мысалы, Google Play тексерушісіне DEMO_PASSWORD-пен)
  if (CFG.SEED_DEMO && (CFG.IS_PROD ? !db.get("SELECT id FROM users WHERE phone = '+77000000001'") : !db.get('SELECT id FROM users LIMIT 1'))) { try { await require('../scripts/seed').seed(db); console.log('Демо деректер жасалды.'); } catch (e) { console.warn('seed:', e.message); } }

  if (CFG.DEMO_PASSWORD && CFG.DEMO_PASSWORD.length >= 8) { db.run('UPDATE users SET pass_hash = ? WHERE is_demo = 1', [bcrypt.hashSync(CFG.DEMO_PASSWORD, 10)]); db.run('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE is_demo = 1)'); }
  if (CFG.ADMIN_PHONES.length) db.run(`UPDATE users SET is_admin = 1 WHERE phone IN (${CFG.ADMIN_PHONES.map(() => '?').join(',')})`, CFG.ADMIN_PHONES);
  if (CFG.IS_PROD && sms.isDev()) console.warn(CFG.ALLOW_DEV_SMS ? '  ⚠ ALLOW_DEV_SMS=1: SMS коды экранда көрсетіледі (тек сынақ үшін!)' : '  ⚠ SMS провайдері бапталмаған: тіркелу жабық (SMS_PROVIDER=mobizon ...). Әкімшіні /setup арқылы жасаңыз.');
  app.listen(PORT, HOST, () => {
    const st = CAT.stats(); const a = ai.status();
    console.log(`\n  ✨ AI-bolat v${VERSION} іске қосылды`);
    console.log(`  Бұл компьютерде:  http://localhost:${PORT}`);
    for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal) console.log(`  Wi-Fi/LAN:        http://${n.address}:${PORT}`);
    console.log(`  Каталог: ${st.subjects} пән, ${st.lists} пән-сынып, ${st.topics} тақырып`);
    console.log(`  AI: ${a.enabled ? 'қосулы (' + a.model + ')' : 'өшірулі — .env ішіне AI_API_KEY жазыңыз'}`);
    console.log(`  SMS: ${sms.isDev() ? (CFG.ALLOW_DEV_SMS ? 'DEV режимі (код экранда көрсетіледі)' : 'бапталмаған') : sms.provider()}`);
    console.log(`  Режим: ${CFG.IS_PROD ? 'production' : 'development'} · ${CFG.PUBLIC_URL}\n`);
  });
}
main().catch(e => { console.error(e); process.exit(1); });
