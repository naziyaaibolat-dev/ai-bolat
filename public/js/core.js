'use strict';
/* ===== AI-bolat: негізгі көмекшілер ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const Routes = {};
function route(name, fn) { Routes[name] = fn; }
const State = { user: null, config: null, catalog: null, unread: {} };
async function api(method, url, body) {
  let r; try { r = await fetch(url, { method, headers: Object.assign({ 'X-Lang': LANG }, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' }); }
  catch (e) { const x = new Error(T('err_net')); x.net = true; throw x; }
  let data = null; try { data = await r.json(); } catch (e) { /* */ }
  if (!r.ok) { const e = new Error((data && data.error) || `${T('err_net')} (${r.status})`); e.status = r.status; e.code = data && data.code; throw e; }
  return data;
}
function renderMath(el) {
  if (!el || !window.renderMathInElement) return;
  try { renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }, { left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }], throwOnError: false, strict: 'ignore' }); } catch (e) { /* */ }
}
function texHtml(tex, display = true) { try { return katex.renderToString(String(tex), { displayMode: display, throwOnError: false, strict: 'ignore' }); } catch (e) { return esc(tex); } }
function toast(html, ms = 2800) {
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; document.body.appendChild(t); renderMath(t);
  requestAnimationFrame(() => t.classList.add('show')); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
}
function modal(html, onMount) {
  const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.innerHTML = `<div class="modal glass">${html}</div>`;
  const close = () => bg.remove(); bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
  document.body.appendChild(bg); renderMath(bg); if (onMount) onMount(bg.firstElementChild, close); return close;
}
const fmtDate = (iso, time = true) => { if (!iso) return '—'; const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z'); if (isNaN(d)) return iso; const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}` + (time ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : ''); };
const starsHtml = (n, max = 3) => `<span class="stars">${Array.from({ length: max }, (_, i) => `<span class="${i < n ? '' : 'off'}">★</span>`).join('')}</span>`;
const markHtml = (m, cls = 'sm') => m ? `<span class="mark ${cls} m${m}">${m}</span>` : '<span class="muted">—</span>';
const subjName = (s) => s ? (s[LANG] || s.kk) : '';
const tTitle = (t) => t ? (t[LANG] || t.kk) : '';
const kindTag = (k) => `<span class="tag ${k === 'homework' ? 'hw' : k === 'test' ? 'test' : 'cw'}">${k === 'homework' ? '🏠 ' + T('k_homework') : k === 'test' ? '📝 ' + T('k_test') : '🏫 ' + T('k_classwork')}</span>`;
const fmtPhone = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length === 11 ? `+7 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}` : p; };
function phoneMask(inp) {
  const fmt = () => { let d = inp.value.replace(/\D/g, ''); if (d.length > 11) d = '7' + d.slice(-10); if (d.startsWith('8')) d = '7' + d.slice(1); if (!d.startsWith('7')) d = '7' + d; d = d.slice(0, 11);
    let s = '+7'; if (d.length > 1) s += ' ' + d.slice(1, 4); if (d.length > 4) s += ' ' + d.slice(4, 7); if (d.length > 7) s += ' ' + d.slice(7, 9); if (d.length > 9) s += ' ' + d.slice(9, 11); inp.value = s; };
  inp.addEventListener('input', fmt); inp.addEventListener('paste', (e) => { const t = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, ''); if (t.length >= 10) { e.preventDefault(); inp.value = '+7' + t.slice(-10); fmt(); } }); inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+7 '; }); if (inp.value) fmt();
}
function copyText(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(T('copied'))).catch(() => { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); toast(T('copied')); } catch (e) { /* */ } a.remove(); }); }
function emptyHtml(e, text) { return `<div class="empty"><div class="e">${e}</div><div>${text}</div></div>`; }
function errBox(e) { return `<div class="card"><p class="err">⚠️ ${esc(e.message || e)}</p><a class="btn sm" href="#/">${T('n_home')}</a></div>`; }
const loadingHtml = () => `<div class="card"><div class="skel" style="width:40%"></div><div class="skel"></div><div class="skel" style="width:70%"></div></div>`;
const levelInfo = (u) => { const span = Math.max(1, u.level_next - u.level_base); return { pct: Math.min(100, Math.round((u.xp - u.level_base) / span * 100)), left: Math.max(0, u.level_next - u.xp) }; };
function ringHtml(pct, center, size = 120, stroke = 10) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00e0c6"/><stop offset=".6" stop-color="#7c5cff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#rg)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" style="transition:stroke-dashoffset 1s"/></svg><div class="c">${center}</div></div>`;
}
/* Markdown → HTML (математика $…$ сақталады) */
function mdToHtml(src) {
  const maths = []; const keep = (m) => { maths.push(m); return `\u0000${maths.length - 1}\u0000`; };
  let s = String(src || '').replace(/\r/g, '');
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (m, x) => keep('$$' + x + '$$')).replace(/\\\(([\s\S]+?)\\\)/g, (m, x) => keep('$' + x + '$'));
  s = s.replace(/\$\$[\s\S]+?\$\$/g, keep).replace(/\$[^$\n]+?\$/g, keep);
  s = esc(s);
  const inline = (t) => t.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
  const lines = s.split('\n'); const out = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { const lv = Math.min(4, m[1].length + 1); out.push(`<h${lv}>${inline(m[2])}</h${lv}>`); i++; continue; }
    if (/^\s*\|.*\|\s*$/.test(l)) { const rows = []; while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const body = rows.filter(r => !/^[\s|:\-]+$/.test(r));
      const head = body.shift(); out.push(`<div class="table-wrap"><table><thead><tr>${cells(head).map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${cells(r).map(c => `<td>${inline(c).replace(/&lt;br\s*\/?&gt;/g, '<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue; }
    if (/^\s*([-*•]|\d+[.)])\s+/.test(l)) { const ordered = /^\s*\d+[.)]/.test(l); const items = [];
      while (i < lines.length && (ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*•]\s+/).test(lines[i])) { items.push(lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, '')); i++; }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map(x => `<li>${inline(x)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`); continue; }
    if (/^\s*(---|\*\*\*)\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    const para = []; while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4})\s|^\s*\||^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) { para.push(lines[i]); i++; }
    if (para.length) out.push(`<p>${inline(para.join('<br>'))}</p>`); else { out.push(`<p>${inline(l)}</p>`); i++; }
  }
  return out.join('\n').replace(/\u0000(\d+)\u0000/g, (m, k) => esc(maths[+k]));
}
/* дыбыс (WebAudio) */
const Sound = { on: localStorage.getItem('ab_sound') !== '0', ctx: null,
  play(kind) { if (!this.on) return; try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); const c = this.ctx;
    const seq = { ok: [[660, 0], [880, .09]], bad: [[220, 0], [180, .12]], win: [[523, 0], [659, .1], [784, .2], [1046, .32]], tick: [[900, 0]] }[kind] || [];
    for (const [f, t] of seq) { const o = c.createOscillator(), g = c.createGain(); o.type = kind === 'bad' ? 'sawtooth' : 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, c.currentTime + t);
      g.gain.exponentialRampToValueAtTime(kind === 'tick' ? .03 : .12, c.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t + .18); o.connect(g).connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + .2); } } catch (e) { /* */ } } };
