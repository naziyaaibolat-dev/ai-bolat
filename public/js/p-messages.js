'use strict';
/* ===== Хабарламалар: 1:1 чат, сұрақтар, хабарландырулар ===== */
route('messages', async (view, r) => {
  const u = State.user; let cur = r.args[0] ? +r.args[0] : null; let lastId = 0, timer = null;
  const [ct, an] = await Promise.all([api('GET', '/api/contacts'), api('GET', '/api/announcements')]);
  let contacts = ct.contacts;
  const unreadAnn = an.announcements.filter(a => a.is_read === null || a.is_read === 0).length;
  view.innerHTML = `<div class="page"><h1>💬 ${T('n_messages')}</h1>
    <div class="chat"><div class="card clist"><div class="citem ${cur ? '' : 'on'}" id="annItem"><span class="ava sm" style="background:linear-gradient(135deg,#ffd45e,#ff9f1c)">📢</span><span class="grow nm">${T('announcements')}</span>${unreadAnn && u.role === 'student' ? `<span class="badge">${unreadAnn}</span>` : ''}</div>
      <div class="small muted" style="padding:10px 12px 4px">${T('contacts')}</div><div id="cl"></div></div>
      <div class="card thread" id="th"></div></div></div>`;
  const drawList = () => { $('#cl').innerHTML = contacts.length ? contacts.map(c => `<a class="citem ${c.user.id === cur ? 'on' : ''}" href="#/messages/${c.user.id}"><span class="ava sm">${esc(c.user.avatar || '🙂')}</span><span class="grow" style="min-width:0"><span class="nm">${esc(c.user.name)}</span> ${c.questions ? '<span class="tag hw">❓</span>' : ''}<div class="lm">${c.last ? esc((c.last.sender_id === u.id ? T('you') + ': ' : '') + c.last.body) : `<span class="muted">${c.user.role === 'teacher' ? T('teacher') : T('student')}</span>`}</div></span>${c.unread ? `<span class="badge">${c.unread}</span>` : ''}</a>`).join('') : `<p class="small muted" style="padding:12px">${T('no_contacts')}</p>`; };
  const bubble = (m) => `<div class="msg ${m.sender_id === u.id ? 'me' : ''} ${m.kind === 'question' ? 'q' : ''}">${m.kind === 'question' ? `<div class="small" style="color:var(--sun);font-weight:800">❓ ${T('question')}${m.topic ? ' · <a href="#/lesson/' + m.topic_id + '">' + esc(tTitle(m.topic)) + '</a>' : ''}</div>` : ''}<div class="md">${mdToHtml(m.body)}</div><div class="tm">${fmtDate(m.created_at)}${m.sender_id === u.id && m.read_at ? ' ✓✓' : ''}</div></div>`;
  const drawAnn = () => {
    $('#th').innerHTML = `<div class="thead"><span class="ava sm" style="background:linear-gradient(135deg,#ffd45e,#ff9f1c)">📢</span><b>${T('announcements')}</b></div><div class="msgs">${an.announcements.length ? an.announcements.map(annHtml).join('') : emptyHtml('📢', '—')}</div>`;
    renderMath($('#th')); if (u.role === 'student' && unreadAnn) api('POST', '/api/announcements/read').then(pollUnread);
  };
  const openThread = async () => {
    const d = await api('GET', '/api/messages/' + cur); lastId = d.messages.length ? d.messages[d.messages.length - 1].id : 0;
    $('#th').innerHTML = `<div class="thead"><span class="ava sm">${esc(d.user.avatar || '🙂')}</span><div class="grow"><b>${esc(d.user.name)}</b><div class="small muted">${d.user.role === 'teacher' ? T('teacher') : T('student') + (d.user.grade ? ' · ' + d.user.grade : '')}</div></div></div>
      <div class="msgs" id="ms">${d.messages.map(bubble).join('') || emptyHtml('👋', '')}</div>
      <form class="composer" id="cf"><div class="grow"><textarea class="in" id="mb" rows="1" placeholder="${esc(T('msg_ph'))}"></textarea>${u.role === 'student' ? `<label class="small" style="display:inline-flex;gap:6px;margin-top:6px"><input type="checkbox" id="asq"> ${T('as_question')}</label>` : ''}</div><button class="btn pri">${T('send')} ➤</button></form>`;
    const ms = $('#ms'); renderMath(ms); ms.scrollTop = ms.scrollHeight;
    const mb = $('#mb'); mb.oninput = () => { mb.style.height = 'auto'; mb.style.height = Math.min(160, mb.scrollHeight) + 'px'; };
    mb.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#cf').requestSubmit(); } };
    $('#cf').onsubmit = async (e) => { e.preventDefault(); const body = mb.value.trim(); if (!body) return; mb.value = ''; mb.style.height = 'auto';
      try { const x = await api('POST', '/api/messages/' + cur, { body, kind: $('#asq') && $('#asq').checked ? 'question' : 'msg' }); if (ms.querySelector('.empty')) ms.innerHTML = ''; ms.insertAdjacentHTML('beforeend', bubble(x.message)); lastId = x.message.id; renderMath(ms.lastElementChild); ms.scrollTop = ms.scrollHeight; }
      catch (err) { toast('⚠️ ' + esc(err.message)); mb.value = body; } };
    const c = contacts.find(x => x.user.id === cur); if (c) { c.unread = 0; c.questions = 0; drawList(); } pollUnread();
    clearInterval(timer); timer = setInterval(async () => { try { const n = await api('GET', `/api/messages/${cur}?after=${lastId}`); const fresh = n.messages.filter(m => m.id > lastId && m.sender_id !== u.id);
      if (fresh.length) { if (ms.querySelector('.empty')) ms.innerHTML = ''; fresh.forEach(m => ms.insertAdjacentHTML('beforeend', bubble(m))); lastId = n.messages[n.messages.length - 1].id; renderMath(ms); ms.scrollTop = ms.scrollHeight; } } catch (e) { /* */ } }, 5000);
    mb.focus();
  };
  $('#annItem').onclick = () => { location.hash = '#/messages'; };
  drawList();
  if (cur) await openThread(); else drawAnn();
  return () => clearInterval(timer);
});
