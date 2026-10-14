/* Биология: жануар және өсімдік жасушасы (басылатын органоидтар), ДНҚ қос спиралі */
import { THREE, tr, fmt } from './core.js';
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const ORG = {
  membrane: [{ kk: 'Жасуша мембранасы', ru: 'Клеточная мембрана', en: 'Cell membrane' }, { kk: 'Жасушаны қоршап, заттардың кіруі мен шығуын реттейді.', ru: 'Окружает клетку и регулирует вход и выход веществ.', en: 'Surrounds the cell and controls what enters and leaves.' }],
  nucleus: [{ kk: 'Ядро', ru: 'Ядро', en: 'Nucleus' }, { kk: 'Тұқым қуалау ақпаратын (ДНҚ) сақтайды және жасушаның тіршілігін басқарады.', ru: 'Хранит наследственную информацию (ДНК) и управляет жизнью клетки.', en: 'Stores hereditary information (DNA) and controls the cell.' }],
  nucleolus: [{ kk: 'Ядрошық', ru: 'Ядрышко', en: 'Nucleolus' }, { kk: 'Рибосомалар осында түзіледі.', ru: 'Здесь образуются рибосомы.', en: 'Ribosomes are assembled here.' }],
  mito: [{ kk: 'Митохондрия', ru: 'Митохондрия', en: 'Mitochondrion' }, { kk: 'Жасушаның «энергия станциясы»: тыныс алу кезінде АТФ түзеді.', ru: '«Энергетическая станция» клетки: образует АТФ при дыхании.', en: 'The cell\'s "power station": makes ATP during respiration.' }],
  er: [{ kk: 'Эндоплазмалық тор (ЭПТ)', ru: 'Эндоплазматическая сеть (ЭПС)', en: 'Endoplasmic reticulum (ER)' }, { kk: 'Ақуыздар мен майларды түзеді және тасымалдайды.', ru: 'Синтезирует и транспортирует белки и липиды.', en: 'Makes and transports proteins and lipids.' }],
  golgi: [{ kk: 'Гольджи жиынтығы', ru: 'Аппарат Гольджи', en: 'Golgi apparatus' }, { kk: 'Заттарды жинақтап, сұрыптап, «қаптайды» және жасушадан шығарады.', ru: 'Накапливает, сортирует, «упаковывает» и выводит вещества.', en: 'Collects, sorts and packages substances for export.' }],
  ribo: [{ kk: 'Рибосомалар', ru: 'Рибосомы', en: 'Ribosomes' }, { kk: 'Ақуыз синтезі жүретін ұсақ денешіктер.', ru: 'Мелкие органоиды, где идёт синтез белка.', en: 'Tiny organelles where proteins are made.' }],
  lyso: [{ kk: 'Лизосома', ru: 'Лизосома', en: 'Lysosome' }, { kk: 'Ферменттері арқылы заттарды ыдыратады («қорыту»).', ru: 'Расщепляет вещества ферментами («переваривание»).', en: 'Breaks down substances with enzymes ("digestion").' }],
  centriole: [{ kk: 'Центриольдер', ru: 'Центриоли', en: 'Centrioles' }, { kk: 'Жасуша бөлінуіне қатысады (жануар жасушасында).', ru: 'Участвуют в делении клетки (у животных).', en: 'Help the cell divide (in animal cells).' }],
  wall: [{ kk: 'Жасуша қабырғасы', ru: 'Клеточная стенка', en: 'Cell wall' }, { kk: 'Целлюлозадан тұрады, жасушаға пішін беріп, қорғайды.', ru: 'Состоит из целлюлозы, придаёт форму и защищает.', en: 'Made of cellulose; gives shape and protection.' }],
  vacuole: [{ kk: 'Орталық вакуоль', ru: 'Центральная вакуоль', en: 'Central vacuole' }, { kk: 'Жасуша шырынын сақтайды, тургорды (қысымды) ұстайды.', ru: 'Хранит клеточный сок, поддерживает тургор.', en: 'Stores cell sap and keeps turgor pressure.' }],
  chloro: [{ kk: 'Хлоропласт', ru: 'Хлоропласт', en: 'Chloroplast' }, { kk: 'Хлорофилл бар, фотосинтез жүреді: жарық энергиясы → глюкоза.', ru: 'Содержит хлорофилл, здесь идёт фотосинтез: свет → глюкоза.', en: 'Contains chlorophyll; photosynthesis happens here: light → glucose.' }]
};
export const labs = {
  cell: {
    stage: { cam: [0, 3, 9], target: [0, 0, 0], grid: false },
    options: [{ k: 'type', v: 'animal', label: { kk: 'Жасуша түрі', ru: 'Тип клетки', en: 'Cell type' }, items: [{ v: 'animal', icon: '🐾', label: { kk: 'Жануар', ru: 'Животная', en: 'Animal' } }, { v: 'plant', icon: '🌿', label: { kk: 'Өсімдік', ru: 'Растительная', en: 'Plant' } }] }],
    toggles: [{ k: 'cut', v: true, icon: '✂️', label: { kk: 'Кесінді', ru: 'Разрез', en: 'Cut-away' } }, { k: 'names', v: true, icon: '🏷️', label: { kk: 'Атаулар', ru: 'Названия', en: 'Names' } }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g); let sel = null; const clip = new THREE.Plane(V3(0, 0, -1), 0.2);
      const add = (key, mesh, lblPos) => { mesh.userData.pick = key; S.pickables.push(mesh); if (lblPos && P.names) S.label(tr(ORG[key][0]), lblPos, 'dim org', g); return mesh; };
      const M = (c, o = {}) => S.mat(c, Object.assign({ clippingPlanes: P.cut ? [clip] : [] }, o));
      const build = () => { S.clear(g); S.pickables = []; const plant = P.type === 'plant'; const rnd = mulberry(plant ? 7 : 3);
        if (plant) { const w = S.mesh(new THREE.BoxGeometry(6.4, 4.4, 4.4, 1, 1, 1), M(0x7bc043, { transparent: true, opacity: 0.25, depthWrite: false }), g); add('wall', w, [3.3, 2.3, 0]); S.edges(w, 0x9be36b, 0.9);
          const mb = S.mesh(new THREE.BoxGeometry(6.0, 4.0, 4.0), M(0xb6f09c, { transparent: true, opacity: 0.12, depthWrite: false }), g); add('membrane', mb);
          const vac = S.mesh(new THREE.SphereGeometry(1.5, 48, 24), M(0x7fd6ff, { transparent: true, opacity: 0.55 }), g); vac.scale.set(1.3, 1, 1); vac.position.set(0.5, 0, 0); add('vacuole', vac, [0.5, 1.7, 0]);
          for (let i = 0; i < 9; i++) { const c = S.mesh(new THREE.SphereGeometry(0.35, 24, 12), M(0x2fa84f), g); c.scale.set(1.5, 0.7, 0.9); c.position.set(-2.6 + rnd() * 5.2, (rnd() > 0.5 ? 1 : -1) * (1.3 + rnd() * 0.4), -1.4 + rnd() * 2.8); c.rotation.set(rnd() * 3, rnd() * 3, 0); add('chloro', c, i === 0 ? [c.position.x, c.position.y + 0.5, c.position.z] : null);
            for (let j = -1; j <= 1; j++) { const gr = S.mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12), M(0x0f6b2a), c); gr.position.x = j * 0.2; gr.rotation.z = Math.PI / 2; } } }
        else { const mb = S.mesh(new THREE.SphereGeometry(3, 64, 32), M(0xff9fb0, { transparent: true, opacity: 0.18, depthWrite: false }), g); mb.scale.set(1.15, 0.85, 1); add('membrane', mb, [3.2, 1.4, 0]); }
        const nuc = S.mesh(new THREE.SphereGeometry(0.95, 48, 24), M(0x7c5cff, { transparent: true, opacity: 0.85 }), g); nuc.position.set(plant ? -1.8 : 0, plant ? 0.6 : 0, 0); add('nucleus', nuc, [nuc.position.x, nuc.position.y + 1.2, 0]);
        const nl = S.mesh(new THREE.SphereGeometry(0.35, 24, 12), M(0x3b1f9e), g); nl.position.copy(nuc.position).add(V3(0.2, 0.1, 0.3)); add('nucleolus', nl);
        const nMito = plant ? 4 : 6; for (let i = 0; i < nMito; i++) { const m = S.mesh(new THREE.CapsuleGeometry(0.22, 0.6, 8, 16), M(0xff8a4c), g); const a = rnd() * 6.28; const r = plant ? 1.7 : 1.9 + rnd() * 0.6;
          m.position.set(Math.cos(a) * r * (plant ? 1.4 : 1), (rnd() - 0.5) * (plant ? 2.6 : 1.8), Math.sin(a) * r * 0.8); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); add('mito', m, i === 0 ? [m.position.x, m.position.y + 0.55, m.position.z] : null); }
        for (let i = 0; i < 4; i++) { const t = S.mesh(new THREE.TorusGeometry(1.25 + i * 0.22, 0.05, 8, 48, Math.PI * 1.1), M(0x3ea6ff), g); t.position.copy(nuc.position); t.rotation.set(Math.PI / 2 + (rnd() - 0.5) * 0.4, 0, rnd()); add('er', t, i === 0 ? [nuc.position.x - 1.5, nuc.position.y - 0.9, 0.5] : null); }
        const go = new THREE.Group(); go.position.set(plant ? -0.6 : 1.7, plant ? -1.3 : -0.9, 0.6); g.add(go); for (let i = 0; i < 5; i++) { const d = S.mesh(new THREE.TorusGeometry(0.55 - i * 0.03, 0.06, 8, 32, Math.PI), M(0xffd45e), go); d.position.y = i * 0.14; d.rotation.x = Math.PI / 2; add('golgi', d); } S.label(tr(ORG.golgi[0]), [go.position.x, go.position.y + 0.95, go.position.z], P.names ? 'dim org' : 'hide', g);
        const rg = new THREE.Group(); g.add(rg); for (let i = 0; i < 60; i++) { const s = S.sphere(0.045, 0x222244, null, rg, { seg: 8 }); const a = rnd() * 6.28, b = rnd() * 3.14, r = 1.2 + rnd() * 1.6; s.position.set(r * Math.sin(b) * Math.cos(a) * (plant ? 1.6 : 1.1), r * Math.cos(b) * (plant ? 0.9 : 0.8), r * Math.sin(b) * Math.sin(a) * (plant ? 1 : 0.9)); s.userData.pick = 'ribo'; S.pickables.push(s); }
        if (!plant) { for (let i = 0; i < 3; i++) { const l = S.mesh(new THREE.SphereGeometry(0.25, 16, 8), M(0x22d39a), g); l.position.set(-1.5 - rnd(), -1 + rnd() * 2, (rnd() - 0.5) * 2); add('lyso', l, i === 0 ? [l.position.x, l.position.y + 0.4, l.position.z] : null); }
          const ce = new THREE.Group(); ce.position.set(1.2, 1.2, 0.4); g.add(ce); const c1 = S.mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), M(0xaaaaaa), ce); const c2 = c1.clone(); c2.rotation.z = Math.PI / 2; ce.add(c2); add('centriole', c1); add('centriole', c2); if (P.names) S.label(tr(ORG.centriole[0]), [1.2, 1.6, 0.4], 'dim org', g); } };
      S.onPick = (k, obj) => { if (sel) { sel.material.emissive && sel.material.emissive.setHex(0); } if (!k) { S.showPick(null); return; } sel = obj; if (obj.material.emissive) obj.material.emissive.setHex(0x444444);
        S.showPick(`<b>${tr(ORG[k][0])}</b><br>${tr(ORG[k][1])}`); };
      S.onTick((dt) => { g.rotation.y += dt * 0.08; });
      return { update: build };
    },
    formula(P) { return P.type === 'plant' ? '6CO_2+6H_2O\\xrightarrow{\\text{' + tr({ kk: 'жарық', ru: 'свет', en: 'light' }) + '}}C_6H_{12}O_6+6O_2' : 'C_6H_{12}O_6+6O_2\\rightarrow 6CO_2+6H_2O+\\text{' + tr({ kk: 'АТФ', ru: 'АТФ', en: 'ATP' }) + '}'; },
    values(P) { const plant = P.type === 'plant'; return [[{ kk: 'Жасуша қабырғасы', ru: 'Клеточная стенка', en: 'Cell wall' }, plant ? '✅' : '❌'], [{ kk: 'Хлоропластар', ru: 'Хлоропласты', en: 'Chloroplasts' }, plant ? '✅' : '❌'], [{ kk: 'Үлкен вакуоль', ru: 'Крупная вакуоль', en: 'Large vacuole' }, plant ? '✅' : '❌'], [{ kk: 'Центриольдер', ru: 'Центриоли', en: 'Centrioles' }, plant ? '❌' : '✅'], [{ kk: 'Қоректену', ru: 'Питание', en: 'Nutrition' }, tr(plant ? { kk: 'автотроф (фотосинтез)', ru: 'автотрофное (фотосинтез)', en: 'autotroph (photosynthesis)' } : { kk: 'гетеротроф', ru: 'гетеротрофное', en: 'heterotroph' })]]; },
    info: { kk: '**Жасуша** — тірі ағзаның ең кіші құрылымдық бірлігі. Әр органоидты басып, оның қызметін оқы. Өсімдік жасушасында жануар жасушасынан айырмашылығы: **жасуша қабырғасы** (целлюлоза), **хлоропластар** (фотосинтез) және үлкен **орталық вакуоль** бар, ал центриольдер жоқ. Формула тақтасында: өсімдікте — фотосинтез, жануарда — жасушалық тыныс алу.',
      ru: '**Клетка** — наименьшая структурная единица живого. Нажимай на органоиды и читай их функции. В отличие от животной, растительная клетка имеет **клеточную стенку** (целлюлоза), **хлоропласты** (фотосинтез) и крупную **центральную вакуоль**, но не имеет центриолей. В формуле: у растений — фотосинтез, у животных — клеточное дыхание.',
      en: 'The **cell** is the smallest structural unit of life. Click organelles to read what they do. Unlike animal cells, plant cells have a **cell wall** (cellulose), **chloroplasts** (photosynthesis) and a large **central vacuole**, but no centrioles. The formula shows photosynthesis for plants and cellular respiration for animals.' },
    tasks(P) { return [{ key: 'q1', q: { kk: 'Фотосинтез қай органоидта жүреді? 1 — митохондрия, 2 — хлоропласт, 3 — рибосома. Нөмірін жаз.', ru: 'Где идёт фотосинтез? 1 — митохондрия, 2 — хлоропласт, 3 — рибосома. Напиши номер.', en: 'Where does photosynthesis happen? 1 — mitochondrion, 2 — chloroplast, 3 — ribosome. Type the number.' }, ans: 2, tol: 0 },
      { key: 'q2', q: { kk: 'Ақуыз синтезі қай жерде өтеді? 1 — лизосома, 2 — вакуоль, 3 — рибосома.', ru: 'Где идёт синтез белка? 1 — лизосома, 2 — вакуоль, 3 — рибосома.', en: 'Where are proteins made? 1 — lysosome, 2 — vacuole, 3 — ribosome.' }, ans: 3, tol: 0 },
      { key: 'q3', q: { kk: 'Жасушаның «энергия станциясы»: 1 — ядро, 2 — митохондрия, 3 — Гольджи.', ru: '«Энергетическая станция» клетки: 1 — ядро, 2 — митохондрия, 3 — Гольджи.', en: 'The cell\'s "power station": 1 — nucleus, 2 — mitochondrion, 3 — Golgi.' }, ans: 2, tol: 0 }]; }
  },
  dna: {
    stage: { cam: [6, 1, 8], target: [0, 0, 0], grid: false },
    params: [{ k: 'n', v: 20, min: 8, max: 40, step: 1, label: { kk: 'Нуклеотид жұптары', ru: 'Пары нуклеотидов', en: 'Base pairs' } }, { k: 'sp', v: 0.4, min: 0, max: 2, step: 0.05, label: { kk: 'Айналу жылдамдығы', ru: 'Скорость вращения', en: 'Spin speed' } },
      { k: 'seed', v: 1, min: 1, max: 20, step: 1, label: { kk: 'Тізбек нұсқасы', ru: 'Вариант цепи', en: 'Sequence variant' } }],
    toggles: [{ k: 'names', v: true, icon: '🏷️', label: { kk: 'Әріптер', ru: 'Буквы', en: 'Letters' } }],
    setup(S, P) {
      const g = new THREE.Group(); S.root.add(g); const C = { A: 0xff5d73, T: 0x3ea6ff, G: 0x22d39a, C: 0xffd45e }; const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
      const inst = { seq: [] };
      const build = () => { S.clear(g); S.pickables = []; const rnd = mulberry(P.seed * 13 + 1); const n = P.n, rise = 0.34, R = 1, turn = 2 * Math.PI / 10; inst.seq = [];
        const b1 = [], b2 = [];
        for (let i = 0; i < n; i++) { const y = (i - n / 2) * rise; const a = i * turn; const p1 = V3(R * Math.cos(a), y, R * Math.sin(a)), p2 = V3(R * Math.cos(a + Math.PI * 0.8), y, R * Math.sin(a + Math.PI * 0.8)); b1.push(p1); b2.push(p2);
          const base = 'ATGC'[Math.floor(rnd() * 4)]; const comp = PAIR[base]; inst.seq.push(base);
          const mid = p1.clone().lerp(p2, 0.5); const mk = (from, to, col, letter, pk) => { const d = to.clone().sub(from); const c = S.mesh(new THREE.CylinderGeometry(0.07, 0.07, d.length(), 10), S.mat(col, { roughness: 0.35 }), g); c.position.copy(from.clone().add(to).multiplyScalar(0.5)); c.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize()); c.userData.pick = pk; S.pickables.push(c);
            if (P.names && n <= 28) S.label(letter, from.clone().lerp(to, 0.5).toArray(), 'dim tiny', g); };
          const pk = { base, comp, i }; mk(p1, mid, C[base], base, pk); mk(mid, p2, C[comp], comp, pk);
          S.sphere(0.14, 0xcfd3e6, p1.toArray(), g, { seg: 12 }); S.sphere(0.14, 0xcfd3e6, p2.toArray(), g, { seg: 12 }); }
        [b1, b2].forEach(b => { if (b.length > 1) S.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b), b.length * 6, 0.06, 8, false), S.mat(0x9a8cff, { transparent: true, opacity: 0.8 }), g); }); };
      S.onPick = (pk) => { if (!pk) return S.showPick(null); const h = (pk.base === 'G' || pk.base === 'C') ? 3 : 2; S.showPick(`<b>${pk.base} — ${pk.comp}</b><br>${tr({ kk: `Сутектік байланыс саны: ${h}. Комплементарлық: A↔T, G↔C.`, ru: `Водородных связей: ${h}. Комплементарность: A↔T, G↔C.`, en: `Hydrogen bonds: ${h}. Complementarity: A↔T, G↔C.` })}`); };
      S.onTick((dt) => { g.rotation.y += dt * P.sp; });
      inst.update = (P2, k) => { if (k === 'sp') return; build(); };
      inst.counts = () => { const c = { A: 0, T: 0, G: 0, C: 0 }; inst.seq.forEach(b => { c[b]++; c[PAIR[b]]++; }); return c; };
      return inst;
    },
    formula() { return 'A=T,\\quad G=C,\\quad A+G=T+C\\;(50\\%)'; },
    values(P, inst) { const c = inst.counts ? inst.counts() : { A: 0, T: 0, G: 0, C: 0 }; const tot = 2 * P.n; const pc = (x) => fmt(x / tot * 100, 1) + '%';
      return [['A', c.A + ' (' + pc(c.A) + ')'], ['T', c.T + ' (' + pc(c.T) + ')'], ['G', c.G + ' (' + pc(c.G) + ')'], ['C', c.C + ' (' + pc(c.C) + ')'], [{ kk: 'Спиральдың бір айналымы', ru: 'Один виток спирали', en: 'One helix turn' }, tr({ kk: '10 жұп ≈ 3,4 нм', ru: '10 пар ≈ 3,4 нм', en: '10 pairs ≈ 3.4 nm' })]]; },
    info: { kk: '**ДНҚ** — тұқым қуалау ақпаратын сақтайтын қос спираль молекула. Екі тізбек азотты негіздер арқылы байланысады: **A (аденин) — T (тимин)** екі сутектік байланыспен, **G (гуанин) — C (цитозин)** үш байланыспен. Бұл **комплементарлық** ережесі. Сондықтан **Чаргафф ережесі** орындалады: $A = T$, $G = C$. Жұпты басып, байланыс санын қара.',
      ru: '**ДНК** — двойная спираль, хранящая наследственную информацию. Цепи соединены азотистыми основаниями: **A (аденин) — T (тимин)** двумя водородными связями, **G (гуанин) — C (цитозин)** тремя. Это правило **комплементарности**. Поэтому выполняется **правило Чаргаффа**: $A = T$, $G = C$. Нажми на пару, чтобы увидеть число связей.',
      en: '**DNA** is a double helix that stores hereditary information. The two strands are joined by bases: **A (adenine) — T (thymine)** with two hydrogen bonds and **G (guanine) — C (cytosine)** with three. This is **complementarity**, so **Chargaff\'s rule** holds: $A = T$, $G = C$. Click a pair to see its bonds.' },
    tasks(P, inst) { const c = inst.counts ? inst.counts() : null; if (!c) return []; const tot = 2 * P.n; const A = c.A / tot * 100; const sig = P.n + '_' + P.seed;
      return [{ key: 'g_' + sig, q: { kk: `Осы ДНҚ-да A = ${fmt(A, 1)}%. G неше пайыз?`, ru: `В этой ДНК A = ${fmt(A, 1)}%. Сколько процентов G?`, en: `In this DNA A = ${fmt(A, 1)}%. What percent is G?` }, ans: (100 - 2 * A) / 2, abs: 0.15 },
        { key: 'h_' + sig, q: { kk: 'Бұл фрагменттегі сутектік байланыстардың жалпы саны қанша? (A–T: 2, G–C: 3)', ru: 'Сколько всего водородных связей в этом фрагменте? (A–T: 2, G–C: 3)', en: 'How many hydrogen bonds are in this fragment in total? (A–T: 2, G–C: 3)' }, ans: c.A * 2 + c.G * 3, tol: 0 }]; }
  }
};
export function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
