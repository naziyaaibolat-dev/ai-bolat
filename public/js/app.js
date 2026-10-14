'use strict';
/* ===== каркас, маршрутизатор, жоғарғы панель ===== */
function parseHash() { const h = location.hash.replace(/^#\/?/, ''); const [p, q] = h.split('?'); const parts = p.split('/').filter(Boolean).map(decodeURIComponent); return { name: parts[0] || '', args: parts.slice(1), query: Object.fromEntries(new URLSearchParams(q || '')) }; }
const PUBLIC = new Set(['login', 'register', 'reset']);
let shellLang = null, pollTimer = null, pageCleanup = null;
function applyTheme() { const t = localStorage.getItem('ab_theme') || 'dark'; document.documentElement.classList.toggle('light', t === 'light'); }
function langSwitch() { return `<div class="langs">${['kk', 'ru', 'en'].map(l => `<button data-lang="${l}" class="${LANG === l ? 'on' : ''}">${{ kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' }[l]}</button>`).join('')}</div>`; }
function bindLang(root) {
  $$('.langs button', root).forEach(b => b.onclick = async () => {
    const l = b.dataset.lang; if (l === LANG) return; setLang(l); toast(T('lang_switched'));
    if (State.user) { try { const r = await api('PATCH', '/api/me', { lang: l }); State.user = r.user; } catch (e) { /* */ } }
    shellLang = null; render();
  });
}
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  learn: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zm0 0A2 2 0 0 0 6 22h14v-3"/><path d="M8 7h8M8 11h5"/>',
  exam: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2.2 9 2.2 12 0v-5M22 10v6"/>',
  lab: '<path d="M9 3h6M10 3v6L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9V3"/><path d="M7.5 15h9"/>',
  classes: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6 6 0 0 1 3.5 5.8"/>',
  messages: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
  bolat: '<rect x="4" y="7" width="16" height="12" rx="4"/><path d="M12 3v4M9 13h.01M15 13h.01M2 12.5v2.5M22 12.5v2.5"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  admin: '<path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6z"/><path d="m9 12 2 2 4-4"/>'
};
const ico = (k, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ''}</svg>`;
function navItems() {
  const u = State.user;
  return [['', 'home', 'n_home', null, 'learn'], ['learn', 'learn', 'n_learn', null, 'learn'], ['exam', 'exam', 'n_exam', null, 'learn'], ['lab', 'lab', 'n_lab', null, 'learn'],
    ['classes', 'classes', 'n_classes', null, 'social'], ['messages', 'messages', 'n_messages', 'messages', 'social'], ['bolat', 'bolat', 'n_bolat', null, 'social'], ['stats', 'stats', 'n_stats', null, 'me'], ['profile', 'profile', 'n_profile', null, 'me'],
    ...(u && u.is_admin ? [['admin', 'admin', 'n_admin', null, 'me']] : [])];
}
const ROUTE_TITLE = { '': 'n_home', stats: 'n_stats', report: 'n_classes', search: 'search_title', learn: 'n_learn', subject: 'n_learn', lesson: 'n_learn', exam: 'n_exam', lab: 'n_lab', classes: 'n_classes', class: 'n_classes', messages: 'n_messages', bolat: 'n_bolat', profile: 'n_profile', admin: 'n_admin' };
function drawShell() {
  const u = State.user; const L = levelInfo(u); const light = document.documentElement.classList.contains('light');
  const grp = (g) => navItems().filter(x => x[4] === g).map(([r, ic, k, b]) => `<a href="#/${r}" data-r="${r}"><span class="ic">${ico(ic)}</span><span class="nt">${T(k)}</span>${b ? `<span class="badge" data-badge="${b}"></span>` : ''}</a>`).join('');
  document.getElementById('app').innerHTML = `<div class="shell v3">
    <aside class="side"><a class="brand" href="#/"><img src="/img/logo.svg" alt=""><span><b>AI</b>-bolat</span></a>
      <a class="lvcard" href="#/profile"><span class="ava sm">${esc(u.avatar || '🙂')}</span><span class="grow"><b>${esc(u.name)}</b><small>${T('level')} ${u.level} · ${u.xp} XP</small><span class="lvbar"><i style="width:${L.pct}%"></i></span></span></a>
      <nav class="nav"><div class="ngt">${T('ng_learn')}</div>${grp('learn')}<div class="ngt">${T('ng_social')}</div>${grp('social')}<div class="ngt">${T('ng_me')}</div>${grp('me')}</nav>
      <div class="foot"><span class="aipill ${State.config && State.config.ai.enabled ? 'on' : ''}"><i></i>${State.config && State.config.ai.enabled ? T('ai_on') : T('ai_offline')}</span><button class="btn ghost sm" id="installApp" hidden>📲 ${T('install_app')}</button><div class="small">AI-bolat v${State.config ? State.config.version : ''} · <a href="/${LANG}/privacy" target="_blank" rel="noopener">${T('privacy_short')}</a></div></div></aside>
    <div class="main">
      <header class="top">
        <div class="ttl" id="ttl"></div>
        <div class="search"><span class="sico">${ico('search')}</span><input id="gsearch" placeholder="${esc(T('search_ph'))}" autocomplete="off"><div class="sres glass" id="gsres" hidden></div></div>
        <div class="grow"></div>
        ${langSwitch()}
        <button class="iconbtn" id="themeBtn" title="${T('theme')}" aria-label="${T('theme')}">${ico(light ? 'moon' : 'sun')}</button>
        <div class="chipxp" title="${T('to_next', { n: L.left })}"><span class="fl">🔥 ${u.streak}</span><span>⭐ ${u.xp} XP</span><span class="lvl">· ${T('level')} ${u.level}</span></div>
        <a class="ava sm" href="#/profile" title="${esc(u.name)}">${esc(u.avatar || '🙂')}</a>
      </header>
      <main id="view" tabindex="-1"></main>
    </div>
    <nav class="tabbar">${navItems().filter(x => !['profile', 'lab', 'admin', 'stats'].includes(x[0])).map(([r, ic, k, b]) => `<a href="#/${r}" data-r="${r}"><span class="ic">${ico(ic)}</span><span>${r === 'exam' ? T('n_exam_s') : T(k)}</span>${b ? `<span class="badge" data-badge="${b}"></span>` : ''}</a>`).join('')}</nav>
  </div>`;
  bindLang(document); bindInstall();
  $('#themeBtn').onclick = () => { const l = !document.documentElement.classList.contains('light'); localStorage.setItem('ab_theme', l ? 'light' : 'dark'); applyTheme(); $('#themeBtn').innerHTML = ico(l ? 'moon' : 'sun'); };
  const si = $('#gsearch'), sr = $('#gsres'); let st = null;
  si.oninput = () => { clearTimeout(st); st = setTimeout(async () => { const q = si.value.trim(); if (q.length < 2) { sr.hidden = true; return; }
    const r = await api('GET', '/api/search?limit=12&lang=' + LANG + '&q=' + encodeURIComponent(q)); const cat = await getCatalog();
    sr.innerHTML = (r.results.length ? r.results.slice(0, 10).map(t => `<a href="#/lesson/${t.id}">${(cat.subjects[t.subject] || {}).icon || ''} ${esc(tTitle(t))}<br><small>${T('topic_of', { g: t.grade, s: subjName(cat.subjects[t.subject]) })}${t.section ? ' · ' + esc(t.section[LANG] || t.section.kk) : ''}</small></a>`).join('') : `<div class="muted small" style="padding:10px">—</div>`)
      + `<a class="sall" href="#/search?q=${encodeURIComponent(q)}">${T('search_all')}</a>`;
    sr.hidden = false; }, 200); };
  si.onblur = () => setTimeout(() => sr.hidden = true, 200); si.onfocus = () => { if (sr.innerHTML) sr.hidden = false; };
  shellLang = LANG + ':' + u.id + ':' + u.xp + ':' + u.avatar + ':' + u.name;
}
function markNav(name) { $$('.nav a, .tabbar a').forEach(a => a.classList.toggle('on', a.dataset.r === (name === 'subject' || name === 'lesson' ? 'learn' : name === 'class' || name === 'report' ? 'classes' : name))); const t = $('#ttl'); if (t) t.textContent = T(ROUTE_TITLE[name] || 'n_home'); }
async function pollUnread() {
  if (!State.user) return;
  try { const r = await api('GET', '/api/unread'); State.unread = r; const n = r.messages + (r.announcements || 0);
    $$('[data-badge="messages"]').forEach(b => { b.textContent = n || ''; b.dataset.n = n; });
    document.title = (n ? `(${n}) ` : '') + 'AI-bolat'; } catch (e) { /* */ }
}
function refreshUser(u) { if (!u) return; State.user = u; const k = LANG + ':' + u.id + ':' + u.xp + ':' + u.avatar + ':' + u.name; if (shellLang && shellLang !== k && $('.chipxp')) { const L = levelInfo(u); $('.chipxp').innerHTML = `<span class="fl">🔥 ${u.streak}</span><span>⭐ ${u.xp} XP</span><span class="lvl">· ${T('level')} ${u.level}</span>`; $('.chipxp').title = T('to_next', { n: L.left }); const lc = $('.lvcard'); if (lc) { lc.querySelector('small').textContent = `${T('level')} ${u.level} · ${u.xp} XP`; lc.querySelector('.lvbar i').style.width = L.pct + '%'; } shellLang = k; } }
async function render() {
  if (pageCleanup) { try { pageCleanup(); } catch (e) { /* */ } pageCleanup = null; }
  const r = parseHash();
  if (!State.user && !PUBLIC.has(r.name)) { location.hash = '#/login'; return; }
  if (State.user && PUBLIC.has(r.name)) { location.hash = '#/'; return; }
  if (PUBLIC.has(r.name)) { shellLang = null; clearInterval(pollTimer); pollTimer = null; return Routes[r.name](document.getElementById('app'), r); }
  const k = LANG + ':' + State.user.id + ':' + State.user.xp + ':' + State.user.avatar + ':' + State.user.name;
  if (!shellLang || !$('#view') || shellLang.split(':')[0] !== LANG || shellLang.split(':')[1] != State.user.id) drawShell(); else refreshUser(State.user);
  markNav(r.name); window.scrollTo(0, 0);
  const view = $('#view'); view.innerHTML = `<div class="page">${loadingHtml()}</div>`;
  const fn = Routes[r.name] || Routes[''];
  try { const cleanup = await fn(view, r); if (typeof cleanup === 'function') pageCleanup = cleanup; }
  catch (e) { if (e.status === 401) { State.user = null; location.hash = '#/login'; return; } view.innerHTML = `<div class="page">${errBox(e)}</div>`; }
  if (!pollTimer) { pollUnread(); pollTimer = setInterval(pollUnread, 15000); }
}
window.addEventListener('hashchange', render);
/* ---------- PWA: орнату батырмасы + service worker ---------- */
let installEvt = null;
function bindInstall() { const b = document.getElementById('installApp'); if (!b) return; b.hidden = !installEvt;
  b.onclick = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) { /* */ } installEvt = null; b.hidden = true; }; }
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; bindInstall(); });
window.addEventListener('appinstalled', () => { installEvt = null; bindInstall(); });
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {}));
(async function boot() {
  applyTheme();
  try { State.config = await api('GET', '/api/config'); } catch (e) { /* */ }
  try { const r = await api('GET', '/api/me'); State.user = r.user; if (r.user && r.user.lang && !localStorage.getItem('ab_lang')) setLang(r.user.lang); } catch (e) { /* */ }
  render();
})();
