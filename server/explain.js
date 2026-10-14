'use strict';
/* v3.2 — офлайн түсіндірме: ресми оқу мақсаттары (№399 үлгілік бағдарлама), бөлім, көрші тақырыптар,
   AI алдын ала дайындаған қысқа түсіндірме (shared/explain/kk/<пән>.json, мұғалім тексеруі ұсынылады) және пәндік әдіс-тәсілдер */
const fs = require('fs'), path = require('path');
const CAT = require('./catalog');
const DIR = path.join(__dirname, '..', 'shared', 'explain');
const cache = {};
function seedFor(topic, lang = 'kk') {
  const k = lang + '/' + topic.subject; if (!(k in cache)) { try { cache[k] = JSON.parse(fs.readFileSync(path.join(DIR, lang, topic.subject + '.json'), 'utf8')); } catch { cache[k] = {}; } }
  return cache[k][topic.id] || null;
}
function seedStats() { let n = 0; try { for (const f of fs.readdirSync(path.join(DIR, 'kk'))) n += Object.keys(JSON.parse(fs.readFileSync(path.join(DIR, 'kk', f), 'utf8'))).length; } catch { /* */ } return n; }
const GROUP = { kaztil: 'lang', rus: 'lang', eng: 'lang', anatili: 'lang', alippe: 'lang', kazadeb: 'lit', adoqu: 'lit', math: 'math', alg: 'math', geom: 'math',
  phys: 'sci', chem: 'sci', bio: 'sci', zharat: 'sci', geo: 'sci', kzhist: 'hist', worldhist: 'hist', law: 'hist', globe: 'hist', dunie: 'hist',
  inf: 'inf', digital: 'inf', graphics: 'inf', music: 'art', beyneleu: 'art', enbek: 'art', korkem: 'art', pe: 'pe', avtd: 'pe', biz: 'biz' };
const M = {
  kk: { lang: ['Ережені оқы да, үлгі сөйлемді тап', 'Жұрнақ/жалғауды түсті қаламмен белгіле', 'Өз сөйлеміңді құра', 'Ауызша айтып, жазбаша бекіт'],
    lit: ['Шығарманы оқы (немесе тыңда)', 'Кейіпкерлер мен оқиға желісін белгіле', 'Автордың негізгі ойын тап', 'Өз пікіріңді дәлелмен жаз'],
    math: ['Анықтама мен формуланы жаз', 'Үлгі есептің әр қадамын түсін', 'Ұқсас есепті өзің шығар', 'Жауабыңды тексер (кері амал, бағалау)'],
    sci: ['Құбылысты бақыла немесе елестет', 'Ұғым мен заңдылықты тұжырымда', 'Тәжірибе/сызба арқылы тексер', 'Өмірдегі мысалмен байланыстыр'],
    hist: ['Кезең мен орынды анықта (қашан? қайда?)', 'Негізгі тұлғалар мен оқиғаларды белгіле', 'Себеп → оқиға → салдар тізбегін құр', 'Дереккөзге сүйеніп, өз бағаңды бер'],
    inf: ['Ұғымды түсін (не? не үшін?)', 'Алгоритмді қадамдарға бөл', 'Компьютерде орындап көр', 'Қатені тауып, түзет'],
    art: ['Үлгі туындыны қара/тыңда', 'Тәсіл мен материалды таңда', 'Эскиз/жоспар жаса', 'Жұмысыңды көрсетіп, бағала'],
    pe: ['Қауіпсіздік ережесін қайтала', 'Қимылды баяу, дұрыс техникамен орында', 'Бірнеше рет қайталап бекіт', 'Жетістігіңді өлшеп, жазып қой'],
    biz: ['Мәселені немесе қажеттілікті анықта', 'Идеяны сипатта', 'Есептеу/жоспар жаса', 'Идеяңды таныстыр (питчинг)'] },
  ru: { lang: ['Прочитай правило и найди пример', 'Выдели суффикс/окончание цветом', 'Составь своё предложение', 'Проговори устно и закрепи письменно'],
    lit: ['Прочитай (или прослушай) произведение', 'Отметь героев и сюжетную линию', 'Найди главную мысль автора', 'Запиши своё мнение с аргументами'],
    math: ['Запиши определение и формулу', 'Разбери каждый шаг образца', 'Реши похожую задачу сам', 'Проверь ответ (обратное действие, прикидка)'],
    sci: ['Понаблюдай или представь явление', 'Сформулируй понятие и закономерность', 'Проверь опытом/схемой', 'Свяжи с примером из жизни'],
    hist: ['Определи время и место (когда? где?)', 'Отметь главных личностей и события', 'Построй цепочку причина → событие → следствие', 'Дай оценку, опираясь на источник'],
    inf: ['Пойми понятие (что? зачем?)', 'Разбей алгоритм на шаги', 'Выполни на компьютере', 'Найди и исправь ошибку'],
    art: ['Рассмотри/прослушай образец', 'Выбери приём и материал', 'Сделай эскиз/план', 'Покажи работу и оцени её'],
    pe: ['Повтори правила безопасности', 'Выполни движение медленно и технично', 'Закрепи несколькими повторами', 'Измерь и запиши свой результат'],
    biz: ['Определи проблему или потребность', 'Опиши идею', 'Сделай расчёт/план', 'Представь идею (питчинг)'] },
  en: { lang: ['Read the rule and find an example', 'Highlight the suffix/ending in colour', 'Make your own sentence', 'Say it aloud, then write it'],
    lit: ['Read (or listen to) the work', 'Mark the characters and plot', 'Find the author\'s main idea', 'Write your opinion with arguments'],
    math: ['Write the definition and formula', 'Follow every step of the model', 'Solve a similar problem yourself', 'Check the answer (inverse operation, estimate)'],
    sci: ['Observe or imagine the phenomenon', 'State the concept and the law', 'Test it with an experiment/diagram', 'Link it to real life'],
    hist: ['Find the time and place (when? where?)', 'Mark key people and events', 'Build a cause → event → consequence chain', 'Evaluate using a source'],
    inf: ['Understand the concept (what? why?)', 'Split the algorithm into steps', 'Run it on a computer', 'Find and fix the bug'],
    art: ['Look at/listen to a model work', 'Choose a technique and material', 'Make a sketch/plan', 'Present and assess your work'],
    pe: ['Repeat the safety rules', 'Do the movement slowly with correct technique', 'Repeat several times', 'Measure and record your result'],
    biz: ['Find a problem or need', 'Describe the idea', 'Make a calculation/plan', 'Pitch your idea'] } };
