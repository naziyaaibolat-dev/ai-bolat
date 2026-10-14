'use strict';
/* ===== v3: түсіндірмелі сабақ ойындары (14 түрі) — тақырыпқа қарай таңдалады ===== */
const GTX = {
  numline: ['Сан түзуіндегі секіріс', 'Прыжки по числовой прямой', 'Number line jumper'], numline_d: ['Бақа секіреді: қосу мен азайтуды көзбен көр', 'Лягушка прыгает: сложение и вычитание наглядно', 'A frog jumps: see adding & subtracting'],
  fraction: ['Бөлшек құрастырушы', 'Конструктор дробей', 'Fraction builder'], fraction_d: ['Пицца мен жолақты бөліктерге бөліп, бояп шық', 'Дели пиццу и полоску на доли и закрашивай', 'Slice pizzas & bars and shade the parts'],
  balance: ['Теңдеу таразысы', 'Весы уравнений', 'Equation balance'], balance_d: ['Екі жаққа бірдей амал — таразы теңгерілген', 'Одинаковое действие с обеих сторон — весы в равновесии', 'Same move on both sides keeps it balanced'],
  formula: ['Формула құрастыр', 'Собери формулу', 'Formula builder'], formula_d: ['Бөліктерді дұрыс ретпен қой', 'Расставь части в правильном порядке', 'Put the pieces in the right order'],
  angle: ['Бұрыш құрастырушы', 'Конструктор углов', 'Angle builder'], angle_d: ['Сәулені бұрып, бұрышты өлше', 'Поворачивай луч и измеряй угол', 'Rotate the ray and measure angles'],
  coord: ['Координаттық қазына', 'Координатный клад', 'Coordinate treasure hunt'], coord_d: ['Қазынаны (x; y) бойынша тап', 'Найди клад по (x; y)', 'Find the treasure by (x; y)'],
  matchrace: ['Сәйкестендіру жарысы', 'Гонка соответствий', 'Matching race'], matchrace_d: ['Уақыт бітпей тұрып жұптарды тап', 'Найди пары, пока не вышло время', 'Match the pairs before time runs out'],
  millionaire: ['Миллионер', 'Кто хочет стать миллионером', 'Who wants to be a millionaire'], millionaire_d: ['3 көмек: 50:50, сынып, Болатқа қоңырау', '3 подсказки: 50:50, класс, звонок Болату', '3 lifelines: 50:50, class poll, call Bolat'],
  chain: ['Шешім тізбегі', 'Цепочка решения', 'Solution chain'], chain_d: ['Қадамдап шеш — әр буын келесісін ашады', 'Решай по шагам — каждое звено открывает следующее', 'Solve step by step — each link unlocks the next'],
  sort: ['Сұрыптау себеттері', 'Сортировка по корзинам', 'Sorting buckets'], sort_d: ['Әр ұғымды өз тобына сал', 'Разложи понятия по группам', 'Drop each item into its group'],
  timeline: ['Уақыт таспасы', 'Лента времени', 'Timeline'], timeline_d: ['Оқиғаларды хронологиялық ретпен қой', 'Расставь события в хронологическом порядке', 'Put events in chronological order'],
  label: ['Суретті белгіле', 'Подпиши схему', 'Label the diagram'], label_d: ['Бөліктердің атын қойып, қызметін біл', 'Подпиши части и узнай их функции', 'Name the parts and learn what they do'],
  sentence: ['Сөйлем құрастыр', 'Собери предложение', 'Sentence builder'], sentence_d: ['Сөздерді дұрыс ретпен орналастыр', 'Расставь слова в правильном порядке', 'Arrange the words in the right order'],
  flash: ['Флэш-карталар', 'Флэш-карточки', 'Flashcards'], flash_d: ['Аралық қайталау (Лейтнер жүйесі)', 'Интервальное повторение (система Лейтнера)', 'Spaced repetition (Leitner boxes)'],
  round: ['Раунд', 'Раунд', 'Round'], check: ['Тексеру', 'Проверить', 'Check'], next: ['Келесі', 'Далее', 'Next'], exit: ['Шығу', 'Выход', 'Exit'],
  nl_task: ['Бақа {a} санында тұр. {op} есептеп, бақа қайда түсетінін сан түзуінен басып көрсет.', 'Лягушка стоит на {a}. Вычисли {op} и нажми, куда она приземлится.', 'The frog is at {a}. Work out {op} and tap where it lands.'],
  nl_right: ['{a}-дан бастап {n} қадам {dir} секірдік → {t}', 'От {a} прыгаем на {n} шагов {dir} → {t}', 'From {a} we jump {n} steps {dir} → {t}'], right_: ['оңға', 'вправо', 'right'], left_: ['солға', 'влево', 'left'],
  nl_neg: ['Теріс санды азайту — оң санды қосумен бірдей: $a-(-b)=a+b$.', 'Вычесть отрицательное — то же, что прибавить положительное: $a-(-b)=a+b$.', 'Subtracting a negative is adding a positive: $a-(-b)=a+b$.'],
  fr_build: ['{f} бөлшегін құрастыр', 'Построй дробь {f}', 'Build the fraction {f}'], fr_equiv: ['{f} бөлшегіне тең бөлшекті {d} бөлікпен құрастыр', 'Построй дробь, равную {f}, из {d} долей', 'Build a fraction equal to {f} using {d} parts'],
  fr_parts: ['Бөліктер саны (бөлім)', 'Число долей (знаменатель)', 'Number of parts (denominator)'], fr_ok: ['{d} тең бөліктің {n} бөлігі = $\\frac{{n}}{{d}}$', '{n} доли из {d} равных = $\\frac{{n}}{{d}}$', '{n} of {d} equal parts = $\\frac{{n}}{{d}}$'],
  fr_eq: ['Алымы мен бөлімін бірдей санға көбейтсе, бөлшек өзгермейді: $\\frac{{a}}{{b}}=\\frac{{c}}{{d}}$', 'Если умножить числитель и знаменатель на одно число, дробь не изменится: $\\frac{{a}}{{b}}=\\frac{{c}}{{d}}$', 'Multiplying top and bottom by the same number keeps the value: $\\frac{{a}}{{b}}=\\frac{{c}}{{d}}$'],
  bl_task: ['Таразыдағы теңдеуді шеш: $x$-ті жалғыз қалдыр!', 'Реши уравнение на весах: оставь $x$ в одиночестве!', 'Solve the equation on the scale: get $x$ alone!'],
  bl_both: ['Екі жақтан {n} алу', 'Убрать {n} с обеих сторон', 'Remove {n} from both sides'], bl_one: ['Тек сол жақтан 1 алу', 'Убрать 1 только слева', 'Remove 1 from the left only'],
  bl_div: ['Екі жақты {n}-ге бөлу', 'Разделить обе стороны на {n}', 'Divide both sides by {n}'], bl_tilt: ['Таразы ауып кетті! Теңдеуде екі жаққа да бірдей амал жасау керек.', 'Весы перекосились! В уравнении нужно делать одно и то же с обеими сторонами.', 'The scale tipped! In an equation you must do the same to both sides.'],
  bl_ans: ['Енді $x$ неге тең?', 'Чему теперь равен $x$?', 'So what is $x$?'],
  fm_task: ['Формуланы құрастыр: «{n}»', 'Собери формулу: «{n}»', 'Build the formula: “{n}”'], fm_tap: ['Бөлікті бас — ол келесі бос орынға түседі. Қойылған бөлікті басып қайтар.', 'Нажми на часть — она встанет в следующую ячейку. Нажми на поставленную, чтобы вернуть.', 'Tap a piece to place it in the next slot; tap a placed piece to return it.'],
  an_build: ['{n}° бұрыш құрастыр', 'Построй угол {n}°', 'Build a {n}° angle'], an_tri: ['Үшбұрыштың екі бұрышы {a}° және {b}°. Үшінші бұрышты құрастыр.', 'Два угла треугольника {a}° и {b}°. Построй третий угол.', 'Two angles of a triangle are {a}° and {b}°. Build the third one.'],
  an_kind: ['Кез келген {k} бұрыш құрастыр', 'Построй любой {k} угол', 'Build any {k} angle'], an_drag: ['Сары нүктені сүйреп немесе суретті басып, сәулені бұр', 'Тяни жёлтую точку или нажми на рисунок, чтобы повернуть луч', 'Drag the yellow dot (or tap) to rotate the ray'],
  acute: ['сүйір', 'острый', 'acute'], right: ['тік', 'прямой', 'right'], obtuse: ['доғал', 'тупой', 'obtuse'], straight: ['жазыңқы', 'развёрнутый', 'straight'],
  an_is: ['Бұл — {k} бұрыш ({n}°). Сүйір < 90° = тік < доғал < 180° = жазыңқы.', 'Это {k} угол ({n}°). Острый < 90° = прямой < тупой < 180° = развёрнутый.', 'This is a {k} angle ({n}°). Acute < 90° = right < obtuse < 180° = straight.'],
  an_tri_e: ['Үшбұрыш бұрыштарының қосындысы 180°: 180° − {a}° − {b}° = {n}°', 'Сумма углов треугольника 180°: 180° − {a}° − {b}° = {n}°', 'Angles of a triangle add to 180°: 180° − {a}° − {b}° = {n}°'],
  co_find: ['Қазына ({x}; {y}) нүктесінде. Картадан тауып, бас!', 'Клад в точке ({x}; {y}). Найди и нажми!', 'The treasure is at ({x}; {y}). Find it and tap!'], co_read: ['Жалауша қай нүктеде тұр?', 'В какой точке стоит флажок?', 'Where is the flag?'],
  co_refl: ['$P({x}; {y})$ нүктесіне {ax} осіне қатысты симметриялы нүктені бас', 'Нажми точку, симметричную $P({x}; {y})$ относительно оси {ax}', 'Tap the reflection of $P({x}; {y})$ in the {ax} axis'],
  co_exp: ['Бас нүктеден $x$ бойынша {x} қадам, содан кейін $y$ бойынша {y} қадам.', 'От начала координат {x} шагов по $x$, затем {y} шагов по $y$.', 'From the origin: {x} steps along $x$, then {y} steps along $y$.'], co_rexp: ['{ax} осіне қатысты симметрияда {c} координатаның таңбасы ауысады.', 'При симметрии относительно оси {ax} меняется знак координаты {c}.', 'Reflecting in the {ax} axis flips the sign of {c}.'],
  mr_hint: ['Сол жақтан ұғымды, оң жақтан оның жұбын бас', 'Нажми понятие слева и его пару справа', 'Tap a term on the left, then its match on the right'],
  mi_ladder: ['Ұпай сатысы', 'Лестница очков', 'Prize ladder'], mi_5050: ['50:50', '50:50', '50:50'], mi_aud: ['Сынып', 'Класс', 'Class'], mi_call: ['Болат', 'Болат', 'Bolat'], mi_walk: ['Ұпайды алып кету', 'Забрать очки', 'Walk away'],
  mi_think: ['Болат: «Меніңше, дұрыс жауап — {l}. Сенімділігім {p}%»', 'Болат: «Думаю, правильный ответ — {l}. Уверен на {p}%»', 'Bolat: “I think it’s {l}. I’m {p}% sure”'],
  mi_win: ['Сен {n} ұпай ұттың!', 'Ты выиграл {n} очков!', 'You won {n} points!'], mi_lost: ['Қате! Сақталған ұпай: {n}', 'Ошибка! Несгораемая сумма: {n}', 'Wrong! Safe amount: {n}'],
  ch_task: ['Тізбекті жалғастыр: әр қадамның жауабын жаз', 'Продолжи цепочку: запиши ответ каждого шага', 'Continue the chain: enter each step’s answer'], ch_next: ['Келесі буынды таңда', 'Выбери следующее звено', 'Choose the next link'],
  so_hint: ['Карточканы себетке сүйре немесе басып, себетті таңда', 'Перетащи карточку в корзину или нажми карточку, затем корзину', 'Drag a card into a bucket, or tap a card and then a bucket'], so_true: ['Ақиқат', 'Верно', 'True'], so_false: ['Жалған', 'Неверно', 'False'],
  so_even: ['Жұп', 'Чётные', 'Even'], so_odd: ['Тақ', 'Нечётные', 'Odd'], so_prime: ['Жай сандар', 'Простые', 'Prime'], so_comp: ['Құрама сандар', 'Составные', 'Composite'],
  so_num: ['Сандарды топтарға бөл', 'Раздели числа на группы', 'Sort the numbers'], so_tfq: ['Тұжырымдар: ақиқат па, жалған ба?', 'Утверждения: верно или неверно?', 'Statements: true or false?'],
  tl_hint: ['Ең ерте оқиға — жоғарыда. Сүйре немесе ↑↓ бас', 'Самое раннее событие — сверху. Перетаскивай или жми ↑↓', 'Earliest at the top. Drag or use ↑↓'],
  lb_hint: ['Атауды нөмірге сүйре немесе басып таңда', 'Перетащи название к номеру или выбери нажатием', 'Drag each name to its number, or tap to choose'],
  se_hint: ['Сөздерді басып, сөйлем құра', 'Нажимай на слова, чтобы собрать предложение', 'Tap the words to build the sentence'],
  fc_knew: ['Білдім', 'Знаю', 'I knew it'], fc_not: ['Білмедім', 'Не знаю', 'Didn’t know'], fc_flip: ['Аудару үшін бас', 'Нажми, чтобы перевернуть', 'Tap to flip'], fc_box: ['Қорап', 'Коробка', 'Box'],
  fc_info: ['1-қорап — күнде, 2-қорап — 1 күннен соң, 3-қорап — 3 күннен соң қайталанады', 'Коробка 1 — каждый день, 2 — через день, 3 — через 3 дня', 'Box 1 — daily, box 2 — after 1 day, box 3 — after 3 days'],
  good: ['Керемет!', 'Отлично!', 'Great!'], oops: ['Қате', 'Ошибка', 'Not quite'], answer_is: ['Дұрыс жауап', 'Правильный ответ', 'Correct answer']
};
const GLI = () => ({ kk: 0, ru: 1, en: 2 }[LANG] || 0);
function GT(k, v) { const a = GTX[k]; let s = a ? (a[GLI()] || a[0]) : k; if (v) s = s.replace(/\{(\w+)\}/g, (m, x) => (v[x] !== undefined ? v[x] : m)); return s; }
const tri = (a) => Array.isArray(a) ? (a[GLI()] || a[0]) : a;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickN = (arr, n) => shuf(arr).slice(0, n);
const inl = (x) => mdToHtml(String(x)).replace(/^<p>|<\/p>$/g, '');
const XG_ICON = { numline: '🐸', fraction: '🍕', balance: '⚖️', formula: '🧮', angle: '📐', coord: '🗺️', matchrace: '🏁', millionaire: '💰', chain: '⛓️', sort: '🧺', timeline: '⏳', label: '🏷️', sentence: '🧱', flash: '🗂️' };
window.XG_ICON = XG_ICON;

