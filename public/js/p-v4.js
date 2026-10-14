'use strict';
/* ===== AI-bolat v4.0 — аналитика, мұғалім есептері, медиа слоттар, дауыс, офлайн, қолжетімділік ===== */
Object.assign(I18N, {
  n_stats: ['Прогресс', 'Прогресс', 'Progress'],
  v4_insights: ['Менің прогресім', 'Мой прогресс', 'My progress'],
  v4_activity: ['Белсенділік (12 апта)', 'Активность (12 недель)', 'Activity (12 weeks)'],
  v4_mastery: ['Пәндер бойынша меңгеру', 'Освоение по предметам', 'Mastery by subject'],
  v4_weak: ['Қайталау керек тақырыптар', 'Темы для повторения', 'Topics to review'],
  v4_trend: ['Соңғы нәтижелер', 'Последние результаты', 'Recent results'],
  v4_open_stats: ['Толық аналитика', 'Полная аналитика', 'Full analytics'],
  v4_games: ['ойын', 'игр', 'games'], v4_minutes: ['минут', 'минут', 'minutes'], v4_mastered: ['меңгерілді', 'освоено', 'mastered'],
  v4_active_days: ['белсенді күн', 'активных дней', 'active days'], v4_avg: ['орташа', 'средний', 'average'], v4_topics: ['тақырып', 'тем', 'topics'],
  v4_rank: ['Сыныптағы орның', 'Место в классе', 'Class rank'],
  v4_goal_set: ['Күнделікті мақсат', 'Дневная цель', 'Daily goal'], v4_save: ['Сақтау', 'Сохранить', 'Save'],
  v4_less: ['аз', 'мало', 'less'], v4_more: ['көп', 'много', 'more'],
  v4_review: ['Қайталау', 'Повторить', 'Review'], v4_none_weak: ['Әлсіз тақырып жоқ — керемет! 🎉', 'Слабых тем нет — отлично! 🎉', 'No weak topics — great! 🎉'],
  v4_report: ['Есеп', 'Отчёт', 'Report'], v4_report_t: ['Сынып есебі және автотексеру', 'Отчёт по классу и автопроверка', 'Class report & auto-grading'],
  v4_csv: ['CSV жүктеу', 'Скачать CSV', 'Download CSV'], v4_pdf: ['PDF / басып шығару', 'PDF / печать', 'PDF / print'],
  v4_students: ['Оқушылар', 'Ученики', 'Students'], v4_completion: ['Орындалуы', 'Выполнение', 'Completion'], v4_at_risk: ['Назар аудару керек', 'Требуют внимания', 'Need attention'],
  v4_upcoming: ['Жақын дедлайндар', 'Ближайшие дедлайны', 'Upcoming deadlines'], v4_submitted: ['Тапсырды', 'Сдали', 'Submitted'], v4_late: ['Кешікті', 'Опоздали', 'Late'],
  v4_missing: ['Тапсырмады', 'Не сдали', 'Missing'], v4_on_time: ['Уақытында', 'Вовремя', 'On time'], v4_hardest: ['Ең қиын сұрақтар', 'Самые трудные вопросы', 'Hardest questions'],
  v4_edit_due: ['Мерзімді өзгерту', 'Изменить срок', 'Edit deadline'], v4_due: ['Мерзімі', 'Срок', 'Due'], v4_points: ['Ұпай', 'Баллы', 'Points'], v4_allow_late: ['Кешіктіріп тапсыруға рұқсат', 'Разрешить сдачу с опозданием', 'Allow late submissions'],
  v4_overdue: ['Мерзімі өтті', 'Просрочено', 'Overdue'], v4_soon: ['Мерзімі жақын', 'Скоро срок', 'Due soon'], v4_done: ['Орындалды', 'Выполнено', 'Done'], v4_open: ['Ашық', 'Открыто', 'Open'],
  v4_hours_left: ['{n} сағ қалды', 'осталось {n} ч', '{n} h left'], v4_deadlines: ['Менің дедлайндарым', 'Мои дедлайны', 'My deadlines'],
  v4_ann_manage: ['Хабарландырулар', 'Объявления', 'Announcements'], v4_pin: ['Бекіту', 'Закрепить', 'Pin'], v4_unpin: ['Босату', 'Открепить', 'Unpin'], v4_delete: ['Өшіру', 'Удалить', 'Delete'], v4_pinned: ['Бекітілген', 'Закреплено', 'Pinned'],
  v4_media: ['Видео және медиа', 'Видео и медиа', 'Video & media'], v4_media_add: ['Видео қосу (YouTube, Vimeo, Google Slides, PhET)', 'Добавить видео (YouTube, Vimeo, Google Slides, PhET)', 'Add video (YouTube, Vimeo, Google Slides, PhET)'],
  v4_media_ph: ['https://youtu.be/…', 'https://youtu.be/…', 'https://youtu.be/…'], v4_media_title: ['Атауы (міндетті емес)', 'Название (необязательно)', 'Title (optional)'], v4_add: ['Қосу', 'Добавить', 'Add'],
  v4_media_bad: ['Сілтеме қолдау таппайды. YouTube, Vimeo, Google Slides немесе PhET сілтемесін қойыңыз.', 'Ссылка не поддерживается. Вставьте ссылку YouTube, Vimeo, Google Slides или PhET.', 'Unsupported link. Use YouTube, Vimeo, Google Slides or PhET.'],
  v4_play: ['Ойнату', 'Воспроизвести', 'Play'], v4_media_empty: ['Мұғалім бұл сабаққа видео қоса алады.', 'Учитель может добавить видео к этому уроку.', 'Your teacher can add a video to this lesson.'],
  v4_quick: ['Жылдам тексеру', 'Быстрая проверка', 'Quick check'], v4_quick_sub: ['3 сұрақ — түсінгеніңді тексер', '3 вопроса — проверь понимание', '3 questions — check your understanding'],
  v4_correct: ['Дұрыс! ✅', 'Верно! ✅', 'Correct! ✅'], v4_wrong: ['Қайта ойланып көр 🤔', 'Подумай ещё 🤔', 'Think again 🤔'], v4_true: ['Ақиқат', 'Верно', 'True'], v4_false: ['Жалған', 'Неверно', 'False'],
  v4_quick_done: ['{a}/{b} дұрыс. Ойынға дайынсың!', '{a}/{b} верно. Готов к игре!', '{a}/{b} correct. Ready for the game!'], v4_check: ['Тексеру', 'Проверить', 'Check'],
  v4_hint_lv: ['Көмек деңгейі', 'Уровень подсказки', 'Help level'], v4_hint1: ['💡 Ишара', '💡 Намёк', '💡 Nudge'], v4_hint2: ['📐 Ереже', '📐 Правило', '📐 Rule'], v4_hint3: ['🪜 Қадам', '🪜 Шаг', '🪜 Step'],
  v4_voice: ['Дауыспен жазу', 'Голосовой ввод', 'Voice input'], v4_listening: ['Тыңдап тұрмын…', 'Слушаю…', 'Listening…'],
  v4_offline: ['Интернет жоқ — сақталған сабақтар қолжетімді', 'Нет интернета — доступны сохранённые уроки', 'Offline — saved lessons are available'], v4_online: ['Интернет қайта қосылды', 'Интернет снова есть', 'Back online'],
  v4_skip: ['Негізгі мазмұнға өту', 'Перейти к содержимому', 'Skip to content'], v4_t_overview: ['Сыныптар шолуы', 'Обзор классов', 'Classes overview'],
  v4_week_results: ['Осы аптада {n} нәтиже, орташа {p}%', 'За неделю {n} результатов, средний {p}%', '{n} results this week, avg {p}%'],
  v4_no_risk: ['Барлығы жақсы оқып жүр 👍', 'Все занимаются хорошо 👍', 'Everyone is on track 👍'], v4_level: ['Деңгей', 'Уровень', 'Level'],
  v4_last_active: ['Соңғы белсенділік', 'Последняя активность', 'Last active'], v4_print_hint: ['Ашылған беттен «PDF ретінде сақтау» таңдаңыз', 'В открывшейся странице выберите «Сохранить как PDF»', 'Choose “Save as PDF” on the opened page'],
  v4_update: ['Жаңа нұсқа дайын', 'Доступна новая версия', 'New version available'], v4_reload: ['Жаңарту', 'Обновить', 'Reload']
});
const V4 = {};
/* ---------- жалпы көмекшілер ---------- */
V4.heatHtml = (heat) => { const mx = Math.max(10, ...heat.map(h => h.xp)); const lv = (x) => !x ? 0 : x < mx * .25 ? 1 : x < mx * .5 ? 2 : x < mx * .75 ? 3 : 4;
  const first = new Date(heat[0].day + 'T12:00').getDay(); const pad = (first + 6) % 7; const cells = Array(pad).fill(null).concat(heat);
  return `<div class="heat4" role="img" aria-label="${esc(T('v4_activity'))}">${cells.map(h => h ? `<i class="l${lv(h.xp)}" title="${h.day}: ${h.xp} XP"></i>` : '<i class="pad"></i>').join('')}</div>
    <div class="heatleg small muted">${T('v4_less')} <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> ${T('v4_more')}</div>`; };
