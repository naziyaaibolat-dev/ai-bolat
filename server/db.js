'use strict';
/* AI-bolat — SQLite (sql.js WASM, Windows-та компиляциясыз жұмыс істейді) */
const fs = require('fs'), path = require('path');
const initSqlJs = require('sql.js');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'aibolat.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL CHECK(role IN ('teacher','student')),
  name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, pass_hash TEXT NOT NULL, grade INTEGER, lang TEXT NOT NULL DEFAULT 'kk', avatar TEXT,
  xp INTEGER NOT NULL DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, best_streak INTEGER NOT NULL DEFAULT 0, last_day TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sms_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, purpose TEXT NOT NULL, code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, used INTEGER NOT NULL DEFAULT 0, ip TEXT, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_codes(phone, purpose, created_at);
CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY AUTOINCREMENT, teacher_id INTEGER NOT NULL, name TEXT NOT NULL, grade INTEGER, subject TEXT,
  join_code TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS class_members (class_id INTEGER NOT NULL, student_id INTEGER NOT NULL, joined_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY(class_id, student_id));
CREATE TABLE IF NOT EXISTS assignments (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER NOT NULL, title TEXT NOT NULL, topic_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'homework', note TEXT, due_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS lesson_cache (topic_id TEXT NOT NULL, lang TEXT NOT NULL, content TEXT NOT NULL, source TEXT NOT NULL, model TEXT, gen_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY(topic_id, lang));
CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, topic_id TEXT NOT NULL, assignment_id INTEGER, lang TEXT,
  score REAL NOT NULL, total INTEGER NOT NULL, percent INTEGER NOT NULL, mark INTEGER NOT NULL, stars INTEGER NOT NULL, xp INTEGER NOT NULL,
  details TEXT, time_ms INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_results_user ON results(user_id, topic_id);
CREATE TABLE IF NOT EXISTS progress (user_id INTEGER NOT NULL, topic_id TEXT NOT NULL, best_percent INTEGER NOT NULL DEFAULT 0, stars INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0, last_at TEXT, PRIMARY KEY(user_id, topic_id));
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, recipient_id INTEGER NOT NULL, body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'msg', topic_id TEXT, created_at TEXT NOT NULL, read_at TEXT);
CREATE INDEX IF NOT EXISTS idx_msg_to ON messages(recipient_id, read_at);
CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER NOT NULL, teacher_id INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS announcement_reads (announcement_id INTEGER NOT NULL, user_id INTEGER NOT NULL, read_at TEXT NOT NULL, PRIMARY KEY(announcement_id, user_id));
CREATE TABLE IF NOT EXISTS bolat_chats (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, topic_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bolat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id INTEGER NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, images TEXT, model TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS lab_tasks (user_id INTEGER NOT NULL, lab_id TEXT NOT NULL, task_key TEXT NOT NULL, xp INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, PRIMARY KEY(user_id, lab_id, task_key));
CREATE TABLE IF NOT EXISTS lab_visits (user_id INTEGER NOT NULL, lab_id TEXT NOT NULL, visits INTEGER NOT NULL DEFAULT 1, last_at TEXT NOT NULL, PRIMARY KEY(user_id, lab_id));
CREATE TABLE IF NOT EXISTS lesson_hist (topic_id TEXT NOT NULL, lang TEXT NOT NULL, stamp TEXT NOT NULL, content TEXT NOT NULL, PRIMARY KEY(topic_id, lang, stamp));
CREATE TABLE IF NOT EXISTS ai_cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS exam_items_ai (id TEXT PRIMARY KEY, user_id INTEGER, data TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS exam_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, kind TEXT NOT NULL, subject TEXT, title TEXT, items TEXT NOT NULL, answers TEXT,
  score REAL, max REAL, percent INTEGER, by_topic TEXT, time_ms INTEGER, assignment_id INTEGER, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL, finished_at TEXT);
CREATE INDEX IF NOT EXISTS idx_exam_att_user ON exam_attempts(user_id, created_at);
CREATE TABLE IF NOT EXISTS exam_assignments (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER NOT NULL, teacher_id INTEGER NOT NULL, title TEXT NOT NULL, kind TEXT NOT NULL, subject TEXT,
  items TEXT NOT NULL, time_limit INTEGER, due_at TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS topic_i18n (topic_id TEXT NOT NULL, lang TEXT NOT NULL, title TEXT NOT NULL, PRIMARY KEY(topic_id, lang));
`;
class DB {
  static async open() {
    const SQL = await initSqlJs();
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const db = new DB();
    db.db = fs.existsSync(DB_FILE) ? new SQL.Database(fs.readFileSync(DB_FILE)) : new SQL.Database();
    db.db.exec(SCHEMA);
    try { db.db.exec('ALTER TABLE results ADD COLUMN mode TEXT'); } catch (e) { /* бар */ }
    try { db.db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0'); } catch (e) { /* бар */ }
    try { db.db.exec('ALTER TABLE users ADD COLUMN consent_at TEXT'); } catch (e) { /* бар */ }
    db.db.exec(`CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, kind TEXT NOT NULL, ref TEXT, excerpt TEXT, reason TEXT, note TEXT,
      status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL)`);
    db.timer = null; db.save();
    const flush = () => { try { db.saveNow(); } catch (e) { /* */ } };
    process.on('exit', flush);
    for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flush(); process.exit(0); });
    return db;
  }
  all(sql, params = []) { const st = this.db.prepare(sql); try { st.bind(params); const out = []; while (st.step()) out.push(st.getAsObject()); return out; } finally { st.free(); } }
  get(sql, params = []) { return this.all(sql, params)[0] || null; }
  run(sql, params = []) {
    this.db.run(sql, params);
    const id = this.db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
    const changes = this.db.getRowsModified(); this.save(); return { id, changes };
  }
  save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.saveNow(), 400); }
  saveNow() {
    clearTimeout(this.timer);
    const data = Buffer.from(this.db.export()); const tmp = DB_FILE + '.tmp'; fs.writeFileSync(tmp, data);
    try { fs.renameSync(tmp, DB_FILE); } catch (e) { fs.writeFileSync(DB_FILE, data); try { fs.unlinkSync(tmp); } catch (x) { /* */ } }
  }
}
module.exports = { DB, DB_FILE, DATA_DIR };
