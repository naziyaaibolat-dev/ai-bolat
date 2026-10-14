/* География/астрономия: Жер (күн мен түн), Күн жүйесі, жыл мезгілдері */
import { THREE, tr, fmt, texNum, rad } from './core.js';
import { mulberry } from './bio.js';
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const TILT = 23.44;
let earthTex = null;
function earthTexture() { // процедуралық Жер текстурасы (желісіз)
  if (earthTex) return earthTex; const W = 1024, H = 512; const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); const img = x.createImageData(W, H);
  const rnd = mulberry(42); const G = 64; const grid = []; for (let i = 0; i < G * G; i++) grid.push(rnd());
  const val = (u, v) => { const X = u * G, Y = v * G; const x0 = Math.floor(X), y0 = Math.floor(Y); const fx = X - x0, fy = Y - y0; const s = (t) => t * t * (3 - 2 * t);
    const g = (i, j) => grid[((j % G + G) % G) * G + ((i % G + G) % G)]; const a = g(x0, y0), b = g(x0 + 1, y0), cc = g(x0, y0 + 1), d = g(x0 + 1, y0 + 1); return a + (b - a) * s(fx) + (cc - a) * s(fy) + (a - b - cc + d) * s(fx) * s(fy); };
  const fbm = (u, v) => { let s = 0, amp = 0.5, f = 4; for (let o = 0; o < 5; o++) { s += amp * val(u * f, v * f); amp *= 0.5; f *= 2; } return s; };
  // материктердің шамамен орны (эллипс «тұқымдары»): Еуразия, Африка, Америкалар, Австралия
  const seeds = [[0.58, 0.28, 0.2, 0.12], [0.72, 0.3, 0.14, 0.12], [0.53, 0.52, 0.08, 0.16], [0.23, 0.3, 0.1, 0.12], [0.3, 0.64, 0.06, 0.14], [0.85, 0.66, 0.06, 0.05], [0.5, 0.95, 0.5, 0.06]];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const u = i / W, v = j / H; let m = 0; for (const [cx, cy, rx, ry] of seeds) { let dx = Math.abs(u - cx); dx = Math.min(dx, 1 - dx); const d = (dx / rx) ** 2 + ((v - cy) / ry) ** 2; m = Math.max(m, 1 - d); }
    const n = fbm(u, v); const h = m * 0.9 + (n - 0.5) * 0.9; const lat = Math.abs(v - 0.5) * 2; const k = (j * W + i) * 4; let r, g, b;
    if (lat > 0.9 || (h > 0.15 && lat > 0.78)) { r = g = b = 240; }
    else if (h > 0.15) { const dry = Math.max(0, 1 - Math.abs(lat - 0.35) * 5) * (n > 0.5 ? 1 : 0.4); r = 60 + dry * 150 + n * 40; g = 130 + dry * 60 - lat * 30; b = 50 + dry * 40; }
    else { const deep = Math.min(1, (0.15 - h) * 2.2); r = 20 - deep * 10; g = 90 - deep * 50; b = 170 - deep * 40; }
    img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255; }
  x.putImageData(img, 0, 0); earthTex = new THREE.CanvasTexture(c); earthTex.colorSpace = THREE.SRGBColorSpace; return earthTex;
}
function stars(S, n = 1500, r = 300) { const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3); const rnd = mulberry(9); for (let i = 0; i < n; i++) { const a = rnd() * 6.283, b = Math.acos(2 * rnd() - 1); p.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const s = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false })); S.scene.add(s); return s; }
function dimLights(S, k = 0.12) { S.scene.children.forEach(o => { if (o.isHemisphereLight) o.intensity = k; }); S.sun.intensity = 0; }
const PLANETS = [
  ['mercury', { kk: 'Меркурий', ru: 'Меркурий', en: 'Mercury' }, 0.39, 0.24, 4879, 0, 0xb5a79a, { kk: 'Күнге ең жақын, атмосферасы жоқ.', ru: 'Ближе всех к Солнцу, нет атмосферы.', en: 'Closest to the Sun, no atmosphere.' }],
  ['venus', { kk: 'Шолпан (Венера)', ru: 'Венера', en: 'Venus' }, 0.72, 0.62, 12104, 0, 0xe6c07b, { kk: 'Ең ыстық планета (≈465 °C), кері айналады.', ru: 'Самая горячая планета (≈465 °C), вращается обратно.', en: 'Hottest planet (≈465 °C), spins backwards.' }],
  ['earth', { kk: 'Жер', ru: 'Земля', en: 'Earth' }, 1, 1, 12742, 1, 0x3e8ef7, { kk: 'Тіршілік бар жалғыз белгілі планета.', ru: 'Единственная известная планета с жизнью.', en: 'The only known planet with life.' }],
  ['mars', { kk: 'Марс', ru: 'Марс', en: 'Mars' }, 1.52, 1.88, 6779, 2, 0xd4592b, { kk: '«Қызыл планета», Олимп жанартауы — ең биік тау.', ru: '«Красная планета», вулкан Олимп — высочайшая гора.', en: 'The "Red Planet"; Olympus Mons is the tallest volcano.' }],
  ['jupiter', { kk: 'Юпитер', ru: 'Юпитер', en: 'Jupiter' }, 5.2, 11.86, 139820, 95, 0xd8b48a, { kk: 'Ең үлкен газ алыбы, Үлкен Қызыл Дақ — дауыл.', ru: 'Крупнейший газовый гигант, Большое Красное Пятно — шторм.', en: 'Largest gas giant; the Great Red Spot is a storm.' }],
  ['saturn', { kk: 'Сатурн', ru: 'Сатурн', en: 'Saturn' }, 9.54, 29.46, 116460, 146, 0xe8d49a, { kk: 'Әдемі мұз сақиналары бар.', ru: 'Имеет красивые ледяные кольца.', en: 'Has beautiful icy rings.' }],
  ['uranus', { kk: 'Уран', ru: 'Уран', en: 'Uranus' }, 19.2, 84.0, 50724, 28, 0x9fe3ee, { kk: '«Жамбасымен» жатып айналады (осі 98°).', ru: 'Вращается «лёжа на боку» (ось 98°).', en: 'Rotates on its side (tilt 98°).' }],
  ['neptune', { kk: 'Нептун', ru: 'Нептун', en: 'Neptune' }, 30.1, 164.8, 49244, 16, 0x4b6cff, { kk: 'Ең күшті желдер (2000 км/сағ дейін).', ru: 'Самые сильные ветры (до 2000 км/ч).', en: 'Strongest winds (up to 2000 km/h).' }]];