V4.masteryHtml = (m) => m.length ? `<div class="mast4">${m.slice(0, 8).map(s => `<div class="mrow" style="--c:${s.color || 'var(--sky)'}"><span class="mi">${s.icon}</span><span class="grow"><span class="row between"><b>${esc(s.name[LANG] || s.name.kk)}</b><span class="small muted">${s.mastered}/${s.topics} · ${s.avg}%</span></span><span class="mbar"><i style="width:${s.avg}%"></i></span></span></div>`).join('')}</div>` : emptyHtml('📚', T('continue_empty'));
V4.trendHtml = (r) => { if (!r.length) return emptyHtml('🕹️', '—'); const W = 320, H = 90, n = r.length; const x = (i) => n === 1 ? W / 2 : 8 + i * (W - 16) / (n - 1), y = (p) => H - 8 - p / 100 * (H - 16);
  const pts = r.map((e, i) => `${x(i).toFixed(1)},${y(e.percent).toFixed(1)}`).join(' ');
  return `<svg class="trend4" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(T('v4_trend'))}"><defs><linearGradient id="tg4" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--sky)" stop-opacity=".45"/><stop offset="1" stop-color="var(--sky)" stop-opacity="0"/></linearGradient></defs>
    <line x1="0" x2="${W}" y1="${y(65)}" y2="${y(65)}" class="ref"/><polygon points="${x(0)},${H} ${pts} ${x(n - 1)},${H}" fill="url(#tg4)"/><polyline points="${pts}" class="ln"/>${r.map((e, i) => `<circle cx="${x(i)}" cy="${y(e.percent)}" r="3"><title>${e.percent}%</title></circle>`).join('')}</svg>`; };
