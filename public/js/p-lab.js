'use strict';
/* ===== 3D зертхана: каталог, зертхана беті, сабақтарға байланыстыру (Three.js тек осында жүктеледі) ===== */
const LAB_CATS = [['all', '✨', 'lab_all'], ['math', '📐', 'lab_c_math'], ['phys', '⚛️', 'lab_c_phys'], ['chem', '🧪', 'lab_c_chem'], ['bio', '🧬', 'lab_c_bio'], ['geo', '🌍', 'lab_c_geo']];
const LAB_META = [
  { id: 'solids', file: 'geom', cat: 'math', icon: '🧊', color: '#7c5cff', g: '3–11', name: ['Геометриялық денелер', 'Геометрические тела', 'Geometric solids'], desc: ['Куб, призма, пирамида, цилиндр, конус, шар, қиық конус: жазба, қима, көлем мен аудан', 'Куб, призма, пирамида, цилиндр, конус, шар, усечённый конус: развёртка, сечение, объём и площадь', 'Cube, prisms, pyramid, cylinder, cone, sphere, frustum: nets, sections, volume and area'] },
  { id: 'fgraph', file: 'math', cat: 'math', icon: '📈', color: '#ff6b9a', g: '6–11', name: ['Функция графиктері', 'Графики функций', 'Function graphs'], desc: ['y = kx + b, парабола, гипербола, синусоида… коэффициенттерді өзгертіп бақыла', 'y = kx + b, парабола, гипербола, синусоида… меняй коэффициенты и наблюдай', 'y = kx + b, parabola, hyperbola, sine… change coefficients and watch'] },
  { id: 'fsurface', file: 'math', cat: 'math', icon: '🏔️', color: '#00d1b2', g: '9–11', name: ['3D беттер z = f(x, y)', '3D поверхности z = f(x, y)', '3D surfaces z = f(x, y)'], desc: ['Параболоид, ер, толқын, Гаусс төбесі — екі айнымалының функциясы', 'Параболоид, седло, волна, гауссов холм — функции двух переменных', 'Paraboloid, saddle, wave, Gaussian hill — functions of two variables'] },
  { id: 'pendulum', file: 'phys', cat: 'phys', icon: '🕰️', color: '#ffb020', g: '9–11', name: ['Маятник', 'Маятник', 'Pendulum'], desc: ['Период ұзындыққа және g-ге қалай тәуелді? Жер, Ай, Марс, Юпитер', 'Как период зависит от длины и g? Земля, Луна, Марс, Юпитер', 'How does the period depend on length and g? Earth, Moon, Mars, Jupiter'] },
  { id: 'incline', file: 'phys', cat: 'phys', icon: '⛷️', color: '#3ea6ff', g: '7–10', name: ['Көлбеу жазықтық', 'Наклонная плоскость', 'Inclined plane'], desc: ['Күштер: mg, N, үйкеліс. Ньютонның II заңы', 'Силы: mg, N, трение. II закон Ньютона', 'Forces: mg, N, friction. Newton\'s 2nd law'] },
  { id: 'projectile', file: 'phys', cat: 'phys', icon: '🚀', color: '#ff6b9a', g: '9–10', name: ['Бұрышпен лақтыру', 'Бросок под углом', 'Projectile motion'], desc: ['Траектория, ұшу қашықтығы, максимал биіктік', 'Траектория, дальность, максимальная высота', 'Trajectory, range and maximum height'] },
  { id: 'optics', file: 'phys', cat: 'phys', icon: '🔍', color: '#9fd8ff', g: '8–11', name: ['Линзалар және сәулелер', 'Линзы и лучи', 'Lenses and rays'], desc: ['Жинағыш және шашыратқыш линза, кескін салу, 1/F = 1/d + 1/f', 'Собирающая и рассеивающая линза, построение изображения', 'Converging and diverging lenses, image construction'] },
  { id: 'circuit', file: 'phys', cat: 'phys', icon: '💡', color: '#ffd45e', g: '8–10', name: ['Электр тізбегі', 'Электрическая цепь', 'Electric circuit'], desc: ['Ом заңы, тізбектей және параллель жалғау, электрондар ағыны', 'Закон Ома, последовательное и параллельное соединение', 'Ohm\'s law, series and parallel connection, electron flow'] },
  { id: 'waves', file: 'phys', cat: 'phys', icon: '🌊', color: '#00e0c6', g: '9–11', name: ['Толқындар', 'Волны', 'Waves'], desc: ['Көлденең, бойлық және судағы толқындар; v = λν', 'Поперечные, продольные и волны на воде; v = λν', 'Transverse, longitudinal and water waves; v = λν'] },
  { id: 'atom', file: 'chem', cat: 'chem', icon: '⚛️', color: '#ff4d6d', g: '7–9', name: ['Атом құрылысы', 'Строение атома', 'Atomic structure'], desc: ['Бор моделі, 1–20 элемент, мини периодтық кесте', 'Модель Бора, элементы 1–20, мини-таблица Менделеева', 'Bohr model, elements 1–20, mini periodic table'] },
  { id: 'molecules', file: 'chem', cat: 'chem', icon: '🧪', color: '#22d39a', g: '7–11', name: ['Молекулалар 3D', 'Молекулы 3D', '3D molecules'], desc: ['H₂O, CO₂, CH₄, NH₃, O₂, N₂, NaCl, C₂H₅OH, глюкоза', 'H₂O, CO₂, CH₄, NH₃, O₂, N₂, NaCl, C₂H₅OH, глюкоза', 'H₂O, CO₂, CH₄, NH₃, O₂, N₂, NaCl, C₂H₅OH, glucose'] },
  { id: 'cell', file: 'bio', cat: 'bio', icon: '🦠', color: '#ff9fb0', g: '5–9', name: ['Жасуша', 'Клетка', 'The cell'], desc: ['Жануар және өсімдік жасушасы, органоидтарды басып зертте', 'Животная и растительная клетка, нажимай на органоиды', 'Animal and plant cells with clickable organelles'] },
  { id: 'dna', file: 'bio', cat: 'bio', icon: '🧬', color: '#9a8cff', g: '9–11', name: ['ДНҚ қос спиралі', 'Двойная спираль ДНК', 'DNA double helix'], desc: ['Комплементарлық A–T, G–C, Чаргафф ережесі', 'Комплементарность A–T, G–C, правило Чаргаффа', 'Complementarity A–T, G–C, Chargaff\'s rule'] },
  { id: 'earth', file: 'space', cat: 'geo', icon: '🌍', color: '#3e8ef7', g: '2–8', name: ['Жер: күн мен түн', 'Земля: день и ночь', 'Earth: day and night'], desc: ['Жердің айналуы, уақыт белдеулері, ендік пен бойлық', 'Вращение Земли, часовые пояса, широта и долгота', 'Earth\'s rotation, time zones, latitude and longitude'] },
  { id: 'solar', file: 'space', cat: 'geo', icon: '🪐', color: '#e8d49a', g: '2–11', name: ['Күн жүйесі', 'Солнечная система', 'Solar System'], desc: ['8 планета, орбиталар, Кеплер заңы', '8 планет, орбиты, закон Кеплера', '8 planets, orbits, Kepler\'s law'] },
  { id: 'seasons', file: 'space', cat: 'geo', icon: '🍂', color: '#ff8a4c', g: '5–8', name: ['Жыл мезгілдері', 'Времена года', 'Seasons'], desc: ['Жер осінің көлбеулігі, күн ұзақтығы, Күн биіктігі', 'Наклон земной оси, долгота дня, высота Солнца', 'Axial tilt, day length and Sun altitude'] }
];
const labName = (m) => m.name[LANGS[LANG]] || m.name[0];
const labDesc = (m) => m.desc[LANGS[LANG]] || m.desc[0];
const LAB_RULES = [ // [регекс (en+ru+kk атауы), зертхана, preset, пәндер]
  [/\bcubes?\b(?!.*root)|куб(?!ический корень| түбір)/i, 'solids', { shape: 'cube' }, ['math', 'geom']], [/rectangular (box|prism|parallelepiped)|cuboid|parallelepiped/i, 'solids', { shape: 'cuboid' }, ['math', 'geom']],
  [/\bprisms?\b/i, 'solids', { shape: 'prism3' }, ['geom', 'math']], [/pyramid/i, 'solids', { shape: 'pyramid' }, ['geom', 'math']], [/cylinder/i, 'solids', { shape: 'cylinder' }, ['geom', 'math']],
  [/frustum|truncated/i, 'solids', { shape: 'frustum' }, ['geom']], [/\bcones?\b/i, 'solids', { shape: 'cone' }, ['geom', 'math']], [/\bsphere\b|\bball\b/i, 'solids', { shape: 'sphere' }, ['geom', 'math']],
  [/volume|surface area|polyhedr|solids?\b|3d shapes/i, 'solids', {}, ['geom', 'math']],
  [/function|graph|parabola|quadratic|hyperbola|linear equation|y ?= ?/i, 'fgraph', {}, ['alg', 'math']], [/sine|cosine|trigonometric function/i, 'fgraph', { fn: 'sin' }, ['alg']],
  [/coordinates in space|space coordinates|surface|two variables/i, 'fsurface', {}, ['geom', 'alg']],
  [/pendulum|oscillat|harmonic/i, 'pendulum', {}, ['phys']], [/inclined|friction|newton|forces?\b|dynamics/i, 'incline', {}, ['phys']],
  [/projectile|thrown|angle to the horizon|free fall|kinematics|curvilinear/i, 'projectile', {}, ['phys']], [/lens|optic|refraction|light|reflection|mirror/i, 'optics', {}, ['phys', 'zharat']],
  [/ohm|circuit|current|resistance|voltage|electric/i, 'circuit', {}, ['phys', 'zharat']], [/wave|sound|acoustic/i, 'waves', {}, ['phys']],
  [/atom|periodic|electron|element|isotope|nucle/i, 'atom', {}, ['chem', 'phys', 'zharat']], [/molecul|bond|water|methane|ammonia|carbon dioxide|alcohol|glucose|crystal|covalent|ionic|hydrocarbon|organic/i, 'molecules', {}, ['chem', 'zharat']],
  [/cell|organelle|mitochond|chloroplast|tissue|microscope/i, 'cell', {}, ['bio', 'zharat', 'dunie']], [/dna|gene|heredit|nucleic|chromosom|genetic/i, 'dna', {}, ['bio']],
  [/solar system|planet|universe|space|\bsun\b|stars?\b|moon|astronom|galax/i, 'solar', {}, ['geo', 'zharat', 'dunie', 'phys']], [/season|revolution|orbit/i, 'seasons', {}, ['geo', 'zharat', 'dunie']],
  [/earth|globe|day and night|time zone|latitude|longitude|map\b|horizon|compass/i, 'earth', {}, ['geo', 'zharat', 'dunie']]
];
function labsForTopic(t) {
  if (!t) return []; const txt = [t.en, t.ru, t.kk].join(' | '); const out = []; const seen = new Set();
  for (const [re, id, preset, subs] of LAB_RULES) { if (subs && !subs.includes(t.subject)) continue; if (re.test(txt) && !seen.has(id)) { seen.add(id); out.push({ id, preset, meta: LAB_META.find(m => m.id === id) }); } }
  return out.slice(0, 2);
}
function labsForSubject(s) { const map = { geom: ['solids'], math: ['solids', 'fgraph'], alg: ['fgraph', 'fsurface'], phys: ['pendulum', 'incline', 'projectile', 'optics', 'circuit', 'waves'], chem: ['atom', 'molecules'], bio: ['cell', 'dna'], geo: ['earth', 'seasons', 'solar'], zharat: ['cell', 'solar', 'earth', 'circuit'], dunie: ['earth', 'solar', 'seasons'] }; return (map[s] || []).map(id => LAB_META.find(m => m.id === id)); }
function labCard(m, big) { return `<a class="card hov labcard ${big ? 'big' : ''}" href="#/lab/${m.id}" style="--c:${m.color}"><div class="lc-ico">${m.icon}</div><div class="grow"><h3>${esc(labName(m))}</h3><p class="small muted">${esc(labDesc(m))}</p><span class="tag">${T('grade')} ${m.g}</span> <span class="tag ai">3D</span></div></a>`; }
function labPresetHash(l) { const q = new URLSearchParams(l.preset || {}).toString(); return `#/lab/${l.id}${q ? '?' + q : ''}`; }
async function mountLabInto(host, id, preset, compact) {
  const meta = LAB_META.find(m => m.id === id); if (!meta) throw new Error('lab?');
  host.innerHTML = `<div class="lab-loading"><div class="dots"><i></i><i></i><i></i></div><p class="small muted">${T('lab_loading')}</p></div>`;
  const [core, mod] = await Promise.all([import('/js/lab/core.js'), import('/js/lab/' + meta.file + '.js')]);
  const def = mod.labs[id]; const P = {};
  for (const [k, v] of Object.entries(preset || {})) { const p = (def.params || []).find(x => x.k === k); if (p) P[k] = Math.max(p.min, Math.min(p.max, +v)); else if ((def.options || []).some(o => o.k === k)) P[k] = String(v); else if ((def.toggles || []).some(t => t.k === k)) P[k] = v === true || v === 'true' || v === '1'; }
  const h = core.mountLab(host, def, meta, { compact, preset: P, onTask: async (lab, key, ok) => { const r = await api('POST', '/api/lab/task', { lab, key, ok }); refreshUser(r.user); if (r.levelUp) { toast(T('level_up', { n: r.user.level })); confetti(); } return r.xp; } });
  api('POST', '/api/lab/visit', { lab: id }).then(r => { if (r.first) toast('🔬 ' + T('lab_new_badge')); }).catch(() => { });
  return h;
}
route('lab', async (view, r) => {
  const id = r.args[0];
  if (!id) {
    const cat = r.query.c || 'all'; const list = LAB_META.filter(m => cat === 'all' || m.cat === cat);
    view.innerHTML = `<div class="page stack">
      <div class="hero labhero"><div class="row between" style="position:relative;z-index:1"><div><span class="tag ai">NEW · 3D</span><h1>🔬 ${T('lab_title')}</h1><p class="muted" style="max-width:620px">${T('lab_sub')}</p>
        <div class="row" style="margin-top:12px"><span class="chipxp">🧪 ${LAB_META.length} ${T('lab_count')}</span><span class="chipxp">🎯 ${T('lab_tasks_xp')}</span></div></div><div class="orbit3d"><i></i><i></i><i></i><b>⚛️</b></div></div></div>
      <div class="chips">${LAB_CATS.map(([k, ic, l]) => `<a class="chip ${cat === k ? 'on' : ''}" href="#/lab?c=${k}">${ic} ${T(l)}</a>`).join('')}</div>
      <div class="grid g3 labgrid">${list.map(m => labCard(m)).join('')}</div></div>`;
    return;
  }
  const meta = LAB_META.find(m => m.id === id); if (!meta) { view.innerHTML = `<div class="page">${emptyHtml('🔬', T('not_found'))}</div>`; return; }
  const others = LAB_META.filter(m => m.cat === meta.cat && m.id !== id);
  view.innerHTML = `<div class="page stack">
    <div class="crumbs"><a href="#/lab">🔬 ${T('lab_title')}</a> › <a href="#/lab?c=${meta.cat}">${T(LAB_CATS.find(c => c[0] === meta.cat)[2])}</a></div>
    <div class="lhead"><div><h1>${meta.icon} ${esc(labName(meta))}</h1><p class="muted">${esc(labDesc(meta))}</p></div><div class="row"><a class="btn sm" href="#/bolat">🤖 ${T('ask_bolat')}</a></div></div>
    <div id="labHost"></div>
    ${others.length ? `<h2 style="margin-top:10px">🔭 ${T('lab_more')}</h2><div class="grid g3">${others.map(m => labCard(m)).join('')}</div>` : ''}</div>`;
  let h = null;
  try { h = await mountLabInto($('#labHost'), id, r.query, false); } catch (e) { $('#labHost').innerHTML = errBox(e); console.error(e); }
  return () => { if (h) h.dispose(); };
});
