'use strict';
/* Сабақ мазмұны: AI (Gemini) арқылы генерация + офлайн үлгі + автоматты тексеру */
const { SUBJECTS, TOPICS, topicsOf, tTitle } = require('./catalog');
const { formulasFor, poolFor } = require('./formulas');
const LANG_NAME = { kk: 'Kazakh (literary Kazakh, Cyrillic script)', ru: 'Russian', en: 'English' };
const STEM = new Set(['math', 'alg', 'geom', 'phys', 'chem', 'bio', 'inf', 'zharat', 'geo']);

const GUIDE = {
  alippe: 'Grade 1 literacy: letters, sounds, syllables, simple words; tiny sentences; lots of playful examples with familiar objects.',
  kaztil: 'Kazakh language: use correct Kazakh grammar terminology (зат есім, сын есім, етістік, септік, жалғау, жұрнақ, сөйлем мүшелері, т.б.) exactly as in Kazakh school textbooks; examples are real Kazakh sentences; explain rules with patterns and suffix tables (e.g. -лар/-лер/-дар/-дер/-тар/-тер by vowel harmony and final sound).',
  adoqu: 'Literary reading (grades 1–4): short texts, characters, main idea, moral; Kazakh folk tales and children\'s authors (Ы. Алтынсарин, А. Құнанбайұлы, М. Жұмабаев for children).',
  kazadeb: 'Kazakh literature: accurate authors, works, years and characters (Абай, Мұхтар Әуезов, Ілияс Жансүгіров, Мағжан Жұмабаев, etc.); literary terms (эпитет, теңеу, метафора, кейіпкер, композиция). Never invent quotes.',
  rus: 'Russian language and literature: Russian grammar terms, spelling rules with examples; literature — accurate authors and works.',
  eng: 'English as a foreign language: the TARGET language of examples/exercises is English (CEFR-appropriate for the grade: A1 for grades 1–4, A2 for 5–7, B1 for 8–9, B1+/B2 for 10–11); explanations in the output language; grammar patterns like "Subject + have/has + V3".',
  math: 'Primary/middle-school mathematics: concrete numbers, visual models (number line, fraction bars, area models); all computations must be exactly correct.',
  alg: 'Algebra: rigorous definitions, properties, step-by-step solutions, KaTeX for every expression; check each computation twice.',
  geom: 'Geometry: definitions, theorems with conditions, formulas for lengths/areas/volumes, units; describe figures precisely.',
  dunie: 'World studies (grades 1–4): nature, family, Kazakhstan (symbols, cities, traditions), safety; simple language.',
  zharat: 'Natural science (grades 1–6): observation, simple experiments, living/non-living, states of matter, Earth and space; correct science facts.',
  digital: 'Digital literacy (grades 1–4): computer parts, safe internet, simple algorithms.',
  inf: 'Computer science: algorithms, number systems (binary etc.), Python code (use `code` formatting), data, networks; code must be correct Python 3.',
  phys: 'Physics: SI units, laws with formula and meaning of each symbol, typical numeric problems with units; g = 9.8 m/s² (or 10 when stated).',
  chem: 'Chemistry: correct formulas and balanced equations (write with \\mathrm{}, e.g. $\\mathrm{2H_2+O_2\\to 2H_2O}$), periodic table facts, valence, moles ($n=m/M$).',
  bio: 'Biology: accurate terms (жасуша, ұлпа, мүше, фотосинтез, ген...), structures and functions, processes step by step.',
  geo: 'Geography: accurate facts about Kazakhstan and the world (areas, rivers, mountains, climate, population), maps and coordinates.',
  kzhist: 'History of Kazakhstan: accurate dates, rulers, events and sources as in Kazakhstan school textbooks (e.g. Қазақ хандығы 1465 ж., Керей мен Жәнібек; Тәуелсіздік 16 желтоқсан 1991). Never invent dates; if unsure, omit the date.',
  worldhist: 'World history: accurate dates, civilizations, causes and consequences.',
  law: 'Fundamentals of law: Constitution of the Republic of Kazakhstan, rights and duties, correct legal terms; age-appropriate examples.'
};
const SOCIAL = new Set(['kzhist', 'worldhist', 'law', 'kazadeb', 'adoqu']);
const LANGS_SUBJ = new Set(['kaztil', 'rus', 'eng', 'alippe']);
function gradeBand(g) { return g <= 2 ? 'very young children (6–8 y.o.): very short sentences, simple words, small numbers ≤ 20–100, playful tone, emojis ok' : g <= 4 ? 'primary school (9–10 y.o.): simple clear sentences, concrete examples from daily life' : g <= 6 ? 'grades 5–6 (11–12 y.o.): friendly, concrete, first abstractions' : g <= 9 ? 'grades 7–9 (13–15 y.o.): clear definitions + reasoning, real-life applications' : 'grades 10–11 (16–17 y.o.): rigorous, exam-oriented (ҰБТ/UNT), still engaging'; }
function lessonPrompt(topic, lang) {
  const subj = SUBJECTS[topic.subject];
  const siblings = topicsOf(topic.subject, topic.grade).filter(t => t.q === topic.q).map(t => '- ' + tTitle(t, lang)).join('\n');
  const stem = STEM.has(topic.subject);
  const sys = `You are a top methodologist-teacher in Kazakhstan (updated curriculum "жаңартылған білім беру мазмұны", textbooks of the Ministry of Enlightenment) and an educational game designer.
You write precise, factually correct, age-appropriate lessons. Accuracy is more important than creativity: never invent facts, dates, quotes or formulas.
${lang === 'kk' ? 'Write in correct literary Kazakh (Cyrillic) with standard school terminology; avoid word-by-word calques from Russian; no Russian words when a Kazakh term exists.' : ''}
You ALWAYS answer with ONE valid JSON object only (no markdown fences, no comments).`;
  const user = `Create an interactive game-based lesson.
Subject: ${subj.en} (${subj.kk}); Grade: ${topic.grade}; Quarter: ${topic.q}.
Topic: "${topic.kk}" / "${topic.ru}" / "${topic.en}".
Subject guidance: ${GUIDE[topic.subject] || ''}
Audience: ${gradeBand(topic.grade)}.
Other topics of the same quarter (context only, do not cover them):
${siblings}

OUTPUT LANGUAGE for ALL text values: ${LANG_NAME[lang]}${topic.subject === 'eng' ? ' (but English examples/sentences/words stay in English)' : ''}.
Notation: formulas in LaTeX inside $...$ (e.g. "$a^2+b^2=c^2$", "$\\\\frac{3}{4}$", chemistry "$\\\\mathrm{H_2O}$"). JSON escaping: EVERY backslash must be doubled in JSON strings. In "formulas[].tex" put pure LaTeX WITHOUT $.
${stem ? 'Include all key formulas/laws/definitions of the topic (2–6 formula cards), exact and standard.' : 'Humanities/language subject: "formulas" may hold key patterns/schemes as \\\\text{...} (e.g. "\\\\text{Subject + V2}") or be empty; the main rules go to "rules".'}

JSON schema (keys exactly):
{
 "title": string,
 "hook": string (2–3 sentences: an intriguing real-life question or mini-story),
 "goals": [2–4 strings],
 "theory": [{"h": string, "md": string}] (3–5 sections that build step by step: idea → definition/rule → how it works → common case; markdown **bold**, lists, LaTeX),
 "rules": [{"title": string, "text": string}] (2–5 key rules/definitions, exact wording),
 "formulas": [{"name": string, "tex": string, "note": string}],
 "examples": [{"q": string, "steps": [string], "a": string}] (3 worked examples, easy → harder, each step one action),
 "tips": [2–3 strings] (typical mistakes / memory tricks),
 "game": {"name": string, "story": string} (short quest theme, e.g. a journey across the Great Steppe),
 "exercises": exactly 10 items in this order of types: quiz, quiz, tf, fill, match, quiz, order, tf, fill, quiz:
   {"type":"quiz","q":string,"options":[4 strings],"answer":index 0-3,"explain":string}
   {"type":"tf","q":string (statement),"answer":true|false,"explain":string}
   {"type":"fill","q":string with "___" once,"answer":string (a number or 1–2 words),"alt":[accepted variants],"explain":string}
   {"type":"match","q":string,"pairs":[[left,right] x4] (unique),"explain":string}
   {"type":"order","q":string,"items":[4–5 strings in the CORRECT order],"explain":string},
 "sort": {"q": string, "buckets": [2–3 category names], "items": [[item text, bucket index] x6–8]} (categorize concepts of this topic),
 "cards": [[front, back] x6] (flashcards: term → definition / formula name → formula / word → translation),
 ${SOCIAL.has(topic.subject) ? '"timeline": [{"event": string, "year": number}] (4–6 real events of the topic with exact years, negative for BC; [] if not applicable),' : '"timeline": [],'}
 ${LANGS_SUBJ.has(topic.subject) ? '"sentences": [3–4 correct example sentences (5–9 words) that illustrate the rule, in the studied language],' : '"sentences": [],'}
 "steps": [{"q": string, "a": string}] (a 4-step guided "chain" problem: each step's answer is a number or 1 word, used by the next step),
 "defs": [{"term": string, "text": string}] (2–5 exact definitions of the key terms),
 "mistakes": [{"wrong": string, "right": string, "why": string}] (2–3 typical student mistakes),
 "summary": [3–5 short strings] (what to remember),
 "check": [{"q": string, "a": string}] (3–4 check-yourself questions with short answers),
 "reallife": string (1–2 sentences: where this is used in real life in Kazakhstan / everyday life),
 "compare": {"title": string, "cols": [2–4 column headers], "rows": [[cells, same length as cols] x3–6]} (comparison table of related concepts/cases/forms; first column = what is compared),
 "mindmap": {"center": string, "branches": [{"label": string, "items": [1–4 short strings]}] x3–6} (concept map of the topic),
 "diagram": {"type": "flow"|"cycle"|"tree"|"bars"|"numberline"|"venn"|"pie", "title": string, "items": [3–7 short strings, or {"label": string, "value": number} for bars/pie/numberline]} (one schematic illustration; venn: exactly 3 items = [left only, both, right only]),
 "slides": [{"title": string, "bullets": [2–5 short strings], "say": string (1–3 sentences the teacher/narrator says)}] x6–10 (a presentation of the lesson: hook → definitions → rules → example → mistakes → summary),
 "guided": {"problem": string, "steps": [{"q": string, "a": string (number or 1–3 words), "hint": string}] x3–5, "answer": string} (a problem the student solves step by step)
}
Exercise rules: exactly one correct answer; every fact/calculation double-checked; difficulty grows; options plausible; fill answers unambiguous and short; explanations teach WHY.`;
  return [{ role: 'system', content: sys }, { role: 'user', content: user }];
}
function practicePrompt(topic, lang, n, level, content) {
  const subj = SUBJECTS[topic.subject];
  const ctx = content ? `Lesson rules: ${(content.rules || []).map(r => (r.title ? r.title + ': ' : '') + r.text).join(' | ').slice(0, 1500)}\nFormulas: ${(content.formulas || []).map(f => f.name + ' $' + f.tex + '$').join('; ').slice(0, 800)}` : '';
  return [{ role: 'system', content: `You are an expert ${subj.en} teacher in Kazakhstan. You produce correct practice problems with verified answers. Answer with ONE JSON object only.` },
    { role: 'user', content: `Make ${n} NEW practice problems for grade ${topic.grade}, topic "${topic.kk}" / "${topic.en}" (${subj.en}). Difficulty: ${level || 'mixed (easy → hard)'}.
Guidance: ${GUIDE[topic.subject] || ''} Audience: ${gradeBand(topic.grade)}.
${ctx}
Language: ${LANG_NAME[lang]}. LaTeX in $...$ with doubled backslashes in JSON.
Schema: {"problems":[{"type":"quiz","q":string,"options":[4 strings],"answer":0-3,"explain":string} | {"type":"fill","q":string with ___,"answer":string,"alt":[...],"explain":string} | {"type":"tf","q":string,"answer":boolean,"explain":string}]}
Mix types (mostly quiz and fill). Solve each problem yourself before writing the answer; the explanation shows the solution briefly.` }];
}
function explainPrompt(topic, lang, ex, given, user) {
  const subj = SUBJECTS[topic.subject];
  const correct = ex.type === 'quiz' ? ex.options[ex.answer] : ex.type === 'tf' ? String(ex.answer) : ex.type === 'fill' ? ex.answer : ex.type === 'match' ? ex.pairs.map(p => p.join(' → ')).join('; ') : (ex.items || []).join(' → ');
  const g = ex.type === 'quiz' && given != null && ex.options[+given] !== undefined ? ex.options[+given] : Array.isArray(given) ? given.join(' | ') : String(given == null ? '(no answer / time out)' : given);
  return [{ role: 'system', content: `You are Bolat, a kind ${subj.en} tutor for a grade ${topic.grade} student in Kazakhstan. Explain mistakes clearly and briefly. Language: ${LANG_NAME[lang]}. Use LaTeX in $...$ for math. No JSON, just markdown.` },
    { role: 'user', content: `Topic: "${topic.kk}" / "${topic.en}".
Question: ${ex.q}
${ex.type === 'quiz' ? 'Options: ' + ex.options.join(' | ') : ''}
Student answered: ${g}
Correct answer: ${correct}
${ex.explain ? 'Teacher note: ' + ex.explain : ''}
Write: 1) why the student's answer is wrong (the likely misconception, 1–2 sentences, kind tone); 2) the correct reasoning step by step (2–4 short steps); 3) one tip to remember (1 sentence, can start with 💡). Max 120 words.` }];
}
/* ---------- JSON тексеру ---------- */
const str = (v, n = 4000) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, n).trim();
const parseJson = (t, o) => require('./ai').parseJson(t, o);
function normalizeLesson(raw, topic, lang) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const arr = (a, n) => (Array.isArray(a) ? a : []).slice(0, n);
  const out = {
    title: str(o.title, 200) || tTitle(topic, lang), hook: str(o.hook, 800),
    goals: arr(o.goals, 5).map(x => str(x, 300)).filter(Boolean),
    theory: arr(o.theory, 6).map(x => ({ h: str(x && x.h, 200), md: str(x && x.md, 3000) })).filter(x => x.md),
    rules: arr(o.rules, 8).map(x => ({ title: str(x && x.title, 200), text: str(x && x.text, 1500) })).filter(x => x.text || x.title),
    formulas: arr(o.formulas, 8).map(x => ({ name: str(x && x.name, 200), tex: str(x && x.tex, 600).replace(/^\$+|\$+$/g, ''), note: str(x && x.note, 400) })).filter(x => x.tex),
    examples: arr(o.examples, 4).map(x => ({ q: str(x && x.q, 1000), steps: arr(x && x.steps, 10).map(s => str(s, 800)).filter(Boolean), a: str(x && x.a, 400) })).filter(x => x.q),
    tips: arr(o.tips, 5).map(x => str(x, 400)).filter(Boolean),
    game: { name: str(o.game && o.game.name, 120), story: str(o.game && o.game.story, 600) },
    exercises: []
  };
  for (const e of arr(o.exercises, 14)) { const v = validEx(e); if (v) out.exercises.push(v); }
  const sort = o.sort && typeof o.sort === 'object' ? o.sort : null;
  if (sort) { const buckets = arr(sort.buckets, 4).map(x => str(x, 80)).filter(Boolean); const items = arr(sort.items, 10).map(it => Array.isArray(it) ? [str(it[0], 160), +it[1]] : null).filter(it => it && it[0] && it[1] >= 0 && it[1] < buckets.length);
    if (buckets.length >= 2 && items.length >= 4 && new Set(items.map(i => i[0])).size === items.length) out.sort = { q: str(sort.q, 300), buckets, items }; }
  const cards = arr(o.cards, 12).map(c => Array.isArray(c) ? [str(c[0], 200), str(c[1], 300)] : null).filter(c => c && c[0] && c[1]); if (cards.length >= 3) out.cards = cards;
  const tl = arr(o.timeline, 8).map(x => x && ({ event: str(x.event, 200), year: Math.round(+x.year) })).filter(x => x && x.event && Number.isFinite(x.year) && Math.abs(x.year) < 3000);
  if (tl.length >= 3 && new Set(tl.map(x => x.year)).size === tl.length) out.timeline = tl;
  const sents = arr(o.sentences, 5).map(x => str(x, 200)).filter(x => { const w = x.split(/\s+/).length; return w >= 3 && w <= 12; }); if (sents.length >= 2) out.sentences = sents;
  const steps = arr(o.steps, 6).map(x => x && ({ q: str(x.q, 500), a: str(x.a, 60) })).filter(x => x && x.q && x.a); if (steps.length >= 3) out.steps = steps;
  extendLesson(out, o);
  return out;
}
function validEx(e) {
  if (!e || typeof e !== 'object') return null;
  const q = str(e.q, 1200), explain = str(e.explain, 800);
  switch (e.type) {
    case 'quiz': { const options = (Array.isArray(e.options) ? e.options : []).map(x => str(x, 300)).filter(Boolean).slice(0, 5);
      const a = +e.answer; if (!q || options.length < 2 || !(a >= 0 && a < options.length) || new Set(options).size !== options.length) return null;
      return { type: 'quiz', q, options, answer: a, explain }; }
    case 'tf': { const a = e.answer === true || e.answer === 'true' ? true : e.answer === false || e.answer === 'false' ? false : null; if (!q || a === null) return null;
      return { type: 'tf', q, answer: a, explain }; }
    case 'fill': { const a = str(e.answer, 100); if (!q || !a) return null; const qq = q.includes('___') ? q : q + ' ___';
      return { type: 'fill', q: qq, answer: a, alt: (Array.isArray(e.alt) ? e.alt : []).map(x => str(x, 100)).filter(Boolean).slice(0, 6), explain }; }
    case 'match': { const pairs = (Array.isArray(e.pairs) ? e.pairs : []).filter(p => Array.isArray(p) && p.length >= 2).map(p => [str(p[0], 200), str(p[1], 200)]).filter(p => p[0] && p[1]).slice(0, 6);
      if (pairs.length < 3 || new Set(pairs.map(p => p[1])).size !== pairs.length || new Set(pairs.map(p => p[0])).size !== pairs.length) return null;
      return { type: 'match', q: q || '', pairs, explain }; }
    case 'order': { const items = (Array.isArray(e.items) ? e.items : []).map(x => str(x, 200)).filter(Boolean).slice(0, 6);
      if (items.length < 3 || new Set(items).size !== items.length) return null; return { type: 'order', q: q || '', items, explain }; }
  }
  return null;
}

