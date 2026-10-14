'use strict';
/* ===== Кіру / тіркелу / құпиясөзді қалпына келтіру (телефон + SMS) ===== */
function authLayout(inner) {
  const st = State.config ? State.config.stats : { subjects: 20, topics: 1598 };
  return `<div class="auth">
    <section class="pitch">
      <img class="logo-xl" src="/img/logo.svg" alt="AI-bolat">
      <h1><span class="grad-t">AI-bolat</span><br>${esc(T('tagline'))}</h1>
      <p>${esc(T('pitch'))}</p>
      <div class="stats"><div class="stat"><b class="grad-t">${st.subjects}</b><span>${T('f_subjects')}</span></div><div class="stat"><b class="grad-t">${st.topics}</b><span>${T('f_topics')}</span></div><div class="stat"><b class="grad-t">11</b><span>${T('f_grades')}</span></div></div>
      <div class="feat"><span>${T('feat1')}</span><span>${T('feat2')}</span><span>${T('feat3')}</span><span>${T('feat4')}</span><span>${T('feat5')}</span></div>
    </section>
    <section class="card authcard glass">${langSwitch()}${inner}</section></div>`;
}
function smsBlock(purpose, getPhone) {
  // SMS кодын сұрау батырмасы + DEV код + кері санау
  const off = State.config && State.config.sms && State.config.sms.configured === false;
  return { html: (off ? `<div class="warnbox field" role="alert">⚠️ ${esc(T('sms_off_warn'))}</div>` : '') + `<div class="field"><button type="button" class="btn block" id="smsBtn" ${off ? 'disabled' : ''}>📩 ${T('send_code')}</button></div><div id="smsInfo"></div>`,
    bind(root, onSent) {
      const btn = $('#smsBtn', root); let timer = null;
      btn.onclick = async () => {
        const phone = getPhone(); $('#authErr', root).textContent = '';
        btn.disabled = true;
        try { const r = await api('POST', '/api/auth/sms', { phone, purpose });
          $('#smsInfo', root).innerHTML = `<p class="small muted">${T('code_sent', { p: esc(fmtPhone(r.phone)) })}</p>` + (r.dev_code ? `<div class="devcode field">${T('dev_mode')} <b id="devc" title="${T('dev_click')}">${r.dev_code}</b> <span class="small muted">${T('dev_click')}</span></div>` : '');
          const dc = $('#devc', root); if (dc) dc.onclick = () => { const ci = $('#code', root); if (ci) { ci.value = r.dev_code; ci.dispatchEvent(new Event('input')); } };
          let s = r.cooldown || 60; clearInterval(timer); btn.textContent = T('resend_in', { s });
          timer = setInterval(() => { s--; if (s <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = '📩 ' + T('resend'); } else btn.textContent = T('resend_in', { s }); }, 1000);
          onSent && onSent(r);
        } catch (e) { btn.disabled = false; $('#authErr', root).textContent = e.message; }
      };
      return () => clearInterval(timer);
    } };
}
const phoneVal = (root) => ($('#phone', root) || {}).value || '';
route('login', (app) => {
  app.innerHTML = authLayout(`<h2>${T('login')} 👋</h2>
    <form id="f" autocomplete="on"><div class="field"><label class="f">${T('phone')}</label><input class="in" id="phone" type="tel" inputmode="tel" placeholder="+7 7__ ___ __ __" autocomplete="username" required></div>
    <div class="field"><label class="f">${T('password')}</label><input class="in" id="pw" type="password" autocomplete="current-password" required></div>
    <p class="err" id="authErr"></p><button class="btn pri block lg">${T('login')} →</button></form>
    <div class="row between small" style="margin-top:16px"><a href="#/reset">${T('forgot')}</a><span>${T('no_account')} <a href="#/register"><b>${T('register')}</b></a></span></div>
    ${State.config && State.config.demo === false ? '' : `<p class="small muted" style="margin-top:18px">💡 ${esc(T('demo_hint'))}</p>`}
    <p class="small muted" style="margin-top:10px"><a href="/${LANG === 'kk' ? '' : LANG + '/'}">← ${T('about_site')}</a> · <a href="/${LANG}/privacy" target="_blank" rel="noopener">${T('privacy_short')}</a></p>`);
  bindLang(app); phoneMask($('#phone'));
  $('#f').onsubmit = async (e) => { e.preventDefault(); $('#authErr').textContent = '';
    try { const r = await api('POST', '/api/auth/login', { phone: $('#phone').value, password: $('#pw').value }); State.user = r.user; if (r.user.lang && r.user.lang !== LANG && !localStorage.getItem('ab_lang_set')) { /* пайдаланушы таңдаған тіл сақталады */ } location.hash = '#/'; }
    catch (err) { $('#authErr').textContent = err.message; } };
});
route('register', (app, r0) => {
  let role = r0 && r0.query && r0.query.role === 'teacher' ? 'teacher' : 'student';
  const sb = smsBlock('register', () => phoneVal(app));
  app.innerHTML = authLayout(`<h2>${T('register')} ✨</h2>
    <form id="f"><div class="field"><label class="f">${T('phone')}</label><input class="in" id="phone" type="tel" inputmode="tel" placeholder="+7 7__ ___ __ __" required></div>
    ${sb.html}
    <div id="step2" hidden>
      <div class="field"><label class="f">${T('sms_code')}</label><input class="in code-in" id="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••"></div>
      <div class="field"><label class="f">${T('role')}</label><div class="seg" id="roleSeg"><button type="button" data-r="student" class="${role === 'student' ? 'on' : ''}">🎒 ${T('student')}</button><button type="button" data-r="teacher" class="${role === 'teacher' ? 'on' : ''}">🧑‍🏫 ${T('teacher')}</button></div></div>
      <div class="field"><label class="f">${T('name')}</label><input class="in" id="name" autocomplete="name" required></div>
      <div class="field" id="gradeF" ${role === 'teacher' ? 'hidden' : ''}><label class="f">${T('grade')}</label><select class="in" id="grade">${Array.from({ length: 11 }, (_, i) => `<option value="${i + 1}" ${i === 6 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
      <div class="field"><label class="f">${T('password')} <span class="muted">(${T('min6')})</span></label><input class="in" id="pw" type="password" autocomplete="new-password" minlength="6" required></div>
      <label class="chk field small"><input type="checkbox" id="consent" ${State.config && State.config.prod ? 'required' : ''}> <span>${T('consent_html', { p: `/${LANG}/privacy`, t: `/${LANG}/terms` })}</span></label>
      <button class="btn pri block lg">${T('create_account')} 🚀</button>
    </div>
    <p class="err" id="authErr"></p></form>
    <p class="small" style="margin-top:16px">${T('have_account')} <a href="#/login"><b>${T('login')}</b></a></p>`);
  bindLang(app); phoneMask($('#phone'));
  const stop = sb.bind(app, () => { $('#step2').hidden = false; $('#code').focus(); });
  $$('#roleSeg button').forEach(b => b.onclick = () => { role = b.dataset.r; $$('#roleSeg button').forEach(x => x.classList.toggle('on', x === b)); $('#gradeF').hidden = role === 'teacher'; });
  $('#f').onsubmit = async (e) => { e.preventDefault(); if ($('#step2').hidden) { $('#smsBtn').click(); return; } $('#authErr').textContent = '';
    try { const r = await api('POST', '/api/auth/register', { phone: $('#phone').value, code: $('#code').value, name: $('#name').value, password: $('#pw').value, role, grade: +$('#grade').value, lang: LANG, consent: !!($('#consent') && $('#consent').checked) });
      State.user = r.user; stop(); toast(T('welcome')); location.hash = '#/'; }
    catch (err) { $('#authErr').textContent = err.message; } };
});
route('reset', (app) => {
  const sb = smsBlock('reset', () => phoneVal(app));
  app.innerHTML = authLayout(`<h2>${T('reset')} 🔑</h2>
    <form id="f"><div class="field"><label class="f">${T('phone')}</label><input class="in" id="phone" type="tel" inputmode="tel" placeholder="+7 7__ ___ __ __" required></div>
    ${sb.html}
    <div id="step2" hidden>
      <div class="field"><label class="f">${T('sms_code')}</label><input class="in code-in" id="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••"></div>
      <div class="field"><label class="f">${T('new_password')} <span class="muted">(${T('min6')})</span></label><input class="in" id="pw" type="password" autocomplete="new-password" minlength="6" required></div>
      <button class="btn pri block lg">${T('save_password')}</button>
    </div><p class="err" id="authErr"></p></form>
    <p class="small" style="margin-top:16px"><a href="#/login">← ${T('login')}</a></p>`);
  bindLang(app); phoneMask($('#phone'));
  const stop = sb.bind(app, () => { $('#step2').hidden = false; $('#code').focus(); });
  $('#f').onsubmit = async (e) => { e.preventDefault(); if ($('#step2').hidden) { $('#smsBtn').click(); return; } $('#authErr').textContent = '';
    try { const r = await api('POST', '/api/auth/reset', { phone: $('#phone').value, code: $('#code').value, password: $('#pw').value }); State.user = r.user; stop(); toast(T('pw_changed')); location.hash = '#/'; }
    catch (err) { $('#authErr').textContent = err.message; } };
});
