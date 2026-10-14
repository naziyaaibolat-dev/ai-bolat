/* Математика: z = f(x, y) беттері және y = f(x) графиктері */
import { THREE, tr, fmt, texNum } from './core.js';
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const SURF = {
  para: { tex: 'z=a(x^2+y^2)', f: (x, y, a, b) => a * (x * x + y * y), name: { kk: 'Параболоид', ru: 'Параболоид', en: 'Paraboloid' } },
  saddle: { tex: 'z=a(x^2-y^2)', f: (x, y, a) => a * (x * x - y * y), name: { kk: 'Ер (гиперболалық параболоид)', ru: 'Седло (гиперболический параболоид)', en: 'Saddle' } },
  wave: { tex: 'z=a\\sin(bx)\\cos(by)', f: (x, y, a, b) => a * Math.sin(b * x) * Math.cos(b * y), name: { kk: 'Толқын', ru: 'Волна', en: 'Wave' } },
  ripple: { tex: 'z=a\\dfrac{\\sin(b\\,r)}{b\\,r},\\;r=\\sqrt{x^2+y^2}', f: (x, y, a, b) => { const r = Math.hypot(x, y) * b; return a * (r < 1e-6 ? 1 : Math.sin(r) / r); }, name: { kk: 'Ирек (тамшы)', ru: 'Рябь (капля)', en: 'Ripple' } },
  gauss: { tex: 'z=a\\,e^{-b(x^2+y^2)}', f: (x, y, a, b) => a * Math.exp(-b * (x * x + y * y)), name: { kk: 'Гаусс «төбесі»', ru: 'Гауссов «холм»', en: 'Gaussian hill' } },
  plane: { tex: 'z=ax+by', f: (x, y, a, b) => a * x + b * y, name: { kk: 'Жазықтық', ru: 'Плоскость', en: 'Plane' } }
};
const GR = {
  lin: { tex: (a, b, c) => `y=${texNum(a)}x${sg(b)}`, f: (x, a, b) => a * x + b, name: { kk: 'Сызықтық y=kx+b', ru: 'Линейная y=kx+b', en: 'Linear y=kx+b' }, lab: ['k', 'b'] },
  quad: { tex: (a, b, c) => `y=${texNum(a)}x^2${sg(b)}x${sg(c)}`, f: (x, a, b, c) => a * x * x + b * x + c, name: { kk: 'Квадраттық', ru: 'Квадратичная', en: 'Quadratic' }, lab: ['a', 'b', 'c'] },
  cubic: { tex: (a, b, c) => `y=${texNum(a)}x^3${sg(b)}x${sg(c)}`, f: (x, a, b, c) => a * x ** 3 + b * x + c, name: { kk: 'Кубтық', ru: 'Кубическая', en: 'Cubic' }, lab: ['a', 'b', 'c'] },
  hyp: { tex: (a, b, c) => `y=\\dfrac{${texNum(a)}}{x}${sg(c)}`, f: (x, a, b, c) => a / x + c, name: { kk: 'Гипербола y=k/x', ru: 'Гипербола y=k/x', en: 'Hyperbola y=k/x' }, lab: ['k', '', 'c'] },
  sin: { tex: (a, b, c) => `y=${texNum(a)}\\sin(${texNum(b)}x${sg(c)})`, f: (x, a, b, c) => a * Math.sin(b * x + c), name: { kk: 'Синусоида', ru: 'Синусоида', en: 'Sine' }, lab: ['A', 'ω', 'φ'] },
  abs: { tex: (a, b, c) => `y=${texNum(a)}|x${sg(b)}|${sg(c)}`, f: (x, a, b, c) => a * Math.abs(x + b) + c, name: { kk: 'Модуль', ru: 'Модуль', en: 'Absolute value' }, lab: ['a', 'b', 'c'] },
  sqrt: { tex: (a, b, c) => `y=${texNum(a)}\\sqrt{x${sg(b)}}${sg(c)}`, f: (x, a, b, c) => x + b >= 0 ? a * Math.sqrt(x + b) + c : NaN, name: { kk: 'Түбір', ru: 'Корень', en: 'Square root' }, lab: ['a', 'b', 'c'] },
  exp: { tex: (a, b, c) => `y=${texNum(a)}\\cdot 2^{${texNum(b)}x}${sg(c)}`, f: (x, a, b, c) => a * Math.pow(2, b * x) + c, name: { kk: 'Көрсеткіштік', ru: 'Показательная', en: 'Exponential' }, lab: ['a', 'b', 'c'] }
};
function sg(v) { if (Math.abs(v) < 1e-9) return ''; return (v > 0 ? '+' : '-') + texNum(Math.abs(v)); }
function heatColor(t) { const c = new THREE.Color(); c.setHSL(0.7 - 0.7 * Math.max(0, Math.min(1, t)), 0.85, 0.55); return c; }
function roots(f, a, b, c, lo = -10, hi = 10) { const out = []; const N = 4000; let px = lo, py = f(lo, a, b, c); for (let i = 1; i <= N; i++) { const x = lo + (hi - lo) * i / N, y = f(x, a, b, c); if (isFinite(py) && isFinite(y) && Math.abs(y - py) < 5) { if (py === 0) out.push(px); else if (py * y < 0) { let l = px, r = x; for (let k = 0; k < 50; k++) { const m = (l + r) / 2; if (f(l, a, b, c) * f(m, a, b, c) <= 0) r = m; else l = m; } out.push((l + r) / 2); } } px = x; py = y; }
  return out.filter((v, i) => i === 0 || Math.abs(v - out[i - 1]) > 1e-4).slice(0, 5); }