/* v3.2: түсіндірудің жаңа формалары (анықтама, қателер, қорытынды, тексеру, салыстыру, ой картасы, сызба, слайдтар, қадамдап шешу) */
const DIAG = ['flow', 'cycle', 'tree', 'bars', 'numberline', 'venn', 'pie'];
function extendLesson(out, o) {
  const arr = (a, n) => (Array.isArray(a) ? a : []).slice(0, n);
  const defs = arr(o.defs, 8).map(x => x && ({ term: str(x.term, 120), text: str(x.text, 600) })).filter(x => x && x.term && x.text); if (defs.length) out.defs = defs;
  const mis = arr(o.mistakes, 5).map(x => x && ({ wrong: str(x.wrong, 300), right: str(x.right, 300), why: str(x.why, 400) })).filter(x => x && x.wrong && x.right); if (mis.length) out.mistakes = mis;
  const sm = arr(o.summary, 6).map(x => str(x, 300)).filter(Boolean); if (sm.length) out.summary = sm;
  const ch = arr(o.check, 6).map(x => x && ({ q: str(x.q, 400), a: str(x.a, 400) })).filter(x => x && x.q && x.a); if (ch.length) out.check = ch;
  const rl = str(o.reallife, 600); if (rl) out.reallife = rl;
  if (o.compare && typeof o.compare === 'object') { const cols = arr(o.compare.cols, 5).map(x => str(x, 80)).filter(Boolean);
    const rows = arr(o.compare.rows, 8).filter(Array.isArray).map(r => r.slice(0, cols.length).map(c => str(c, 240))).filter(r => r.length === cols.length && r.some(Boolean));
    if (cols.length >= 2 && rows.length >= 2) out.compare = { title: str(o.compare.title, 160), cols, rows }; }
  if (o.mindmap && typeof o.mindmap === 'object') { const br = arr(o.mindmap.branches, 7).map(b => b && ({ label: str(b.label, 60), items: arr(b.items, 5).map(x => str(x, 80)).filter(Boolean) })).filter(b => b && b.label);
    if (br.length >= 2) out.mindmap = { center: str(o.mindmap.center, 80) || out.title, branches: br }; }
  if (o.diagram && typeof o.diagram === 'object' && DIAG.includes(o.diagram.type)) { const d = o.diagram; const num = ['bars', 'pie', 'numberline'].includes(d.type);
    const items = arr(d.items, 8).map(x => typeof x === 'object' && x ? { label: str(x.label, 60), value: +x.value } : { label: str(x, 80) }).filter(x => x.label && (!num || Number.isFinite(x.value)));
    if (items.length >= (d.type === 'venn' ? 3 : 2)) out.diagram = { type: d.type, title: str(d.title, 120), items: d.type === 'venn' ? items.slice(0, 3) : items }; }
  const sl = arr(o.slides, 12).map(x => x && ({ title: str(x.title, 120), bullets: arr(x.bullets, 6).map(b => str(b, 240)).filter(Boolean), say: str(x.say, 600) })).filter(x => x && x.title && (x.bullets.length || x.say)); if (sl.length >= 3) out.slides = sl;
  if (o.guided && typeof o.guided === 'object') { const st = arr(o.guided.steps, 6).map(x => x && ({ q: str(x.q, 400), a: str(x.a, 80), hint: str(x.hint, 300) })).filter(x => x && x.q && x.a);
    if (st.length >= 2) out.guided = { problem: str(o.guided.problem, 800), steps: st, answer: str(o.guided.answer, 200) }; }
  return out;
}
/* ---------- офлайн үлгі ---------- */
const L = {
  kk: { hook: (t, s) => `Бүгін біз «${t}» тақырыбымен танысамыз. Бұл — ${s} пәнінің маңызды бөлігі. Дайынсың ба? Ойын басталды! 🚀`,
    goals: (t) => [`«${t}» тақырыбының негізгі ұғымдарын білу`, 'Ережелер мен формулаларды қолдана алу', 'Ойын-жаттығуларды орындап, өзін тексеру'],
    th1: 'Тақырыпқа кіріспе', th1md: (t, g) => `Бұл сабақ ${g}-сыныптың «${t}» тақырыбына арналған. Оқулықтағы анықтамаларды оқып, негізгі сөздердің астын сыз.\n\n- Жаңа ұғымдарды дәптерге жаз\n- Әр ережеге өз мысалыңды ойлап тап\n- Түсініксіз жер болса — **Болатқа** сұрақ қой, ол саған жетелеп көмектеседі`,
    th2: 'Қалай оқимыз?', th2md: 'Алдымен ережені оқы → мысалды қара → өзің шығарып көр → ойында тексер. Қателессең, түсініктемені оқы да қайтала — әр қате сені мықтырақ етеді! 💪',
    offline: 'AI қосылмаған кезде көрсетілетін үлгі сабақ. Толық сабақты AI жасап береді.',
    ruleT: 'Есте сақта', tip1: 'Асықпа: сұрақты соңына дейін оқы.', tip2: 'Жауапты тексеру — жақсы оқушының әдеті.', game: 'Ұлы Дала квесті', story: 'Сен — жас батырсың! Әр дұрыс жауап сені Ұлы Даланың келесі бекетіне жеткізеді.',
    which: (n) => `Қай формула — «${n}»?`, isF: (n, f) => `«${n}» формуласы: $${f}$`, matchF: 'Атауын формуласымен сәйкестендір', subjQ: (t) => `«${t}» тақырыбы қай пәнге жатады?`,
    gradeTf: (t, g) => `«${t}» тақырыбы ${g}-сыныпта оқытылады.`, orderQ: 'Тақырыптарды оқылу реті бойынша орналастыр', matchT: 'Тақырыпты пәнімен сәйкестендір', fillT: 'Тақырып атауын толықтыр: ',
    calc: 'Есепте:', cmp: 'Сандарды өсу ретімен орналастыр', matchC: 'Өрнекті мәнімен сәйкестендір', tfC: (e, v) => `$${e}=${v}$`, rightEx: 'Дұрыс жауап: ' },
  ru: { hook: (t, s) => `Сегодня мы разберём тему «${t}». Это важная часть предмета «${s}». Готов? Игра начинается! 🚀`,
    goals: (t) => [`Знать основные понятия темы «${t}»`, 'Уметь применять правила и формулы', 'Проверить себя в игровых заданиях'],
    th1: 'Введение в тему', th1md: (t, g) => `Этот урок посвящён теме «${t}» (${g} класс). Прочитай определения в учебнике и выдели ключевые слова.\n\n- Запиши новые понятия в тетрадь\n- Придумай свой пример к каждому правилу\n- Если что-то непонятно — спроси **Болата**, он подскажет наводящими вопросами`,
    th2: 'Как учиться?', th2md: 'Сначала прочитай правило → посмотри пример → попробуй сам → проверь себя в игре. Ошибся — прочитай пояснение и попробуй снова: каждая ошибка делает тебя сильнее! 💪',
    offline: 'Шаблонный урок (AI не подключён). Полный урок сгенерирует AI.',
    ruleT: 'Запомни', tip1: 'Не спеши: дочитай вопрос до конца.', tip2: 'Проверяй ответ — привычка отличника.', game: 'Квест Великой Степи', story: 'Ты — юный батыр! Каждый верный ответ ведёт тебя к следующей стоянке Великой Степи.',
    which: (n) => `Какая формула — «${n}»?`, isF: (n, f) => `«${n}»: $${f}$`, matchF: 'Сопоставь название и формулу', subjQ: (t) => `К какому предмету относится тема «${t}»?`,
    gradeTf: (t, g) => `Тема «${t}» изучается в ${g} классе.`, orderQ: 'Расположи темы в порядке изучения', matchT: 'Сопоставь тему и предмет', fillT: 'Дополни название темы: ',
    calc: 'Вычисли:', cmp: 'Расположи числа по возрастанию', matchC: 'Сопоставь выражение и значение', tfC: (e, v) => `$${e}=${v}$`, rightEx: 'Верный ответ: ' },
  en: { hook: (t, s) => `Today we explore "${t}", an important part of ${s}. Ready? The game begins! 🚀`,
    goals: (t) => [`Know the key ideas of "${t}"`, 'Apply the rules and formulas', 'Test yourself in the game'],
    th1: 'Introduction', th1md: (t, g) => `This lesson covers "${t}" (grade ${g}). Read the definitions in your textbook and underline key words.\n\n- Write new terms in your notebook\n- Invent your own example for each rule\n- Stuck? Ask **Bolat** — he guides you with hints and questions`,
    th2: 'How to learn', th2md: 'Read the rule → study the example → try it yourself → check yourself in the game. Made a mistake? Read the explanation and retry — every mistake makes you stronger! 💪',
    offline: 'Template lesson (AI offline). The full lesson will be generated by AI.',
    ruleT: 'Remember', tip1: 'Take your time: read the whole question.', tip2: 'Check your answer — a top student habit.', game: 'Great Steppe Quest', story: 'You are a young batyr! Each correct answer takes you to the next camp of the Great Steppe.',
    which: (n) => `Which formula is "${n}"?`, isF: (n, f) => `"${n}": $${f}$`, matchF: 'Match each name with its formula', subjQ: (t) => `Which subject does "${t}" belong to?`,
    gradeTf: (t, g) => `"${t}" is studied in grade ${g}.`, orderQ: 'Put the topics in the order they are studied', matchT: 'Match each topic with its subject', fillT: 'Complete the topic name: ',
    calc: 'Calculate:', cmp: 'Order the numbers from smallest to largest', matchC: 'Match each expression with its value', tfC: (e, v) => `$${e}=${v}$`, rightEx: 'Correct answer: ' }
};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function quizFrom(q, correct, wrongs, explain) { const opts = shuffle([correct, ...wrongs.filter(w => w !== correct).slice(0, 3)]); return { type: 'quiz', q, options: opts, answer: opts.indexOf(correct), explain }; }
function arithFor(grade) {
  // сыныпқа сай арифметикалық мысал: [өрнек(tex), мән]
  const g = grade;
  const ops = [];
  if (g <= 1) { ops.push(() => { const a = rnd(1, 9), b = rnd(1, 10 - a); return [`${a}+${b}`, a + b]; }, () => { const a = rnd(5, 18), b = rnd(1, Math.min(9, a)); return [`${a}-${b}`, a - b]; }); }
  else if (g === 2) { ops.push(() => { const a = rnd(11, 60), b = rnd(5, 39); return [`${a}+${b}`, a + b]; }, () => { const a = rnd(2, 9), b = rnd(2, 9); return [`${a}\\cdot ${b}`, a * b]; }, () => { const b = rnd(2, 9), q = rnd(2, 9); return [`${b * q}:${b}`, q]; }); }
  else if (g === 3) { ops.push(() => { const a = rnd(120, 700), b = rnd(40, 290); return [`${a}+${b}`, a + b]; }, () => { const a = rnd(12, 49), b = rnd(2, 9); return [`${a}\\cdot ${b}`, a * b]; }, () => { const b = rnd(3, 9), q = rnd(11, 40); return [`${b * q}:${b}`, q]; }); }
  else if (g === 4) { ops.push(() => { const a = rnd(1200, 9000), b = rnd(300, 3000); return [`${a}-${b}`, a - b]; }, () => { const a = rnd(21, 99), b = rnd(11, 30); return [`${a}\\cdot ${b}`, a * b]; }, () => { const b = rnd(12, 25), q = rnd(12, 40); return [`${b * q}:${b}`, q]; }); }
  else if (g === 5) { ops.push(() => { const a = rnd(2, 9), b = rnd(2, 9); return [`${a}^2+${b}`, a * a + b]; }, () => { const a = rnd(11, 40) / 10, b = rnd(11, 40) / 10; return [`${String(a).replace('.', '{,}')}+${String(b).replace('.', '{,}')}`, Math.round((a + b) * 10) / 10]; }, () => { const a = rnd(2, 9) * 10; return [`${a}\\%\\text{ от }200`, a * 2]; }); }
  else { ops.push(() => { const a = rnd(-15, -1), b = rnd(2, 15); return [`${a}+${b}`, a + b]; }, () => { const a = rnd(-9, -2), b = rnd(-9, 9); return [`(${a})\\cdot(${b})`, a * b]; }, () => { const x = rnd(-6, 9), k = rnd(2, 6), b = rnd(1, 12); return [`${k}x+${b}=${k * x + b},\\ x`, x]; }); }
  return ops[rnd(0, ops.length - 1)]();
}
const fmtNum = (v) => String(v).replace('.', ',');
function templateLesson(topic, lang) {
  const T = L[lang] || L.kk; const subj = SUBJECTS[topic.subject]; const title = tTitle(topic, lang); const sName = subj[lang] || subj.kk;
  const forms = formulasFor(topic, topic.subject);
  const content = {
    title, hook: T.hook(title, sName), goals: T.goals(title),
    theory: [{ h: T.th1, md: T.th1md(title, topic.grade) }, { h: T.th2, md: T.th2md }],
    rules: forms.length ? forms.slice(0, 3).map(f => ({ title: f.n[lang] || f.n.kk, text: `$${f.tex}$` })) : [{ title: T.ruleT, text: T.th2md }],
    formulas: forms.map(f => ({ name: f.n[lang] || f.n.kk, tex: f.tex, note: '' })),
    examples: [], tips: [T.tip1, T.tip2], game: { name: T.game, story: T.story }, exercises: [], offline: T.offline
  };
  const ex = content.exercises; const isMath = ['math', 'alg', 'geom'].includes(topic.subject);
  if (isMath && (topic.grade <= 6 || !forms.length)) {
    for (let k = 0; k < 2; k++) { const [e, v] = arithFor(topic.grade); ex.push(quizFrom(`${T.calc} $${e}$`, fmtNum(v), [fmtNum(v + 1), fmtNum(v - 1), fmtNum(v + 10), fmtNum(v * 2 === v ? v + 2 : v * 2)], T.rightEx + fmtNum(v))); }
    { const [e, v] = arithFor(topic.grade); const wrong = Math.random() < .5; ex.push({ type: 'tf', q: T.tfC(e, fmtNum(wrong ? v + rnd(1, 3) : v)), answer: !wrong, explain: T.rightEx + `$${e}=${fmtNum(v)}$` }); }
    { const [e, v] = arithFor(topic.grade); ex.push({ type: 'fill', q: `$${e}=$ ___`, answer: fmtNum(v), alt: [String(v)], explain: T.rightEx + fmtNum(v) }); }
    { const seen = new Set(), pairs = []; let guard = 0; while (pairs.length < 4 && guard++ < 50) { const [e, v] = arithFor(topic.grade); if (seen.has(v)) continue; seen.add(v); pairs.push([`$${e}$`, fmtNum(v)]); } ex.push({ type: 'match', q: T.matchC, pairs, explain: '' }); }
    { const [e, v] = arithFor(topic.grade); ex.push(quizFrom(`${T.calc} $${e}$`, fmtNum(v), [fmtNum(v + 2), fmtNum(v - 2), fmtNum(v + 5)], T.rightEx + fmtNum(v))); }
    { const base = topic.grade <= 1 ? 1 : topic.grade <= 2 ? 10 : topic.grade <= 4 ? 100 : -20; const span = topic.grade <= 1 ? 19 : topic.grade <= 4 ? 900 : 40;
      const nums = new Set(); while (nums.size < 5) nums.add(base + rnd(0, span)); ex.push({ type: 'order', q: T.cmp, items: [...nums].sort((a, b) => a - b).map(String), explain: '' }); }
  }
  if (forms.length) {
    const pool = poolFor(topic.subject); const others = shuffle(pool.filter(p => !forms.includes(p)));
    for (const f of forms.slice(0, 3)) ex.push(quizFrom(T.which(f.n[lang] || f.n.kk), `$${f.tex}$`, others.slice(0, 6).map(o => `$${o.tex}$`).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3), (f.n[lang] || f.n.kk) + ': $' + f.tex + '$'));
    const f = forms[0]; const wrong = others[0]; const lie = Math.random() < .5 && wrong;
    ex.push({ type: 'tf', q: T.isF(f.n[lang] || f.n.kk, lie ? wrong.tex : f.tex), answer: !lie, explain: T.rightEx + '$' + f.tex + '$' });
    const mp = [...forms, ...others].slice(0, 4); ex.push({ type: 'match', q: T.matchF, pairs: mp.map(p => [p.n[lang] || p.n.kk, `$${p.tex}$`]), explain: '' });
  }
  // каталогқа негізделген жаттығулар (кез келген пән)
  const list = topicsOf(topic.subject, topic.grade); const idx = list.findIndex(t => t.id === topic.id);
  const start = Math.max(0, Math.min(idx - 2, list.length - 4)); const win = list.slice(start, start + 4);
  if (win.length >= 3) ex.push({ type: 'order', q: T.orderQ, items: win.map(t => tTitle(t, lang)), explain: '' });
  const words = title.split(/\s+/).filter(w => w.replace(/[^\p{L}\p{N}]/gu, '').length >= 4);
  if (words.length >= 2) { const w = words[rnd(0, words.length - 1)]; const clean = w.replace(/[«»"(),.:;!?]/g, ''); ex.push({ type: 'fill', q: T.fillT + '«' + title.replace(w, w.replace(clean, '___')) + '»', answer: clean, alt: [], explain: T.rightEx + title }); }
  const otherSubj = shuffle(Object.keys(SUBJECTS).filter(s => s !== topic.subject && SUBJECTS[s].grades.includes(topic.grade)));
  ex.push(quizFrom(T.subjQ(title), sName, otherSubj.slice(0, 3).map(s => SUBJECTS[s][lang] || SUBJECTS[s].kk), T.rightEx + sName));
  { const lie = Math.random() < .5; const g = lie ? (topic.grade < 11 ? topic.grade + 1 : topic.grade - 1) : topic.grade; ex.push({ type: 'tf', q: T.gradeTf(title, g), answer: !lie, explain: T.rightEx + topic.grade }); }
  if (otherSubj.length >= 3) { const mp = [[title, sName]]; for (const s of otherSubj.slice(0, 3)) { const tl = topicsOf(s, topic.grade); if (tl.length) mp.push([tTitle(tl[rnd(0, tl.length - 1)], lang), SUBJECTS[s][lang] || SUBJECTS[s].kk]); }
    if (mp.length >= 3) ex.push({ type: 'match', q: T.matchT, pairs: mp, explain: '' }); }
  content.exercises = ex.map(validEx).filter(Boolean).slice(0, 10);
  require('./explain').enrich(content, topic, lang, forms);
  content.exercises = content.exercises.map(validEx).filter(Boolean).slice(0, 10);
  return content;
}

/* ---------- бағалау ---------- */
const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е').replace(/\$|\\,|\{,\}/g, (m) => m === '{,}' ? '.' : '').replace(/\s+/g, '').replace(/,/g, '.').replace(/[.;:!]+$/, '').replace(/^\+/, '');
function sameFill(given, ex) {
  const g = norm(given); if (!g) return false;
  for (const c of [ex.answer, ...(ex.alt || [])]) { const n = norm(c); if (g === n) return true;
    const a = parseFloat(g), b = parseFloat(n); if (/^-?\d+(\.\d+)?$/.test(g) && /^-?\d+(\.\d+)?$/.test(n) && Math.abs(a - b) < 1e-9) return true;
    const fr = (x) => { const m = /^(-?\d+)\/(\d+)$/.exec(x); return m ? (+m[1]) / (+m[2]) : null; };
    const fa = fr(g) ?? (isNaN(a) ? null : a), fb = fr(n) ?? (isNaN(b) ? null : b); if (fa !== null && fb !== null && /^[-\d./]+$/.test(g) && /^[-\d./]+$/.test(n) && Math.abs(fa - fb) < 1e-9) return true; }
  return false;
}
function gradeOne(ex, ans) {
  if (ans === undefined || ans === null) return 0;
  switch (ex.type) {
    case 'quiz': return +ans === ex.answer ? 1 : 0;
    case 'tf': return (ans === true || ans === 'true') === ex.answer && (ans === true || ans === false || ans === 'true' || ans === 'false') ? 1 : 0;
    case 'fill': return sameFill(ans, ex) ? 1 : 0;
    case 'match': { if (!Array.isArray(ans)) return 0; let ok = 0; ex.pairs.forEach((p, i) => { if (ans[i] === p[1]) ok++; }); return ok === ex.pairs.length ? 1 : Math.round(ok / ex.pairs.length * 2) / 4; }
    case 'order': { if (!Array.isArray(ans)) return 0; return ex.items.every((it, i) => ans[i] === it) ? 1 : 0; }
  }
  return 0;
}
const markOf = (p) => p >= 85 ? 5 : p >= 65 ? 4 : p >= 40 ? 3 : 2;
const starsOf = (p) => p >= 90 ? 3 : p >= 70 ? 2 : p >= 40 ? 1 : 0;
function grade(content, answers) {
  const exs = content.exercises || []; const per = exs.map((ex, i) => gradeOne(ex, (answers || [])[i]));
  const score = Math.round(per.reduce((a, b) => a + b, 0) * 100) / 100; const total = exs.length || 1;
  const percent = Math.round(score / total * 100);
  return { per, score, total, percent, mark: markOf(percent), stars: starsOf(percent) };
}
/* AI/мұғалім сабағына v3.2 өрістерін (мақсаттар, бөлім, қателер, тексеру...) шаблоннан толықтыру — бар өрістер өзгермейді */
function upgradeLesson(c, topic, lang) {
  const t = templateLesson(topic, lang); const out = { ...c, tv: 32 };
  for (const k of ['objectives', 'section', 'mistakes', 'summary', 'check', 'reallife', 'guided', 'diagram']) if (out[k] === undefined && t[k] !== undefined) out[k] = t[k];
  if (!out.defs && !(out.cards && out.cards.length) && t.defs) out.defs = t.defs;
  return out;
}
const hasSeed = (topic, lang) => !!require('./explain').seedFor(topic, lang);
module.exports = { upgradeLesson, hasSeed, extendLesson, lessonPrompt, practicePrompt, explainPrompt, GUIDE, gradeBand, parseJson, normalizeLesson, templateLesson, grade, markOf, starsOf, validEx };
