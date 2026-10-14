'use strict';
/* AI-bolat — өндіріске дайындық: қауіпсіздік тақырыптары, шектеулер, health, әкімші, шағым (AI мазмұны),
   аккаунтты жою, алғашқы әкімшіні орнату, резервтік көшірме, assetlinks, robots/sitemap/manifest. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const CFG = require('./config');

/* ---------- қарапайым жад-шектеуіш (sliding window) ---------- */
function limiter() {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) { if (!v.length || now - v[v.length - 1] > 864e5) hits.delete(k); } }, 600000).unref();
  return (key, max, windowMs) => { if (!max || max <= 0) return true; const now = Date.now(); const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) { hits.set(key, arr); return false; } arr.push(now); hits.set(key, arr); return true; };
}
const AI_PATH = /^\/api\/(lesson\/[^/]+\/(generate|practice|explain)|bolat\/chats\/[^/]+\/stream|exam\/generate)$/;

function early(app, D) {
  const { httpErr } = D; const hit = limiter();
  app.set('trust proxy', CFG.TRUST_PROXY);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(self), payment=()');
    if (CFG.IS_PROD && CFG.HTTPS) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    // http → https (прокси артында)
    if (CFG.IS_PROD && CFG.HTTPS && req.headers['x-forwarded-proto'] === 'http' && req.method === 'GET' && req.path !== '/healthz') return res.redirect(301, CFG.PUBLIC_URL + req.originalUrl);
    next();
  });
  app.use('/api', (req, res, next) => { if (!hit('ip:' + req.ip, CFG.RATE_PER_MIN, 60000)) return next(httpErr(429, 'too_many')); next(); });
  // AI шектеуі: пайдаланушыға минутына / тәулігіне
  app.use((req, res, next) => {
    const isAi = (req.method === 'POST' && AI_PATH.test(req.path)) || (req.method === 'GET' && /^\/api\/lesson\/[^/]+$/.test(req.path) && req.query.wait === '1');
    if (!isAi) return next();
    const who = req.user ? 'u:' + req.user.id : 'ip:' + req.ip;
    if (!hit('aim:' + who, CFG.AI_PER_MIN, 60000) || !hit('aid:' + who, CFG.AI_PER_DAY, 864e5)) return next(httpErr(429, 'ai_rate'));
    next();
  });
}

const isAdmin = (u) => !!(u && (u.is_admin || CFG.ADMIN_PHONES.includes(u.phone)));