const RL = { kk: { lang: 'Сауатты сөйлеу мен жазу — хат, хабарлама, сөз сөйлеу, емтихан және болашақ мамандықта керек.', lit: 'Көркем шығарма адамды түсінуге, өз ойыңды жеткізуге және өмірлік таңдау жасауға үйретеді.', math: 'Математика дүкенде, жол жүргенде, құрылыста, бағдарламалауда және қаржыны жоспарлағанда қолданылады.', sci: 'Бұл білім денсаулық, табиғатты қорғау, техника мен күнделікті тұрмыста керек.', hist: 'Тарихты білу бүгінгі оқиғаларды түсінуге және азамат ретінде дұрыс шешім қабылдауға көмектеседі.', inf: 'Цифрлық дағдылар оқуда, жұмыста және қауіпсіз интернет қолдануда керек.', art: 'Шығармашылық дағдылар үйді безендіруде, сыйлық жасауда, дизайн мен мамандықта пайдалы.', pe: 'Дұрыс жаттығу денсаулықты нығайтады, күш пен төзімділікті арттырады.', biz: 'Кәсіпкерлік дағдылар өз ісіңді ашуға және қаржыны дұрыс басқаруға көмектеседі.' },
  ru: { lang: 'Грамотная речь и письмо нужны в переписке, выступлениях, на экзаменах и в будущей профессии.', lit: 'Художественное произведение учит понимать людей, выражать мысли и делать жизненный выбор.', math: 'Математика нужна в магазине, в дороге, на стройке, в программировании и при планировании бюджета.', sci: 'Эти знания нужны для здоровья, охраны природы, в технике и в быту.', hist: 'Знание истории помогает понимать события сегодня и принимать решения как гражданин.', inf: 'Цифровые навыки нужны в учёбе, работе и для безопасного интернета.', art: 'Творческие навыки полезны в оформлении дома, подарках, дизайне и профессии.', pe: 'Правильные упражнения укрепляют здоровье, развивают силу и выносливость.', biz: 'Навыки предпринимательства помогают открыть своё дело и управлять деньгами.' },
  en: { lang: 'Correct speaking and writing are needed in messages, speeches, exams and your future job.', lit: 'Literature teaches you to understand people, express ideas and make life choices.', math: 'Maths is used in shops, travel, construction, programming and budgeting.', sci: 'This knowledge matters for health, nature protection, technology and daily life.', hist: 'Knowing history helps you understand today\'s events and decide as a citizen.', inf: 'Digital skills are needed for study, work and safe internet use.', art: 'Creative skills help in home design, gifts, design jobs and careers.', pe: 'Correct exercise builds health, strength and endurance.', biz: 'Entrepreneurial skills help you start a business and manage money.' } };
