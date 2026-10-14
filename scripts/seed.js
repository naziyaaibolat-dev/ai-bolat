'use strict';
/* Демо деректер: мұғалім, оқушылар, сынып, тапсырмалар. `npm run seed` — бос базаға қосады. */
const bcrypt = require('bcryptjs');
async function seed(db) {
  const now = () => new Date().toISOString();
  if (db.get('SELECT id FROM users WHERE phone = ?', ['+77000000001'])) return false;
  const h = bcrypt.hashSync('demo1234', 10);
  const T = db.run('INSERT INTO users(role, name, phone, pass_hash, grade, lang, avatar, is_demo) VALUES (?,?,?,?,?,?,?,1)', ['teacher', 'Айболат Математик', '+77000000001', h, null, 'kk', '🧑‍🏫']).id;
  const S = [['Әлия Серікқызы', '+77000000002', '🦊', 420, 5], ['Нұрсұлтан Бекұлы', '+77000000003', '🦅', 260, 3], ['Дана Асқарқызы', '+77000000004', '🐆', 150, 2], ['Арман Ерланұлы', '+77000000005', '🐺', 60, 1]]
    .map(([name, phone, av, xp, st]) => db.run('INSERT INTO users(role, name, phone, pass_hash, grade, lang, avatar, xp, streak, best_streak, is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,1)', ['student', name, phone, h, 7, 'kk', av, xp, st, st]).id);
  const cls = db.run('INSERT INTO classes(teacher_id, name, grade, subject, join_code) VALUES (?,?,?,?,?)', [T, '7 «А» сынып', 7, 'alg', 'AIBLT7']).id;
  for (const s of S) db.run('INSERT INTO class_members(class_id, student_id) VALUES (?,?)', [cls, s]);
  const a1 = db.run('INSERT INTO assignments(class_id, title, topic_id, kind, note, due_at, created_at) VALUES (?,?,?,?,?,?,?)', [cls, 'Бүтін көрсеткішті дәреже', 'alg-7-1', 'classwork', 'Сабақта ойнаймыз!', null, now()]).id;
  const a2 = db.run('INSERT INTO assignments(class_id, title, topic_id, kind, note, due_at, created_at) VALUES (?,?,?,?,?,?,?)', [cls, 'Қысқаша көбейту формулалары', 'alg-7-9', 'homework', 'Формулаларды жаттап, ойынды 3 жұлдызға өтіңдер ⭐', new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10), now()]).id;
  db.run('INSERT INTO assignments(class_id, title, topic_id, kind, note, due_at, created_at) VALUES (?,?,?,?,?,?,?)', [cls, 'Үшбұрыштардың теңдік белгілері', 'geom-7-8', 'test', '', new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), now()]);
  const res = (u, a, topic, p) => { const mark = p >= 85 ? 5 : p >= 65 ? 4 : p >= 40 ? 3 : 2; const stars = p >= 90 ? 3 : p >= 70 ? 2 : p >= 40 ? 1 : 0;
    db.run('INSERT INTO results(user_id, topic_id, assignment_id, lang, score, total, percent, mark, stars, xp, time_ms, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [u, topic, a, 'kk', p / 10, 10, p, mark, stars, p, 180000, now()]);
    db.run('INSERT OR REPLACE INTO progress(user_id, topic_id, best_percent, stars, attempts, last_at) VALUES (?,?,?,?,1,?)', [u, topic, p, stars, now()]); };
  res(S[0], a1, 'alg-7-1', 100); res(S[1], a1, 'alg-7-1', 80); res(S[2], a1, 'alg-7-1', 60); res(S[3], a1, 'alg-7-1', 30); res(S[0], a2, 'alg-7-9', 90);
  db.run('INSERT INTO announcements(class_id, teacher_id, body, created_at) VALUES (?,?,?,?)', [cls, T, 'Сәлеметсіздер ме, балалар! 👋 AI-bolat платформасына қош келдіңдер. Үй тапсырмасын жұмаға дейін орындаңдар. Сұрақтарың болса — маған жазыңдар немесе Болаттан көмек сұраңдар!', now()]);
  db.run("INSERT INTO messages(sender_id, recipient_id, body, kind, topic_id, created_at) VALUES (?,?,?,?,?,?)", [S[1], T, 'Ағай, (a+b)² формуласындағы 2ab қайдан шығады?', 'question', 'alg-7-9', now()]);
  db.run("INSERT INTO messages(sender_id, recipient_id, body, kind, created_at) VALUES (?,?,?,?,?)", [T, S[0], 'Әлия, керемет нәтиже! 3 жұлдыз 🌟 Жалғастыра бер!', 'msg', now()]);
  return true;
}
module.exports = { seed };
if (require.main === module) (async () => { const { DB } = require('../server/db'); const db = await DB.open(); console.log((await seed(db)) ? 'Демо деректер қосылды.' : 'Демо деректер бұрыннан бар.'); db.saveNow(); process.exit(0); })();
