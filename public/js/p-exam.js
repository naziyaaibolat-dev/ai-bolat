'use strict';
/* ===== v3: ҰБТ · PISA · Олимпиада ===== */
const EXAM_KINDS = [['ubt', '🎓', 'ҰБТ'], ['pisa', '🌍', 'PISA'], ['olymp', '🏆', 'ex_olymp']];
const LVL_NAME = (l) => T('ex_lv_' + l);
function ctxHtml(c) {
  if (!c) return '';
  let h = `<div class="ctxp"><div class="ctxh">📄 ${esc(c.title || '')}</div>`;
  if (c.md) h += `<div class="md">${mdToHtml(c.md)}</div>`;
  if (c.table) h += `<div class="table-wrap"><table><thead><tr>${c.table.head.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${c.table.rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (c.chart) h += chartSvg(c.chart);
  return h + '</div>';
}
function chartSvg(ch) {
  const W = 460, H = 220, P = 36, n = ch.values.length; const max = Math.max(...ch.values) * 1.15 || 1, min = Math.min(0, Math.min(...ch.values));
  const X = (i) => P + (i + .5) * (W - P - 10) / n, Y = (v) => H - 28 - (v - min) / (max - min) * (H - 50);
  let g = ''; for (let k = 0; k <= 4; k++) { const v = min + (max - min) * k / 4; g += `<line x1="${P}" x2="${W - 6}" y1="${Y(v)}" y2="${Y(v)}" class="cgl"/><text x="${P - 6}" y="${Y(v) + 4}" class="cty">${Math.round(v * 10) / 10}</text>`; }
  let body = '';
  if (ch.type === 'line') { body = `<polyline points="${ch.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}" class="cline"/>` + ch.values.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="4.5" class="cdot"/><text x="${X(i)}" y="${Y(v) - 9}" class="cval">${v}</text>`).join(''); }
  else { const bw = (W - P - 10) / n * .6; body = ch.values.map((v, i) => `<rect x="${X(i) - bw / 2}" y="${Y(v)}" width="${bw}" height="${Y(min) - Y(v)}" rx="5" class="cbar"/><text x="${X(i)}" y="${Y(v) - 6}" class="cval">${v}</text>`).join(''); }
  return `<figure class="chart"><figcaption>${esc(ch.title || '')}${ch.unit ? ` (${esc(ch.unit)})` : ''}</figcaption><svg viewBox="0 0 ${W} ${H}">${g}${body}${ch.labels.map((l, i) => `<text x="${X(i)}" y="${H - 8}" class="ctx">${esc(l)}</text>`).join('')}</svg></figure>`;
}
route('exam', async (view, r) => {
  if (r.args[0] === 't') return examRun(view, +r.args[1]);
  if (r.args[0] === 'r') return examResult(view, +r.args[1]);
  const cat = await api('GET', '/api/exam/catalog'); const u = State.user; const isT = u.role === 'teacher';
  let tab = r.query.tab || 'ubt';
  const tabs = [...EXAM_KINDS.map(([k, ic, l]) => [k, ic + ' ' + (l.startsWith('ex_') ? T(l) : l)]), ['mine', '📊 ' + T('ex_mine')], ...(isT ? [['teach', '🧑‍🏫 ' + T('ex_teach')]] : [])];
  const kc = (k) => (cat.kinds[k] || { total: 0 }).total;
  view.innerHTML = `<div class="page"><div class="exhero"><div><div class="eyebrow">${T('ex_eyebrow')}</div><h1>ҰБТ · PISA · ${T('ex_olymp')}</h1><p class="muted">${T('ex_sub')}</p></div>
    <div class="exstats"><div><b>${kc('ubt')}</b><span>ҰБТ</span></div><div><b>${kc('pisa')}</b><span>PISA</span></div><div><b>${kc('olymp')}</b><span>${T('ex_olymp')}</span></div>${cat.ai_items ? `<div><b>${cat.ai_items}</b><span>AI</span></div>` : ''}</div></div>
    <div class="tabs" id="exTabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}</div><div id="exBody"></div></div>`;
  const body = $('#exBody', view);
  $$('#exTabs button', view).forEach(b => b.onclick = () => { tab = b.dataset.t; $$('#exTabs button', view).forEach(x => x.classList.toggle('on', x === b)); history.replaceState(null, '', '#/exam?tab=' + tab); draw(); });
  const draw = async () => {
    if (tab === 'mine') return drawMine(body);
    if (tab === 'teach') return drawTeach(body);
    const K = cat.kinds[tab] || { subjects: {} }; const subs = Object.values(K.subjects);
    body.innerHTML = `${tab === 'ubt' ? `<div class="card exfeat hov" id="miniU"><div class="efi">🎓</div><div class="grow"><h2>${T('ex_mini')}</h2><p class="muted small">${T('ex_mini_d')}</p></div><button class="btn pri">▶ ${T('ex_start')}</button></div>` : ''}
      <p class="muted small" style="margin:14px 2px">${T('ex_note_' + tab)}</p>
      <div class="exgrid">${subs.map(s => `<button class="exsub" data-s="${s.id}"><span class="exi">${EX_ICON[s.id] || '📘'}</span><b>${esc(s.name)}</b><small>${T('ex_n_items', { n: s.n })}${s.multi ? ' · ' + T('ex_multi_n', { n: s.multi }) : ''}${s.ctx ? ' · ' + T('ex_ctx_n', { n: s.ctx }) : ''}</small>
        <span class="extops">${Object.keys(s.topics).slice(0, 4).map(t => `<i>${esc(t)}</i>`).join('')}${Object.keys(s.topics).length > 4 ? `<i>+${Object.keys(s.topics).length - 4}</i>` : ''}</span></button>`).join('')}</div>
      ${cat.ai ? `<div class="card aigen"><div class="row between wrap"><div><h2>✨ ${T('ex_ai_t')}</h2><p class="muted small">${T('ex_ai_d')}</p></div></div>
        <div class="aigrid"><select class="in" id="agS">${subs.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}${tab === 'ubt' ? '' : ''}</select><input class="in" id="agT" placeholder="${esc(T('ex_ai_topic'))}"><select class="in" id="agG">${[5, 6, 7, 8, 9, 10, 11].map(g => `<option ${g === (tab === 'ubt' ? 11 : tab === 'pisa' ? 9 : 8) ? 'selected' : ''}>${g}</option>`).join('')}</select><select class="in" id="agN">${[3, 5, 8, 10].map(n => `<option ${n === 5 ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="btn pri" id="agGo">✨ ${T('ex_ai_go')}</button></div><div id="agBox"></div></div>` : ''}`;
    const mu = $('#miniU', body); if (mu) mu.onclick = () => startExam({ kind: 'ubt', variant: 'mini' });
    $$('.exsub', body).forEach(b => b.onclick = () => setupModal(tab, K.subjects[b.dataset.s]));
    const ag = $('#agGo', body); if (ag) ag.onclick = async () => { const box = $('#agBox', body); ag.disabled = true; box.innerHTML = `<div class="row small muted" style="margin-top:10px"><span class="dots"><i></i><i></i><i></i></span> ${T('ex_ai_wait')}</div>`;
      try { const res = await api('POST', '/api/exam/generate', { kind: tab, subject: $('#agS', body).value, topic: $('#agT', body).value, grade: +$('#agG', body).value, n: +$('#agN', body).value, lang: LANG }); location.hash = '#/exam/t/' + res.attempt.id; }
      catch (e) { box.innerHTML = aiErrHtml(e.message, 'agR'); $('#agR', box).onclick = () => ag.click(); } finally { ag.disabled = false; } };
  };
  const setupModal = (kind, s) => {
    const topics = Object.entries(s.topics).sort((a, b) => b[1] - a[1]); const grades = Object.keys(s.grades || {}).sort((a, b) => a - b); const levels = Object.keys(s.levels || {});
    modal(`<h2>${EX_ICON[s.id] || '📘'} ${esc(s.name)}</h2><p class="muted small">${kind === 'ubt' ? 'ҰБТ' : kind === 'pisa' ? 'PISA' : T('ex_olymp')} · ${T('ex_n_items', { n: s.n })}</p>
      <div class="field"><label class="f">${T('topic')}</label><select class="in" id="stT"><option value="">${T('ex_all_topics')}</option>${topics.map(([t, n]) => `<option value="${esc(t)}">${esc(t)} (${n})</option>`).join('')}</select></div>
      ${kind === 'olymp' ? `<div class="g2 grid"><div class="field"><label class="f">${T('grade')}</label><select class="in" id="stG"><option value="">—</option>${grades.map(g => `<option>${g}</option>`).join('')}</select></div><div class="field"><label class="f">${T('ex_level')}</label><select class="in" id="stL"><option value="">—</option>${levels.map(l => `<option value="${l}">${LVL_NAME(l)}</option>`).join('')}</select></div></div>` : ''}
      <div class="field"><label class="f">${T('ex_count')}</label><input class="in" id="stN" type="number" min="3" max="40" value="${kind === 'olymp' ? 6 : kind === 'pisa' ? 10 : Math.min(20, s.n)}"></div>
      <label class="small"><input type="checkbox" id="stTm" checked> ⏱ ${T('ex_timed')}</label>
      <div class="row" style="margin-top:16px"><button class="btn pri" id="stGo">▶ ${T('ex_start')}</button>${isT ? `<button class="btn" id="stAs">📌 ${T('ex_assign')}</button>` : ''}<button class="btn ghost" id="stCx">${T('cancel')}</button></div>`, (m, close) => {
      const spec = () => ({ kind, subject: s.id, topic: $('#stT', m).value || null, n: +$('#stN', m).value, grade: $('#stG', m) ? +$('#stG', m).value || null : null, level: $('#stL', m) ? $('#stL', m).value || null : null, untimed: !$('#stTm', m).checked });
      $('#stCx', m).onclick = close; $('#stGo', m).onclick = () => { close(); startExam(spec()); };
      const as = $('#stAs', m); if (as) as.onclick = () => { close(); assignExamModal(spec(), s.name); };
    });
  };
  draw();
});
const EX_ICON = { mathlit: '🧮', readlit: '📖', kzhist: '🏛️', worldhist: '🌐', math: '📐', phys: '⚛️', chem: '🧪', bio: '🧬', geo: '🗺️', inf: '💻', eng: '🇬🇧', read: '📚', sci: '🔬' };
async function startExam(spec) { try { const r = await api('POST', '/api/exam/start', Object.assign({ lang: LANG }, spec)); location.hash = '#/exam/t/' + r.attempt.id; } catch (e) { toast('⚠️ ' + esc(e.message)); } }
function assignExamModal(spec, name, attemptId) {
  api('GET', '/api/classes').then(({ classes }) => {
    if (!classes.length) { toast(T('no_classes_t')); location.hash = '#/classes'; return; }
    modal(`<h2>📌 ${T('ex_assign')}</h2><p class="muted">${esc(name || '')}</p>
      <div class="field"><label class="f">${T('n_classes')}</label><select class="in" id="ac">${classes.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label class="f">${T('ex_title')}</label><input class="in" id="at" placeholder="${esc(name || '')}"></div>
      <div class="g2 grid"><div class="field"><label class="f">${T('ex_time_min')}</label><input class="in" id="atl" type="number" min="0" max="300" placeholder="auto"></div><div class="field"><label class="f">${T('due')}</label><input class="in" id="ad" type="date"></div></div>
      <div class="row"><button class="btn pri" id="ok">${T('create')}</button><button class="btn ghost" id="cx">${T('cancel')}</button></div>`, (m, close) => {
      $('#cx', m).onclick = close;
      $('#ok', m).onclick = async () => { try { const b = Object.assign({}, spec || {}, { class_id: +$('#ac', m).value, title: $('#at', m).value, due_at: $('#ad', m).value || null, attempt_id: attemptId || undefined });
        if ($('#atl', m).value !== '') b.time_limit = +$('#atl', m).value; await api('POST', '/api/exam/assign', b); close(); toast('✅ ' + T('saved')); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
    });
  });
}
async function drawMine(body) {
  body.innerHTML = loadingHtml();
  const [h, as] = await Promise.all([api('GET', '/api/exam/history'), State.user.role === 'student' ? api('GET', '/api/exam/assignments') : Promise.resolve({ assignments: [] })]);
  body.innerHTML = `<div class="grid g2 exmine"><div class="stack">
      ${as.assignments.length ? `<div class="card"><h2>📌 ${T('ex_assigned')}</h2><div class="stack">${as.assignments.map(a => `<div class="exrow"><div class="grow"><b>${esc(a.title)}</b><div class="small muted">${esc(a.class_name)} · ${T('ex_n_items', { n: a.n })}${a.time_limit ? ' · ⏱ ' + a.time_limit + ' ' + T('ex_min') : ''}${a.due_at ? ' · 📅 ' + esc(a.due_at) : ''}</div></div>${a.mine ? `<span class="tag">${a.mine.best}%</span>` : ''}<button class="btn sm pri" data-as="${a.id}">▶ ${T('ex_start')}</button></div>`).join('')}</div></div>` : ''}
      <div class="card"><h2>🕘 ${T('ex_history')}</h2>${h.attempts.length ? `<div class="stack">${h.attempts.map(a => `<a class="exrow" href="#/exam/${a.status === 'done' ? 'r' : 't'}/${a.id}"><div class="grow"><b>${esc(a.title)}</b><div class="small muted">${fmtDate(a.created_at)}${a.time_ms ? ' · ⏱ ' + Math.round(a.time_ms / 60000) + ' ' + T('ex_min') : ''}</div></div>${a.status === 'done' ? `<span class="pctb ${a.percent >= 70 ? 'hi' : a.percent >= 40 ? 'mid' : 'lo'}">${a.percent}%</span>` : `<span class="tag">${T('ex_continue')}</span>`}</a>`).join('')}</div>` : emptyHtml('📝', T('ex_no_hist'))}</div></div>
    <div class="card"><h2>🎯 ${T('ex_weak')}</h2>${h.weak.length ? `<div class="stack">${h.weak.map(w => weakHtml(w)).join('')}</div>` : emptyHtml('💪', T('ex_no_weak'))}</div></div>`;
  $$('[data-as]', body).forEach(b => b.onclick = () => startExam({ assignment_id: +b.dataset.as }));
}
function weakHtml(w) { return `<div class="weak"><div class="row between"><b>${esc(w.topic)}</b><span class="pctb lo">${w.percent}%</span></div><div class="bar"><i style="width:${w.percent}%"></i></div>
  ${w.lessons && w.lessons.length ? `<div class="small muted" style="margin-top:6px">${T('ex_rec_lessons')}:</div><div class="row wrap">${w.lessons.map(l => `<a class="btn sm" href="#/lesson/${l.id}">📘 ${esc(l.title)} · ${l.grade}</a>`).join('')}</div>` : ''}</div>`; }
async function drawTeach(body) {
  body.innerHTML = loadingHtml(); const { assignments } = await api('GET', '/api/exam/assignments');
  body.innerHTML = `<div class="card"><div class="row between"><h2>🧑‍🏫 ${T('ex_teach')}</h2><span class="muted small">${T('ex_teach_hint')}</span></div>${assignments.length ? `<div class="table-wrap"><table><thead><tr><th>${T('ex_title')}</th><th>${T('n_classes')}</th><th>${T('ex_count')}</th><th>${T('ex_done')}</th><th>${T('ex_avg')}</th><th></th></tr></thead><tbody>
    ${assignments.map(a => `<tr><td><b>${esc(a.title)}</b><div class="small muted">${fmtDate(a.created_at, false)}${a.due_at ? ' → ' + esc(a.due_at) : ''}</div></td><td>${esc(a.class_name)}</td><td>${a.n}</td><td>${a.done}/${a.n_students}</td><td>${a.avg == null ? '—' : a.avg + '%'}</td><td><button class="btn sm" data-r="${a.id}">📊 ${T('ex_results')}</button></td></tr>`).join('')}</tbody></table></div>` : emptyHtml('📌', T('ex_no_assign'))}</div>`;
  $$('[data-r]', body).forEach(b => b.onclick = async () => { const d = await api('GET', `/api/exam/assignments/${b.dataset.r}/results`);
    modal(`<h2>📊 ${esc(d.assignment.title)}</h2><div class="table-wrap"><table><thead><tr><th>${T('student')}</th><th>${T('ex_score')}</th><th>%</th><th>⏱</th></tr></thead><tbody>${d.students.map(s => `<tr><td>${esc(s.avatar || '')} ${esc(s.name)}</td><td>${s.best ? s.best.score + '/' + s.best.max : '—'}</td><td>${s.best ? `<span class="pctb ${s.best.percent >= 70 ? 'hi' : s.best.percent >= 40 ? 'mid' : 'lo'}">${s.best.percent}%</span>` : `<span class="muted">${T('ex_not_yet')}</span>`}</td><td>${s.best && s.best.time_ms ? Math.round(s.best.time_ms / 60000) + ' ' + T('ex_min') : ''}</td></tr>`).join('')}</tbody></table></div>
      ${d.topics.length ? `<h3 style="margin-top:16px">${T('ex_by_topic')}</h3>${d.topics.map(t => `<div class="tbar"><span>${esc(t.topic)}</span><div class="bar"><i style="width:${t.percent}%"></i></div><b>${t.percent}%</b></div>`).join('')}` : ''}
      <div class="row" style="margin-top:14px"><button class="btn ghost" id="cx">${T('close')}</button></div>`, (m, close) => { $('#cx', m).onclick = close; }); });
}
/* ---------- тест тапсыру ---------- */
async function examRun(view, id) {
  const { attempt: A } = await api('GET', '/api/exam/attempt/' + id);
  if (A.status === 'done') { location.hash = '#/exam/r/' + id; return; }
  const key = 'ab_ex_' + id; let st; try { st = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { st = null; }
  st = st || { ans: A.items.map(() => null), flags: [], hints: [], t0: Date.now() };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) { /* */ } };
  const deadline = A.time_limit ? Date.parse(A.created_at) + A.time_limit * 60000 : null; let cur = 0, timer = null, sending = false;
  const L = 'ABCDEF';
  view.innerHTML = `<div class="page exrun"><div class="exbar"><div class="grow"><div class="eyebrow">${A.kind === 'ubt' ? 'ҰБТ' : A.kind === 'pisa' ? 'PISA' : T('ex_olymp')}</div><h2>${esc(A.title)}</h2></div>
    <div class="extimer ${deadline ? '' : 'off'}" id="xt">⏱ —</div><button class="btn pri" id="xf">🏁 ${T('ex_finish')}</button></div>
    <div class="exlay"><div id="xq"></div><aside class="card exnav"><div class="small muted">${T('ex_nav')}</div><div class="navgrid" id="xn"></div>
      <div class="legend small"><span><i class="lg a"></i>${T('ex_answered')}</span><span><i class="lg f"></i>${T('ex_flagged')}</span></div>
      <div class="small muted" id="xc"></div></aside></div></div>`;
  const answered = (v) => v != null && v !== '' && !(Array.isArray(v) && !v.length);
  const drawNav = () => { $('#xn', view).innerHTML = A.items.map((it, k) => `<button class="nb ${k === cur ? 'cur' : ''} ${answered(st.ans[k]) ? 'a' : ''} ${st.flags[k] ? 'f' : ''}" data-k="${k}">${k + 1}</button>`).join('');
    $$('#xn .nb', view).forEach(b => b.onclick = () => { cur = +b.dataset.k; drawQ(); });
    $('#xc', view).textContent = T('ex_progress', { a: st.ans.filter(answered).length, n: A.items.length }); };
  const drawQ = () => {
    const it = A.items[cur]; const c = it.c ? A.ctx[it.c] : null; const v = st.ans[cur];
    let ans = '';
    if (it.ty === 's') ans = `<div class="exopts">${it.o.map((o, k) => `<button class="exo ${v === k ? 'on' : ''}" data-k="${k}"><span class="lt">${L[k]}</span><span class="md grow">${inl(o)}</span></button>`).join('')}</div>`;
    else if (it.ty === 'm') ans = `<div class="small muted" style="margin-bottom:8px">☑️ ${T('ex_multi_hint')}</div><div class="exopts">${it.o.map((o, k) => `<button class="exo chk ${(v || []).includes(k) ? 'on' : ''}" data-k="${k}"><span class="lt">${(v || []).includes(k) ? '✓' : L[k]}</span><span class="md grow">${inl(o)}</span></button>`).join('')}</div>`;
    else ans = `<div class="fillrow"><input class="in" id="xnIn" inputmode="decimal" placeholder="${esc(T('ex_num_ph'))}" value="${esc(v == null ? '' : v)}" autocomplete="off"></div>`;
    $('#xq', view).innerHTML = `<div class="${c ? 'exsplit' : ''}">${c ? ctxHtml(c) : ''}<div class="card exq pop"><div class="row between"><div class="qtype">${T('ex_q')} ${cur + 1}/${A.items.length} · ${esc(it.tp || '')}${it.lv ? ` · ${typeof it.lv === 'number' ? T('ex_pisa_lv', { n: it.lv }) : LVL_NAME(it.lv)}` : ''}${it.pts > 1 ? ` · <b>${it.pts} ${T('ex_pts')}</b>` : ''}${it.ai ? ' · ✨AI' : ''}</div>
      <button class="btn sm ghost" id="xflag">${st.flags[cur] ? '🚩' : '⚑'} ${T('ex_flag')}</button></div><div class="qtext md">${mdToHtml(it.q)}</div>${ans}
      ${it.hint ? `<div class="exhint">${st.hints[cur] ? `💡 <span class="md">${inl(it.hint)}</span>` : `<button class="btn sm" id="xh">💡 ${T('ex_hint')}</button>`}</div>` : ''}
      <div class="row between" style="margin-top:18px"><button class="btn" id="xp" ${cur ? '' : 'disabled'}>← ${T('prev')}</button><button class="btn pri" id="xnx">${cur < A.items.length - 1 ? T('next') + ' →' : '🏁 ' + T('ex_finish')}</button></div></div></div>`;
    renderMath($('#xq', view));
    $$('.exo', view).forEach(b => b.onclick = () => { const k = +b.dataset.k; if (it.ty === 's') st.ans[cur] = k; else { const s = new Set(st.ans[cur] || []); s.has(k) ? s.delete(k) : s.add(k); st.ans[cur] = [...s].sort(); } save(); drawQ(); drawNav(); });
    const ni = $('#xnIn', view); if (ni) { ni.focus(); ni.oninput = () => { st.ans[cur] = ni.value.trim() || null; save(); drawNav(); }; ni.onkeydown = (e) => { if (e.key === 'Enter') $('#xnx', view).click(); }; }
    $('#xflag', view).onclick = () => { st.flags[cur] = !st.flags[cur]; save(); drawQ(); drawNav(); };
    const xh = $('#xh', view); if (xh) xh.onclick = () => { st.hints[cur] = 1; save(); drawQ(); };
    $('#xp', view).onclick = () => { if (cur) { cur--; drawQ(); drawNav(); } };
    $('#xnx', view).onclick = () => { if (cur < A.items.length - 1) { cur++; drawQ(); drawNav(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else finish(); };
  };
  const finish = async (auto) => {
    if (sending) return; const left = A.items.length - st.ans.filter(answered).length;
    if (!auto && left && !confirm(T('ex_confirm', { n: left }))) return; sending = true; clearInterval(timer);
    try { await api('POST', `/api/exam/attempt/${id}/submit`, { answers: st.ans, time_ms: Date.now() - (deadline ? Date.parse(A.created_at) : st.t0), hints: st.hints.filter(Boolean).length, lang: LANG });
      localStorage.removeItem(key); location.hash = '#/exam/r/' + id; }
    catch (e) { sending = false; toast('⚠️ ' + esc(e.message), 5000); }
  };
  $('#xf', view).onclick = () => finish();
  const tick = () => { const el = $('#xt', view); if (!el) return clearInterval(timer);
    if (!deadline) { const s = Math.floor((Date.now() - st.t0) / 1000); el.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; return; }
    const ms = deadline - Date.now(); if (ms <= 0) { el.textContent = '⏱ 0:00'; toast('⏰ ' + T('ex_time_up'), 4000); finish(true); return; }
    const s = Math.floor(ms / 1000); el.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('hot', s < 300); };
  tick(); timer = setInterval(tick, 1000); drawNav(); drawQ();
  return () => clearInterval(timer);
}
/* ---------- нәтиже және талдау ---------- */
async function examResult(view, id) {
  const { attempt: A } = await api('GET', '/api/exam/attempt/' + id);
  if (A.status !== 'done') { location.hash = '#/exam/t/' + id; return; }
  const R = A.result; const L = 'ABCDEF'; const isT = State.user.role === 'teacher';
  const ubtLike = A.kind === 'ubt';
  view.innerHTML = `<div class="page"><div class="crumbs"><a href="#/exam">🎓 ҰБТ · PISA · ${T('ex_olymp')}</a> › <span>${esc(A.title)}</span></div>
    <div class="grid g2 exres"><div class="card center">${ringHtml(R.percent, `<b style="font-size:30px">${R.percent}%</b><span class="small muted">${R.score}/${R.max} ${T('ex_pts')}</span>`, 150, 12)}
      <h2 style="margin-top:12px">${R.percent >= 70 ? T('ex_res_hi') : R.percent >= 40 ? T('ex_res_mid') : T('ex_res_lo')}</h2>
      ${A.kind === 'pisa' && R.pisaLevel ? `<div class="pisalv"><span>PISA</span><b>${T('ex_pisa_lv', { n: R.pisaLevel })}</b></div>` : ''}
      ${ubtLike ? `<p class="small muted">${T('ex_ubt_scoring')}</p>` : ''}
      <div class="row" style="justify-content:center"><a class="btn" href="#/exam">↩ ${T('ex_back')}</a>${isT ? `<button class="btn" id="rAs">📌 ${T('ex_assign')}</button>` : ''}</div></div>
    <div class="card"><h2>📊 ${T('ex_by_topic')}</h2>${R.topics.map(t => `<div class="tbar"><span>${esc(t.topic)}</span><div class="bar ${t.percent >= 70 ? 'hi' : t.percent >= 40 ? 'mid' : 'lo'}"><i style="width:${Math.max(3, t.percent)}%"></i></div><b>${t.score}/${t.max}</b></div>`).join('')}
      ${R.weak && R.weak.length ? `<h3 style="margin-top:18px">🎯 ${T('ex_weak')}</h3><div class="stack">${R.weak.map(weakHtml).join('')}</div>` : `<div class="banner ok" style="margin-top:14px">💪 ${T('ex_no_weak')}</div>`}</div></div>
    <div class="card" style="margin-top:18px"><h2>🔍 ${T('review')}</h2><div class="stack">${A.items.map((it, k) => { const rv = R.review[k] || {}; const g = A.answers[k]; const full = rv.pts >= rv.max, part = rv.pts > 0 && !full;
      let body = '';
      if (it.ty === 'n') body = `<div class="small">${T('ex_your')}: <b>${g == null || g === '' ? '—' : esc(g)}</b> · ${T('right_answer')}: <b>${esc(rv.correct)}</b></div>`;
      else { const cor = Array.isArray(rv.correct) ? rv.correct : [rv.correct]; const mine = Array.isArray(g) ? g : g == null ? [] : [g];
        body = `<div class="exopts rv">${it.o.map((o, j) => `<div class="exo ${cor.includes(j) ? 'right' : ''} ${mine.includes(j) && !cor.includes(j) ? 'wrong' : ''} ${mine.includes(j) ? 'mine' : ''}"><span class="lt">${L[j]}</span><span class="md grow">${inl(o)}</span>${mine.includes(j) ? '<span class="small">👤</span>' : ''}</div>`).join('')}</div>`; }
      return `<details class="rvi ${full ? 'ok' : part ? 'part' : 'no'}" ${full ? '' : 'open'}><summary><span class="rvs">${full ? '✅' : part ? '🟡' : '❌'}</span><b>${k + 1}.</b> <span class="grow md rvq">${inl(it.q.length > 140 ? it.q.slice(0, 140) + '…' : it.q)}</span><span class="tag">${rv.pts}/${rv.max}</span></summary>
        ${it.c && A.ctx[it.c] ? `<div class="small muted">📄 ${esc(A.ctx[it.c].title)}</div>` : ''}<div class="md">${mdToHtml(it.q)}</div>${body}${rv.sol ? `<div class="exsol"><b>📝 ${T('ex_solution')}</b><div class="md">${mdToHtml(rv.sol)}</div></div>` : ''}</details>`; }).join('')}</div></div></div>`;
  renderMath(view);
  if (R.percent >= 70) { confetti(); Sound.play('win'); }
  const ra = $('#rAs', view); if (ra) ra.onclick = () => assignExamModal(null, A.title, A.id);
}