V4.statTiles = (t) => `<div class="tiles4">${[['🕹️', t.games, 'v4_games'], ['⏱️', t.minutes, 'v4_minutes'], ['🏁', t.mastered + '/' + t.topics, 'v4_mastered'], ['📅', t.active_days, 'v4_active_days'], ['🎯', t.avg === null ? '—' : t.avg + '%', 'v4_avg']]
  .map(([i, v, k]) => `<div class="tile4"><span>${i}</span><b class="countup">${v}</b><small>${T(k)}</small></div>`).join('')}</div>`;
V4.weakHtml = (w) => w.length ? `<div class="stack">${w.map(x => `<a class="topic" href="#/lesson/${x.topic_id}"><span class="n">${x.best_percent}%</span><span class="t">${esc(tTitle(x.topic))}<br><span class="small muted">${T('grade')} ${x.topic.grade}</span></span><span class="btn sm">${T('v4_review')} →</span></a>`).join('')}</div>` : `<p class="muted">${T('v4_none_weak')}</p>`;
const STATUS4 = { overdue: ['🔴', 'v4_overdue'], soon: ['🟠', 'v4_soon'], open: ['🔵', 'v4_open'], late: ['🟡', 'v4_late'], done: ['🟢', 'v4_done'] };
V4.deadlineRow = (a) => `<a class="topic dl4 st-${a.status}" href="#/lesson/${a.topic_id}?a=${a.id}"><span class="n">${STATUS4[a.status][0]}</span><span class="t">${esc(a.title)}<br><span class="small muted">${esc(a.class_name || '')}${a.due_at ? ' · ' + T('v4_due') + ': ' + fmtDate(a.due_at, false) : ''}${a.hours_left !== null && a.hours_left > 0 && a.hours_left < 72 && !a.mark ? ' · ' + T('v4_hours_left', { n: a.hours_left }) : ''}</span></span><span class="tag">${T(STATUS4[a.status][1])}</span>${a.mark ? markHtml(a.mark) : ''}</a>`;

