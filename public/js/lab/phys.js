/* Физика: маятник, көлбеу жазықтық, көкжиекке бұрыш жасай лақтыру, линза, электр тізбегі, толқындар */
import { THREE, tr, fmt, texNum, rad } from './core.js';
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const PL = { earth: 9.81, moon: 1.62, mars: 3.71, jupiter: 24.79 };
const PLN = { earth: { kk: 'Жер', ru: 'Земля', en: 'Earth' }, moon: { kk: 'Ай', ru: 'Луна', en: 'Moon' }, mars: { kk: 'Марс', ru: 'Марс', en: 'Mars' }, jupiter: { kk: 'Юпитер', ru: 'Юпитер', en: 'Jupiter' } };
const planetOpt = { k: 'planet', v: 'earth', label: { kk: 'Планета (g)', ru: 'Планета (g)', en: 'Planet (g)' }, items: Object.keys(PL).map(k => ({ v: k, label: PLN[k], icon: { earth: '🌍', moon: '🌙', mars: '🔴', jupiter: '🪐' }[k] })) };
const U = { m: { kk: 'м', ru: 'м', en: 'm' }, s: { kk: 'с', ru: 'с', en: 's' }, kg: { kk: 'кг', ru: 'кг', en: 'kg' }, ms: { kk: 'м/с', ru: 'м/с', en: 'm/s' }, deg: '°', N: { kk: 'Н', ru: 'Н', en: 'N' }, V: { kk: 'В', ru: 'В', en: 'V' }, Om: { kk: 'Ом', ru: 'Ом', en: 'Ω' }, A: { kk: 'А', ru: 'А', en: 'A' }, Hz: { kk: 'Гц', ru: 'Гц', en: 'Hz' }, cm: { kk: 'см', ru: 'см', en: 'cm' } };
const u = (k) => tr(U[k]);

