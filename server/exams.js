'use strict';
/* ҰБТ · PISA · Олимпиада — тест банкі, тест тапсыру, талдау, AI генератор, мұғалім тапсырмалары */
const crypto = require('crypto');
const BANKS = ['ubt1', 'ubt2', 'ubt3', 'pisa', 'olymp'].map(f => require('./bank/' + f));
const CTX = Object.assign({}, ...BANKS.map(b => b.ctx || {}));
const ITEMS = new Map();
for (const b of BANKS) for (const it of b.items) {
  const id = it.k[0] + '-' + it.s + '-' + crypto.createHash('sha1').update(it.q + '|' + (it.c || '')).digest('hex').slice(0, 8);
  ITEMS.set(id, { ...it, id });
}
const KINDS = ['ubt', 'pisa', 'olymp'];
const SUBJ = {
  mathlit: ['Математикалық сауаттылық', 'Математическая грамотность', 'Math literacy'],
  readlit: ['Оқу сауаттылығы', 'Грамотность чтения', 'Reading literacy'],
  kzhist: ['Қазақстан тарихы', 'История Казахстана', 'History of Kazakhstan'],
  worldhist: ['Дүниежүзі тарихы', 'Всемирная история', 'World history'],
  math: ['Математика', 'Математика', 'Mathematics'], phys: ['Физика', 'Физика', 'Physics'], chem: ['Химия', 'Химия', 'Chemistry'],
  bio: ['Биология', 'Биология', 'Biology'], geo: ['География', 'География', 'Geography'], inf: ['Информатика', 'Информатика', 'Informatics'],
  eng: ['Ағылшын тілі', 'Английский язык', 'English'],
  read: ['Оқу сауаттылығы', 'Читательская грамотность', 'Reading literacy'], sci: ['Жаратылыстану сауаттылығы', 'Естественнонаучная грамотность', 'Science literacy']
};
const CAT_MAP = { mathlit: ['math', 'alg'], readlit: ['kaztil', 'kazadeb'], read: ['kaztil', 'kazadeb'], math: ['alg', 'geom', 'math'], sci: ['phys', 'chem', 'bio'] };
const LIDX = { kk: 0, ru: 1, en: 2 };
const LVL = ['school', 'district', 'region'];
const MIN_PER = { ubt: 120, pisa: 150, olymp: 360 }; // секунд / сұрақ

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const num = (v) => { const x = parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(x) ? x : null; };
function maxPts(it) { return it.ty === 'm' ? 2 : 1; }
function check(it, perm, ans) { // ans — клиент кеңістігіндегі жауап
  if (ans == null || ans === '' || (Array.isArray(ans) && !ans.length)) return 0;
  if (it.ty === 'n') { const g = num(ans), c = num(it.a); if (g == null || c == null) return 0; const tol = it.tol != null ? it.tol : Math.max(1e-6, Math.abs(c) * 1e-3); return Math.abs(g - c) <= tol ? 1 : 0; }
  const map = (i) => (perm ? perm[+i] : +i);
  if (it.ty === 's') return map(ans) === it.a ? 1 : 0;
  const sel = new Set((Array.isArray(ans) ? ans : [ans]).map(map)); const cor = new Set(it.a);
  let wrong = 0; for (const x of sel) if (!cor.has(x)) wrong++; for (const x of cor) if (!sel.has(x)) wrong++;
  return wrong === 0 ? 2 : wrong === 1 ? 1 : 0;
}
function validItem(o, k, s, g) { // AI элементін тексеру
  if (!o || typeof o !== 'object') return null;
  const q = String(o.q || '').trim().slice(0, 1500); if (q.length < 8) return null;
  const sol = String(o.sol || o.solution || o.explain || '').trim().slice(0, 2000);
  const tp = String(o.tp || o.topic || '').trim().slice(0, 80);
  let ty = o.ty || (Array.isArray(o.a) ? 'm' : Array.isArray(o.o) ? 's' : 'n');
  const base = { k, s, g: +o.g || g || 11, tp, q, sol, hint: o.hint ? String(o.hint).slice(0, 400) : undefined, lv: o.lv, ai: true };
  if (ty === 'n') { if (num(o.a) == null) return null; return { ...base, ty, a: String(num(o.a)) }; }
  const opts = (Array.isArray(o.o) ? o.o : []).map(x => String(x).trim().slice(0, 300)).filter(Boolean);
  if (new Set(opts).size !== opts.length) return null;
  if (ty === 's') { const a = +o.a; if (opts.length !== 4 || !(a >= 0 && a < 4) || a !== Math.floor(a)) return null; return { ...base, ty, o: opts, a }; }
  if (ty === 'm') { const a = [...new Set((o.a || []).map(Number))].filter(x => x >= 0 && x < opts.length); if (opts.length < 5 || opts.length > 6 || a.length < 2 || a.length > 3) return null; return { ...base, ty, o: opts, a: a.sort() }; }
  return null;
}

