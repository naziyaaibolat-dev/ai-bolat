/* Химия: Бор атомының моделі (1–20 элемент) және молекулалардың 3D модельдері */
import { THREE, tr, fmt, texNum } from './core.js';
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const EL = [ // Z-1: [символ, kk, ru, en, масса, период, топ-баған(1..8)]
  ['H', 'Сутек', 'Водород', 'Hydrogen', 1.008, 1, 1], ['He', 'Гелий', 'Гелий', 'Helium', 4.003, 1, 8], ['Li', 'Литий', 'Литий', 'Lithium', 6.94, 2, 1], ['Be', 'Бериллий', 'Бериллий', 'Beryllium', 9.012, 2, 2],
  ['B', 'Бор', 'Бор', 'Boron', 10.81, 2, 3], ['C', 'Көміртек', 'Углерод', 'Carbon', 12.011, 2, 4], ['N', 'Азот', 'Азот', 'Nitrogen', 14.007, 2, 5], ['O', 'Оттек', 'Кислород', 'Oxygen', 15.999, 2, 6],
  ['F', 'Фтор', 'Фтор', 'Fluorine', 18.998, 2, 7], ['Ne', 'Неон', 'Неон', 'Neon', 20.18, 2, 8], ['Na', 'Натрий', 'Натрий', 'Sodium', 22.99, 3, 1], ['Mg', 'Магний', 'Магний', 'Magnesium', 24.305, 3, 2],
  ['Al', 'Алюминий', 'Алюминий', 'Aluminium', 26.982, 3, 3], ['Si', 'Кремний', 'Кремний', 'Silicon', 28.085, 3, 4], ['P', 'Фосфор', 'Фосфор', 'Phosphorus', 30.974, 3, 5], ['S', 'Күкірт', 'Сера', 'Sulfur', 32.06, 3, 6],
  ['Cl', 'Хлор', 'Хлор', 'Chlorine', 35.45, 3, 7], ['Ar', 'Аргон', 'Аргон', 'Argon', 39.948, 3, 8], ['K', 'Калий', 'Калий', 'Potassium', 39.098, 4, 1], ['Ca', 'Кальций', 'Кальций', 'Calcium', 40.078, 4, 2]];