const orbitR = (au) => 5 + Math.sqrt(au) * 6.5;
const sizeR = (km) => 0.25 + Math.log10(km / 4000 + 1) * 1.1;

export const labs = {
  earth: {
    stage: { cam: [0, 1.5, 7.5], target: [0, 0, 0], grid: false }, live: true,
    params: [{ k: 'hour', v: 12, min: 0, max: 24, step: 0.25, label: { kk: 'Уақыт (Гринвич), сағ', ru: 'Время (по Гринвичу), ч', en: 'Time (UTC), h' } },
      { k: 'sp', v: 1, min: 0, max: 5, step: 0.1, label: { kk: 'Айналу жылдамдығы', ru: 'Скорость вращения', en: 'Rotation speed' } },
      { k: 'lat', v: 51, min: -80, max: 80, step: 1, label: { kk: 'Ендік φ (белгі)', ru: 'Широта φ (метка)', en: 'Latitude φ (marker)' }, unit: '°' }],
    toggles: [{ k: 'grid', v: true, icon: '🌐', label: { kk: 'Градус торы', ru: 'Градусная сетка', en: 'Graticule' } }, { k: 'axis', v: true, icon: '🧭', label: { kk: 'Ось', ru: 'Ось', en: 'Axis' } }],
    setup(S, P) {
      dimLights(S, 0.08); stars(S); const sunL = new THREE.DirectionalLight(0xffffff, 2.4); sunL.position.set(10, 0, 0); S.scene.add(sunL);
      const tiltG = new THREE.Group(); tiltG.rotation.z = -rad(TILT); S.root.add(tiltG); const spin = new THREE.Group(); tiltG.add(spin);
      const earth = S.mesh(new THREE.SphereGeometry(2, 96, 48), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.9, metalness: 0 }), spin);
      const atm = S.mesh(new THREE.SphereGeometry(2.08, 64, 32), new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.12, side: THREE.BackSide }), tiltG);
      const grid = new THREE.Group(); spin.add(grid); for (let la = -60; la <= 60; la += 30) { const r = 2.01 * Math.cos(rad(la)); const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 128), new THREE.MeshBasicMaterial({ color: la === 0 ? 0xffd45e : 0xffffff, transparent: true, opacity: 0.35 })); t.rotation.x = Math.PI / 2; t.position.y = 2.01 * Math.sin(rad(la)); grid.add(t); }
      for (let lo = 0; lo < 180; lo += 30) { const t = new THREE.Mesh(new THREE.TorusGeometry(2.01, 0.006, 4, 128), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })); t.rotation.y = rad(lo); grid.add(t); }
      const axis = S.line([[0, -2.9, 0], [0, 2.9, 0]], 0xff6b9a, tiltG); S.label('N', [0, 3.1, 0], 'dim', tiltG); S.label('S', [0, -3.1, 0], 'dim', tiltG);
      const mk = S.sphere(0.07, 0xff4d6d, null, spin, { m: { emissive: 0xff2244, emissiveIntensity: 1 } }); const mkL = S.label('📍', [0, 0, 0], 'dim', spin);
      const sunTag = S.label('☀️ ' + tr({ kk: 'Күн сәулелері', ru: 'Солнечные лучи', en: 'Sunlight' }), [4.2, 0, 0], 'dim', S.root);
      let ang = 0; const place = () => { const la = rad(P.lat), lo = rad(71); const p = V3(2.02 * Math.cos(la) * Math.cos(lo), 2.02 * Math.sin(la), -2.02 * Math.cos(la) * Math.sin(lo)); mk.position.copy(p); mkL.position.copy(p.clone().multiplyScalar(1.08)); };
      S.onTick((dt) => { if (P.sp > 0) { P.hour = (P.hour + dt * P.sp * 0.5) % 24; } spin.rotation.y = rad((P.hour - 12) * 15) + Math.PI; grid.visible = P.grid; axis.visible = P.axis; });
      return { update() { place(); } };
    },
    formula(P) { return `\\omega=\\dfrac{360^\\circ}{24\\,\\text{h}}=15^\\circ/\\text{h},\\quad v=v_0\\cos\\varphi=${texNum(465 * Math.cos(rad(P.lat)), 0)}\\,\\text{m/s}`; },
    values(P) { return [[{ kk: 'Осьтік айналу периоды', ru: 'Период осевого вращения', en: 'Rotation period' }, tr({ kk: '≈ 24 сағ (23 сағ 56 мин)', ru: '≈ 24 ч (23 ч 56 мин)', en: '≈ 24 h (23 h 56 min)' })], [{ kk: 'Ось көлбеулігі', ru: 'Наклон оси', en: 'Axial tilt' }, '23,44°'],
      [{ kk: 'Экватордағы жылдамдық', ru: 'Скорость на экваторе', en: 'Speed at equator' }, '≈ 465 ' + tr({ kk: 'м/с', ru: 'м/с', en: 'm/s' })], [{ kk: `φ = ${P.lat}° ендіктегі жылдамдық`, ru: `Скорость на широте φ = ${P.lat}°`, en: `Speed at latitude φ = ${P.lat}°` }, fmt(465 * Math.cos(rad(P.lat)), 0) + ' ' + tr({ kk: 'м/с', ru: 'м/с', en: 'm/s' })],
      [{ kk: 'Қазақстан (Астана, UTC+5) уақыты', ru: 'Время в Казахстане (Астана, UTC+5)', en: 'Kazakhstan time (Astana, UTC+5)' }, String(Math.floor((P.hour + 5) % 24)).padStart(2, '0') + ':' + String(Math.floor((P.hour % 1) * 60)).padStart(2, '0')]]; },
    info: { kk: 'Жер өз осінен батыстан шығысқа қарай айналады — сондықтан **күн мен түн** алмасады. Жарық түскен жақ — күн, көлеңке — түн. Жер 1 сағатта $15^\\circ$-қа бұрылады, сол себепті **уақыт белдеулері** бір-бірінен 15° (1 сағат) ерекшеленеді. Экваторда бет жылдамдығы ≈465 м/с, ал ендік артқан сайын $v=v_0\\cos\\varphi$ бойынша азаяды. Сары сызық — экватор, қызыл белгі — таңдалған ендік (Қазақстан бойлығы ≈71°).',
      ru: 'Земля вращается вокруг оси с запада на восток — поэтому сменяются **день и ночь**. Освещённая сторона — день, тень — ночь. За 1 час Земля поворачивается на $15^\\circ$, поэтому **часовые пояса** отличаются на 15° (1 час). На экваторе скорость ≈465 м/с и уменьшается с широтой: $v=v_0\\cos\\varphi$. Жёлтая линия — экватор, красная метка — выбранная широта (долгота Казахстана ≈71°).',
      en: 'Earth spins west to east around its axis — this makes **day and night**. The lit side is day, the shadow is night. Earth turns $15^\\circ$ per hour, so **time zones** differ by 15° (1 hour). At the equator the surface moves at ≈465 m/s, decreasing with latitude as $v=v_0\\cos\\varphi$. Yellow line — equator, red marker — chosen latitude (Kazakhstan longitude ≈71°).' },
    tasks(P) { const h = 1 + (Math.abs(P.lat) % 7); return [{ key: 'deg_' + h, q: { kk: `Жер ${h} сағатта неше градусқа бұрылады?`, ru: `На сколько градусов Земля повернётся за ${h} ч?`, en: `How many degrees does Earth turn in ${h} h?` }, ans: 15 * h, tol: 0 },
      { key: 'v_' + P.lat, q: { kk: `φ = ${P.lat}° ендіктегі айналу жылдамдығын тап (м/с), v₀ = 465 м/с.`, ru: `Найди скорость вращения на широте φ = ${P.lat}° (м/с), v₀ = 465 м/с.`, en: `Find the rotation speed at latitude φ = ${P.lat}° (m/s), v₀ = 465 m/s.` }, ans: 465 * Math.cos(rad(P.lat)), tol: 0.02 }]; }
  },
  solar: {
    stage: { cam: [0, 30, 48], target: [0, 0, 0], grid: false },
    options: [{ k: 'focus', v: 'earth', label: { kk: 'Планета', ru: 'Планета', en: 'Planet' }, items: PLANETS.map(p => ({ v: p[0], label: p[1] })) }],
    params: [{ k: 'sp', v: 1, min: 0, max: 5, step: 0.1, label: { kk: 'Уақыт жылдамдығы', ru: 'Скорость времени', en: 'Time speed' } }],
    toggles: [{ k: 'orbits', v: true, icon: '⭕', label: { kk: 'Орбиталар', ru: 'Орбиты', en: 'Orbits' } }, { k: 'names', v: true, icon: '🏷️', label: { kk: 'Атаулар', ru: 'Названия', en: 'Names' } }],
    setup(S, P) {
      dimLights(S, 0.25); stars(S, 2500, 400); const sun = S.sphere(2.6, 0xffc34d, [0, 0, 0], S.root, { material: new THREE.MeshBasicMaterial({ color: 0xffc34d }) }); const pl = new THREE.PointLight(0xffffff, 3, 0, 0); S.scene.add(pl);
      const glow = S.sphere(3.4, 0xffa500, null, S.root, { material: new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.18 }) }); S.label('☀️ ' + tr({ kk: 'Күн', ru: 'Солнце', en: 'Sun' }), [0, 3.8, 0], 'dim', S.root);
      const bodies = PLANETS.map((p, i) => { const r = orbitR(p[2]); const orb = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 4, 256), new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.35 })); orb.rotation.x = Math.PI / 2; S.root.add(orb);
        const m = S.sphere(sizeR(p[4]), p[6], null, S.root, { m: { roughness: 0.8 } }); m.userData.pick = p[0]; S.pickables.push(m);
        if (p[0] === 'saturn') { const ring = new THREE.Mesh(new THREE.RingGeometry(sizeR(p[4]) * 1.3, sizeR(p[4]) * 2.1, 64), new THREE.MeshBasicMaterial({ color: 0xd9c89a, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })); ring.rotation.x = Math.PI / 2.3; m.add(ring); }
        const lb = S.label(tr(p[1]), [0, sizeR(p[4]) + 0.5, 0], 'dim', m); return { p, m, orb, lb, a: i * 0.8 }; });
      S.onPick = (k) => { if (k) { P.focus = k; inst.refresh && inst.refresh(); } };
      let yr = 0; S.onTick((dt) => { yr += dt * P.sp * 0.15; bodies.forEach(b => { const a = b.a + yr * 2 * Math.PI / b.p[3]; const r = orbitR(b.p[2]); b.m.position.set(r * Math.cos(a), 0, -r * Math.sin(a)); b.m.rotation.y += dt; b.orb.visible = P.orbits; b.lb.visible = P.names;
        b.m.scale.setScalar(b.p[0] === P.focus ? 1.35 : 1); }); });
      const inst = { update() { const b = bodies.find(x => x.p[0] === P.focus); if (b) S.showPick(`<b>${tr(b.p[1])}</b><br>${tr(b.p[7])}`); } };
      return inst;
    },
    formula(P) { const p = PLANETS.find(x => x[0] === P.focus); return `T^2=a^3\\;\\Rightarrow\\;T=\\sqrt{${texNum(p[2])}^3}\\approx${texNum(Math.pow(p[2], 1.5))}\\;\\text{${tr({ kk: 'жыл', ru: 'лет', en: 'yr' })}}`; },
    values(P) { const p = PLANETS.find(x => x[0] === P.focus); return [[{ kk: 'Планета', ru: 'Планета', en: 'Planet' }, tr(p[1])], [{ kk: 'Күннен қашықтығы', ru: 'Расстояние от Солнца', en: 'Distance from the Sun' }, fmt(p[2]) + ' ' + tr({ kk: 'а.б.', ru: 'а.е.', en: 'AU' }) + ' (' + fmt(p[2] * 149.6, 0) + ' ' + tr({ kk: 'млн км', ru: 'млн км', en: 'M km' }) + ')'],
      [{ kk: 'Айналу периоды', ru: 'Период обращения', en: 'Orbital period' }, fmt(p[3]) + ' ' + tr({ kk: 'жыл', ru: 'лет', en: 'years' })], [{ kk: 'Диаметрі', ru: 'Диаметр', en: 'Diameter' }, p[4].toLocaleString('ru-RU') + ' ' + tr({ kk: 'км', ru: 'км', en: 'km' })], [{ kk: 'Серіктері', ru: 'Спутники', en: 'Moons' }, p[5]]]; },
    info: { kk: '**Күн жүйесі** — Күн және оны айнала қозғалатын 8 планета. Ішкі планеталар (Меркурий, Шолпан, Жер, Марс) — тасты, сыртқылары (Юпитер, Сатурн, Уран, Нептун) — газ және мұз алыптары. Планетаны бас. **Кеплердің III заңы**: $T^2=a^3$ ($T$ — жылмен, $a$ — астрономиялық бірлікпен). Масштаб ыңғайлы болу үшін өзгертілген.',
      ru: '**Солнечная система** — Солнце и 8 планет вокруг него. Внутренние планеты (Меркурий, Венера, Земля, Марс) — каменные, внешние (Юпитер, Сатурн, Уран, Нептун) — газовые и ледяные гиганты. Нажми на планету. **III закон Кеплера**: $T^2=a^3$ ($T$ — в годах, $a$ — в астрономических единицах). Масштаб изменён для наглядности.',
      en: 'The **Solar System** is the Sun and 8 planets orbiting it. Inner planets (Mercury, Venus, Earth, Mars) are rocky; outer ones (Jupiter, Saturn, Uranus, Neptune) are gas and ice giants. Click a planet. **Kepler\'s 3rd law**: $T^2=a^3$ ($T$ in years, $a$ in AU). The scale is compressed for clarity.' },
    tasks(P) { const p = PLANETS.find(x => x[0] === P.focus); return [{ key: 'T_' + p[0], q: { kk: `${tr(p[1])}: a = ${fmt(p[2])} а.б. Кеплер заңы бойынша периодты тап (жыл).`, ru: `${tr(p[1])}: a = ${fmt(p[2])} а.е. Найди период по закону Кеплера (лет).`, en: `${tr(p[1])}: a = ${fmt(p[2])} AU. Find the period using Kepler's law (years).` }, ans: Math.pow(p[2], 1.5), tol: 0.03 },
      { key: 'k4', q: { kk: 'Орбита радиусы a = 4 а.б. болатын планетаның периоды қанша жыл?', ru: 'Каков период планеты с a = 4 а.е. (лет)?', en: 'What is the period of a planet with a = 4 AU (years)?' }, ans: 8, tol: 0.01 }]; }
  },
  seasons: {
    stage: { cam: [0, 14, 20], target: [0, 0, 0], grid: false }, live: true,
    params: [{ k: 'day', v: 172, min: 1, max: 365, step: 1, label: { kk: 'Жыл күні', ru: 'День года', en: 'Day of year' } }, { k: 'lat', v: 51, min: -66, max: 66, step: 1, label: { kk: 'Ендік φ', ru: 'Широта φ', en: 'Latitude φ' }, unit: '°' }],
    toggles: [{ k: 'play', v: false, icon: '▶', label: { kk: 'Анимация', ru: 'Анимация', en: 'Animate' } }],
    setup(S, P) {
      dimLights(S, 0.15); stars(S); const sun = S.sphere(1.6, 0xffc34d, [0, 0, 0], S.root, { material: new THREE.MeshBasicMaterial({ color: 0xffc34d }) }); S.scene.add(new THREE.PointLight(0xffffff, 3, 0, 0));
      const R = 9; const orb = new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 4, 200), new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.5 })); orb.rotation.x = Math.PI / 2; S.root.add(orb);
      const eG = new THREE.Group(); S.root.add(eG); const tilt = new THREE.Group(); tilt.rotation.z = rad(TILT); eG.add(tilt);
      const earth = S.mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.9 }), tilt); S.line([[0, -1.6, 0], [0, 1.6, 0]], 0xff6b9a, tilt);
      const eq = new THREE.Mesh(new THREE.TorusGeometry(1.01, 0.01, 4, 64), new THREE.MeshBasicMaterial({ color: 0xffd45e })); eq.rotation.x = Math.PI / 2; tilt.add(eq);
      const names = [[172, { kk: 'Жазғы күн тоқырау (22.VI)', ru: 'Летнее солнцестояние (22.VI)', en: 'June solstice (Jun 22)' }], [266, { kk: 'Күзгі күн мен түннің теңелуі (23.IX)', ru: 'Осеннее равноденствие (23.IX)', en: 'September equinox (Sep 23)' }], [355, { kk: 'Қысқы күн тоқырау (22.XII)', ru: 'Зимнее солнцестояние (22.XII)', en: 'December solstice (Dec 22)' }], [80, { kk: 'Көктемгі теңелу (21.III)', ru: 'Весеннее равноденствие (21.III)', en: 'March equinox (Mar 21)' }]];
      const pos = (d) => { const a = (d - 172) / 365 * 2 * Math.PI; return V3(R * Math.cos(a), 0, -R * Math.sin(a)); };
      names.forEach(([d, n]) => { const p = pos(d); S.sphere(0.1, 0xffffff, p.toArray()); S.label(tr(n), [p.x * 1.18, 0.4, p.z * 1.18], 'dim', S.root); });
      S.onTick((dt) => { if (P.play) { P.day = (P.day + dt * 20) % 365 || 1; inst.refresh && inst.refresh(); } eG.position.copy(pos(P.day)); earth.rotation.y += dt * 1.5; });
      const inst = { update() { eG.position.copy(pos(P.day)); } }; return inst;
    },
    formula(P) { const d = decl(P.day); return `h_\\text{max}=90^\\circ-\\varphi+\\delta=90^\\circ-${P.lat}^\\circ${d >= 0 ? '+' : '-'}${texNum(Math.abs(d), 1)}^\\circ=${texNum(noon(P), 1)}^\\circ`; },
    values(P) { const d = decl(P.day); const L = dayLen(P); const north = d > 1 ? { kk: 'жаз ☀️', ru: 'лето ☀️', en: 'summer ☀️' } : d < -1 ? { kk: 'қыс ❄️', ru: 'зима ❄️', en: 'winter ❄️' } : { kk: 'көктем/күз 🍂', ru: 'весна/осень 🍂', en: 'spring/autumn 🍂' };
      const dt = new Date(2026, 0, P.day); return [[{ kk: 'Күн', ru: 'Дата', en: 'Date' }, dt.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long' })], [{ kk: 'Күн еңісі δ', ru: 'Склонение Солнца δ', en: 'Solar declination δ' }, fmt(d, 1) + '°'],
        [{ kk: 'Түстегі Күн биіктігі', ru: 'Высота Солнца в полдень', en: 'Noon Sun altitude' }, fmt(noon(P), 1) + '°'], [{ kk: 'Күн ұзақтығы', ru: 'Продолжительность дня', en: 'Day length' }, fmt(L, 1) + ' ' + tr({ kk: 'сағ', ru: 'ч', en: 'h' })], [{ kk: 'Солтүстік жарты шар', ru: 'Северное полушарие', en: 'Northern hemisphere' }, tr(north)]]; },
    info: { kk: '**Жыл мезгілдері** Жер осінің орбита жазықтығына $66,5^\\circ$ (ал перпендикулярдан $23,5^\\circ$) көлбеулігінен болады — ось бағыты кеңістікте өзгермейді. Маусымда солтүстік жарты шар Күнге қарай еңкейеді — бізде жаз, күн ұзақ, Күн биік. Желтоқсанда керісінше. Түстегі Күн биіктігі: $h=90^\\circ-\\varphi+\\delta$, мұнда $\\delta$ — Күн еңісі ($-23,5^\\circ$…$+23,5^\\circ$).',
      ru: '**Времена года** возникают из-за наклона земной оси к плоскости орбиты на $66,5^\\circ$ ($23,5^\\circ$ от перпендикуляра) — направление оси в пространстве не меняется. В июне северное полушарие наклонено к Солнцу — у нас лето, длинный день, Солнце высоко. В декабре наоборот. Высота Солнца в полдень: $h=90^\\circ-\\varphi+\\delta$, где $\\delta$ — склонение Солнца ($-23,5^\\circ$…$+23,5^\\circ$).',
      en: '**Seasons** happen because Earth\'s axis is tilted $23.5^\\circ$ from the perpendicular to its orbit — and the axis keeps pointing the same way. In June the northern hemisphere leans toward the Sun: summer, long days, high Sun. In December it is the opposite. Noon Sun altitude: $h=90^\\circ-\\varphi+\\delta$, where $\\delta$ is the solar declination ($-23.5^\\circ$…$+23.5^\\circ$).' },
    tasks(P) { return [{ key: 'h_' + P.lat + '_' + Math.round(decl(P.day)), q: { kk: `φ = ${P.lat}°, δ = ${fmt(decl(P.day), 1)}°. Түстегі Күн биіктігін тап (°).`, ru: `φ = ${P.lat}°, δ = ${fmt(decl(P.day), 1)}°. Найди высоту Солнца в полдень (°).`, en: `φ = ${P.lat}°, δ = ${fmt(decl(P.day), 1)}°. Find the noon Sun altitude (°).` }, ans: noon(P), abs: 0.3 },
      { key: 'eq', q: { kk: 'Күн мен түннің теңелуі күні δ неге тең (°)?', ru: 'Чему равно δ в день равноденствия (°)?', en: 'What is δ on an equinox (°)?' }, ans: 0, abs: 0.01 }]; }
  }
};
function decl(d) { return 23.44 * Math.sin(2 * Math.PI * (d - 80) / 365); }
function noon(P) { const h = 90 - P.lat + decl(P.day); return h > 90 ? 180 - h : h; }
function dayLen(P) { const x = -Math.tan(rad(P.lat)) * Math.tan(rad(decl(P.day))); if (x <= -1) return 24; if (x >= 1) return 0; return 2 * Math.acos(x) * 180 / Math.PI / 15; }