module.exports = function register(app, h) {
  const { db, auth, wrap, httpErr, ai, I, awardXp, pub, nowIso, LANGS, CAT } = h;
  const getItem = (id) => { if (ITEMS.has(id)) return ITEMS.get(id); const r = db.get('SELECT data FROM exam_items_ai WHERE id = ?', [id]); return r ? { ...JSON.parse(r.data), id } : null; };
  function pool({ kind, subject, topic, grade, level }) {
    return [...ITEMS.values()].filter(it => it.k === kind && (!subject || it.s === subject) && (!topic || it.tp === topic) &&
      (!grade || kind !== 'olymp' || it.g === +grade) && (!level || kind !== 'olymp' || it.lv === level));
  }
  function pick(list, n, r) { // контекст топтарын бірге ұстау
    const groups = new Map(); for (const it of list) { const key = it.c ? 'c:' + it.c : 'i:' + it.id; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(it); }
    const out = []; for (const g of shuffle([...groups.values()], r)) { if (out.length >= n) break; out.push(...g.slice(0, Math.max(1, n - out.length))); }
    const ctxFirst = out.sort((a, b) => (a.c ? 1 : 0) - (b.c ? 1 : 0) || String(a.c || '').localeCompare(String(b.c || '')) || (a.ty === 'm') - (b.ty === 'm'));
    return ctxFirst;
  }
  function buildSpec(b) {
    const kind = KINDS.includes(b.kind) ? b.kind : 'ubt'; const seed = crypto.randomInt(1, 2 ** 31); const r = rng(seed);
    let items = [];
    if (kind === 'ubt' && b.variant === 'mini') items = [...pick(pool({ kind, subject: 'kzhist' }), 8, r), ...pick(pool({ kind, subject: 'mathlit' }), 6, r), ...pick(pool({ kind, subject: 'readlit' }), 6, r)];
    else { const n = Math.max(3, Math.min(40, +b.n || (kind === 'olymp' ? 6 : kind === 'pisa' ? 10 : 20))); items = pick(pool({ kind, subject: b.subject, topic: b.topic, grade: b.grade, level: b.level }), n, r); }
    if (!items.length) throw httpErr(404, 'exam_empty');
    return { kind, subject: b.variant === 'mini' ? 'mini' : (b.subject || null), ids: items.map(i => i.id), seed };
  }
  function perms(ids, seed) { const r = rng(seed); return ids.map(id => { const it = getItem(id); return it && it.o ? shuffle(it.o.map((_, i) => i), r) : null; }); }
  function view(it, perm, lang) { // жауапсыз көрініс
    return { id: it.id, ty: it.ty, s: it.s, tp: it.tp, g: it.g, lv: it.lv, q: it.q, o: it.o ? perm.map(i => it.o[i]) : undefined, c: it.c || null, hint: it.k === 'olymp' ? (it.hint || null) : null, pts: maxPts(it), ai: !!it.ai };
  }
  function titleOf(kind, subject, lang, topic) {
    const L = LIDX[lang] || 0; const k = { ubt: 'ҰБТ', pisa: 'PISA', olymp: ['Олимпиада', 'Олимпиада', 'Olympiad'][L] }[kind];
    const s = subject === 'mini' ? ['Мини-ҰБТ (тарих + сауаттылық)', 'Мини-ЕНТ (история + грамотность)', 'Mini UNT (history + literacy)'][L] : subject && SUBJ[subject] ? SUBJ[subject][L] : ['Аралас', 'Смешанный', 'Mixed'][L];
    return `${k} · ${s}${topic ? ' · ' + topic : ''}`;
  }
  function startAttempt(user, spec, lang, extra = {}) {
    const title = extra.title || titleOf(spec.kind, spec.subject, lang, spec.topic);
    const tl = extra.time_limit != null ? extra.time_limit : Math.round(spec.ids.length * MIN_PER[spec.kind] / 60);
    const { id } = db.run('INSERT INTO exam_attempts(user_id, kind, subject, title, items, answers, assignment_id, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [user.id, spec.kind, spec.subject, title, JSON.stringify({ ids: spec.ids, seed: spec.seed, time_limit: tl }), null, extra.assignment_id || null, 'open', nowIso()]);
    return attemptView(db.get('SELECT * FROM exam_attempts WHERE id = ?', [id]), lang);
  }
  function attemptView(a, lang) {
    const meta = JSON.parse(a.items); const P = perms(meta.ids, meta.seed);
    const items = meta.ids.map((id, i) => { const it = getItem(id); return it ? view(it, P[i], lang) : null; }).filter(Boolean);
    const ctx = {}; for (const it of items) if (it.c && CTX[it.c]) ctx[it.c] = CTX[it.c];
    return { id: a.id, kind: a.kind, subject: a.subject, title: a.title, time_limit: meta.time_limit, status: a.status, created_at: a.created_at, items, ctx, assignment_id: a.assignment_id };
  }
  function recommend(subject, tp, lang, g = 9) {
    const subs = CAT_MAP[subject] || [subject]; const words = String(tp || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(w => w.length >= 4).map(w => w.slice(0, 5));
    if (!words.length) return [];
    const out = [];
    for (const t of CAT.TOPICS.values()) {
      if (!subs.includes(t.subject)) continue; const title = String(t.kk || '').toLowerCase();
      if (words.some(w => title.includes(w))) out.push({ id: t.id, title: t[lang] || t.kk, grade: t.grade, subject: t.subject });
    }
    return out.sort((a, b) => Math.abs(a.grade - g) - Math.abs(b.grade - g)).slice(0, 3);
  }
  function grade(a, answers, lang) {
    const meta = JSON.parse(a.items); const P = perms(meta.ids, meta.seed);
    let score = 0, max = 0; const byTopic = {}; const review = []; const lvStat = {};
    meta.ids.forEach((id, i) => {
      const it = getItem(id); if (!it) return; const perm = P[i]; const pts = check(it, perm, answers[i]); const mx = maxPts(it);
      score += pts; max += mx;
      const key = it.tp || '—'; const bt = byTopic[key] || (byTopic[key] = { topic: key, subject: it.s, g: it.g, score: 0, max: 0, n: 0 }); bt.score += pts; bt.max += mx; bt.n++;
      if (it.lv && typeof it.lv === 'number') { const s = lvStat[it.lv] || (lvStat[it.lv] = [0, 0]); s[0] += pts / mx; s[1]++; }
      const inv = perm ? perm.map((orig, shown) => [orig, shown]).reduce((m, [o, s]) => (m[o] = s, m), {}) : null;
      const correct = it.ty === 'n' ? it.a : it.ty === 's' ? inv[it.a] : it.a.map(x => inv[x]).sort();
      review.push({ id: it.id, pts, max: mx, given: answers[i] == null ? null : answers[i], correct, sol: it.sol || '', hint: it.hint || null });
    });
    const topics = Object.values(byTopic).map(t => ({ ...t, percent: Math.round(t.score / t.max * 100) })).sort((x, y) => x.percent - y.percent);
    const weak = topics.filter(t => t.percent < 60).slice(0, 5).map(t => ({ ...t, lessons: recommend(t.subject, t.topic, lang, t.g) }));
    let pisaLevel = null;
    if (a.kind === 'pisa') { pisaLevel = 0; let acc = 0, n = 0; for (let L = 1; L <= 6; L++) { const s = lvStat[L]; if (s) { acc += s[0]; n += s[1]; } if (n && acc / n >= 0.6 && (s || L === 1)) pisaLevel = L; else if (s) break; } pisaLevel = Math.max(1, pisaLevel); }
    return { score, max, percent: max ? Math.round(score / max * 100) : 0, topics, weak, review, pisaLevel };
  }

  app.get('/api/exam/catalog', auth(), (req, res) => {
    const L = LIDX[req.lang] || 0; const out = {};
    for (const it of ITEMS.values()) {
      const k = out[it.k] || (out[it.k] = { total: 0, subjects: {} }); k.total++;
      const s = k.subjects[it.s] || (k.subjects[it.s] = { id: it.s, name: SUBJ[it.s] ? SUBJ[it.s][L] : it.s, n: 0, topics: {}, grades: {}, levels: {}, multi: 0, ctx: 0 });
      s.n++; if (it.tp) s.topics[it.tp] = (s.topics[it.tp] || 0) + 1; if (it.ty === 'm') s.multi++; if (it.c) s.ctx++;
      if (it.k === 'olymp') { s.grades[it.g] = (s.grades[it.g] || 0) + 1; s.levels[it.lv] = (s.levels[it.lv] || 0) + 1; }
    }
    const aiN = db.get('SELECT COUNT(*) AS n FROM exam_items_ai').n;
    res.json({ kinds: out, total: ITEMS.size, ai_items: aiN, ai: ai.status().enabled, levels: LVL });
  });
  app.post('/api/exam/start', auth(), wrap(async (req, res) => {
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    if (b.assignment_id) {
      const as = db.get('SELECT e.* FROM exam_assignments e JOIN class_members m ON m.class_id = e.class_id WHERE e.id = ? AND m.student_id = ?', [+b.assignment_id, req.user.id]);
      if (!as) throw httpErr(404, 'exam_nf');
      const meta = JSON.parse(as.items);
      return res.json({ attempt: startAttempt(req.user, { kind: as.kind, subject: as.subject, ids: meta.ids, seed: meta.seed }, lang, { title: as.title, time_limit: as.time_limit, assignment_id: as.id }) });
    }
    const spec = buildSpec(b); spec.topic = b.topic || null;
    res.json({ attempt: startAttempt(req.user, spec, lang, { time_limit: b.untimed ? 0 : undefined }) });
  }));
  app.get('/api/exam/attempt/:id', auth(), wrap(async (req, res) => {
    const a = db.get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [+req.params.id, req.user.id]); if (!a) throw httpErr(404, 'exam_nf');
    const v = attemptView(a, req.lang);
    if (a.status === 'done') { v.result = { score: a.score, max: a.max, percent: a.percent, ...JSON.parse(a.by_topic || '{}') }; v.answers = JSON.parse(a.answers || '[]'); }
    res.json({ attempt: v });
  }));
  app.post('/api/exam/attempt/:id/submit', auth(), wrap(async (req, res) => {
    const a = db.get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [+req.params.id, req.user.id]); if (!a) throw httpErr(404, 'exam_nf');
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    if (a.status === 'done') throw httpErr(400, 'exam_done');
    const answers = (Array.isArray(b.answers) ? b.answers : []).slice(0, 60).map(x => Array.isArray(x) ? x.slice(0, 6).map(Number) : x == null ? null : typeof x === 'number' ? x : String(x).slice(0, 40));
    const g = grade(a, answers, lang); const time = Math.max(0, Math.min(6 * 3600000, +b.time_ms || 0));
    const hintsUsed = Math.max(0, Math.min(60, +b.hints || 0));
    db.run('UPDATE exam_attempts SET answers = ?, score = ?, max = ?, percent = ?, by_topic = ?, time_ms = ?, status = ?, finished_at = ? WHERE id = ?',
      [JSON.stringify(answers), g.score, g.max, g.percent, JSON.stringify({ topics: g.topics, weak: g.weak, review: g.review, pisaLevel: g.pisaLevel }), time, 'done', nowIso(), a.id]);
    const today = db.get("SELECT COUNT(*) AS n FROM exam_attempts WHERE user_id = ? AND status = 'done' AND finished_at >= ?", [req.user.id, new Date(Date.now() - 864e5).toISOString()]).n;
    let xp = Math.round(g.percent / 4) + Math.min(20, g.review.length) - hintsUsed * 2; if (today > 5) xp = Math.round(xp / 3); xp = Math.max(2, xp);
    const { nu } = awardXp(req.user, xp);
    res.json({ result: { ...g, xp, time_ms: time }, user: pub(nu) });
  }));
  app.get('/api/exam/history', auth(), (req, res) => {
    const rows = db.all("SELECT id, kind, subject, title, score, max, percent, time_ms, status, created_at, finished_at, assignment_id FROM exam_attempts WHERE user_id = ? ORDER BY id DESC LIMIT 50", [req.user.id]);
    const weakAgg = {};
    for (const r of db.all("SELECT by_topic FROM exam_attempts WHERE user_id = ? AND status = 'done' ORDER BY id DESC LIMIT 20", [req.user.id])) {
      try { for (const t of JSON.parse(r.by_topic).topics || []) { const w = weakAgg[t.subject + '|' + t.topic] || (weakAgg[t.subject + '|' + t.topic] = { subject: t.subject, topic: t.topic, score: 0, max: 0 }); w.score += t.score; w.max += t.max; } } catch (e) { /* */ }
    }
    const weak = Object.values(weakAgg).map(w => ({ ...w, percent: Math.round(w.score / w.max * 100) })).filter(w => w.max >= 2 && w.percent < 60).sort((a, b) => a.percent - b.percent).slice(0, 6)
      .map(w => ({ ...w, lessons: recommend(w.subject, w.topic, req.lang) }));
    res.json({ attempts: rows, weak });
  });
  /* AI генератор */
  app.post('/api/exam/generate', auth(), wrap(async (req, res) => {
    const b = req.body || {}; const lang = LANGS.includes(b.lang) ? b.lang : req.lang;
    const kind = KINDS.includes(b.kind) ? b.kind : 'ubt'; const subject = SUBJ[b.subject] ? b.subject : 'math';
    const topic = String(b.topic || '').trim().slice(0, 120); const n = Math.max(3, Math.min(10, +b.n || 5)); const g = Math.max(5, Math.min(11, +b.grade || (kind === 'ubt' ? 11 : kind === 'pisa' ? 9 : 8)));
    if (!ai.status().enabled) throw httpErr(503, 'ai_off');
    const L = { kk: 'Kazakh', ru: 'Russian', en: 'English' }[subject === 'eng' ? 'en' : lang];
    const fmt = kind === 'ubt' ? 'Kazakhstan ҰБТ/ЕНТ (Unified National Testing) format: mostly single-choice with 4 options (ty "s"); about 1 in 4 multiple-choice with 6 options and 2–3 correct (ty "m").'
      : kind === 'pisa' ? 'OECD PISA style: each task is a realistic everyday situation described INSIDE the question text (numbers, short data), testing literacy and reasoning, not memorised facts. Mix single-choice (4 options, ty "s") and numeric answer (ty "n"). Add "lv" 1–6 (PISA proficiency level).'
      : 'Olympiad style (school/district/region level): non-standard problems requiring insight. Prefer numeric answers (ty "n"); give a short "hint" and a complete step-by-step "sol". Add "lv": "school"|"district"|"region".';
    const msgs = [{ role: 'system', content: 'You are an expert exam author for Kazakhstan schools. Every answer must be mathematically/factually verified. Output ONE JSON object only.' },
      { role: 'user', content: `Create ${n + 2} NEW test items. Subject: ${SUBJ[subject][2]}. ${topic ? 'Topic: "' + topic + '". ' : ''}Grade: ${g}. ${fmt}
Language of items: ${L}. Use LaTeX in $...$ for formulas (escape backslashes in JSON as \\\\).
Schema: {"items":[{"ty":"s","tp":"short topic name","q":"question","o":["A","B","C","D"],"a":0,"sol":"worked solution"} | {"ty":"m","tp":..,"q":..,"o":[6 options],"a":[indices],"sol":..} | {"ty":"n","tp":..,"q":..,"a":"number","sol":..,"hint":".."}]}
Rules: options must be distinct and plausible; vary the position of the correct answer; numeric answers are plain numbers (use . for decimals); solve each item yourself before writing the key.` }];
    try {
      const r = await ai.complete(msgs, { json: true, tier: 'quality', temperature: 0.6, timeoutMs: 90000,
        validate: (txt) => { const o = ai.parseJson(txt); const list = (Array.isArray(o) ? o : o.items || []).map(x => validItem(x, kind, subject, g)).filter(Boolean); if (list.length < Math.min(3, n)) throw new Error('too few valid items'); return list; } });
      const ids = [];
      for (const it of r.value.slice(0, n)) { if (!it.tp) it.tp = topic || SUBJ[subject][0]; const id = 'ai-' + crypto.randomBytes(5).toString('hex'); db.run('INSERT INTO exam_items_ai(id, user_id, data, created_at) VALUES (?,?,?,?)', [id, req.user.id, JSON.stringify(it), nowIso()]); ids.push(id); }
      const spec = { kind, subject, topic, ids, seed: crypto.randomInt(1, 2 ** 31) };
      const L2 = LIDX[lang] || 0;
      res.json({ attempt: startAttempt(req.user, spec, lang, { title: `AI · ${titleOf(kind, subject, lang, topic)}` + (L2 === 0 ? '' : '') }), model: r.model });
    } catch (e) { if (e.status) throw e; res.status(503).json({ error: I.t(lang, ai.errKey(e)), key: ai.errKey(e) }); }
  }));
  /* Мұғалім: сыныпқа тест тапсыру */
  app.post('/api/exam/assign', auth('teacher'), wrap(async (req, res) => {
    const b = req.body || {}; const c = db.get('SELECT * FROM classes WHERE id = ? AND teacher_id = ?', [+b.class_id, req.user.id]); if (!c) throw httpErr(404, 'not_found');
    let spec;
    if (b.attempt_id) { const a = db.get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [+b.attempt_id, req.user.id]); if (!a) throw httpErr(404, 'exam_nf'); const m = JSON.parse(a.items); spec = { kind: a.kind, subject: a.subject, ids: m.ids, seed: m.seed }; }
    else spec = buildSpec(b);
    const title = String(b.title || '').trim().slice(0, 160) || titleOf(spec.kind, spec.subject, req.lang, b.topic);
    const tl = Math.max(0, Math.min(300, b.time_limit != null ? +b.time_limit : Math.round(spec.ids.length * MIN_PER[spec.kind] / 60)));
    const { id } = db.run('INSERT INTO exam_assignments(class_id, teacher_id, title, kind, subject, items, time_limit, due_at, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [c.id, req.user.id, title, spec.kind, spec.subject, JSON.stringify({ ids: spec.ids, seed: spec.seed }), tl, b.due_at ? String(b.due_at).slice(0, 20) : null, nowIso()]);
    res.json({ assignment: { id, title, n: spec.ids.length, time_limit: tl } });
  }));
  app.get('/api/exam/assignments', auth(), (req, res) => {
    if (req.user.role === 'teacher') {
      const rows = db.all('SELECT e.*, c.name AS class_name, (SELECT COUNT(*) FROM class_members m WHERE m.class_id = e.class_id) AS n_students FROM exam_assignments e JOIN classes c ON c.id = e.class_id WHERE e.teacher_id = ? ORDER BY e.id DESC LIMIT 100', [req.user.id]);
      return res.json({ assignments: rows.map(r => { const s = db.get("SELECT COUNT(DISTINCT user_id) AS done, AVG(percent) AS avg FROM exam_attempts WHERE assignment_id = ? AND status = 'done'", [r.id]); return { id: r.id, title: r.title, kind: r.kind, subject: r.subject, class_id: r.class_id, class_name: r.class_name, n: JSON.parse(r.items).ids.length, time_limit: r.time_limit, due_at: r.due_at, created_at: r.created_at, n_students: r.n_students, done: s.done, avg: s.avg == null ? null : Math.round(s.avg) }; }) });
    }
    const rows = db.all('SELECT e.*, c.name AS class_name FROM exam_assignments e JOIN class_members m ON m.class_id = e.class_id JOIN classes c ON c.id = e.class_id WHERE m.student_id = ? ORDER BY e.id DESC LIMIT 100', [req.user.id]);
    res.json({ assignments: rows.map(r => { const s = db.get("SELECT MAX(percent) AS best, COUNT(*) AS n FROM exam_attempts WHERE assignment_id = ? AND user_id = ? AND status = 'done'", [r.id, req.user.id]); return { id: r.id, title: r.title, kind: r.kind, subject: r.subject, class_name: r.class_name, n: JSON.parse(r.items).ids.length, time_limit: r.time_limit, due_at: r.due_at, created_at: r.created_at, mine: s.n ? { best: s.best, n: s.n } : null }; }) });
  });
  app.get('/api/exam/assignments/:id/results', auth('teacher'), wrap(async (req, res) => {
    const as = db.get('SELECT * FROM exam_assignments WHERE id = ? AND teacher_id = ?', [+req.params.id, req.user.id]); if (!as) throw httpErr(404, 'exam_nf');
    const students = db.all('SELECT u.id, u.name, u.avatar FROM users u JOIN class_members m ON m.student_id = u.id WHERE m.class_id = ? ORDER BY u.name', [as.class_id]);
    const topicAgg = {};
    const rows = students.map(s => {
      const best = db.get("SELECT * FROM exam_attempts WHERE assignment_id = ? AND user_id = ? AND status = 'done' ORDER BY percent DESC, id DESC LIMIT 1", [as.id, s.id]);
      const n = db.get("SELECT COUNT(*) AS n FROM exam_attempts WHERE assignment_id = ? AND user_id = ? AND status = 'done'", [as.id, s.id]).n;
      if (best) try { for (const t of JSON.parse(best.by_topic).topics || []) { const w = topicAgg[t.topic] || (topicAgg[t.topic] = { topic: t.topic, score: 0, max: 0 }); w.score += t.score; w.max += t.max; } } catch (e) { /* */ }
      return { id: s.id, name: s.name, avatar: s.avatar, attempts: n, best: best ? { score: best.score, max: best.max, percent: best.percent, time_ms: best.time_ms, finished_at: best.finished_at } : null };
    });
    const topics = Object.values(topicAgg).map(t => ({ ...t, percent: Math.round(t.score / t.max * 100) })).sort((a, b) => a.percent - b.percent);
    res.json({ assignment: { id: as.id, title: as.title, kind: as.kind, time_limit: as.time_limit, n: JSON.parse(as.items).ids.length }, students: rows, topics });
  }));
  return { ITEMS, CTX, SUBJ, check, validItem };
};
module.exports.ITEMS = ITEMS; module.exports.CTX = CTX; module.exports.SUBJ = SUBJ; module.exports.check = check; module.exports.validItem = validItem;
