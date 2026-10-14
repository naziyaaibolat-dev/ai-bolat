'use strict';
/* ===== Сабақ: теория, ережелер мен формулалар, мысалдар, ойын ===== */
route('lesson', async (view, r) => {
  const id = r.args[0]; const aId = r.query.a ? +r.query.a : null;
  let data, curTab = r.query.tab || 'theory', gen = null, alive = true;
  const load = async () => {
    data = await api('GET', `/api/lesson/${encodeURIComponent(id)}?lang=${LANG}`);
    draw(curTab);
    if (data.autoGen && data.canGen && !gen) startGen(false);
  };
  const inGame = () => { const g = $('.game', view); return g && !$('.result', view); };
  const paintGen = () => { const box = $('#genBox', view); if (!box || !gen) return; const pct = Math.min(96, Math.round(gen.chars / 60));
    if (gen.state === 'run') box.innerHTML = `<div class="genbar"><div class="gb-ic"><img src="/img/bolat.svg" alt=""></div><div class="grow"><b>✨ ${T('gen_live')}</b><div class="small muted" id="gbMsg">${esc(gen.msg || T('gen_live_sub'))}</div><div class="bar gbp"><i style="width:${Math.max(4, pct)}%"></i></div></div></div>`;
    else if (gen.state === 'err') { box.innerHTML = aiErrHtml(gen.err, 'genRetry'); $('#genRetry', box).onclick = () => startGen(gen.regen); }
    else if (gen.state === 'ready') { box.innerHTML = `<div class="banner ok">✅ <span class="grow">${T('gen_ready')}</span><button class="btn sm pri" id="genShow">${T('gen_show')}</button></div>`; $('#genShow', box).onclick = () => { gen = null; draw(curTab); }; } };
  const startGen = (regen) => {
    gen = { state: 'run', chars: 0, msg: '', regen }; paintGen();
    sse(`/api/lesson/${encodeURIComponent(id)}/generate`, { lang: LANG, regen: !!regen }, {
      status: (d) => { gen.msg = T('gen_model', { m: d.model }); paintGen(); },
      progress: (d) => { gen.chars = d.chars; const b = $('#genBox .gbp i', view); if (b) b.style.width = Math.max(4, Math.min(96, Math.round(d.chars / 60))) + '%'; else paintGen(); },
      retry: (d) => { gen.msg = '🔄 ' + retryReason(d); gen.chars = 0; paintGen(); }
    }).then(async () => {
      if (!alive) return; const nd = await api('GET', `/api/lesson/${encodeURIComponent(id)}?lang=${LANG}`); data = nd;
      if (inGame()) { gen.state = 'ready'; paintGen(); } else { gen = null; draw(curTab); toast('✨ ' + T('gen_done')); }
    }).catch(e => { if (!alive) return; gen.state = 'err'; gen.err = e.message; paintGen(); });
  };
  const draw = (tab) => {
    const { topic, content: c, source } = data; const u = State.user; const s = topic.subjectInfo;
    const tabs = [['theory', 'tab_theory'], ['explain', 'tab_explain'], ['rules', 'tab_rules'], ['examples', 'tab_examples'], ['game', 'tab_game']];
    view.innerHTML = `<div class="page">
      <div class="crumbs"><a href="#/learn?g=${topic.grade}">📚 ${T('grade')} ${topic.grade}</a> › <a href="#/subject/${topic.subject}/${topic.grade}">${s.icon} ${esc(subjName(s))}</a> › <span>${T('quarter', { n: topic.q })}</span>${topic.section ? `<span class="small">› <a href="#/subject/${topic.subject}/${topic.grade}?sec=${topic.section.i}">${esc(topic.section[LANG] || topic.section.kk)}</a></span>` : ''}
        ${source === 'ai' ? `<span class="tag ai">✨ ${T('ai_made')}</span>` : source === 'teacher' ? `<span class="tag ok">✏️ ${T('x_teacher_ed')}</span>` : `<span class="tag">📦 ${T('offline_lesson')}</span>`} ${data.progress ? starsHtml(data.progress.stars) : ''}</div>
      <div class="lhead"><div><h1>${esc(c.title || tTitle(topic))}</h1></div>
        <div class="row"><button class="btn sm pri" id="presentBtn" title="${T('x_keys')}">▶ ${T('xf_present')}</button>${data.canEdit ? `<button class="btn sm" id="editBtn">✏️ ${T('xf_edit')}</button>` : ''}${u.role === 'teacher' ? `<button class="btn sm" id="assignBtn">${T('assign_this')}</button>${data.ai ? `<button class="btn sm" id="regenBtn">${T('regen')}</button>` : ''}` : `<button class="btn sm" id="askT">${T('ask_teacher')}</button>`}
          <a class="btn sm" href="#/bolat?topic=${topic.id}">🤖 ${T('ask_bolat')}</a>${data.ai ? reportBtn('lesson', topic.id + ':' + LANG) : ''}${labsForTopic(topic).slice(0, 2).map(l => `<a class="btn sm lab3d" href="${labPresetHash(l)}">🔬 ${T('open_lab')}: ${esc(labName(l.meta))}</a>`).join('')}</div></div>
      <div id="genBox" style="margin:12px 0">${source === 'template' && !gen ? `<div class="banner warn">📦 <span class="grow">${T('template_note')}</span>${data.canGen ? `<button class="btn sm pri" id="genBtn">${T('gen_ai')}</button>` : ''}</div>` : ''}</div>
      ${c.hook ? `<div class="bubble" style="margin-top:14px"><img src="/img/bolat.svg" alt=""><div class="say md">${mdToHtml(c.hook)}</div></div>` : ''}
      <div class="tabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${T(l)}</button>`).join('')}</div>
      <div id="tabBody"></div></div>`;
    $$('.tabs button', view).forEach(b => b.onclick = () => { $$('.tabs button', view).forEach(x => x.classList.toggle('on', x === b)); curTab = b.dataset.t; drawTab(b.dataset.t); });
    const gb = $('#genBtn', view); if (gb) gb.onclick = () => startGen(false);
    const rb = $('#regenBtn', view); if (rb) rb.onclick = () => { if (!gen || gen.state !== 'run') startGen(true); };
    paintGen();
    const ab = $('#assignBtn', view); if (ab) ab.onclick = () => assignModal(topic);
    $('#presentBtn', view).onclick = () => presentLesson(data, 0);
    const eb = $('#editBtn', view); if (eb) eb.onclick = () => lessonEditor(data, async () => { data = await api('GET', `/api/lesson/${encodeURIComponent(id)}?lang=${LANG}`); draw(curTab); });
    const at = $('#askT', view); if (at) at.onclick = () => askTeacherModal(topic);
    renderMath(view); drawTab(tab);
  };
  const drawTab = (tab) => {
    const c = data.content; const el = $('#tabBody', view);
    if (tab === 'theory') {
      const labs = labsForTopic(data.topic); const n = c.theory.length; let step = 0; let all = localStorage.getItem('ab_th_all') === '1';
      el.innerHTML = `<div class="grid thgrid" id="thg">
        <div class="stack"><div class="stepper card"><div class="row between"><div class="steps">${c.theory.map((t, k) => `<button class="stp" data-k="${k}" title="${esc(t.h)}"><b>${k + 1}</b></button>`).join('<i class="stl"></i>')}</div>
            <label class="small"><input type="checkbox" id="thAll" ${all ? 'checked' : ''}> ${T('show_all')}</label></div><div class="bar thbar"><i id="thProg"></i></div></div>
          <div id="thBody" class="stack"></div>
          <div class="row" id="thNav"><button class="btn" id="thPrev">← ${T('prev')}</button><span class="grow"></span><button class="btn pri" id="thNext">${T('next_step')} →</button></div>
          ${labs.length ? `<div class="card minilab"><div class="row between"><div><h2>🧪 ${T('minilab')}</h2><p class="muted small">${esc(labDesc(labs[0].meta))}</p></div>
            <div class="row">${labs.map((l, k) => `<button class="btn sm ${k ? '' : 'pri'} mlb" data-k="${k}">${l.meta.icon} ${esc(labName(l.meta))}</button>`).join('')}<a class="btn sm ghost" id="mlFull" href="${labPresetHash(labs[0])}">⛶ ${T('open_lab')}</a></div></div>
            <div id="mlHost" class="mlhost"><button class="mlplay" id="mlPlay"><span>▶</span>${T('run_lab')}</button></div></div>` : ''}
        </div>
        <div class="stack"><div class="card xquick"><h3>✨ ${T('tab_explain')}</h3><div class="xqgrid">${XF.map(([k, ic]) => `<button class="xq" data-f="${k}">${ic}<span>${T('xf_' + k)}</span></button>`).join('')}</div></div>
          ${c.goals.length ? `<div class="card"><h3>🎯 ${T('goals')}</h3><ul class="md">${c.goals.map(g => `<li>${mdToHtml(g).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul></div>` : ''}
          ${c.formulas.length ? `<div class="card"><h3>📐 ${T('formulas')}</h3><div class="stack">${c.formulas.slice(0, 3).map(f => `<div class="fmini"><div class="small muted">${esc(f.name)}</div>${texHtml(f.tex)}</div>`).join('')}</div></div>` : ''}
          ${c.defs && c.defs.length ? `<div class="card"><h3>📘 ${T('x_defs')}</h3><div class="xdefs">${c.defs.slice(0, 3).map(d => `<div class="xdef"><b>${mdToHtml(d.term).replace(/^<p>|<\/p>$/g, '')}</b><div class="md small">${mdToHtml(d.text).replace(/^<p>|<\/p>$/g, '')}</div></div>`).join('')}</div></div>` : ''}
          ${c.tips.length ? `<div class="card"><h3>💡 ${T('tips')}</h3><ul class="md">${c.tips.map(g => `<li>${mdToHtml(g).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul></div>` : ''}
          <button class="btn pri block lg" id="goGame">🎮 ${T('start_game')}</button></div></div>`;
      const body = $('#thBody', el);
      const paint = () => {
        const secs = all ? c.theory.map((t, k) => [t, k]) : [[c.theory[step], step]];
        body.innerHTML = secs.map(([t, k]) => `<div class="card thsec pop"><div class="thn">${T('step')} ${k + 1}/${n}</div><h2>${esc(t.h)}</h2><div class="md">${mdToHtml(t.md)}</div></div>`).join('');
        $$('.stp', el).forEach((b, k) => { b.classList.toggle('on', all || k === step); b.classList.toggle('done', k < step); });
        $('#thProg', el).style.width = (all ? 100 : (step + 1) / n * 100) + '%';
        $('#thNav', el).style.display = all ? 'none' : '';
        $('#thPrev', el).disabled = step === 0;
        $('#thNext', el).innerHTML = step >= n - 1 ? (labs.length ? `🧪 ${T('minilab')} ↓` : `🎮 ${T('start_game')}`) : `${T('next_step')} →`;
        renderMath(body);
      };
      $$('.stp', el).forEach(b => b.onclick = () => { step = +b.dataset.k; all = false; $('#thAll', el).checked = false; paint(); });
      $('#thAll', el).onchange = (e) => { all = e.target.checked; localStorage.setItem('ab_th_all', all ? '1' : '0'); paint(); };
      $('#thPrev', el).onclick = () => { if (step > 0) { step--; paint(); } };
      $('#thNext', el).onclick = () => { if (step < n - 1) { step++; paint(); body.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } else if (labs.length) { $('.minilab', el).scrollIntoView({ behavior: 'smooth' }); } else $('.tabs button[data-t="game"]').click(); };
      paint(); renderMath(el);
      let mlIdx = 0;
      const mountMl = () => { const host = $('#mlHost', el); host.innerHTML = ''; mountLabInto(host, labs[mlIdx].id, labs[mlIdx].preset || {}, true); };
      if (labs.length) {
        $('#mlPlay', el).onclick = mountMl;
        $$('.mlb', el).forEach(b => b.onclick = () => { mlIdx = +b.dataset.k; $$('.mlb', el).forEach(x => x.classList.toggle('pri', x === b)); $('#mlFull', el).href = labPresetHash(labs[mlIdx]); mountMl(); });
      }
      $('#goGame').onclick = () => $('.tabs button[data-t="game"]').click();
      $$('.xq', el).forEach(b => b.onclick = () => { localStorage.setItem('ab_xf', b.dataset.f); $('.tabs button[data-t="explain"]').click(); });
    } else if (tab === 'explain') { explainForms(el, data, r.query.form && !r._xf ? (r._xf = 1, r.query.form) : undefined);
    } else if (tab === 'rules') {
      el.innerHTML = `<div class="stack">
        ${c.formulas.length ? `<h2>📐 ${T('formulas')}</h2><div class="grid auto" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${c.formulas.map(f => `<div class="card fcard"><button class="btn sm ghost cp" data-tex="${esc(f.tex)}">📋</button><div class="fn">${esc(f.name)}</div><div class="fx">${texHtml(f.tex)}</div>${f.note ? `<div class="note md">${mdToHtml(f.note).replace(/^<p>|<\/p>$/g, '')}</div>` : ''}</div>`).join('')}</div>` : `<div class="banner">📐 ${T('no_formulas')}</div>`}
        ${c.rules.length ? `<h2 style="margin-top:22px">📏 ${T('rules')}</h2><div class="stack">${c.rules.map((x, i) => `<div class="rule"><span class="rn">${i + 1}</span><div class="grow">${x.title ? `<h3 style="margin-bottom:4px">${esc(x.title)}</h3>` : ''}<div class="md">${mdToHtml(x.text)}</div></div></div>`).join('')}</div>` : ''}</div>`;
      $$('.cp', el).forEach(b => b.onclick = () => copyText(b.dataset.tex));
    } else if (tab === 'examples') {
      el.innerHTML = c.examples.length ? `<div class="stack">${c.examples.map((x, i) => `<div class="card"><h3>🧩 #${i + 1}</h3><div class="md" style="font-weight:600">${mdToHtml(x.q)}</div>
        <ol class="ex-steps md">${x.steps.map(s => `<li>${mdToHtml(s).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ol>
        <div class="row"><button class="btn sm stepBtn">${T('show_step')}</button><button class="btn sm ghost ansBtn">${T('show_answer')}</button></div><div class="ansBox" hidden><div class="answer-box">✅ ${T('answer')}: <span class="md">${mdToHtml(x.a).replace(/^<p>|<\/p>$/g, '')}</span></div></div></div>`).join('')}</div>`
        : emptyHtml('🧩', '—');
      $$('.card', el).forEach(card => { const lis = $$('.ex-steps li', card); let k = 0; const sb = $('.stepBtn', card), ab = $('.ansBtn', card);
        if (sb) sb.onclick = () => { if (k < lis.length) lis[k++].classList.add('show'); if (k >= lis.length) { sb.disabled = true; $('.ansBox', card).hidden = false; } };
        if (ab) ab.onclick = () => { lis.forEach(l => l.classList.add('show')); $('.ansBox', card).hidden = false; sb.disabled = true; }; });
    } else if (tab === 'game') {
      const words = wordsOf(c); const pairs = memPairs(c);
      const modes = [['classic', '🏇', 'gm_classic'], ['boss', '🐉', 'gm_boss'], ['speed', '⚡', 'gm_speed'], ['memory', '🃏', 'gm_memory', pairs.length >= 3], ['words', '🔤', 'gm_words', words.length >= 3]].filter(m => m[3] !== false);
      const xg = typeof gamesForTopic === 'function' ? gamesForTopic(data) : [];
      el.innerHTML = `<div class="card qcard center gstart"><div class="gicon">🏇</div><h2>${esc(c.game.name || 'Quest')}</h2><p class="muted" style="max-width:560px;margin:0 auto 12px">${esc(c.game.story || '')}</p>
        <p class="small muted">${T('game_intro', { n: c.exercises.length })}</p>
        <h3 style="margin-top:18px">${T('choose_mode')}</h3>
        <div class="modes">${modes.map(([k, ic, l]) => `<button class="mode" data-m="${k}"><span class="mi">${ic}</span><b>${T(l)}</b><small>${T(l + '_d')}</small></button>`).join('')}</div>
        <div class="row" style="justify-content:center;margin-top:14px"><label class="small"><input type="checkbox" id="snd" ${Sound.on ? 'checked' : ''}> 🔊 ${T('sound')}</label></div></div>
        ${xg.length ? `<div class="xgames"><div class="row between"><div><h2>🧩 ${T('xg_title')}</h2><p class="muted small">${T('xg_sub')}</p></div></div>
          <div class="xgrid">${xg.map(g => `<button class="xg ${g.rec ? 'rec' : ''}" data-g="${g.id}"><span class="xgi">${g.icon}</span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small>${g.rec ? `<span class="xrec">★ ${T('xg_rec')}</span>` : ''}</button>`).join('')}</div></div>` : ''}
        ${data.ai ? `<div class="card aiprac"><div class="row between"><div><h3>🤖 ${T('prac_title')}</h3><p class="muted small">${T('prac_sub')}</p></div>
          <div class="row"><select class="in" id="pracLv" style="width:auto"><option value="mixed">${T('lv_mixed')}</option><option value="easy">${T('lv_easy')}</option><option value="medium">${T('lv_medium')}</option><option value="hard">${T('lv_hard')}</option></select><button class="btn pri" id="pracBtn">✨ ${T('prac_go')}</button></div></div><div id="pracBox"></div></div>` : ''}`;
      $$('.xg', el).forEach(b => b.onclick = () => { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); startXGame(b.dataset.g, el, data, () => drawTab('game')); });
      const pb = $('#pracBtn', el); if (pb) pb.onclick = async () => { const box = $('#pracBox', el); pb.disabled = true; box.innerHTML = `<div class="row small muted" style="margin-top:10px"><span class="dots"><i></i><i></i><i></i></span> ${T('prac_wait')}</div>`;
        try { const res = await api('POST', `/api/lesson/${data.topic.id}/practice`, { lang: data.lang, n: 5, level: $('#pracLv', el).value }); new PracticeGame(el, data, res.problems, () => drawTab('game')).start(); }
        catch (e) { box.innerHTML = aiErrHtml(e.message, 'pracRetry'); $('#pracRetry', box).onclick = () => pb.click(); } finally { pb.disabled = false; } };
      $('#snd').onchange = (e) => { Sound.on = e.target.checked; localStorage.setItem('ab_sound', Sound.on ? '1' : '0'); };
      const back = () => drawTab('game');
      $$('.mode', el).forEach(b => b.onclick = () => { const m = b.dataset.m;
        if (m === 'memory') new MemoryGame(el, data, pairs, back).start();
        else if (m === 'words') new WordGame(el, data, words, back).start();
        else new Game(el, data, aId, back, m).start(); });
    }
    renderMath(el);
  };
  await load();
  return () => { alive = false; };
});
function assignModal(topic) {
  api('GET', '/api/classes').then(({ classes }) => {
    if (!classes.length) { toast(T('no_classes_t')); location.hash = '#/classes'; return; }
    modal(`<h2>📌 ${T('assign_this')}</h2><p class="muted">${esc(tTitle(topic))}</p>
      <div class="field"><label class="f">${T('n_classes')}</label><select class="in" id="mc">${classes.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label class="f">${T('kind')}</label><select class="in" id="mk"><option value="homework">${T('k_homework')}</option><option value="classwork">${T('k_classwork')}</option><option value="test">${T('k_test')}</option></select></div>
      <div class="field"><label class="f">${T('due')}</label><input class="in" id="md" type="date"></div>
      <div class="field"><label class="f">${T('note')}</label><input class="in" id="mn"></div>
      <div class="row"><button class="btn pri" id="ok">${T('create')}</button><button class="btn ghost" id="cx">${T('cancel')}</button></div>`, (m, close) => {
      $('#cx', m).onclick = close;
      $('#ok', m).onclick = async () => { try { await api('POST', `/api/classes/${$('#mc', m).value}/assignments`, { topic_id: topic.id, kind: $('#mk', m).value, due_at: $('#md', m).value || null, note: $('#mn', m).value }); close(); toast('✅ ' + T('saved')); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
    });
  });
}
function askTeacherModal(topic) {
  api('GET', '/api/contacts').then(({ contacts }) => {
    if (!contacts.length) { toast(T('no_contacts'), 4000); return; }
    modal(`<h2>✉️ ${T('ask_teacher')}</h2><p class="muted">${esc(tTitle(topic))}</p>
      <div class="field"><select class="in" id="mt">${contacts.map(c => `<option value="${c.user.id}">${esc(c.user.name)}</option>`).join('')}</select></div>
      <div class="field"><textarea class="in" id="mb" rows="4" placeholder="${esc(T('msg_ph'))}"></textarea></div>
      <div class="row"><button class="btn pri" id="ok">${T('send')}</button><button class="btn ghost" id="cx">${T('cancel')}</button></div>`, (m, close) => {
      $('#cx', m).onclick = close; $('#mb', m).focus();
      $('#ok', m).onclick = async () => { try { await api('POST', '/api/messages/' + $('#mt', m).value, { body: $('#mb', m).value, kind: 'question', topic_id: topic.id }); close(); toast('✅ ' + T('send')); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
    });
  });
}

/* ================= ОЙЫН ҚОЗҒАЛТҚЫШЫ ================= */
const normA = (s) => String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е').replace(/\{,\}/g, '.').replace(/\$|\\,/g, '').replace(/\s+/g, '').replace(/,/g, '.').replace(/[.;:!]+$/, '').replace(/^\+/, '');
function fillOk(given, ex) { const g = normA(given); if (!g) return false; return [ex.answer, ...(ex.alt || [])].some(c => { const n = normA(c); if (g === n) return true;
  const num = /^-?\d+(\.\d+)?$/; if (num.test(g) && num.test(n) && Math.abs(+g - +n) < 1e-9) return true;
  const fr = (x) => { const m = /^(-?\d+)\/(\d+)$/.exec(x); return m ? +m[1] / +m[2] : (num.test(x) ? +x : null); }; const a = fr(g), b = fr(n); return a !== null && b !== null && Math.abs(a - b) < 1e-9; }); }
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
class Game {
  constructor(el, data, assignmentId, onExit, mode) { Object.assign(this, { el, data, assignmentId, onExit }); this.mode = mode || 'classic'; this.hearts = 3; this.bossHp = data.content.exercises.length; this.speedLeft = 60; this.ex = data.content.exercises; this.answers = []; this.res = []; this.combo = 0; this.best = 0; this.xp = 0; this.i = 0; this.timer = null; }
  start() { this.t0 = Date.now(); this.show();
    if (this.mode === 'speed') this.gtimer = setInterval(() => { if (!this.el.isConnected) return clearInterval(this.gtimer); this.speedLeft--; const g = $('#gt', this.el); if (g) { g.textContent = '⏱ ' + this.speedLeft + 's'; g.classList.toggle('hot', this.speedLeft <= 10); }
      if (this.speedLeft <= 10 && this.speedLeft > 0) Sound.play('tick'); if (this.speedLeft <= 0) { clearInterval(this.gtimer); this.finish(); } }, 1000); }
  modeHud() {
    if (this.mode === 'boss') { const n = this.ex.length; return `<div class="bossbar"><span class="bossface ${this.hit ? 'hit' : ''}">🐉</span><div class="grow"><div class="small"><b>${T('boss_name')}</b> · HP ${this.bossHp}/${n}</div><div class="hp"><i style="width:${this.bossHp / n * 100}%"></i></div></div><span class="hearts">${[0, 1, 2].map(k => k < this.hearts ? '❤️' : '🖤').join('')}</span></div>`; }
    if (this.mode === 'speed') return `<div class="speedbar"><span class="pill gt ${this.speedLeft <= 10 ? 'hot' : ''}" id="gt">⏱ ${this.speedLeft}s</span><span class="small muted">⚡ ${T('gm_speed_d')}</span></div>`;
    return '';
  }
  hud() {
    return `<div class="ghead"><div class="track">${this.ex.map((_, k) => `${k ? `<div class="seg ${this.res[k - 1] === 1 ? 'ok' : ''}"></div>` : ''}<div class="node ${this.res[k] === undefined ? (k === this.i ? 'cur' : '') : this.res[k] >= 1 ? 'ok' : 'bad'}">${this.res[k] === undefined ? k + 1 : this.res[k] >= 1 ? '✓' : '✗'}</div>`).join('')}</div>
      <div class="hud"><span class="pill combo ${this.combo >= 3 ? 'hot' : ''}">🔥 ×${this.combo}</span><span class="pill" id="xpP">⭐ ${this.xp}</span></div></div>${this.modeHud()}`;
  }
  show() {
    clearInterval(this.timer); if (this.done) return; const ex = this.ex[this.i]; if (!ex) return this.finish();
    const typeL = { quiz: ['🎯', 'q_quiz'], tf: ['⚖️', 'q_tf'], fill: ['✍️', 'q_fill'], match: ['🧲', 'q_match'], order: ['🔢', 'q_order'] }[ex.type];
    const timed = this.mode === 'classic' && (ex.type === 'quiz' || ex.type === 'tf'); const g = this.data.topic.grade; this.limit = (g <= 4 ? 45 : 30) + (ex.type === 'tf' ? -5 : 0);
    this.el.innerHTML = `<div class="game">${this.hud()}<div class="card qcard glass"><div class="row between" style="align-items:flex-start"><div class="grow"><div class="qtype">${typeL[0]} ${T(typeL[1])} · ${this.i + 1}/${this.ex.length}</div>
      <div class="qtext md">${mdToHtml(ex.q || '').replace(/___/g, '<span style="border-bottom:3px solid var(--a1);padding:0 24px"></span>')}</div></div>
      ${timed ? `<div class="timer"><svg width="54" height="54"><circle cx="27" cy="27" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="5"/><circle id="tc" cx="27" cy="27" r="23" fill="none" stroke="url(#rg2)" stroke-width="5" stroke-linecap="round" stroke-dasharray="144.5" stroke-dashoffset="0"/><defs><linearGradient id="rg2"><stop offset="0" stop-color="#00e0c6"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs></svg><b id="tn">${this.limit}</b></div>` : ''}</div>
      <div id="qa"></div><div id="fb"></div></div></div>`;
    const qa = $('#qa', this.el); this.locked = false; this.qStart = Date.now();
    this['draw_' + ex.type](qa, ex); renderMath(this.el);
    if (timed) { let left = this.limit; this.timer = setInterval(() => { left--; const tn = $('#tn', this.el), tc = $('#tc', this.el); if (!tn) return clearInterval(this.timer);
      tn.textContent = left; tc.style.strokeDashoffset = 144.5 * (1 - left / this.limit); if (left <= 5 && left > 0) Sound.play('tick'); if (left <= 0) { clearInterval(this.timer); this.answer(null, 0, true); } }, 1000); }
  }
  draw_quiz(qa, ex) {
    const order = shuf(ex.options.map((o, k) => k));
    qa.innerHTML = `<div class="opts">${order.map((k, j) => `<button class="opt" data-k="${k}" data-l="${'ABCDE'[j]}"><span class="md">${mdToHtml(ex.options[k]).replace(/^<p>|<\/p>$/g, '')}</span></button>`).join('')}</div>`;
    $$('.opt', qa).forEach(b => b.onclick = (e) => { if (this.locked) return; const k = +b.dataset.k; const ok = k === ex.answer ? 1 : 0;
      $$('.opt', qa).forEach(x => { const kk = +x.dataset.k; if (kk === ex.answer) x.classList.add('right'); else x.classList.add('dim'); }); if (!ok) b.classList.add('wrong');
      this.answer(k, ok, false, e); });
  }
  draw_tf(qa, ex) {
    qa.innerHTML = `<div class="tf"><button class="opt" data-v="1" style="background:linear-gradient(135deg,#22d39a,#00a884)">✅ ${T('true_')}</button><button class="opt" data-v="0" style="background:linear-gradient(135deg,#ff5d73,#d61f45)">❌ ${T('false_')}</button></div>`;
    $$('.opt', qa).forEach(b => b.onclick = (e) => { if (this.locked) return; const v = b.dataset.v === '1'; const ok = v === ex.answer ? 1 : 0;
      $$('.opt', qa).forEach(x => x.classList.add((x.dataset.v === '1') === ex.answer ? 'right' : 'dim')); if (!ok) b.classList.add('wrong'); this.answer(v, ok, false, e); });
  }
  draw_fill(qa, ex) {
    qa.innerHTML = `<div class="fillrow"><input class="in" id="fi" placeholder="${esc(T('your_answer'))}" autocomplete="off"><button class="btn pri" id="fc">${T('check')}</button></div>`;
    const fi = $('#fi', qa); setTimeout(() => fi.focus(), 50);
    const go = (e) => { if (this.locked || !fi.value.trim()) return; const ok = fillOk(fi.value, ex) ? 1 : 0; fi.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)'; fi.disabled = true; this.answer(fi.value, ok, false, e); };
    $('#fc', qa).onclick = go; fi.onkeydown = (e) => { if (e.key === 'Enter') go(e); };
  }
  draw_match(qa, ex) {
    const rights = shuf(ex.pairs.map(p => p[1]));
    qa.innerHTML = `<p class="small muted">🧲 ${T('drag_hint')}</p><div>${ex.pairs.map((p, k) => `<div class="mslot" data-k="${k}"><div class="l md">${mdToHtml(p[0]).replace(/^<p>|<\/p>$/g, '')}</div><div class="drop" data-k="${k}"></div></div>`).join('')}</div>
      <div class="pool" id="pool">${rights.map(t => `<div class="chipd" data-v="${esc(t)}"><span class="md">${mdToHtml(t).replace(/^<p>|<\/p>$/g, '')}</span></div>`).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn pri" id="mc" disabled>${T('check')}</button></div>`;
    let sel = null; const pool = $('#pool', qa); const upd = () => { $('#mc', qa).disabled = $$('.drop', qa).some(d => !d.firstElementChild); };
    const place = (chip, target) => { if (!target) return; if (target.classList.contains('drop') && target.firstElementChild && target.firstElementChild !== chip) pool.appendChild(target.firstElementChild); target.appendChild(chip); chip.classList.remove('sel'); sel = null; $$('.drop', qa).forEach(d => d.classList.remove('sel')); upd(); };
    $$('.chipd', qa).forEach(chip => dragify(chip, {
      tap: () => { if (this.locked) return; if (chip.parentElement.classList.contains('drop')) { pool.appendChild(chip); upd(); return; } if (sel === chip) { chip.classList.remove('sel'); sel = null; return; } $$('.chipd', qa).forEach(c => c.classList.remove('sel')); sel = chip; chip.classList.add('sel'); $$('.drop', qa).forEach(d => d.classList.add('sel')); },
      drop: (x, y) => { if (this.locked) return; const t = document.elementFromPoint(x, y); const target = t && (t.closest('.drop') || t.closest('.pool')); if (target && qa.contains(target)) place(chip, target); },
      over: (x, y) => { $$('.drop', qa).forEach(d => d.classList.remove('over')); const t = document.elementFromPoint(x, y); const d = t && t.closest('.drop'); if (d) d.classList.add('over'); } }));
    $$('.drop', qa).forEach(d => d.onclick = (e) => { if (sel && !e.target.closest('.chipd')) place(sel, d); });
    $('#mc', qa).onclick = (e) => { if (this.locked) return; const ans = ex.pairs.map((p, k) => { const c = $(`.drop[data-k="${k}"] .chipd`, qa); return c ? c.dataset.v : null; });
      let ok = 0; ex.pairs.forEach((p, k) => { const good = ans[k] === p[1]; if (good) ok++; $(`.mslot[data-k="${k}"]`, qa).classList.add(good ? 'ok' : 'no'); });
      const score = ok === ex.pairs.length ? 1 : Math.round(ok / ex.pairs.length * 2) / 4; $('#mc', qa).disabled = true; this.answer(ans, score, false, e); };
  }
  draw_order(qa, ex) {
    let items = shuf(ex.items); let guard = 0; while (items.every((v, k) => v === ex.items[k]) && guard++ < 10) items = shuf(ex.items);
    qa.innerHTML = `<p class="small muted">🔢 ${T('order_hint')}</p><ul class="olist" id="ol">${items.map(t => `<li class="oitem" data-v="${esc(t)}"><span class="h">⠿</span><span class="num"></span><span class="md grow">${mdToHtml(t).replace(/^<p>|<\/p>$/g, '')}</span><span class="mv"><button class="up">↑</button><button class="dn">↓</button></span></li>`).join('')}</ul>
      <div class="row" style="margin-top:14px"><button class="btn pri" id="oc">${T('check')}</button></div>`;
    const ol = $('#ol', qa); const nums = () => $$('.oitem', ol).forEach((li, k) => $('.num', li).textContent = k + 1); nums();
    $$('.oitem', ol).forEach(li => { $('.up', li).onclick = () => { if (!this.locked && li.previousElementSibling) { ol.insertBefore(li, li.previousElementSibling); nums(); } };
      $('.dn', li).onclick = () => { if (!this.locked && li.nextElementSibling) { ol.insertBefore(li.nextElementSibling, li); nums(); } };
      sortable(li, ol, () => this.locked, nums); });
    $('#oc', qa).onclick = (e) => { if (this.locked) return; const ans = $$('.oitem', ol).map(li => li.dataset.v); const ok = ans.every((v, k) => v === ex.items[k]) ? 1 : 0;
      $$('.oitem', ol).forEach((li, k) => li.classList.add(li.dataset.v === ex.items[k] ? 'ok' : 'no')); $('#oc', qa).disabled = true; this.answer(ans, ok, false, e); };
  }
  answer(value, score, timeout, ev) {
    if (this.locked) return; this.locked = true; clearInterval(this.timer); const ex = this.ex[this.i];
    this.answers[this.i] = value; this.res[this.i] = score;
    if (score >= 1) { this.combo++; this.best = Math.max(this.best, this.combo); const gain = 10 + Math.min(this.combo, 5) * 2; this.xp += gain; Sound.play('ok');
      const pt = ev && ev.clientX ? [ev.clientX, ev.clientY] : [innerWidth / 2, innerHeight / 2]; xpFly(pt[0] - 20, pt[1] - 30, '+' + gain + ' XP'); }
    else { this.combo = 0; Sound.play('bad'); if (score > 0) this.xp += 4; }
    this.hit = false; if (this.mode === 'boss') { if (score >= 1) { this.bossHp = Math.max(0, this.bossHp - 1); this.hit = true; } else this.hearts--; }
    const correct = ex.type === 'quiz' ? ex.options[ex.answer] : ex.type === 'tf' ? (ex.answer ? T('true_') : T('false_')) : ex.type === 'fill' ? ex.answer : ex.type === 'match' ? ex.pairs.map(p => p[0] + ' → ' + p[1]).join('; ') : ex.items.join(' → ');
    const last = this.i === this.ex.length - 1 || (this.mode === 'boss' && this.hearts <= 0);
    $('#fb', this.el).innerHTML = `<div class="feedback ${score >= 1 ? 'ok' : 'no'}"><span class="big">${score >= 1 ? '🎉' : timeout ? '⏰' : score > 0 ? '🤏' : '💡'}</span><div class="grow">
      <b>${score >= 1 ? T('correct') : timeout ? T('timeout') : score > 0 ? T('partly') : T('wrong')}</b>${score < 1 ? `<div class="small"><b>${T('right_answer')}:</b> <span class="md">${mdToHtml(correct).replace(/^<p>|<\/p>$/g, '')}</span></div>` : ''}
      ${ex.explain ? `<div class="small md" style="margin-top:4px">${mdToHtml(ex.explain).replace(/^<p>|<\/p>$/g, '')}</div>` : ''}
      ${score < 1 && this.data.ai && this.mode !== 'speed' ? `<button class="btn sm ghost xpl" style="margin-top:8px">🤖 ${T('explain_mistake')}</button><div class="xplbox md small"></div>` : ''}</div>
      <button class="btn pri" id="nx">${last ? T('finish') + ' 🏁' : T('next') + ' →'}</button></div>`;
    renderMath($('#fb', this.el)); const xpP = $('#xpP', this.el); if (xpP) xpP.textContent = '⭐ ' + this.xp;
    const nx = $('#nx', this.el); nx.focus();
    const xb = $('#fb .xpl', this.el); if (xb) xb.onclick = () => explainMistake(this, this.i, value, xb, $('#fb .xplbox', this.el));
    nx.onclick = () => { if (this.mode === 'boss' && this.hearts <= 0) return this.finish(); this.i++; this.show(); };
    const gh = this.el.querySelector('.ghead'); const mh = this.el.querySelector('.bossbar,.speedbar'); if (mh) mh.remove(); gh.outerHTML = this.hud();
    if (this.mode === 'speed') { const ii = this.i; setTimeout(() => { if (this.i === ii && !this.done && this.el.isConnected) nx.click(); }, score >= 1 ? 650 : 1400); }
  }
  async finish() {
    if (this.done) return; this.done = true; clearInterval(this.timer); clearInterval(this.gtimer);
    this.el.innerHTML = `<div class="game"><div class="card qcard result"><div class="dots"><i></i><i></i><i></i></div></div></div>`;
    let r;
    try { r = await api('POST', `/api/lesson/${this.data.topic.id}/submit`, { lang: this.data.lang, answers: this.answers, time_ms: Date.now() - this.t0, best_combo: this.best, assignment_id: this.assignmentId, mode: this.mode, stamp: this.data.stamp }); }
    catch (e) { this.el.innerHTML = errBox(e); return; }
    const R = r.result; refreshUser(r.user);
    const good = R.percent >= 65;
    this.el.innerHTML = `<div class="game"><div class="card qcard result glass">
      <h1 class="grad-t">${this.mode === 'boss' ? (this.bossHp <= 0 ? '🐉💥 ' + T('boss_win') : '🐉 ' + T('boss_lose')) : this.mode === 'speed' ? '⚡ ' + (this.speedLeft > 0 ? T('speed_fast', { n: this.answers.filter(x => x !== undefined).length, s: this.speedLeft }) : T('speed_done', { n: this.answers.filter(x => x !== undefined).length })) : good ? T('res_title') : T('res_title_low')}</h1>
      <div class="bigstars">${[0, 1, 2].map(k => `<span data-k="${k}">⭐</span>`).join('')}</div>
      ${r.levelUp ? `<div class="banner" style="justify-content:center;margin:10px auto;max-width:420px;border-color:var(--sun)">${T('level_up', { n: r.user.level })}</div>` : ''}
      <div class="kpis"><div class="kpi"><b>${R.score}/${R.total}</b><span>${T('score')}</span></div><div class="kpi"><b>${R.percent}%</b><span>${T('percent')}</span></div>
        <div class="kpi"><span class="mark bigmark m${R.mark}" style="width:54px;height:54px;font-size:30px;border-radius:16px">${R.mark}</span><span style="display:block">${T('mark')}</span></div><div class="kpi"><b class="grad-t" id="xpc">+0</b><span>${T('xp_got')}</span></div></div>
      <p class="small muted">${T('saved_gb')}</p>
      <div class="row" style="justify-content:center"><button class="btn pri" id="again">🔁 ${T('play_again')}</button><button class="btn" id="toL">📖 ${T('to_lesson')}</button><button class="btn" id="nextT">${T('next_topic')}</button></div>
      <div class="review"><h3>${T('review')}</h3>${r.review.map((x, k) => !this.ex[k] ? '' : `<div class="it"><span>${x.ok >= 1 ? '✅' : x.ok > 0 ? '🟡' : '❌'}</span><div class="grow"><div class="md small" style="font-weight:700">${mdToHtml(this.ex[k].q).replace(/^<p>|<\/p>$/g, '')}</div>
        <div class="small"><b>${T('right_answer')}:</b> <span class="md">${mdToHtml(typeof x.correct === 'boolean' ? (x.correct ? T('true_') : T('false_')) : String(x.correct)).replace(/^<p>|<\/p>$/g, '')}</span></div>${x.explain ? `<div class="small muted md">${mdToHtml(x.explain).replace(/^<p>|<\/p>$/g, '')}</div>` : ''}
        ${x.ok < 1 && this.data.ai ? `<button class="btn sm ghost rxpl" data-k="${k}">🤖 ${T('explain_mistake')}</button><div class="xplbox md small"></div>` : ''}</div></div>`).join('')}</div>
    </div></div>`;
    renderMath(this.el);
    $$('.bigstars span', this.el).forEach((s, k) => setTimeout(() => { if (k < R.stars) { s.classList.add('on'); Sound.play('ok'); } }, 400 + k * 350));
    let n = 0; const xc = $('#xpc', this.el); const step = Math.max(1, Math.round(R.xp / 30)); const iv = setInterval(() => { n = Math.min(R.xp, n + step); if (xc) xc.textContent = '+' + n; if (n >= R.xp) clearInterval(iv); }, 30);
    if (R.stars >= 2) { confetti(); Sound.play('win'); }
    $$('.rxpl', this.el).forEach(b => b.onclick = () => explainMistake(this, +b.dataset.k, this.answers[+b.dataset.k], b, b.nextElementSibling));
    $('#again', this.el).onclick = () => new Game(this.el, this.data, this.assignmentId, this.onExit, this.mode).start();
    $('#toL', this.el).onclick = () => { $('.tabs button[data-t="theory"]').click(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const nt = $('#nextT', this.el); if (!this.data.next) nt.remove(); else nt.onclick = () => { location.hash = '#/lesson/' + this.data.next; };
  }
}
/* сүйреу (тінтуір + сенсор) */
function dragify(el, h) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return; e.preventDefault();
    const sx = e.clientX, sy = e.clientY; let moved = false, ghost = null; const r = el.getBoundingClientRect(); const ox = sx - r.left, oy = sy - r.top;
    const mv = (ev) => { if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) { moved = true; ghost = el.cloneNode(true); ghost.classList.add('dragging'); ghost.style.width = r.width + 'px'; document.body.appendChild(ghost); el.style.opacity = '.35'; }
      if (moved) { ghost.style.left = (ev.clientX - ox) + 'px'; ghost.style.top = (ev.clientY - oy) + 'px'; h.over && h.over(ev.clientX, ev.clientY); } };
    const up = (ev) => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
      if (moved) { ghost.remove(); el.style.opacity = ''; $$('.drop.over').forEach(d => d.classList.remove('over')); h.drop && h.drop(ev.clientX, ev.clientY); } else h.tap && h.tap(); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  });
}
function sortable(li, list, locked, after) {
  li.addEventListener('pointerdown', (e) => {
    if (locked() || e.target.closest('button') || (e.button !== undefined && e.button !== 0)) return; e.preventDefault(); li.classList.add('drag'); let lastY = e.clientY;
    const mv = (ev) => { const dy = ev.clientY - lastY; const sib = dy > 0 ? li.nextElementSibling : li.previousElementSibling; if (!sib) return; const r = sib.getBoundingClientRect(); const mid = r.top + r.height / 2;
      if ((dy > 0 && ev.clientY > mid) || (dy < 0 && ev.clientY < mid)) { if (dy > 0) list.insertBefore(sib, li); else list.insertBefore(li, sib); lastY = ev.clientY; after(); } };
    const up = () => { li.classList.remove('drag'); document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  });
}

/* ===== Қосымша ойын режимдері ===== */
const stripMd = (x) => String(x || '').replace(/\*\*|__|`/g, '').trim();
function memPairs(c) {
  const out = []; const seen = new Set();
  const add = (a, b) => { a = String(a || '').trim(); b = String(b || '').trim(); if (!a || !b || a.length > 80 || b.length > 80 || seen.has(a) || seen.has(b)) return; seen.add(a); seen.add(b); out.push([a, b]); };
  (c.formulas || []).forEach(f => add(f.name, '$' + f.tex + '$'));
  (c.exercises || []).forEach(e => { if (e.type === 'match') e.pairs.forEach(p => add(p[0], p[1])); });
  (c.exercises || []).forEach(e => { if (e.type === 'quiz' && e.q.length < 70) add(e.q, e.options[e.answer]); });
  return out.slice(0, 6);
}
function wordsOf(c) {
  const out = []; const seen = new Set();
  (c.exercises || []).forEach(e => { let w = null;
    if (e.type === 'fill') w = e.answer; else if (e.type === 'quiz') w = e.options[e.answer];
    w = stripMd(w); if (!w || !/^[\p{L}\p{N}]{2,12}$/u.test(w) || seen.has(w.toLowerCase())) return; seen.add(w.toLowerCase()); out.push({ w, q: e.q }); });
  return out.slice(0, 6);
}
class MemoryGame {
  constructor(el, data, pairs, onExit) { Object.assign(this, { el, data, pairs, onExit }); }
  start() {
    this.t0 = Date.now(); this.moves = 0; this.found = 0; this.open = [];
    const cards = shuf(this.pairs.flatMap((p, k) => [{ k, t: p[0] }, { k, t: p[1] }]));
    this.el.innerHTML = `<div class="game"><div class="ghead"><h2>🃏 ${T('gm_memory')}</h2><div class="hud"><span class="pill" id="mv">👆 0</span><span class="pill" id="mf">✅ 0/${this.pairs.length}</span></div></div>
      <div class="memgrid">${cards.map(c => `<button class="mcard" data-k="${c.k}"><div class="in"><div class="f front">?</div><div class="f back md">${mdToHtml(c.t).replace(/^<p>|<\/p>$/g, '')}</div></div></button>`).join('')}</div></div>`;
    renderMath(this.el);
    $$('.mcard', this.el).forEach(b => b.onclick = (e) => {
      if (b.classList.contains('flip') || this.open.length >= 2) return; b.classList.add('flip'); this.open.push(b); Sound.play('tick');
      if (this.open.length === 2) { this.moves++; $('#mv', this.el).textContent = '👆 ' + this.moves; const [a, c] = this.open;
        if (a.dataset.k === c.dataset.k) { setTimeout(() => { a.classList.add('ok'); c.classList.add('ok'); Sound.play('ok'); xpFly(e.clientX - 20, e.clientY - 30, '✓'); this.open = []; this.found++; $('#mf', this.el).textContent = `✅ ${this.found}/${this.pairs.length}`; if (this.found === this.pairs.length) setTimeout(() => this.finish(), 600); }, 350); }
        else setTimeout(() => { a.classList.remove('flip'); c.classList.remove('flip'); this.open = []; Sound.play('bad'); }, 900); }
    });
  }
  finish() { const extra = Math.max(0, this.moves - this.pairs.length); const score = Math.max(3, Math.round((10 - extra * 0.7) * 10) / 10); modeResult(this, 'memory', score, 10, `👆 ${this.moves} · ⏱ ${Math.round((Date.now() - this.t0) / 1000)}s`); }
}
class WordGame {
  constructor(el, data, words, onExit) { Object.assign(this, { el, data, words, onExit }); }
  start() { this.t0 = Date.now(); this.i = 0; this.ok = 0; this.show(); }
  show() {
    const it = this.words[this.i]; if (!it) return this.finish();
    const letters = [...it.w]; let tiles = shuf(letters.map((ch, k) => ({ ch, k }))); let g = 0; while (tiles.length > 1 && tiles.every((t, k) => t.k === k) && g++ < 10) tiles = shuf(tiles);
    this.el.innerHTML = `<div class="game"><div class="ghead"><h2>🔤 ${T('gm_words')} · ${this.i + 1}/${this.words.length}</h2><div class="hud"><span class="pill">✅ ${this.ok}</span></div></div>
      <div class="card qcard glass"><div class="qtype">🔤 ${T('word_hint')}</div><div class="qtext md">${mdToHtml(it.q).replace(/___/g, '<span style="border-bottom:3px solid var(--a1);padding:0 24px"></span>')}</div>
      <div class="wslots" id="ws">${letters.map(() => '<span class="wslot"></span>').join('')}</div>
      <div class="wtiles" id="wt">${tiles.map((t, k) => `<button class="wtile" data-i="${k}">${esc(t.ch)}</button>`).join('')}</div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn" id="wb">⌫</button><button class="btn ghost" id="wsk">${T('skip')}</button></div><div id="fb"></div></div></div>`;
    renderMath(this.el); const built = [];
    const paint = () => $$('.wslot', this.el).forEach((s, k) => { s.textContent = built[k] ? built[k].ch : ''; s.classList.toggle('fill', !!built[k]); });
    const done = (okv) => { if (this.locked) return; this.locked = true; if (okv) { this.ok++; Sound.play('ok'); } else Sound.play('bad');
      $('#ws', this.el).classList.add(okv ? 'ok' : 'no');
      $('#fb', this.el).innerHTML = `<div class="feedback ${okv ? 'ok' : 'no'}"><span class="big">${okv ? '🎉' : '💡'}</span><div class="grow"><b>${okv ? T('correct') : T('wrong')}</b><div class="small">${T('right_answer')}: <b>${esc(it.w)}</b></div></div><button class="btn pri" id="nx">${T('next')} →</button></div>`;
      $('#nx', this.el).onclick = () => { this.locked = false; this.i++; this.show(); }; };
    $$('.wtile', this.el).forEach(b => b.onclick = () => { if (this.locked || b.disabled) return; b.disabled = true; built.push({ ch: tiles[+b.dataset.i].ch, b }); paint(); Sound.play('tick');
      if (built.length === letters.length) done(built.map(x => x.ch).join('').toLowerCase() === it.w.toLowerCase()); });
    $('#wb', this.el).onclick = () => { if (this.locked) return; const x = built.pop(); if (x) { x.b.disabled = false; paint(); } };
    $('#wsk', this.el).onclick = () => done(false);
  }
  finish() { modeResult(this, 'words', this.ok, this.words.length, `⏱ ${Math.round((Date.now() - this.t0) / 1000)}s`); }
}
async function modeResult(g, mode, score, total, extra) {
  g.el.innerHTML = `<div class="game"><div class="card qcard result"><div class="dots"><i></i><i></i><i></i></div></div></div>`;
  let r; try { r = await api('POST', `/api/lesson/${g.data.topic.id}/submit-mode`, { mode, score, total, time_ms: Date.now() - g.t0, lang: g.data.lang }); } catch (e) { g.el.innerHTML = errBox(e); return; }
  const R = r.result; refreshUser(r.user);
  g.el.innerHTML = `<div class="game"><div class="card qcard result glass"><h1 class="grad-t">${mode === 'memory' ? '🃏' : mode === 'words' ? '🔤' : (window.XG_ICON && XG_ICON[mode]) || '🎮'} ${R.percent >= 65 ? T('res_title') : T('res_title_low')}</h1>
    <div class="bigstars">${[0, 1, 2].map(k => `<span>⭐</span>`).join('')}</div>
    ${r.levelUp ? `<div class="banner" style="justify-content:center;margin:10px auto;max-width:420px">${T('level_up', { n: r.user.level })}</div>` : ''}
    <div class="kpis"><div class="kpi"><b>${R.score}/${R.total}</b><span>${T('score')}</span></div><div class="kpi"><b>${R.percent}%</b><span>${T('percent')}</span></div>
      <div class="kpi"><span class="mark bigmark m${R.mark}" style="width:54px;height:54px;font-size:30px;border-radius:16px">${R.mark}</span><span style="display:block">${T('mark')}</span></div><div class="kpi"><b class="grad-t">+${R.xp}</b><span>${T('xp_got')}</span></div></div>
    <p class="small muted">${esc(extra)}</p>
    <div class="row" style="justify-content:center"><button class="btn pri" id="again">🔁 ${T('play_again')}</button><button class="btn" id="modes">🎮 ${T('choose_mode')}</button></div></div></div>`;
  $$('.bigstars span', g.el).forEach((s, k) => setTimeout(() => { if (k < R.stars) { s.classList.add('on'); Sound.play('ok'); } }, 400 + k * 350));
  if (R.stars >= 2) { confetti(); Sound.play('win'); }
  $('#again', g.el).onclick = () => g.start(); $('#modes', g.el).onclick = g.onExit;
}

/* ===== v3: қатені түсіндіру (AI, ағынды) ===== */
async function explainMistake(game, i, given, btn, box) {
  if (!box || btn.disabled) return; btn.disabled = true; let full = '';
  box.innerHTML = `<span class="dots"><i></i><i></i><i></i></span>`; box.classList.add('on');
  const body = game.practice ? { ex: game.ex[i], given, lang: game.data.lang } : { i, stamp: game.data.stamp, given, lang: game.data.lang };
  try {
    await sse(`/api/lesson/${game.data.topic.id}/explain`, body, {
      delta: (d) => { full += d.t; box.innerHTML = mdToHtml(full); renderMath(box); },
      retry: (d) => { full = ''; box.innerHTML = `<span class="muted">🔄 ${esc(retryReason(d))}</span>`; } });
    box.innerHTML = `<div class="xplhead">🤖 ${T('n_bolat')}</div>` + mdToHtml(full); renderMath(box); btn.remove();
  } catch (e) { box.innerHTML = aiErrHtml(e.message, 'xr' + i); const rb = box.querySelector('button'); rb.onclick = () => { btn.disabled = false; explainMistake(game, i, given, btn, box); }; }
}
/* ===== v3: AI жаттығулары ===== */
class PracticeGame extends Game {
  constructor(el, data, exs, onExit) { super(el, Object.assign({}, data, { content: Object.assign({}, data.content, { exercises: exs }) }), null, onExit, 'classic'); this.practice = true; this.exs = exs; }
  start() { this.done = false; this.i = 0; this.answers = []; this.res = []; this.xp = 0; this.combo = 0; super.start(); }
  finish() { if (this.done) return; this.done = true; clearInterval(this.timer); const sc = this.res.reduce((a, b) => a + (b || 0), 0); modeResult(this, 'ai_practice', Math.round(sc * 10) / 10, this.ex.length, '🤖 ' + T('prac_title')); }
}