const MIS = { kk: { lang: ['Ережені жаттап, мысалсыз қалдыру', 'Әр ережеге 2–3 өз мысалыңды құр', 'Мысал ережені есте сақтатады'], lit: ['Мазмұнды ғана айтып, талдау жасамау', 'Автордың ойы мен көркемдік тәсілдерін атап өт', 'Талдау — баға мен дәлел'], math: ['Жауапты тексермеу', 'Кері амалмен немесе бағалаумен тексер', 'Көп қате есептеу кезінде кетеді'], sci: ['Ұғымдарды шатастыру (мысалы, масса мен салмақ)', 'Анықтамасы мен өлшем бірлігін қатар жаз', 'Әр ұғымның өз мағынасы бар'], hist: ['Даталар мен оқиғаларды байланыссыз жаттау', 'Себеп → оқиға → салдар тізбегін құр', 'Байланыс есте сақтауды жеңілдетеді'], inf: ['Алгоритмді тексермей жазу', 'Әр қадамды қолмен «орындап» көр', 'Қате ерте табылады'], art: ['Эскизсіз бірден бастау', 'Алдымен жоспар/эскиз жаса', 'Жоспар жұмысты ұқыпты етеді'], pe: ['Қыздыру жаттығуын өткізіп жіберу', 'Әрқашан 5–10 минут қыздырудан баста', 'Жарақаттың алдын алады'], biz: ['Шығынды есептемей идеяны бастау', 'Кіріс пен шығынды алдын ала есепте', 'Есеп тәуекелді азайтады'] },
  ru: { lang: ['Заучить правило без примеров', 'Составь 2–3 своих примера к правилу', 'Пример помогает запомнить правило'], lit: ['Пересказать сюжет без анализа', 'Назови мысль автора и художественные приёмы', 'Анализ — это оценка и доказательства'], math: ['Не проверять ответ', 'Проверь обратным действием или прикидкой', 'Большинство ошибок — вычислительные'], sci: ['Путать понятия (например, массу и вес)', 'Записывай определение вместе с единицей измерения', 'У каждого понятия свой смысл'], hist: ['Учить даты без связи с событиями', 'Построй цепочку причина → событие → следствие', 'Связи облегчают запоминание'], inf: ['Писать алгоритм без проверки', 'Выполни каждый шаг «вручную»', 'Ошибка найдётся раньше'], art: ['Начинать без эскиза', 'Сначала сделай план/эскиз', 'План делает работу аккуратной'], pe: ['Пропускать разминку', 'Всегда начинай с разминки 5–10 минут', 'Это предотвращает травмы'], biz: ['Начинать без расчёта затрат', 'Заранее посчитай доходы и расходы', 'Расчёт снижает риск'] },
  en: { lang: ['Memorising a rule without examples', 'Make 2–3 examples of your own', 'Examples help you remember the rule'], lit: ['Retelling the plot without analysis', 'Name the author\'s idea and literary devices', 'Analysis means judgement with evidence'], math: ['Not checking the answer', 'Check with the inverse operation or an estimate', 'Most mistakes are calculation slips'], sci: ['Mixing up concepts (e.g. mass and weight)', 'Write each definition with its unit', 'Every concept has its own meaning'], hist: ['Learning dates without events', 'Build a cause → event → consequence chain', 'Links make memory easier'], inf: ['Writing an algorithm without testing', 'Trace each step by hand', 'You find bugs earlier'], art: ['Starting without a sketch', 'Plan or sketch first', 'A plan makes work neat'], pe: ['Skipping the warm-up', 'Always warm up for 5–10 minutes', 'It prevents injuries'], biz: ['Starting without counting costs', 'Estimate income and costs first', 'Planning reduces risk'] } };