function routes(app, D) {
  const { db, auth, wrap, httpErr, nowIso, ai, sms, I, DATA_DIR, DB_FILE, VERSION, bcrypt, setSession, CAT } = D;
  const t0 = Date.now();
  app.get('/healthz', (req, res) => { let ok = true; try { db.get('SELECT 1 AS x'); } catch (e) { ok = false; }
    res.status(ok ? 200 : 503).json({ ok, version: VERSION, uptime_s: Math.round((Date.now() - t0) / 1000), ai: ai.status().enabled, sms: sms.provider() }); });

  /* ---------- AI мазмұнына шағым (Google Play: AI-Generated Content саясаты) ---------- */
  app.post('/api/report', auth(), wrap(async (req, res) => {
    const b = req.body || {}; const kind = ['bolat', 'lesson', 'exam', 'practice', 'other'].includes(b.kind) ? b.kind : 'other';
    const reason = ['wrong', 'harmful', 'inappropriate', 'other'].includes(b.reason) ? b.reason : 'other';
    const recent = db.get('SELECT COUNT(*) AS n FROM reports WHERE user_id = ? AND created_at > ?', [req.user.id, new Date(Date.now() - 3600e3).toISOString()]).n;
    if (recent >= 20) throw httpErr(429, 'too_many');
    db.run('INSERT INTO reports(user_id, kind, ref, excerpt, reason, note, status, created_at) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, kind, String(b.ref || '').slice(0, 120), String(b.text || '').slice(0, 2000), reason, String(b.note || '').slice(0, 500), 'open', nowIso()]);
    res.json({ ok: true });
  }));

  /* ---------- аккаунтты жою (Google Play талабы) ---------- */
  app.post('/api/me/delete', auth(), wrap(async (req, res) => {
    const u = req.user; const b = req.body || {};
    if (!bcrypt.compareSync(String(b.password || ''), u.pass_hash)) throw httpErr(400, 'old_pass_bad');
    deleteUser(u.id);
    res.setHeader('Set-Cookie', `ab_sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${CFG.COOKIE_SECURE ? '; Secure' : ''}`); res.json({ ok: true });
  }));
  function deleteUser(uid) {
    const imgDir = path.join(DATA_DIR, 'bolat-images');
    for (const m of db.all('SELECT m.images FROM bolat_messages m JOIN bolat_chats c ON c.id = m.chat_id WHERE c.user_id = ? AND m.images IS NOT NULL', [uid]))
      try { for (const n of JSON.parse(m.images)) if (/^[a-f0-9]{24}\.(png|jpe?g|webp|gif)$/.test(n)) try { fs.unlinkSync(path.join(imgDir, n)); } catch (e) { /* */ } } catch (e) { /* */ }
    const q = (sql, p = [uid]) => { try { db.run(sql, p); } catch (e) { console.warn('delete:', e.message); } };
    q('DELETE FROM bolat_messages WHERE chat_id IN (SELECT id FROM bolat_chats WHERE user_id = ?)'); q('DELETE FROM bolat_chats WHERE user_id = ?');
    for (const c of db.all('SELECT id FROM classes WHERE teacher_id = ?', [uid])) {
      q('DELETE FROM class_members WHERE class_id = ?', [c.id]); q('DELETE FROM assignments WHERE class_id = ?', [c.id]);
      q('DELETE FROM announcement_reads WHERE announcement_id IN (SELECT id FROM announcements WHERE class_id = ?)', [c.id]); q('DELETE FROM announcements WHERE class_id = ?', [c.id]);
      q('DELETE FROM exam_assignments WHERE class_id = ?', [c.id]); q('DELETE FROM classes WHERE id = ?', [c.id]);
    }
    for (const sql of ['DELETE FROM sessions WHERE user_id = ?', 'DELETE FROM results WHERE user_id = ?', 'DELETE FROM progress WHERE user_id = ?', 'DELETE FROM class_members WHERE student_id = ?',
      'DELETE FROM announcement_reads WHERE user_id = ?', 'DELETE FROM lab_tasks WHERE user_id = ?', 'DELETE FROM lab_visits WHERE user_id = ?', 'DELETE FROM exam_attempts WHERE user_id = ?',
      'DELETE FROM exam_items_ai WHERE user_id = ?', 'DELETE FROM reports WHERE user_id = ?']) q(sql);
    q('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?', [uid, uid]);
    const ph = db.get('SELECT phone FROM users WHERE id = ?', [uid]); if (ph) q('DELETE FROM sms_codes WHERE phone = ?', [ph.phone]);
    q('DELETE FROM users WHERE id = ?'); db.saveNow();
  }

  /* ---------- алғашқы әкімші (SMS қосылмаса да) ---------- */
  const adminExists = () => !!db.get('SELECT id FROM users WHERE is_admin = 1 LIMIT 1') || (CFG.ADMIN_PHONES.length && !!db.get(`SELECT id FROM users WHERE phone IN (${CFG.ADMIN_PHONES.map(() => '?').join(',')}) LIMIT 1`, CFG.ADMIN_PHONES));
  app.get('/setup', (req, res) => {
    if (!CFG.ADMIN_SETUP_TOKEN || adminExists()) return res.status(404).type('html').send('<meta charset="utf-8"><p style="font-family:sans-serif">Not available / Қолжетімсіз.</p>');
    res.type('html').send(require('./site').setupPage());
  });
  app.post('/api/setup', wrap(async (req, res) => {
    const b = req.body || {};
    if (!CFG.ADMIN_SETUP_TOKEN || adminExists()) throw httpErr(410, 'forbidden');
    const a = Buffer.from(String(b.token || '')), e = Buffer.from(CFG.ADMIN_SETUP_TOKEN);
    if (a.length !== e.length || !crypto.timingSafeEqual(a, e)) throw httpErr(403, 'forbidden');
    const phone = D.normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_bad');
    const name = String(b.name || '').trim().slice(0, 80); if (name.length < 2) throw httpErr(400, 'name_req');
    const pass = String(b.password || ''); if (pass.length < 8) throw httpErr(400, 'pass_short');
    const ex = db.get('SELECT * FROM users WHERE phone = ?', [phone]); let id;
    if (ex) { db.run('UPDATE users SET is_admin = 1, pass_hash = ?, name = ? WHERE id = ?', [bcrypt.hashSync(pass, 10), name, ex.id]); id = ex.id; }
    else id = db.run('INSERT INTO users(role, name, phone, pass_hash, lang, avatar, is_admin) VALUES (?,?,?,?,?,?,1)', ['teacher', name, phone, bcrypt.hashSync(pass, 10), 'kk', '🧑‍🏫']).id;
    setSession(res, id); res.json({ ok: true });
  }));

  /* ---------- әкімші ---------- */
  const admin = (req, res, next) => { if (!req.user) return next(httpErr(401, 'auth')); if (!isAdmin(req.user)) return next(httpErr(403, 'forbidden')); next(); };
  app.get('/api/admin/overview', admin, wrap(async (req, res) => {
    const warnings = [];
    if (sms.isDev()) warnings.push(CFG.ALLOW_DEV_SMS ? 'sms_dev_on' : 'sms_not_configured');
    if (!ai.status().enabled) warnings.push('ai_off');
    if (CFG.IS_PROD && !CFG.HTTPS) warnings.push('no_https');
    if (CFG.DEMO_LOGIN && CFG.IS_PROD) warnings.push('demo_login_on');
    if (CFG.IS_PROD && /generativelanguage\.googleapis\.com/.test(String(process.env.AI_BASE_URL || ''))) warnings.push('gemini_minors_terms');
    if (CFG.CONTACT_EMAIL === 'support@example.com') warnings.push('contact_email');
    if (!CFG.ANDROID_CERT_SHA256.length && !defaultFingerprints().length) warnings.push('assetlinks');
    const c = (sql) => db.get(sql).n;
    res.json({ version: VERSION, prod: CFG.IS_PROD, public_url: CFG.PUBLIC_URL, warnings,
      counts: { teachers: c("SELECT COUNT(*) AS n FROM users WHERE role='teacher'"), students: c("SELECT COUNT(*) AS n FROM users WHERE role='student'"), classes: c('SELECT COUNT(*) AS n FROM classes'),
        results: c('SELECT COUNT(*) AS n FROM results'), exams: c('SELECT COUNT(*) AS n FROM exam_attempts'), bolat: c('SELECT COUNT(*) AS n FROM bolat_messages'), reports_open: c("SELECT COUNT(*) AS n FROM reports WHERE status='open'"),
        db_mb: Math.round((fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0) / 1048576 * 10) / 10 },
      sms: { provider: sms.provider(), dev: sms.isDev(), allow_dev: CFG.ALLOW_DEV_SMS }, ai: ai.health ? ai.health() : ai.status(), backups: listBackups() });
  }));
  app.get('/api/admin/reports', admin, (req, res) => res.json({ reports: db.all('SELECT r.*, u.name AS user_name, u.role AS user_role FROM reports r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.id DESC LIMIT 200') }));
  app.post('/api/admin/reports/:id', admin, (req, res) => { const st = ['open', 'resolved', 'dismissed'].includes((req.body || {}).status) ? req.body.status : 'resolved';
    db.run('UPDATE reports SET status = ? WHERE id = ?', [st, +req.params.id]); res.json({ ok: true }); });
  app.post('/api/admin/backup', admin, (req, res) => res.json({ file: makeBackup(), backups: listBackups() }));
  app.get('/api/admin/backup/download', admin, (req, res) => { db.saveNow(); res.setHeader('Content-Disposition', `attachment; filename="aibolat-${stamp()}.db"`); res.type('application/octet-stream').send(fs.readFileSync(DB_FILE)); });

  /* ---------- резервтік көшірме ---------- */
  const BK = path.join(DATA_DIR, 'backups');
  const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
  function listBackups() { try { return fs.readdirSync(BK).filter(f => f.endsWith('.db')).sort().reverse().map(f => ({ file: f, kb: Math.round(fs.statSync(path.join(BK, f)).size / 1024) })); } catch (e) { return []; } }
  function makeBackup() { db.saveNow(); fs.mkdirSync(BK, { recursive: true }); const f = `aibolat-${stamp()}.db`; fs.copyFileSync(DB_FILE, path.join(BK, f));
    const all = listBackups(); for (const b of all.slice(Math.max(1, CFG.BACKUP_KEEP))) try { fs.unlinkSync(path.join(BK, b.file)); } catch (e) { /* */ } return f; }
  if (CFG.BACKUP_HOURS > 0) { setTimeout(() => { try { makeBackup(); } catch (e) { console.warn('backup:', e.message); } }, 60000).unref();
    setInterval(() => { try { makeBackup(); } catch (e) { console.warn('backup:', e.message); } }, CFG.BACKUP_HOURS * 3600e3).unref(); }

  /* ---------- Android TWA: Digital Asset Links ---------- */
  function defaultFingerprints() { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'android-fingerprints.json'), 'utf8')).sha256 || []; } catch (e) { return []; } }
  app.get('/.well-known/assetlinks.json', (req, res) => {
    const fps = [...new Set([...CFG.ANDROID_CERT_SHA256, ...defaultFingerprints()].map(s => s.toUpperCase()))];
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: CFG.ANDROID_PACKAGE, sha256_cert_fingerprints: fps } }]);
  });

  /* ---------- PWA манифесі ---------- */
  app.get('/manifest.webmanifest', (req, res) => {
    res.type('application/manifest+json').setHeader('Cache-Control', 'public, max-age=3600');
    res.send(JSON.stringify({
      id: '/app/', name: 'AI-bolat — ойын-сабақтар', short_name: 'AI-bolat', lang: 'kk', dir: 'ltr',
      description: 'AI-bolat: 1–11-сыныптарға арналған ойын түріндегі оқу, ҰБТ · PISA · олимпиада тесттері және AI көмекші Болат.',
      start_url: '/app/?source=pwa', scope: '/', display: 'standalone', orientation: 'any', background_color: '#06264A', theme_color: '#06264A', categories: ['education', 'kids'],
      icons: [{ src: '/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/img/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' }, { src: '/img/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
      screenshots: [{ src: '/img/shots/wide-exam.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'ҰБТ · PISA · Олимпиада' },
        { src: '/img/shots/phone-home.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'AI-bolat' }],
      shortcuts: [{ name: 'ҰБТ · PISA · Олимпиада', url: '/app/#/exam', icons: [{ src: '/img/icon-192.png', sizes: '192x192' }] }, { name: 'Болат', url: '/app/#/bolat', icons: [{ src: '/img/icon-192.png', sizes: '192x192' }] }]
    }));
  });
  app.get('/sw.js', (req, res) => { res.type('application/javascript').setHeader('Cache-Control', 'no-cache'); res.setHeader('Service-Worker-Allowed', '/');
    res.send(fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.src.js'), 'utf8').split('__VERSION__').join(VERSION)); });

  /* ---------- жария сайт (SEO) ---------- */
  require('./site').register(app, D);
}
module.exports = { early, routes, isAdmin };