const elName = (z) => EL[z - 1][{ kk: 1, ru: 2, en: 3 }[LANG] || 1];
const shells = (z) => { const cap = [2, 8, 8, 2]; const out = []; let r = z; for (const c of cap) { if (r <= 0) break; out.push(Math.min(c, r)); r -= c; } return out; };
const neutrons = (z) => Math.round(EL[z - 1][4]) - z;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const CPK = { H: 0xf5f5f5, C: 0x3a3a3a, O: 0xff3b3b, N: 0x3b6bff, Na: 0xab5cf2, Cl: 0x1fd15b };
const RAD = { H: 0.28, C: 0.42, O: 0.4, N: 0.41, Na: 0.5, Cl: 0.55 };
const VDW = { H: 0.6, C: 0.85, O: 0.8, N: 0.82, Na: 1.0, Cl: 0.95 };
const MASS = { H: 1.008, C: 12.011, O: 15.999, N: 14.007, Na: 22.99, Cl: 35.45 };
function glucose() {
  const at = [], b = []; const R = 1.45; const ring = ['O', 'C', 'C', 'C', 'C', 'C'];
  ring.forEach((e, k) => { const a = k * Math.PI / 3; at.push([e, R * Math.cos(a), (k % 2 ? 0.25 : -0.25), R * Math.sin(a)]); });
  for (let k = 0; k < 6; k++) b.push([k, (k + 1) % 6, 1]);
  const out = (k, s) => { const a = k * Math.PI / 3; return [Math.cos(a) * s, Math.sin(a) * s]; };
  for (let k = 1; k <= 5; k++) { const up = k % 2 ? 1 : -1; const [x, z] = out(k, R + 0.35); const i = k;
    at.push(['H', x, at[i][2] - up * 0.95, z]); b.push([i, at.length - 1, 1]);
    if (k <= 4) { const [x2, z2] = out(k, R + 0.9); at.push(['O', x2, at[i][2] + up * 0.7, z2]); b.push([i, at.length - 1, 1]); const oi = at.length - 1; const [x3, z3] = out(k, R + 1.55); at.push(['H', x3, at[oi][2] + up * 0.35, z3]); b.push([oi, at.length - 1, 1]); }
    else { const [x2, z2] = out(k, R + 1.1); at.push(['C', x2, at[i][2] + up * 0.9, z2]); b.push([i, at.length - 1, 1]); const ci = at.length - 1;
      at.push(['H', x2 + 0.6, at[ci][2] + 0.4, z2 - 0.5]); b.push([ci, at.length - 1, 1]); at.push(['H', x2 - 0.2, at[ci][2] + 0.5, z2 + 0.8]); b.push([ci, at.length - 1, 1]);
      const [x3, z3] = out(k, R + 2.2); at.push(['O', x3, at[ci][2] + 0.3, z3]); b.push([ci, at.length - 1, 1]); const oi = at.length - 1; at.push(['H', x3 + 0.5, at[oi][2] + 0.6, z3 + 0.4]); b.push([oi, at.length - 1, 1]); } }
  return { at, b };
}
function nacl() { const at = [], b = []; const n = 3, d = 1.4; const idx = {}; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { idx[i + ',' + j + ',' + k] = at.length; at.push([(i + j + k) % 2 ? 'Cl' : 'Na', (i - 1) * d, (j - 1) * d, (k - 1) * d]); }
  for (const key in idx) { const [i, j, k] = key.split(',').map(Number); for (const [a, c, e] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { const k2 = (i + a) + ',' + (j + c) + ',' + (k + e); if (idx[k2] !== undefined) b.push([idx[key], idx[k2], 0]); } } return { at, b }; }
const T4 = 0.63;
const MOL = {
  H2O: { f: 'H_2O', at: [['O', 0, 0, 0], ['H', 0.76, 0.59, 0], ['H', -0.76, 0.59, 0]], b: [[0, 1, 1], [0, 2, 1]], angle: 104.5, shape: { kk: 'бұрыштық', ru: 'угловая', en: 'bent' }, bond: 'polar', name: { kk: 'Су', ru: 'Вода', en: 'Water' } },
  CO2: { f: 'CO_2', at: [['C', 0, 0, 0], ['O', -1.16, 0, 0], ['O', 1.16, 0, 0]], b: [[0, 1, 2], [0, 2, 2]], angle: 180, shape: { kk: 'сызықтық', ru: 'линейная', en: 'linear' }, bond: 'polar', name: { kk: 'Көмірқышқыл газы', ru: 'Углекислый газ', en: 'Carbon dioxide' } },
  CH4: { f: 'CH_4', at: [['C', 0, 0, 0], ['H', T4, T4, T4], ['H', T4, -T4, -T4], ['H', -T4, T4, -T4], ['H', -T4, -T4, T4]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], angle: 109.5, shape: { kk: 'тетраэдр', ru: 'тетраэдр', en: 'tetrahedral' }, bond: 'polar', name: { kk: 'Метан', ru: 'Метан', en: 'Methane' } },
  NH3: { f: 'NH_3', at: [['N', 0, 0.3, 0], ...[0, 1, 2].map(k => ['H', 0.94 * Math.cos(k * 2.094), -0.08, 0.94 * Math.sin(k * 2.094)])], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], angle: 107, shape: { kk: 'үшбұрышты пирамида', ru: 'тригональная пирамида', en: 'trigonal pyramidal' }, bond: 'polar', name: { kk: 'Аммиак', ru: 'Аммиак', en: 'Ammonia' } },
  O2: { f: 'O_2', at: [['O', -0.6, 0, 0], ['O', 0.6, 0, 0]], b: [[0, 1, 2]], angle: 180, shape: { kk: 'сызықтық', ru: 'линейная', en: 'linear' }, bond: 'nonpolar', name: { kk: 'Оттек', ru: 'Кислород', en: 'Oxygen' } },
  N2: { f: 'N_2', at: [['N', -0.55, 0, 0], ['N', 0.55, 0, 0]], b: [[0, 1, 3]], angle: 180, shape: { kk: 'сызықтық', ru: 'линейная', en: 'linear' }, bond: 'nonpolar', name: { kk: 'Азот', ru: 'Азот', en: 'Nitrogen' } },
  NaCl: Object.assign(nacl(), { f: 'NaCl', angle: 90, shape: { kk: 'кубтық кристалдық тор', ru: 'кубическая кристаллическая решётка', en: 'cubic crystal lattice' }, bond: 'ionic', name: { kk: 'Ас тұзы', ru: 'Поваренная соль', en: 'Table salt' }, formulaUnits: 1 }),
  C2H5OH: { f: 'C_2H_5OH', at: [['C', -0.76, 0, 0], ['C', 0.76, 0, 0], ['O', 1.24, 1.35, 0], ['H', 2.2, 1.3, 0], ['H', -1.12, 1.03, 0], ['H', -1.12, -0.51, 0.89], ['H', -1.12, -0.51, -0.89], ['H', 1.12, -0.51, 0.89], ['H', 1.12, -0.51, -0.89]],
    b: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1]], angle: 109.5, shape: { kk: 'тетраэдрлік көміртектер', ru: 'тетраэдрические атомы C', en: 'tetrahedral carbons' }, bond: 'polar', name: { kk: 'Этил спирті', ru: 'Этиловый спирт', en: 'Ethanol' } },
  C6H12O6: Object.assign(glucose(), { f: 'C_6H_{12}O_6', angle: 109.5, shape: { kk: 'алтымүшелі сақина', ru: 'шестичленный цикл', en: 'six-membered ring' }, bond: 'polar', name: { kk: 'Глюкоза', ru: 'Глюкоза', en: 'Glucose' } })
};
const BOND = { polar: { kk: 'ковалентті полюсті', ru: 'ковалентная полярная', en: 'polar covalent' }, nonpolar: { kk: 'ковалентті полюссіз', ru: 'ковалентная неполярная', en: 'nonpolar covalent' }, ionic: { kk: 'иондық', ru: 'ионная', en: 'ionic' } };
function molMass(key) { const m = MOL[key]; if (key === 'NaCl') return MASS.Na + MASS.Cl; return m.at.reduce((a, x) => a + MASS[x[0]], 0); }
function atomCount(key) { if (key === 'NaCl') return 2; return MOL[key].at.length; }