/* конфетти */
function confetti(ms = 3200) {
  let cv = document.getElementById('confetti'); if (!cv) { cv = document.createElement('canvas'); cv.id = 'confetti'; document.body.appendChild(cv); }
  const ctx = cv.getContext('2d'); const W = cv.width = innerWidth, H = cv.height = innerHeight; const cols = ['#00e0c6', '#7c5cff', '#ff5fa2', '#ffc53d', '#22d39a', '#fff'];
  const ps = Array.from({ length: 180 }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 4, r: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: (Math.random() - .5) * .3, s: Math.random() < .5 }));
  const t0 = performance.now();
  (function frame(t) { ctx.clearRect(0, 0, W, H); const done = t - t0 > ms;
    for (const p of ps) { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = done ? Math.max(0, 1 - (t - t0 - ms) / 600) : 1;
      if (p.s) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { ctx.beginPath(); ctx.arc(0, 0, p.r / 1.5, 0, 7); ctx.fill(); } ctx.restore(); }
    if (t - t0 < ms + 600) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H); })(t0);
}
function xpFly(x, y, text) { const d = document.createElement('div'); d.className = 'xpfly'; d.textContent = text; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1200); }
async function getCatalog() { if (!State.catalog) State.catalog = await api('GET', '/api/catalog'); return State.catalog; }
function readImage(file, max = 1600) {
  return new Promise((res, rej) => { if (!/^image\//.test(file.type)) return rej(new Error('image')); const fr = new FileReader(); fr.onerror = rej;
    fr.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .85)); }; img.onerror = rej; img.src = fr.result; }; fr.readAsDataURL(file); });
}
/* ===== v3: SSE (POST) көмекшісі ===== */
async function sse(url, body, on = {}, signal) {
  let resp;
  try { resp = await fetch(url, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'X-Lang': LANG }, body: JSON.stringify(body || {}), credentials: 'same-origin' }); }
  catch (e) { if (e.name === 'AbortError') throw e; const x = new Error(T('err_net')); x.net = true; throw x; }
  const ct = resp.headers.get('content-type') || '';
  if (!ct.includes('text/event-stream')) { let d = null; try { d = await resp.json(); } catch (e) { /* */ } if (!resp.ok) { const e = new Error((d && d.error) || T('err_net')); e.status = resp.status; e.code = d && (d.key || d.code); throw e; } on.json && on.json(d); return d; }
  const rd = resp.body.getReader(); const dec = new TextDecoder(); let buf = ''; let err = null;
  for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i;
    while ((i = buf.indexOf('\n\n')) >= 0) { const block = buf.slice(0, i); buf = buf.slice(i + 2); const ev = (block.match(/^event: (.*)$/m) || [])[1]; const dl = (block.match(/^data: (.*)$/m) || [])[1]; if (!ev || !dl) continue;
      let d; try { d = JSON.parse(dl); } catch (e) { continue; }
      if (ev === 'error') { err = new Error(d.error || T('ai_err_generic')); err.code = d.key || d.code; } else if (on[ev]) on[ev](d); } }
  if (err) throw err;
}
/* AI қатесі: түсінікті хабар + «Қайталау» батырмасы */
function aiErrHtml(msg, id = 'aiRetry') { return `<div class="aierr"><span class="aie-ic">⚠️</span><div class="grow"><b>${T('ai_problem')}</b><div class="small">${esc(msg || T('ai_err_generic'))}</div></div><button class="btn sm pri" id="${id}">🔁 ${T('retry')}</button></div>`; }
const retryReason = (d) => { const r = (d && (d.reason || '')) + ''; return /quota|429/.test(r) ? T('ai_sw_quota') : /overload|503|5\d\d/.test(r) ? T('ai_sw_busy') : /timeout/.test(r) ? T('ai_sw_slow') : T('ai_sw'); };
/* ---------- AI мазмұнына шағым (Google Play: AI-Generated Content саясаты) ---------- */
const reportBtn = (kind, ref) => `<button type="button" class="rptbtn" data-report="${esc(kind)}" data-ref="${esc(ref || '')}" title="${esc(T('report'))}">⚑ <span>${T('report')}</span></button>`;
function openReport(kind, ref, text) {
  modal(`<h2>⚑ ${T('report_title')}</h2><p class="small muted">${T('report_help')}</p>
    <div class="seg wrap" id="rpR">${['wrong', 'harmful', 'inappropriate', 'other'].map((k, i) => `<button type="button" data-k="${k}" class="${i ? '' : 'on'}">${T('rr_' + k)}</button>`).join('')}</div>
    <div class="field" style="margin-top:12px"><textarea class="in" id="rpN" rows="3" maxlength="500" placeholder="${esc(T('report_note'))}"></textarea></div>
    <p class="err" id="rpE"></p><div class="row"><button class="btn pri" id="rpS">${T('report_send')}</button><button class="btn ghost" id="rpC">${T('cancel')}</button></div>`, (m, close) => {
    let reason = 'wrong'; $$('#rpR button', m).forEach(b => b.onclick = () => { reason = b.dataset.k; $$('#rpR button', m).forEach(x => x.classList.toggle('on', x === b)); });
    $('#rpC', m).onclick = close;
    $('#rpS', m).onclick = async () => { try { await api('POST', '/api/report', { kind, ref, reason, note: $('#rpN', m).value, text: String(text || '').slice(0, 2000) }); close(); toast('✓ ' + T('report_thanks')); } catch (e) { $('#rpE', m).textContent = e.message; } };
  });
}
document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-report]'); if (!b) return; e.preventDefault();
  const holder = b.closest('.bb, .lessonbody, .card, .bm'); const md = holder && holder.querySelector('.md'); openReport(b.dataset.report, b.dataset.ref, (md || holder || {}).innerText || ''); });
