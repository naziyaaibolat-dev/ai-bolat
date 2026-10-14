'use strict';
/* AI-bolat v4.0 — аналитика, мұғалім есептері (CSV/PDF), дедлайн, хабарландыруды бекіту, сабақ медиасы, мақсат.
   Барлық схема өзгерістері деструктивті емес: тек CREATE IF NOT EXISTS және ADD COLUMN. */
const SCHEMA_VERSION = 4;

function migrate(db) {
  db.db.exec('CREATE TABLE IF NOT EXISTS schema_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
  const add = (t, col) => { try { db.db.exec(`ALTER TABLE ${t} ADD COLUMN ${col}`); return 1; } catch (e) { return 0; } };
  let n = 0;
  n += add('users', 'daily_goal INTEGER');
  n += add('users', 'prefs TEXT');
  n += add('assignments', 'points INTEGER');
  n += add('assignments', 'allow_late INTEGER NOT NULL DEFAULT 1');
  n += add('assignments', 'max_attempts INTEGER');
  n += add('announcements', 'pinned INTEGER NOT NULL DEFAULT 0');
  db.db.exec(`CREATE TABLE IF NOT EXISTS lesson_media (id INTEGER PRIMARY KEY AUTOINCREMENT, topic_id TEXT NOT NULL, kind TEXT NOT NULL, url TEXT NOT NULL,
    title TEXT, teacher_id INTEGER NOT NULL, created_at TEXT NOT NULL)`);
  db.db.exec('CREATE INDEX IF NOT EXISTS idx_media_topic ON lesson_media(topic_id)');
  db.db.exec('CREATE INDEX IF NOT EXISTS idx_results_asg ON results(assignment_id, user_id)');
  db.db.exec('CREATE INDEX IF NOT EXISTS idx_results_created ON results(user_id, created_at)');
  db.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at)');
  db.run('INSERT OR REPLACE INTO schema_meta(k, v) VALUES (?, ?)', ['schema_version', String(SCHEMA_VERSION)]);
  db.run("DELETE FROM sessions WHERE expires_at < ?", [new Date().toISOString()]);
  return { added_columns: n };
}

/* видео/embed URL → қауіпсіз iframe мекенжайы (тек ақ тізім) */
function embedUrl(raw) {
  let u; try { u = new URL(String(raw || '').trim()); } catch (e) { return null; }
  if (u.protocol !== 'https:') return null;
  const h = u.hostname.replace(/^www\.|^m\./, '');
  const yt = (id) => /^[A-Za-z0-9_-]{6,20}$/.test(id || '') ? { kind: 'youtube', url: 'https://www.youtube-nocookie.com/embed/' + id } : null;
  if (h === 'youtu.be') return yt(u.pathname.slice(1));
  if (h === 'youtube.com' || h === 'youtube-nocookie.com') { if (u.pathname === '/watch') return yt(u.searchParams.get('v')); const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/); return m ? yt(m[2]) : null; }
  if (h === 'vimeo.com' || h === 'player.vimeo.com') { const m = u.pathname.match(/(\d{6,12})/); return m ? { kind: 'vimeo', url: 'https://player.vimeo.com/video/' + m[1] } : null; }
  if (h === 'docs.google.com' && /^\/presentation\/d\/[A-Za-z0-9_-]+/.test(u.pathname)) { const id = u.pathname.split('/')[3]; return { kind: 'slides', url: `https://docs.google.com/presentation/d/${id}/embed` }; }
  if (h === 'phet.colorado.edu' && /^\/sims\/html\/[a-z0-9-]+\/latest\/[a-z0-9-]+_[a-z_]+\.html$/i.test(u.pathname)) return { kind: 'phet', url: u.origin + u.pathname };
  return null;
}
const FRAME_HOSTS = ['https://www.youtube-nocookie.com', 'https://player.vimeo.com', 'https://docs.google.com', 'https://phet.colorado.edu'];