export const labs = {
  fsurface: {
    stage: { cam: [9, 8, 9], target: [0, 0, 0], grid: false },
    options: [{ k: 'fn', v: 'para', label: { kk: 'Функция', ru: 'Функция', en: 'Function' }, items: Object.keys(SURF).map(k => ({ v: k, label: SURF[k].name })) }],
    params: [{ k: 'a', v: 0.3, min: -1.5, max: 1.5, step: 0.05, label: 'a' }, { k: 'b', v: 1, min: 0.1, max: 3, step: 0.05, label: 'b', show: (P) => P.fn !== 'para' && P.fn !== 'saddle' },
      { k: 'x0', v: 1, min: -4, max: 4, step: 0.5, label: 'x₀' }, { k: 'y0', v: 1, min: -4, max: 4, step: 0.5, label: 'y₀' }],
    toggles: [{ k: 'wire', v: false, icon: '🕸️', label: { kk: 'Тор', ru: 'Сетка', en: 'Wireframe' } }],
    setup(S, P) {
      const N = 90, L = 5; const geo = new THREE.PlaneGeometry(2 * L, 2 * L, N, N); geo.rotateX(-Math.PI / 2); const col = new Float32Array(geo.attributes.position.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const mesh = S.mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.05 }));
      const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })); S.root.add(wire);
      const ax = (a, b, c, t) => { S.line([a, b], c); S.label(t, b, 'dim'); }; ax([-6, 0, 0], [6.3, 0, 0], 0xff6b9a, 'x'); ax([0, 0, 6], [0, 0, -6.3], 0x22d39a, 'y'); ax([0, -4, 0], [0, 5, 0], 0x3ea6ff, 'z');
      const g = new THREE.GridHelper(10, 10, 0x7c5cff, 0x3a3570); g.material.transparent = true; g.material.opacity = 0.3; S.root.add(g);
      const pt = S.sphere(0.12, 0xffffff, null, S.root, { m: { emissive: 0xffffff, emissiveIntensity: 0.6 } }); const stem = S.line([[0, 0, 0], [0, 1, 0]], 0xffffff, S.root, { dashed: true }); const ptL = S.label('', [0, 0, 0], 'dim');
      const inst = { z0: 0, update() { const s = SURF[P.fn]; const p = geo.attributes.position.array; let mn = Infinity, mx = -Infinity; const zs = [];
        for (let i = 0; i < p.length; i += 3) { const x = p[i], y = -p[i + 2]; let z = s.f(x, y, P.a, P.b); z = Math.max(-6, Math.min(6, z)); p[i + 1] = z; zs.push(z); mn = Math.min(mn, z); mx = Math.max(mx, z); }
        zs.forEach((z, i) => { const c = heatColor((z - mn) / (mx - mn || 1)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; });
        geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals(); wire.geometry.dispose(); wire.geometry = new THREE.WireframeGeometry(geo); wire.visible = P.wire;
        const z0 = s.f(P.x0, P.y0, P.a, P.b); inst.z0 = z0; pt.position.set(P.x0, z0, -P.y0); S.setLine(stem, [[P.x0, 0, -P.y0], [P.x0, z0, -P.y0]]); ptL.position.set(P.x0, z0 + 0.45, -P.y0); ptL.element.textContent = `(${fmt(P.x0)}; ${fmt(P.y0)}; ${fmt(z0)})`; } };
      return inst;
    },
    formula(P) { return SURF[P.fn].tex + `,\\quad f(${texNum(P.x0)};${texNum(P.y0)})=${texNum(SURF[P.fn].f(P.x0, P.y0, P.a, P.b))}`; },
    values(P) { const s = SURF[P.fn]; return [[{ kk: 'Бет', ru: 'Поверхность', en: 'Surface' }, tr(s.name)], ['z(x₀, y₀)', fmt(s.f(P.x0, P.y0, P.a, P.b), 3)], [{ kk: 'Нүкте', ru: 'Точка', en: 'Point' }, `(${fmt(P.x0)}; ${fmt(P.y0)})`]]; },
    info: { kk: 'Екі айнымалының функциясы $z=f(x,y)$ кеңістікте **бет** береді: жазықтықтағы әр $(x;y)$ нүктесіне биіктік $z$ сәйкес келеді. Түс — биіктік (көк — төмен, қызыл — жоғары). $a$ параметрі бетті «созады» немесе аударады ($a<0$). Ақ нүкте — $(x_0;y_0)$ нүктесіндегі мән.',
      ru: 'Функция двух переменных $z=f(x,y)$ задаёт в пространстве **поверхность**: каждой точке $(x;y)$ плоскости соответствует высота $z$. Цвет — высота (синий — низко, красный — высоко). Параметр $a$ «растягивает» или переворачивает поверхность ($a<0$). Белая точка — значение в точке $(x_0;y_0)$.',
      en: 'A function of two variables $z=f(x,y)$ defines a **surface**: every point $(x;y)$ of the plane gets a height $z$. Colour shows height (blue low, red high). Parameter $a$ stretches or flips the surface ($a<0$). The white point shows the value at $(x_0;y_0)$.' },
    tasks(P) { const s = SURF[P.fn]; const z = s.f(P.x0, P.y0, P.a, P.b); return [{ key: P.fn + '_' + [P.a, P.b, P.x0, P.y0].map(v => Math.round(v * 100)).join('_'), q: { kk: `$${s.tex}$, мұнда a = ${fmt(P.a)}${P.fn !== 'para' && P.fn !== 'saddle' ? ', b = ' + fmt(P.b) : ''}. f(${fmt(P.x0)}; ${fmt(P.y0)}) мәнін есепте.`, ru: `$${s.tex}$, где a = ${fmt(P.a)}${P.fn !== 'para' && P.fn !== 'saddle' ? ', b = ' + fmt(P.b) : ''}. Вычисли f(${fmt(P.x0)}; ${fmt(P.y0)}).`, en: `$${s.tex}$ with a = ${fmt(P.a)}${P.fn !== 'para' && P.fn !== 'saddle' ? ', b = ' + fmt(P.b) : ''}. Compute f(${fmt(P.x0)}; ${fmt(P.y0)}).` }, ans: z, abs: 0.02 }]; }
  },
  fgraph: {
    stage: { ortho: true, orthoH: 7, cam: [0, 0, 20], target: [0, 0, 0], grid: false, noRotate: true },
    options: [{ k: 'fn', v: 'quad', label: { kk: 'Функция', ru: 'Функция', en: 'Function' }, items: Object.keys(GR).map(k => ({ v: k, label: GR[k].name })) }],
    params: [{ k: 'a', v: 1, min: -5, max: 5, step: 0.1, label: 'a' }, { k: 'b', v: -2, min: -6, max: 6, step: 0.1, label: 'b', show: (P) => P.fn !== 'hyp' }, { k: 'c', v: -3, min: -6, max: 6, step: 0.1, label: 'c', show: (P) => P.fn !== 'lin' }],
    toggles: [{ k: 'pts', v: true, icon: '📍', label: { kk: 'Ерекше нүктелер', ru: 'Особые точки', en: 'Key points' } }, { k: 'ghost', v: true, icon: '👻', label: { kk: 'y = x² / y = x үлгісі', ru: 'Эталон y = x² / y = x', en: 'Reference y = x² / y = x' } }],
    setup(S, P) {
      const X = 12, Y = 7.5; for (let i = -X; i <= X; i++) S.line([[i, -Y, 0], [i, Y, 0]], 0x3a3570, S.root, { opacity: i % 5 ? 0.35 : 0.7 }); for (let j = -Math.floor(Y); j <= Y; j++) S.line([[-X, j, 0], [X, j, 0]], 0x3a3570, S.root, { opacity: j % 5 ? 0.35 : 0.7 });
      S.line([[-X, 0, 0], [X, 0, 0]], 0xcfd3e6); S.line([[0, -Y, 0], [0, Y, 0]], 0xcfd3e6); S.label('x', [X - 0.4, -0.4, 0], 'dim'); S.label('y', [0.4, Y - 0.4, 0], 'dim');
      for (let i = -10; i <= 10; i += 2) if (i) S.label(String(i), [i, -0.35, 0], 'tick'); for (let j = -6; j <= 6; j += 2) if (j) S.label(String(j), [-0.4, j, 0], 'tick');
      const curve = new THREE.Group(); S.root.add(curve); const marks = new THREE.Group(); S.root.add(marks);
      const inst = { rs: [], update() { S.clear(curve); S.clear(marks); const G = GR[P.fn]; const segs = []; let cur = [];
        for (let i = 0; i <= 1200; i++) { const x = -X + 2 * X * i / 1200; const y = G.f(x, P.a, P.b, P.c); if (!isFinite(y) || Math.abs(y) > 30 || (cur.length && Math.abs(y - cur[cur.length - 1].y) > 6)) { if (cur.length > 1) segs.push(cur); cur = []; if (!isFinite(y) || Math.abs(y) > 30) continue; } cur.push(V3(x, Math.max(-Y - 1, Math.min(Y + 1, y)), 0.01)); }
        if (cur.length > 1) segs.push(cur);
        segs.forEach(sg2 => { const c = new THREE.CatmullRomCurve3(sg2); S.mesh(new THREE.TubeGeometry(c, Math.min(800, sg2.length * 2), 0.05, 6, false), new THREE.MeshBasicMaterial({ color: 0xff6b9a }), curve); });
        if (P.ghost) { const gp = []; for (let i = -40; i <= 40; i++) { const x = i / 10 * 3; gp.push(V3(x, P.fn === 'lin' ? x : x * x, 0)); } S.line(gp.filter(p => Math.abs(p.y) < Y + 1), 0xffffff, marks, { dashed: true, opacity: 0.4 }); }
        inst.rs = roots(G.f, P.a, P.b, P.c);
        if (P.pts) { inst.rs.forEach(r => { S.sphere(0.12, 0x22d39a, [r, 0, 0.05], marks, { material: new THREE.MeshBasicMaterial({ color: 0x22d39a }) }); S.label(fmt(r), [r, 0.45, 0], 'dim', marks); });
          const y0 = G.f(0, P.a, P.b, P.c); if (isFinite(y0) && Math.abs(y0) < Y) { S.sphere(0.12, 0x3ea6ff, [0, y0, 0.05], marks, { material: new THREE.MeshBasicMaterial({ color: 0x3ea6ff }) }); S.label('(0; ' + fmt(y0) + ')', [1.1, y0, 0], 'dim', marks); }
          if (P.fn === 'quad' && P.a) { const xv = -P.b / (2 * P.a), yv = G.f(xv, P.a, P.b, P.c); if (Math.abs(yv) < Y) { S.sphere(0.14, 0xffd45e, [xv, yv, 0.05], marks, { material: new THREE.MeshBasicMaterial({ color: 0xffd45e }) }); S.label(tr({ kk: 'төбе', ru: 'вершина', en: 'vertex' }) + ' (' + fmt(xv) + '; ' + fmt(yv) + ')', [xv, yv - 0.5, 0], 'dim', marks); S.line([[xv, -Y, 0], [xv, Y, 0]], 0xffd45e, marks, { dashed: true, opacity: 0.5 }); } } } } };
      return inst;
    },
    formula(P) { const G = GR[P.fn]; let s = G.tex(P.a, P.b, P.c); if (P.fn === 'quad') s += `,\\quad D=b^2-4ac=${texNum(P.b * P.b - 4 * P.a * P.c)}`; if (P.fn === 'quad' && P.a) s += `,\\quad x_0=-\\dfrac{b}{2a}=${texNum(-P.b / (2 * P.a))}`; return s; },
    values(P, inst) { const G = GR[P.fn]; const out = [[{ kk: 'Функция', ru: 'Функция', en: 'Function' }, tr(G.name)], [{ kk: 'Нөлдері (y = 0)', ru: 'Нули (y = 0)', en: 'Zeros (y = 0)' }, inst.rs && inst.rs.length ? inst.rs.map(r => fmt(r)).join('; ') : tr({ kk: 'жоқ', ru: 'нет', en: 'none' })], [{ kk: 'Oy осімен қиылысу', ru: 'Пересечение с Oy', en: 'y-intercept' }, isFinite(G.f(0, P.a, P.b, P.c)) ? fmt(G.f(0, P.a, P.b, P.c)) : '—']];
      if (P.fn === 'quad') { out.push(['D', fmt(P.b * P.b - 4 * P.a * P.c)]); out.push([{ kk: 'Тармақтары', ru: 'Ветви', en: 'Branches' }, P.a > 0 ? '↑' : P.a < 0 ? '↓' : '—']); }
      if (P.fn === 'lin') out.push([{ kk: 'Бұрыштық коэффициент k', ru: 'Угловой коэффициент k', en: 'Slope k' }, fmt(P.a) + (P.a > 0 ? ' ↗' : P.a < 0 ? ' ↘' : ' →')]); return out; },
    info: { kk: 'Сырғытпалармен коэффициенттерді өзгертіп, **графиктің қалай өзгеретінін** бақыла. Квадраттық функцияда $a$ тармақтардың бағыты мен « енін», $b$ мен $c$ — төбенің орнын анықтайды; $D>0$ болса екі түбір, $D=0$ — бір, $D<0$ — түбір жоқ. Сызықтық функцияда $k$ — көлбеулік, $b$ — Oy осімен қиылысу. Жасыл нүктелер — нөлдер, сары — төбе.',
      ru: 'Меняй коэффициенты ползунками и наблюдай, **как меняется график**. У квадратичной функции $a$ определяет направление и «ширину» ветвей, $b$ и $c$ — положение вершины; при $D>0$ два корня, $D=0$ — один, $D<0$ — корней нет. У линейной $k$ — наклон, $b$ — пересечение с осью Oy. Зелёные точки — нули, жёлтая — вершина.',
      en: 'Move the sliders and watch **how the graph changes**. For a quadratic, $a$ sets the direction and width of the branches, $b$ and $c$ move the vertex; $D>0$ gives two roots, $D=0$ one, $D<0$ none. For a linear function $k$ is the slope and $b$ the y-intercept. Green points are zeros, yellow is the vertex.' },
    tasks(P) { const G = GR[P.fn]; const sig = P.fn + [P.a, P.b, P.c].map(v => Math.round(v * 10)).join('_'); const out = [{ key: 'y0_' + sig, q: { kk: 'Графиктің Oy осімен қиылысу нүктесінің ординатасын тап.', ru: 'Найди ординату точки пересечения графика с осью Oy.', en: 'Find the y-coordinate where the graph crosses the y-axis.' }, ans: G.f(0, P.a, P.b, P.c), abs: 0.02 }];
      if (P.fn === 'quad' && P.a) out.push({ key: 'xv_' + sig, q: { kk: 'Параболаның төбесінің абсциссасы $x_0$ неге тең?', ru: 'Чему равна абсцисса вершины параболы $x_0$?', en: 'What is the x-coordinate of the vertex $x_0$?' }, ans: -P.b / (2 * P.a), abs: 0.02 });
      if (P.fn === 'lin' && P.a) out.push({ key: 'r_' + sig, q: { kk: 'Функцияның нөлін тап (y = 0 болатын x).', ru: 'Найди нуль функции (x, при котором y = 0).', en: 'Find the zero of the function (x where y = 0).' }, ans: -P.b / P.a, abs: 0.02 }); return out; }
  }
};
