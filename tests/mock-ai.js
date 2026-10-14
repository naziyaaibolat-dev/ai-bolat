'use strict';
/* Mock OpenAI-compatible AI server for offline tests (no real key).
   /models → list; lesson prompt → streamed lesson JSON; practice/items → JSON; otherwise streamed Socratic reply. */
const http = require('http');
const REPLY = 'Жақсы бастама! 🙂 Теңдеудегі $2x + 3 = 11$ өрнегінде $x$-ті жалғыз қалдыру үшін алдымен қай санды басқа жаққа өткізу керек деп ойлайсың?';
const LESSON = {
  title: 'Сызықтық теңдеулер (AI)', hook: 'Таразыны теңестіріп көрейік! ⚖️', goals: ['Теңдеуді шешу', 'Тексеру'],
  theory: [{ h: 'Теңдеу деген не?', md: 'Теңдеу — айнымалысы бар теңдік. Мысалы, $2x+3=11$.' }, { h: 'Шешу жолы', md: 'Екі жағына бірдей амал қолданамыз: $2x=8$, $x=4$.' }],
  rules: [{ title: 'Тепе-теңдік', text: 'Теңдеудің екі жағына бірдей сан қосуға болады.' }], formulas: [{ name: 'Сызықтық теңдеу', tex: 'ax+b=0', note: '$x=-\\frac{b}{a}$' }],
  examples: [{ q: '$3x-6=9$', steps: ['$3x=15$', '$x=5$'], a: '$x=5$' }], tips: ['Жауапты тексер'], game: { name: 'Таразы', story: 'Таразыны теңестір!' },
  exercises: Array.from({ length: 10 }, (_, i) => ({ type: 'quiz', q: `$x+${i + 1}=${i + 6}$ болса, $x$=?`, options: ['5', String(i + 7), String(i + 2), '0'], answer: 0, explain: `$x=${i + 6}-${i + 1}=5$` })),
  sort: { q: 'Теңдеу ме, әлде өрнек пе?', buckets: ['Теңдеу', 'Өрнек'], items: [['$x+1=3$', 0], ['$2a+b$', 1], ['$5y=10$', 0], ['$3+4$', 1]] },
  cards: [['Теңдеу', 'Айнымалысы бар теңдік'], ['Түбір', 'Теңдеуді ақиқат ететін сан'], ['Коэффициент', 'Айнымалы алдындағы сан']],
  steps: [{ q: '$2x+3=11$: екі жағынан 3-ті ал. $2x$=?', a: '8' }, { q: '$2x=8$: екі жағын 2-ге бөл. $x$=?', a: '4' }, { q: 'Тексер: $2\\cdot4+3$=?', a: '11' }]
};
const ITEMS = { items: [
  { ty: 's', tp: 'Теңдеулер', q: '$2x+4=10$ теңдеуінің түбірі:', o: ['2', '3', '4', '5'], a: 1, sol: '$2x=6$, $x=3$.' },
  { ty: 's', tp: 'Теңдеулер', q: '$5x=35$ теңдеуінің түбірі:', o: ['5', '6', '7', '8'], a: 2, sol: '$x=7$.' },
  { ty: 'n', tp: 'Теңдеулер', q: '$x-9=12$ болса, $x$ неге тең?', a: '21', sol: '$x=21$.', hint: '9-ды оңға өткіз.' },
  { ty: 'm', tp: 'Теңдеулер', q: '$x^2=9$ теңдеуінің түбірлерін таңдаңыз.', o: ['3', '-3', '9', '0', '1', '-9'], a: [0, 1], sol: '$x=\\pm3$.' }
] };
const PRACTICE = { problems: [
  { type: 'quiz', q: '$3x=12$, $x$=?', options: ['3', '4', '5', '6'], answer: 1, explain: '$x=4$' },
  { type: 'fill', q: '$x+5=9$, $x$=___', answer: '4', explain: '$9-5=4$' },
  { type: 'tf', q: '$x=2$ — $x+2=4$ теңдеуінің түбірі.', answer: true, explain: '$2+2=4$' }
] };
function sse(res, text, ms = 15) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  const parts = text.match(/[\s\S]{1,40}/g); let i = 0;
  const t = setInterval(() => { if (i < parts.length) res.write('data: ' + JSON.stringify({ choices: [{ delta: { content: parts[i++] } }] }) + '\n\n'); else { res.write('data: [DONE]\n\n'); res.end(); clearInterval(t); } }, ms);
}
http.createServer((req, res) => {
  let b = ''; req.on('data', d => b += d); req.on('end', () => {
    let j = {}; try { j = JSON.parse(b); } catch (e) {}
    if (req.url.endsWith('/models')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ data: [{ id: 'models/mock-a' }, { id: 'models/mock-b' }] })); }
    const all = (j.messages || []).map(m => typeof m.content === 'string' ? m.content : '').join('\n');
    let body = null;
    if (/"exercises"/.test(all) && /lesson/i.test(all)) body = JSON.stringify(LESSON);
    else if (/test items/i.test(all)) body = JSON.stringify(ITEMS);
    else if (/practice problems/i.test(all)) body = JSON.stringify(PRACTICE);
    if (j.stream) return sse(res, body || REPLY, body ? 5 : 30);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: j.model, choices: [{ message: { role: 'assistant', content: body || REPLY } }] }));
  });
}).listen(+process.env.MOCK_PORT || 8799, () => console.log('mock ai up'));