const csvCell = (v) => { let s = v === null || v === undefined ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
const toCsv = (rows) => '\uFEFF' + rows.map(r => r.map(csvCell).join(';')).join('\r\n');
const escH = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = function v4(app, D) {
  const { db, auth, wrap, httpErr, nowIso, TOPICS, SUBJECTS, tTitle, pub, C, levelOf, localDay, dayStart } = D;
  const L = (req, kk, ru, en) => ({ kk, ru, en })[req.lang] || kk;
  const classFor = (req, id) => { const c = db.get('SELECT * FROM classes WHERE id = ?', [+id]); if (!c) throw httpErr(404, 'not_found');
    if (req.user.role === 'teacher' ? c.teacher_id !== req.user.id : !db.get('SELECT 1 AS x FROM class_members WHERE class_id = ? AND student_id = ?', [c.id, req.user.id])) throw httpErr(403, 'forbidden'); return c; };
  /* дедлайн: күн (YYYY-MM-DD) болса — сол күннің соңына дейін */
  const dueEnd = (due) => { if (!due) return null; const s = String(due); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T23:59:59.999' : s; };
  const isLate = (createdAt, due) => { const e = dueEnd(due); if (!e) return false; const end = /Z|[+-]\d\d:?\d\d$/.test(e) ? new Date(e) : new Date(e); return new Date(createdAt) > end; };

  /* ---------- оқушы аналитикасы ---------- */
  app.get('/api/v4/analytics/me', auth(), (req, res) => {
    const u = req.user; const DAYS = 84; const since = dayStart(DAYS - 1);
    const xpBy = {}, cntBy = {};
    for (const r of db.all('SELECT created_at, xp FROM results WHERE user_id = ? AND created_at >= ?', [u.id, since]).concat(db.all('SELECT created_at, xp FROM lab_tasks WHERE user_id = ? AND created_at >= ?', [u.id, since]))) {
      const d = localDay(new Date(r.created_at)); xpBy[d] = (xpBy[d] || 0) + (r.xp || 0); cntBy[d] = (cntBy[d] || 0) + 1; }
    const heat = []; for (let i = DAYS - 1; i >= 0; i--) { const d = localDay(new Date(Date.now() - i * 864e5)); heat.push({ day: d, xp: xpBy[d] || 0, n: cntBy[d] || 0 }); }
    const prog = db.all('SELECT topic_id, best_percent, stars FROM progress WHERE user_id = ?', [u.id]);
    const subj = {};
    for (const p of prog) { const t = TOPICS.get(p.topic_id); const s = t ? t.subject : p.topic_id.split('-')[0]; if (!SUBJECTS[s]) continue;
      const o = subj[s] || (subj[s] = { subject: s, topics: 0, mastered: 0, sum: 0, stars: 0 }); o.topics++; o.sum += p.best_percent; o.stars += p.stars; if (p.best_percent >= 85) o.mastered++; }
    const mastery = Object.values(subj).map(o => ({ subject: o.subject, icon: SUBJECTS[o.subject].icon, color: SUBJECTS[o.subject].color, name: { kk: SUBJECTS[o.subject].kk, ru: SUBJECTS[o.subject].ru, en: SUBJECTS[o.subject].en },
      topics: o.topics, mastered: o.mastered, avg: Math.round(o.sum / o.topics), stars: o.stars })).sort((a, b) => b.topics - a.topics || b.avg - a.avg);
    const recent = db.all('SELECT topic_id, percent, mode, created_at, time_ms FROM results WHERE user_id = ? ORDER BY id DESC LIMIT 20', [u.id]).reverse();
    const weak = prog.filter(p => p.best_percent < 65).sort((a, b) => a.best_percent - b.best_percent).slice(0, 6).map(p => ({ topic_id: p.topic_id, best_percent: p.best_percent, topic: TOPICS.get(p.topic_id) || null })).filter(x => x.topic);
    const tot = db.get('SELECT COUNT(*) AS n, COALESCE(SUM(time_ms),0) AS t, AVG(percent) AS avg FROM results WHERE user_id = ?', [u.id]);
    const exams = db.get("SELECT COUNT(*) AS n, AVG(percent) AS avg FROM exam_attempts WHERE user_id = ? AND status = 'done'", [u.id]);
    const ranks = u.role === 'student' ? db.all('SELECT c.id, c.name FROM classes c JOIN class_members m ON m.class_id = c.id WHERE m.student_id = ?', [u.id]).map(c => {
      const ids = db.all('SELECT u.id, u.xp FROM users u JOIN class_members m ON m.student_id = u.id WHERE m.class_id = ? ORDER BY u.xp DESC', [c.id]);
      return { class_id: c.id, name: c.name, rank: ids.findIndex(x => x.id === u.id) + 1, of: ids.length }; }) : [];
    const lv = levelOf(u.xp);
    res.json({ heat, mastery, recent, weak, ranks, goal: u.daily_goal || 60,
      totals: { games: tot.n, minutes: Math.round(tot.t / 60000), avg: tot.avg ? Math.round(tot.avg) : null, topics: prog.length, mastered: prog.filter(p => p.best_percent >= 85).length,
        exams: exams.n, exams_avg: exams.avg ? Math.round(exams.avg) : null, active_days: heat.filter(h => h.n).length },
      level: { level: lv, xp: u.xp, base: (lv - 1) * (lv - 1) * 100, next: lv * lv * 100 }, streak: u.streak, best_streak: u.best_streak });
  });
  app.patch('/api/v4/goal', auth(), wrap(async (req, res) => {
    const g = Math.round(+(req.body || {}).daily_goal); if (!(g >= 10 && g <= 500)) throw httpErr(400, 'bad_request');
    db.run('UPDATE users SET daily_goal = ? WHERE id = ?', [g, req.user.id]); res.json({ goal: g });
  }));

  /* ---------- мұғалім: автотексеру есебі ---------- */
  function classReport(req, c) {
    const students = db.all('SELECT u.* FROM users u JOIN class_members m ON m.student_id = u.id WHERE m.class_id = ? ORDER BY u.name', [c.id]);
    const assigns = db.all('SELECT * FROM assignments WHERE class_id = ? ORDER BY COALESCE(due_at, created_at), id', [c.id]);
    const now = new Date();
    const best = {};
    for (const r of db.all('SELECT * FROM results WHERE assignment_id IN (SELECT id FROM assignments WHERE class_id = ?) ORDER BY id', [c.id])) {
      const k = r.user_id + ':' + r.assignment_id; const b = best[k];
      const a = assigns.find(x => x.id === r.assignment_id); const late = a ? isLate(r.created_at, a.due_at) : false;
      if (!b) best[k] = { percent: r.percent, mark: r.mark, attempts: 1, first_at: r.created_at, last_at: r.created_at, late, details: r.details ? [r.details] : [] };
      else { b.attempts++; b.last_at = r.created_at; if (r.percent > b.percent) { b.percent = r.percent; b.mark = r.mark; } if (!late) b.late = false; if (r.details) b.details.push(r.details); }
    }
    const A = assigns.map(a => {
      const cells = students.map(s => best[s.id + ':' + a.id] || null); const got = cells.filter(Boolean);
      const overdue = a.due_at && now > new Date(dueEnd(a.due_at));
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0 }; got.forEach(x => dist[x.mark]++);
      const per = []; // сұрақ бойынша қателер (бірінші әрекет)
      for (const g of got) { try { const arr = JSON.parse(g.details[0]); arr.forEach((ok, i) => { per[i] = per[i] || { i, wrong: 0, n: 0 }; per[i].n++; if (!ok) per[i].wrong++; }); } catch (e) { /* */ } }
      const hardest = per.filter(Boolean).filter(x => x.wrong).sort((x, y) => y.wrong / y.n - x.wrong / x.n).slice(0, 3).map(x => ({ q: x.i + 1, wrong_pct: Math.round(x.wrong / x.n * 100) }));
      return { id: a.id, title: a.title, kind: a.kind, topic_id: a.topic_id, topic: TOPICS.get(a.topic_id) || null, due_at: a.due_at, points: a.points, allow_late: a.allow_late, created_at: a.created_at, overdue: !!overdue,
        submitted: got.length, on_time: got.filter(x => !x.late).length, late: got.filter(x => x.late).length, missing: students.length - got.length,
        avg: got.length ? Math.round(got.reduce((s, x) => s + x.percent, 0) / got.length) : null, dist, hardest };
    });
    const S = students.map(s => {
      const cells = assigns.map(a => { const b = best[s.id + ':' + a.id]; return b ? { percent: b.percent, mark: b.mark, attempts: b.attempts, late: b.late, at: b.last_at } : null; });
      const got = cells.filter(Boolean); const avg = got.length ? Math.round(got.reduce((x, m) => x + m.percent, 0) / got.length) : null;
      const overdueMissing = assigns.filter((a, i) => !cells[i] && a.due_at && now > new Date(dueEnd(a.due_at))).length;
      const last = db.get('SELECT MAX(created_at) AS t FROM results WHERE user_id = ?', [s.id]).t;
      const inactive = !last || (now - new Date(last)) > 7 * 864e5;
      return { student: pub(s), cells, avg, done: got.length, late: got.filter(x => x.late).length, overdue_missing: overdueMissing, last_active: last,
        at_risk: overdueMissing >= 2 || (avg !== null && avg < 50) || (inactive && assigns.length > 0) };
    });
    const allAvg = S.filter(x => x.avg !== null); 
    return { class: c, generated_at: nowIso(), assignments: A, students: S,
      summary: { students: students.length, assignments: assigns.length, avg: allAvg.length ? Math.round(allAvg.reduce((x, s) => x + s.avg, 0) / allAvg.length) : null,
        completion: students.length && assigns.length ? Math.round(S.reduce((x, s) => x + s.done, 0) / (students.length * assigns.length) * 100) : null,
        at_risk: S.filter(s => s.at_risk).length, upcoming: A.filter(a => a.due_at && !a.overdue).length } };
  }
  app.get('/api/v4/classes/:id/report', auth('teacher'), wrap(async (req, res) => {
    const c = classFor(req, req.params.id); const R = classReport(req, c);
    if (req.query.format === 'csv') {
      const head = [L(req, 'Оқушы', 'Ученик', 'Student'), ...R.assignments.map(a => a.title + (a.due_at ? ' (' + a.due_at.slice(0, 10) + ')' : '')), L(req, 'Орташа %', 'Средний %', 'Average %'), L(req, 'Орындалды', 'Выполнено', 'Done'), L(req, 'Кешікті', 'Опоздал', 'Late'), L(req, 'Қауіп', 'Риск', 'At risk')];
      const rows = [head].concat(R.students.map(s => [s.student.name, ...s.cells.map(x => x ? `${x.mark} (${x.percent}%)${x.late ? ' ⏰' : ''}` : '—'), s.avg === null ? '' : s.avg, `${s.done}/${R.assignments.length}`, s.late, s.at_risk ? '!' : '']));
      rows.push([]); rows.push([L(req, 'Тапсырма', 'Задание', 'Assignment'), L(req, 'Тапсырды', 'Сдали', 'Submitted'), L(req, 'Уақытында', 'Вовремя', 'On time'), L(req, 'Кешікті', 'Опоздали', 'Late'), L(req, 'Тапсырмады', 'Не сдали', 'Missing'), L(req, 'Орташа %', 'Средний %', 'Average %'), '5', '4', '3', '2']);
      for (const a of R.assignments) rows.push([a.title, a.submitted, a.on_time, a.late, a.missing, a.avg === null ? '' : a.avg, a.dist[5], a.dist[4], a.dist[3], a.dist[2]]);
      const fn = encodeURIComponent(`${c.name}-report-${localDay()}.csv`);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="report.csv"; filename*=UTF-8''${fn}`);
      return res.send(toCsv(rows));
    }
    if (req.query.format === 'html') {
      const t = (k) => ({ title: L(req, 'Сынып есебі', 'Отчёт по классу', 'Class report'), st: L(req, 'Оқушы', 'Ученик', 'Student'), avg: L(req, 'Орташа', 'Средний', 'Average'), compl: L(req, 'Орындалуы', 'Выполнение', 'Completion'), risk: L(req, 'Назар аудару керек', 'Требуют внимания', 'Need attention'), asg: L(req, 'Тапсырмалар', 'Задания', 'Assignments'), sub: L(req, 'Тапсырды', 'Сдали', 'Submitted'), late: L(req, 'Кешікті', 'Опоздали', 'Late'), miss: L(req, 'Тапсырмады', 'Не сдали', 'Missing'), due: L(req, 'Мерзімі', 'Срок', 'Due'), print: L(req, 'PDF ретінде сақтау / басып шығару', 'Сохранить PDF / печать', 'Save as PDF / print') })[k];
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; img-src 'self' data:");
      return res.send(`<!doctype html><html lang="${req.lang}"><head><meta charset="utf-8"><title>${escH(t('title'))} — ${escH(c.name)}</title><style>
body{font:13px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:#0b1b2e;margin:28px}h1{font-size:22px;margin:0}h2{font-size:16px;margin:22px 0 8px;color:#0A7FC2}
.k{display:flex;gap:10px;margin:14px 0}.k div{border:1px solid #d5e3f0;border-radius:10px;padding:8px 14px}.k b{display:block;font-size:20px}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #d5e3f0;padding:5px 7px;text-align:left}th{background:#eaf6fd}.late{color:#b45309}.risk{background:#fff4e5}.m5{color:#047857;font-weight:700}.m2{color:#b91c1c;font-weight:700}
.bar{display:flex;justify-content:space-between;align-items:center}button{padding:8px 14px;border-radius:8px;border:0;background:#0A7FC2;color:#fff;font-weight:700;cursor:pointer}@media print{button{display:none}body{margin:0}}</style></head><body>
<div class="bar"><div><h1>📊 ${escH(t('title'))}: ${escH(c.name)}</h1><div>AI-bolat · ${escH(new Date().toLocaleString(req.lang === 'en' ? 'en-GB' : req.lang === 'ru' ? 'ru-RU' : 'kk-KZ'))}</div></div><button id="pr">🖨 ${escH(t('print'))}</button></div>
<div class="k"><div>${escH(t('st'))}<b>${R.summary.students}</b></div><div>${escH(t('asg'))}<b>${R.summary.assignments}</b></div><div>${escH(t('avg'))}<b>${R.summary.avg === null ? '—' : R.summary.avg + '%'}</b></div><div>${escH(t('compl'))}<b>${R.summary.completion === null ? '—' : R.summary.completion + '%'}</b></div><div>${escH(t('risk'))}<b>${R.summary.at_risk}</b></div></div>
<h2>${escH(t('asg'))}</h2><table><tr><th>#</th><th>${escH(t('asg'))}</th><th>${escH(t('due'))}</th><th>${escH(t('sub'))}</th><th>${escH(t('late'))}</th><th>${escH(t('miss'))}</th><th>${escH(t('avg'))}</th><th>5/4/3/2</th></tr>
${R.assignments.map((a, i) => `<tr><td>${i + 1}</td><td>${escH(a.title)}</td><td>${escH(a.due_at ? a.due_at.slice(0, 10) : '—')}</td><td>${a.submitted}</td><td class="late">${a.late}</td><td>${a.missing}</td><td>${a.avg === null ? '—' : a.avg + '%'}</td><td>${a.dist[5]}/${a.dist[4]}/${a.dist[3]}/${a.dist[2]}</td></tr>`).join('')}</table>
<h2>${escH(t('st'))}</h2><table><tr><th>${escH(t('st'))}</th>${R.assignments.map((a, i) => `<th title="${escH(a.title)}">${i + 1}</th>`).join('')}<th>${escH(t('avg'))}</th></tr>
${R.students.map(s => `<tr class="${s.at_risk ? 'risk' : ''}"><td>${escH(s.student.name)}${s.at_risk ? ' ⚠️' : ''}</td>${s.cells.map(x => x ? `<td class="m${x.mark}${x.late ? ' late' : ''}">${x.mark} <small>${x.percent}%${x.late ? ' ⏰' : ''}</small></td>` : '<td>—</td>').join('')}<td><b>${s.avg === null ? '—' : s.avg + '%'}</b></td></tr>`).join('')}</table>
<script src="/js/print-report.js"></script></body></html>`);
    }
    res.json(R);
  }));
  app.patch('/api/v4/assignments/:id', auth('teacher'), wrap(async (req, res) => {
    const a = db.get('SELECT * FROM assignments WHERE id = ?', [+req.params.id]); if (!a) throw httpErr(404, 'not_found'); classFor(req, a.class_id);
    const b = req.body || {}; const set = [], val = [];
    if ('title' in b) { const t = String(b.title || '').trim().slice(0, 160); if (!t) throw httpErr(400, 'bad_request'); set.push('title = ?'); val.push(t); }
    if ('note' in b) { set.push('note = ?'); val.push(String(b.note || '').slice(0, 1000)); }
    if ('due_at' in b) { const d = b.due_at ? String(b.due_at).slice(0, 20) : null; if (d && isNaN(new Date(d))) throw httpErr(400, 'bad_request'); set.push('due_at = ?'); val.push(d); }
    if ('points' in b) { const p = b.points === null || b.points === '' ? null : Math.max(0, Math.min(1000, Math.round(+b.points))); set.push('points = ?'); val.push(Number.isFinite(p) ? p : null); }
    if ('allow_late' in b) { set.push('allow_late = ?'); val.push(b.allow_late ? 1 : 0); }
    if ('kind' in b && ['homework', 'classwork', 'test'].includes(b.kind)) { set.push('kind = ?'); val.push(b.kind); }
    if (set.length) db.run(`UPDATE assignments SET ${set.join(', ')} WHERE id = ?`, [...val, a.id]);
    res.json({ assignment: db.get('SELECT * FROM assignments WHERE id = ?', [a.id]) });
  }));
  /* оқушы: дедлайн күйімен тапсырмалар */
  app.get('/api/v4/assignments', auth('student'), (req, res) => {
    const now = new Date();
    const rows = db.all('SELECT a.*, c.name AS class_name FROM assignments a JOIN class_members m ON m.class_id = a.class_id JOIN classes c ON c.id = a.class_id WHERE m.student_id = ? ORDER BY a.id DESC LIMIT 100', [req.user.id]);
    res.json({ assignments: rows.map(a => { const r = db.all('SELECT percent, mark, created_at FROM results WHERE assignment_id = ? AND user_id = ? ORDER BY percent DESC', [a.id, req.user.id]);
      const end = dueEnd(a.due_at); const done = r.length > 0;
      const status = done ? (r.every(x => isLate(x.created_at, a.due_at)) ? 'late' : 'done') : end && now > new Date(end) ? 'overdue' : end && new Date(end) - now < 864e5 * 1.5 ? 'soon' : 'open';
      return { ...a, topic: TOPICS.get(a.topic_id) || null, status, best: done ? r[0].percent : null, mark: done ? r[0].mark : null, attempts: r.length, hours_left: end ? Math.round((new Date(end) - now) / 36e5) : null }; })
      .sort((x, y) => ({ overdue: 0, soon: 1, open: 2, late: 3, done: 4 })[x.status] - ({ overdue: 0, soon: 1, open: 2, late: 3, done: 4 })[y.status]) });
  });

  /* ---------- хабарландырулар: бекіту / өшіру ---------- */
  const annFor = (req) => { const a = db.get('SELECT * FROM announcements WHERE id = ?', [+req.params.id]); if (!a) throw httpErr(404, 'not_found'); classFor(req, a.class_id); return a; };
  app.post('/api/v4/announcements/:id/pin', auth('teacher'), wrap(async (req, res) => { const a = annFor(req); const p = (req.body || {}).pinned ? 1 : 0;
    db.run('UPDATE announcements SET pinned = ? WHERE id = ?', [p, a.id]); res.json({ ok: true, pinned: p }); }));
  app.delete('/api/v4/announcements/:id', auth('teacher'), wrap(async (req, res) => { const a = annFor(req);
    db.run('DELETE FROM announcement_reads WHERE announcement_id = ?', [a.id]); db.run('DELETE FROM announcements WHERE id = ?', [a.id]); res.json({ ok: true }); }));
  app.get('/api/v4/classes/:id/announcements', auth(), wrap(async (req, res) => { const c = classFor(req, req.params.id);
    res.json({ announcements: db.all('SELECT * FROM announcements WHERE class_id = ? ORDER BY pinned DESC, id DESC LIMIT 100', [c.id]) }); }));

  /* ---------- сабақ медиасы (видео/embed слоттары) ---------- */
  const canTeach = (req) => req.user && req.user.role === 'teacher';
  app.get('/api/v4/lesson/:id/media', auth(), (req, res) => {
    const id = String(req.params.id).slice(0, 60); res.json({ media: db.all('SELECT id, topic_id, kind, url, title, teacher_id, created_at FROM lesson_media WHERE topic_id = ? ORDER BY id', [id]), can_edit: canTeach(req) });
  });
  app.post('/api/v4/lesson/:id/media', auth('teacher'), wrap(async (req, res) => {
    const id = String(req.params.id); if (!TOPICS.has(id)) throw httpErr(404, 'topic_nf');
    const e = embedUrl((req.body || {}).url); if (!e) throw httpErr(400, 'bad_request');
    if (db.get('SELECT COUNT(*) AS n FROM lesson_media WHERE topic_id = ?', [id]).n >= 6) throw httpErr(400, 'bad_request');
    const title = String((req.body || {}).title || '').trim().slice(0, 120) || null;
    const r = db.run('INSERT INTO lesson_media(topic_id, kind, url, title, teacher_id, created_at) VALUES (?,?,?,?,?,?)', [id, e.kind, e.url, title, req.user.id, nowIso()]);
    res.json({ media: db.get('SELECT * FROM lesson_media WHERE id = ?', [r.id]) });
  }));
  app.delete('/api/v4/media/:mid', auth('teacher'), wrap(async (req, res) => {
    const m = db.get('SELECT * FROM lesson_media WHERE id = ?', [+req.params.mid]); if (!m) throw httpErr(404, 'not_found'); if (m.teacher_id !== req.user.id) throw httpErr(403, 'forbidden');
    db.run('DELETE FROM lesson_media WHERE id = ?', [m.id]); res.json({ ok: true });
  }));

  /* ---------- мұғалім дашборды: шолу ---------- */
  app.get('/api/v4/teacher/overview', auth('teacher'), (req, res) => {
    const classes = db.all('SELECT * FROM classes WHERE teacher_id = ? ORDER BY id DESC', [req.user.id]).map(c => { const R = classReport(req, c);
      return { id: c.id, name: c.name, summary: R.summary, at_risk: R.students.filter(s => s.at_risk).slice(0, 5).map(s => ({ id: s.student.id, name: s.student.name, avatar: s.student.avatar, avg: s.avg, overdue_missing: s.overdue_missing })),
        upcoming: R.assignments.filter(a => a.due_at && !a.overdue).slice(0, 4).map(a => ({ id: a.id, title: a.title, due_at: a.due_at, submitted: a.submitted, of: R.summary.students })) }; });
    const since = dayStart(6);
    const activity = db.get('SELECT COUNT(*) AS n, AVG(percent) AS p FROM results r JOIN class_members m ON m.student_id = r.user_id JOIN classes c ON c.id = m.class_id WHERE c.teacher_id = ? AND r.created_at >= ?', [req.user.id, since]);
    res.json({ classes, week: { results: activity.n, avg: activity.p ? Math.round(activity.p) : null } });
  });
};
module.exports.migrate = migrate;
module.exports.embedUrl = embedUrl;
module.exports.FRAME_HOSTS = FRAME_HOSTS;
module.exports.SCHEMA_VERSION = SCHEMA_VERSION;
