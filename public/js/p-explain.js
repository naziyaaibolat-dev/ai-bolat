'use strict';
/* ===== AI-bolat v3.2 — түсіндірудің жаңа формалары =====
   конспект · слайдтар (проектор режимі) · анимациялық түсіндіру · қадамдап шешу · салыстыру кестесі
   · ой картасы · уақыт сызығы / курс картасы · глоссарий карточкалары · дауыстап түсіндіру (speechSynthesis) · мұғалім редакторы */
Object.assign(I18N, {
  tab_explain: ['✨ Түсіндіру', '✨ Объяснение', '✨ Explain'],
  xf_conspect: ['Конспект', 'Конспект', 'Notes'], xf_slides: ['Слайдтар', 'Слайды', 'Slides'], xf_anim: ['Анимация', 'Анимация', 'Animated'],
  xf_guided: ['Қадамдап шеш', 'Реши по шагам', 'Step by step'], xf_compare: ['Салыстыру', 'Сравнение', 'Compare'], xf_mindmap: ['Ой картасы', 'Карта понятий', 'Mind map'],
  xf_timeline: ['Уақыт сызығы', 'Лента времени', 'Timeline'], xf_glossary: ['Глоссарий', 'Глоссарий', 'Glossary'], xf_narrate: ['Дауыстап түсіндіру', 'Озвученный разбор', 'Narrated'],
  xf_present: ['Презентация', 'Презентация', 'Present'], xf_edit: ['Өңдеу', 'Редактировать', 'Edit'], xf_print: ['Басып шығару', 'Печать', 'Print'],
  x_objectives: ['Оқу мақсаттары', 'Цели обучения', 'Learning objectives'], x_defs: ['Анықтамалар', 'Определения', 'Definitions'], x_rules: ['Ережелер мен формулалар', 'Правила и формулы', 'Rules & formulas'],
  x_examples: ['Шешілген мысалдар', 'Разобранные примеры', 'Worked examples'], x_mistakes: ['Жиі кездесетін қателер', 'Типичные ошибки', 'Common mistakes'], x_summary: ['Қорытынды', 'Итог', 'Summary'],
  x_check: ['Өзіңді тексер', 'Проверь себя', 'Check yourself'], x_life: ['Өмірмен байланыс', 'Связь с жизнью', 'Real-life link'], x_diagram: ['Сызба', 'Схема', 'Diagram'],
  x_wrong: ['Қате', 'Неверно', 'Wrong'], x_right: ['Дұрыс', 'Верно', 'Right'], x_why: ['Неге?', 'Почему?', 'Why?'], x_show: ['Жауабын көру', 'Показать ответ', 'Show answer'],
  x_step: ['Қадам', 'Шаг', 'Step'], x_hint: ['Кеңес', 'Подсказка', 'Hint'], x_checkbtn: ['Тексеру', 'Проверить', 'Check'], x_reveal: ['Көрсету', 'Показать', 'Reveal'], x_gotit: ['Түсіндім ✓', 'Понятно ✓', 'Got it ✓'],
  x_correct: ['Дұрыс! 🎉', 'Верно! 🎉', 'Correct! 🎉'], x_tryagain: ['Қайта ойлан 🙂', 'Подумай ещё 🙂', 'Think again 🙂'], x_solved: ['Есеп шешілді!', 'Задача решена!', 'Problem solved!'], x_answer: ['Жауабы', 'Ответ', 'Answer'],
  x_play: ['Ойнату', 'Воспроизвести', 'Play'], x_pause: ['Кідірту', 'Пауза', 'Pause'], x_restart: ['Басынан', 'Сначала', 'Restart'], x_speed: ['Жылдамдық', 'Скорость', 'Speed'],
  x_voice: ['Дауыс', 'Голос', 'Voice'], x_novoice: ['Бұл браузерде дауыстап оқу жоқ — субтитрмен көрсетіледі.', 'В этом браузере нет озвучки — показываем с субтитрами.', 'No speech synthesis in this browser — showing captions.'],
  x_kkvoice: ['Қазақ дауысы табылмады — жақын дауыспен оқылады (Windows: Параметрлер → Уақыт және тіл → Сөйлеу → қазақ тілін қосыңыз).', 'Казахский голос не найден — читаем близким голосом.', 'No Kazakh voice found — using the closest voice.'],
  x_course: ['Курс картасы', 'Карта курса', 'Course map'], x_course_sub: ['Тоқсандар мен бөлімдер — сен осы жердесің ▶', 'Четверти и разделы — ты здесь ▶', 'Terms and sections — you are here ▶'],
  x_flip: ['Аудару үшін бас', 'Нажми, чтобы перевернуть', 'Tap to flip'], x_know: ['Білемін', 'Знаю', 'I know'], x_dontknow: ['Қайталау керек', 'Повторить', 'Review'], x_shuffle: ['Араластыру', 'Перемешать', 'Shuffle'],
  x_notes: ['Мұғалім жазбасы', 'Заметки учителя', 'Speaker notes'], x_keys: ['← → бет · F толық экран · S дауыс · N жазба · Esc шығу', '← → листать · F полный экран · S голос · N заметки · Esc выход', '← → navigate · F fullscreen · S speak · N notes · Esc exit'],
  x_seednote: ['Қысқа түсіндірме AI көмегімен алдын ала дайындалған — мұғалім тексеруі ұсынылады.', 'Краткое объяснение заранее подготовлено с помощью AI — рекомендуется проверка учителем.', 'The short explanation was pre-generated with AI — teacher review recommended.'],
  x_teacher_ed: ['Мұғалім өңдеген', 'Отредактировано учителем', 'Edited by teacher'], x_saved: ['Сабақ сақталды ✅', 'Урок сохранён ✅', 'Lesson saved ✅'],
  ed_title: ['Сабақты өңдеу', 'Редактирование урока', 'Edit lesson'], ed_h: ['Тақырыпша', 'Подзаголовок', 'Heading'], ed_add: ['+ Бөлім қосу', '+ Добавить раздел', '+ Add section'],
  ed_pipe: ['Әр жол — бір элемент; бөліктер « | » арқылы', 'Каждая строка — элемент; части через « | »', 'One item per line; parts separated by " | "'], ed_json: ['Кеңейтілген (JSON)', 'Расширенный (JSON)', 'Advanced (JSON)'],
  ed_save: ['Сақтау', 'Сохранить', 'Save'], ed_badjson: ['JSON қатесі', 'Ошибка JSON', 'JSON error'], ed_hook: ['Кіріспе', 'Вступление', 'Hook'], ed_theory: ['Теория бөлімдері', 'Разделы теории', 'Theory sections'],
  sec_topics: ['{n} сабақ', '{n} уроков', '{n} lessons'], search_all: ['Барлық нәтиже →', 'Все результаты →', 'All results →'], search_title: ['Тақырып іздеу', 'Поиск тем', 'Topic search'],
  search_ph: ['Тақырып, бөлім немесе ұғым...', 'Тема, раздел или понятие...', 'Topic, section or concept...'], all_subjects: ['Барлық пән', 'Все предметы', 'All subjects'], all_grades: ['Барлық сынып', 'Все классы', 'All grades'],
  found_n: ['{n} тақырып табылды', 'Найдено тем: {n}', '{n} topics found'], cat_counts: ['Каталог: пән/сынып бойынша тақырыптар саны', 'Каталог: число тем по предметам и классам', 'Catalogue: topics per subject and grade'],
  cat_src: ['Дереккөз: ҚР Оқу-ағарту министрінің 16.09.2022 №399 бұйрығы (үлгілік оқу бағдарламалары, 2025 өзгерістерімен)', 'Источник: приказ Министра просвещения РК №399 от 16.09.2022 (типовые учебные программы, с изменениями 2025 г.)', 'Source: Order of the Minister of Enlightenment of Kazakhstan №399 of 16.09.2022 (typical curricula, as amended in 2025)'],
  extra_list: ['Қосымша курс (үлгілік оқу жоспарында жоқ)', 'Доп. курс (нет в типовом учебном плане)', 'Extra course (not in the typical study plan)'], filter_topics: ['Осы пәннен іздеу...', 'Поиск в предмете...', 'Filter topics...'],
  expand_all: ['Барлығын ашу', 'Раскрыть все', 'Expand all'], collapse_all: ['Жабу', 'Свернуть', 'Collapse'], total: ['Барлығы', 'Всего', 'Total']
});
const XF = [['conspect', '📄'], ['slides', '🖥️'], ['anim', '🎞️'], ['guided', '🧭'], ['compare', '⚖️'], ['mindmap', '🧠'], ['timeline', '🕰️'], ['glossary', '🃏'], ['narrate', '🔊']];
const mdi = (s) => mdToHtml(s).replace(/^<p>|<\/p>$/g, '');
const plain = (s) => String(s || '').replace(/\$\$?([^$]+)\$\$?/g, '$1').replace(/\\[a-z]+\{([^}]*)\}/gi, '$1').replace(/[*_`#>|]/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
const mdLines = (md) => String(md || '').split(/\n+/).map(x => x.replace(/^\s*([-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean);
const wrapTxt = (s, n) => { const w = String(s || '').split(/\s+/); const out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n && cur) { out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); } if (cur) out.push(cur); return out; };
const svgEsc = (s) => esc(plain(s));

/* ---------- мазмұннан слайдтар құру ---------- */
function buildSlides(c, topic) {
  const S = []; const s = topic.subjectInfo || {};
  S.push({ kind: 'title', title: c.title || tTitle(topic), sub: `${s.icon || ''} ${subjName(s)} · ${T('grade')} ${topic.grade}${c.section ? ' · ' + c.section : ''}`, bullets: c.hook ? [c.hook] : [], say: plain(c.title) + '. ' + plain(c.hook) });
  if (c.slides && c.slides.length) { for (const x of c.slides) S.push({ title: x.title, bullets: x.bullets || [], say: x.say || x.bullets.map(plain).join('. ') }); }
  else {
    if (c.goals && c.goals.length) S.push({ title: '🎯 ' + T('goals'), bullets: c.goals, say: c.goals.map(plain).join('. ') });
    for (const t of c.theory || []) { const b = mdLines(t.md).slice(0, 6); S.push({ title: t.h, bullets: b, say: plain(t.md) }); }
    if (c.defs && c.defs.length) S.push({ title: '📘 ' + T('x_defs'), bullets: c.defs.slice(0, 5).map(d => `**${d.term}** — ${d.text}`), say: c.defs.slice(0, 5).map(d => plain(d.term) + ' — ' + plain(d.text)).join('. ') });
    if ((c.rules && c.rules.length) || (c.formulas && c.formulas.length)) S.push({ title: '📏 ' + T('x_rules'), bullets: (c.rules || []).slice(0, 4).map(r => (r.title ? `**${r.title}:** ` : '') + r.text), tex: (c.formulas || []).slice(0, 3).map(f => f.tex), say: (c.rules || []).slice(0, 4).map(r => plain(r.title) + ' ' + plain(r.text)).join('. ') });
    for (const e of (c.examples || []).slice(0, 2)) S.push({ title: '🧩 ' + T('x_examples'), lead: e.q, bullets: [...e.steps, e.a ? `✅ **${T('x_answer')}:** ${e.a}` : ''].filter(Boolean), frag: true, say: plain(e.q) + '. ' + e.steps.map(plain).join('. ') + '. ' + T('x_answer') + ': ' + plain(e.a) });
    if (c.diagram) S.push({ title: '📊 ' + (c.diagram.title || T('x_diagram')), diagram: c.diagram, bullets: [], say: plain(c.diagram.title) });
    if (c.mistakes && c.mistakes.length) S.push({ title: '⚠️ ' + T('x_mistakes'), bullets: c.mistakes.map(m => `❌ ${m.wrong} → ✅ ${m.right}${m.why ? ' — ' + m.why : ''}`), say: c.mistakes.map(m => plain(m.wrong) + '. ' + plain(m.right) + '. ' + plain(m.why)).join(' ') });
  }
  if (c.summary && c.summary.length) S.push({ title: '📝 ' + T('x_summary'), bullets: c.summary, say: c.summary.map(plain).join('. ') });
  if (c.check && c.check.length) S.push({ title: '❓ ' + T('x_check'), bullets: c.check.map(q => q.q), answers: c.check.map(q => q.a), frag: true, say: c.check.map(q => plain(q.q)).join(' ') });
  if (c.reallife) S.push({ title: '🌍 ' + T('x_life'), bullets: [c.reallife], say: plain(c.reallife) });
  return S;
}
function slideHtml(sl, k, n, reveal = 999) {
  const bl = (sl.bullets || []).map((b, i) => `<li class="${sl.frag && i >= reveal ? 'frag' : 'frag on'}">${mdi(b)}${sl.answers && sl.answers[i] ? `<details class="sans"><summary>${T('x_show')}</summary>${mdi(sl.answers[i])}</details>` : ''}</li>`).join('');
  return `<div class="slide ${sl.kind === 'title' ? 'stitle' : ''}"><div class="snum">${k + 1}/${n}</div>
    ${sl.kind === 'title' ? `<img class="slogo" src="/img/logo.svg" alt=""><div class="ssub">${esc(sl.sub)}</div>` : ''}
    <h2>${mdi(sl.title)}</h2>${sl.lead ? `<div class="slead md">${mdToHtml(sl.lead)}</div>` : ''}
    ${bl ? `<ul class="sbul">${bl}</ul>` : ''}${sl.tex && sl.tex.length ? `<div class="stex">${sl.tex.map(t => texHtml(t)).join('')}</div>` : ''}
    ${sl.diagram ? `<div class="sdiag">${diagramSvg(sl.diagram)}</div>` : ''}</div>`;
}
/* ---------- TTS ---------- */
const Speech = {
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
  voices() { return this.ok ? speechSynthesis.getVoices() : []; },
  pick(lang) { const v = this.voices(); const want = { kk: ['kk'], ru: ['ru'], en: ['en-GB', 'en-US', 'en'] }[lang] || ['en'];
    for (const w of want) { const x = v.find(z => z.lang && z.lang.toLowerCase().startsWith(w.toLowerCase())); if (x) return { voice: x, exact: true }; }
    if (lang === 'kk') { const r = v.find(z => /^(ru|tr|ky|uz)/i.test(z.lang)); if (r) return { voice: r, exact: false }; }
    return { voice: null, exact: false }; },
  stop() { if (this.ok) speechSynthesis.cancel(); },
  say(text, lang, rate = 1, onend) { if (!this.ok || !text) { if (onend) setTimeout(onend, 50); return false; }
    speechSynthesis.cancel(); const p = this.pick(lang); const parts = String(text).match(/[^.!?…]+[.!?…]*/g) || [text]; let i = 0; let stopped = false;
    const next = () => { if (stopped) return; if (i >= parts.length) { if (onend) onend(); return; } const u = new SpeechSynthesisUtterance(parts[i++].trim()); u.lang = p.voice ? p.voice.lang : ({ kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' }[lang]); if (p.voice) u.voice = p.voice; u.rate = rate; u.onend = next; u.onerror = next; speechSynthesis.speak(u); };
    next(); return { cancel: () => { stopped = true; speechSynthesis.cancel(); } }; }
};
if (Speech.ok) try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) { /* */ }
function voiceNote(lang) { if (!Speech.ok) return T('x_novoice'); const p = Speech.pick(lang); return p.exact ? '' : (lang === 'kk' ? T('x_kkvoice') : ''); }

/* ---------- сызбалар (SVG) ---------- */
function diagramSvg(d) {
  const items = d.items || []; const W = 1000; const col = ['#29C5F6', '#F5B82E', '#7c5cff', '#22d39a', '#ff5fa2', '#ff9f1c', '#1f9eff', '#43d17a'];
  const box = (x, y, w, h, label, on, i) => { const lines = wrapTxt(plain(label), Math.max(8, Math.floor(w / 13))).slice(0, 3); return `<g class="dnode" style="--d:${i * 0.18}s"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${on ? 'url(#dg1)' : 'var(--dfill,#12305a)'}" stroke="${col[i % col.length]}" stroke-width="${on ? 4 : 2}"/>${lines.map((l, k) => `<text x="${x + w / 2}" y="${y + h / 2 + (k - (lines.length - 1) / 2) * 24 + 7}" text-anchor="middle" font-size="20" font-weight="${on ? 800 : 600}" fill="${on ? '#06264A' : '#fff'}">${esc(l)}</text>`).join('')}</g>`; };
  const defs = `<defs><linearGradient id="dg1" x1="0" x2="1"><stop offset="0" stop-color="#FFD66B"/><stop offset="1" stop-color="#F5B82E"/></linearGradient><marker id="dar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#29C5F6"/></marker></defs>`;
  let body = '', H = 300;
  if (d.type === 'flow') { const n = items.length, gap = 40, w = Math.min(230, (W - gap * (n - 1) - 20) / n), h = 120, y = 90, x0 = (W - (n * w + (n - 1) * gap)) / 2; H = 300;
    items.forEach((it, i) => { const x = x0 + i * (w + gap); body += box(x, y, w, h, it.label, it.on, i); if (i < n - 1) body += `<line class="dline" x1="${x + w + 4}" y1="${y + h / 2}" x2="${x + w + gap - 6}" y2="${y + h / 2}" stroke="#29C5F6" stroke-width="4" marker-end="url(#dar)"/>`; }); }
  else if (d.type === 'cycle') { const n = items.length, R = 190, cx = W / 2, cy = 260, w = 200, h = 86; H = 520;
    items.forEach((it, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n; const x = cx + R * 1.35 * Math.cos(a), y = cy + R * Math.sin(a);
      const m = (a + a2) / 2; body += `<path class="dline" d="M${cx + R * 1.35 * Math.cos(a + 0.35)},${cy + R * Math.sin(a + 0.35)} Q${cx + R * 1.6 * Math.cos(m)},${cy + R * 1.25 * Math.sin(m)} ${cx + R * 1.35 * Math.cos(a2 - 0.35)},${cy + R * Math.sin(a2 - 0.35)}" fill="none" stroke="#29C5F6" stroke-width="4" marker-end="url(#dar)"/>`;
      body += box(x - w / 2, y - h / 2, w, h, it.label, it.on, i); }); }
  else if (d.type === 'tree') { const [root, ...kids] = items; const n = kids.length || 1, w = Math.min(210, (W - 40) / n - 20), h = 90; H = 340;
    body += box(W / 2 - 150, 30, 300, 90, root.label, true, 0);
    kids.forEach((it, i) => { const x = 20 + i * ((W - 40) / n) + ((W - 40) / n - w) / 2; body += `<path class="dline" d="M${W / 2},120 C${W / 2},180 ${x + w / 2},170 ${x + w / 2},225" fill="none" stroke="#29C5F6" stroke-width="3" marker-end="url(#dar)"/>` + box(x, 230, w, h, it.label, false, i + 1); }); }
  else if (d.type === 'bars') { const n = items.length, max = Math.max(...items.map(i => Math.abs(i.value)), 1), bw = Math.min(120, (W - 100) / n - 30); H = 380;
    items.forEach((it, i) => { const h = Math.abs(it.value) / max * 240, x = 60 + i * ((W - 100) / n) + ((W - 100) / n - bw) / 2; body += `<g class="dnode" style="--d:${i * 0.15}s"><rect x="${x}" y="${300 - h}" width="${bw}" height="${h}" rx="10" fill="${col[i % col.length]}"/><text x="${x + bw / 2}" y="${290 - h}" text-anchor="middle" font-size="22" font-weight="800" fill="var(--ink,#fff)">${esc(it.value)}</text><text x="${x + bw / 2}" y="332" text-anchor="middle" font-size="18" fill="var(--ink,#fff)">${esc(plain(it.label).slice(0, 18))}</text></g>`; });
    body += `<line x1="40" y1="300" x2="${W - 30}" y2="300" stroke="var(--ink2,#aaa)" stroke-width="2"/>`; }
  else if (d.type === 'pie') { const tot = items.reduce((a, i) => a + Math.max(0, i.value), 0) || 1; let a0 = -Math.PI / 2; const cx = 300, cy = 200, r = 160; H = 400;
    items.forEach((it, i) => { const a1 = a0 + Math.max(0, it.value) / tot * Math.PI * 2; const big = a1 - a0 > Math.PI ? 1 : 0;
      body += `<g class="dnode" style="--d:${i * 0.15}s"><path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} z" fill="${col[i % col.length]}" stroke="#06264A" stroke-width="2"/>
      <rect x="560" y="${60 + i * 44}" width="26" height="26" rx="6" fill="${col[i % col.length]}"/><text x="600" y="${80 + i * 44}" font-size="20" fill="var(--ink,#fff)">${esc(plain(it.label).slice(0, 30))} — ${Math.round(it.value / tot * 100)}%</text></g>`; a0 = a1; }); }
  else if (d.type === 'numberline') { const vs = items.map(i => i.value); const lo = Math.floor(Math.min(0, ...vs)) - 1, hi = Math.ceil(Math.max(...vs)) + 1; const X = (v) => 60 + (v - lo) / (hi - lo) * (W - 120); H = 240;
    body += `<line x1="40" y1="120" x2="${W - 30}" y2="120" stroke="var(--ink2,#aaa)" stroke-width="3" marker-end="url(#dar)"/>`;
    const step = Math.max(1, Math.round((hi - lo) / 12)); for (let v = lo; v <= hi; v += step) body += `<line x1="${X(v)}" y1="110" x2="${X(v)}" y2="130" stroke="var(--ink2,#aaa)" stroke-width="2"/><text x="${X(v)}" y="158" text-anchor="middle" font-size="18" fill="var(--ink2,#aaa)">${v}</text>`;
    items.forEach((it, i) => { body += `<g class="dnode" style="--d:${i * 0.2}s"><circle cx="${X(it.value)}" cy="120" r="11" fill="${col[i % col.length]}"/><text x="${X(it.value)}" y="${i % 2 ? 205 : 85}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink,#fff)">${esc(plain(it.label).slice(0, 20))}</text></g>`; }); }
  else if (d.type === 'venn') { H = 380; const [a, b, c] = items;
    body += `<g class="dnode"><circle cx="400" cy="190" r="160" fill="#29C5F6" fill-opacity=".35" stroke="#29C5F6" stroke-width="3"/><circle cx="600" cy="190" r="160" fill="#F5B82E" fill-opacity=".35" stroke="#F5B82E" stroke-width="3"/></g>`;
    [[a, 310], [b, 500], [c, 690]].forEach(([it, x], i) => { if (it) wrapTxt(plain(it.label), 14).slice(0, 4).forEach((l, k) => { body += `<text x="${x}" y="${170 + k * 26}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink,#fff)">${esc(l)}</text>`; }); }); }
  return `<svg class="diag" viewBox="0 0 ${W} ${H}" role="img" aria-label="${svgEsc(d.title)}">${defs}${body}</svg>`;
}
function mindmapSvg(m) {
  const br = (m.branches || []).slice(0, 6); const L = br.filter((_, i) => i % 2 === 0), R = br.filter((_, i) => i % 2 === 1);
  const rowH = (b) => Math.max(1, b.items.length) * 44 + 30; const hL = L.reduce((a, b) => a + rowH(b), 0), hR = R.reduce((a, b) => a + rowH(b), 0); const H = Math.max(360, hL, hR) + 40; const W = 1200, cx = W / 2, cy = H / 2;
  const col = ['#29C5F6', '#F5B82E', '#7c5cff', '#22d39a', '#ff5fa2', '#ff9f1c'];
  let s = `<svg class="mmap" viewBox="0 0 ${W} ${H}" role="img">`; let idx = 0;
  const side = (arr, dir) => { let y = (H - arr.reduce((a, b) => a + rowH(b), 0)) / 2;
    for (const b of arr) { const c = col[idx % col.length]; const h = rowH(b); const by = y + h / 2; const bx = cx + dir * 250; const i0 = idx++;
      s += `<g class="dnode" style="--d:${i0 * 0.15}s"><path class="dline" d="M${cx + dir * 110},${cy} C${cx + dir * 180},${cy} ${bx - dir * 120},${by} ${bx - dir * 85},${by}" fill="none" stroke="${c}" stroke-width="4"/>
        <rect x="${bx - 85}" y="${by - 24}" width="170" height="48" rx="24" fill="${c}"/><text x="${bx}" y="${by + 7}" text-anchor="middle" font-size="19" font-weight="800" fill="#06264A">${esc(plain(b.label).slice(0, 18))}</text>`;
      b.items.forEach((it, k) => { const iy = y + 30 + k * 44 + 6; const ix = bx + dir * 105; const lines = wrapTxt(plain(it), 26).slice(0, 2);
        s += `<path d="M${bx + dir * 85},${by} C${bx + dir * 95},${by} ${ix - dir * 10},${iy} ${ix},${iy}" fill="none" stroke="${c}" stroke-width="2" opacity=".7"/>`;
        s += lines.map((l, j) => `<text x="${ix + dir * 6}" y="${iy + 6 + (j - (lines.length - 1) / 2) * 20}" text-anchor="${dir > 0 ? 'start' : 'end'}" font-size="17" fill="var(--ink,#fff)">${esc(l)}</text>`).join(''); });
      s += '</g>'; y += h; } };
  side(L, -1); side(R, 1);
  const cl = wrapTxt(plain(m.center), 16).slice(0, 3);
  s += `<g class="dnode"><ellipse cx="${cx}" cy="${cy}" rx="120" ry="${40 + cl.length * 12}" fill="url(#mmg)" stroke="#fff" stroke-width="3"/>${cl.map((l, j) => `<text x="${cx}" y="${cy + 7 + (j - (cl.length - 1) / 2) * 24}" text-anchor="middle" font-size="21" font-weight="900" fill="#06264A">${esc(l)}</text>`).join('')}</g>`;
  return s + `<defs><linearGradient id="mmg" x1="0" x2="1"><stop offset="0" stop-color="#FFD66B"/><stop offset="1" stop-color="#29C5F6"/></linearGradient></defs></svg>`;
}
function autoMindmap(c) {
  if (c.mindmap) return c.mindmap;
  const br = []; if (c.defs && c.defs.length) br.push({ label: T('x_defs'), items: c.defs.slice(0, 3).map(d => d.term) });
  for (const t of (c.theory || []).slice(0, 3)) br.push({ label: plain(t.h).slice(0, 18), items: mdLines(t.md).slice(0, 3).map(x => plain(x).slice(0, 48)) });
  if (c.formulas && c.formulas.length) br.push({ label: T('formulas'), items: c.formulas.slice(0, 3).map(f => f.name) });
  if (c.reallife) br.push({ label: T('x_life'), items: [plain(c.reallife).slice(0, 60)] });
  return { center: c.title, branches: br.filter(b => b.items.length).slice(0, 6) };
}
function autoCompare(c) {
  if (c.compare) return c.compare;
  if (c.formulas && c.formulas.length >= 2) return { title: T('formulas'), cols: [T('x_defs'), 'Формула'], rows: c.formulas.map(f => [f.name, '$' + f.tex + '$']) };
  if (c.rules && c.rules.length >= 2) return { title: T('rules'), cols: ['#', T('rules')], rows: c.rules.map((r, i) => [r.title || String(i + 1), r.text]) };
  if (c.cards && c.cards.length >= 2) return { title: T('x_glossary'), cols: ['', ''], rows: c.cards };
  return null;
}
function glossaryOf(c) { const g = []; for (const d of c.defs || []) g.push([d.term, d.text]); for (const x of c.cards || []) if (!g.some(y => y[0] === x[0])) g.push(x); if (g.length < 3) for (const f of c.formulas || []) g.push([f.name, '$' + f.tex + '$']); return g.slice(0, 16); }

/* ---------- формаларды көрсету ---------- */
function explainForms(el, data, form) {
  const c = data.content; form = form || localStorage.getItem('ab_xf') || 'conspect'; if (!XF.some(x => x[0] === form)) form = 'conspect';
  el.innerHTML = `<div class="xforms"><div class="xftabs" role="tablist">${XF.map(([k, ic]) => `<button class="xft ${k === form ? 'on' : ''}" data-f="${k}" role="tab">${ic} <span>${T('xf_' + k)}</span></button>`).join('')}</div>
    ${c.seedNote || (data.source === 'template' && data.seeded) ? `<div class="banner small xnote">🤖 ${T('x_seednote')}</div>` : ''}${data.source === 'teacher' ? `<div class="banner ok small">✏️ ${T('x_teacher_ed')}${c.editedBy ? ': ' + esc(c.editedBy) : ''}</div>` : ''}
    <div id="xfBody" class="xfbody"></div></div>`;
  $$('.xft', el).forEach(b => b.onclick = () => { Speech.stop(); localStorage.setItem('ab_xf', b.dataset.f); explainForms(el, data, b.dataset.f); });
  const body = $('#xfBody', el); (FORMS[form] || FORMS.conspect)(body, data); renderMath(body);
}
const FORMS = {
  conspect(el, data) { const c = data.content;
    el.innerHTML = `<div class="stack conspect">
      <div class="row between"><h2 style="margin:0">📄 ${esc(c.title)}</h2><button class="btn sm ghost" id="xPrint">🖨️ ${T('xf_print')}</button></div>
      ${c.objectives ? `<div class="card xobj"><h3>🎯 ${esc(c.objectives.title || T('x_objectives'))}</h3><ul>${c.objectives.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      ${c.defs && c.defs.length ? `<div class="card"><h3>📘 ${T('x_defs')}</h3><div class="xdefs">${c.defs.map(d => `<div class="xdef"><b>${mdi(d.term)}</b><div class="md">${mdi(d.text)}</div></div>`).join('')}</div></div>` : ''}
      ${(c.theory || []).map((t, i) => `<div class="card"><h3><span class="qn">${i + 1}</span> ${esc(t.h)}</h3><div class="md">${mdToHtml(t.md)}</div></div>`).join('')}
      ${(c.rules && c.rules.length) || (c.formulas && c.formulas.length) ? `<div class="card"><h3>📏 ${T('x_rules')}</h3><div class="xrules">${(c.rules || []).map(r => `<div class="xrule">${r.title ? `<b>${esc(r.title)}</b>` : ''}<div class="md">${mdi(r.text)}</div></div>`).join('')}${(c.formulas || []).map(f => `<div class="xrule xf"><b>${esc(f.name)}</b>${texHtml(f.tex)}${f.note ? `<div class="small muted">${mdi(f.note)}</div>` : ''}</div>`).join('')}</div></div>` : ''}
      ${c.diagram ? `<div class="card"><h3>📊 ${esc(c.diagram.title || T('x_diagram'))}</h3>${diagramSvg(c.diagram)}</div>` : ''}
      ${(c.examples || []).length ? `<div class="card"><h3>🧩 ${T('x_examples')}</h3>${c.examples.map((x, i) => `<div class="xex"><div class="md"><b>#${i + 1}.</b> ${mdi(x.q)}</div><ol class="ex-steps md">${x.steps.map(s => `<li>${mdi(s)}</li>`).join('')}</ol><div class="row"><button class="btn sm stepBtn">${T('show_step')}</button></div><div class="answer-box" hidden>✅ ${T('x_answer')}: ${mdi(x.a)}</div></div>`).join('')}</div>` : ''}
      ${c.mistakes && c.mistakes.length ? `<div class="card"><h3>⚠️ ${T('x_mistakes')}</h3><div class="xmis">${c.mistakes.map(m => `<div class="xm"><div class="bad">❌ ${mdi(m.wrong)}</div><div class="good">✅ ${mdi(m.right)}</div>${m.why ? `<div class="small muted">💡 ${mdi(m.why)}</div>` : ''}</div>`).join('')}</div></div>` : ''}
      ${c.summary && c.summary.length ? `<div class="card xsum"><h3>📝 ${T('x_summary')}</h3><ul>${c.summary.map(x => `<li>${mdi(x)}</li>`).join('')}</ul></div>` : ''}
      ${c.check && c.check.length ? `<div class="card"><h3>❓ ${T('x_check')}</h3>${c.check.map((q, i) => `<details class="xchk"><summary><b>${i + 1}.</b> ${mdi(q.q)}</summary><div class="md">${mdi(q.a)}</div></details>`).join('')}</div>` : ''}
      ${c.reallife ? `<div class="card xlife"><h3>🌍 ${T('x_life')}</h3><div class="md">${mdi(c.reallife)}</div></div>` : ''}</div>`;
    $('#xPrint', el).onclick = () => window.print();
    $$('.xex', el).forEach(card => { const lis = $$('li', card); let k = 0; const sb = $('.stepBtn', card); sb.onclick = () => { if (k < lis.length) lis[k++].classList.add('show'); if (k >= lis.length) { sb.disabled = true; $('.answer-box', card).hidden = false; } }; });
  },
  slides(el, data) { const S = buildSlides(data.content, data.topic); let k = 0;
    el.innerHTML = `<div class="deck"><div class="deckstage" id="dk"></div><div class="row deckbar"><button class="btn sm" id="dkP">←</button><div class="grow dkdots">${S.map((_, i) => `<i data-k="${i}"></i>`).join('')}</div><button class="btn sm" id="dkN">→</button><button class="btn sm pri" id="dkF">⛶ ${T('xf_present')}</button></div>
      <div class="dkthumbs">${S.map((s, i) => `<button class="dkt" data-k="${i}"><b>${i + 1}</b> ${esc(plain(s.title).slice(0, 40))}</button>`).join('')}</div></div>`;
    const paint = () => { $('#dk', el).innerHTML = slideHtml(S[k], k, S.length); renderMath($('#dk', el)); $$('.dkdots i', el).forEach((d, i) => d.classList.toggle('on', i === k)); $$('.dkt', el).forEach((d, i) => d.classList.toggle('on', i === k)); };
    $('#dkP', el).onclick = () => { if (k > 0) { k--; paint(); } }; $('#dkN', el).onclick = () => { if (k < S.length - 1) { k++; paint(); } };
    $$('.dkt, .dkdots i', el).forEach(b => b.onclick = () => { k = +b.dataset.k; paint(); });
    $('#dkF', el).onclick = () => presentLesson(data, k); paint();
  },
  anim(el, data) { const c = data.content; const frames = [];
    frames.push({ h: c.title, t: c.hook || '', big: true });
    for (const t of c.theory || []) for (const l of mdLines(t.md).slice(0, 5)) frames.push({ h: t.h, t: l });
    for (const f of (c.formulas || []).slice(0, 3)) frames.push({ h: f.name, tex: f.tex });
    const ex = (c.examples || [])[0]; if (ex) { frames.push({ h: '🧩 ' + T('x_examples'), t: ex.q }); ex.steps.forEach((s, i) => frames.push({ h: `${T('x_step')} ${i + 1}`, t: s, lead: ex.q })); if (ex.a) frames.push({ h: '✅ ' + T('x_answer'), t: ex.a, lead: ex.q }); }
    if (c.diagram) frames.push({ h: c.diagram.title || T('x_diagram'), diagram: c.diagram });
    for (const s of (c.summary || []).slice(0, 3)) frames.push({ h: '📝 ' + T('x_summary'), t: s });
    let k = 0, playing = true, timer = null, speed = +(localStorage.getItem('ab_anim_sp') || 1);
    el.innerHTML = `<div class="anim"><div class="astage" id="ast"></div><div class="bar abar"><i id="apr"></i></div>
      <div class="row"><button class="btn sm" id="aPrev">⏮</button><button class="btn sm pri" id="aPlay">⏸ ${T('x_pause')}</button><button class="btn sm" id="aNext">⏭</button><button class="btn sm ghost" id="aRe">↺ ${T('x_restart')}</button><span class="grow"></span>
      <label class="small">${T('x_speed')} <select class="in" id="aSp" style="width:auto">${[0.75, 1, 1.5, 2].map(v => `<option value="${v}" ${v === speed ? 'selected' : ''}>${v}×</option>`).join('')}</select></label></div></div>`;
    const st = $('#ast', el);
    const show = () => { const f = frames[k];
      st.innerHTML = `<div class="aframe ${f.big ? 'big' : ''}" key="${k}"><div class="ah">${mdi(f.h)}</div>${f.lead ? `<div class="alead md">${mdi(f.lead)}</div>` : ''}${f.t ? `<div class="at md">${mdi(f.t)}</div>` : ''}${f.tex ? `<div class="atex">${texHtml(f.tex)}</div>` : ''}${f.diagram ? diagramSvg(f.diagram) : ''}</div>`;
      renderMath(st); $('#apr', el).style.width = ((k + 1) / frames.length * 100) + '%';
      clearTimeout(timer); if (playing) timer = setTimeout(() => { if (!document.body.contains(el)) return; if (k < frames.length - 1) { k++; show(); } else { playing = false; syncBtn(); } }, Math.max(1800, 900 + plain(f.t || f.h).length * 45) / speed); };
    const syncBtn = () => { $('#aPlay', el).innerHTML = playing ? `⏸ ${T('x_pause')}` : `▶ ${T('x_play')}`; };
    $('#aPlay', el).onclick = () => { playing = !playing; if (playing && k >= frames.length - 1) k = 0; syncBtn(); show(); };
    $('#aPrev', el).onclick = () => { k = Math.max(0, k - 1); show(); }; $('#aNext', el).onclick = () => { k = Math.min(frames.length - 1, k + 1); show(); };
    $('#aRe', el).onclick = () => { k = 0; playing = true; syncBtn(); show(); }; $('#aSp', el).onchange = (e) => { speed = +e.target.value; localStorage.setItem('ab_anim_sp', speed); show(); };
    show();
  },
  guided(el, data) { const c = data.content; let g = c.guided;
    if (!g && c.steps && c.steps.length) g = { problem: T('xf_guided'), steps: c.steps.map(s => ({ q: s.q, a: s.a, hint: '' })), answer: c.steps[c.steps.length - 1].a };
    if (!g && c.examples && c.examples.length) { const e = c.examples[0]; g = { problem: e.q, steps: e.steps.map(s => ({ q: s, a: '', hint: '' })), answer: e.a, reveal: true }; }
    if (!g) { el.innerHTML = emptyHtml('🧭', '—'); return; }
    let k = 0; const done = [];
    const norm = (s) => String(s || '').toLowerCase().replace(/\$|\\,|\s+/g, '').replace(',', '.').replace(/[.;:!]+$/, '');
    const short = (a) => a && a.length <= 24 && !g.reveal;
    const paint = () => {
      el.innerHTML = `<div class="guided card"><div class="small muted">🧭 ${T('xf_guided')}</div><div class="gprob md">${mdToHtml(g.problem)}</div>
        <div class="gsteps">${g.steps.map((s, i) => `<div class="gstep ${i < k ? 'ok' : i === k ? 'cur' : 'lock'}"><div class="gnum">${i < k ? '✓' : i + 1}</div><div class="grow"><div class="md">${mdi(s.q)}</div>
          ${i < k ? (s.a ? `<div class="gans">→ <b>${mdi(done[i] || s.a)}</b></div>` : '') : i === k ? (short(s.a) ? `<div class="row"><input class="in gin" id="gin" autocomplete="off" style="max-width:220px"><button class="btn sm pri" id="gchk">${T('x_checkbtn')}</button>${s.hint ? `<button class="btn sm ghost" id="ghint">💡 ${T('x_hint')}</button>` : ''}<button class="btn sm ghost" id="grev">${T('x_reveal')}</button></div><div id="gmsg" class="small"></div>`
            : `<div class="row"><button class="btn sm pri" id="grev">${T('x_reveal')}</button></div>`) : ''}</div></div>`).join('')}</div>
        ${k >= g.steps.length ? `<div class="banner ok">🎉 ${T('x_solved')} ${g.answer ? `<b class="md">${T('x_answer')}: ${mdi(g.answer)}</b>` : ''}</div><button class="btn sm" id="gagain">↺ ${T('x_restart')}</button>` : ''}
        <div class="bar"><i style="width:${k / g.steps.length * 100}%"></i></div></div>`;
      renderMath(el); const s = g.steps[k];
      const adv = (val) => { done[k] = val; k++; paint(); const i = $('#gin', el); if (i) i.focus(); };
      const inp = $('#gin', el); if (inp) { inp.focus(); inp.onkeydown = (e) => { if (e.key === 'Enter') $('#gchk', el).click(); }; }
      const ch = $('#gchk', el); if (ch) ch.onclick = () => { const ok = norm(inp.value) === norm(s.a) || (parseFloat(inp.value.replace(',', '.')) === parseFloat(String(s.a).replace(',', '.')) && /^-?[\d.,]+$/.test(inp.value.trim())); if (ok) { Sound.play && Sound.play('ok'); toast(T('x_correct'), 1200); adv(inp.value); } else { $('#gmsg', el).innerHTML = `<span class="err">${T('x_tryagain')}</span>`; inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); } };
      const hb = $('#ghint', el); if (hb) hb.onclick = () => { $('#gmsg', el).innerHTML = '💡 ' + mdi(s.hint); renderMath(el); };
      const rb = $('#grev', el); if (rb) rb.onclick = () => adv(s.a);
      const ag = $('#gagain', el); if (ag) ag.onclick = () => { k = 0; done.length = 0; paint(); };
    };
    paint();
  },
  compare(el, data) { const cm = autoCompare(data.content);
    if (!cm) { el.innerHTML = emptyHtml('⚖️', '—'); return; }
    el.innerHTML = `<div class="card"><h3>⚖️ ${esc(cm.title || T('xf_compare'))}</h3><div class="tscroll"><table class="ctable"><thead><tr>${cm.cols.map(x => `<th>${mdi(x)}</th>`).join('')}</tr></thead><tbody>${cm.rows.map((r, i) => `<tr style="--d:${i * 0.08}s">${r.map((x, j) => `<${j ? 'td' : 'th'} class="md">${mdi(x)}</${j ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  },
  mindmap(el, data) { const m = autoMindmap(data.content);
    el.innerHTML = m.branches.length ? `<div class="card mmcard"><h3>🧠 ${T('xf_mindmap')}</h3>${mindmapSvg(m)}</div>` : emptyHtml('🧠', '—'); },
  async timeline(el, data) { const c = data.content, topic = data.topic;
    if (c.timeline && c.timeline.length) { const tl = c.timeline.slice().sort((a, b) => a.year - b.year); const fy = (y) => y < 0 ? `${-y} ${LANG === 'kk' ? 'б.з.д.' : LANG === 'ru' ? 'до н.э.' : 'BC'}` : String(y);
      el.innerHTML = `<div class="card"><h3>🕰️ ${T('xf_timeline')}</h3><div class="vtl">${tl.map((e, i) => `<div class="vte" style="--d:${i * 0.12}s"><div class="vty">${fy(e.year)}</div><div class="vtd"></div><div class="vtx md">${mdi(e.event)}</div></div>`).join('')}</div></div>`; return; }
    el.innerHTML = loadingHtml();
    try { const d = await api('GET', `/api/catalog/${topic.subject}/${topic.grade}`); const qs = [...new Set(d.sections.map(s => s.q))];
      el.innerHTML = `<div class="card"><h3>🗺️ ${T('x_course')}</h3><p class="small muted">${T('x_course_sub')}</p><div class="roadmap">${qs.map(q => `<div class="rq"><div class="rqh">${T('quarter', { n: q })}</div>${d.sections.filter(s => s.q === q).map(s => `<a class="rsec ${s.i === topic.s ? 'on' : ''}" href="#/subject/${topic.subject}/${topic.grade}?sec=${s.i}">${s.i === topic.s ? '▶ ' : ''}${esc(s[LANG] || s.kk)} <small>${s.count}</small></a>`).join('')}</div>`).join('')}</div></div>`;
    } catch (e) { el.innerHTML = errBox(e); } },
  glossary(el, data) { let g = glossaryOf(data.content); if (!g.length) { el.innerHTML = emptyHtml('🃏', '—'); return; } let know = 0, rev = 0;
    const paint = () => { el.innerHTML = `<div class="row between"><h3>🃏 ${T('xf_glossary')} <span class="small muted">· ${T('x_flip')}</span></h3><div class="row"><span class="tag ok">✓ ${know}</span><span class="tag">↺ ${rev}</span><button class="btn sm" id="gsh">🔀 ${T('x_shuffle')}</button></div></div>
      <div class="gcards">${g.map((x, i) => `<div class="gcard" tabindex="0" data-i="${i}"><div class="gin2"><div class="gf"><b class="md">${mdi(x[0])}</b></div><div class="gb"><div class="md">${mdi(x[1])}</div><div class="row gbtn"><button class="btn sm ok" data-k="1">${T('x_know')}</button><button class="btn sm ghost" data-k="0">${T('x_dontknow')}</button></div></div></div></div>`).join('')}</div>`;
      renderMath(el); $('#gsh', el).onclick = () => { g = g.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]); paint(); };
      $$('.gcard', el).forEach(cd => { cd.onclick = (e) => { if (e.target.closest('button')) return; cd.classList.toggle('flip'); }; cd.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cd.classList.toggle('flip'); } }; });
      $$('.gbtn button', el).forEach(b => b.onclick = () => { if (b.dataset.k === '1') know++; else rev++; const cd = b.closest('.gcard'); cd.classList.add(b.dataset.k === '1' ? 'known' : 'again'); $$('.tag', el)[0].textContent = '✓ ' + know; $$('.tag', el)[1].textContent = '↺ ' + rev; }); };
    paint(); },
  narrate(el, data) { const S = buildSlides(data.content, data.topic); let k = 0, playing = false, handle = null, timer = null; const lang = data.lang || LANG; const note = voiceNote(lang); let rate = +(localStorage.getItem('ab_tts_rate') || 1);
    el.innerHTML = `<div class="narr"><div class="nscreen"><div class="nstage" id="nst"></div><div class="ncap" id="ncap"></div><button class="nbig" id="nbig">▶</button></div>
      <div class="bar nbar"><i id="npr"></i></div>
      <div class="row"><button class="btn sm" id="nPrev">⏮</button><button class="btn sm pri" id="nPlay">▶ ${T('x_play')}</button><button class="btn sm" id="nNext">⏭</button><span class="small muted" id="ncnt"></span><span class="grow"></span>
        <label class="small">${T('x_speed')} <select class="in" id="nRate" style="width:auto">${[0.8, 1, 1.2, 1.5].map(v => `<option value="${v}" ${v === rate ? 'selected' : ''}>${v}×</option>`).join('')}</select></label><button class="btn sm ghost" id="nFull">⛶</button></div>
      ${note ? `<div class="small muted">🔈 ${esc(note)}</div>` : ''}</div>`;
    const stop = () => { playing = false; clearTimeout(timer); if (handle && handle.cancel) handle.cancel(); Speech.stop(); };
    const paint = () => { $('#nst', el).innerHTML = slideHtml(S[k], k, S.length); renderMath($('#nst', el)); $('#ncap', el).textContent = S[k].say || ''; $('#npr', el).style.width = ((k + 1) / S.length * 100) + '%'; $('#ncnt', el).textContent = `${k + 1}/${S.length}`;
      $('#nPlay', el).innerHTML = playing ? `⏸ ${T('x_pause')}` : `▶ ${T('x_play')}`; $('#nbig', el).style.display = playing ? 'none' : ''; };
    const run = () => { paint(); if (!playing) return; const done = () => { if (!playing || !document.body.contains(el)) return; if (k < S.length - 1) { k++; run(); } else { stop(); paint(); } };
      if (Speech.ok && !note.startsWith(T('x_novoice'))) handle = Speech.say(S[k].say, lang, rate, done); else timer = setTimeout(done, Math.max(2500, plain(S[k].say).length * 60 / rate)); };
    $('#nPlay', el).onclick = $('#nbig', el).onclick = () => { if (playing) { stop(); paint(); } else { playing = true; run(); } };
    $('#nPrev', el).onclick = () => { const p = playing; stop(); k = Math.max(0, k - 1); playing = p; run(); };
    $('#nNext', el).onclick = () => { const p = playing; stop(); k = Math.min(S.length - 1, k + 1); playing = p; run(); };
    $('#nRate', el).onchange = (e) => { rate = +e.target.value; localStorage.setItem('ab_tts_rate', rate); };
    $('#nFull', el).onclick = () => { const s = $('.nscreen', el); (s.requestFullscreen || s.webkitRequestFullscreen || (() => {})).call(s); };
    const obs = new MutationObserver(() => { if (!document.body.contains(el)) { stop(); obs.disconnect(); } }); obs.observe(document.body, { childList: true, subtree: true });
    paint(); }
};
/* ---------- проектор режимі ---------- */
function presentLesson(data, start = 0) {
  const S = buildSlides(data.content, data.topic); let k = start, rev = 0, notes = false, speaking = null; const lang = data.lang || LANG;
  const ov = document.createElement('div'); ov.className = 'present'; ov.tabIndex = -1; document.body.appendChild(ov);
  const maxRev = () => S[k].frag ? (S[k].bullets || []).length : 0;
  const paint = () => { ov.innerHTML = `<div class="pstage">${slideHtml(S[k], k, S.length, rev)}</div>
    ${notes ? `<div class="pnotes"><b>${T('x_notes')}:</b> ${esc(S[k].say || '')}</div>` : ''}
    <div class="pbar"><div class="pprog"><i style="width:${(k + 1) / S.length * 100}%"></i></div><div class="row"><button class="pb" data-a="prev" title="←">←</button><span class="pc">${k + 1} / ${S.length}</span><button class="pb" data-a="next" title="→">→</button>
      <button class="pb" data-a="speak" title="S">${speaking ? '⏹' : '🔊'}</button><button class="pb" data-a="notes" title="N">📝</button><button class="pb" data-a="full" title="F">⛶</button><span class="grow small pk">${T('x_keys')}</span><button class="pb" data-a="close" title="Esc">✕</button></div></div>`;
    renderMath(ov); $$('.pb', ov).forEach(b => b.onclick = (e) => { e.stopPropagation(); act(b.dataset.a); }); };
  const stopSpeak = () => { if (speaking && speaking.cancel) speaking.cancel(); speaking = null; Speech.stop(); };
  const act = (a) => {
    if (a === 'next') { if (rev < maxRev()) rev++; else if (k < S.length - 1) { k++; rev = 0; stopSpeak(); } }
    else if (a === 'prev') { if (k > 0) { k--; rev = maxRev(); stopSpeak(); } }
    else if (a === 'notes') notes = !notes;
    else if (a === 'full') { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else (ov.requestFullscreen || (() => Promise.resolve())).call(ov).catch(() => {}); }
    else if (a === 'speak') { if (speaking) stopSpeak(); else { rev = maxRev(); speaking = Speech.say(S[k].say, lang, 1, () => { speaking = null; paint(); }) || null; if (!speaking) toast(esc(voiceNote(lang) || T('x_novoice'))); } }
    else if (a === 'close') { stopSpeak(); document.removeEventListener('keydown', key, true); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); ov.remove(); return; }
    paint(); };
  const key = (e) => { const m = { ArrowRight: 'next', ArrowDown: 'next', PageDown: 'next', ' ': 'next', Enter: 'next', ArrowLeft: 'prev', ArrowUp: 'prev', PageUp: 'prev', Escape: 'close', f: 'full', F: 'full', s: 'speak', S: 'speak', n: 'notes', N: 'notes', Home: 'home', End: 'end' }[e.key];
    if (!m) return; e.preventDefault(); e.stopPropagation(); if (m === 'home') { k = 0; rev = 0; paint(); } else if (m === 'end') { k = S.length - 1; rev = maxRev(); paint(); } else act(m); };
  document.addEventListener('keydown', key, true);
  ov.addEventListener('click', (e) => { if (e.target.closest('.pbar,.pnotes,details,button,a')) return; act(e.clientX < window.innerWidth / 3 ? 'prev' : 'next'); });
  let tx = null; ov.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true }); ov.addEventListener('touchend', (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) act(dx < 0 ? 'next' : 'prev'); tx = null; });
  paint(); ov.focus();
  if (ov.requestFullscreen) ov.requestFullscreen().catch(() => {});
  return ov;
}
/* ---------- мұғалім редакторы ---------- */
function lessonEditor(data, onSaved) {
  const c = JSON.parse(JSON.stringify(data.content)); const pipe = (arr, f) => (arr || []).map(f).join('\n');
  const html = `<h2>✏️ ${T('ed_title')}</h2><div class="small muted">${esc(tTitle(data.topic))} · ${data.lang.toUpperCase()}</div>
    <div class="stack edform" style="margin-top:10px;max-height:66vh;overflow:auto;padding-right:6px">
      <label class="f">${T('lesson_title') !== 'lesson_title' ? T('lesson_title') : 'Title'}</label><input class="in" id="edTitle" value="${esc(c.title)}">
      <label class="f">${T('ed_hook')}</label><textarea class="in" id="edHook" rows="2">${esc(c.hook || '')}</textarea>
      <label class="f">${T('ed_theory')}</label><div id="edTh" class="stack">${(c.theory || []).map(t => `<div class="edth card"><input class="in edh" placeholder="${T('ed_h')}" value="${esc(t.h)}"><textarea class="in edmd" rows="4">${esc(t.md)}</textarea><button class="btn sm ghost edrm">✕</button></div>`).join('')}</div>
      <button class="btn sm" id="edAdd">${T('ed_add')}</button>
      <div class="small muted">${T('ed_pipe')}</div>
      <label class="f">📘 ${T('x_defs')} <small>(термин | анықтама)</small></label><textarea class="in" id="edDefs" rows="3">${esc(pipe(c.defs, d => d.term + ' | ' + d.text))}</textarea>
      <label class="f">📏 ${T('rules')} <small>(атауы | мәтіні)</small></label><textarea class="in" id="edRules" rows="3">${esc(pipe(c.rules, r => (r.title || '') + ' | ' + r.text))}</textarea>
      <label class="f">🧩 ${T('x_examples')} <small>(есеп | қадам1 ; қадам2 ; ... | жауап)</small></label><textarea class="in" id="edEx" rows="3">${esc(pipe(c.examples, e => e.q + ' | ' + e.steps.join(' ; ') + ' | ' + e.a))}</textarea>
      <label class="f">⚠️ ${T('x_mistakes')} <small>(қате | дұрыс | неге)</small></label><textarea class="in" id="edMis" rows="2">${esc(pipe(c.mistakes, m => m.wrong + ' | ' + m.right + ' | ' + (m.why || '')))}</textarea>
      <label class="f">📝 ${T('x_summary')}</label><textarea class="in" id="edSum" rows="2">${esc((c.summary || []).join('\n'))}</textarea>
      <label class="f">❓ ${T('x_check')} <small>(сұрақ | жауап)</small></label><textarea class="in" id="edChk" rows="3">${esc(pipe(c.check, q => q.q + ' | ' + q.a))}</textarea>
      <label class="f">🌍 ${T('x_life')}</label><textarea class="in" id="edLife" rows="2">${esc(c.reallife || '')}</textarea>
      <details><summary class="small">${T('ed_json')}</summary><textarea class="in mono" id="edJson" rows="10">${esc(JSON.stringify({ compare: c.compare, mindmap: c.mindmap, diagram: c.diagram, guided: c.guided, slides: c.slides, timeline: c.timeline, formulas: c.formulas, cards: c.cards }, null, 1))}</textarea></details>
    </div><div class="row" style="margin-top:12px"><span class="grow err small" id="edErr"></span><button class="btn" id="edCancel">${T('cancel') !== 'cancel' ? T('cancel') : '✕'}</button><button class="btn pri" id="edSave">💾 ${T('ed_save')}</button></div>`;
  modal(html, (m, close) => { m.classList.add('wide');
    const addTh = (h = '', md = '') => { const d = document.createElement('div'); d.className = 'edth card'; d.innerHTML = `<input class="in edh" placeholder="${T('ed_h')}" value="${esc(h)}"><textarea class="in edmd" rows="4">${esc(md)}</textarea><button class="btn sm ghost edrm">✕</button>`; $('#edTh', m).appendChild(d); d.querySelector('.edrm').onclick = () => d.remove(); };
    $$('.edrm', m).forEach(b => b.onclick = () => b.parentElement.remove()); $('#edAdd', m).onclick = () => addTh();
    $('#edCancel', m).onclick = close;
    $('#edSave', m).onclick = async () => {
      const lines = (id) => $(id, m).value.split('\n').map(x => x.trim()).filter(Boolean); const parts = (l) => l.split('|').map(x => x.trim());
      let extra = {}; try { extra = JSON.parse($('#edJson', m).value || '{}') || {}; } catch (e) { $('#edErr', m).textContent = T('ed_badjson') + ': ' + e.message; return; }
      const out = { ...c, ...Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined && v !== null)),
        title: $('#edTitle', m).value.trim() || c.title, hook: $('#edHook', m).value.trim(),
        theory: $$('.edth', m).map(d => ({ h: d.querySelector('.edh').value.trim(), md: d.querySelector('.edmd').value.trim() })).filter(t => t.md),
        defs: lines('#edDefs').map(parts).filter(p => p[0] && p[1]).map(p => ({ term: p[0], text: p.slice(1).join(' | ') })),
        rules: lines('#edRules').map(parts).map(p => p.length > 1 ? { title: p[0], text: p.slice(1).join(' | ') } : { title: '', text: p[0] }).filter(r => r.text),
        examples: lines('#edEx').map(parts).filter(p => p[0]).map(p => ({ q: p[0], steps: (p[1] || '').split(';').map(x => x.trim()).filter(Boolean), a: p[2] || '' })),
        mistakes: lines('#edMis').map(parts).filter(p => p[0] && p[1]).map(p => ({ wrong: p[0], right: p[1], why: p[2] || '' })),
        summary: lines('#edSum'), check: lines('#edChk').map(parts).filter(p => p[0] && p[1]).map(p => ({ q: p[0], a: p.slice(1).join(' | ') })), reallife: $('#edLife', m).value.trim() };
      const b = $('#edSave', m); b.disabled = true;
      try { await api('PUT', `/api/lesson/${encodeURIComponent(data.topic.id)}`, { lang: data.lang, content: out }); toast(T('x_saved')); close(); if (onSaved) onSaved(); }
      catch (e) { $('#edErr', m).textContent = e.message; } finally { b.disabled = false; } };
  });
}
