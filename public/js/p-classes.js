'use strict';
/* ===== Сыныптар, тапсырмалар, журнал ===== */
route('classes', async (view) => {
  const u = State.user; const { classes } = await api('GET', '/api/classes'); const cat = await getCatalog();
  if (u.role === 'teacher') {
    view.innerHTML = `<div class="page stack"><div class="row between"><h1>🏫 ${T('my_classes')}</h1></div>
      <div class="card"><h3>➕ ${T('new_class')}</h3><form id="cf" class="row"><input class="in grow" id="cn" placeholder="${esc(T('class_name'))} — 7 «Ә»" required style="min-width:200px;flex:2">
        <select class="in" id="cg" style="flex:1;min-width:110px">${Array.from({ length: 11 }, (_, i) => `<option value="${i + 1}" ${i === 6 ? 'selected' : ''}>${T('grade')} ${i + 1}</option>`).join('')}</select>
        <select class="in" id="cs" style="flex:1;min-width:150px"><option value="">—</option>${Object.entries(cat.subjects).map(([k, s]) => `<option value="${k}">${s.icon} ${esc(subjName(s))}</option>`).join('')}</select>
        <button class="btn pri">${T('create')}</button></form></div>
      <div class="grid auto">${classes.length ? classes.map(c => `<a class="card hov" href="#/class/${c.id}"><div class="row between"><h3 style="margin:0">${esc(c.name)}</h3>${c.subject ? `<span class="tag">${cat.subjects[c.subject].icon} ${esc(subjName(cat.subjects[c.subject]))}</span>` : ''}</div>
        <p class="muted small">👥 ${c.n_students} · 📌 ${c.n_assign}</p><div class="small muted">${T('join_code')}</div><span class="joincode sm">${c.join_code}</span></a>`).join('') : emptyHtml('🏫', T('no_classes_t'))}</div></div>`;
    $('#cf').onsubmit = async (e) => { e.preventDefault(); try { const r = await api('POST', '/api/classes', { name: $('#cn').value, grade: +$('#cg').value, subject: $('#cs').value }); location.hash = '#/class/' + r.class.id; } catch (err) { toast('⚠️ ' + esc(err.message)); } };
    return;
  }
  const { assignments } = await api('GET', '/api/assignments');
  view.innerHTML = `<div class="page stack"><h1>🎒 ${T('my_classes')}</h1>
    <div class="card"><h3>➕ ${T('join_class')}</h3><form id="jf" class="row"><input class="in code-in" id="jc" placeholder="ABC123" maxlength="8" style="max-width:260px;letter-spacing:6px;text-transform:uppercase"><button class="btn pri">${T('join')}</button></form></div>
    <div class="grid auto">${classes.length ? classes.map(c => `<a class="card hov" href="#/class/${c.id}"><h3>${esc(c.name)}</h3><p class="muted small">🧑‍🏫 ${esc(c.teacher_name)} · 👥 ${c.n_students}</p></a>`).join('') : emptyHtml('🎒', T('no_classes_s'))}</div>
    ${assignments.length ? `<div class="card"><h2>📌 ${T('my_tasks')}</h2><div class="stack">${assignments.map(assignRow).join('')}</div></div>` : ''}</div>`;
  $('#jf').onsubmit = async (e) => { e.preventDefault(); try { const r = await api('POST', '/api/classes/join', { code: $('#jc').value }); toast('✅ ' + esc(r.class.name)); render(); } catch (err) { toast('⚠️ ' + esc(err.message)); } };
});
route('class', async (view, r) => {
  const id = +r.args[0]; const u = State.user; let tab = r.query.tab || (u.role === 'teacher' ? 'gradebook' : 'assign');
  const d = await api('GET', '/api/classes/' + id); const cat = await getCatalog();
  const tabs = u.role === 'teacher' ? [['gradebook', 't_gradebook'], ['assign', 't_assign'], ['students', 't_students'], ['ann', 't_ann']] : [['assign', 't_assign'], ['students', 't_students'], ['ann', 't_ann']];
  view.innerHTML = `<div class="page"><div class="crumbs"><a href="#/classes">🏫 ${T('n_classes')}</a></div>
    <div class="hero"><div class="row between" style="position:relative;z-index:1"><div><h1>${esc(d.class.name)}</h1><p class="muted">🧑‍🏫 ${esc(d.teacher.name)} · 👥 ${d.students.length}${d.class.subject ? ' · ' + cat.subjects[d.class.subject].icon + ' ' + esc(subjName(cat.subjects[d.class.subject])) : ''}</p></div>
      ${u.role === 'teacher' ? `<div class="center"><div class="small muted">${T('join_code')}</div><span class="joincode" id="jcode" title="${esc(T('share_code'))}">${d.class.join_code}</span><div class="small muted" style="max-width:260px">${T('share_code')}</div></div>` : `<a class="btn" href="#/messages/${d.teacher.id}">💬 ${T('write')}</a>`}</div></div>
    <div class="tabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${T(l)}</button>`).join('')}</div><div id="tb"></div></div>`;
  const jc = $('#jcode'); if (jc) jc.onclick = () => copyText(d.class.join_code);
  $$('.tabs button', view).forEach(b => b.onclick = () => { $$('.tabs button', view).forEach(x => x.classList.toggle('on', x === b)); tab = b.dataset.t; drawTab(); });
  const drawTab = async () => {
    const el = $('#tb');
    if (tab === 'students') {
      el.innerHTML = d.students.length ? `<div class="card"><table class="tbl"><thead><tr><th>#</th><th>${T('name')}</th><th>${T('level')}</th><th>XP</th><th>🔥</th><th></th></tr></thead><tbody>
        ${d.students.map((s, k) => `<tr><td>${k + 1}</td><td><div class="row"><span class="ava sm">${esc(s.avatar || '🙂')}</span><b>${esc(s.name)}</b></div></td><td>${s.level}</td><td>${s.xp}</td><td>${s.streak}</td>
        <td class="row" style="justify-content:flex-end">${u.role === 'teacher' ? `<a class="btn sm" href="#/messages/${s.id}">💬</a><button class="btn sm" data-res="${s.id}">📈</button><button class="btn sm ghost danger" data-rm="${s.id}">${T('remove')}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : emptyHtml('👥', T('no_students'));
      $$('[data-rm]', el).forEach(b => b.onclick = async () => { if (!confirm(T('confirm_del'))) return; await api('DELETE', `/api/classes/${id}/members/${b.dataset.rm}`); render(); });
      $$('[data-res]', el).forEach(b => b.onclick = () => studentResults(+b.dataset.res));
    } else if (tab === 'assign') {
      el.innerHTML = `${u.role === 'teacher' ? `<div class="card" style="margin-bottom:16px"><h3>${T('new_assign')}</h3>
        <div class="grid g4"><div><label class="f">${T('grade')}</label><select class="in" id="ag">${Array.from({ length: 11 }, (_, i) => `<option ${i + 1 === (d.class.grade || 7) ? 'selected' : ''} value="${i + 1}">${i + 1}</option>`).join('')}</select></div>
          <div><label class="f">${T('subject')}</label><select class="in" id="as"></select></div><div style="grid-column:span 2"><label class="f">${T('topic')}</label><select class="in" id="at"></select></div></div>
        <div class="grid g4" style="margin-top:12px"><div><label class="f">${T('kind')}</label><select class="in" id="ak"><option value="homework">${T('k_homework')}</option><option value="classwork">${T('k_classwork')}</option><option value="test">${T('k_test')}</option></select></div>
          <div><label class="f">${T('due')}</label><input class="in" type="date" id="ad"></div><div style="grid-column:span 2"><label class="f">${T('note')}</label><input class="in" id="an"></div></div>
        <button class="btn pri" id="aok" style="margin-top:14px">${T('create')}</button></div>` : ''}
        <div class="stack">${d.assignments.length ? d.assignments.map(a => `<div class="topic" data-href="#/lesson/${a.topic_id}?a=${a.id}"><span class="n">📌</span><span class="t">${esc(a.title)}<br><span class="small muted">${a.topic ? esc(tTitle(a.topic)) + ' · ' : ''}${a.due_at ? T('due') + ': ' + fmtDate(a.due_at, false) + ' · ' : ''}${T('done_of', { a: a.done, b: d.students.length })}</span>${a.note ? `<br><span class="small">💬 ${esc(a.note)}</span>` : ''}</span>
          ${kindTag(a.kind)} ${u.role === 'teacher' ? `<button class="btn sm ghost danger" data-del="${a.id}">🗑</button>` : a.mine ? markHtml(a.mine.mark) : `<span class="btn sm pri">${T('todo')}</span>`}</div>`).join('') : emptyHtml('📌', '—')}</div>`;
      $$('[data-href]', el).forEach(x => x.onclick = (e) => { if (!e.target.closest('[data-del]')) location.hash = x.dataset.href; });
      $$('[data-del]', el).forEach(b => b.onclick = async () => { if (!confirm(T('confirm_del'))) return; await api('DELETE', '/api/assignments/' + b.dataset.del); render(); });
      if (u.role === 'teacher') {
        const fillS = async () => { const g = +$('#ag').value; const r2 = await api('GET', '/api/catalog/grade/' + g); $('#as').innerHTML = r2.subjects.map(s => `<option value="${s.id}" ${s.id === d.class.subject ? 'selected' : ''}>${s.icon} ${esc(subjName(s))}</option>`).join(''); await fillT(); };
        const fillT = async () => { const r3 = await api('GET', `/api/catalog/${$('#as').value}/${$('#ag').value}`); $('#at').innerHTML = [...new Set(r3.topics.map(t => t.q))].map(q => `<optgroup label="${T('quarter', { n: q })}">${r3.topics.filter(t => t.q === q).map(t => `<option value="${t.id}">${t.n}. ${esc(tTitle(t))}</option>`).join('')}</optgroup>`).join(''); };
        $('#ag').onchange = fillS; $('#as').onchange = fillT; await fillS();
        $('#aok').onclick = async () => { try { await api('POST', `/api/classes/${id}/assignments`, { topic_id: $('#at').value, kind: $('#ak').value, due_at: $('#ad').value || null, note: $('#an').value }); toast('✅ ' + T('saved')); const nd = await api('GET', '/api/classes/' + id); d.assignments = nd.assignments; drawTab(); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
      }
    } else if (tab === 'gradebook') {
      const g = await api('GET', `/api/classes/${id}/gradebook`);
      el.innerHTML = `<div class="card"><div class="row between"><h2>${T('t_gradebook')}</h2><button class="btn sm" id="csv">⬇️ ${T('export_csv')}</button></div>
        ${g.rows.length ? `<div class="scrollx"><table class="tbl"><thead><tr><th class="sticky">${T('name')}</th>${g.assignments.map(a => `<th title="${esc(a.title)}">${esc(a.title.length > 18 ? a.title.slice(0, 17) + '…' : a.title)}<br><span class="small">${a.kind === 'test' ? '📝' : a.kind === 'homework' ? '🏠' : '🏫'} ${a.due_at ? fmtDate(a.due_at, false) : ''}</span></th>`).join('')}<th>${T('avg')}</th><th>${T('games')}</th></tr></thead>
        <tbody>${g.rows.map(rw => `<tr><td class="sticky"><div class="row"><span class="ava sm">${esc(rw.student.avatar || '🙂')}</span><b>${esc(rw.student.name)}</b></div></td>${rw.marks.map(m => `<td title="${m ? m.percent + '% · ' + m.attempts + '×' : ''}">${m ? markHtml(m.mark) + ` <span class="small muted">${m.percent}%</span>` : '<span class="muted">—</span>'}</td>`).join('')}
          <td>${rw.avg_mark ? `<b>${rw.avg_mark}</b> <span class="small muted">${rw.avg_percent}%</span>` : '—'}</td><td>${rw.games}${rw.games_avg !== null ? ` <span class="small muted">~${rw.games_avg}%</span>` : ''}</td></tr>`).join('')}</tbody></table></div>` : emptyHtml('👥', T('no_students'))}
        <p class="small muted">5: 85–100% · 4: 65–84% · 3: 40–64% · 2: 0–39%</p></div>`;
      $('#csv').onclick = () => { const rows = [[T('name'), ...g.assignments.map(a => a.title), T('avg')]].concat(g.rows.map(rw => [rw.student.name, ...rw.marks.map(m => m ? `${m.mark} (${m.percent}%)` : ''), rw.avg_mark || '']));
        const csv = '\uFEFF' + rows.map(x => x.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${g.class.name}-journal.csv`; a.click(); };
    } else if (tab === 'ann') {
      el.innerHTML = `${u.role === 'teacher' ? `<div class="card" style="margin-bottom:16px"><textarea class="in" id="anb" rows="3" placeholder="${esc(T('ann_ph'))}"></textarea><button class="btn pri" id="anp" style="margin-top:10px">📢 ${T('post')}</button></div>` : ''}
        <div class="stack">${d.announcements.length ? d.announcements.map(a => annHtml({ ...a, is_read: 1 })).join('') : emptyHtml('📢', '—')}</div>`;
      const p = $('#anp', el); if (p) p.onclick = async () => { try { const x = await api('POST', `/api/classes/${id}/announcements`, { body: $('#anb').value }); d.announcements.unshift(x.announcement); drawTab(); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
    }
    renderMath(el);
  };
  drawTab();
});
async function studentResults(sid) {
  const r = await api('GET', `/api/students/${sid}/results`);
  modal(`<h2>📈 ${esc(r.student.name)}</h2><p class="muted">${T('level')} ${r.student.level} · ${r.student.xp} XP · 🔥 ${r.student.streak}</p>
    ${r.results.length ? `<table class="tbl"><thead><tr><th>${T('topic')}</th><th>%</th><th>${T('mark')}</th><th>${T('date')}</th></tr></thead><tbody>${r.results.map(x => `<tr><td>${esc(tTitle(x.topic))}</td><td>${x.percent}%</td><td>${markHtml(x.mark)}</td><td class="small">${fmtDate(x.created_at)}</td></tr>`).join('')}</tbody></table>` : emptyHtml('🕹️', '—')}
    <button class="btn" id="cx" style="margin-top:14px">${T('close')}</button>`, (m, close) => { $('#cx', m).onclick = close; });
}
