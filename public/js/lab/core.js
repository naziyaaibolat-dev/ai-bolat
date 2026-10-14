/* AI-bolat 3D зертхана — ядро (Three.js, жергілікті). Тек зертхана беттерінде жүктеледі. */
import * as THREE from '/vendor/three/three.module.js';
import { OrbitControls } from '/vendor/three/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from '/vendor/three/CSS2DRenderer.js';
export { THREE };
export const tr = (o) => (o == null ? '' : typeof o === 'string' || typeof o === 'number' ? String(o) : (o[LANG] || o.kk || o.en || ''));
export const fmt = (n, d = 2) => { if (!isFinite(n)) return '—'; const s = (+n).toFixed(d).replace(/\.?0+$/, '') || '0'; return LANG === 'en' ? s : s.replace('.', ','); };
export const texNum = (n, d = 2) => fmt(n, d).replace(',', '{,}');
export const rad = (deg) => deg * Math.PI / 180;

export function createStage(el, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.localClippingEnabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement); renderer.domElement.className = 'lab-canvas';
  const lr = new CSS2DRenderer(); lr.domElement.className = 'lab-labels'; el.appendChild(lr.domElement);
  const scene = new THREE.Scene();
  const camera = opts.ortho ? new THREE.OrthographicCamera(-10, 10, 6, -6, 0.1, 1000) : new THREE.PerspectiveCamera(45, 1, 0.05, 2000);
  camera.position.set(...(opts.cam || [7, 5, 9]));
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.target.set(...(opts.target || [0, 1, 0])); if (opts.noRotate) controls.enableRotate = false;
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2350, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(6, 10, 7); scene.add(sun);
  const root = new THREE.Group(); scene.add(root);
  let grid = null; if (opts.grid !== false) { grid = new THREE.GridHelper(opts.gridSize || 20, opts.gridDiv || 20, 0x7c5cff, 0x3a3570); grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid); }
  const ticks = new Set(); let raf = 0, dead = false, last = performance.now(); const t0 = last;
  const S = { THREE, scene, camera, renderer, controls, root, grid, el, sun, ticks, opts,
    home: { cam: camera.position.clone(), target: controls.target.clone() },
    onTick(fn) { ticks.add(fn); return () => ticks.delete(fn); },
    clear(group = root) { for (let i = group.children.length - 1; i >= 0; i--) { const o = group.children[i]; group.remove(o); disposeTree(o); } },
    add(o, parent = root) { parent.add(o); return o; },
    mat(color, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.45, metalness: 0.08, side: THREE.DoubleSide }, o)); },
    basic(color, o = {}) { return new THREE.MeshBasicMaterial(Object.assign({ color }, o)); },
    mesh(geo, material, parent = root) { const m = new THREE.Mesh(geo, material); parent.add(m); return m; },
    sphere(r, color, pos, parent = root, o = {}) { const m = S.mesh(new THREE.SphereGeometry(r, o.seg || 32, o.seg ? o.seg / 2 : 16), o.material || S.mat(color, o.m || {}), parent); if (pos) m.position.set(...pos); return m; },
    label(text, pos, cls = '', parent = root) { const d = document.createElement('div'); d.className = 'lab-tag ' + cls; d.innerHTML = text; const o = new CSS2DObject(d); if (pos) o.position.set(...pos); parent.add(o); return o; },
    line(points, color = 0xffffff, parent = root, o = {}) { const g = new THREE.BufferGeometry().setFromPoints(points.map(p => Array.isArray(p) ? new THREE.Vector3(...p) : p));
      const m = o.dashed ? new THREE.LineDashedMaterial({ color, dashSize: o.dash || 0.2, gapSize: o.gap || 0.12, transparent: true, opacity: o.opacity ?? 1 }) : new THREE.LineBasicMaterial({ color, transparent: true, opacity: o.opacity ?? 1 });
      const l = new THREE.Line(g, m); if (o.dashed) l.computeLineDistances(); parent.add(l); return l; },
    setLine(l, points) { l.geometry.setFromPoints(points.map(p => Array.isArray(p) ? new THREE.Vector3(...p) : p)); if (l.material.isLineDashedMaterial) l.computeLineDistances(); },
    arrow(color, parent = root, text = '') { const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, color, 0.3, 0.18); parent.add(a);
      const lb = text ? S.label(text, [0, 0, 0], 'arrow', parent) : null;
      if (lb) lb.element.style.color = '#' + new THREE.Color(color).getHexString();
      a.set = (from, vec, head) => { const len = vec.length(); a.visible = len > 1e-4; if (!a.visible) { if (lb) lb.visible = false; return; } a.position.copy(from); a.setDirection(vec.clone().normalize()); const h = head ?? Math.min(0.35, len * 0.35); a.setLength(len, h, h * 0.6); if (lb) { lb.visible = true; lb.position.copy(from.clone().add(vec.clone().multiplyScalar(1.08))); } };
      a.lb = lb; return a; },
    edges(mesh, color = 0xffffff, opacity = 0.7) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), new THREE.LineBasicMaterial({ color, transparent: true, opacity })); mesh.add(e); return e; },
    resetView() { camera.position.copy(S.home.cam); controls.target.copy(S.home.target); controls.update(); },
    setHome(cam, target) { S.home.cam.set(...cam); S.home.target.set(...target); S.resetView(); },
    pickables: [], onPick: null,
    time: () => (performance.now() - t0) / 1000,
    dispose() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); S.clear(); disposeTree(scene); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) { /* */ } el.innerHTML = ''; }
  };
  const resize = () => { const w = el.clientWidth || 600, h = el.clientHeight || 400; renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px'; lr.setSize(w, h);
    if (camera.isPerspectiveCamera) camera.aspect = w / h; else { const vh = opts.orthoH || 6; camera.top = vh; camera.bottom = -vh; camera.left = -vh * w / h; camera.right = vh * w / h; }
    camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  // басу арқылы таңдау (сүйреусіз)
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || !S.onPick) return; const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(S.pickables, true)[0]; let o = hit && hit.object; while (o && !o.userData.pick) o = o.parent; S.onPick(o ? o.userData.pick : null, o); });
  const loop = (now) => { if (dead) return; raf = requestAnimationFrame(loop); if (!el.isConnected) { S.dispose(); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now; for (const f of ticks) { try { f(dt, (now - t0) / 1000); } catch (e) { console.error(e); ticks.delete(f); } }
    controls.update(); renderer.render(scene, camera); lr.render(scene, camera); };
  raf = requestAnimationFrame(loop);
  return S;
}
export function disposeTree(o) { o.traverse && o.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material) (Array.isArray(n.material) ? n.material : [n.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); if (n.element && n.element.remove) n.element.remove(); }); }

