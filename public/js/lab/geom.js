/* Геометрия: көпжақтар мен айналу денелері, жазба (net), қима, көлем/аудан */
import { THREE, tr, fmt, texNum } from './core.js';
const PI = Math.PI;
const SH = {
  cube: { kk: 'Куб', ru: 'Куб', en: 'Cube' }, cuboid: { kk: 'Тікбұрышты параллелепипед', ru: 'Прямоугольный параллелепипед', en: 'Rectangular prism' },
  prism3: { kk: 'Үшбұрышты призма', ru: 'Треугольная призма', en: 'Triangular prism' }, pyramid: { kk: 'Пирамида', ru: 'Пирамида', en: 'Pyramid' },
  cylinder: { kk: 'Цилиндр', ru: 'Цилиндр', en: 'Cylinder' }, cone: { kk: 'Конус', ru: 'Конус', en: 'Cone' }, sphere: { kk: 'Шар', ru: 'Шар', en: 'Sphere' },
  frustum: { kk: 'Қиық конус', ru: 'Усечённый конус', en: 'Frustum' }
};
const ICON = { cube: '🧊', cuboid: '📦', prism3: '🔺', pyramid: '🔻', cylinder: '🥫', cone: '🍦', sphere: '⚽', frustum: '🪣' };
const POLY = ['cube', 'cuboid', 'prism3', 'pyramid'];
const has = (...l) => (P) => l.includes(P.shape);
const COLORS = [0x7c5cff, 0x00d1b2, 0xff6b9a, 0xffb020, 0x3ea6ff, 0x22d39a, 0xff8a4c];