/* ---------- басты бет: v4 блоктары ---------- */
const _home = Routes[''];
route('', async (view, r) => {
  const out = await _home(view, r); const u = State.user; const page = $('.page', view); if (!page) return out;
  try {
    if (u.role === 'teacher') {
      const o = await api('GET', '/api/v4/teacher/overview'); if (!o.classes.length) return out;
      const html = `<section class="card ov4" aria-labelledby="ov4h"><div class="row between"><h2 id="ov4h">📊 ${T('v4_t_overview')}</h2><span class="small muted">${o.week.results ? T('v4_week_results', { n: o.week.results, p: o.week.avg }) : ''}</span></div>
        <div class="grid g2">${o.classes.slice(0, 4).map(c => `<div class="ovc"><div class="row between"><b>${esc(c.name)}</b><a class="btn sm pri" href="#/report/${c.id}">📊 ${T('v4_report')}</a></div>
          <div class="kpis4"><span><b>${c.summary.students}</b><small>${T('v4_students')}</small></span><span><b>${c.summary.completion === null ? '—' : c.summary.completion + '%'}</b><small>${T('v4_completion')}</small></span><span><b>${c.summary.avg === null ? '—' : c.summary.avg + '%'}</b><small>${T('v4_avg')}</small></span><span class="${c.summary.at_risk ? 'warn' : ''}"><b>${c.summary.at_risk}</b><small>${T('v4_at_risk')}</small></span></div>
          ${c.at_risk.length ? `<div class="small"><b>⚠️ ${T('v4_at_risk')}:</b> ${c.at_risk.map(s => `${esc(s.avatar || '🙂')} ${esc(s.name)}${s.avg !== null ? ` (${s.avg}%)` : ''}`).join(', ')}</div>` : `<div class="small muted">${T('v4_no_risk')}</div>`}
          ${c.upcoming.length ? `<div class="small" style="margin-top:6px"><b>⏰ ${T('v4_upcoming')}:</b> ${c.upcoming.map(a => `${esc(a.title)} — ${fmtDate(a.due_at, false)} (${a.submitted}/${a.of})`).join('; ')}</div>` : ''}</div>`).join('')}</div></section>`;
      const g4 = page.querySelector('.grid.g4'); (g4 || page.firstElementChild).insertAdjacentHTML('afterend', html);
    } else {
      const [a, as] = await Promise.all([api('GET', '/api/v4/analytics/me'), api('GET', '/api/v4/assignments')]);
      const urgent = as.assignments.filter(x => x.status === 'overdue' || x.status === 'soon');
      const html = `${urgent.length ? `<section class="card dl4box" aria-labelledby="dl4h"><h2 id="dl4h">⏰ ${T('v4_deadlines')}</h2><div class="stack">${urgent.slice(0, 4).map(V4.deadlineRow).join('')}</div></section>` : ''}
        <section class="card ins4" aria-labelledby="ins4h"><div class="row between"><h2 id="ins4h">📈 ${T('v4_insights')}</h2><a class="btn sm" href="#/stats">${T('v4_open_stats')} →</a></div>
        ${V4.statTiles(a.totals)}<div class="grid g2" style="margin-top:12px"><div><h3 class="small muted">${T('v4_activity')}</h3>${V4.heatHtml(a.heat)}</div><div><h3 class="small muted">${T('v4_mastery')}</h3>${V4.masteryHtml(a.mastery.slice(0, 4))}</div></div></section>`;
      const d2 = page.querySelector('.grid.dash2'); (d2 || page.firstElementChild).insertAdjacentHTML('afterend', html);
    }
    V4.countUp(page);
  } catch (e) { /* v4 блоктары міндетті емес */ }
  return out;
});
V4.countUp = (root) => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; $$('.countup', root).forEach(b => { const m = /^(\d+)(.*)$/.exec(b.textContent); if (!m || +m[1] < 2) return; const end = +m[1], rest = m[2]; const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / 700); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + rest; if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }); };

