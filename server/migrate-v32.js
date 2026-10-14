'use strict';
/* v3.1 → v3.2 каталог көшіру: ескі тақырып id-лерін жаңа id-лерге ауыстыру (shared/catalog/migrate-v32.json).
   Бір рет орындалады (app_meta.catalog_version = '3.2'). Прогресс қайталанса — ең жақсы нәтиже сақталады. */
module.exports = function migrateCatalog(db, CAT) {
  db.db.exec('CREATE TABLE IF NOT EXISTS app_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
  const cur = db.get("SELECT v FROM app_meta WHERE k = 'catalog_version'");
  if (cur && cur.v === '3.2') return { skipped: true };
  const map = CAT.MIGRATE || {}; const olds = Object.keys(map).filter(id => !CAT.TOPICS.has(id));
  const st = { topics: olds.length, progress: 0, results: 0, assignments: 0, messages: 0, chats: 0, lessons_moved: 0, lessons_dropped: 0 };
  const has = (t) => !!db.get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [t]);
  const x = (sql, p) => { db.db.run(sql, p); return db.db.getRowsModified(); };
  db.db.exec('BEGIN');
  try {
    for (const oid of olds) {
      const nid = map[oid].to; if (!CAT.TOPICS.has(nid)) continue;
      /* progress: (user_id, topic_id) PK — қосылғанда ең жақсысын қалдыру */
      for (const p of db.all('SELECT * FROM progress WHERE topic_id = ?', [oid])) {
        const e = db.get('SELECT * FROM progress WHERE user_id = ? AND topic_id = ?', [p.user_id, nid]);
        if (e) x('UPDATE progress SET best_percent = ?, stars = ?, attempts = ?, last_at = ? WHERE user_id = ? AND topic_id = ?', [Math.max(e.best_percent, p.best_percent), Math.max(e.stars, p.stars), e.attempts + p.attempts, (e.last_at || '') > (p.last_at || '') ? e.last_at : p.last_at, p.user_id, nid]);
        else x('INSERT INTO progress (user_id, topic_id, best_percent, stars, attempts, last_at) VALUES (?,?,?,?,?,?)', [p.user_id, nid, p.best_percent, p.stars, p.attempts, p.last_at]);
        st.progress++;
      }
      x('DELETE FROM progress WHERE topic_id = ?', [oid]);
      st.results += x('UPDATE results SET topic_id = ? WHERE topic_id = ?', [nid, oid]);
      st.assignments += x('UPDATE assignments SET topic_id = ? WHERE topic_id = ?', [nid, oid]);
      if (has('messages')) st.messages += x('UPDATE messages SET topic_id = ? WHERE topic_id = ?', [nid, oid]);
      if (has('bolat_chats')) st.chats += x('UPDATE bolat_chats SET topic_id = ? WHERE topic_id = ?', [nid, oid]);
      /* сабақ кэші: мұғалім өңдегені көшіріледі (жаңа тақырыпта болмаса), AI/шаблон нұсқасы қайта жасалады */
      for (const l of db.all('SELECT * FROM lesson_cache WHERE topic_id = ?', [oid])) {
        const e = db.get('SELECT source FROM lesson_cache WHERE topic_id = ? AND lang = ?', [nid, l.lang]);
        if ((l.source === 'teacher' || (l.source === 'ai' && map[oid].score >= 0.5)) && !e) { x('UPDATE lesson_cache SET topic_id = ? WHERE topic_id = ? AND lang = ?', [nid, oid, l.lang]); st.lessons_moved++; }
      }
      st.lessons_dropped += x('DELETE FROM lesson_cache WHERE topic_id = ?', [oid]);
      x('UPDATE OR IGNORE lesson_hist SET topic_id = ? WHERE topic_id = ?', [nid, oid]); x('DELETE FROM lesson_hist WHERE topic_id = ?', [oid]);
      x('DELETE FROM topic_i18n WHERE topic_id = ?', [oid]);
    }
    /* id сақталған, бірақ атауы өзгерген тақырыптардың аударма кэшін тазарту */
    x('DELETE FROM topic_i18n');
    db.db.run("INSERT OR REPLACE INTO app_meta (k, v) VALUES ('catalog_version', '3.2')");
    db.db.exec('COMMIT');
  } catch (e) { db.db.exec('ROLLBACK'); throw e; }
  db.save(); return st;
};
