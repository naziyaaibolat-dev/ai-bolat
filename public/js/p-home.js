'use strict';
/* ===== Басты бет және пәндер каталогы ===== */
function subjCard(s, g) {
  const pct = s.count ? Math.round(s.done / s.count * 100) : 0;
  return `<a class="card hov subj" style="--c:${s.color}" href="#/subject/${s.id}/${g}">
    <div class="ico">${s.icon}</div><h3>${esc(subjName(s))}</h3><div class="muted small">${T('topics_cnt', { n: s.count })}</div>
    <div class="meta"><div class="bar"><i style="width:${pct}%"></i></div><span>${s.stars ? '★ ' + s.stars : ''}</span></div></a>`;
}
function assignRow(a) {
  const t = a.topic; const m = a.mine;
  return `<a class="topic ${m ? 'done' : ''}" href="#/lesson/${a.topic_id}?a=${a.id}"><span class="n">${m ? '✓' : '📌'}</span>
    <span class="t">${esc(a.title)}<br><span class="small muted">${a.class_name ? esc(a.class_name) + ' · ' : ''}${t ? esc(tTitle(t)) : ''}${a.due_at ? ' · ' + T('due') + ': ' + fmtDate(a.due_at, false) : ''}</span></span>
    ${kindTag(a.kind)} ${m ? markHtml(m.mark) : `<span class="btn sm pri">${T('todo')}</span>`}</a>`;
}
function annHtml(a) { return `<div class="ann ${a.is_read === 0 || a.is_read === null ? 'new' : ''}"><div class="small muted">📢 ${esc(a.class_name || '')}${a.teacher_name ? ' · ' + esc(a.teacher_name) : ''} · ${fmtDate(a.created_at)}</div><div class="md">${mdToHtml(a.body)}</div></div>`; }