/* ---------- #/stats — толық аналитика ---------- */
route('stats', async (view) => {
  const u = State.user; const a = await api('GET', '/api/v4/analytics/me'); const lv = a.level; const pct = Math.min(100, Math.round((lv.xp - lv.base) / Math.max(1, lv.next - lv.base) * 100));
  const dd = await api('GET', '/api/dashboard');
  view.innerHTML = `<div class="page stack">
    <div class="hero"><div class="row" style="gap:24px;position:relative;z-index:1">${ringHtml(pct, `<div><span>${T('v4_level')}</span><b>${lv.level}</b><span>${lv.xp} XP</span></div>`)}
      <div class="grow"><h1>📈 ${T('v4_insights')}</h1><div class="row"><span class="chipxp ${a.streak ? 'fire' : ''}">🔥 ${a.streak} ${T('streak')}</span><span class="chipxp">🏆 ${a.best_streak}</span><span class="chipxp">🎯 ${T('to_next', { n: Math.max(0, lv.next - lv.xp) })}</span>
      ${a.ranks.map(r => `<span class="chipxp">🏫 ${esc(r.name)}: #${r.rank}/${r.of}</span>`).join('')}</div>
      <form class="row goal4" id="gf"><label for="gv" class="small">${T('v4_goal_set')}</label><input class="in" id="gv" type="number" min="10" max="500" step="10" value="${a.goal}" style="width:100px"><span class="small muted">XP</span><button class="btn sm">${T('v4_save')}</button></form></div></div></div>
    ${V4.statTiles(a.totals)}
    <div class="grid g2"><section class="card"><h2>📅 ${T('v4_activity')}</h2>${V4.heatHtml(a.heat)}</section><section class="card"><h2>📉 ${T('v4_trend')}</h2>${V4.trendHtml(a.recent)}<p class="small muted">— 65% = «4»</p></section></div>
    <div class="grid g2"><section class="card"><h2>🧠 ${T('v4_mastery')}</h2>${V4.masteryHtml(a.mastery)}</section><section class="card"><h2>🔁 ${T('v4_weak')}</h2>${V4.weakHtml(a.weak)}</section></div>
    ${u.role === 'student' ? badgesCard(dd, true) : ''}
    ${boardsCard(dd) || ''}
  </div>`;
  wireBoards(view); V4.countUp(view);
  $('#gf', view).onsubmit = async (e) => { e.preventDefault(); try { const r = await api('PATCH', '/api/v4/goal', { daily_goal: +$('#gv', view).value }); toast('✓ ' + T('v4_goal_set') + ': ' + r.goal + ' XP'); } catch (err) { toast('⚠️ ' + esc(err.message)); } };
});

/* ---------- #/report/:classId — мұғалім есебі ---------- */
route('report', async (view, r) => {
  const id = +r.args[0]; const R = await api('GET', `/api/v4/classes/${id}/report`); const anns = (await api('GET', `/api/v4/classes/${id}/announcements`)).announcements;
  const S = R.summary;
  const draw = () => {
    view.innerHTML = `<div class="page stack"><div class="crumbs"><a href="#/classes">🏫 ${T('n_classes')}</a> › <a href="#/class/${id}">${esc(R.class.name)}</a> › <span>${T('v4_report')}</span></div>
      <div class="row between"><h1>📊 ${T('v4_report_t')}</h1><div class="row"><a class="btn" href="/api/v4/classes/${id}/report?format=csv" download id="rcsv">⬇️ ${T('v4_csv')}</a><a class="btn pri" href="/api/v4/classes/${id}/report?format=html" target="_blank" rel="noopener" id="rpdf" title="${esc(T('v4_print_hint'))}">🖨 ${T('v4_pdf')}</a></div></div>
      <div class="tiles4">${[['👥', S.students, 'v4_students'], ['📌', S.assignments, 'assign_n'], ['✅', S.completion === null ? '—' : S.completion + '%', 'v4_completion'], ['🎯', S.avg === null ? '—' : S.avg + '%', 'v4_avg'], ['⚠️', S.at_risk, 'v4_at_risk']].map(([i, v, k]) => `<div class="tile4 ${k === 'v4_at_risk' && v ? 'warn' : ''}"><span>${i}</span><b>${v}</b><small>${T(k)}</small></div>`).join('')}</div>
      <section class="card"><h2>${T('t_assign')}</h2><div class="stack">${R.assignments.length ? R.assignments.map(a => { const tot = Math.max(1, a.submitted + a.missing);
        return `<div class="asg4 ${a.overdue ? 'over' : ''}"><div class="row between"><div><b>${esc(a.title)}</b> ${kindTag(a.kind)}<div class="small muted">${a.due_at ? '⏰ ' + T('v4_due') + ': ' + fmtDate(a.due_at, false) + (a.overdue ? ' · ' + T('v4_overdue') : '') : '—'}${a.points ? ' · ' + a.points + ' ' + T('v4_points') : ''}${a.allow_late === 0 ? ' · 🚫⏰' : ''}</div></div>
          <div class="row"><span class="big4">${a.avg === null ? '—' : a.avg + '%'}</span><button class="btn sm ghost" data-edit="${a.id}" aria-label="${esc(T('v4_edit_due'))}">✏️ ${T('v4_edit_due')}</button></div></div>
          <div class="stackbar" role="img" aria-label="${a.on_time} ${T('v4_on_time')}, ${a.late} ${T('v4_late')}, ${a.missing} ${T('v4_missing')}"><i class="ok" style="width:${a.on_time / tot * 100}%"></i><i class="late" style="width:${a.late / tot * 100}%"></i><i class="miss" style="width:${a.missing / tot * 100}%"></i></div>
          <div class="small row" style="gap:14px">🟢 ${T('v4_on_time')}: ${a.on_time} · 🟡 ${T('v4_late')}: ${a.late} · ⚪ ${T('v4_missing')}: ${a.missing} · <span>5:${a.dist[5]} 4:${a.dist[4]} 3:${a.dist[3]} 2:${a.dist[2]}</span>${a.hardest.length ? ` · <span>🧩 ${T('v4_hardest')}: ${a.hardest.map(h => `№${h.q} (${h.wrong_pct}%)`).join(', ')}</span>` : ''}</div></div>`; }).join('') : emptyHtml('📌', '—')}</div></section>
      <section class="card"><h2>👥 ${T('v4_students')}</h2><div class="tscroll"><table class="tbl rep4"><thead><tr><th>${T('name')}</th>${R.assignments.map((a, i) => `<th title="${esc(a.title)}">${i + 1}</th>`).join('')}<th>${T('v4_avg')}</th><th>${T('v4_last_active')}</th></tr></thead>
        <tbody>${R.students.map(s => `<tr class="${s.at_risk ? 'risk' : ''}"><td><span class="ava sm">${esc(s.student.avatar || '🙂')}</span> <b>${esc(s.student.name)}</b>${s.at_risk ? ' <span class="tag test">⚠️</span>' : ''}</td>${s.cells.map(x => `<td>${x ? markHtml(x.mark) + `<span class="small muted"> ${x.percent}%</span>${x.late ? ' ⏰' : ''}` : '<span class="muted">—</span>'}</td>`).join('')}<td><b>${s.avg === null ? '—' : s.avg + '%'}</b></td><td class="small">${s.last_active ? fmtDate(s.last_active) : '—'}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card"><h2>📢 ${T('v4_ann_manage')}</h2><div class="stack">${anns.length ? anns.map(x => `<div class="ann ${x.pinned ? 'pin4' : ''}"><div class="row between"><span class="small muted">${x.pinned ? '📌 ' + T('v4_pinned') + ' · ' : ''}${fmtDate(x.created_at)}</span><span class="row"><button class="btn sm ghost" data-pin="${x.id}" data-v="${x.pinned ? 0 : 1}">${x.pinned ? T('v4_unpin') : '📌 ' + T('v4_pin')}</button><button class="btn sm ghost" data-delann="${x.id}">🗑 ${T('v4_delete')}</button></span></div><div class="md">${mdToHtml(x.body)}</div></div>`).join('') : emptyHtml('📢', '—')}</div></section></div>`;
    $$('[data-edit]', view).forEach(b => b.onclick = () => editAsg(R.assignments.find(a => a.id === +b.dataset.edit)));
    $$('[data-pin]', view).forEach(b => b.onclick = async () => { await api('POST', `/api/v4/announcements/${b.dataset.pin}/pin`, { pinned: +b.dataset.v }); const x = anns.find(a => a.id === +b.dataset.pin); x.pinned = +b.dataset.v; anns.sort((p, q) => q.pinned - p.pinned || q.id - p.id); draw(); });
    $$('[data-delann]', view).forEach(b => b.onclick = async () => { if (!confirm(T('confirm_del'))) return; await api('DELETE', `/api/v4/announcements/${b.dataset.delann}`); anns.splice(anns.findIndex(a => a.id === +b.dataset.delann), 1); draw(); });
  };
  const editAsg = (a) => modal(`<h2>✏️ ${esc(a.title)}</h2><div class="field"><label class="f" for="ed4">${T('v4_due')}</label><input class="in" type="date" id="ed4" value="${a.due_at ? a.due_at.slice(0, 10) : ''}"></div>
    <div class="field"><label class="f" for="ep4">${T('v4_points')}</label><input class="in" type="number" min="0" max="1000" id="ep4" value="${a.points === null || a.points === undefined ? '' : a.points}"></div>
    <label class="row small"><input type="checkbox" id="el4" ${a.allow_late !== 0 ? 'checked' : ''}> ${T('v4_allow_late')}</label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="es4">${T('v4_save')}</button><button class="btn ghost" id="ec4">${T('cancel')}</button></div>`, (m, close) => {
    $('#ec4', m).onclick = close;
    $('#es4', m).onclick = async () => { try { const x = await api('PATCH', `/api/v4/assignments/${a.id}`, { due_at: $('#ed4', m).value || null, points: $('#ep4', m).value, allow_late: $('#el4', m).checked });
      Object.assign(a, { due_at: x.assignment.due_at, points: x.assignment.points, allow_late: x.assignment.allow_late }); close(); toast('✓'); draw(); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
  });
  draw();
});

/* ---------- сынып беті: есеп батырмасы; оқушылар: дедлайндар ---------- */
const _class = Routes['class'];
route('class', async (view, r) => { const out = await _class(view, r); if (State.user.role === 'teacher') { const h = $('.hero .row', view);
  if (h && !$('#rep4', view)) h.insertAdjacentHTML('beforeend', `<a class="btn pri" id="rep4" href="#/report/${+r.args[0]}">📊 ${T('v4_report')}</a>`); } return out; });
const _classes = Routes['classes'];
route('classes', async (view, r) => { const out = await _classes(view, r); if (State.user.role !== 'student') return out;
  try { const d = await api('GET', '/api/v4/assignments'); if (d.assignments.length) { const pg = $('.page', view); const h1 = pg && pg.querySelector('h1');
    h1 && h1.insertAdjacentHTML('afterend', `<section class="card dl4box"><h2>⏰ ${T('v4_deadlines')}</h2><div class="stack">${d.assignments.slice(0, 8).map(V4.deadlineRow).join('')}</div></section>`); } } catch (e) { /* */ }
  return out; });

/* ---------- сабақ: медиа слоты + жылдам тексеру ---------- */
V4.mediaCard = (holder, topicId, d) => {
  if (!d || (!d.media.length && !d.can_edit)) return;
  const box = document.createElement('section'); box.className = 'card media4'; box.setAttribute('aria-label', T('v4_media'));
  const paint = () => {
    box.innerHTML = `<div class="row between"><h3>🎬 ${T('v4_media')}</h3></div>
      ${d.media.length ? `<div class="mgrid4">${d.media.map(m => `<figure class="mslot" data-id="${m.id}"><button class="facade" data-src="${esc(m.url)}" aria-label="${esc(T('v4_play') + ': ' + (m.title || m.kind))}"><span class="pl">▶</span><span class="mk">${m.kind === 'youtube' ? 'YouTube' : m.kind === 'vimeo' ? 'Vimeo' : m.kind === 'slides' ? 'Slides' : 'PhET'}</span></button>${m.title ? `<figcaption>${esc(m.title)}</figcaption>` : ''}${d.can_edit && m.teacher_id === State.user.id ? `<button class="btn sm ghost mdel" data-del="${m.id}" aria-label="${esc(T('v4_delete'))}">🗑</button>` : ''}</figure>`).join('')}</div>` : `<p class="small muted">${T('v4_media_empty')}</p>`}
      ${d.can_edit ? `<form class="row madd" id="madd"><input class="in grow" id="murl" type="url" required placeholder="${esc(T('v4_media_ph'))}" aria-label="${esc(T('v4_media_add'))}"><input class="in" id="mttl" maxlength="120" placeholder="${esc(T('v4_media_title'))}" aria-label="${esc(T('v4_media_title'))}"><button class="btn pri">${T('v4_add')}</button></form><p class="small muted">${T('v4_media_add')}</p>` : ''}`;
    $$('.facade', box).forEach(b => b.onclick = () => { const f = document.createElement('iframe'); f.src = b.dataset.src + (b.dataset.src.includes('youtube') ? '?autoplay=1&rel=0' : ''); f.loading = 'lazy'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin'; f.title = b.getAttribute('aria-label'); b.replaceWith(f); });
    $$('[data-del]', box).forEach(b => b.onclick = async () => { if (!confirm(T('confirm_del'))) return; await api('DELETE', '/api/v4/media/' + b.dataset.del); d.media = d.media.filter(m => m.id !== +b.dataset.del); paint(); });
    const f = $('#madd', box); if (f) f.onsubmit = async (e) => { e.preventDefault(); try { const x = await api('POST', `/api/v4/lesson/${encodeURIComponent(topicId)}/media`, { url: $('#murl', box).value, title: $('#mttl', box).value }); d.media.push(x.media); paint(); toast('✓'); } catch (err) { toast('⚠️ ' + T('v4_media_bad')); } };
  };
  paint(); holder.insertAdjacentElement('beforebegin', box);
};
V4.quickCheck = (holder, content) => {
  const ex = ((content && content.exercises) || []).filter(e => e.type === 'quiz' || e.type === 'tf').slice(0, 3); if (ex.length < 2) return;
  const box = document.createElement('section'); box.className = 'card quick4'; let ok = 0, answered = 0;
  box.innerHTML = `<details><summary><b>⚡ ${T('v4_quick')}</b> <span class="small muted">· ${T('v4_quick_sub')}</span></summary><div class="stack" style="margin-top:10px">${ex.map((e, i) => `<div class="qq4" data-i="${i}"><div class="md"><b>${i + 1}.</b> ${mdToHtml(e.q)}</div><div class="row qopts">${(e.type === 'tf' ? [T('v4_true'), T('v4_false')] : e.options).map((o, k) => `<button class="btn sm qo" data-k="${k}">${mdToHtml(String(o)).replace(/^<p>|<\/p>$/g, '')}</button>`).join('')}</div><div class="small qfb" aria-live="polite"></div></div>`).join('')}<div class="qres small" aria-live="polite"></div></div></details>`;
  $$('.qq4', box).forEach(q => { const e = ex[+q.dataset.i]; $$('.qo', q).forEach(b => b.onclick = () => { if (q.dataset.done) return; q.dataset.done = 1; answered++;
    const right = e.type === 'tf' ? (+b.dataset.k === 0) === !!e.answer : +b.dataset.k === e.answer; if (right) ok++;
    b.classList.add(right ? 'good' : 'bad'); const rk = e.type === 'tf' ? (e.answer ? 0 : 1) : e.answer; $$('.qo', q)[rk].classList.add('good');
    $('.qfb', q).innerHTML = (right ? T('v4_correct') : T('v4_wrong')) + (e.explain ? ' — ' + mdToHtml(e.explain).replace(/^<p>|<\/p>$/g, '') : ''); renderMath(q); try { Sound.play(right ? 'ok' : 'bad'); } catch (x) { /* */ }
    if (answered === ex.length) $('.qres', box).innerHTML = `<b>${T('v4_quick_done', { a: ok, b: ex.length })}</b>`; }); });
  holder.insertAdjacentElement('afterend', box); renderMath(box);
};
const _lesson = Routes['lesson'];
route('lesson', async (view, r) => {
  const id = r.args[0]; const st = { media: null, content: null, busy: false };
  const inject = async () => {
    const tabs = $('.tabs', view); if (!tabs || $('.media4, .quick4', view) || st.busy) return; st.busy = true;
    try {
      if (!st.media) st.media = await api('GET', `/api/v4/lesson/${encodeURIComponent(id)}/media`).catch(() => ({ media: [], can_edit: false }));
      const d = await api('GET', `/api/lesson/${encodeURIComponent(id)}?lang=${LANG}`).catch(() => null);
      const t2 = $('.tabs', view); if (t2 && !$('.media4, .quick4', view)) { V4.mediaCard(t2, id, st.media); if (d) V4.quickCheck($('#tabBody', view) || t2, d.content); }
    } finally { st.busy = false; }
  };
  const mo = new MutationObserver(() => { if ($('.tabs', view) && !$('.media4, .quick4', view)) inject(); }); mo.observe(view, { childList: true, subtree: false });
  const cleanup = await _lesson(view, r); inject();
  return () => { mo.disconnect(); if (typeof cleanup === 'function') cleanup(); };
});

/* ---------- дауыспен енгізу (Web Speech API, бар болса) ---------- */
V4.voice = (btn, input) => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!btn || !SR) return; btn.hidden = false; let rec = null;
  btn.onclick = () => { if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' }[LANG] || 'kk-KZ'; rec.interimResults = true; rec.continuous = false; const base = input.value ? input.value + ' ' : '';
    rec.onresult = (e) => { let s = ''; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; input.value = base + s; input.dispatchEvent(new Event('input')); };
    rec.onend = () => { rec = null; btn.classList.remove('rec'); btn.setAttribute('aria-pressed', 'false'); }; rec.onerror = () => { toast('🎤 ⚠️'); };
    btn.classList.add('rec'); btn.setAttribute('aria-pressed', 'true'); toast('🎤 ' + T('v4_listening'), 1500); try { rec.start(); } catch (e) { rec = null; btn.classList.remove('rec'); } };
};

/* ---------- офлайн белгісі, Esc, «/» іздеу, скип-сілтеме, SW жаңарту ---------- */
(function a11y() {
  const net = () => { let b = document.getElementById('net4'); if (navigator.onLine) { if (b) { b.textContent = '✓ ' + T('v4_online'); b.classList.add('ok'); setTimeout(() => b.remove(), 2000); } return; }
    if (!b) { b = document.createElement('div'); b.id = 'net4'; b.setAttribute('role', 'status'); document.body.appendChild(b); } b.classList.remove('ok'); b.textContent = '📴 ' + T('v4_offline'); };
  addEventListener('online', net); addEventListener('offline', net); if (!navigator.onLine) setTimeout(net, 500);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { const m = document.querySelector('.modal-bg'); if (m) { m.remove(); return; } }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && !document.activeElement.isContentEditable) { const s = document.getElementById('gsearch'); if (s && s.offsetParent) { e.preventDefault(); s.focus(); } }
  });
  const skip = document.createElement('a'); skip.href = '#view'; skip.className = 'skip4'; skip.textContent = T('v4_skip'); skip.onclick = (e) => { e.preventDefault(); const v = document.getElementById('view'); if (v) { v.tabIndex = -1; v.focus(); } }; document.body.prepend(skip);
  /* иконка-батырмаларға aria-label */
  new MutationObserver(() => { $$('button.iconbtn:not([aria-label])').forEach(b => { if (b.title) b.setAttribute('aria-label', b.title); }); $$('img:not([alt])').forEach(i => i.setAttribute('alt', '')); })
    .observe(document.getElementById('app'), { childList: true, subtree: true });
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.type === 'sw-updated' && !document.getElementById('upd4')) {
    const d = document.createElement('div'); d.id = 'upd4'; d.setAttribute('role', 'status'); d.innerHTML = `✨ ${T('v4_update')} <button class="btn sm pri">${T('v4_reload')}</button>`; d.querySelector('button').onclick = () => location.reload(); document.body.appendChild(d); } });
})();
window.V4 = V4;