/* ---------- тақырып → ойындар ---------- */
const MATH_S = ['math', 'alg', 'geom'], LANG_S = ['alippe', 'kaztil', 'adoqu', 'kazadeb', 'rus', 'eng'], HIST_S = ['kzhist', 'worldhist', 'law'];
function topicText(d) { const t = d.topic || {}; return [t.kk, t.ru, t.en, d.content && d.content.title].join(' ').toLowerCase(); }
function gamesForTopic(d) {
  const t = d.topic, s = t.subject, g = t.grade, c = d.content || {}, tx = topicText(d); const out = [];
  const add = (id, ok, rec) => { if (ok) out.push({ id, icon: XG_ICON[id], name: GT(id), desc: GT(id + '_d'), rec: !!rec }); };
  const m = MATH_S.includes(s);
  add('numline', m && g <= 7, /сан|числ|number|бүтін|теріс|отриц|integer|negative|қосу|азайту|сложен|вычит|add|subtract/.test(tx));
  add('fraction', m && g >= 2 && g <= 7, /бөлшек|дроб|fraction|пайыз|процент|percent|үлес|доля/.test(tx));
  add('balance', (m && g >= 3) || s === 'alg', /теңдеу|уравнен|equation|белгісіз|неизвест|unknown/.test(tx));
  add('formula', formulaSet(d).length >= 3, ['phys', 'chem', 'geom'].includes(s) || /формула|formula/.test(tx));
  add('angle', (m && g >= 4) || s === 'geom', /бұрыш|угол|angle|үшбұрыш|треуг|triangle|көпбұрыш|многоуг|polygon/.test(tx));
  add('coord', (m && g >= 5) || s === 'geo', /координат|coordinat|график|graph|функция|function|жазықтық|плоскост/.test(tx));
  add('matchrace', pairsOf(c).length >= 4, false);
  add('millionaire', quizOf(c).length >= 5, false);
  add('chain', true, !!(c.steps && c.steps.length));
  add('sort', true, !!c.sort);
  add('timeline', HIST_S.includes(s) || !!(c.timeline && c.timeline.length >= 3), HIST_S.includes(s) || !!c.timeline);
  add('label', ['bio', 'geo', 'zharat', 'dunie'].includes(s), true);
  add('sentence', LANG_S.includes(s) || !!(c.sentences && c.sentences.length >= 2), LANG_S.includes(s));
  add('flash', cardsOf(c).length >= 3, !!c.cards);
  return out.sort((a, b) => b.rec - a.rec);
}
function startXGame(id, el, data, back) {
  const C = { numline: NumLineGame, fraction: FractionGame, balance: BalanceGame, formula: FormulaGame, angle: AngleGame, coord: CoordGame, matchrace: MatchRaceGame, millionaire: MillionaireGame, chain: ChainGame, sort: SortGame, timeline: TimelineGame, label: LabelGame, sentence: SentenceGame, flash: FlashGame }[id];
  if (C) new C(el, data, back).start();
}
function pairsOf(c) {
  const out = [], seen = new Set(); const add = (a, b) => { a = String(a || '').trim(); b = String(b || '').trim(); if (!a || !b || a.length > 90 || b.length > 90 || seen.has(a) || seen.has(b)) return; seen.add(a); seen.add(b); out.push([a, b]); };
  (c.cards || []).forEach(x => add(x[0], x[1])); (c.formulas || []).forEach(f => add(f.name, '$' + f.tex + '$'));
  (c.exercises || []).forEach(e => { if (e.type === 'match') e.pairs.forEach(p => add(p[0], p[1])); });
  (c.exercises || []).forEach(e => { if (e.type === 'quiz' && e.q.length < 70) add(e.q, e.options[e.answer]); });
  (c.timeline || []).forEach(x => add(x.event, String(x.year)));
  return out.slice(0, 12);
}
function quizOf(c) { return (c.exercises || []).filter(e => e.type === 'quiz' || e.type === 'tf').map(e => e.type === 'quiz' ? e : { type: 'quiz', q: e.q, options: [T('true_'), T('false_')], answer: e.answer ? 0 : 1, explain: e.explain }); }
function cardsOf(c) {
  const out = [], seen = new Set(); const add = (f, b) => { f = String(f || '').trim(); b = String(b || '').trim(); if (!f || !b || seen.has(f)) return; seen.add(f); out.push([f, b]); };
  (c.cards || []).forEach(x => add(x[0], x[1])); (c.formulas || []).forEach(f => add(f.name, '$' + f.tex + '$' + (f.note ? '\n\n' + f.note : '')));
  (c.rules || []).forEach(r => { if (r.title && r.text && r.text.length < 220) add(r.title, r.text); });
  (c.exercises || []).forEach(e => { if (e.type === 'match') e.pairs.forEach(p => add(p[0], p[1])); });
  return out.slice(0, 16);
}

