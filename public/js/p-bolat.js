'use strict';
/* ===== Болат — Сократтық көмекші (ағынды чат, суреттер) ===== */
route('bolat', async (view, r) => {
  const B = { chats: [], chat: null, msgs: [], busy: false, ctrl: null, imgs: [] };
  const topicId = r.query.topic || null;
  B.chats = (await api('GET', '/api/bolat/chats')).chats; const st = await api('GET', '/api/bolat/status');
  view.innerHTML = `<div class="page"><div class="bolat" id="bw">
    <div class="card clist bside"><button class="btn pri block" id="bnew">${T('b_new')}</button><div class="small muted" style="padding:12px 6px 4px">${T('chats')}</div><div id="bl"></div></div>
    <div class="card bthread"><div class="thead"><img src="/img/bolat.svg" style="width:40px"><div class="grow"><b id="btitle">${T('n_bolat')}</b><div class="small muted">${T('b_rule')}</div></div><button class="iconbtn" id="bside" title="${T('chats')}">☰</button></div>
      <div class="bmsgs" id="bm"></div>
      <div class="attach" id="batt"></div>
      <div class="hintlv" role="radiogroup" aria-label="${esc(T('v4_hint_lv'))}"><span class="small muted">${T('v4_hint_lv')}:</span>${[1, 2, 3].map(n => `<button type="button" role="radio" data-h="${n}" class="hl ${(+localStorage.getItem('ab_hint') || 1) === n ? 'on' : ''}" aria-checked="${(+localStorage.getItem('ab_hint') || 1) === n}">${T('v4_hint' + n)}</button>`).join('')}</div><form class="composer" id="bf"><button type="button" class="iconbtn" id="bimg" title="${T('attach')}">📷</button><input type="file" id="bfile" accept="image/*" hidden multiple>
        <textarea class="in grow" id="bt" rows="1" placeholder="${esc(T('b_ph'))}"></textarea><button type="button" class="iconbtn mic" id="bmic" title="${esc(T('v4_voice'))}" aria-label="${esc(T('v4_voice'))}" hidden>🎤</button><button class="btn pri" id="bsend">➤</button></form>
      <div class="rule-note">🧭 ${T('b_rule')}</div></div></div></div>`;
  const bm = $('#bm'), bt = $('#bt');
  const drawList = () => { $('#bl').innerHTML = B.chats.map(c => `<div class="citem ${B.chat && c.id === B.chat.id ? 'on' : ''}" data-id="${c.id}"><span class="grow lm" style="max-width:none;color:var(--ink)">${esc(c.title)}</span><button class="btn sm ghost" data-del="${c.id}">🗑</button></div>`).join('') || '<p class="small muted">—</p>';
    $$('#bl .citem').forEach(it => it.onclick = async (e) => { if (e.target.closest('[data-del]')) { if (!confirm(T('confirm_del'))) return; await api('DELETE', '/api/bolat/chats/' + it.dataset.id); B.chats = B.chats.filter(c => c.id !== +it.dataset.id); if (B.chat && B.chat.id === +it.dataset.id) { B.chat = null; B.msgs = []; } drawList(); drawMsgs(); return; }
      const d = await api('GET', '/api/bolat/chats/' + it.dataset.id); B.chat = d.chat; B.msgs = d.messages; drawList(); drawMsgs(); $('#bw').classList.remove('showside'); }); };
  const msgHtml = (m) => `<div class="bm ${m.role === 'user' ? 'user' : ''}">${m.role === 'user' ? `<span class="ava sm">${esc(State.user.avatar || '🙂')}</span>` : `<img class="av" src="/img/bolat.svg">`}<div class="bb">${(m.images || []).map(n => `<img class="att" src="${n.startsWith('data:') ? n : '/api/bolat/images/' + n}">`).join('')}<div class="md">${mdToHtml(m.content)}</div>${m.role === 'user' ? '' : reportBtn('bolat', (B.chat ? B.chat.id : '') + ':' + (m.id || ''))}</div></div>`;
  const drawMsgs = () => {
    $('#btitle').textContent = B.chat ? B.chat.title : T('n_bolat');
    if (!B.msgs.length) {
      bm.innerHTML = `<div class="bhello"><img src="/img/bolat.svg"><h2 class="grad-t">${T('b_title')}</h2><p class="muted" style="max-width:560px;margin:0 auto">${T('b_sub')}</p>${!st.enabled ? `<div class="banner warn" style="margin-top:14px">⚠️ ${T('b_off')}</div>` : ''}
        ${topicId ? `<p><span class="tag ai">📘 ${T('topic')}</span></p>` : ''}<div class="bchips">${['b_chip1', 'b_chip2', 'b_chip3', 'b_chip4'].map(k => `<div class="bchip" data-k="${k}">${T(k)}</div>`).join('')}</div></div>`;
      $$('.bchip', bm).forEach(c => c.onclick = () => { if (c.dataset.k === 'b_chip3') { $('#bfile').click(); return; } bt.value = T(c.dataset.k).replace(/^\S+\s/, ''); bt.focus(); });
    } else { bm.innerHTML = B.msgs.map(msgHtml).join(''); renderMath(bm); }
    bm.scrollTop = bm.scrollHeight;
  };
  const drawAtt = () => { $('#batt').innerHTML = B.imgs.map((u, k) => `<div class="th"><img src="${u}"><button class="x" data-k="${k}">✕</button></div>`).join(''); $$('#batt .x').forEach(x => x.onclick = () => { B.imgs.splice(+x.dataset.k, 1); drawAtt(); }); };
  const addFiles = async (files) => { for (const f of [...files].slice(0, 3 - B.imgs.length)) { try { B.imgs.push(await readImage(f)); } catch (e) { /* */ } } drawAtt(); };
  $('#bimg').onclick = () => $('#bfile').click(); $('#bfile').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };
  bt.addEventListener('paste', (e) => { const fs = [...(e.clipboardData || {}).files || []]; if (fs.length) { e.preventDefault(); addFiles(fs); } });
  bm.addEventListener('dragover', (e) => e.preventDefault()); bm.addEventListener('drop', (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); });
  bt.oninput = () => { bt.style.height = 'auto'; bt.style.height = Math.min(180, bt.scrollHeight) + 'px'; };
  bt.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#bf').requestSubmit(); } };
  $('#bnew').onclick = () => { B.chat = null; B.msgs = []; drawList(); drawMsgs(); bt.focus(); $('#bw').classList.remove('showside'); };
  $('#bside').onclick = () => $('#bw').classList.toggle('showside');
  $$('.hintlv .hl', view).forEach(b => b.onclick = () => { localStorage.setItem('ab_hint', b.dataset.h); $$('.hintlv .hl', view).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); });
  if (window.V4 && V4.voice) V4.voice($('#bmic', view), bt);
  $('#bf').onsubmit = async (e) => {
    e.preventDefault();
    if (B.busy) { B.ctrl && B.ctrl.abort(); return; }
    const text = bt.value.trim(); if (!text && !B.imgs.length) return;
    if (!B.chat) { const c = await api('POST', '/api/bolat/chats', { topic_id: topicId, title: text }); B.chat = c.chat; B.chats.unshift(c.chat); drawList(); }
    const imgs = B.imgs.slice(); B.imgs = []; drawAtt(); bt.value = ''; bt.style.height = 'auto';
    B.msgs.push({ role: 'user', content: text, images: imgs }); if (bm.querySelector('.bhello')) bm.innerHTML = '';
    bm.insertAdjacentHTML('beforeend', msgHtml(B.msgs[B.msgs.length - 1])); renderMath(bm.lastElementChild);
    await runStream({ text, images: imgs, lang: LANG, hint: +localStorage.getItem('ab_hint') || 1 });
  };
  async function runStream(body) {
    bm.insertAdjacentHTML('beforeend', `<div class="bm"><img class="av" src="/img/bolat.svg"><div class="bb"><div class="bstat small muted" hidden></div><div class="md caret" id="live"><span class="dots"><i></i><i></i><i></i></span></div></div></div>`); bm.scrollTop = bm.scrollHeight;
    B.busy = true; $('#bsend').textContent = '■'; B.ctrl = new AbortController(); let full = '';
    const live = $('#live'); const stat = live.parentElement.querySelector('.bstat'); let raf = null;
    const paint = () => { raf = null; live.innerHTML = mdToHtml(full); renderMath(live); bm.scrollTop = bm.scrollHeight; };
    try {
      await sse(`/api/bolat/chats/${B.chat.id}/stream`, body, {
        delta: (d) => { full += d.t; stat.hidden = true; if (!raf) raf = requestAnimationFrame(paint); },
        retry: (d) => { full = ''; stat.hidden = false; stat.textContent = '🔄 ' + retryReason(d); },
        done: (d) => { full = d.message.content; B.msgs.push(d.message); } }, B.ctrl.signal);
      paint();
    } catch (err) {
      if (err.name !== 'AbortError') { const bubble = live.closest('.bm'); live.innerHTML = aiErrHtml(err.message, 'bRetry'); stat.hidden = true;
        const rb = $('#bRetry', live); rb.id = ''; rb.onclick = () => { if (B.busy) return; bubble.remove(); runStream({ retry: true, lang: LANG, hint: +localStorage.getItem('ab_hint') || 1 }); }; }
      else paint();
    } finally { live.classList.remove('caret'); live.removeAttribute('id'); B.busy = false; if (full && !live.parentElement.querySelector('.rptbtn')) live.insertAdjacentHTML('afterend', reportBtn('bolat', B.chat ? B.chat.id + ':' : '')); $('#bsend').textContent = '➤'; }
  }
  drawList(); drawMsgs();
  if (r.args[0]) { const d = await api('GET', '/api/bolat/chats/' + r.args[0]); B.chat = d.chat; B.msgs = d.messages; drawList(); drawMsgs(); }
  return () => { if (B.ctrl) B.ctrl.abort(); };
});