export const labs = {
  pendulum: {
    stage: { cam: [0, 2.5, 9], target: [0, 2.2, 0] },
    options: [planetOpt],
    params: [{ k: 'L', v: 2, min: 0.3, max: 3.5, step: 0.05, label: { kk: 'Жіп ұзындығы l', ru: 'Длина нити l', en: 'Length l' }, unit: U.m },
      { k: 'A', v: 25, min: 3, max: 60, step: 1, label: { kk: 'Бастапқы бұрыш', ru: 'Начальный угол', en: 'Start angle' }, unit: '°' },
      { k: 'm', v: 1, min: 0.1, max: 5, step: 0.1, label: { kk: 'Жүк массасы m', ru: 'Масса груза m', en: 'Mass m' }, unit: U.kg }],
    toggles: [{ k: 'trail', v: true, icon: '✨', label: { kk: 'Із', ru: 'След', en: 'Trail' } }],
    buttons: [{ k: 'restart', icon: '↺', label: { kk: 'Қайта бастау', ru: 'Заново', en: 'Restart' }, pri: true }],
    setup(S, P) {
      const top = V3(0, 4.3, 0); const bar = S.mesh(new THREE.BoxGeometry(3, 0.12, 0.3), S.mat(0x8a86b8)); bar.position.copy(top);
      const str = S.line([top, top], 0xffffff); const bob = S.sphere(0.2, 0xffb020, null, S.root, { m: { metalness: 0.5, roughness: 0.25 } });
      const arc = S.line([[0, 0, 0]], 0x7c5cff, S.root, { dashed: true }); const trail = []; const trailL = S.line([[0, 0, 0]], 0x00e0c6, S.root, { opacity: 0.8 });
      let th = 0, w = 0, tm = 0, lastSign = 0, cross = [], meas = null; const g = () => PL[P.planet];
      const reset = () => { th = rad(P.A); w = 0; tm = 0; cross = []; meas = null; trail.length = 0; bob.scale.setScalar(0.7 + Math.cbrt(P.m) * 0.45);
        const pts = []; for (let i = -40; i <= 40; i++) { const a = rad(P.A) * i / 40; pts.push(V3(top.x + P.L * Math.sin(a), top.y - P.L * Math.cos(a), 0)); } S.setLine(arc, pts); };
      S.onTick((dt) => { const n = 8, h = dt / n; for (let i = 0; i < n; i++) { const acc = -g() / P.L * Math.sin(th); w += acc * h; th += w * h; } tm += dt;
        const sgn = Math.sign(th); if (lastSign && sgn && sgn !== lastSign) { cross.push(tm); if (cross.length >= 3) { meas = cross[cross.length - 1] - cross[cross.length - 3]; } } if (sgn) lastSign = sgn;
        const p = V3(top.x + P.L * Math.sin(th), top.y - P.L * Math.cos(th), 0); bob.position.copy(p); S.setLine(str, [top, p]);
        if (P.trail) { trail.push(p.clone()); if (trail.length > 90) trail.shift(); S.setLine(trailL, trail.length > 1 ? trail : [p, p]); } trailL.visible = P.trail; });
      const inst = { update(P2, k) { if (k !== 'trail') reset(); }, action(k) { if (k === 'restart') reset(); }, meas: () => meas };
      const iv = setInterval(() => { if (!S.el.isConnected) return clearInterval(iv); inst.refresh && inst.refresh(); }, 700);
      return inst;
    },
    formula(P) { const T = 2 * Math.PI * Math.sqrt(P.L / PL[P.planet]); return `T=2\\pi\\sqrt{\\dfrac{l}{g}}=2\\pi\\sqrt{\\dfrac{${texNum(P.L)}}{${texNum(PL[P.planet])}}}\\approx ${texNum(T)}\\,\\text{${u('s')}}`; },
    values(P, inst) { const T = 2 * Math.PI * Math.sqrt(P.L / PL[P.planet]); const m = inst.meas && inst.meas();
      return [[{ kk: 'Период T (формула)', ru: 'Период T (формула)', en: 'Period T (formula)' }, fmt(T) + ' ' + u('s')], [{ kk: 'Өлшенген период', ru: 'Измеренный период', en: 'Measured period' }, m ? fmt(m) + ' ' + u('s') : '…'],
        [{ kk: 'Жиілік ν = 1/T', ru: 'Частота ν = 1/T', en: 'Frequency ν = 1/T' }, fmt(1 / T, 3) + ' ' + u('Hz')], ['g', fmt(PL[P.planet]) + ' ' + u('ms') + '²']]; },
    info: { kk: '**Математикалық маятник** — жеңіл жіпке ілінген кішкентай жүк. Кіші бұрыштарда тербеліс периоды $T=2\\pi\\sqrt{l/g}$ тек **жіп ұзындығы** мен **еркін түсу үдеуіне** тәуелді — массаға тәуелді емес! Массаны өзгертіп тексер. Айда g кіші, сондықтан маятник баяу тербеледі. Үлкен бұрыштарда (>20°) нақты период формуладан сәл ұзағырақ болады.',
      ru: '**Математический маятник** — маленький груз на лёгкой нити. При малых углах период $T=2\\pi\\sqrt{l/g}$ зависит только от **длины нити** и **ускорения свободного падения** — не от массы! Измени массу и проверь. На Луне g меньше, поэтому маятник качается медленнее. При больших углах (>20°) реальный период чуть больше формулы.',
      en: 'A **simple pendulum** is a small mass on a light string. For small angles the period $T=2\\pi\\sqrt{l/g}$ depends only on the **length** and **gravity** — not on the mass! Change the mass and check. On the Moon g is smaller, so it swings slower. For large angles (>20°) the real period is slightly longer than the formula.' },
    tasks(P) { const T = 2 * Math.PI * Math.sqrt(P.L / PL[P.planet]); const sig = P.planet + Math.round(P.L * 100);
      return [{ key: 'T_' + sig, q: { kk: `l = ${fmt(P.L)} м, g = ${fmt(PL[P.planet])} м/с². Периодты тап (с).`, ru: `l = ${fmt(P.L)} м, g = ${fmt(PL[P.planet])} м/с². Найди период (с).`, en: `l = ${fmt(P.L)} m, g = ${fmt(PL[P.planet])} m/s². Find the period (s).` }, ans: T, tol: 0.03 },
        { key: 'nu_' + sig, q: { kk: 'Осы маятниктің жиілігі қандай (Гц)?', ru: 'Какова частота этого маятника (Гц)?', en: 'What is its frequency (Hz)?' }, ans: 1 / T, tol: 0.03 }]; }
  },
  incline: {
    stage: { cam: [1, 3.5, 10], target: [0, 1.5, 0] },
    params: [{ k: 'al', v: 30, min: 5, max: 60, step: 1, label: { kk: 'Көлбеу бұрышы α', ru: 'Угол наклона α', en: 'Angle α' }, unit: '°' },
      { k: 'm', v: 2, min: 0.5, max: 10, step: 0.5, label: { kk: 'Масса m', ru: 'Масса m', en: 'Mass m' }, unit: U.kg },
      { k: 'mu', v: 0.2, min: 0, max: 1, step: 0.01, label: { kk: 'Үйкеліс коэффициенті μ', ru: 'Коэффициент трения μ', en: 'Friction coefficient μ' } }],
    toggles: [{ k: 'comp', v: true, icon: '➗', label: { kk: 'mg құраушылары', ru: 'Составляющие mg', en: 'mg components' } }],
    buttons: [{ k: 'go', icon: '▶', label: { kk: 'Жіберу', ru: 'Отпустить', en: 'Release' }, pri: true }],
    setup(S, P) {
      const W = 6; const wedge = new THREE.Group(); S.root.add(wedge); const blk = new THREE.Group(); S.root.add(blk);
      const box = S.mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), S.mat(0x3ea6ff), blk); box.position.y = 0.3; S.edges(box);
      const aG = S.arrow(0xff5d73, S.root, 'mg'), aN = S.arrow(0x22d39a, S.root, 'N'), aF = S.arrow(0xffb020, S.root, 'F<sub>үйк</sub>'), a1 = S.arrow(0xff9fb0, S.root, 'mg·sinα'), a2 = S.arrow(0xff9fb0, S.root, 'mg·cosα');
      aF.lb.element.innerHTML = { kk: 'F<sub>үйк</sub>', ru: 'F<sub>тр</sub>', en: 'F<sub>fr</sub>' }[LANG];
      let s = 0, v = 0, moving = false;
      const build = () => { S.clear(wedge); const a = rad(P.al), H = W * Math.tan(a); const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(-W / 2, H)]);
        const g = new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false }); g.translate(0, 0, -0.8); const m = S.mesh(g, S.mat(0x7c5cff, { transparent: true, opacity: 0.85 }), wedge); S.edges(m);
        S.label('α', [W / 2 - 0.9, 0.22, 0.9], 'dim', wedge); s = 0.6; v = 0; moving = false; place(); };
      const place = () => { const a = rad(P.al), H = W * Math.tan(a), L = W / Math.cos(a); const d = Math.min(s, L - 0.5);
        const pos = V3(-W / 2 + d * Math.cos(a), H - d * Math.sin(a), 0); blk.position.copy(pos); blk.rotation.set(0, 0, -a);
        const c = pos.clone().add(V3(Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0)); const k = 0.12;
        const mg = P.m * 9.81; const N = mg * Math.cos(a); const down = V3(Math.cos(a), -Math.sin(a), 0), nrm = V3(Math.sin(a), Math.cos(a), 0);
        const Ff = Math.min(P.mu * N, mg * Math.sin(a) * (moving ? 10 : 1));
        const sc = 1.6 / Math.max(mg, 1e-6) * Math.max(1, Math.min(2.2, P.m / 2 + 0.6));
        aG.set(c, V3(0, -mg * sc, 0)); aN.set(c, nrm.clone().multiplyScalar(N * sc)); aF.set(c.clone().add(V3(0, 0, 0.5)), down.clone().multiplyScalar(-Math.min(P.mu * N, moving ? P.mu * N : mg * Math.sin(a)) * sc));
        a1.set(c.clone().add(V3(0, 0, -0.5)), down.clone().multiplyScalar(mg * Math.sin(a) * sc)); a2.set(c.clone().add(V3(0, 0, -0.5)), nrm.clone().multiplyScalar(-N * sc));
        a1.visible = a2.visible = P.comp; if (a1.lb) a1.lb.visible = a2.lb.visible = P.comp; if (s >= L - 0.5) moving = false; };
      S.onTick((dt) => { if (!moving) return; const a = rad(P.al); const acc = 9.81 * (Math.sin(a) - P.mu * Math.cos(a)); if (acc <= 0) { moving = false; return; } v += acc * dt * 0.6; s += v * dt * 0.6; place(); });
      return { update(P2, k) { if (k === 'comp') { place(); return; } build(); }, action(k) { if (k === 'go') { s = 0.6; v = 0; moving = true; } } };
    },
    formula(P) { const a = rad(P.al); const acc = 9.81 * (Math.sin(a) - P.mu * Math.cos(a)); return `a=g(\\sin\\alpha-\\mu\\cos\\alpha)=${acc > 0 ? texNum(acc) : '0'}\\,\\text{${u('ms')}}^2`; },
    values(P) { const a = rad(P.al), mg = P.m * 9.81, N = mg * Math.cos(a), F = P.mu * N, acc = 9.81 * (Math.sin(a) - P.mu * Math.cos(a));
      return [['mg', fmt(mg) + ' ' + u('N')], [{ kk: 'Тірек реакциясы N', ru: 'Сила реакции N', en: 'Normal force N' }, fmt(N) + ' ' + u('N')], [{ kk: 'Үйкеліс күші (макс.)', ru: 'Сила трения (макс.)', en: 'Friction (max)' }, fmt(F) + ' ' + u('N')],
        [{ kk: 'Үдеу a', ru: 'Ускорение a', en: 'Acceleration a' }, acc > 0 ? fmt(acc) + ' ' + u('ms') + '²' : tr({ kk: '0 — дене тыныштықта', ru: '0 — тело покоится', en: '0 — body stays at rest' })]]; },
    info: { kk: 'Көлбеу жазықтықтағы денеге үш күш әсер етеді: **ауырлық күші** $mg$, **тірек реакциясы** $N=mg\\cos\\alpha$ және **үйкеліс күші** $F=\\mu N$. Ньютонның II заңы бойынша $ma = mg\\sin\\alpha - \\mu mg\\cos\\alpha$. Егер $\\tan\\alpha \\le \\mu$ болса, дене сырғымайды. Үдеу **массаға тәуелді емес** екенін тексер!',
      ru: 'На тело на наклонной плоскости действуют три силы: **сила тяжести** $mg$, **сила реакции опоры** $N=mg\\cos\\alpha$ и **сила трения** $F=\\mu N$. По II закону Ньютона $ma = mg\\sin\\alpha - \\mu mg\\cos\\alpha$. Если $\\tan\\alpha \\le \\mu$, тело не скользит. Проверь, что ускорение **не зависит от массы**!',
      en: 'Three forces act on a body on an incline: **gravity** $mg$, the **normal force** $N=mg\\cos\\alpha$ and **friction** $F=\\mu N$. By Newton\'s 2nd law $ma = mg\\sin\\alpha - \\mu mg\\cos\\alpha$. If $\\tan\\alpha \\le \\mu$ the body does not slide. Check that the acceleration **does not depend on mass**!' },
    tasks(P) { const a = rad(P.al), N = P.m * 9.81 * Math.cos(a), acc = Math.max(0, 9.81 * (Math.sin(a) - P.mu * Math.cos(a))); const sig = P.al + '_' + P.m + '_' + Math.round(P.mu * 100);
      return [{ key: 'N_' + sig, q: { kk: `m = ${fmt(P.m)} кг, α = ${P.al}°. Тірек реакциясы N (Н)? (g = 9,81)`, ru: `m = ${fmt(P.m)} кг, α = ${P.al}°. Сила реакции N (Н)? (g = 9,81)`, en: `m = ${fmt(P.m)} kg, α = ${P.al}°. Normal force N (N)? (g = 9.81)` }, ans: N },
        { key: 'a_' + sig, q: { kk: `μ = ${fmt(P.mu)}. Дененің үдеуі қандай (м/с²)? Сырғымаса 0 жаз.`, ru: `μ = ${fmt(P.mu)}. Каково ускорение (м/с²)? Если не скользит — 0.`, en: `μ = ${fmt(P.mu)}. What is the acceleration (m/s²)? Write 0 if it does not slide.` }, ans: acc, abs: 0.05 }]; }
  },
  projectile: {
    stage: { cam: [4.5, 3, 12], target: [4.5, 2, 0] },
    options: [planetOpt],
    params: [{ k: 'v', v: 18, min: 3, max: 30, step: 0.5, label: { kk: 'Бастапқы жылдамдық v₀', ru: 'Начальная скорость v₀', en: 'Initial speed v₀' }, unit: U.ms },
      { k: 'al', v: 45, min: 5, max: 85, step: 1, label: { kk: 'Лақтыру бұрышы α', ru: 'Угол броска α', en: 'Launch angle α' }, unit: '°' }],
    buttons: [{ k: 'fire', icon: '🚀', label: { kk: 'Лақтыру', ru: 'Бросить', en: 'Launch' }, pri: true }],
    setup(S, P) {
      const sc = 0.12; const pred = S.line([[0, 0, 0]], 0xffffff, S.root, { dashed: true, opacity: 0.6 }); const trail = S.line([[0, 0, 0]], 0xffb020);
      const ball = S.sphere(0.15, 0xff6b9a); const cannon = S.mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.9, 20), S.mat(0x8a86b8)); const vArrow = S.arrow(0x00e0c6, S.root, 'v₀');
      const mk = new THREE.Group(); S.root.add(mk); let t = -1, pts = [];
      const g = () => PL[P.planet];
      const draw = () => { const a = rad(P.al), T = 2 * P.v * Math.sin(a) / g(); const p = []; for (let i = 0; i <= 80; i++) { const tt = T * i / 80; p.push(V3(P.v * Math.cos(a) * tt * sc, Math.max(0, (P.v * Math.sin(a) * tt - g() * tt * tt / 2) * sc), 0)); } S.setLine(pred, p);
        cannon.rotation.set(0, 0, a - Math.PI / 2); cannon.position.set(Math.cos(a) * 0.35, Math.sin(a) * 0.35, 0); vArrow.set(V3(0, 0, 0), V3(Math.cos(a), Math.sin(a), 0).multiplyScalar(1.3));
        S.clear(mk); const H = (P.v * Math.sin(a)) ** 2 / (2 * g()), L = P.v ** 2 * Math.sin(2 * a) / g();
        S.line([[L / 2 * sc, 0, 0], [L / 2 * sc, H * sc, 0]], 0x22d39a, mk, { dashed: true }); S.label('H = ' + fmt(H) + ' ' + u('m'), [L / 2 * sc, H * sc + 0.35, 0], 'dim', mk);
        S.label('L = ' + fmt(L) + ' ' + u('m'), [L * sc, -0.35, 0], 'dim', mk); S.sphere(0.06, 0x22d39a, [L * sc, 0, 0], mk);
        ball.position.set(0, 0, 0); t = -1; pts = []; S.setLine(trail, [V3(), V3()]); };
      S.onTick((dt) => { if (t < 0) return; t += dt; const a = rad(P.al), T = 2 * P.v * Math.sin(a) / g(); const tt = Math.min(t, T); const p = V3(P.v * Math.cos(a) * tt * sc, Math.max(0, (P.v * Math.sin(a) * tt - g() * tt * tt / 2) * sc), 0);
        ball.position.copy(p); pts.push(p); S.setLine(trail, pts.length > 1 ? pts : [p, p]); if (t >= T) t = -1; });
      return { update: draw, action(k) { if (k === 'fire') { t = 0; pts = []; } } };
    },
    formula(P) { const a = rad(P.al), g = PL[P.planet]; return `L=\\dfrac{v_0^2\\sin 2\\alpha}{g}=${texNum(P.v ** 2 * Math.sin(2 * a) / g)}\\,\\text{${u('m')}},\\quad H=\\dfrac{v_0^2\\sin^2\\alpha}{2g}`; },
    values(P) { const a = rad(P.al), g = PL[P.planet]; return [[{ kk: 'Ұшу қашықтығы L', ru: 'Дальность L', en: 'Range L' }, fmt(P.v ** 2 * Math.sin(2 * a) / g) + ' ' + u('m')], [{ kk: 'Максимал биіктік H', ru: 'Макс. высота H', en: 'Max height H' }, fmt((P.v * Math.sin(a)) ** 2 / (2 * g)) + ' ' + u('m')], [{ kk: 'Ұшу уақыты t', ru: 'Время полёта t', en: 'Flight time t' }, fmt(2 * P.v * Math.sin(a) / g) + ' ' + u('s')]]; },
    info: { kk: 'Көкжиекке бұрыш жасай лақтырылған дене **парабола** бойымен қозғалады: көлденеңінен бірқалыпты ($x=v_0\\cos\\alpha\\cdot t$), тігінен — еркін түсу үдеуімен ($y=v_0\\sin\\alpha\\cdot t-\\tfrac{gt^2}{2}$). Ең алыс ұшу **45°** бұрышта болады. 30° және 60° бұрыштарда қашықтық бірдей екенін тексер!',
      ru: 'Тело, брошенное под углом к горизонту, движется по **параболе**: по горизонтали равномерно ($x=v_0\\cos\\alpha\\cdot t$), по вертикали — с ускорением свободного падения ($y=v_0\\sin\\alpha\\cdot t-\\tfrac{gt^2}{2}$). Максимальная дальность — при **45°**. Проверь, что при 30° и 60° дальность одинакова!',
      en: 'A body launched at an angle follows a **parabola**: uniform motion horizontally ($x=v_0\\cos\\alpha\\cdot t$) and free fall vertically ($y=v_0\\sin\\alpha\\cdot t-\\tfrac{gt^2}{2}$). Maximum range is at **45°**. Check that 30° and 60° give the same range!' },
    tasks(P) { const a = rad(P.al), g = PL[P.planet]; const sig = P.planet + P.v * 10 + '_' + P.al;
      return [{ key: 'L_' + sig, q: { kk: `v₀ = ${fmt(P.v)} м/с, α = ${P.al}°, g = ${fmt(g)}. Ұшу қашықтығын тап (м).`, ru: `v₀ = ${fmt(P.v)} м/с, α = ${P.al}°, g = ${fmt(g)}. Найди дальность (м).`, en: `v₀ = ${fmt(P.v)} m/s, α = ${P.al}°, g = ${fmt(g)}. Find the range (m).` }, ans: P.v ** 2 * Math.sin(2 * a) / g },
        { key: 't_' + sig, q: { kk: 'Ұшу уақыты қанша (с)?', ru: 'Сколько длится полёт (с)?', en: 'How long is the flight (s)?' }, ans: 2 * P.v * Math.sin(a) / g }]; }
  },
  optics: {
    stage: { cam: [0, 0.5, 14], target: [0, 0, 0], grid: false },
    options: [{ k: 'lens', v: 'conv', label: { kk: 'Линза', ru: 'Линза', en: 'Lens' }, items: [{ v: 'conv', icon: '🔍', label: { kk: 'Жинағыш', ru: 'Собирающая', en: 'Converging' } }, { v: 'div', icon: '🔎', label: { kk: 'Шашыратқыш', ru: 'Рассеивающая', en: 'Diverging' } }] }],
    params: [{ k: 'F', v: 2, min: 1, max: 4, step: 0.1, label: { kk: 'Фокус аралығы F', ru: 'Фокусное расстояние F', en: 'Focal length F' }, unit: U.cm },
      { k: 'd', v: 5, min: 0.5, max: 9, step: 0.1, label: { kk: 'Заттан линзаға дейін d', ru: 'Расстояние до предмета d', en: 'Object distance d' }, unit: U.cm },
      { k: 'hh', v: 1.2, min: 0.4, max: 2, step: 0.1, label: { kk: 'Зат биіктігі h', ru: 'Высота предмета h', en: 'Object height h' }, unit: U.cm }],
    setup(S, P) {
      S.line([[-11, 0, 0], [11, 0, 0]], 0x8a86b8); const lensG = new THREE.Group(); S.root.add(lensG); const rays = new THREE.Group(); S.root.add(rays);
      const draw = () => { S.clear(lensG); S.clear(rays); const conv = P.lens === 'conv'; const F = conv ? P.F : -P.F;
        const lens = S.mesh(new THREE.SphereGeometry(1, 48, 24), S.mat(0x9fd8ff, { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1 }), lensG); lens.scale.set(conv ? 0.25 : 0.12, 2.6, 1);
        if (!conv) { S.line([[-0.25, 2.6, 0], [0, 2.3, 0], [0.25, 2.6, 0]], 0x9fd8ff, lensG); S.line([[-0.25, -2.6, 0], [0, -2.3, 0], [0.25, -2.6, 0]], 0x9fd8ff, lensG); }
        else { S.line([[-0.25, 2.35, 0], [0, 2.65, 0], [0.25, 2.35, 0]], 0x9fd8ff, lensG); S.line([[-0.25, -2.35, 0], [0, -2.65, 0], [0.25, -2.35, 0]], 0x9fd8ff, lensG); }
        [-1, 1, -2, 2].forEach(k => { S.sphere(0.07, 0xffd45e, [k * P.F, 0, 0], lensG); S.label(Math.abs(k) === 2 ? '2F' : 'F', [k * P.F, -0.35, 0], 'dim', lensG); });
        const d = P.d, h = P.hh; const obj = S.arrow(0x22d39a, rays, ''); obj.set(V3(-d, 0, 0), V3(0, h, 0), 0.25);
        const inf = Math.abs(d - F) < 1e-3; const f = inf ? Infinity : F * d / (d - F); const H = inf ? 0 : -h * f / d;
        const X = 11; const ray = (pts, dashed) => S.line(pts, 0xffb020, rays, { dashed, opacity: dashed ? 0.55 : 1 });
        // 1) оське параллель → F' арқылы
        ray([[-d, h, 0], [0, h, 0]]); const s1 = -h / F; ray([[0, h, 0], [X, h + s1 * X, 0]]); if (f < 0 || !conv) ray([[0, h, 0], [-X, h - s1 * X, 0]], true);
        // 2) оптикалық орталық арқылы
        const s2 = -h / d; ray([[-d, h, 0], [X, h + s2 * (X + d), 0]]);
        // 3) F арқылы → параллель (тек жинағышта d>F)
        if (conv && d > F + 0.05) { const y3 = h - h / (d - F) * d; ray([[-d, h, 0], [0, y3, 0]]); ray([[0, y3, 0], [X, y3, 0]]); }
        if (!inf && isFinite(f)) { const img = S.arrow(f > 0 ? 0xff6b9a : 0xff9fb0, rays, ''); img.set(V3(f, 0, 0), V3(0, H, 0), 0.25);
          if (f < 0) img.line.material = new THREE.LineDashedMaterial({ color: 0xff9fb0, dashSize: 0.15, gapSize: 0.1 }), img.line.computeLineDistances();
          S.label({ kk: 'кескін', ru: 'изображение', en: 'image' }[LANG], [f, H + (H > 0 ? 0.35 : -0.35), 0], 'dim', rays); }
        S.label({ kk: 'зат', ru: 'предмет', en: 'object' }[LANG], [-d, h + 0.35, 0], 'dim', rays); };
      return { update: draw };
    },
    formula(P) { const F = P.lens === 'conv' ? P.F : -P.F; return `\\dfrac{1}{F}=\\dfrac{1}{d}+\\dfrac{1}{f}\\;\\Rightarrow\\; f=\\dfrac{Fd}{d-F}=${Math.abs(P.d - F) < 1e-3 ? '\\infty' : texNum(F * P.d / (P.d - F))}\\,\\text{${u('cm')}}`; },
    values(P) { const F = P.lens === 'conv' ? P.F : -P.F; const f = F * P.d / (P.d - F); const G = Math.abs(f / P.d);
      const kind = !isFinite(f) || Math.abs(P.d - F) < 1e-3 ? { kk: 'кескін жоқ (шексіздікте)', ru: 'изображения нет (в бесконечности)', en: 'no image (at infinity)' } : f > 0 ? { kk: 'нақты, төңкерілген', ru: 'действительное, перевёрнутое', en: 'real, inverted' } : { kk: 'жалған, тура', ru: 'мнимое, прямое', en: 'virtual, upright' };
      return [[{ kk: 'Кескінге дейін f', ru: 'Расстояние до изображения f', en: 'Image distance f' }, isFinite(f) ? fmt(f) + ' ' + u('cm') : '∞'], [{ kk: 'Үлкейту Γ = |f|/d', ru: 'Увеличение Γ = |f|/d', en: 'Magnification Γ = |f|/d' }, isFinite(G) ? fmt(G) : '∞'],
        [{ kk: 'Кескін түрі', ru: 'Тип изображения', en: 'Image type' }, tr(kind) + (isFinite(G) ? (G > 1 ? tr({ kk: ', үлкейген', ru: ', увеличенное', en: ', enlarged' }) : tr({ kk: ', кішірейген', ru: ', уменьшенное', en: ', reduced' })) : '')], [{ kk: 'Оптикалық күш D', ru: 'Оптическая сила D', en: 'Optical power D' }, fmt(100 / F, 1) + ' ' + tr({ kk: 'дптр', ru: 'дптр', en: 'D' })]]; },
    info: { kk: 'Линзадағы кескінді үш «ерекше» сәулемен саламыз: 1) бас оптикалық оське **параллель** сәуле сынғаннан кейін **фокус** арқылы өтеді; 2) **оптикалық орталық** арқылы өткен сәуле бағытын өзгертпейді; 3) фокус арқылы өткен сәуле оське параллель шығады. **Жұқа линза формуласы**: $\\frac1F=\\frac1d+\\frac1f$. Затты F пен 2F арасына қойып көр — кескін үлкейеді!',
      ru: 'Изображение в линзе строим тремя «замечательными» лучами: 1) луч, **параллельный** главной оси, после преломления идёт через **фокус**; 2) луч через **оптический центр** не преломляется; 3) луч через фокус выходит параллельно оси. **Формула тонкой линзы**: $\\frac1F=\\frac1d+\\frac1f$. Поставь предмет между F и 2F — изображение увеличится!',
      en: 'We construct the image with three "special" rays: 1) a ray **parallel** to the axis refracts through the **focus**; 2) a ray through the **optical centre** goes straight; 3) a ray through the focus leaves parallel to the axis. **Thin lens equation**: $\\frac1F=\\frac1d+\\frac1f$. Put the object between F and 2F — the image becomes enlarged!' },
    tasks(P) { const F = P.lens === 'conv' ? P.F : -P.F; const f = F * P.d / (P.d - F); if (!isFinite(f) || Math.abs(P.d - F) < 0.05) return []; const sig = P.lens + Math.round(P.F * 10) + '_' + Math.round(P.d * 10);
      return [{ key: 'f_' + sig, q: { kk: `F = ${fmt(F)} см, d = ${fmt(P.d)} см. Кескінге дейінгі қашықтық f (см)? (жалған болса — минуспен)`, ru: `F = ${fmt(F)} см, d = ${fmt(P.d)} см. Расстояние до изображения f (см)? (мнимое — со знаком минус)`, en: `F = ${fmt(F)} cm, d = ${fmt(P.d)} cm. Image distance f (cm)? (negative if virtual)` }, ans: f, tol: 0.03 },
        { key: 'G_' + sig, q: { kk: 'Үлкейту Γ неге тең?', ru: 'Чему равно увеличение Γ?', en: 'What is the magnification Γ?' }, ans: Math.abs(f / P.d), tol: 0.03 }]; }
  },
  circuit: {
    stage: { cam: [0, 6, 8], target: [0, 0, 0] },
    options: [{ k: 'mode', v: 'series', label: { kk: 'Жалғау', ru: 'Соединение', en: 'Connection' }, items: [{ v: 'one', icon: '➖', label: { kk: 'Бір резистор', ru: 'Один резистор', en: 'One resistor' } }, { v: 'series', icon: '🔗', label: { kk: 'Тізбектей', ru: 'Последовательно', en: 'Series' } }, { v: 'parallel', icon: '🔀', label: { kk: 'Параллель', ru: 'Параллельно', en: 'Parallel' } }] }],
    params: [{ k: 'U', v: 12, min: 1, max: 24, step: 0.5, label: { kk: 'Кернеу U', ru: 'Напряжение U', en: 'Voltage U' }, unit: U.V },
      { k: 'R1', v: 4, min: 1, max: 50, step: 1, label: { kk: 'Кедергі R₁', ru: 'Сопротивление R₁', en: 'Resistance R₁' }, unit: U.Om },
      { k: 'R2', v: 8, min: 1, max: 50, step: 1, label: { kk: 'Кедергі R₂', ru: 'Сопротивление R₂', en: 'Resistance R₂' }, unit: U.Om, show: (P) => P.mode !== 'one' }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g); let paths = [], els = [], bulb = null, glow = null;
      const resistor = (x, z, rot, label) => { const r = S.mesh(new THREE.BoxGeometry(1.1, 0.35, 0.35), S.mat(0xe8d6a8), g); r.position.set(x, 0, z); r.rotation.y = rot;
        [-0.3, -0.1, 0.1, 0.3].forEach((o, i) => { const b = S.mesh(new THREE.BoxGeometry(0.07, 0.37, 0.37), S.basic([0xa0522d, 0x111111, 0xff2a2a, 0xd4af37][i]), r); b.position.x = o; }); S.label(label, [x, 0.55, z], 'dim', g); };
      const build = () => { S.clear(g); paths = []; els = [];
        const bat = S.mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 24), S.mat(0x3a3a4a), g); bat.rotation.z = Math.PI / 2; bat.position.set(0, 0, 2); const cap = S.mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 24), S.mat(0xffb020), g); cap.rotation.z = Math.PI / 2; cap.position.set(0.6, 0, 2); S.label('U = ' + fmt(P.U) + ' ' + u('V'), [0, 0.6, 2], 'dim', g);
        bulb = S.sphere(0.35, 0xfff1b0, [-3, 0.25, 0], g, { m: { emissive: 0xffd45e, emissiveIntensity: 0.3, transparent: true, opacity: 0.9 } }); glow = new THREE.PointLight(0xffd45e, 0, 6); glow.position.set(-3, 0.6, 0); g.add(glow);
        const outer = [[0.75, 0, 2], [3, 0, 2], [3, 0, -2], [-3, 0, -2], [-3, 0, 2], [-0.6, 0, 2]]; wireLine(outer); paths.push({ pts: outer, cur: () => I().I });
        if (P.mode === 'one') resistor(3, 0, Math.PI / 2, 'R₁');
        if (P.mode === 'series') { resistor(3, 0.4, Math.PI / 2, 'R₁'); resistor(0, -2, 0, 'R₂'); }
        if (P.mode === 'parallel') { resistor(3, 0, Math.PI / 2, 'R₁'); const br = [[3, 0, 1.2], [1.5, 0, 1.2], [1.5, 0, -1.2], [3, 0, -1.2]]; wireLine(br); resistor(1.5, 0, Math.PI / 2, 'R₂'); paths.push({ pts: br, cur: () => I().I2 }); }
        const amm = S.mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32), S.mat(0x222236), g); amm.position.set(-1.5, 0.1, -2); S.label('A', [-1.5, 0.3, -2], 'dim', g);
        // электрондар
        paths.forEach((p, pi) => { const L = pathLen(p.pts); const n = Math.round(L * 3); for (let i = 0; i < n; i++) { const e = S.sphere(0.06, 0x3ea6ff, null, g, { seg: 10 }); els.push({ e, p, s: (i / n) * L, L }); } });
        upd(); };
      const wireLine = (pts) => { for (let i = 0; i < pts.length - 1; i++) { const a = V3(...pts[i]), b = V3(...pts[i + 1]); const len = a.distanceTo(b); const c = S.mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 8), S.mat(0xd4a24c, { metalness: 0.7, roughness: 0.3 }), g); c.position.copy(a.clone().add(b).multiplyScalar(0.5)); c.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize()); } };
      const I = () => calcC(P);
      const upd = () => { const c = I(); const pw = Math.min(1, c.P / 40); bulb.material.emissiveIntensity = 0.2 + pw * 2.5; glow.intensity = pw * 6; };
      S.onTick((dt) => { els.forEach(o => { o.s = (o.s + dt * o.p.cur() * 0.6) % o.L; o.e.position.copy(pointAt(o.p.pts, o.s)); o.e.position.y = 0.08; }); });
      return { update(P2, k) { if (k === 'mode' || k === null) build(); else { build(); } } };
    },
    formula(P) { const c = calcC(P); const R = P.mode === 'one' ? 'R_1' : P.mode === 'series' ? 'R_1+R_2' : '\\dfrac{R_1R_2}{R_1+R_2}'; return `I=\\dfrac{U}{R},\\quad R=${R}=${texNum(c.R)}\\,\\Omega,\\quad I=${texNum(c.I)}\\,\\text{${u('A')}}`; },
    values(P) { const c = calcC(P); const out = [[{ kk: 'Жалпы кедергі R', ru: 'Общее сопротивление R', en: 'Total resistance R' }, fmt(c.R) + ' ' + u('Om')], [{ kk: 'Ток күші I', ru: 'Сила тока I', en: 'Current I' }, fmt(c.I, 3) + ' ' + u('A')], [{ kk: 'Қуат P = UI', ru: 'Мощность P = UI', en: 'Power P = UI' }, fmt(c.P) + ' ' + tr({ kk: 'Вт', ru: 'Вт', en: 'W' })]];
      if (P.mode === 'series') out.push(['U₁ / U₂', fmt(c.I * P.R1) + ' / ' + fmt(c.I * P.R2) + ' ' + u('V')]); if (P.mode === 'parallel') out.push(['I₁ / I₂', fmt(P.U / P.R1, 3) + ' / ' + fmt(P.U / P.R2, 3) + ' ' + u('A')]); return out; },
    info: { kk: '**Ом заңы**: тізбек бөлігіндегі ток күші кернеуге тура, кедергіге кері пропорционал: $I=\\frac{U}{R}$. **Тізбектей** жалғауда кедергілер қосылады ($R=R_1+R_2$), ток барлық жерде бірдей. **Параллель** жалғауда кернеу бірдей, ал $\\frac1R=\\frac1{R_1}+\\frac1{R_2}$ — жалпы кедергі ең кіші кедергіден де кіші. Көк шарлар — электрондар: ток күші артса, жылдамырақ қозғалады, шам жарқырайды.',
      ru: '**Закон Ома**: сила тока на участке цепи прямо пропорциональна напряжению и обратно пропорциональна сопротивлению: $I=\\frac{U}{R}$. При **последовательном** соединении сопротивления складываются ($R=R_1+R_2$), ток везде одинаков. При **параллельном** напряжение одинаково, а $\\frac1R=\\frac1{R_1}+\\frac1{R_2}$ — общее сопротивление меньше наименьшего. Синие шарики — электроны: чем больше ток, тем быстрее они движутся и ярче лампа.',
      en: '**Ohm\'s law**: the current is proportional to voltage and inversely proportional to resistance: $I=\\frac{U}{R}$. In **series** resistances add ($R=R_1+R_2$) and the current is the same everywhere. In **parallel** the voltage is the same and $\\frac1R=\\frac1{R_1}+\\frac1{R_2}$ — the total is smaller than the smallest resistor. Blue balls are electrons: more current — faster electrons and a brighter bulb.' },
    tasks(P) { const c = calcC(P); const sig = P.mode + P.U * 10 + '_' + P.R1 + '_' + P.R2;
      return [{ key: 'R_' + sig, q: { kk: 'Тізбектің жалпы кедергісін тап (Ом).', ru: 'Найди общее сопротивление цепи (Ом).', en: 'Find the total resistance (Ω).' }, ans: c.R },
        { key: 'I_' + sig, q: { kk: `U = ${fmt(P.U)} В. Ток күші I (А)?`, ru: `U = ${fmt(P.U)} В. Сила тока I (А)?`, en: `U = ${fmt(P.U)} V. Current I (A)?` }, ans: c.I }]; }
  },
  waves: {
    stage: { cam: [0, 5, 11], target: [0, 0, 0] },
    options: [{ k: 'kind', v: 'string', label: { kk: 'Толқын түрі', ru: 'Вид волны', en: 'Wave type' }, items: [{ v: 'string', icon: '〰️', label: { kk: 'Көлденең (жіп)', ru: 'Поперечная (шнур)', en: 'Transverse (string)' } }, { v: 'long', icon: '⫼', label: { kk: 'Бойлық', ru: 'Продольная', en: 'Longitudinal' } }, { v: 'water', icon: '🌊', label: { kk: 'Судағы толқын', ru: 'Волны на воде', en: 'Water ripples' } }] }],
    params: [{ k: 'A', v: 0.8, min: 0.1, max: 1.5, step: 0.05, label: { kk: 'Амплитуда A', ru: 'Амплитуда A', en: 'Amplitude A' }, unit: U.m },
      { k: 'lam', v: 3, min: 1, max: 8, step: 0.1, label: { kk: 'Толқын ұзындығы λ', ru: 'Длина волны λ', en: 'Wavelength λ' }, unit: U.m },
      { k: 'f', v: 0.6, min: 0.1, max: 2, step: 0.05, label: { kk: 'Жиілік ν', ru: 'Частота ν', en: 'Frequency ν' }, unit: U.Hz }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g); let balls = [], plane = null, marker = null, lamL = null;
      const build = () => { S.clear(g); balls = []; plane = null;
        if (P.kind === 'water') { const geo = new THREE.PlaneGeometry(14, 14, 120, 120); geo.rotateX(-Math.PI / 2); plane = S.mesh(geo, S.mat(0x3ea6ff, { roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }), g); plane.userData.base = geo.attributes.position.array.slice(); return; }
        const n = P.kind === 'long' ? 90 : 70; for (let i = 0; i < n; i++) { const x = -7 + 14 * i / (n - 1); const b = S.sphere(P.kind === 'long' ? 0.07 : 0.11, i === 20 ? 0xff6b9a : 0x00d1b2, [x, 0, 0], g, { seg: 12 }); b.userData.x = x; balls.push(b);
          if (P.kind === 'long') for (const z of [-0.5, 0.5]) { const b2 = S.sphere(0.07, 0x00d1b2, [x, 0, z], g, { seg: 10 }); b2.userData.x = x; balls.push(b2); } }
        lamL = S.line([[-6, -1.9, 0], [-6 + P.lam, -1.9, 0]], 0xffd45e, g); S.label('λ', [-6 + P.lam / 2, -2.2, 0], 'dim', g); };
      S.onTick((dt, t) => { const k = 2 * Math.PI / P.lam, w = 2 * Math.PI * P.f;
        if (plane) { const p = plane.geometry.attributes.position.array, b = plane.userData.base; for (let i = 0; i < p.length; i += 3) { const r = Math.hypot(b[i], b[i + 2]); p[i + 1] = P.A * Math.sin(k * r - w * t) / (1 + 0.25 * r); } plane.geometry.attributes.position.needsUpdate = true; plane.geometry.computeVertexNormals(); return; }
        balls.forEach(bl => { const x = bl.userData.x; if (P.kind === 'string') bl.position.y = P.A * Math.sin(k * x - w * t); else bl.position.x = x + P.A * 0.35 * Math.sin(k * x - w * t); }); });
      return { update: build };
    },
    formula(P) { return `v=\\lambda\\nu=${texNum(P.lam)}\\cdot${texNum(P.f)}=${texNum(P.lam * P.f)}\\,\\text{${u('ms')}},\\quad T=\\dfrac1\\nu`; },
    values(P) { return [[{ kk: 'Жылдамдық v', ru: 'Скорость v', en: 'Speed v' }, fmt(P.lam * P.f) + ' ' + u('ms')], [{ kk: 'Период T', ru: 'Период T', en: 'Period T' }, fmt(1 / P.f) + ' ' + u('s')], [{ kk: 'Толқындық сан k', ru: 'Волновое число k', en: 'Wave number k' }, fmt(2 * Math.PI / P.lam) + ' ' + tr({ kk: 'рад/м', ru: 'рад/м', en: 'rad/m' })]]; },
    info: { kk: '**Толқын** — тербелістің кеңістікте таралуы. **Көлденең** толқында бөлшектер толқын бағытына перпендикуляр, **бойлық** толқында — бойымен тербеледі (дыбыс — бойлық толқын). Қызғылт шарды бақыла: ол орнынан кетпейді, тек тербеледі — энергия тасымалданады, зат емес! Негізгі формула: $v=\\lambda\\nu$.',
      ru: '**Волна** — распространение колебаний в пространстве. В **поперечной** волне частицы колеблются перпендикулярно направлению волны, в **продольной** — вдоль (звук — продольная волна). Следи за розовым шариком: он не уходит, а только колеблется — переносится энергия, а не вещество! Главная формула: $v=\\lambda\\nu$.',
      en: 'A **wave** is an oscillation travelling through space. In a **transverse** wave particles move perpendicular to the direction of travel, in a **longitudinal** one — along it (sound is longitudinal). Watch the pink ball: it only oscillates in place — energy travels, not matter! Key formula: $v=\\lambda\\nu$.' },
    tasks(P) { const sig = Math.round(P.lam * 10) + '_' + Math.round(P.f * 100); return [{ key: 'v_' + sig, q: { kk: `λ = ${fmt(P.lam)} м, ν = ${fmt(P.f)} Гц. Толқын жылдамдығы (м/с)?`, ru: `λ = ${fmt(P.lam)} м, ν = ${fmt(P.f)} Гц. Скорость волны (м/с)?`, en: `λ = ${fmt(P.lam)} m, ν = ${fmt(P.f)} Hz. Wave speed (m/s)?` }, ans: P.lam * P.f },
      { key: 'T_' + sig, q: { kk: 'Тербеліс периоды T (с)?', ru: 'Период колебаний T (с)?', en: 'Oscillation period T (s)?' }, ans: 1 / P.f }]; }
  }
};
function calcC(P) { const R = P.mode === 'one' ? P.R1 : P.mode === 'series' ? P.R1 + P.R2 : P.R1 * P.R2 / (P.R1 + P.R2); const I = P.U / R; return { R, I, P: P.U * I, I2: P.mode === 'parallel' ? P.U / P.R2 : I }; }
function pathLen(pts) { let L = 0; for (let i = 0; i < pts.length - 1; i++) L += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][2] - pts[i][2]); return L; }
function pointAt(pts, s) { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; const l = Math.hypot(b[0] - a[0], b[2] - a[2]); if (s <= l) { const k = s / l; return new THREE.Vector3(a[0] + (b[0] - a[0]) * k, 0, a[2] + (b[2] - a[2]) * k); } s -= l; } const e = pts[pts.length - 1]; return new THREE.Vector3(e[0], 0, e[2]); }