/* ---------- базалық класс ---------- */
class XBase {
  constructor(el, data, onExit) { Object.assign(this, { el, data, onExit }); this.g = data.topic.grade; }
  frame(inner, extraHud = '') {
    this.el.innerHTML = `<div class="game xgame"><div class="ghead"><h2>${XG_ICON[this.mode]} ${GT(this.mode)}</h2><div class="hud">${this.N ? `<span class="pill">${GT('round')} ${Math.min(this.i + 1, this.N)}/${this.N}</span>` : ''}<span class="pill xok">✅ ${Math.round(this.ok * 10) / 10}</span>${extraHud}<button class="btn sm ghost xexit">✕ ${GT('exit')}</button></div></div>
      <div class="card qcard xcard">${inner}<div class="xfb"></div></div></div>`;
    $('.xexit', this.el).onclick = () => { this.stopped = true; clearInterval(this.tm); this.onExit(); }; renderMath(this.el);
  }
  fb(ok, html, onNext, label) {
    const box = $('.xfb', this.el); if (!box) return; if (ok === true) Sound.play('ok'); else if (ok === false) Sound.play('bad');
    box.innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><span class="big">${ok ? '🎉' : '💡'}</span><div class="grow"><b>${ok ? GT('good') : GT('oops')}</b><div class="small md">${html || ''}</div></div>${onNext ? `<button class="btn pri xnext">${label || (this.i + 1 >= this.N ? T('finish') + ' 🏁' : GT('next') + ' →')}</button>` : ''}</div>`;
    renderMath(box); const nb = $('.xnext', box); if (nb) { nb.focus(); nb.onclick = onNext; }
    const xo = $('.xok', this.el); if (xo) xo.textContent = '✅ ' + Math.round(this.ok * 10) / 10;
  }
  nextRound() { this.i++; if (this.i >= this.N) this.end(); else this.round(); }
  end(extra) { if (this.stopped) return; this.stopped = true; clearInterval(this.tm); modeResult(this, this.mode, Math.round(this.ok * 10) / 10, this.N || 1, extra || `⏱ ${Math.round((Date.now() - this.t0) / 1000)}s`); }
  start() { this.t0 = Date.now(); this.i = 0; this.ok = 0; this.stopped = false; this.built = null; this.init && this.init(); if (!this.stopped) this.round(); }
}

/* 1. Сан түзуі */
class NumLineGame extends XBase {
  init() { this.mode = 'numline'; this.N = 6; }
  round() {
    const small = this.g <= 3; const min = small ? 0 : -10, max = small ? 20 : 10; let a, b, t, op, neg = false;
    do { neg = false; a = rnd(min + 2, max - 2); b = rnd(1, small ? 9 : 8) * (Math.random() < .45 ? -1 : 1);
      if (!small && this.g >= 6 && b > 0 && Math.random() < .4) { neg = true; op = `$${a}-(${-b})$`; } else op = b >= 0 ? `$${a}+${b}$` : `$${a}-${-b}$`;
      t = a + b; } while (t < min || t > max);
    const W = 640, X = (v) => 30 + (v - min) / (max - min) * (W - 60);
    this.frame(`<div class="qtext md">${GT('nl_task', { a, op })}</div>
      <svg class="nlsvg" viewBox="0 0 ${W} 150"><line x1="20" y1="100" x2="${W - 20}" y2="100" class="axis"/><g id="arcs"></g>
      ${Array.from({ length: max - min + 1 }, (_, k) => { const v = min + k; return `<g class="tick" data-v="${v}"><rect x="${X(v) - 13}" y="70" width="26" height="60" fill="transparent"/><line x1="${X(v)}" y1="92" x2="${X(v)}" y2="108"/><text x="${X(v)}" y="126">${v}</text></g>`; }).join('')}
      <text id="frog" x="${X(a)}" y="88" class="frog">🐸</text></svg>`);
    const svg = $('.nlsvg', this.el); let done = false;
    $$('.tick', svg).forEach(tk => tk.onclick = () => { if (done) return; done = true; const v = +tk.dataset.v; tk.classList.add(v === t ? 'okv' : 'badv');
      const arcs = $('#arcs', svg), frog = $('#frog', svg); const dir = t >= a ? 1 : -1; let cur = a; const steps = Math.abs(t - a);
      const hop = (k) => { if (this.stopped) return; if (k >= steps) { const ok = v === t; if (ok) this.ok++; $$('.tick', svg).find(x => +x.dataset.v === t).classList.add('okv');
          this.fb(ok, GT('nl_right', { a, n: steps, dir: GT(dir > 0 ? 'right_' : 'left_'), t }) + (neg ? '<br>' + GT('nl_neg') : ''), () => this.nextRound()); return; }
        const x1 = X(cur), x2 = X(cur + dir); arcs.insertAdjacentHTML('beforeend', `<path d="M${x1} 96 Q${(x1 + x2) / 2} 60 ${x2} 96" class="arc"/>`); cur += dir; frog.setAttribute('x', x2); Sound.play('tick'); setTimeout(() => hop(k + 1), 170); };
      hop(0); });
  }
}
/* 2. Бөлшек құрастырушы */
class FractionGame extends XBase {
  init() { this.mode = 'fraction'; this.N = 6; }
  round() {
    const g = this.g; const d = rnd(2, g <= 3 ? 6 : 8), n = rnd(1, d - 1); const equiv = g >= 5 && this.i % 2 === 1; const k = rnd(2, 3); const D = equiv ? d * k : null;
    const shape = this.i % 2 ? 'bar' : 'pizza'; let den = equiv ? D : 2; const filled = new Set();
    const fr = `$\\frac{${n}}{${d}}$`;
    this.frame(`<div class="qtext md">${equiv ? GT('fr_equiv', { f: fr, d: D }) : GT('fr_build', { f: fr })}</div>
      <div class="frwrap"><div id="frsvg"></div><div class="stack" style="min-width:200px">${equiv ? '' : `<div class="small muted">${GT('fr_parts')}</div><div class="row"><button class="btn sm" id="dm">−</button><b id="dv" style="font-size:22px;min-width:30px;text-align:center">${den}</b><button class="btn sm" id="dp">+</button></div>`}
      <div class="frval" id="fv"></div><button class="btn pri" id="fc">${GT('check')}</button></div></div>`);
    const draw = () => { const host = $('#frsvg', this.el); let h = '';
      if (shape === 'pizza') { h = `<svg viewBox="-110 -110 220 220" class="frsv">`; for (let i = 0; i < den; i++) { const a0 = i / den * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / den * 2 * Math.PI - Math.PI / 2;
          const p = den === 1 ? `M -100 0 A 100 100 0 1 1 100 0 A 100 100 0 1 1 -100 0` : `M0 0 L${100 * Math.cos(a0)} ${100 * Math.sin(a0)} A100 100 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${100 * Math.cos(a1)} ${100 * Math.sin(a1)} Z`;
          h += `<path d="${p}" data-i="${i}" class="slice ${filled.has(i) ? 'on' : ''}"/>`; } h += '<circle r="100" class="crust"/></svg>'; }
      else { h = `<svg viewBox="0 0 400 90" class="frsv bar">`; for (let i = 0; i < den; i++) h += `<rect x="${4 + i * 392 / den}" y="10" width="${392 / den}" height="70" data-i="${i}" class="slice ${filled.has(i) ? 'on' : ''}"/>`; h += '</svg>'; }
      host.innerHTML = h; $$('.slice', host).forEach(s => s.onclick = () => { if (this.lock) return; const i = +s.dataset.i; filled.has(i) ? filled.delete(i) : filled.add(i); Sound.play('tick'); draw(); });
      $('#fv', this.el).innerHTML = texHtml(`\\frac{${filled.size}}{${den}}`, true); };
    this.lock = false; draw();
    const dm = $('#dm', this.el), dp = $('#dp', this.el);
    if (dm) { dm.onclick = () => { if (den > 1 && !this.lock) { den--; filled.clear(); $('#dv', this.el).textContent = den; draw(); } }; dp.onclick = () => { if (den < 12 && !this.lock) { den++; filled.clear(); $('#dv', this.el).textContent = den; draw(); } }; }
    $('#fc', this.el).onclick = () => { if (this.lock) return; this.lock = true; const f = filled.size;
      const ok = f * d === n * den && (!equiv || den === D); if (ok) this.ok++;
      let html = GT('fr_ok', { n: f, d: den }); if (ok && den !== d) html += '<br>' + GT('fr_eq', { a: n, b: d, c: f, d: den });
      if (!ok) html = `${GT('answer_is')}: ${equiv ? `$\\frac{${n * k}}{${D}}$` : fr} — ` + GT('fr_ok', { n: equiv ? n * k : n, d: equiv ? D : d }) + (equiv ? '<br>' + GT('fr_eq', { a: n, b: d, c: n * k, d: D }) : '');
      this.fb(ok, html, () => this.nextRound()); };
  }
}
/* 3. Теңдеу таразысы */
class BalanceGame extends XBase {
  init() { this.mode = 'balance'; this.N = 4; }
  round() {
    let a, x, b, c; do { a = this.g <= 5 ? rnd(1, 2) : rnd(1, 3); x = rnd(1, 6); b = rnd(1, 6); c = a * x + b; } while (c > 20);
    this.st = { xs: a, lu: b, ru: c, a0: a, b0: b, c0: c, x, slips: 0 }; this.draw();
  }
  eq() { const s = this.st; return `${s.xs === 1 ? '' : s.xs}x${s.lu ? ' + ' + s.lu : ''} = ${s.ru}`; }
  draw(tilt = 0) {
    const s = this.st; const pan = (xs, u) => `<div class="pan">${'<span class="bx">x</span>'.repeat(xs)}${'<span class="wt">1</span>'.repeat(u)}</div>`;
    const solved = s.xs === 1 && s.lu === 0;
    this.frame(`<div class="qtext md">${GT('bl_task')}</div><div class="bleq">${texHtml(this.eq(), true)}</div>
      <div class="scale"><div class="beam" style="transform:rotate(${tilt}deg)"><div class="bpan l">${pan(s.xs, s.lu)}</div><div class="bpan r">${pan(0, s.ru)}</div></div><div class="fulcrum"></div></div>
      <div class="row wrap" style="justify-content:center;margin-top:12px">${solved ? `<span class="md">${GT('bl_ans')}</span><input class="in" id="bx" style="width:100px" inputmode="numeric"><button class="btn pri" id="bxc">${GT('check')}</button>` :
      `${s.lu ? `<button class="btn pri" data-op="both">${GT('bl_both', { n: s.lu })}</button><button class="btn" data-op="one">${GT('bl_one')}</button>` : ''}${!s.lu && s.xs > 1 ? `<button class="btn pri" data-op="div">${GT('bl_div', { n: s.xs })}</button>` : ''}`}</div>`);
    $$('[data-op]', this.el).forEach(b => b.onclick = () => { const op = b.dataset.op;
      if (op === 'both') { s.ru -= s.lu; s.lu = 0; Sound.play('ok'); this.draw(); }
      else if (op === 'div') { s.ru = s.ru / s.xs; s.xs = 1; Sound.play('ok'); this.draw(); }
      else { s.slips++; s.lu--; this.draw(-12); this.fb(false, GT('bl_tilt')); setTimeout(() => { if (this.stopped) return; s.lu++; this.draw(); }, 1600); } });
    const bx = $('#bx', this.el); if (bx) { bx.focus(); const go = () => { if (bx.disabled || !bx.value.trim()) return; const v = +bx.value.replace(',', '.'); const ok = v === s.x; const sc = ok ? (s.slips ? 0.5 : 1) : 0; this.ok += sc;
      bx.disabled = true; $('#bxc', this.el).disabled = true;
      this.fb(ok, `$${s.a0 === 1 ? '' : s.a0}x + ${s.b0} = ${s.c0}$ → $${s.a0 === 1 ? '' : s.a0}x = ${s.c0 - s.b0}$${s.a0 > 1 ? ` → $x = ${s.c0 - s.b0} : ${s.a0}$` : ''} → $x = ${s.x}$`, () => this.nextRound()); };
      $('#bxc', this.el).onclick = go; bx.onkeydown = (e) => { if (e.key === 'Enter') go(); }; }
  }
}
/* 4. Формула құрастыр */
const FORMULAS = {
  math: [['Тіктөртбұрыш ауданы|Площадь прямоугольника|Rectangle area', ['S', '=', 'a', '\\cdot', 'b']], ['Тіктөртбұрыш периметрі|Периметр прямоугольника|Rectangle perimeter', ['P', '=', '2', '(', 'a', '+', 'b', ')']],
    ['Пифагор теоремасы|Теорема Пифагора|Pythagorean theorem', ['c^2', '=', 'a^2', '+', 'b^2']], ['Шеңбер ұзындығы|Длина окружности|Circumference', ['C', '=', '2', '\\pi', 'r']], ['Дөңгелек ауданы|Площадь круга|Circle area', ['S', '=', '\\pi', 'r^2']],
    ['Қосынды квадраты|Квадрат суммы|Square of a sum', ['(a+b)^2', '=', 'a^2', '+', '2ab', '+', 'b^2']], ['Дискриминант|Дискриминант|Discriminant', ['D', '=', 'b^2', '-', '4ac']], ['Жол формуласы|Формула пути|Distance formula', ['s', '=', 'v', '\\cdot', 't']]],
  phys: [['Жылдамдық|Скорость|Speed', ['v', '=', 's', '/', 't']], ['Ньютонның II заңы|Второй закон Ньютона|Newton’s 2nd law', ['F', '=', 'm', '\\cdot', 'a']], ['Тығыздық|Плотность|Density', ['\\rho', '=', 'm', '/', 'V']],
    ['Ом заңы|Закон Ома|Ohm’s law', ['I', '=', 'U', '/', 'R']], ['Импульс|Импульс|Momentum', ['p', '=', 'm', '\\cdot', 'v']], ['Қуат|Мощность|Power', ['P', '=', 'A', '/', 't']], ['Жылу мөлшері|Количество теплоты|Heat', ['Q', '=', 'c', '\\cdot', 'm', '\\cdot', '\\Delta t']], ['Потенциалдық энергия|Потенциальная энергия|Potential energy', ['E_p', '=', 'm', 'g', 'h']]],
  chem: [['Зат мөлшері|Количество вещества|Amount of substance', ['n', '=', 'm', '/', 'M']], ['Газ көлемі|Объём газа|Gas volume', ['V', '=', 'n', '\\cdot', 'V_m']], ['Бөлшектер саны|Число частиц|Number of particles', ['N', '=', 'n', '\\cdot', 'N_A']],
    ['Массалық үлес|Массовая доля|Mass fraction', ['\\omega', '=', 'm_{в}', '/', 'm_{р}']], ['Тығыздық|Плотность|Density', ['\\rho', '=', 'm', '/', 'V']]]
};
function formulaSet(d) { const s = d.topic.subject; const key = MATH_S.includes(s) ? 'math' : s; return (FORMULAS[key] || []).map(([n, tk]) => ({ name: n.split('|')[GLI()] || n.split('|')[0], tk })); }
class FormulaGame extends XBase {
  init() { this.set = shuf(formulaSet(this.data)); this.mode = 'formula'; this.N = Math.min(5, this.set.length); }
  round() {
    const f = this.set[this.i]; const others = this.set.filter(x => x !== f).flatMap(x => x.tk).filter(t => !f.tk.includes(t)); const extra = pickN([...new Set(others)], 2);
    const pool = shuf([...f.tk.map((t, k) => ({ t, k })), ...extra.map(t => ({ t, k: -1 }))]); const placed = [];
    this.frame(`<div class="qtext md">${GT('fm_task', { n: esc(f.name) })}</div><p class="small muted">${GT('fm_tap')}</p>
      <div class="fslots" id="fs"></div><div class="fpool" id="fp"></div><div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" id="fc">${GT('check')}</button></div>`);
    const paint = () => { $('#fs', this.el).innerHTML = f.tk.map((_, k) => `<button class="fslot ${placed[k] ? 'full' : ''}" data-k="${k}">${placed[k] ? texHtml(placed[k].t, false) : ''}</button>`).join('');
      $('#fp', this.el).innerHTML = pool.map((p, j) => placed.includes(p) ? '' : `<button class="fpiece" data-j="${j}">${texHtml(p.t, false)}</button>`).join('');
      $$('.fpiece', this.el).forEach(b => b.onclick = () => { if (this.lock) return; const k = f.tk.findIndex((_, i) => !placed[i]); if (k < 0) return; placed[k] = pool[+b.dataset.j]; Sound.play('tick'); paint(); });
      $$('.fslot', this.el).forEach(b => b.onclick = () => { if (this.lock) return; const k = +b.dataset.k; if (placed[k]) { placed[k] = null; paint(); } }); };
    this.lock = false; paint();
    $('#fc', this.el).onclick = () => { if (this.lock) return; if (f.tk.some((_, k) => !placed[k])) { toast('🧮 ' + GT('fm_tap')); return; } this.lock = true;
      const ok = f.tk.every((t, k) => placed[k].t === t); if (ok) this.ok++;
      $$('.fslot', this.el).forEach((b, k) => b.classList.add(placed[k].t === f.tk[k] ? 'ok' : 'no'));
      this.fb(ok, `${esc(f.name)}: ${texHtml(f.tk.join(' '), false)}`, () => this.nextRound()); };
  }
}
/* 5. Бұрыш құрастырушы */
class AngleGame extends XBase {
  init() { this.mode = 'angle'; this.N = 6; }
  round() {
    const g = this.g; let task, target = null, kind = null, a, b; const r = this.i % 3;
    if (r === 0 || g <= 5) { target = g <= 6 ? pickN([30, 45, 60, 90, 120, 135, 150, 180], 1)[0] : rnd(2, 35) * 5; task = GT('an_build', { n: target }); }
    else if (r === 1) { kind = pickN(['acute', 'obtuse', 'right'], 1)[0]; task = GT('an_kind', { k: GT(kind) }); }
    else { a = rnd(4, 14) * 5; b = rnd(4, 14) * 5; if (a + b >= 170) { a = 50; b = 60; } target = 180 - a - b; task = GT('an_tri', { a, b }); }
    const show = g <= 6; let ang = 20;
    this.frame(`<div class="qtext md">${task}</div><p class="small muted">${GT('an_drag')}</p>
      <svg class="angsvg" viewBox="0 0 400 250"><g id="prot"></g><line x1="200" y1="210" x2="370" y2="210" class="ray"/><path id="arc" class="aarc"/><line id="mv" x1="200" y1="210" class="ray mvr"/><circle id="hd" r="13" class="handle"/><circle cx="200" cy="210" r="5" class="vtx"/><text id="deg" x="200" y="242" class="degt"></text></svg>
      <div class="row" style="justify-content:center"><button class="btn pri" id="ac">${GT('check')}</button></div>`);
    const svg = $('.angsvg', this.el); const upd = () => { const rad = ang * Math.PI / 180; const x = 200 + 160 * Math.cos(rad), y = 210 - 160 * Math.sin(rad);
      $('#mv', svg).setAttribute('x2', x); $('#mv', svg).setAttribute('y2', y); $('#hd', svg).setAttribute('cx', x); $('#hd', svg).setAttribute('cy', y);
      const ax = 200 + 44 * Math.cos(rad), ay = 210 - 44 * Math.sin(rad); $('#arc', svg).setAttribute('d', `M244 210 A44 44 0 0 0 ${ax} ${ay}`);
      $('#deg', svg).textContent = show || this.lock ? ang + '°' : '?°'; };
    upd();
    const toAng = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); let d = Math.atan2(210 - q.y, q.x - 200) * 180 / Math.PI; if (d < 0) d = d < -90 ? 180 : 0; return Math.max(0, Math.min(180, Math.round(d / 5) * 5)); };
    const hd = $('#hd', svg); hd.addEventListener('pointerdown', (e) => { if (this.lock) return; e.preventDefault(); const mv = (ev) => { ang = toAng(ev); upd(); }; const up = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); });
    svg.addEventListener('click', (e) => { if (this.lock || e.target === hd) return; ang = toAng(e); upd(); });
    this.lock = false; this.setAngle = (v) => { ang = v; upd(); };
    $('#ac', this.el).onclick = () => { if (this.lock) return; this.lock = true; upd();
      const kOf = (v) => v < 90 ? 'acute' : v === 90 ? 'right' : v < 180 ? 'obtuse' : 'straight';
      const ok = kind ? kOf(ang) === kind : Math.abs(ang - target) <= (show ? 0 : 5); if (ok) this.ok++;
      $('#prot', svg).innerHTML = Array.from({ length: 19 }, (_, k) => { const rr = k * 10 * Math.PI / 180; return `<line x1="${200 + 150 * Math.cos(rr)}" y1="${210 - 150 * Math.sin(rr)}" x2="${200 + 170 * Math.cos(rr)}" y2="${210 - 170 * Math.sin(rr)}" class="pt"/>${k % 3 === 0 ? `<text x="${200 + 186 * Math.cos(rr)}" y="${214 - 186 * Math.sin(rr)}" class="ptt">${k * 10}</text>` : ''}`; }).join('');
      if (target != null) { const rr = target * Math.PI / 180; $('#prot', svg).insertAdjacentHTML('beforeend', `<line x1="200" y1="210" x2="${200 + 165 * Math.cos(rr)}" y2="${210 - 165 * Math.sin(rr)}" class="ray goal"/>`); }
      let html = GT('an_is', { k: GT(kOf(ang)), n: ang }); if (a) html = GT('an_tri_e', { a, b, n: target }) + '<br>' + html; else if (target != null && !ok) html = `${GT('answer_is')}: ${target}°. ` + html;
      this.fb(ok, html, () => this.nextRound()); };
  }
}
/* 6. Координаттық қазына */
class CoordGame extends XBase {
  init() { this.mode = 'coord'; this.N = 6; this.q1 = this.g <= 5; }
  round() {
    const q1 = this.q1; const lo = q1 ? 0 : -5, hi = q1 ? 8 : 5; const U = 300 / (hi - lo); const X = (x) => 30 + (x - lo) * U, Y = (y) => 330 - (y - lo) * U;
    const r = q1 ? this.i % 2 : this.i % 3; let x, y; do { x = rnd(lo, hi); y = rnd(lo, hi); } while ((x === 0 && y === 0) || (r === 2 && (x === 0 || y === 0)));
    const ax = Math.random() < .5 ? 'Ox' : 'Oy'; const tx = r === 2 ? (ax === 'Ox' ? x : -x) : x, ty = r === 2 ? (ax === 'Ox' ? -y : y) : y;
    let grid = ''; for (let v = lo; v <= hi; v++) { grid += `<line x1="${X(v)}" y1="${Y(lo)}" x2="${X(v)}" y2="${Y(hi)}" class="gl ${v === 0 ? 'ax' : ''}"/><line x1="${X(lo)}" y1="${Y(v)}" x2="${X(hi)}" y2="${Y(v)}" class="gl ${v === 0 ? 'ax' : ''}"/>`;
      grid += `<text x="${X(v)}" y="${Y(0) + 16}" class="gt">${v}</text>${v ? `<text x="${X(0) - 10}" y="${Y(v) + 4}" class="gt">${v}</text>` : ''}`; }
    let pts = ''; for (let a = lo; a <= hi; a++) for (let b = lo; b <= hi; b++) pts += `<circle cx="${X(a)}" cy="${Y(b)}" r="9" class="gp" data-x="${a}" data-y="${b}"/>`;
    const task = r === 0 ? GT('co_find', { x, y }) : r === 1 ? GT('co_read') : GT('co_refl', { x, y, ax });
    this.frame(`<div class="qtext md">${task}</div><div class="cowrap"><svg class="cosvg" viewBox="0 0 360 360">${grid}<text x="${X(hi) + 8}" y="${Y(0) - 6}" class="gt b">x</text><text x="${X(0) + 8}" y="${Y(hi) + 4}" class="gt b">y</text><g id="ex"></g>
      ${r >= 1 ? `<text x="${X(x)}" y="${Y(y) - 4}" class="flag">${r === 1 ? '🚩' : '📍'}</text>${r === 2 ? `<text x="${X(x) + 10}" y="${Y(y) + 16}" class="gt b">P</text>` : ''}` : ''}${r !== 1 ? pts : ''}</svg>
      ${r === 1 ? `<div class="coopts" id="co"></div>` : ''}</div>`);
    const svg = $('.cosvg', this.el); let done = false;
    const explain = (ok) => { const e = $('#ex', svg); const X0 = X(tx), Y0 = Y(ty); e.innerHTML = `<path d="M${X(0)} ${Y(0)} H${X0} V${Y0}" class="cpath"/><text x="${X0}" y="${Y0 - 6}" class="treas">💎</text>`;
      const html = r === 2 ? GT('co_rexp', { ax, c: ax === 'Ox' ? 'y' : 'x' }) + ` $P'(${tx}; ${ty})$` : GT('co_exp', { x, y }) + ` → $(${x}; ${y})$`;
      if (ok) this.ok++; this.fb(ok, html, () => this.nextRound()); };
    $$('.gp', svg).forEach(c => c.onclick = () => { if (done) return; done = true; const ok = +c.dataset.x === tx && +c.dataset.y === ty; c.classList.add(ok ? 'okp' : 'badp'); explain(ok); });
    if (r === 1) { const cand = [[x, y], [y, x], [-x, y], [x, -y], [x + 1, y], [x, y - 1]]; const opts = shuf(cand.filter((p, k, a) => a.findIndex(q => q[0] === p[0] && q[1] === p[1]) === k).slice(0, 4));
      $('#co', this.el).innerHTML = opts.map(p => `<button class="btn" data-p="${p[0]},${p[1]}">(${p[0]}; ${p[1]})</button>`).join('');
      $$('#co button', this.el).forEach(b => b.onclick = () => { if (done) return; done = true; const [a, c] = b.dataset.p.split(',').map(Number); const ok = a === x && c === y; b.classList.add(ok ? 'pri' : 'danger'); explain(ok); }); }
  }
}
/* 7. Сәйкестендіру жарысы */
class MatchRaceGame extends XBase {
  init() { this.mode = 'matchrace'; this.pairs = shuf(pairsOf(this.data.content)).slice(0, 10); this.N = 0; this.total = this.pairs.length; this.left = 75; }
  round() {
    const queue = this.pairs.slice(); const slots = queue.splice(0, 4); let rightOrder = shuf(slots.map((_, k) => k)); let sel = null; let matched = 0;
    this.frame(`<p class="small muted">${GT('mr_hint')}</p><div class="mrace"><div class="mcol" id="ml"></div><div class="mcol" id="mr"></div></div>`, `<span class="pill gt" id="mt">⏱ ${this.left}s</span>`);
    const paint = () => { $('#ml', this.el).innerHTML = slots.map((p, k) => p ? `<button class="mbtn" data-k="${k}">${inl(p[0])}</button>` : '<span class="mbtn gone"></span>').join('');
      $('#mr', this.el).innerHTML = rightOrder.map(k => slots[k] ? `<button class="mbtn r" data-k="${k}">${inl(slots[k][1])}</button>` : '<span class="mbtn gone"></span>').join(''); renderMath(this.el);
      $$('#ml .mbtn[data-k]', this.el).forEach(b => b.onclick = () => { $$('#ml .mbtn', this.el).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = +b.dataset.k; });
      $$('#mr .mbtn[data-k]', this.el).forEach(b => b.onclick = () => { if (sel == null || this.stopped) return; const k = +b.dataset.k;
        if (k === sel) { matched++; this.ok = matched; Sound.play('ok'); b.classList.add('okm'); $(`#ml .mbtn[data-k="${k}"]`, this.el).classList.add('okm'); sel = null;
          const xo = $('.xok', this.el); if (xo) xo.textContent = '✅ ' + matched;
          setTimeout(() => { if (this.stopped) return; slots[k] = queue.shift() || null; if (slots[k]) rightOrder = shuf(rightOrder); if (matched >= this.total) return this.end(`⏱ ${75 - this.left}s`); paint(); }, 280); }
        else { Sound.play('bad'); b.classList.add('shake'); this.left = Math.max(0, this.left - 3); setTimeout(() => b.classList.remove('shake'), 400); } }); };
    paint();
    this.tm = setInterval(() => { if (!this.el.isConnected || this.stopped) return clearInterval(this.tm); this.left--; const t = $('#mt', this.el); if (t) { t.textContent = '⏱ ' + this.left + 's'; t.classList.toggle('hot', this.left <= 10); } if (this.left <= 0) { clearInterval(this.tm); this.end(); } }, 1000);
  }
  end(extra) { this.N = this.total; super.end(extra); }
}
/* 8. Миллионер */
class MillionaireGame extends XBase {
  init() { this.mode = 'millionaire'; this.qs = quizOf(this.data.content).slice(0, 10); this.N = this.qs.length; this.ladder = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 1000000].slice(-this.N); this.safe = [2, 5]; this.used = {}; }
  round() {
    const q = this.qs[this.i]; const L = 'ABCDE'; const order = shuf(q.options.map((_, k) => k)); const money = (n) => n.toLocaleString('ru-RU');
    this.frame(`<div class="mil"><div class="mq"><div class="mprize">💰 ${money(this.ladder[this.i])}</div><div class="qtext md">${inl(q.q)}</div>
      <div class="mopts">${order.map((k, j) => `<button class="mopt" data-k="${k}"><b>${L[j]}:</b> <span class="md">${inl(q.options[k])}</span></button>`).join('')}</div>
      <div class="row wrap mlife"><button class="btn sm" data-l="5050" ${this.used['5050'] || q.options.length < 3 ? 'disabled' : ''}>✂️ ${GT('mi_5050')}</button><button class="btn sm" data-l="aud" ${this.used.aud ? 'disabled' : ''}>📊 ${GT('mi_aud')}</button><button class="btn sm" data-l="call" ${this.used.call ? 'disabled' : ''}>📞 ${GT('mi_call')}</button><span class="grow"></span><button class="btn sm ghost" id="walk" ${this.i ? '' : 'disabled'}>🚶 ${GT('mi_walk')}</button></div><div id="mlx"></div></div>
      <div class="ladder"><div class="small muted">${GT('mi_ladder')}</div>${this.ladder.map((v, k) => `<div class="lr ${k === this.i ? 'cur' : k < this.i ? 'done' : ''} ${this.safe.includes(k) ? 'safe' : ''}"><span>${k + 1}</span><b>${money(v)}</b></div>`).reverse().join('')}</div></div>`);
    let done = false; const btns = $$('.mopt', this.el);
    $$('[data-l]', this.el).forEach(b => b.onclick = () => { if (done) return; const l = b.dataset.l; this.used[l] = 1; b.disabled = true; const wrong = btns.filter(x => +x.dataset.k !== q.answer && !x.disabled);
      if (l === '5050') shuf(wrong).slice(0, Math.max(0, btns.length - 2)).forEach(x => { x.disabled = true; x.classList.add('gone'); });
      else if (l === 'aud') { const live = btns.filter(x => !x.disabled); const ci = live.findIndex(x => +x.dataset.k === q.answer); let rest = 100 - rnd(45, 75); const vals = live.map((x, k) => { if (k === ci) return 0; const v = Math.round(rest * Math.random()); rest -= v; return v; }); vals[ci] = 100 - vals.reduce((a, c) => a + c, 0);
        $('#mlx', this.el).innerHTML = `<div class="aud">${live.map((x, k) => `<div><i style="height:${vals[k]}%"></i><span>${x.querySelector('b').textContent.replace(':', '')} ${vals[k]}%</span></div>`).join('')}</div>`; }
      else { const live = btns.filter(x => !x.disabled); const right = Math.random() < .85; const tgt = right ? live.find(x => +x.dataset.k === q.answer) : pickN(live.filter(x => +x.dataset.k !== q.answer), 1)[0] || live[0];
        $('#mlx', this.el).innerHTML = `<div class="bubble" style="margin-top:10px"><img src="/img/bolat.svg" alt=""><div class="say">${GT('mi_think', { l: tgt.querySelector('b').textContent.replace(':', ''), p: right ? rnd(70, 90) : rnd(40, 60) })}</div></div>`; } });
    $('#walk', this.el).onclick = () => { if (done) return; done = true; this.won = this.ladder[this.i - 1] || 0; this.end(GT('mi_win', { n: money(this.won) })); };
    btns.forEach(b => b.onclick = () => { if (done || b.disabled) return; done = true; b.classList.add('pick'); const ok = +b.dataset.k === q.answer;
      setTimeout(() => { if (this.stopped) return; btns.forEach(x => { if (+x.dataset.k === q.answer) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
        if (ok) { this.ok++; this.fb(true, q.explain ? inl(q.explain) : '', () => { if (this.i + 1 >= this.N) { this.won = this.ladder[this.N - 1]; this.end(GT('mi_win', { n: money(this.won) })); } else this.nextRound(); }); }
        else { const s = this.safe.filter(k => k < this.i).pop(); this.won = s != null ? this.ladder[s] : 0; this.fb(false, `${GT('answer_is')}: ${inl(q.options[q.answer])}${q.explain ? '<br>' + inl(q.explain) : ''}`, () => this.end(GT('mi_lost', { n: money(this.won) })), T('finish') + ' 🏁'); } }, 700); });
  }
}
/* 9. Шешім тізбегі */
class ChainGame extends XBase {
  init() {
    this.mode = 'chain'; const c = this.data.content; const ord = (c.exercises || []).find(e => e.type === 'order');
    if (c.steps && c.steps.length >= 3) { this.kind = 'steps'; this.links = c.steps.map(s => ({ q: s.q, a: s.a })); }
    else if (ord && !MATH_S.includes(this.data.topic.subject)) { this.kind = 'order'; this.items = ord.items; this.oq = ord.q; }
    else { this.kind = 'math'; const g = this.g; let v = rnd(2, g <= 3 ? 10 : 20); this.startV = v; this.links = [];
      for (let k = 0; k < 5; k++) { const ops = g <= 2 ? ['+', '-'] : ['+', '-', '×', ':']; let op = pickN(ops, 1)[0], n;
        if (op === '-' && v < 3) op = '+';
        if (op === '+') n = rnd(2, g <= 3 ? 9 : 25); else if (op === '-') n = rnd(1, Math.min(v - 1, 20)); else if (op === '×') n = rnd(2, v > 30 ? 2 : 5); else { const ds = [2, 3, 4, 5].filter(d => v % d === 0); if (!ds.length) { op = '+'; n = rnd(2, 9); } else n = pickN(ds, 1)[0]; }
        const nv = op === '+' ? v + n : op === '-' ? v - n : op === '×' ? v * n : v / n; this.links.push({ q: `${op} ${n}`, a: String(nv), prev: v }); v = nv; } }
    this.N = this.kind === 'order' ? this.items.length - 1 : this.links.length;
  }
  round() {
    const done = this.kind === 'order' ? (this.built || []) : this.links.slice(0, this.i).map(l => l.a);
    const chainHtml = () => `<div class="chain">${this.kind === 'math' ? `<span class="link st">${this.startV}</span>` : ''}${done.map((a, k) => `${k || this.kind === 'math' ? '<span class="cl">→</span>' : ''}<span class="link ok">${inl(this.kind === 'math' ? `${this.links[k].q} = ${a}` : a)}</span>`).join('')}<span class="cl">→</span><span class="link cur">?</span></div>`;
    if (this.kind === 'order') {
      if (!this.built) { this.built = [this.items[0]]; }
      const rest = shuf(this.items.filter(x => !this.built.includes(x))); const want = this.items[this.built.length];
      this.frame(`<div class="qtext md">${inl(this.oq || GT('ch_next'))}</div>${chainHtml()}<p class="small muted">${GT('ch_next')}</p><div class="row wrap">${rest.map(x => `<button class="btn chopt" data-v="${esc(x)}">${inl(x)}</button>`).join('')}</div>`);
      let tries = 0; $$('.chopt', this.el).forEach(b => b.onclick = () => { if (b.dataset.v === want) { Sound.play('ok'); this.ok += tries ? .5 : 1; this.built.push(want); if (this.built.length >= this.items.length) { this.i = this.N; this.end(); } else this.nextRound(); } else { tries++; Sound.play('bad'); b.classList.add('danger', 'shake'); b.disabled = true; } });
      return;
    }
    const l = this.links[this.i]; let tries = 0;
    this.frame(`<div class="qtext md">${GT('ch_task')}</div>${chainHtml()}<div class="card inset"><div class="md" style="font-weight:700">${inl(this.kind === 'math' ? `$${l.prev}\\;${l.q.replace('×', '\\times').replace(':', '\\div')}\\;=\\;?$` : l.q)}</div>
      <div class="fillrow" style="margin-top:10px"><input class="in" id="ci" autocomplete="off"><button class="btn pri" id="cc">${GT('check')}</button></div></div>`);
    const ci = $('#ci', this.el); ci.focus();
    const go = () => { if (ci.disabled || !ci.value.trim()) return; const ok = fillOk(ci.value, { answer: l.a, alt: [] });
      if (ok) { this.ok += tries ? .5 : 1; ci.disabled = true; this.fb(true, '', () => this.nextRound()); }
      else { tries++; Sound.play('bad'); ci.classList.add('shake'); setTimeout(() => ci.classList.remove('shake'), 400); if (tries >= 2) { ci.disabled = true; this.fb(false, `${GT('answer_is')}: ${inl(l.a)}`, () => this.nextRound()); } } };
    $('#cc', this.el).onclick = go; ci.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  }
}
/* 10. Сұрыптау себеттері */
class SortGame extends XBase {
  init() {
    this.mode = 'sort'; const c = this.data.content; this.N = 0;
    if (c.sort) { this.q = c.sort.q; this.buckets = c.sort.buckets; this.items = c.sort.items.map(([t, b]) => ({ t, b })); }
    else { const tf = (c.exercises || []).filter(e => e.type === 'tf'); if (tf.length >= 4) { this.q = GT('so_tfq'); this.buckets = [GT('so_true'), GT('so_false')]; this.items = tf.slice(0, 8).map(e => ({ t: e.q, b: e.answer ? 0 : 1, ex: e.explain })); }
      else { const prime = this.g >= 5; const isP = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
        const nums = pickN(Array.from({ length: prime ? 48 : 30 }, (_, k) => k + 2), 8); this.q = GT('so_num'); this.buckets = prime ? [GT('so_prime'), GT('so_comp')] : [GT('so_even'), GT('so_odd')];
        this.items = nums.map(n => ({ t: String(n), b: prime ? (isP(n) ? 0 : 1) : n % 2 })); } }
    this.items = shuf(this.items); this.total = this.items.length;
  }
  round() {
    this.frame(`<div class="qtext md">${inl(this.q || '')}</div><p class="small muted">${GT('so_hint')}</p><div class="spool" id="sp">${this.items.map((it, k) => `<div class="chipd schip" data-k="${k}"><span class="md">${inl(it.t)}</span></div>`).join('')}</div>
      <div class="buckets">${this.buckets.map((b, k) => `<div class="bucket" data-b="${k}"><div class="bh">🧺 ${esc(b)}</div><div class="bin" data-b="${k}"></div></div>`).join('')}</div><div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" id="sc">${GT('check')}</button></div>`);
    let sel = null; const pool = $('#sp', this.el); this.lock = false;
    const put = (chip, bin) => { bin.appendChild(chip); chip.classList.remove('sel'); sel = null; Sound.play('tick'); };
    $$('.schip', this.el).forEach(ch => dragify(ch, { tap: () => { if (this.lock) return; if (ch.parentElement.classList.contains('bin')) { pool.appendChild(ch); return; } $$('.schip', this.el).forEach(x => x.classList.remove('sel')); sel = ch; ch.classList.add('sel'); },
      drop: (x, y) => { if (this.lock) return; $$('.bucket', this.el).forEach(d => d.classList.remove('over')); const t = document.elementFromPoint(x, y); const b = t && t.closest('.bucket'); if (b) put(ch, $('.bin', b)); else if (t && t.closest('.spool')) pool.appendChild(ch); },
      over: (x, y) => { $$('.bucket', this.el).forEach(d => d.classList.remove('over')); const t = document.elementFromPoint(x, y); const d = t && t.closest('.bucket'); if (d) d.classList.add('over'); } }));
    $$('.bucket', this.el).forEach(b => b.onclick = (e) => { if (sel && !e.target.closest('.schip')) put(sel, $('.bin', b)); });
    $('#sc', this.el).onclick = () => { if (this.lock) return; if ($$('.schip', pool).length) { toast('🧺 ' + GT('so_hint')); return; } this.lock = true; let ok = 0; const notes = [];
      $$('.schip', this.el).forEach(ch => { const it = this.items[+ch.dataset.k]; const b = +ch.closest('.bin').dataset.b; const good = b === it.b; if (good) ok++; else notes.push(`${inl(it.t)} → <b>${esc(this.buckets[it.b])}</b>${it.ex ? ' — ' + inl(it.ex) : ''}`); ch.classList.add(good ? 'okc' : 'noc'); });
      this.ok = ok; this.N = this.total; this.fb(ok === this.total, notes.join('<br>'), () => this.end(), T('finish') + ' 🏁'); };
  }
}
/* 11. Уақыт таспасы */
const TL_BUILTIN = {
  kzhist: [[552, 'Түрік қағанатының құрылуы|Образование Тюркского каганата|The Turkic Khaganate is founded'], [1219, 'Моңғол шапқыншылығының басталуы|Начало монгольского нашествия|The Mongol invasion begins'], [1465, 'Қазақ хандығының құрылуы|Образование Казахского ханства|The Kazakh Khanate is founded'],
    [1730, 'Аңырақай шайқасы|Аныракайская битва|Battle of Anyrakay'], [1837, 'Кенесары көтерілісінің басталуы|Начало восстания Кенесары|Kenesary’s uprising begins'], [1917, '«Алаш» партиясының құрылуы|Создание партии «Алаш»|The Alash party is founded'],
    [1954, 'Тың игерудің басталуы|Начало освоения целины|The Virgin Lands campaign begins'], [1986, 'Желтоқсан оқиғасы|Декабрьские события|The December (Zheltoqsan) events'], [1991, 'Тәуелсіздіктің жариялануы|Провозглашение независимости|Independence is declared'], [1997, 'Елорданың Ақмолаға көшуі|Перенос столицы в Акмолу|The capital moves to Akmola']],
  worldhist: [[1492, 'Колумб Америкаға жетті|Колумб достиг Америки|Columbus reaches America'], [1789, 'Ұлы француз революциясы|Великая французская революция|The French Revolution'], [1914, 'Бірінші дүниежүзілік соғыс басталды|Началась Первая мировая война|World War I begins'],
    [1939, 'Екінші дүниежүзілік соғыс басталды|Началась Вторая мировая война|World War II begins'], [1945, 'БҰҰ құрылды|Основана ООН|The UN is founded'], [1961, 'Гагарин — ғарыштағы алғашқы адам|Гагарин — первый человек в космосе|Gagarin is the first human in space'], [1969, 'Адам Айға қонды|Человек высадился на Луну|Humans land on the Moon'], [1991, 'КСРО ыдырады|Распад СССР|The USSR collapses']]
};
TL_BUILTIN.law = [[1993, 'Тұңғыш Конституция қабылданды|Принята первая Конституция|The first Constitution is adopted'], [1995, 'Қазіргі Конституция қабылданды|Принята действующая Конституция|The current Constitution is adopted'], ...TL_BUILTIN.kzhist.filter(x => x[0] >= 1986 && x[0] !== 1997)];
class TimelineGame extends XBase {
  init() { this.mode = 'timeline'; const c = this.data.content; let ev = (c.timeline || []).map(x => ({ e: x.event, y: x.year }));
    if (ev.length < 3) ev = (TL_BUILTIN[this.data.topic.subject] || TL_BUILTIN.kzhist).map(([y, e]) => ({ y, e: e.split('|')[GLI()] }));
    this.ev = pickN(ev, Math.min(6, ev.length)).sort((a, b) => a.y - b.y); this.N = 0; }
  round() {
    let items = shuf(this.ev); let g = 0; while (items.every((v, k) => v === this.ev[k]) && g++ < 10) items = shuf(this.ev);
    this.frame(`<p class="small muted">⏳ ${GT('tl_hint')}</p><div class="tline"><ul class="olist tl" id="tl">${items.map(it => `<li class="oitem" data-y="${it.y}"><span class="h">⠿</span><span class="tdot"></span><span class="grow md">${inl(it.e)}</span><span class="tyear">????</span><span class="mv"><button class="up">↑</button><button class="dn">↓</button></span></li>`).join('')}</ul></div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" id="tc">${GT('check')}</button></div>`);
    const ol = $('#tl', this.el); this.lock = false;
    $$('.oitem', ol).forEach(li => { $('.up', li).onclick = () => { if (!this.lock && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling); }; $('.dn', li).onclick = () => { if (!this.lock && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li); }; sortable(li, ol, () => this.lock, () => {}); });
    $('#tc', this.el).onclick = () => { if (this.lock) return; this.lock = true; const lis = $$('.oitem', ol); let ok = 0;
      lis.forEach((li, k) => { const good = +li.dataset.y === this.ev[k].y; if (good) ok++; li.classList.add(good ? 'ok' : 'no'); $('.tyear', li).textContent = li.dataset.y; });
      this.ok = ok; this.N = this.ev.length;
      this.fb(ok === this.ev.length, this.ev.map(x => `<b>${x.y}</b> — ${inl(x.e)}`).join('<br>'), () => this.end(), T('finish') + ' 🏁'); };
  }
}
/* 12. Суретті белгіле */
const DIAGRAMS = {
  cell: { t: ['Жануар жасушасы', 'Животная клетка', 'Animal cell'], svg: `<ellipse cx="200" cy="130" rx="180" ry="115" fill="#fde2b8" stroke="#e59a3a" stroke-width="6"/><circle cx="215" cy="125" r="45" fill="#b9a4ff" stroke="#6d4de0" stroke-width="4"/><circle cx="225" cy="120" r="14" fill="#5b3fd0"/>
      <ellipse cx="95" cy="90" rx="30" ry="14" fill="#ff9aa2" stroke="#d64550" stroke-width="3" transform="rotate(-20 95 90)"/><ellipse cx="300" cy="190" rx="28" ry="13" fill="#ff9aa2" stroke="#d64550" stroke-width="3"/>
      ${[[120, 180], [140, 200], [300, 80], [320, 100], [160, 60], [100, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#2f7d4f"/>`).join('')}<path d="M270 60 q20 20 0 40 q-20 20 0 40" stroke="#4aa3df" stroke-width="4" fill="none"/>`,
    pts: [[26, 130, 'Жасуша мембранасы|Клеточная мембрана|Cell membrane', 'Жасушаны қоршап, заттардың кіріп-шығуын реттейді|Окружает клетку и регулирует обмен веществ|Surrounds the cell and controls what goes in and out'], [215, 160, 'Ядро|Ядро|Nucleus', 'Тұқым қуалау ақпаратын (ДНҚ) сақтайды|Хранит наследственную информацию (ДНК)|Stores genetic information (DNA)'],
      [225, 120, 'Ядрошық|Ядрышко|Nucleolus', 'Рибосомалар түзіледі|Здесь образуются рибосомы|Makes ribosomes'], [95, 90, 'Митохондрия|Митохондрия|Mitochondrion', 'Энергия (АТФ) өндіреді|Вырабатывает энергию (АТФ)|Produces energy (ATP)'],
      [140, 200, 'Рибосома|Рибосома|Ribosome', 'Белок синтездейді|Синтезирует белок|Builds proteins'], [335, 145, 'Цитоплазма|Цитоплазма|Cytoplasm', 'Органоидтар орналасқан ішкі орта|Внутренняя среда с органоидами|Jelly-like inside where organelles live']] },
  flower: { t: ['Гүлдің құрылысы', 'Строение цветка', 'Parts of a flower'], svg: `<path d="M200 250 V140" stroke="#2f9e44" stroke-width="8"/><path d="M200 210 q-50 -10 -70 -40 q40 0 70 30" fill="#40c057"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="200" cy="80" rx="26" ry="50" fill="#ff8fab" stroke="#e64980" stroke-width="3" transform="rotate(${a} 200 120)"/>`).join('')}
      <path d="M170 140 q30 25 60 0 l-8 14 q-22 14 -44 0z" fill="#69db7c"/><circle cx="200" cy="120" r="18" fill="#ffd43b"/><path d="M200 120 V92" stroke="#2b8a3e" stroke-width="6"/><circle cx="200" cy="88" r="6" fill="#2b8a3e"/>${[[180, 100], [220, 100], [175, 118], [225, 118]].map(([x, y]) => `<path d="M200 120 L${x} ${y}" stroke="#f08c00" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#f08c00"/>`).join('')}`,
    pts: [[262, 55, 'Күлте (гүл жапырағы)|Лепесток|Petal', 'Ашық түсімен жәндіктерді тартады|Яркой окраской привлекает насекомых|Its colour attracts pollinators'], [172, 99, 'Аталық|Тычинка|Stamen', 'Тозаң түзеді|Образует пыльцу|Makes pollen'], [200, 82, 'Аналық|Пестик|Pistil', 'Тозаңданудан кейін жеміс пен тұқым түзіледі|После опыления из него образуются плод и семена|Becomes the fruit and seeds after pollination'],
      [232, 146, 'Тостағанша|Чашечка|Sepal', 'Гүл бүршігін қорғайды|Защищает бутон|Protects the bud'], [200, 235, 'Сабақ|Стебель|Stem', 'Су мен қоректік заттарды тасымалдайды|Проводит воду и питательные вещества|Carries water and nutrients'], [140, 180, 'Жапырақ|Лист|Leaf', 'Фотосинтез жүреді|Здесь идёт фотосинтез|Where photosynthesis happens']] },
  earth: { t: ['Жердің ішкі құрылысы', 'Внутреннее строение Земли', 'Earth’s layers'], svg: `<path d="M20 240 A180 180 0 0 1 380 240 Z" fill="#8d6e63"/><path d="M34 240 A166 166 0 0 1 366 240 Z" fill="#ff8a3d"/><path d="M95 240 A105 105 0 0 1 305 240 Z" fill="#ffc53d"/><path d="M145 240 A55 55 0 0 1 255 240 Z" fill="#fff3bf"/>`,
    pts: [[42, 150, 'Жер қыртысы|Земная кора|Crust', 'Ең жұқа қатты қабат, 5–70 км|Самая тонкая твёрдая оболочка, 5–70 км|Thin solid outer layer, 5–70 km'], [80, 205, 'Мантия|Мантия|Mantle', 'Ең қалың қабат, ыстық тұтқыр жыныстар|Самый толстый слой из горячих вязких пород|Thickest layer of hot, slowly flowing rock'],
      [125, 225, 'Сыртқы ядро|Внешнее ядро|Outer core', 'Сұйық темір мен никель — магнит өрісін тудырады|Жидкие железо и никель создают магнитное поле|Liquid iron & nickel that create the magnetic field'], [200, 215, 'Ішкі ядро|Внутреннее ядро|Inner core', 'Қатты, өте ыстық (≈5000°C)|Твёрдое и очень горячее (≈5000°C)|Solid and extremely hot (≈5000°C)']] },
  water: { t: ['Табиғаттағы су айналымы', 'Круговорот воды в природе', 'The water cycle'], svg: `<rect x="0" y="190" width="400" height="60" fill="#4dabf7"/><path d="M230 190 L300 90 L370 190 Z" fill="#868e96"/><path d="M285 112 L300 90 L315 112 Z" fill="#fff"/><circle cx="50" cy="45" r="26" fill="#ffd43b"/>
      <g fill="#dee2e6"><circle cx="180" cy="50" r="22"/><circle cx="205" cy="42" r="26"/><circle cx="232" cy="52" r="20"/></g>${[190, 205, 220].map(x => `<path d="M${x} 80 l-5 14" stroke="#1c7ed6" stroke-width="3"/>`).join('')}
      <path d="M90 180 C 90 130 120 100 150 70" stroke="#e8590c" stroke-width="3" fill="none" stroke-dasharray="6 5"/><path d="M335 150 C 320 175 280 185 250 190" stroke="#1864ab" stroke-width="4" fill="none"/>`,
    pts: [[95, 150, 'Булану|Испарение|Evaporation', 'Күн қыздырған су буға айналып, көтеріледі|Нагретая солнцем вода превращается в пар|Sun-heated water turns into vapour and rises'], [240, 30, 'Конденсация|Конденсация|Condensation', 'Бу суып, бұлт тамшыларына айналады|Пар охлаждается и образует облака|Vapour cools and forms cloud droplets'],
      [212, 104, 'Жауын-шашын|Осадки|Precipitation', 'Тамшылар ауырлап, жаңбыр не қар болып түседі|Капли тяжелеют и выпадают дождём или снегом|Drops grow heavy and fall as rain or snow'], [300, 176, 'Жер беті ағыны|Поверхностный сток|Runoff', 'Су өзендер арқылы теңізге қайтады|Вода по рекам возвращается в море|Water flows back to the sea through rivers']] }
};
class LabelGame extends XBase {
  init() { this.mode = 'label'; const s = this.data.topic.subject, tx = topicText(this.data);
    const opts = s === 'bio' ? ['cell', 'flower'] : s === 'geo' ? ['earth', 'water'] : ['water', 'flower', 'earth', 'cell'];
    let first = opts[0]; if (/гүл|цвет|flower|өсімдік|растен|plant/.test(tx)) first = 'flower'; else if (/жасуша|клетк|cell/.test(tx)) first = 'cell'; else if (/су |вод|water|гидро|климат|атмосф|жауын|осадк/.test(tx)) first = 'water'; else if (/литосфер|жер қыртыс|земн|earth|рельеф/.test(tx)) first = 'earth';
    this.list = [first, ...opts.filter(x => x !== first)]; this.N = this.list.length; }
  round() {
    const D = DIAGRAMS[this.list[this.i]]; const pts = D.pts.map(([x, y, n, info]) => ({ x, y, n: n.split('|')[GLI()], info: info.split('|')[GLI()] })); const chips = shuf(pts.map((p, k) => k));
    this.frame(`<h3>${tri(D.t)}</h3><p class="small muted">${GT('lb_hint')}</p><div class="lbwrap"><svg class="lbsvg" viewBox="0 0 400 260">${D.svg}${pts.map((p, k) => `<g class="lmark" data-k="${k}"><circle cx="${p.x}" cy="${p.y}" r="13"/><text x="${p.x}" y="${p.y + 5}">${k + 1}</text></g>`).join('')}</svg>
      <div class="lbside"><div>${pts.map((p, k) => `<div class="mslot lbrow" data-k="${k}"><div class="l"><b>${k + 1}</b></div><div class="drop" data-k="${k}"></div></div>`).join('')}</div><div class="pool" id="lpool">${chips.map(k => `<div class="chipd" data-v="${k}">${esc(pts[k].n)}</div>`).join('')}</div>
      <button class="btn pri" id="lc">${GT('check')}</button></div></div>`);
    let sel = null; const pool = $('#lpool', this.el); this.lock = false;
    const place = (chip, target) => { if (!target) return; if (target.classList.contains('drop') && target.firstElementChild && target.firstElementChild !== chip) pool.appendChild(target.firstElementChild); target.appendChild(chip); chip.classList.remove('sel'); sel = null; Sound.play('tick'); };
    $$('.chipd', this.el).forEach(ch => dragify(ch, { tap: () => { if (this.lock) return; if (ch.parentElement.classList.contains('drop')) { pool.appendChild(ch); return; } $$('.chipd', this.el).forEach(x => x.classList.remove('sel')); sel = ch; ch.classList.add('sel'); },
      drop: (x, y) => { if (this.lock) return; const t = document.elementFromPoint(x, y); const d = t && (t.closest('.drop') || t.closest('.pool')); if (d && this.el.contains(d)) place(ch, d); else { const m = t && t.closest('.lmark'); if (m) place(ch, $(`.drop[data-k="${m.dataset.k}"]`, this.el)); } },
      over: (x, y) => { $$('.drop', this.el).forEach(d => d.classList.remove('over')); const t = document.elementFromPoint(x, y); const d = t && t.closest('.drop'); if (d) d.classList.add('over'); } }));
    $$('.drop', this.el).forEach(d => d.onclick = (e) => { if (sel && !e.target.closest('.chipd')) place(sel, d); });
    $$('.lmark', this.el).forEach(m => m.onclick = () => { if (sel) place(sel, $(`.drop[data-k="${m.dataset.k}"]`, this.el)); });
    $('#lc', this.el).onclick = () => { if (this.lock) return; this.lock = true; let ok = 0;
      pts.forEach((p, k) => { const c = $(`.drop[data-k="${k}"] .chipd`, this.el); const good = c && +c.dataset.v === k; if (good) ok++; $(`.lbrow[data-k="${k}"]`, this.el).classList.add(good ? 'ok' : 'no'); });
      this.ok += ok / pts.length; this.fb(ok === pts.length, pts.map((p, k) => `<b>${k + 1}. ${esc(p.n)}</b> — ${esc(p.info)}`).join('<br>'), () => this.nextRound()); };
  }
}
/* 13. Сөйлем құрастыр */
const SENT = {
  kk: ['Мен күнде мектепке барамын.', 'Біздің сынып өте ынтымақты.', 'Абай — ұлы қазақ ақыны.', 'Көктемде дала қызғалдаққа толады.', 'Оқушылар кітапханадан жаңа кітап алды.', 'Әжем маған ертегі айтып берді.'],
  ru: ['Мы каждый день ходим в школу.', 'Весной в степи расцветают тюльпаны.', 'Мой брат любит читать книги.', 'Абай был великим казахским поэтом.', 'Ученики написали интересное сочинение.', 'Бабушка рассказала мне сказку.'],
  en: ['I go to school every day.', 'She has lived in Almaty since 2015.', 'We are going to visit the museum tomorrow.', 'My brother plays football very well.', 'The book was written by Abai.', 'They were watching TV when I called.']
};
const SENT_TIP = { kk: 'Қазақ тілінде баяндауыш әдетте сөйлемнің соңында тұрады: бастауыш → толықтауыш → баяндауыш.', ru: 'Обычный порядок в русском предложении: подлежащее → сказуемое → дополнение; обстоятельство времени часто стоит в начале.', en: 'English word order: Subject → Verb → Object → Place → Time.' };
class SentenceGame extends XBase {
  init() { this.mode = 'sentence'; const s = this.data.topic.subject; this.sl = s === 'eng' ? 'en' : s === 'rus' ? 'ru' : ['alippe', 'kaztil', 'adoqu', 'kazadeb'].includes(s) ? 'kk' : this.data.lang;
    const own = (this.data.content.sentences || []); this.list = pickN(own.length >= 3 ? own : SENT[this.sl] || SENT.kk, 5); this.N = this.list.length; }
  round() {
    const sen = this.list[this.i].trim(); const end = (sen.match(/[.!?…]+$/) || [''])[0]; const words = sen.replace(/[.!?…]+$/, '').split(/\s+/).filter(Boolean);
    let tiles = shuf(words.map((w, k) => ({ w, k }))); let g = 0; while (tiles.length > 1 && tiles.every((t, k) => t.k === k) && g++ < 10) tiles = shuf(tiles); const built = [];
    this.frame(`<p class="small muted">🧱 ${GT('se_hint')}</p><div class="sbuilt" id="sb"></div><div class="wtiles" id="st">${tiles.map((t, j) => `<button class="wtile sw" data-j="${j}">${esc(t.w)}</button>`).join('')}</div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="su">⌫</button><button class="btn pri" id="scc">${GT('check')}</button></div>`);
    const paint = () => { $('#sb', this.el).innerHTML = built.map((t, k) => `<button class="wtile on" data-k="${k}">${esc(t.w)}</button>`).join('') + `<span class="send">${esc(end)}</span>`;
      $$('#sb .wtile', this.el).forEach(b => b.onclick = () => { if (this.lock) return; const t = built.splice(+b.dataset.k, 1)[0]; $(`#st .wtile[data-j="${t.j}"]`, this.el).disabled = false; paint(); }); };
    this.lock = false; paint();
    $$('#st .wtile', this.el).forEach(b => b.onclick = () => { if (this.lock || b.disabled) return; b.disabled = true; built.push({ ...tiles[+b.dataset.j], j: +b.dataset.j }); Sound.play('tick'); paint(); });
    $('#su', this.el).onclick = () => { if (this.lock) return; const t = built.pop(); if (t) { $(`#st .wtile[data-j="${t.j}"]`, this.el).disabled = false; paint(); } };
    $('#scc', this.el).onclick = () => { if (this.lock || built.length < words.length) return; this.lock = true; const ok = built.map(t => t.w).join(' ') === words.join(' '); if (ok) this.ok++;
      $('#sb', this.el).classList.add(ok ? 'ok' : 'no'); this.fb(ok, `<b>${esc(sen)}</b><br>💡 ${esc(SENT_TIP[this.sl] || '')}`, () => this.nextRound()); };
  }
}
/* 14. Флэш-карталар (Лейтнер) */
class FlashGame extends XBase {
  init() { this.mode = 'flash'; this.key = 'ab_fc_' + this.data.topic.id + '_' + this.data.lang; try { this.box = JSON.parse(localStorage.getItem(this.key) || '{}'); } catch (e) { this.box = {}; }
    const all = cardsOf(this.data.content); const now = Date.now(); const gap = { 1: 0, 2: 864e5, 3: 3 * 864e5 };
    let due = all.filter(([f]) => { const b = this.box[f]; return !b || now - b.t >= gap[b.b]; }); if (!due.length) due = all; this.cards = shuf(due).slice(0, 10); this.N = this.cards.length; }
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.box)); } catch (e) { /* */ } }
  round() {
    const [f, b] = this.cards[this.i]; const cnt = [1, 2, 3].map(n => Object.values(this.box).filter(x => x.b === n).length);
    this.frame(`<p class="small muted">🗂️ ${GT('fc_info')}</p><div class="fcboxes">${[1, 2, 3].map((n, k) => `<span class="pill">${GT('fc_box')} ${n}: ${cnt[k]}</span>`).join('')}</div>
      <div class="fcard3" id="fcd"><div class="fin"><div class="ff front md">${mdToHtml(f)}<small>${GT('fc_flip')}</small></div><div class="ff back md">${mdToHtml(b)}</div></div></div>
      <div class="row" style="justify-content:center;margin-top:14px" id="fcb" hidden><button class="btn danger" id="fn">✗ ${GT('fc_not')}</button><button class="btn pri" id="fy">✓ ${GT('fc_knew')}</button></div>`);
    const fc = $('#fcd', this.el); fc.onclick = () => { fc.classList.toggle('flip'); $('#fcb', this.el).hidden = false; Sound.play('tick'); };
    const mark = (knew) => { const cur = (this.box[f] && this.box[f].b) || 1; this.box[f] = { b: knew ? Math.min(3, cur + 1) : 1, t: Date.now() }; this.save(); if (knew) { this.ok++; Sound.play('ok'); } else Sound.play('bad'); this.nextRound(); };
    $('#fy', this.el).onclick = () => mark(true); $('#fn', this.el).onclick = () => mark(false);
  }
}