/* ===== v2 дашборд блоктары ===== */
const WDAYS = [['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'], ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']];
const LOCALE = () => ({ kk: 'kk-KZ', ru: 'ru-RU', en: 'en-GB' })[LANG] || 'en-GB';
function goalCard(d) {
  const pct = Math.min(100, Math.round(d.today_xp / d.goal * 100)); const mx = Math.max(d.goal, ...d.week.map(w => w.xp));
  return `<div class="card goalcard"><div class="row between"><h2>🎯 ${T('daily_goal')}</h2><span class="tag ${pct >= 100 ? 'ai' : ''}">${pct >= 100 ? '✅ ' + T('goal_done') : d.today_xp + ' / ' + d.goal + ' XP'}</span></div>
    <div class="row" style="gap:20px;align-items:center">${ringHtml(pct, `<div><b style="font-size:24px">${pct}%</b><span>${T('today')}</span></div>`, 110, 10)}
    <div class="grow"><div class="wbars">${d.week.map((w, k) => `<div class="wb ${k === 6 ? 'today' : ''}" title="${w.xp} XP"><i style="height:${Math.max(4, w.xp / mx * 100)}%"></i><span>${WDAYS[LANGS[LANG]][new Date(w.day + 'T12:00').getDay()]}</span></div>`).join('')}</div>
    <p class="small muted" style="margin:6px 0 0">${pct >= 100 ? T('goal_done_sub') : T('goal_left', { n: d.goal - d.today_xp })}</p></div></div></div>`;
}
function continueCard(d, subjects) {
  return `<div class="card"><div class="row between"><h2>▶️ ${T('continue')}</h2><a class="small" href="#/learn">${T('all_subjects')} →</a></div>
    ${d.continue.length ? `<div class="contgrid">${d.continue.map(p => { const s = (subjects || []).find(x => x.id === p.topic.subject) || {};
      return `<a class="contcard hov" href="#/lesson/${p.topic_id}" style="--c:${s.color || 'var(--a1)'}"><span class="ci">${s.icon || '📘'}</span><span class="grow"><b>${esc(tTitle(p.topic))}</b><span class="small muted">${T('grade')} ${p.topic.grade} · ${p.best_percent ? p.best_percent + "%" : ""}</span></span>${starsHtml(p.stars || 0)}</a>`; }).join('')}</div>`
      : `<div class="empty-mini">🚀 ${T('continue_empty')} <a class="btn sm pri" href="#/learn">📚 ${T('open_catalog')}</a></div>`}</div>`;
}
function labPromo(d) {
  const recent = (d.labs || []).map(l => LAB_META.find(m => m.id === l.lab_id)).filter(Boolean).slice(0, 3);
  const picks = recent.length ? recent : ['solids', 'atom', 'solar'].map(id => LAB_META.find(m => m.id === id));
  return `<div class="card labpromo"><div class="row between" style="position:relative;z-index:1"><div class="grow"><span class="tag ai">NEW · 3D</span><h2 style="margin-top:6px">🔬 ${T('lab_title')}</h2><p class="muted small" style="max-width:420px">${T('lab_sub')}</p>
    <div class="row">${picks.map(m => `<a class="btn sm" href="#/lab/${m.id}">${m.icon} ${esc(labName(m))}</a>`).join('')}<a class="btn sm pri" href="#/lab">${T('lab_all')} →</a></div></div>
    <div class="orbit3d sm"><i></i><i></i><i></i><b>⚛️</b></div></div></div>`;
}
function badgesCard(d, full) {
  const got = d.badges.filter(b => b.got).length; const list = full ? d.badges : [...d.badges.filter(b => b.got), ...d.badges.filter(b => !b.got)].slice(0, 10);
  return `<div class="card"><div class="row between"><h2>🏅 ${T('achievements')}</h2><span class="tag">${got}/${d.badges.length}</span></div>
    <div class="badges">${list.map(b => `<div class="bdg ${b.got ? 'got' : ''}" title="${esc(T('bd_' + b.id))}"><span>${b.icon}</span><b>${esc(T('b_' + b.id))}</b>${full ? `<small>${esc(T('bd_' + b.id))}</small>` : ''}</div>`).join('')}</div>
    ${full ? '' : `<a class="small" href="#/profile">${T('view_all')} →</a>`}</div>`;
}
function boardsCard(d, lbGlobal) {
  const u = State.user; const boards = d.boards.filter(b => b.users.length);
  const tabs = boards.map(b => ({ id: 'c' + b.id, name: b.name, users: b.users, week: true }));
  if (lbGlobal) tabs.push({ id: 'all', name: T('lb_all'), users: lbGlobal, week: false });
  if (!tabs.length) return '';
  return `<div class="card boards"><h2>🏆 ${T('leaderboard')}</h2><div class="chips sm">${tabs.map((t, k) => `<button class="chip ${k ? '' : 'on'}" data-b="${t.id}">${esc(t.name)}</button>`).join('')}</div>
    ${tabs.map((t, k) => `<div class="board" data-b="${t.id}" ${k ? 'hidden' : ''}>${t.users.slice(0, 8).map((x, i) => `<div class="lb ${x.id === u.id ? 'me' : ''}"><span class="pl ${i < 3 ? 'p' + i : ''}">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><span class="ava sm">${esc(x.avatar || '🙂')}</span><span class="grow">${esc(x.name)}${x.id === u.id ? ' (' + T('you') + ')' : ''}<br><span class="small muted">${T('level')} ${x.level || 1}</span></span><b>${t.week ? x.week_xp + ' XP <small class="muted">/' + T('week') + '</small>' : x.xp + ' XP'}</b></div>`).join('')}</div>`).join('')}</div>`;
}
function wireBoards(view) { $$('.boards .chip', view).forEach(b => b.onclick = () => { $$('.boards .chip', view).forEach(x => x.classList.toggle('on', x === b)); $$('.board', view).forEach(x => x.hidden = x.dataset.b !== b.dataset.b); }); }
route('', async (view) => {
  const u = State.user; const L = levelInfo(u);
  if (u.role === 'teacher') {
    const [cl, ct, an, dd] = await Promise.all([api('GET', '/api/classes'), api('GET', '/api/contacts'), api('GET', '/api/announcements'), api('GET', '/api/dashboard')]);
    const nStud = cl.classes.reduce((a, c) => a + c.n_students, 0), nA = cl.classes.reduce((a, c) => a + c.n_assign, 0), nQ = ct.contacts.reduce((a, c) => a + c.questions, 0);
    const qs = ct.contacts.filter(c => c.unread);
    view.innerHTML = `<div class="page stack">
      <div class="hero"><div class="row between"><div><h1>${T('hello_t', { n: esc(u.name.split(' ')[0]) })} 👋</h1><p class="muted" style="max-width:560px">${T('home_sub_t')}</p>
        <div class="row" style="margin-top:14px"><a class="btn pri" href="#/classes">🏫 ${T('new_class')}</a><a class="btn" href="#/learn">📚 ${T('open_catalog')}</a><a class="btn" href="#/bolat">🤖 ${T('ask_bolat')}</a></div></div>
        <img src="/img/bolat.svg" style="width:130px;position:relative;z-index:1" class="floaty"></div></div>
      <div class="grid g4">${[['🏫', cl.classes.length, 'classes_n'], ['👥', nStud, 'students_n'], ['📌', nA, 'assign_n'], ['❓', nQ, 'questions_n']].map(([i, n, k]) => `<div class="card"><div style="font-size:26px">${i}</div><div style="font-size:34px;font-weight:900" class="grad-t">${n}</div><div class="muted small">${T(k)}</div></div>`).join('')}</div>
      <div class="grid g2">
        <div class="card"><div class="row between"><h2>🏫 ${T('my_classes')}</h2><a href="#/classes" class="small">${T('view_all')}</a></div>
          ${cl.classes.length ? cl.classes.slice(0, 5).map(c => `<a class="topic" href="#/class/${c.id}" style="margin-bottom:8px"><span class="n">${c.grade || '•'}</span><span class="t">${esc(c.name)}<br><span class="small muted">👥 ${c.n_students} · 📌 ${c.n_assign}</span></span><span class="joincode sm">${c.join_code}</span></a>`).join('') : emptyHtml('🏫', T('no_classes_t'))}</div>
        <div class="card"><div class="row between"><h2>💬 ${T('n_messages')}</h2><a href="#/messages" class="small">${T('view_all')}</a></div>
          ${qs.length ? qs.map(c => `<a class="citem" href="#/messages/${c.user.id}"><span class="ava sm">${esc(c.user.avatar || '🙂')}</span><span class="grow"><span class="nm">${esc(c.user.name)}</span> ${c.questions ? `<span class="tag hw">❓ ${T('question')}</span>` : ''}<div class="lm">${esc(c.last ? c.last.body : '')}</div></span><span class="badge">${c.unread}</span></a>`).join('') : emptyHtml('📭', '—')}</div>
      </div>
      <div class="grid g2">${labPromo(dd)}${boardsCard(dd) || `<div class="card"><h2>🏆 ${T('leaderboard')}</h2>${emptyHtml('🏫', T('no_classes_t'))}</div>`}</div>
      ${an.announcements.length ? `<div class="card"><h2>📢 ${T('announcements')}</h2><div class="stack">${an.announcements.slice(0, 3).map(annHtml).join('')}</div></div>` : ''}
    </div>`;
    wireBoards(view);
    return;
  }
  const g = u.grade || 7;
  const [cat, as, an, lb, rs, dd] = await Promise.all([api('GET', '/api/catalog/grade/' + g), api('GET', '/api/assignments'), api('GET', '/api/announcements'), api('GET', '/api/leaderboard'), api('GET', '/api/results/me'), api('GET', '/api/dashboard')]);
  const stars = cat.subjects.reduce((a, s) => a + s.stars, 0);
  const pending = as.assignments.filter(a => !a.mine), done = as.assignments.filter(a => a.mine);
  view.innerHTML = `<div class="page stack">
    <div class="hero"><div class="row" style="gap:26px;position:relative;z-index:1">
      ${ringHtml(L.pct, `<div><span>${T('level')}</span><b>${u.level}</b><span>${u.xp} XP</span></div>`)}
      <div class="grow"><h1>${T('hello', { n: esc(u.name.split(' ')[0]) })} ${esc(u.avatar || '')}</h1><p class="muted">${T('home_sub_s')}</p>
        <div class="row"><span class="chipxp ${u.streak ? 'fire' : ''}">🔥 ${u.streak} ${T('streak')}</span><span class="chipxp">🎯 ${dd.today_xp}/${dd.goal} XP ${T('today')}</span><span class="chipxp">★ ${stars} ${T('stars_t')}</span><span class="chipxp">🎯 ${T('to_next', { n: L.left })}</span></div></div>
      <img src="/img/bolat.svg" style="width:120px" alt=""></div></div>
    <div class="grid dash2">${goalCard(dd)}${continueCard(dd, cat.subjects)}</div>
    <div class="grid dash2">${labPromo(dd)}${badgesCard(dd)}</div>
    <div class="grid g2">
      <div class="card"><h2>📌 ${T('my_tasks')} ${pending.length ? `<span class="badge">${pending.length}</span>` : ''}</h2>
        <div class="stack">${as.assignments.length ? [...pending, ...done].slice(0, 6).map(assignRow).join('') : emptyHtml('🎒', T('no_tasks'))}</div>
        ${!as.assignments.length ? `<a class="btn sm" href="#/classes">➕ ${T('join_class')}</a>` : ''}</div>
      <div class="stack">
        ${an.announcements.length ? `<div class="card"><h2>📢 ${T('announcements')}</h2><div class="stack">${an.announcements.slice(0, 2).map(annHtml).join('')}</div></div>` : ''}
        ${boardsCard(dd, lb.users)}
      </div>
    </div>
    <div><div class="row between"><h2>📚 ${T('my_subjects', { g })}</h2><a href="#/learn" class="small">${T('all_subjects')} →</a></div>
      <div class="grid auto">${cat.subjects.map(s => subjCard(s, g)).join('')}</div></div>
    ${rs.results.length ? `<div class="card"><h2>🕹️ ${T('recent')}</h2>${rs.results.slice(0, 5).map(r => `<a class="topic" style="margin-bottom:8px" href="#/lesson/${r.topic_id}"><span class="n">${r.percent}%</span><span class="t">${esc(tTitle(r.topic))}<br><span class="small muted">${fmtDate(r.created_at)} · +${r.xp} XP</span></span>${starsHtml(r.stars)} ${markHtml(r.mark)}</a>`).join('')}</div>` : ''}
  </div>`;
  wireBoards(view);
  if (an.announcements.some(a => !a.is_read)) api('POST', '/api/announcements/read').then(pollUnread).catch(() => {});
});
route('learn', async (view, r) => {
  const cat = await getCatalog(); const g = +(r.query.g || (State.user && State.user.grade) || 7);
  const data = await api('GET', '/api/catalog/grade/' + g);
  view.innerHTML = `<div class="page stack">
    <div><h1 class="grad-t">${T('learn_title')}</h1><p class="muted">${T('learn_sub', { s: cat.stats.subjects, t: cat.stats.topics })}</p></div>
    <div class="card"><label class="f">${T('choose_grade')}</label><div class="gchips">${cat.grades.map(x => `<a class="gchip ${x.grade === g ? 'on' : ''}" href="#/learn?g=${x.grade}" title="${x.subjects} · ${x.topics}">${x.grade}</a>`).join('')}</div></div>
    <div class="grid auto">${data.subjects.map(s => subjCard(s, g)).join('')}</div>
    ${cat.counts ? `<details class="card ccount"><summary><b>📊 ${T('cat_counts')}</b> <span class="small muted">· ${cat.stats.topics} / ${cat.stats.sections || ''}</span></summary><div class="tscroll"><table class="ctable cnt"><thead><tr><th></th>${Array.from({ length: 11 }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>${T('total')}</th></tr></thead><tbody>
      ${Object.entries(cat.counts).map(([id, c]) => `<tr><th>${cat.subjects[id].icon} ${esc(subjName(cat.subjects[id]))}</th>${Array.from({ length: 11 }, (_, i) => c.grades[i + 1] ? `<td><a href="#/subject/${id}/${i + 1}">${c.grades[i + 1]}</a></td>` : '<td class="muted">·</td>').join('')}<td><b>${c.total}</b></td></tr>`).join('')}
      <tr><th>${T('total')}</th>${Array.from({ length: 11 }, (_, i) => `<td><b>${Object.values(cat.counts).reduce((a, c) => a + (c.grades[i + 1] || 0), 0)}</b></td>`).join('')}<td><b>${cat.stats.topics}</b></td></tr></tbody></table></div><p class="small muted">📚 ${T('cat_src')}</p></details>` : ''}</div>`;
});
route('subject', async (view, r) => {
  const [subj, g] = r.args; const d = await api('GET', `/api/catalog/${subj}/${g}`);
  const qs = [...new Set(d.topics.map(t => t.q))]; const secs = d.sections || [];
  const done = d.topics.filter(t => t.stars > 0).length; const openSec = r.query.sec !== undefined ? +r.query.sec : null;
  const topicRow = (t) => `<a class="topic ${t.stars ? 'done' : ''}" href="#/lesson/${t.id}" data-q="${esc((t.kk + ' ' + t.ru + ' ' + t.en).toLowerCase())}"><span class="n">${t.o || t.n}</span><span class="t">${esc(tTitle(t))}</span>${labsForTopic({ ...t, subject: subj }).length ? '<span class="tag lab">🔬 3D</span>' : ''}${t.ai ? `<span class="tag ai">✨ AI</span>` : ''}${t.best !== null ? `<span class="small muted">${t.best}%</span>` : ''}${starsHtml(t.stars)}</a>`;
  const secBlock = (sec) => { const list = d.topics.filter(t => t.s === sec.i); const dn = list.filter(t => t.stars > 0).length;
    return `<details class="secblk" data-s="${sec.i}" ${openSec === null || openSec === sec.i ? 'open' : ''}><summary><span class="secn">${esc(sec[LANG] || sec.kk)}</span><span class="small muted">${T('sec_topics', { n: list.length })}${dn ? ` · ✓ ${dn}` : ''}</span></summary><div class="stack">${list.map(topicRow).join('')}</div></details>`; };
  const extra = d.topics.some(t => t.extra);
  view.innerHTML = `<div class="page stack">
    <div class="crumbs"><a href="#/learn?g=${g}">📚 ${T('n_learn')}</a> › <span>${T('grade')} ${g}</span></div>
    <div class="card subj" style="--c:${d.subject.color};min-height:auto"><div class="row"><div class="ico" style="margin:0">${d.subject.icon}</div><div class="grow"><h1 style="margin:0">${esc(subjName(d.subject))}</h1><div class="muted">${T('topic_of', { g, s: T('topics_cnt', { n: d.topics.length }) })} · ${secs.length} ${LANG === 'en' ? 'sections' : LANG === 'ru' ? 'разделов' : 'бөлім'}</div>
      ${extra ? `<div class="small warn-t">⚠️ ${T('extra_list')}</div>` : ''}</div>
      ${ringHtml(d.topics.length ? Math.round(done / d.topics.length * 100) : 0, `<div><b style="font-size:22px">${done}/${d.topics.length}</b></div>`, 86, 8)}</div></div>
    ${labsForSubject(subj).length ? `<div class="card labstrip"><div class="row between"><h3>🔬 ${T('lab_title')}</h3><a class="small" href="#/lab">${T('lab_all')} →</a></div><div class="row">${labsForSubject(subj).map(m => `<a class="btn sm" href="#/lab/${m.id}">${m.icon} ${esc(labName(m))}</a>`).join('')}</div></div>` : ''}
    <div class="row sfilter"><input class="in grow" id="tf" placeholder="🔎 ${T('filter_topics')}" autocomplete="off"><button class="btn sm ghost" id="xAll">${T('expand_all')}</button><button class="btn sm ghost" id="cAll">${T('collapse_all')}</button></div>
    ${qs.map(q => `<div class="quarter"><h3><span class="qn">${q}</span>${T('quarter', { n: q })} <span class="small muted">· ${T('topics_cnt', { n: d.topics.filter(t => t.q === q).length })}</span></h3><div class="stack">
      ${secs.length ? secs.filter(s => s.q === q).map(secBlock).join('') : d.topics.filter(t => t.q === q).map(topicRow).join('')}</div></div>`).join('')}
    <p class="small muted">📚 ${T('cat_src')}</p>
  </div>`;
  const tf = $('#tf', view); tf.oninput = () => { const q = tf.value.toLowerCase().trim();
    $$('.topic', view).forEach(a => { a.style.display = !q || a.dataset.q.includes(q) || a.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    $$('.secblk', view).forEach(b => { const vis = $$('.topic', b).some(a => a.style.display !== 'none'); b.style.display = vis ? '' : 'none'; if (q && vis) b.open = true; }); };
  $('#xAll', view).onclick = () => $$('.secblk', view).forEach(b => b.open = true); $('#cAll', view).onclick = () => $$('.secblk', view).forEach(b => b.open = false);
  if (openSec !== null) { const b = $(`.secblk[data-s="${openSec}"]`, view); if (b) setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
});
route('search', async (view, r) => {
  const cat = await getCatalog(); const q0 = r.query.q || ''; const g0 = r.query.g || ''; const s0 = r.query.s || '';
  view.innerHTML = `<div class="page stack"><div><h1 class="grad-t">🔎 ${T('search_title')}</h1><p class="muted">${T('learn_sub', { s: cat.stats.subjects, t: cat.stats.topics })}</p></div>
    <div class="card row sform"><input class="in grow" id="sq" value="${esc(q0)}" placeholder="${T('search_ph')}" autocomplete="off">
      <select class="in" id="sg" style="width:auto"><option value="">${T('all_grades')}</option>${Array.from({ length: 11 }, (_, i) => `<option value="${i + 1}" ${String(i + 1) === g0 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
      <select class="in" id="ss" style="width:auto"><option value="">${T('all_subjects')}</option>${Object.entries(cat.subjects).map(([id, x]) => `<option value="${id}" ${id === s0 ? 'selected' : ''}>${x.icon} ${esc(subjName(x))}</option>`).join('')}</select></div>
    <div id="sout"></div></div>`;
  let tm = null; const run = async () => { const q = $('#sq', view).value.trim(), g = $('#sg', view).value, s = $('#ss', view).value; const out = $('#sout', view);
    history.replaceState(null, '', `#/search?q=${encodeURIComponent(q)}${g ? '&g=' + g : ''}${s ? '&s=' + s : ''}`);
    if (q.length < 2) { out.innerHTML = ''; return; }
    const d = await api('GET', `/api/search?q=${encodeURIComponent(q)}&lang=${LANG}&limit=200${g ? '&grade=' + g : ''}${s ? '&subject=' + s : ''}`);
    out.innerHTML = `<p class="small muted">${T('found_n', { n: d.results.length + (d.results.length >= 200 ? '+' : '') })}</p><div class="stack">${d.results.map(t => { const sj = cat.subjects[t.subject] || {};
      return `<a class="topic sr2" href="#/lesson/${t.id}"><span class="n" style="background:${sj.color || ''}">${sj.icon || ''}</span><span class="t">${esc(tTitle(t))}<br><span class="small muted">${T('topic_of', { g: t.grade, s: esc(subjName(sj)) })} · ${T('quarter', { n: t.q })} · ${esc(t.section ? (t.section[LANG] || t.section.kk) : '')}</span></span></a>`; }).join('') || emptyHtml('🔎', '—')}</div>`; };
  $('#sq', view).oninput = () => { clearTimeout(tm); tm = setTimeout(run, 220); }; $('#sg', view).onchange = run; $('#ss', view).onchange = run; $('#sq', view).focus(); if (q0) run();
});