function base(P) { // табан көпбұрышы (xz), биіктік және т.б.
  if (P.shape === 'cube') return { poly: rect(P.a, P.a), h: P.a };
  if (P.shape === 'cuboid') return { poly: rect(P.a, P.b), h: P.h };
  if (P.shape === 'prism3') { const a = P.a, R = a / Math.sqrt(3); return { poly: [0, 1, 2].map(i => [R * Math.cos(PI / 2 + i * 2 * PI / 3), -R * Math.sin(PI / 2 + i * 2 * PI / 3)]), h: P.h }; }
  if (P.shape === 'pyramid') return { poly: rect(P.a, P.a), h: P.h, apex: true };
}
function rect(a, b) { return [[-a / 2, -b / 2], [a / 2, -b / 2], [a / 2, b / 2], [-a / 2, b / 2]]; }
function faceGeo(pts2) { // pts2: [[x,z]] → жазық бет (y=0)
  const sh = new THREE.Shape(pts2.map(([x, z]) => new THREE.Vector2(x, -z))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-PI / 2); return g;
}
export const labs = {
  solids: {
    stage: { cam: [7, 6, 9], target: [0, 1.2, 0] },
    options: [{ k: 'shape', v: 'cube', label: { kk: 'Дене', ru: 'Тело', en: 'Solid' }, items: Object.keys(SH).map(k => ({ v: k, icon: ICON[k], label: SH[k] })) }],
    params: [
      { k: 'a', v: 3, min: 1, max: 5, step: 0.1, label: { kk: 'Қабырға a', ru: 'Ребро a', en: 'Edge a' }, show: has('cube', 'cuboid', 'prism3', 'pyramid') },
      { k: 'b', v: 2, min: 1, max: 5, step: 0.1, label: { kk: 'Ені b', ru: 'Ширина b', en: 'Width b' }, show: has('cuboid') },
      { k: 'h', v: 3, min: 0.5, max: 6, step: 0.1, label: { kk: 'Биіктік h', ru: 'Высота h', en: 'Height h' }, show: has('cuboid', 'prism3', 'pyramid', 'cylinder', 'cone', 'frustum') },
      { k: 'r', v: 1.5, min: 0.5, max: 3, step: 0.1, label: { kk: 'Радиус R', ru: 'Радиус R', en: 'Radius R' }, show: has('cylinder', 'cone', 'sphere', 'frustum') },
      { k: 'r2', v: 0.8, min: 0.2, max: 2.8, step: 0.1, label: { kk: 'Жоғарғы радиус r', ru: 'Верхний радиус r', en: 'Top radius r' }, show: has('frustum') },
      { k: 't', v: 0.5, min: 0.02, max: 0.98, step: 0.01, label: { kk: 'Қима биіктігі', ru: 'Высота сечения', en: 'Section height' }, show: (P) => P.section }
    ],
    toggles: [{ k: 'net', icon: '🗺️', label: { kk: 'Жазба (развертка)', ru: 'Развёртка', en: 'Net (unfold)' }, show: (P) => P.shape !== 'sphere' },
      { k: 'section', icon: '✂️', label: { kk: 'Қима', ru: 'Сечение', en: 'Cross-section' } }, { k: 'labels', v: true, icon: '🏷️', label: { kk: 'Белгілер', ru: 'Обозначения', en: 'Labels' } }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g); let u = 0, target = 0; let hinges = [], lateral = null, discs = [];
      const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
      const cap = new THREE.Group(); S.root.add(cap);
      const build = () => {
        S.clear(g); hinges = []; lateral = null; discs = [];
        const mat = (i, o = {}) => S.mat(COLORS[i % COLORS.length], Object.assign({ transparent: true, opacity: 0.88, clippingPlanes: [clip] }, o));
        if (POLY.includes(P.shape)) {
          const B = base(P); const poly = B.poly; const c = poly.reduce((a, p) => [a[0] + p[0] / poly.length, a[1] + p[1] / poly.length], [0, 0]);
          const bottom = new THREE.Mesh(faceGeo(poly), mat(0)); g.add(bottom); S.edges(bottom);
          poly.forEach((p1, i) => {
            let a1 = p1, a2 = poly[(i + 1) % poly.length]; let e = new THREE.Vector3(a2[0] - a1[0], 0, a2[1] - a1[1]); const L = e.length(); e.normalize();
            let n = new THREE.Vector3(-e.z, 0, e.x); const mid = new THREE.Vector3((a1[0] + a2[0]) / 2, 0, (a1[1] + a2[1]) / 2);
            if (n.dot(mid.clone().sub(new THREE.Vector3(c[0], 0, c[1]))) < 0) { e.negate(); n.negate(); }
            const pivot = new THREE.Object3D(); pivot.position.copy(mid); pivot.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(e, new THREE.Vector3(0, 1, 0), n)); g.add(pivot);
            const inner = new THREE.Object3D(); pivot.add(inner);
            const d = mid.distanceTo(new THREE.Vector3(c[0], 0, c[1]));
            let fold, face;
            if (B.apex) { const s = Math.hypot(B.h, d); face = new THREE.Mesh(faceGeo([[-L / 2, 0], [L / 2, 0], [0, s]]), mat(i + 1)); fold = Math.atan2(-B.h, -d); }
            else { face = new THREE.Mesh(faceGeo([[-L / 2, 0], [L / 2, 0], [L / 2, B.h], [-L / 2, B.h]]), mat(i + 1)); fold = -PI / 2; }
            inner.add(face); S.edges(face); hinges.push({ o: inner, fold, axis: 'x' });
            if (!B.apex && i === 0) { // үстіңгі бет — бірінші бүйір бетке ілулі
              const tp = new THREE.Object3D(); tp.position.set(0, 0, B.h); face.add(tp); const tpi = new THREE.Object3D(); tp.add(tpi);
              // табан көпбұрышын осы жиекке қатысты жергілікті координатқа көшіру
              const pts = poly.map(([x, z]) => { const v = new THREE.Vector3(x - mid.x, 0, z - mid.z); return [v.dot(e), -v.dot(n)]; });
              const top = new THREE.Mesh(faceGeo(pts.map(([x, z]) => [x, z])), mat(6)); tpi.add(top); S.edges(top); hinges.push({ o: tpi, fold: -PI / 2, axis: 'x' });
            }
          });
        } else if (P.shape === 'sphere') {
          const m = new THREE.Mesh(new THREE.SphereGeometry(P.r, 64, 32), mat(1)); m.position.y = P.r; g.add(m);
          const eq = new THREE.Mesh(new THREE.TorusGeometry(P.r, 0.015, 8, 96), S.basic(0xffffff)); eq.rotation.x = PI / 2; eq.position.y = P.r; g.add(eq);
          S.line([[0, P.r, 0], [P.r, P.r, 0]], 0xffd45e, g);
        } else {
          const R1 = P.r, R2 = P.shape === 'cylinder' ? P.r : P.shape === 'cone' ? 0 : Math.min(P.r2, P.r - 0.05), H = P.h;
          const b = new THREE.Mesh(new THREE.CircleGeometry(R1, 64), mat(0)); b.rotation.x = -PI / 2; g.add(b); discs.push({ m: b, from: [0, 0, 0], to: [0, 0, 0] });
          const seg = 72, rows = 12; const geo = new THREE.BufferGeometry(); const pos = new Float32Array((seg + 1) * (rows + 1) * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const idx = []; for (let j = 0; j < rows; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b2 = a + seg + 1; idx.push(a, b2, a + 1, b2, b2 + 1, a + 1); } geo.setIndex(idx);
          const lm = new THREE.Mesh(geo, mat(2)); g.add(lm);
          const folded = [], flat = [];
          const cyl = R1 === R2; const Hc = cyl ? 0 : H * R1 / (R1 - R2); const l = cyl ? 0 : Math.hypot(Hc, R1); const t0 = cyl ? 0 : R2 / R1;
          for (let j = 0; j <= rows; j++) for (let i = 0; i <= seg; i++) {
            const th = -PI / 2 + (i / seg) * 2 * PI, s = j / rows;
            if (cyl) { const y = s * H; folded.push(R1 * Math.cos(th), y, R1 * Math.sin(th)); flat.push(R1 * (th - PI / 2), 0, R1 + y); }
            else { const t = 1 - s * (1 - t0); folded.push(t * R1 * Math.cos(th), Hc * (1 - t), t * R1 * Math.sin(th)); const al = (th - PI / 2) * R1 / l; const A = R1 + l; flat.push(t * l * Math.sin(al), 0, A - t * l * Math.cos(al)); }
          }
          lateral = { geo, folded, flat };
          if (R2 > 0) { const tp = new THREE.Mesh(new THREE.CircleGeometry(R2, 64), mat(6)); tp.rotation.x = -PI / 2; g.add(tp);
            const zTop = cyl ? R1 + H + R1 : (R1 + l) - t0 * l + R2; discs.push({ m: tp, from: [0, H, 0], to: [0, 0.001, zTop] }); }
          const rim = (r, y) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 96), S.basic(0xffffff)); m.rotation.x = PI / 2; m.position.y = y; g.add(m); return m; };
          lateral.rims = [rim(R1, 0)]; if (R2 > 0) lateral.rims.push(rim(R2, H));
        }
        applyU(); drawLabels(); drawCap();
      };
      const applyU = () => {
        const k = 1 - u;
        hinges.forEach(h => { h.o.rotation.set(h.fold * k, 0, 0); });
        if (lateral) { const p = lateral.geo.attributes.position.array; for (let i = 0; i < p.length; i++) p[i] = lateral.folded[i] * k + lateral.flat[i] * u; lateral.geo.attributes.position.needsUpdate = true; lateral.geo.computeVertexNormals(); lateral.rims.forEach(r => r.visible = u < 0.02); }
        discs.forEach(d => d.m.position.set(d.from[0] * k + d.to[0] * u, d.from[1] * k + d.to[1] * u, d.from[2] * k + d.to[2] * u));
        clip.constant = P.section && u < 0.01 ? secY() : 100; cap.visible = P.section && u < 0.01; lbl.visible = P.labels && u < 0.01;
      };
      const lbl = new THREE.Group(); S.root.add(lbl);
      const drawLabels = () => { S.clear(lbl); const H = hOf(P);
        if (POLY.includes(P.shape)) { const B = base(P); const p0 = B.poly[0], p1 = B.poly[1];
          S.label('a', [(p0[0] + p1[0]) / 2, -0.25, (p0[1] + p1[1]) / 2], 'dim', lbl);
          if (P.shape === 'cuboid') S.label('b', [P.a / 2 + 0.3, -0.2, 0], 'dim', lbl);
          if (P.shape !== 'cube') { S.line([[0, 0, 0], [0, H, 0]], 0xffd45e, lbl, { dashed: true }); S.label('h', [0.25, H / 2, 0], 'dim', lbl); } }
        else if (P.shape !== 'sphere') { S.line([[0, 0, 0], [P.r, 0, 0]], 0xffd45e, lbl); S.label('R', [P.r / 2, 0.25, 0], 'dim', lbl); S.line([[0, 0, 0], [0, H, 0]], 0xffd45e, lbl, { dashed: true }); S.label('h', [-0.3, H / 2, 0], 'dim', lbl);
          if (P.shape === 'frustum') S.label('r', [Math.min(P.r2, P.r) / 2, H + 0.25, 0], 'dim', lbl); }
        else S.label('R', [P.r / 2, P.r + 0.25, 0], 'dim', lbl);
      };
      const hOf = (P) => P.shape === 'cube' ? P.a : P.shape === 'sphere' ? 2 * P.r : P.h;
      const secY = () => P.t * hOf(P);
      const secR = () => { const y = secY(); if (P.shape === 'cylinder') return P.r; if (P.shape === 'cone') return P.r * (1 - P.t); if (P.shape === 'frustum') return P.r + (Math.min(P.r2, P.r - 0.05) - P.r) * P.t; if (P.shape === 'sphere') return Math.sqrt(Math.max(0, P.r * P.r - (y - P.r) ** 2)); return 0; };
      const drawCap = () => { S.clear(cap); if (!P.section) return; const y = secY();
        let geo; if (POLY.includes(P.shape)) { const B = base(P); const k = B.apex ? 1 - P.t : 1; geo = faceGeo(B.poly.map(([x, z]) => [x * k, z * k])); } else geo = new THREE.CircleGeometry(Math.max(0.001, secR()), 64).rotateX(-PI / 2);
        const m = new THREE.Mesh(geo, S.mat(0xffd45e, { emissive: 0x6b4b00, side: THREE.DoubleSide })); m.position.y = y + 0.002; cap.add(m); S.edges(m, 0xffffff, 1);
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(9, 9).rotateX(-PI / 2), S.mat(0xffffff, { transparent: true, opacity: 0.07, depthWrite: false })); pl.position.y = y; cap.add(pl); };
      let camT = null; const camTo = (pos, tg) => { camT = { p0: S.camera.position.clone(), t0: S.controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...tg), k: 0 }; };
      let fitPending = false;
      S.onTick((dt) => { if (Math.abs(u - target) > 1e-3) { u += Math.sign(target - u) * Math.min(Math.abs(target - u), dt * 0.9); applyU(); }
        else if (fitPending && target === 1) { fitPending = false; const box = new THREE.Box3().setFromObject(g); if (!box.isEmpty()) { const c = box.getCenter(new THREE.Vector3()); const r = box.getSize(new THREE.Vector3()).length() / 2; camTo([c.x + r * 0.15, c.y + r * 1.75, c.z + r * 1.05], [c.x, c.y, c.z]); } }
        if (camT) { camT.k = Math.min(1, camT.k + dt * 1.4); const e = camT.k * camT.k * (3 - 2 * camT.k); S.camera.position.lerpVectors(camT.p0, camT.p1, e); S.controls.target.lerpVectors(camT.t0, camT.t1, e); if (camT.k >= 1) camT = null; } });
      const inst = {
        update(P2, k) { if (k === 'net') { target = P.net ? 1 : 0; if (P.net) { P.section = false; fitPending = true; } else { fitPending = false; camTo(S.home.cam.toArray(), [0, hOf(P) / 2, 0]); } return; }
          if (k === 't') { clip.constant = secY(); drawCap(); applyU(); return; } if (k === 'labels') { applyU(); return; } if (k === 'section') { drawCap(); applyU(); return; }
          if (k === 'shape') { P.net = false; target = 0; u = 0; }
          build(); S.controls.target.set(0, hOf(P) / 2, 0); },
        secArea() { if (POLY.includes(P.shape)) { const A = baseArea(P); return P.shape === 'pyramid' ? A * (1 - P.t) ** 2 : A; } return PI * secR() ** 2; }
      };
      return inst;
    },
    formula(P) { const f = FORM[P.shape]; const [V, Sf] = calc(P); let s = f.v + '=' + texNum(V) + ',\\quad ' + f.s + '=' + texNum(Sf); return s; },
    values(P, inst) { const [V, Sf] = calc(P); const out = [[{ kk: 'Көлем V', ru: 'Объём V', en: 'Volume V' }, fmt(V) + ' ед³'.replace('ед', LANG === 'en' ? 'u' : LANG === 'ru' ? 'ед' : 'бірл')], [{ kk: 'Толық бет ауданы S', ru: 'Площадь поверхности S', en: 'Surface area S' }, fmt(Sf)]];
      if (P.section) out.push([{ kk: 'Қима ауданы', ru: 'Площадь сечения', en: 'Section area' }, fmt(inst.secArea())]);
      if (P.shape === 'cone' || P.shape === 'frustum') out.push([{ kk: 'Жасаушы l', ru: 'Образующая l', en: 'Slant l' }, fmt(P.shape === 'cone' ? Math.hypot(P.r, P.h) : Math.hypot(P.h, P.r - Math.min(P.r2, P.r - 0.05)))]);
      if (P.shape === 'pyramid') out.push([{ kk: 'Апофема m', ru: 'Апофема m', en: 'Apothem m' }, fmt(Math.hypot(P.h, P.a / 2))]);
      return out; },
    info: { kk: '**Көлем** — дененің кеңістікте алатын орны, **бет ауданы** — барлық беттерінің аудандарының қосындысы.\n\n1. Денені таңда да, сырғытпалармен өлшемдерін өзгерт — формула мен сандар бірден жаңарады.\n2. **Жазба** батырмасы денені жазықтыққа «ашады»: толық бет ауданы — жазбадағы барлық фигуралардың аудандарының қосындысы.\n3. **Қима** — дененің жазықтықпен қиылысуы. Пирамида мен конуста қима төбеге жақындаған сайын кішірейеді: аудан $(1-t)^2$ есе азаяды.',
      ru: '**Объём** — место, которое тело занимает в пространстве, **площадь поверхности** — сумма площадей всех его граней.\n\n1. Выбери тело и меняй размеры ползунками — формула и числа обновляются сразу.\n2. Кнопка **Развёртка** «раскрывает» тело на плоскость: площадь поверхности — сумма площадей всех фигур развёртки.\n3. **Сечение** — пересечение тела плоскостью. У пирамиды и конуса сечение уменьшается к вершине: площадь уменьшается в $(1-t)^2$ раз.',
      en: '**Volume** is the space a solid occupies; **surface area** is the sum of the areas of all its faces.\n\n1. Pick a solid and drag the sliders — the formula and numbers update live.\n2. **Net** unfolds the solid onto the plane: the surface area equals the total area of the net.\n3. A **cross-section** is where a plane cuts the solid. For pyramids and cones the section shrinks toward the apex: its area scales by $(1-t)^2$.' },
    tasks(P) { const [V, Sf] = calc(P); const sig = P.shape + '_' + [P.a, P.b, P.h, P.r, P.r2].map(x => Math.round(x * 10)).join('_');
      const out = [{ key: 'V_' + sig, q: { kk: `${tr(SH[P.shape])} көлемін есепте (суреттегі өлшемдер бойынша).`, ru: `Вычисли объём: ${tr(SH[P.shape]).toLowerCase()} (по размерам на рисунке).`, en: `Compute the volume of the ${tr(SH[P.shape]).toLowerCase()} (use the sizes shown).` }, ans: V },
        { key: 'S_' + sig, q: { kk: 'Толық бет ауданын тап. Кеңес: жазбаны аш!', ru: 'Найди площадь полной поверхности. Подсказка: открой развёртку!', en: 'Find the total surface area. Hint: open the net!' }, ans: Sf }];
      return out; }
  }
};
function baseArea(P) { if (P.shape === 'cube') return P.a * P.a; if (P.shape === 'cuboid') return P.a * P.b; if (P.shape === 'prism3') return Math.sqrt(3) / 4 * P.a * P.a; if (P.shape === 'pyramid') return P.a * P.a; return 0; }
function calc(P) {
  const { a, b, h, r } = P; const r2 = Math.min(P.r2, P.r - 0.05);
  switch (P.shape) {
    case 'cube': return [a ** 3, 6 * a * a];
    case 'cuboid': return [a * b * h, 2 * (a * b + a * h + b * h)];
    case 'prism3': { const B = Math.sqrt(3) / 4 * a * a; return [B * h, 2 * B + 3 * a * h]; }
    case 'pyramid': { const m = Math.hypot(h, a / 2); return [a * a * h / 3, a * a + 2 * a * m]; }
    case 'cylinder': return [PI * r * r * h, 2 * PI * r * (r + h)];
    case 'cone': { const l = Math.hypot(r, h); return [PI * r * r * h / 3, PI * r * (r + l)]; }
    case 'sphere': return [4 / 3 * PI * r ** 3, 4 * PI * r * r];
    case 'frustum': { const l = Math.hypot(h, r - r2); return [PI * h / 3 * (r * r + r * r2 + r2 * r2), PI * (r * r + r2 * r2 + (r + r2) * l)]; }
  }
}
const FORM = {
  cube: { v: 'V=a^3', s: 'S=6a^2' }, cuboid: { v: 'V=abh', s: 'S=2(ab+ah+bh)' }, prism3: { v: 'V=\\tfrac{\\sqrt3}{4}a^2h', s: 'S=\\tfrac{\\sqrt3}{2}a^2+3ah' },
  pyramid: { v: 'V=\\tfrac13 a^2h', s: 'S=a^2+2am' }, cylinder: { v: 'V=\\pi R^2h', s: 'S=2\\pi R(R+h)' }, cone: { v: 'V=\\tfrac13\\pi R^2h', s: 'S=\\pi R(R+l)' },
  sphere: { v: 'V=\\tfrac43\\pi R^3', s: 'S=4\\pi R^2' }, frustum: { v: 'V=\\tfrac{\\pi h}{3}(R^2+Rr+r^2)', s: 'S=\\pi(R^2+r^2+(R+r)l)' }
};
