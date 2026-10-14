'use strict';
/* ===== Профиль: аватар, тіл, тақырып, құпиясөзді өзгерту (SMS), жетістіктер ===== */
const AVATARS = ['🦅', '🦊', '🐆', '🐺', '🐎', '🦁', '🐼', '🦉', '🐬', '🚀', '🌟', '🧠', '🧑‍🏫', '👩‍🎓', '👨‍🎓', '🤖'];
route('profile', async (view) => {
  const u = State.user; const [rs, dd] = await Promise.all([api('GET', '/api/results/me').then(x => x.results), api('GET', '/api/dashboard')]); const L = levelInfo(u);
  const achs = [['🎮', 'a_first', rs.length >= 1], ['⭐', 'a_three', rs.some(r => r.stars >= 3)], ['🔥', 'a_streak3', u.best_streak >= 3], ['🏅', 'a_lvl5', u.level >= 5], ['🕹️', 'a_ten', rs.length >= 10], ['💯', 'a_perfect', rs.some(r => r.percent === 100)]];
  view.innerHTML = `<div class="page stack">
    <div class="hero"><div class="row" style="gap:24px;position:relative;z-index:1">${ringHtml(L.pct, `<div><span style="font-size:40px">${esc(u.avatar || '🙂')}</span></div>`)}
      <div class="grow"><h1>${esc(u.name)}</h1><p class="muted">${u.role === 'teacher' ? '🧑‍🏫 ' + T('teacher') : '🎒 ' + T('student') + ' · ' + T('grade') + ' ' + u.grade} · ${esc(fmtPhone(u.phone))}</p>
        <div class="row"><span class="chipxp">${T('level')} ${u.level}</span><span class="chipxp">⭐ ${u.xp} XP</span><span class="chipxp">🔥 ${u.streak} / ${u.best_streak}</span></div></div></div></div>
    <div class="grid g2">
      <div class="card"><h2>👤 ${T('profile')}</h2>
        <div class="field"><label class="f">${T('avatar')}</label><div class="avpick">${AVATARS.map(a => `<button data-a="${a}" class="${a === u.avatar ? 'on' : ''}">${a}</button>`).join('')}</div></div>
        <div class="field"><label class="f">${T('name')}</label><input class="in" id="pn" value="${esc(u.name)}"></div>
        ${u.role === 'student' ? `<div class="field"><label class="f">${T('grade')}</label><select class="in" id="pg">${Array.from({ length: 11 }, (_, i) => `<option value="${i + 1}" ${u.grade === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>` : ''}
        <div class="field"><label class="f">${T('language')}</label>${langSwitch()}</div>
        <div class="field"><label class="f">${T('theme')}</label><div class="seg" id="thm"><button data-t="dark">🌙 ${T('dark')}</button><button data-t="light">☀️ ${T('light')}</button></div></div>
        <div class="row"><button class="btn pri" id="psave">${T('save')}</button><button class="btn ghost danger" id="plogout">🚪 ${T('logout')}</button></div></div>
      <div class="card"><h2>🔐 ${T('change_password')}</h2><form id="pwf">
        <div class="field"><label class="f">${T('old_password')}</label><input class="in" type="password" id="po" autocomplete="current-password" required></div>
        <div class="field"><label class="f">${T('new_password')} <span class="muted">(${T('min6')})</span></label><input class="in" type="password" id="pp" autocomplete="new-password" minlength="6" required></div>
        <p class="small muted">${T('code_to_phone', { p: esc(fmtPhone(u.phone)) })}</p>
        <div class="field"><button type="button" class="btn block" id="smsBtn">📩 ${T('send_code')}</button></div><div id="smsInfo"></div>
        <div class="field"><label class="f">${T('sms_code')}</label><input class="in code-in" id="code" inputmode="numeric" maxlength="6" placeholder="••••••" required></div>
        <p class="err" id="authErr"></p><button class="btn pri">${T('change_password')}</button></form></div>
    </div>
    ${badgesCard(dd, true)}
    ${rs.length ? `<div class="card"><h2>🕹️ ${T('history')}</h2><div class="scrollx"><table class="tbl"><thead><tr><th>${T('topic')}</th><th>%</th><th>${T('mark')}</th><th>★</th><th>XP</th><th>${T('date')}</th></tr></thead><tbody>${rs.map(r => `<tr><td><a href="#/lesson/${r.topic_id}">${esc(tTitle(r.topic))}</a></td><td>${r.percent}%</td><td>${markHtml(r.mark)}</td><td>${starsHtml(r.stars)}</td><td>+${r.xp}</td><td class="small">${fmtDate(r.created_at)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
    <div class="card dangerzone"><h2>🗑️ ${T('del_title')}</h2><p class="small muted">${T('del_text')}</p>
      <form id="delf" class="row wrap"><input class="in" type="password" id="delpw" placeholder="${esc(T('password'))}" autocomplete="current-password" required style="max-width:260px">
      <button class="btn ghost danger" id="delbtn">${T('del_btn')}</button></form><p class="err" id="delErr"></p>
      <p class="small"><a href="/${LANG}/delete-account" target="_blank" rel="noopener">${T('del_more')}</a> · <a href="/${LANG}/privacy" target="_blank" rel="noopener">${T('privacy_short')}</a> · <a href="/${LANG}/terms" target="_blank" rel="noopener">${T('terms_short')}</a></p></div>
  </div>`;
  bindLang(view);
  $('#delf').onsubmit = async (e) => { e.preventDefault(); $('#delErr').textContent = '';
    if (!confirm(T('del_confirm'))) return;
    try { await api('POST', '/api/me/delete', { password: $('#delpw').value }); State.user = null; toast(T('del_done')); location.hash = '#/login'; }
    catch (err) { $('#delErr').textContent = err.message; } };
  let av = u.avatar; $$('.avpick button').forEach(b => b.onclick = () => { av = b.dataset.a; $$('.avpick button').forEach(x => x.classList.toggle('on', x === b)); });
  const th = localStorage.getItem('ab_theme') || 'dark'; $$('#thm button').forEach(b => { b.classList.toggle('on', b.dataset.t === th); b.onclick = () => { localStorage.setItem('ab_theme', b.dataset.t); applyTheme(); $$('#thm button').forEach(x => x.classList.toggle('on', x === b)); const tb = $('#themeBtn'); if (tb) tb.textContent = b.dataset.t === 'light' ? '🌙' : '☀️'; }; });
  $('#psave').onclick = async () => { try { const r = await api('PATCH', '/api/me', { name: $('#pn').value, avatar: av, grade: $('#pg') ? +$('#pg').value : undefined }); State.user = r.user; shellLang = null; toast(T('saved')); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
  $('#plogout').onclick = async () => { await api('POST', '/api/auth/logout'); try { navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage({ type: 'logout' }); } catch (e) { /* */ } State.user = null; location.hash = '#/login'; };
  const sb = smsBlock('change', () => ''); const stop = sb.bind(view, () => $('#code').focus());
  $('#pwf').onsubmit = async (e) => { e.preventDefault(); $('#authErr').textContent = '';
    try { await api('POST', '/api/auth/change-password', { old_password: $('#po').value, password: $('#pp').value, code: $('#code').value }); toast(T('pw_changed')); $('#pwf').reset(); $('#smsInfo').innerHTML = ''; }
    catch (err) { $('#authErr').textContent = err.message; } };
  return stop;
});