/* ---------- зертхана беті: сахна + басқару панелі ---------- */
const UI = {
  params: { kk: 'Параметрлер', ru: 'Параметры', en: 'Parameters' }, values: { kk: 'Нәтижелер', ru: 'Результаты', en: 'Results' },
  formula: { kk: 'Формула', ru: 'Формула', en: 'Formula' }, theory: { kk: 'Түсіндірме', ru: 'Объяснение', en: 'Explanation' },
  tasks: { kk: 'Мини-тапсырмалар', ru: 'Мини-задания', en: 'Mini tasks' }, check: { kk: 'Тексеру', ru: 'Проверить', en: 'Check' },
  right: { kk: 'Дұрыс! +{x} XP', ru: 'Верно! +{x} XP', en: 'Correct! +{x} XP' }, right0: { kk: 'Дұрыс! (XP бұрын алынған)', ru: 'Верно! (XP уже получен)', en: 'Correct! (XP already earned)' },
  wrong: { kk: 'Қайта есептеп көр. Кеңес: формуланы қара 👆', ru: 'Пересчитай. Подсказка: посмотри формулу 👆', en: 'Try again. Hint: look at the formula 👆' },
  reset: { kk: 'Көріністі қалпына келтіру', ru: 'Сбросить вид', en: 'Reset view' }, full: { kk: 'Толық экран', ru: 'Во весь экран', en: 'Fullscreen' },
  hint3d: { kk: '🖱️ Айналдыру — сүйреу · Масштаб — дөңгелек · Жылжыту — оң батырма', ru: '🖱️ Вращать — тянуть · Масштаб — колёсико · Сдвиг — правая кнопка', en: '🖱️ Rotate — drag · Zoom — wheel · Pan — right button' },
  newTask: { kk: 'Жаңа сандар', ru: 'Новые числа', en: 'New numbers' }, answer: { kk: 'Жауап', ru: 'Ответ', en: 'Answer' }
};
export { UI };
export function mountLab(host, def, meta = {}, hooks = {}) {
  const compact = !!hooks.compact;
  host.innerHTML = `<div class="lab ${compact ? 'compact' : ''}"><div class="lab-stage glass"><div class="lab-gl"></div>
      <div class="lab-tools"><button class="iconbtn" data-a="reset" title="${tr(UI.reset)}">⟲</button><button class="iconbtn" data-a="full" title="${tr(UI.full)}">⛶</button></div>
      <div class="lab-hint small">${tr(UI.hint3d)}</div><div class="lab-pick glass" hidden></div></div>
    <div class="lab-side"><div class="card lab-ctrl"><h3>🎛️ ${tr(UI.params)}</h3><div class="lab-controls"></div></div>
      <div class="card"><h3>📊 ${tr(UI.values)}</h3><div class="lab-values kv"></div></div>
      <div class="card fcard lab-fcard"><div class="fn">📐 ${tr(UI.formula)}</div><div class="fx lab-formula"></div></div>
      ${compact ? '' : `<div class="card"><h3>📖 ${tr(UI.theory)}</h3><div class="lab-info md"></div></div><div class="card"><div class="row between"><h3>🎯 ${tr(UI.tasks)}</h3></div><div class="lab-tasks"></div></div>`}</div></div>`;
  const gl = host.querySelector('.lab-gl');
  const S = createStage(gl, def.stage || {});
  const P = {}; (def.params || []).forEach(p => P[p.k] = p.v); (def.options || []).forEach(o => P[o.k] = o.v); (def.toggles || []).forEach(t => P[t.k] = !!t.v);
  Object.assign(P, hooks.preset || {});
  const pick = host.querySelector('.lab-pick');
  S.showPick = (html) => { if (!html) { pick.hidden = true; return; } pick.innerHTML = html + '<button class="x">✕</button>'; pick.hidden = false; pick.querySelector('.x').onclick = () => pick.hidden = true; if (window.renderMath) renderMath(pick); };
  const inst = def.setup(S, P) || {};
  const ctrl = host.querySelector('.lab-controls');
  const drawControls = () => {
    ctrl.innerHTML = (def.options || []).filter(o => !o.show || o.show(P)).map(o => o.table ? `<div class="field"><label class="f">${tr(o.label)}</label><div class="ptable">${o.items.map(it => `<button class="pt ${P[o.k] === it.v ? 'on' : ''}" style="grid-row:${it.pos[0]};grid-column:${it.pos[1]}" data-o="${o.k}" data-v="${it.v}"><small>${it.sub}</small>${tr(it.label)}</button>`).join('')}</div></div>`
      : `<div class="field"><label class="f">${tr(o.label)}</label><div class="chips">${o.items.map(it => `<button class="chip ${P[o.k] === it.v ? 'on' : ''}" data-o="${o.k}" data-v="${it.v}">${it.icon ? it.icon + ' ' : ''}${tr(it.label)}</button>`).join('')}</div></div>`).join('')
      + (def.params || []).filter(p => !p.show || p.show(P)).map(p => `<div class="field slider"><label class="f"><span>${tr(p.label)}</span><b data-val="${p.k}">${fmt(P[p.k], 3)}${p.unit ? ' ' + tr(p.unit) : ''}</b></label><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${P[p.k]}" data-p="${p.k}"></div>`).join('')
      + ((def.toggles || []).filter(t => !t.show || t.show(P)).length ? `<div class="chips">${def.toggles.filter(t => !t.show || t.show(P)).map(t => `<button class="chip tog ${P[t.k] ? 'on' : ''}" data-t="${t.k}">${t.icon || ''} ${tr(t.label)}</button>`).join('')}</div>` : '')
      + ((def.buttons || []).length ? `<div class="row" style="margin-top:10px">${def.buttons.filter(b => !b.show || b.show(P)).map(b => `<button class="btn ${b.pri ? 'pri' : ''} sm" data-b="${b.k}">${b.icon || ''} ${tr(b.label)}</button>`).join('')}</div>` : '');
    ctrl.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { P[b.dataset.o] = b.dataset.v; changed(b.dataset.o, true); });
    ctrl.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { P[b.dataset.t] = !P[b.dataset.t]; changed(b.dataset.t, true); });
    ctrl.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { inst.action && inst.action(b.dataset.b, P); refresh(); });
    ctrl.querySelectorAll('input[type=range]').forEach(i => i.oninput = () => { const p = def.params.find(x => x.k === i.dataset.p); P[p.k] = +i.value; const v = ctrl.querySelector(`[data-val="${p.k}"]`); if (v) v.textContent = fmt(P[p.k], 3) + (p.unit ? ' ' + tr(p.unit) : ''); changed(p.k, false); });
  };
  const fEl = host.querySelector('.lab-formula'), vEl = host.querySelector('.lab-values');
  let lastTex = null;
  const refresh = () => {
    const tex = def.formula ? def.formula(P, inst) : ''; if (tex !== lastTex) { lastTex = tex; try { window.katex.render(tex || '\\;', fEl, { displayMode: true, throwOnError: false }); } catch (e) { fEl.textContent = tex; } }
    const vals = def.values ? def.values(P, inst) : []; vEl.innerHTML = vals.map(([k, v]) => `<div><span>${tr(k)}</span><b>${v}</b></div>`).join('');
    if (window.renderMath) renderMath(vEl);
  };
  const changed = (k, redraw) => { inst.update && inst.update(P, k); if (redraw) drawControls(); refresh(); drawTasks(); };
  inst.refresh = refresh;
  // түсіндірме
  const infoEl = host.querySelector('.lab-info'); if (infoEl) { const inf = typeof def.info === 'function' ? def.info(P) : def.info; infoEl.innerHTML = window.mdToHtml ? mdToHtml(tr(inf)) : tr(inf); if (window.renderMath) renderMath(infoEl); }
  // мини-тапсырмалар
  const tEl = host.querySelector('.lab-tasks'); let taskSig = '';
  const drawTasks = () => { if (!tEl || !def.tasks) return; const list = def.tasks(P, inst) || []; const sig = list.map(t => t.key).join('|'); if (sig === taskSig) return; taskSig = sig;
    tEl.innerHTML = list.map((t, i) => `<div class="lab-task" data-i="${i}"><div class="md q">${i + 1}. ${tr(t.q)}</div><div class="fillrow"><input class="in" placeholder="${tr(UI.answer)}${t.unit ? ' (' + tr(t.unit) + ')' : ''}" inputmode="decimal"><button class="btn pri sm">${tr(UI.check)}</button></div><div class="fbk small"></div></div>`).join('');
    if (window.renderMath) renderMath(tEl);
    tEl.querySelectorAll('.lab-task').forEach(box => { const t = list[+box.dataset.i]; const inp = box.querySelector('input'), fb = box.querySelector('.fbk');
      const go = async () => { const raw = inp.value.trim().replace(',', '.'); if (!raw) return; let ok;
        if (t.choices || typeof t.ans === 'string') ok = raw.toLowerCase().replace(/\s+/g, '') === String(t.ans).toLowerCase().replace(/\s+/g, '');
        else { const v = parseFloat(raw); const tol = t.tol ?? 0.02; ok = isFinite(v) && Math.abs(v - t.ans) <= Math.max(Math.abs(t.ans) * tol, t.abs ?? 0.011); }
        box.classList.toggle('ok', ok); box.classList.toggle('no', !ok);
        if (!ok) { fb.textContent = tr(UI.wrong); if (typeof Sound !== 'undefined') Sound.play('bad'); return; }
        if (typeof Sound !== 'undefined') Sound.play('ok');
        let xp = 0; try { if (hooks.onTask) xp = await hooks.onTask(meta.id, t.key, true); } catch (e) { /* */ }
        fb.textContent = xp ? tr(UI.right).replace('{x}', xp) : tr(UI.right0); if (xp && window.xpFly) { const r = box.getBoundingClientRect(); xpFly(r.left + r.width / 2, r.top, '+' + xp + ' XP'); } };
      box.querySelector('button').onclick = go; inp.onkeydown = (e) => { if (e.key === 'Enter') go(); }; });
  };
  host.querySelector('[data-a="reset"]').onclick = () => S.resetView();
  host.querySelector('[data-a="full"]').onclick = () => { const st = host.querySelector('.lab-stage'); if (document.fullscreenElement) document.exitFullscreen(); else if (st.requestFullscreen) st.requestFullscreen(); };
  drawControls(); inst.update && inst.update(P, null); refresh(); drawTasks();
  if (def.live) { const iv = setInterval(() => { if (!host.isConnected) return clearInterval(iv); refresh(); }, 700); }
  return { S, P, inst, dispose: () => S.dispose() };
}