const X = {
  kk: { idea: 'Негізгі идея', rules: 'Негізгі ережелер мен фактілер', place: 'Бағдарламадағы орны', method: 'Қалай меңгереміз?', sec: 'Бөлім', lesson: (o, n) => `Бөлімдегі ${o}-сабақ (барлығы ${n})`, prev: 'Алдыңғы тақырып', next: 'Келесі тақырып', obj: 'Оқу мақсаттары (үлгілік оқу бағдарламасы)', objNote: '', hook: (t, s) => `«${s}» бөлімінің маңызды тақырыбы — «${t}». Бүгін оны қадамдап түсінеміз, мысал шығарамыз және ойында тексереміз! 🚀`, goalsDef: (t) => [`«${t}» тақырыбының негізгі ұғымдарын түсіну`, 'Ережені мысалмен түсіндіре алу', 'Тапсырмаларды өз бетінше орындау'], can: (x) => `${x} — мұны істей аласың ба?`, canA: 'Иә, мысал келтіріп түсіндіре аламын.', mm: { def: 'Анықтама', rules: 'Ережелер', terms: 'Терминдер', ex: 'Мысал', life: 'Өмірде', sec: 'Бөлім', goals: 'Мақсаттар', near: 'Көрші тақырыптар', steps: 'Әдіс' }, cmpSec: 'Бөлімнің тақырыптары', cols: ['№', 'Тақырып', 'Тоқсан'], cmpF: 'Формулалар', colsF: ['Атауы', 'Формула'], cmpK: 'Терминдер сөздігі', colsK: ['Термин', 'Мағынасы'], flow: 'Бөлім бойынша жол', seedNote: 'Қысқа түсіндірме AI көмегімен алдын ала дайындалған — мұғалім тексеруі ұсынылады.', gq: 'Есепті қадамдап шеш', g1: (b) => `Екі жағынан ${b} азайт. Нәтижесі:`, g2: (k) => `Екі жағын ${k}-ке бөл: x =`, g3: 'Тексер: сол жақтың мәні =', h1: 'Бос мүшені оң жаққа шығарамыз', h2: 'Коэффициентке бөлеміз', h3: 'x-тің мәнін орнына қой', gw: (a, b) => `Себетте ${a} алма бар еді, тағы ${b} алма салды. Кейін ${Math.min(a, b)} алма жеді. Нешеу қалды?`, gw1: 'Барлығы неше алма болды?', gw2: 'Жегеннен кейін неше қалды?', ghint1: 'Қосу керек', ghint2: 'Азайту керек', qTerm: (x) => `«${x}» терминінің мағынасы қайсы?`, tfDef: (t) => `Бұл «${t}» тақырыбының анықтамасы:`, sum: (t) => `«${t}» тақырыбының негізгі ұғымдары мен ережелерін білу маңызды.` },
  ru: { idea: 'Главная идея', rules: 'Ключевые правила и факты', place: 'Место в программе', method: 'Как освоить?', sec: 'Раздел', lesson: (o, n) => `Урок ${o} из ${n} в разделе`, prev: 'Предыдущая тема', next: 'Следующая тема', obj: 'Цели обучения (типовая учебная программа)', objNote: ' (официальный текст на казахском языке)', hook: (t, s) => `«${t}» — важная тема раздела «${s}». Сегодня разберём её по шагам, решим пример и проверим себя в игре! 🚀`, goalsDef: (t) => [`Понять основные понятия темы «${t}»`, 'Уметь объяснить правило на примере', 'Самостоятельно выполнять задания'], can: (x) => `${x} — умеешь ли ты это?`, canA: 'Да, могу объяснить на примере.', mm: { def: 'Определение', rules: 'Правила', terms: 'Термины', ex: 'Пример', life: 'В жизни', sec: 'Раздел', goals: 'Цели', near: 'Соседние темы', steps: 'Метод' }, cmpSec: 'Темы раздела', cols: ['№', 'Тема', 'Четверть'], cmpF: 'Формулы', colsF: ['Название', 'Формула'], cmpK: 'Словарь терминов', colsK: ['Термин', 'Значение'], flow: 'Путь по разделу', seedNote: '', gq: 'Реши задачу по шагам', g1: (b) => `Вычти ${b} из обеих частей. Получится:`, g2: (k) => `Раздели обе части на ${k}: x =`, g3: 'Проверка: значение левой части =', h1: 'Переносим свободный член вправо', h2: 'Делим на коэффициент', h3: 'Подставь найденный x', gw: (a, b) => `В корзине было ${a} яблок, положили ещё ${b}. Потом съели ${Math.min(a, b)}. Сколько осталось?`, gw1: 'Сколько яблок стало всего?', gw2: 'Сколько осталось после того, как съели?', ghint1: 'Нужно сложить', ghint2: 'Нужно вычесть', qTerm: (x) => `Что означает «${x}»?`, tfDef: (t) => `Это определение темы «${t}»:`, sum: (t) => `Важно знать основные понятия и правила темы «${t}».` },
  en: { idea: 'Key idea', rules: 'Key rules and facts', place: 'Place in the curriculum', method: 'How to master it', sec: 'Section', lesson: (o, n) => `Lesson ${o} of ${n} in the section`, prev: 'Previous topic', next: 'Next topic', obj: 'Learning objectives (typical curriculum)', objNote: ' (official text in Kazakh)', hook: (t, s) => `"${t}" is a key topic of the section "${s}". Today we break it down step by step, solve an example and test ourselves in a game! 🚀`, goalsDef: (t) => [`Understand the key ideas of "${t}"`, 'Explain the rule with an example', 'Do the tasks on your own'], can: (x) => `${x} — can you do this?`, canA: 'Yes, I can explain it with an example.', mm: { def: 'Definition', rules: 'Rules', terms: 'Terms', ex: 'Example', life: 'In real life', sec: 'Section', goals: 'Goals', near: 'Nearby topics', steps: 'Method' }, cmpSec: 'Topics of the section', cols: ['#', 'Topic', 'Term'], cmpF: 'Formulas', colsF: ['Name', 'Formula'], cmpK: 'Glossary', colsK: ['Term', 'Meaning'], flow: 'Path through the section', seedNote: '', gq: 'Solve step by step', g1: (b) => `Subtract ${b} from both sides. You get:`, g2: (k) => `Divide both sides by ${k}: x =`, g3: 'Check: value of the left side =', h1: 'Move the constant to the right side', h2: 'Divide by the coefficient', h3: 'Substitute the x you found', gw: (a, b) => `A basket had ${a} apples; ${b} more were added. Then ${Math.min(a, b)} were eaten. How many are left?`, gw1: 'How many apples in total?', gw2: 'How many are left after eating?', ghint1: 'Add', ghint2: 'Subtract', qTerm: (x) => `What does "${x}" mean?`, tfDef: (t) => `This is the definition for "${t}":`, sum: (t) => `Know the key concepts and rules of "${t}".` } };
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function objectives(topic) {
  if (!topic.obj) return [];
  return String(topic.obj).split(/;\s*/).map(x => x.replace(/^\s*\d+(\s*\.\s*\d+)+\s*\**\s*[-–]?\s*/, '').replace(/\s+/g, ' ').trim()).filter(x => x.length > 6)
    .map(x => x[0].toUpperCase() + x.slice(1)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 5);
}
const shortT = (s, n = 60) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
/* Негізгі функция: templateLesson(...) нәтижесін бай түсіндірмемен толықтыру */
function enrich(content, topic, lang, formulas) {
  const X_ = X[lang] || X.kk, grp = GROUP[topic.subject] || 'sci';
  const seed = lang === 'kk' ? seedFor(topic, 'kk') : seedFor(topic, lang);
  const sec = CAT.sectionOf(topic); const list = CAT.topicsOf(topic.subject, topic.grade);
  const secTopics = list.filter(t => t.s === topic.s); const pos = secTopics.findIndex(t => t.id === topic.id);
  const title = content.title; const secName = sec ? (sec[lang] || sec.kk) : '';
  const objs = objectives(topic); const i = list.findIndex(t => t.id === topic.id);
  const prev = list[i - 1], next = list[i + 1]; const tt = (t) => t ? (t[lang] || t.kk) : '';
  content.tv = 32; content.section = secName;
  if (secName) content.hook = X_.hook(title, secName);
  content.goals = objs.length && lang === 'kk' ? objs.slice(0, 4) : X_.goalsDef(title);
  if (objs.length) content.objectives = { title: X_.obj + X_.objNote, items: objs };
  const th = [];
  if (seed && seed.d) th.push({ h: X_.idea, md: seed.d });
  if (seed && Array.isArray(seed.r) && seed.r.length) th.push({ h: X_.rules, md: seed.r.map(x => '- ' + x).join('\n') });
  th.push({ h: X_.place, md: [secName ? `**${X_.sec}:** ${secName}` : '', X_.lesson(pos + 1, secTopics.length), prev ? `← ${X_.prev}: *${tt(prev)}*` : '', next ? `→ ${X_.next}: *${tt(next)}*` : '', objs.length ? `\n**${X_.obj}${X_.objNote}:**\n` + objs.map(x => '- ' + x).join('\n') : ''].filter(Boolean).join('\n\n') });
  th.push({ h: X_.method, md: M[lang][grp].map((x, k) => `${k + 1}. ${x}`).join('\n') });
  if (!seed) th.push(...content.theory.slice(1));
  content.theory = th.slice(0, 6);
  if (seed) {
    if (Array.isArray(seed.k) && seed.k.length) content.defs = seed.k.filter(k => Array.isArray(k) && k[0] && k[1]).slice(0, 6).map(k => ({ term: String(k[0]), text: String(k[1]) }));
    if (seed.d) content.defs = [{ term: title, text: seed.d }, ...(content.defs || [])].slice(0, 6);
    if (Array.isArray(seed.r)) content.rules = [...seed.r.slice(0, 4).map((x, k) => ({ title: '', text: String(x) })), ...(formulas.length ? content.rules : [])].slice(0, 6);
    if (seed.ex && seed.ex.q) content.examples = [{ q: String(seed.ex.q), steps: (Array.isArray(seed.ex.s) ? seed.ex.s : []).map(String).slice(0, 6), a: String(seed.ex.a || '') }, ...content.examples].slice(0, 4);
    if (Array.isArray(seed.m)) content.mistakes = seed.m.filter(m => m && m.w).slice(0, 3).map(m => ({ wrong: String(m.w), right: String(m.ok || ''), why: String(m.y || '') }));
    if (Array.isArray(seed.c)) content.check = seed.c.filter(c => c && c.q).slice(0, 4).map(c => ({ q: String(c.q), a: String(c.a || '') }));
    if (seed.rl) content.reallife = String(seed.rl);
    if (seed.sm) content.summary = [String(seed.sm)];
    content.seedNote = X_.seedNote || undefined;
  }
  if (!content.mistakes || !content.mistakes.length) { const m = MIS[lang][grp]; content.mistakes = [{ wrong: m[0], right: m[1], why: m[2] }]; }
  if (!content.reallife) content.reallife = RL[lang][grp];
  content.summary = [...(content.summary || []), ...(objs.length && lang === 'kk' ? objs.slice(0, 2) : [X_.sum(title)])].slice(0, 5);
  if (!content.check || !content.check.length) content.check = (objs.length && lang === 'kk' ? objs.slice(0, 3) : X_.goalsDef(title).slice(0, 2)).map(x => ({ q: X_.can(x), a: X_.canA }));
  if (!content.defs || !content.defs.length) { if (formulas.length) content.defs = formulas.slice(0, 4).map(f => ({ term: f.n[lang] || f.n.kk, text: '$' + f.tex + '$' })); }
  /* салыстыру кестесі */
  if (formulas.length >= 2) content.compare = { title: X_.cmpF, cols: X_.colsF, rows: formulas.slice(0, 6).map(f => [f.n[lang] || f.n.kk, '$' + f.tex + '$']) };
  else if (content.defs && content.defs.length >= 3) content.compare = { title: X_.cmpK, cols: X_.colsK, rows: content.defs.slice(0, 6).map(d => [d.term, d.text]) };
  else content.compare = { title: X_.cmpSec + (secName ? ': ' + secName : ''), cols: X_.cols, rows: secTopics.slice(0, 12).map(t => [String(t.o), (t.id === topic.id ? '▶ ' : '') + tt(t), String(t.q)]) };
  /* ой картасы */
  const mm = X_.mm, br = [];
  if (seed && seed.d) br.push({ label: mm.def, items: [shortT(seed.d, 70)] });
  if (seed && Array.isArray(seed.r)) br.push({ label: mm.rules, items: seed.r.slice(0, 3).map(x => shortT(String(x).replace(/\$/g, ''), 50)) });
  if (content.defs && content.defs.length > 1) br.push({ label: mm.terms, items: content.defs.slice(1, 5).map(d => shortT(d.term, 30)) });
  if (seed && seed.ex && seed.ex.q) br.push({ label: mm.ex, items: [shortT(seed.ex.q, 60)] });
  if (!seed) { if (secName) br.push({ label: mm.sec, items: [shortT(secName, 50)] }); if (objs.length) br.push({ label: mm.goals, items: objs.slice(0, 3).map(x => shortT(x, 50)) }); if (formulas.length) br.push({ label: mm.rules, items: formulas.slice(0, 3).map(f => shortT(f.n[lang] || f.n.kk, 40)) }); }
  br.push({ label: mm.near, items: [prev, next].filter(Boolean).map(t => shortT(tt(t), 40)) });
  br.push({ label: mm.life, items: [shortT(content.reallife, 60)] });
  content.mindmap = { center: shortT(title, 50), branches: br.filter(b => b.items.length).slice(0, 6) };
  /* сызба: бөлім бойынша жол */
  const w0 = Math.max(0, Math.min(pos - 2, secTopics.length - 5)); const win = secTopics.slice(w0, w0 + 5);
  if (win.length >= 2) content.diagram = { type: 'flow', title: X_.flow + (secName ? ': ' + shortT(secName, 50) : ''), items: win.map(t => ({ label: shortT(tt(t), 44), on: t.id === topic.id })) };
  /* глоссарий карточкалары */
  const cards = (content.defs || []).map(d => [d.term, d.text]); if (cards.length >= 3) content.cards = cards.slice(0, 8);
  /* қадамдап шешу */
  const isMath = grp === 'math';
  if (isMath && topic.grade >= 5) { const x = rnd(-4, 9) || 3, k = rnd(2, 7), b = rnd(1, 15), c = k * x + b;
    content.guided = { problem: `$${k}x+${b}=${c}$`, steps: [{ q: X_.g1(b) + ` $${k}x = ?$`, a: String(c - b), hint: X_.h1 }, { q: X_.g2(k), a: String(x), hint: X_.h2 }, { q: X_.g3 + ` $${k}\\cdot(${x})+${b}$`, a: String(c), hint: X_.h3 }], answer: `$x=${x}$` }; }
  else if (isMath) { const a = rnd(3, topic.grade <= 1 ? 9 : 40), b = rnd(2, topic.grade <= 1 ? 9 : 30), e = Math.min(a, b);
    content.guided = { problem: X_.gw(a, b), steps: [{ q: X_.gw1, a: String(a + b), hint: X_.ghint1 }, { q: X_.gw2, a: String(a + b - e), hint: X_.ghint2 }], answer: String(a + b - e) }; }
  else if (seed && seed.ex && Array.isArray(seed.ex.s) && seed.ex.s.length >= 2) content.guided = { problem: String(seed.ex.q), steps: seed.ex.s.slice(0, 5).map((s, k, arr) => ({ q: String(s), a: k === arr.length - 1 ? String(seed.ex.a || '') : '', hint: '' })), answer: String(seed.ex.a || ''), reveal: true };
  /* seed негізіндегі жаттығулар — алдыңғы орынға */
  if (seed) {
    const ex = []; const sibSeeds = list.filter(t => t.id !== topic.id).map(t => seedFor(t, lang === 'kk' ? 'kk' : lang)).filter(Boolean);
    const otherDefs = shuffle(sibSeeds.flatMap(s => (s.k || []).filter(Array.isArray).map(k => String(k[1]))));
    for (const k of (seed.k || []).filter(Array.isArray).slice(0, 2)) { const w = otherDefs.filter(d => d !== String(k[1])).slice(0, 3); if (w.length === 3) { const opts = shuffle([String(k[1]), ...w]); ex.push({ type: 'quiz', q: X_.qTerm(k[0]), options: opts, answer: opts.indexOf(String(k[1])), explain: `${k[0]} — ${k[1]}` }); } }
    const od = sibSeeds.map(s => s.d).filter(Boolean); if (seed.d && od.length) { const lie = Math.random() < .5; ex.push({ type: 'tf', q: X_.tfDef(title) + ' «' + shortT(lie ? od[rnd(0, od.length - 1)] : seed.d, 220) + '»', answer: !lie, explain: seed.d }); }
    const tk = (seed.k || []).filter(k => Array.isArray(k) && k[0] && k[1]); if (tk.length >= 3) ex.push({ type: 'match', q: X_.cmpK, pairs: tk.slice(0, 4).map(k => [String(k[0]).slice(0, 80), shortT(k[1], 80)]), explain: '' });
    content.exercises = [...ex, ...content.exercises].slice(0, 10);
  }
  return content;
}
module.exports = { enrich, seedFor, seedStats, objectives };