export const labs = {
  atom: {
    stage: { cam: [0, 4, 10], target: [0, 0, 0], grid: false },
    options: [{ k: 'z', v: '6', table: true, label: { kk: 'Периодтық кесте (1–20)', ru: 'Периодическая таблица (1–20)', en: 'Periodic table (1–20)' }, items: EL.map((e, i) => ({ v: String(i + 1), label: e[0], pos: [e[5], e[6]], sub: i + 1 })) }],
    params: [{ k: 'sp', v: 1, min: 0, max: 3, step: 0.1, label: { kk: 'Электрон жылдамдығы', ru: 'Скорость электронов', en: 'Electron speed' } }],
    toggles: [{ k: 'rings', v: true, icon: '⭕', label: { kk: 'Орбиталар', ru: 'Орбиты', en: 'Orbits' } }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g); let es = [];
      const build = () => { S.clear(g); es = []; const z = +P.z, n = neutrons(z); const nuc = new THREE.Group(); g.add(nuc); const total = z + n; const R = 0.22 * Math.cbrt(total);
        const pts = []; for (let i = 0; i < total; i++) { const phi = Math.acos(1 - 2 * (i + 0.5) / total), th = Math.PI * (1 + Math.sqrt(5)) * i; const rr = R * Math.cbrt((i + 1) / total); pts.push(V3(rr * Math.sin(phi) * Math.cos(th), rr * Math.cos(phi), rr * Math.sin(phi) * Math.sin(th))); }
        pts.forEach((p, i) => { const pr = i % 2 === 0 ? (i / 2 < z) : (Math.floor(i / 2) >= n); const isP = (i < 2 * Math.min(z, n)) ? i % 2 === 0 : z > n; const s = S.sphere(0.16, isP ? 0xff4d6d : 0x9aa0b5, null, nuc, { seg: 16, m: { roughness: 0.35 } }); s.position.copy(p); });
        S.label(`<b>${EL[z - 1][0]}</b>`, [0, R + 0.5, 0], 'dim big', g);
        shells(z).forEach((cnt, si) => { const r = 1.4 + si * 0.9; const tilt = [0.2, -0.35, 0.5, -0.15][si]; const ring = new THREE.Group(); ring.rotation.set(Math.PI / 2 + tilt, tilt * 0.6, 0); g.add(ring);
          const tor = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.6 })); ring.add(tor); tor.userData.ring = 1;
          for (let k = 0; k < cnt; k++) { const e = S.sphere(0.11, 0x3ea6ff, null, ring, { seg: 16, m: { emissive: 0x1d5cff, emissiveIntensity: 0.8 } }); es.push({ e, r, a: k / cnt * Math.PI * 2, w: 1.6 / (si + 1) }); }
          S.label(String(cnt) + 'e⁻', [r + 0.25, 0, 0], 'dim', ring); });
        g.traverse(o => { if (o.userData.ring) o.visible = P.rings; }); };
      S.onTick((dt) => { es.forEach(o => { o.a += dt * o.w * P.sp; o.e.position.set(o.r * Math.cos(o.a), o.r * Math.sin(o.a), 0); }); });
      return { update(P2, k) { if (k === 'sp') return; build(); } };
    },
    formula(P) { const z = +P.z; return `{}^{${Math.round(EL[z - 1][4])}}_{${z}}\\mathrm{${EL[z - 1][0]}}:\\; p^+=${z},\\; n^0=${neutrons(z)},\\; e^-=${z}`; },
    values(P) { const z = +P.z, e = EL[z - 1], sh = shells(z); return [[{ kk: 'Элемент', ru: 'Элемент', en: 'Element' }, elName(z) + ' (' + e[0] + ')'], [{ kk: 'Реттік нөмір Z', ru: 'Порядковый номер Z', en: 'Atomic number Z' }, z], [{ kk: 'Салыстырмалы атомдық масса', ru: 'Относительная атомная масса', en: 'Relative atomic mass' }, fmt(e[4], 3)],
      [{ kk: 'Электрон қабаттары', ru: 'Электронные слои', en: 'Electron shells' }, sh.join(', ')], [{ kk: 'Период / топ', ru: 'Период / группа', en: 'Period / group' }, e[5] + ' / ' + ROMAN[e[6] - 1] + 'A'], [{ kk: 'Сыртқы электрондар', ru: 'Внешние электроны', en: 'Valence electrons' }, sh[sh.length - 1]]]; },
    info: { kk: 'Атом **ядродан** (протондар $p^+$ қызыл, нейтрондар $n^0$ сұр) және оны айнала қозғалатын **электрондардан** $e^-$ тұрады. Протон саны = реттік нөмір $Z$ = электрон саны. Нейтрон саны: $N = A - Z$. Электрондар қабаттарға толтырылады: 1-қабатта ең көбі 2, 2-қабатта 8, 3-қабатта 8 (20 элементке дейін). **Период нөмірі** = қабат саны, **топ нөмірі** (А) = сыртқы электрон саны.',
      ru: 'Атом состоит из **ядра** (протоны $p^+$ красные, нейтроны $n^0$ серые) и **электронов** $e^-$ вокруг него. Число протонов = порядковый номер $Z$ = число электронов. Число нейтронов: $N = A - Z$. Электроны заполняют слои: на 1-м не больше 2, на 2-м — 8, на 3-м — 8 (для первых 20 элементов). **Номер периода** = число слоёв, **номер группы** (А) = число внешних электронов.',
      en: 'An atom has a **nucleus** (protons $p^+$ red, neutrons $n^0$ grey) and **electrons** $e^-$ around it. Protons = atomic number $Z$ = electrons. Neutrons: $N = A - Z$. Electrons fill shells: max 2 in the 1st, 8 in the 2nd, 8 in the 3rd (for the first 20 elements). **Period** = number of shells, **group** (A) = number of outer electrons.' },
    tasks(P) { const z = +P.z; const sh = shells(z); return [{ key: 'n_' + z, q: { kk: `${elName(z)} атомында неше нейтрон бар? (A ≈ ${Math.round(EL[z - 1][4])})`, ru: `Сколько нейтронов в атоме: ${elName(z)}? (A ≈ ${Math.round(EL[z - 1][4])})`, en: `How many neutrons does ${elName(z)} have? (A ≈ ${Math.round(EL[z - 1][4])})` }, ans: neutrons(z), abs: 0.01, tol: 0 },
      { key: 'v_' + z, q: { kk: 'Сыртқы қабатта неше электрон бар?', ru: 'Сколько электронов на внешнем слое?', en: 'How many electrons are in the outer shell?' }, ans: sh[sh.length - 1], tol: 0 }]; }
  },
  molecules: {
    stage: { cam: [0, 2, 7], target: [0, 0, 0], grid: false },
    options: [{ k: 'mol', v: 'H2O', label: { kk: 'Молекула', ru: 'Молекула', en: 'Molecule' }, items: Object.keys(MOL).map(k => ({ v: k, label: MOL[k].f.replace(/_\{?(\d+)\}?/g, (m, d) => d.split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[c]).join('')) })) },
      { k: 'style', v: 'ball', label: { kk: 'Модель түрі', ru: 'Тип модели', en: 'Model style' }, items: [{ v: 'ball', icon: '⚛️', label: { kk: 'Шар-таяқша', ru: 'Шаростержневая', en: 'Ball-and-stick' } }, { v: 'fill', icon: '🔵', label: { kk: 'Кеңістіктік', ru: 'Объёмная', en: 'Space-filling' } }] }],
    toggles: [{ k: 'spin', v: true, icon: '🔄', label: { kk: 'Айналдыру', ru: 'Вращение', en: 'Spin' } }, { k: 'names', v: false, icon: '🏷️', label: { kk: 'Атом белгілері', ru: 'Подписи атомов', en: 'Atom labels' } }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g);
      const build = () => { S.clear(g); S.pickables = []; const m = MOL[P.mol]; const sc = 1.3; const pos = m.at.map(a => V3(a[1], a[2], a[3]).multiplyScalar(sc));
        const c = pos.reduce((a, p) => a.add(p), V3()).multiplyScalar(1 / pos.length); pos.forEach(p => p.sub(c));
        m.at.forEach((a, i) => { const r = P.style === 'fill' ? VDW[a[0]] * sc : RAD[a[0]]; const s = S.sphere(r, CPK[a[0]], null, g, { seg: 32, m: { roughness: 0.3, metalness: 0.05 } }); s.position.copy(pos[i]); s.userData.pick = { el: a[0], i }; S.pickables.push(s);
          if (P.names) S.label(a[0], [pos[i].x, pos[i].y + r + 0.15, pos[i].z], 'dim', g); });
        if (P.style === 'ball') m.b.forEach(([i, j, o]) => { const a = pos[i], b = pos[j]; const d = b.clone().sub(a); const len = d.length(); const perp = V3(0, 0, 1).cross(d).normalize(); if (perp.lengthSq() < 0.1) perp.set(0, 1, 0);
          const k = Math.max(1, o); for (let t = 0; t < k; t++) { const off = perp.clone().multiplyScalar((t - (k - 1) / 2) * 0.14); const cyl = S.mesh(new THREE.CylinderGeometry(o ? 0.07 : 0.03, o ? 0.07 : 0.03, len, 12), S.mat(o ? 0xcfd3e6 : 0x8a86b8, o ? {} : { transparent: true, opacity: 0.5 }), g);
            cyl.position.copy(a.clone().add(b).multiplyScalar(0.5)).add(off); cyl.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize()); } }); };
      S.onPick = (pk) => { if (!pk) return S.showPick(null); const ix = { H: 1, C: 6, N: 7, O: 8, Na: 11, Cl: 17 }[pk.el]; S.showPick(`<b>${pk.el}</b> — ${elName(ix)} · Z = ${ix} · A<sub>r</sub> = ${fmt(MASS[pk.el], 3)}`); };
      S.onTick((dt) => { if (P.spin) g.rotation.y += dt * 0.5; });
      return { update(P2, k) { if (k === 'spin') return; build(); } };
    },
    formula(P) { const m = MOL[P.mol]; return `M(\\mathrm{${m.f}})=${texNum(molMass(P.mol), 1)}\\;\\text{${tr({ kk: 'г/моль', ru: 'г/моль', en: 'g/mol' })}}`; },
    values(P) { const m = MOL[P.mol]; return [[{ kk: 'Зат', ru: 'Вещество', en: 'Substance' }, tr(m.name)], [{ kk: 'Пішіні', ru: 'Форма', en: 'Shape' }, tr(m.shape)], [{ kk: 'Байланыс', ru: 'Связь', en: 'Bond' }, tr(BOND[m.bond])],
      [{ kk: 'Валенттік бұрыш', ru: 'Валентный угол', en: 'Bond angle' }, fmt(m.angle, 1) + '°'], [{ kk: 'Молярлық масса', ru: 'Молярная масса', en: 'Molar mass' }, fmt(molMass(P.mol), 1) + ' ' + tr({ kk: 'г/моль', ru: 'г/моль', en: 'g/mol' })]]; },
    info: { kk: 'Молекула — атомдардың **химиялық байланыс** арқылы бірігуі. Шарлар — атомдар (ақ — H, сұр — C, қызыл — O, көк — N), таяқшалар — байланыстар (қос таяқша — қос байланыс). Молекула пішіні электрон жұптарының тебілуімен анықталады: $\\mathrm{CH_4}$ — тетраэдр (109,5°), $\\mathrm{H_2O}$ — бұрыштық (104,5°), $\\mathrm{CO_2}$ — сызықтық (180°). Атомды бас — ол туралы мәлімет шығады. Молярлық масса: $M = \\sum A_r$.',
      ru: 'Молекула — объединение атомов **химическими связями**. Шары — атомы (белый — H, серый — C, красный — O, синий — N), палочки — связи (двойная палочка — двойная связь). Форма молекулы определяется отталкиванием электронных пар: $\\mathrm{CH_4}$ — тетраэдр (109,5°), $\\mathrm{H_2O}$ — угловая (104,5°), $\\mathrm{CO_2}$ — линейная (180°). Нажми на атом — появится информация. Молярная масса: $M = \\sum A_r$.',
      en: 'A molecule is atoms joined by **chemical bonds**. Balls are atoms (white H, grey C, red O, blue N), sticks are bonds (double stick = double bond). The shape comes from electron-pair repulsion: $\\mathrm{CH_4}$ is tetrahedral (109.5°), $\\mathrm{H_2O}$ bent (104.5°), $\\mathrm{CO_2}$ linear (180°). Click an atom for info. Molar mass: $M = \\sum A_r$.' },
    tasks(P) { const m = MOL[P.mol]; return [{ key: 'M_' + P.mol, q: { kk: `$\\mathrm{${m.f}}$ молярлық массасын есепте (г/моль). $A_r$: H=1, C=12, N=14, O=16, Na=23, Cl=35,5`, ru: `Вычисли молярную массу $\\mathrm{${m.f}}$ (г/моль). $A_r$: H=1, C=12, N=14, O=16, Na=23, Cl=35,5`, en: `Compute the molar mass of $\\mathrm{${m.f}}$ (g/mol). $A_r$: H=1, C=12, N=14, O=16, Na=23, Cl=35.5` }, ans: molMass(P.mol), tol: 0.015 },
      { key: 'N_' + P.mol, q: { kk: 'Бір молекулада (формулалық бірлікте) барлығы неше атом бар?', ru: 'Сколько всего атомов в одной молекуле (формульной единице)?', en: 'How many atoms are in one molecule (formula unit)?' }, ans: atomCount(P.mol), tol: 0 }]; }
  }
};
