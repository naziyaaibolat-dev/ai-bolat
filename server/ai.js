'use strict';
/* AI-bolat v3: OpenAI-үйлесімді чат API (Gemini/OpenAI)
   - Модельдер тізімі /models арқылы автоматты анықталады (6 сағ кэш)
   - Әр модельдің «денсаулығы»: 429 квота/лимит, 503 жүктеме, 404 жоқ → уақытша суыту (cooldown)
   - Сәтті модель «жабысқақ» — келесі сұраныс алдымен соған барады
   - Экспоненциалды күту (backoff) + модельдер тізбегі, ағынды жауап, уақыт шектеулері
   - Жауап кэші (жад + дерекқор), data/ai.log журналы (кілт ешқашан жазылмайды) */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const PREF = {
  quality: ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash',
    'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite-preview', 'gemini-2.5-flash-lite'],
  fast: ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash',
    'gemini-flash-latest', 'gemini-3.1-flash-lite-preview', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']
};
const BAD_ID = /tts|image|live|audio|embed|transcribe|robotics|computer-use|customtools|omni|gemma|veo|imagen|aqa|lyria|antigravity|deep-research|banana/;
const clean = (v) => String(v || '').trim().replace(/^["']|["']$/g, '').trim();
function cfg() {
  const base = (clean(process.env.AI_BASE_URL) || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const gemini = /generativelanguage\.googleapis\.com/.test(base);
  return { key: clean(process.env.AI_API_KEY), base, gemini, model: clean(process.env.AI_MODEL) || (gemini ? PREF.quality[0] : 'gpt-5-mini') };
}
/* ---------- журнал ---------- */
let LOG_FILE = null;
function setDataDir(d) { try { fs.mkdirSync(d, { recursive: true }); LOG_FILE = path.join(d, 'ai.log'); } catch (e) { /* */ } }
function logLine(obj) {
  if (!LOG_FILE) return; const c = cfg(); let s = new Date().toISOString() + ' ' + JSON.stringify(obj);
  if (c.key) s = s.split(c.key).join('***');
  try { if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > 2e6) fs.renameSync(LOG_FILE, LOG_FILE + '.1'); fs.appendFileSync(LOG_FILE, s + '\n'); } catch (e) { /* */ }
}
/* ---------- қате мәтіні ---------- */
function errMsg(data, txt) {
  const d = Array.isArray(data) ? data[0] : data; const e = d && d.error;
  if (e) return (typeof e === 'string' ? e : (e.message || JSON.stringify(e))) + (e.status ? ' [' + e.status + ']' : '');
  return String(txt || '').slice(0, 300);
}
function replyText(data) {
  const d = Array.isArray(data) ? data[0] : data; const ch = d && d.choices && d.choices[0]; if (!ch) return '';
  const c = (ch.message && ch.message.content) != null ? ch.message.content : ch.text;
  if (typeof c === 'string') return stripThought(c).trim();
  if (Array.isArray(c)) return stripThought(c.map(x => typeof x === 'string' ? x : (x && (x.text || '')) || '').join('')).trim();
  return '';
}
const stripThought = (s) => String(s).replace(/<thought>[\s\S]*?<\/thought>/g, '');
function noKey() { const e = new Error('AI_API_KEY missing'); e.status = 503; e.code = 'NO_KEY'; return e; }
/* ---------- модельдер: анықтау және денсаулық ---------- */
const H = new Map(); // model -> {until, reason, ok, fail, lastMs, lastErr}
const sticky = { quality: null, fast: null };
let avail = null, availAt = 0, availPromise = null;
const hs = (m) => { if (!H.has(m)) H.set(m, { until: 0, reason: '', ok: 0, fail: 0, lastMs: 0, lastErr: '' }); return H.get(m); };
async function discover(force) {
  const c = cfg(); if (!c.key) return null;
  if (!force && avail && Date.now() - availAt < 6 * 3600e3) return avail;
  if (availPromise) return availPromise;
  availPromise = (async () => {
    try {
      const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 12000);
      const r = await fetch(c.base + '/models', { headers: { Authorization: 'Bearer ' + c.key }, signal: ctrl.signal }); clearTimeout(tm);
      if (!r.ok) { logLine({ ev: 'models', status: r.status }); return avail; }
      const j = await r.json(); const ids = (j.data || j.models || []).map(x => String(x.id || x.name || '').replace(/^models\//, '')).filter(Boolean);
      if (ids.length) { avail = ids; availAt = Date.now(); logLine({ ev: 'models', count: ids.length }); }
      return avail;
    } catch (e) { logLine({ ev: 'models', err: e.message }); return avail; } finally { availPromise = null; }
  })();
  return availPromise;
}
function chain(c, tier = 'quality') {
  const env = c.model.split(',').map(x => x.trim()).filter(Boolean);
  let list;
  if (!c.gemini) list = env;
  else {
    const pref = PREF[tier] || PREF.quality;
    list = tier === 'fast' ? [...pref, ...env] : [...env, ...pref];
    if (avail) { const set = new Set(avail); list = list.filter(m => set.has(m));
      for (const m of avail) if (!list.includes(m) && !BAD_ID.test(m) && /^gemini-.*flash/.test(m)) list.push(m); }
    if (!list.length) list = [...env, ...pref];
  }
  list = [...new Set(list)];
  const st = sticky[tier]; if (st && list.includes(st)) list = [st, ...list.filter(m => m !== st)];
  const now = Date.now(); const ready = list.filter(m => hs(m).until <= now);
  const cooling = list.filter(m => hs(m).until > now).sort((a, b) => hs(a).until - hs(b).until);
  return (ready.length ? ready : cooling.slice(0, 2)).slice(0, 10);
}
function mark(model, e, ms) {
  const h = hs(model); h.fail++; h.lastMs = ms; h.lastErr = String(e.message || '').slice(0, 160);
  const st = e.httpStatus; const msg = String(e.message || '');
  let cd = 0, reason = '';
  if (st === 404) { cd = 24 * 3600e3; reason = 'not_available'; }
  else if (st === 429 && /quota|billing|exceeded/i.test(msg)) { cd = 45 * 60e3; reason = 'quota'; }
  else if (st === 429) { cd = 60e3; reason = 'rate_limit'; }
  else if (st >= 500) { cd = 20e3; reason = 'overloaded'; }
  else if (e.timeout) { cd = 30e3; reason = 'timeout'; }
  else if (e.badJson) { cd = 0; reason = 'bad_json'; }
  if (cd) { h.until = Date.now() + cd; h.reason = reason; }
  logLine({ ev: 'fail', model, status: st || null, reason: reason || (e.network ? 'network' : e.empty ? 'empty' : 'error'), ms, msg: msg.slice(0, 140) });
}
function good(model, tier, ms) { const h = hs(model); h.ok++; h.lastMs = ms; h.until = 0; h.reason = ''; sticky[tier] = model; logLine({ ev: 'ok', model, tier, ms }); }
/* ---------- бір шақыру ---------- */
async function callOnce(c, model, msgs, opts = {}) {
  const limit = opts.timeoutMs || 90000;
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), limit);
  try {
    const body = { model, messages: msgs, temperature: opts.temperature !== undefined ? opts.temperature : 0.4 };
    if (opts.json) body.response_format = { type: 'json_object' };
    if (opts.maxTokens) body.max_tokens = opts.maxTokens;
    reasoningFix(body);
    const r = await fetch(c.base + '/chat/completions', { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.key }, body: JSON.stringify(body) });
    const txt = await r.text(); let data = null; try { data = JSON.parse(txt); } catch (e) { /* */ }
    if (!r.ok) { const e = new Error('AI ' + r.status + ' (' + model + '): ' + errMsg(data, txt)); e.status = 502; e.httpStatus = r.status; e.retry = r.status !== 401 && r.status !== 403 && r.status !== 400; throw e; }
    const reply = replyText(data);
    if (!reply) { const e = new Error('empty reply'); e.status = 502; e.retry = true; e.empty = true; throw e; }
    return { reply, model: (data && data.model) || model };
  } catch (e) {
    if (e.name === 'AbortError') { const x = new Error('timeout ' + Math.round(limit / 1000) + 's'); x.status = 504; x.timeout = true; x.retry = true; throw x; }
    if (!e.status) { const x = new Error('network: ' + e.message); x.status = 502; x.network = true; x.retry = true; throw x; }
    throw e;
  } finally { clearTimeout(tm); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const transient = (e) => e && (e.httpStatus >= 500 || e.httpStatus === 429 || e.timeout || e.empty || e.network || e.badJson);
/* ---------- кэш ---------- */
const MEM = new Map(); let store = null;
function setStore(s) { store = s; }
function cacheGet(k) { if (MEM.has(k)) return MEM.get(k); if (store) { const v = store.get(k); if (v) { MEM.set(k, v); return v; } } return null; }
function cachePut(k, v) { MEM.set(k, v); if (MEM.size > 500) MEM.delete(MEM.keys().next().value); if (store) try { store.put(k, v); } catch (e) { /* */ } }
const hashKey = (x) => crypto.createHash('sha1').update(JSON.stringify(x)).digest('hex');
/* OpenAI reasoning модельдері (gpt-5*, o1/o3/o4*): temperature қолдамайды, max_tokens орнына max_completion_tokens */
function reasoningFix(body) {
  if (!/^(gpt-5|o\d)/i.test(String(body.model || ''))) return body;
  delete body.temperature; if (body.max_tokens) { body.max_completion_tokens = body.max_tokens; delete body.max_tokens; }
  if (process.env.AI_REASONING_EFFORT) body.reasoning_effort = process.env.AI_REASONING_EFFORT;
  else if (/^gpt-5(-mini|-nano)?(-\d{4}-\d{2}-\d{2})?$/i.test(body.model)) body.reasoning_effort = 'minimal'; // жылдам жауап
  return body;
}
/* ---------- балаларға қауіпсіздік нұсқауы (барлық AI сұрауына қосылады; AI_CHILD_SAFETY=0 — өшіру) ---------- */
const SAFETY = 'SAFETY RULES (always apply): The users are school students (possibly children aged 6-17) and teachers in Kazakhstan. ' +
  'Keep every answer age-appropriate, kind and educational. Never produce sexual, violent, hateful, self-harm, drug, gambling or other adult content; ' +
  'politely refuse and steer back to learning. Do not ask for or store personal data (full name, address, phone, school, photos of people). ' +
  'If a student mentions danger, abuse or self-harm, respond supportively and advise talking to a parent, teacher or calling 111 / 150 (Kazakhstan child helpline). ' +
  'You are an AI assistant, not a human; say so if asked. Do not claim certainty when unsure.';
function withSafety(msgs) {
  if (/^(0|false|off|no)$/i.test(String(process.env.AI_CHILD_SAFETY || '').trim()) || !Array.isArray(msgs)) return msgs;
  const out = msgs.slice(); const i = out.findIndex(m => m.role === 'system');
  if (i >= 0 && typeof out[i].content === 'string') out[i] = { ...out[i], content: out[i].content + '\n\n' + SAFETY }; else out.unshift({ role: 'system', content: SAFETY });
  return out;
}
/* ---------- толық жауап (backoff + тізбек + валидация) ---------- */
async function complete(msgs, opts = {}) {
  const c = cfg(); if (!c.key) throw noKey();
  const tier = opts.tier || 'quality';
  const ck = opts.cache ? 'c:' + hashKey([msgs, opts.json, opts.cacheTag || '']) : null;
  if (ck) { const v = cacheGet(ck); if (v) return { reply: v.reply, model: v.model, cached: true, value: opts.validate ? opts.validate(v.reply) : undefined }; }
  msgs = withSafety(msgs);
  await discover();
  const rounds = opts.rounds || 3; let lastErr = null; const tried = [];
  for (let round = 0; round < rounds; round++) {
    if (round) { if (!transient(lastErr)) break; const w = [0, 1500, 4000, 8000][round] || 8000; opts.onRetry && opts.onRetry({ round, wait: w }); await sleep(w); }
    for (const model of chain(c, tier)) {
      const t0 = Date.now();
      try {
        opts.onModel && opts.onModel(model);
        const r = await callOnce(c, model, msgs, opts);
        let value; if (opts.validate) { try { value = opts.validate(r.reply); } catch (ve) { const e = new Error('invalid: ' + ve.message); e.badJson = true; e.retry = true; throw e; } }
        good(model, tier, Date.now() - t0); if (ck) cachePut(ck, { reply: r.reply, model: r.model });
        return { reply: r.reply, model: r.model, value, tried: tried.concat(model) };
      } catch (e) { lastErr = e; tried.push(model); mark(model, e, Date.now() - t0); if (!e.retry) { e.tried = tried; throw e; } }
    }
  }
  if (!lastErr) lastErr = Object.assign(new Error('no models'), { status: 503 });
  lastErr.tried = tried; throw lastErr;
}
/* ---------- ағынды жауап ---------- */
function deltaText(d) {
  const ch = d && d.choices && d.choices[0]; if (!ch) return '';
  const c = ch.delta ? ch.delta.content : (ch.message ? ch.message.content : ch.text);
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map(x => typeof x === 'string' ? x : (x && x.text) || '').join('');
  return '';
}
async function streamOnce(c, model, msgs, h) {
  const ctrl = new AbortController(); let why = null;
  const onAbort = () => { why = 'user'; ctrl.abort(); }; if (h.signal) { if (h.signal.aborted) onAbort(); else h.signal.addEventListener('abort', onAbort); }
  let tm = null; const arm = (ms, w) => { clearTimeout(tm); tm = setTimeout(() => { why = w; ctrl.abort(); }, ms); };
  arm(h.firstTokenMs || 30000, 'first'); let got = '', finish = null, gotModel = model;
  try {
    const body = { model, messages: msgs, stream: true, temperature: h.temperature !== undefined ? h.temperature : 0.5 };
    if (h.json) body.response_format = { type: 'json_object' };
    reasoningFix(body);
    const r = await fetch(c.base + '/chat/completions', { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.key, Accept: 'text/event-stream' }, body: JSON.stringify(body) });
    if (!r.ok) { const txt = await r.text(); let data = null; try { data = JSON.parse(txt); } catch (e) { /* */ }
      const e = new Error('AI ' + r.status + ' (' + model + '): ' + errMsg(data, txt)); e.status = 502; e.httpStatus = r.status; e.retry = r.status !== 401 && r.status !== 403 && r.status !== 400; throw e; }
    const ct = r.headers.get('content-type') || '';
    if (!/event-stream/.test(ct)) {
      const txt = await r.text(); let data = null; try { data = JSON.parse(txt); } catch (e) { /* */ }
      const t = replyText(data); if (!t) { const e = new Error('empty reply'); e.status = 502; e.retry = true; e.empty = true; throw e; }
      h.onDelta(t, model); return { text: t, model: (data && data.model) || model, finish: 'stop' };
    }
    const dec = new TextDecoder(); let buf = ''; let inThought = false;
    for await (const chunk of r.body) {
      buf += dec.decode(chunk, { stream: true }); let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).replace(/\r$/, ''); buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue; const payload = line.slice(5).trim(); if (!payload || payload === '[DONE]') continue;
        let d = null; try { d = JSON.parse(payload); } catch (e) { continue; }
        const dd = Array.isArray(d) ? d[0] : d;
        if (dd && dd.error) { const e = new Error('AI (' + model + '): ' + errMsg(dd, payload)); e.status = 502; e.httpStatus = +dd.error.code || 503; e.retry = !got; throw e; }
        if (dd && dd.model) gotModel = dd.model;
        const f = dd && dd.choices && dd.choices[0] && dd.choices[0].finish_reason; if (f) finish = f;
        let t = deltaText(dd);
        if (t) { // <thought> блоктарын алып тастау
          if (inThought || t.includes('<thought>')) { const all = t; t = ''; let s = all; while (s) { if (inThought) { const k = s.indexOf('</thought>'); if (k < 0) { s = ''; break; } inThought = false; s = s.slice(k + 10); } else { const k = s.indexOf('<thought>'); if (k < 0) { t += s; s = ''; } else { t += s.slice(0, k); inThought = true; s = s.slice(k + 9); } } } }
          arm(h.idleMs || 30000, 'idle');
          if (t) { got += t; h.onDelta(t, gotModel); }
        }
      }
    }
    if (!got.trim()) { const e = new Error('empty reply' + (finish ? ' (' + finish + ')' : '')); e.status = 502; e.retry = true; e.empty = true; throw e; }
    return { text: got, model: gotModel, finish };
  } catch (e) {
    if (e.name === 'AbortError' || why) {
      if (why === 'user') { const x = new Error('aborted'); x.aborted = true; x.partial = got; throw x; }
      const x = new Error(why === 'first' ? 'no first token' : 'stream stalled'); x.status = 504; x.timeout = true; x.retry = !got; x.partial = got; throw x;
    }
    if (!e.status) { const x = new Error('network: ' + e.message); x.status = 502; x.network = true; x.retry = !got; x.partial = got; throw x; }
    e.partial = got; throw e;
  } finally { clearTimeout(tm); if (h.signal) h.signal.removeEventListener('abort', onAbort); }
}
async function stream(msgs, h = {}) {
  const c = cfg(); if (!c.key) throw noKey(); msgs = withSafety(msgs);
  const tier = h.tier || 'quality';
  await discover();
  let lastErr = null; const tried = []; const rounds = h.rounds || 3;
  for (let round = 0; round < rounds; round++) {
    if (round) { if (!transient(lastErr)) break; const w = [0, 1500, 4000][round] || 4000;
      h.onRetry && h.onRetry({ round, wait: w }); await sleep(w);
      if (h.signal && h.signal.aborted) { const x = new Error('aborted'); x.aborted = true; x.partial = ''; throw x; } }
    const list = chain(c, tier);
    for (let k = 0; k < list.length; k++) {
      const model = list[k]; let started = false; const t0 = Date.now();
      try {
        h.onModel && h.onModel(model);
        const r = await streamOnce(c, model, msgs, { ...h, onDelta: (t, m) => { started = true; h.onDelta && h.onDelta(t, m); } });
        if (h.validate) { try { r.value = h.validate(r.text); } catch (ve) { const e = new Error('invalid: ' + ve.message); e.badJson = true; e.retry = true; throw e; } }
        good(model, tier, Date.now() - t0); r.tried = tried.concat(model); return r;
      } catch (e) {
        lastErr = e; tried.push(model); mark(model, e, Date.now() - t0);
        if (e.aborted || !e.retry || (started && !e.badJson)) { e.tried = tried; throw e; }
        h.onRetry && h.onRetry({ from: model, to: list[k + 1] || null, reason: hs(model).reason || (e.badJson ? 'bad_json' : 'error') });
        if (e.badJson) h.onReset && h.onReset();
      }
    }
  }
  if (!lastErr) lastErr = Object.assign(new Error('no models'), { status: 503 });
  lastErr.tried = tried; throw lastErr;
}
/* ---------- пайдаланушыға түсінікті қате (кілт — i18n) ---------- */
function errKey(e) {
  if (!e) return 'ai_err';
  if (e.code === 'NO_KEY') return 'ai_off';
  const st = e.httpStatus;
  if (st === 401 || st === 403) return 'ai_key_bad';
  if (st === 429) return /quota|billing|exceeded/i.test(e.message || '') ? 'ai_quota' : 'ai_rate';
  if (st >= 500) return 'ai_overload';
  if (e.timeout) return 'ai_timeout';
  if (e.network) return 'ai_network';
  if (e.badJson || e.empty) return 'ai_bad_reply';
  return 'ai_err';
}
function friendlyError(e) { return require('./i18n').t('kk', errKey(e)); }
function status() { const c = cfg(); let host = ''; try { host = new URL(c.base).host; } catch (e) { host = c.base; } return { enabled: !!c.key, model: sticky.quality || c.model.split(',')[0].trim(), host }; }
function health() {
  const c = cfg(); const now = Date.now();
  return { enabled: !!c.key, discovered: avail ? avail.length : 0, chain: c.key ? chain(c, 'quality') : [], fastChain: c.key ? chain(c, 'fast') : [], sticky,
    models: [...H.entries()].map(([m, h]) => ({ model: m, ok: h.ok, fail: h.fail, lastMs: h.lastMs, cooldown_s: Math.max(0, Math.round((h.until - now) / 1000)), reason: h.until > now ? h.reason : '', lastErr: h.lastErr.replace(c.key || '\u0000', '***') })) };
}
/* ---------- JSON жөндеу ---------- */
const TEX_CMDS = 'frac|forall|beta|bar|begin|bmod|binom|boxed|bot|bullet|backslash|big|Big|bigl|bigr|neq|nabla|newline|not|nu|ni|nmid|ngeq|nleq|times|theta|tan|tau|text|textbf|textit|tfrac|triangle|tilde|top|to|rightarrow|Rightarrow|right|rho|rangle|rm|rfloor|rceil|mathrm|mathbf|sqrt|cdot|circ|alpha|gamma|delta|Delta|pi|sin|cos|log|ln|lim|sum|int|infty|le|ge|leq|geq|pm|approx|angle|perp|parallel|vec|overline|left|quad|dots|ldots|in|cup|cap|emptyset|mathbb|lambda|mu|sigma|omega|Omega|phi|varphi|degree|div';
const TEX_RE = new RegExp('(^|[^\\\\])((?:\\\\\\\\)*)\\\\(' + TEX_CMDS + ')(?![a-zA-Z])', 'g');
function escCtrlInStrings(s) {
  let out = '', inStr = false, esc = false;
  for (const ch of s) {
    if (inStr) { if (esc) { esc = false; out += ch; continue; } if (ch === '\\') { esc = true; out += ch; continue; } if (ch === '"') inStr = false;
      if (ch === '\n') { out += '\\n'; continue; } if (ch === '\r') continue; if (ch === '\t') { out += '\\t'; continue; } out += ch; }
    else { if (ch === '"') inStr = true; out += ch; }
  }
  return out;
}
function closeJson(s) { // үзілген JSON-ды жабу (ағын үзілсе)
  const st = []; let inStr = false, esc = false;
  for (const ch of s) { if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true; else if (ch === '{' || ch === '[') st.push(ch === '{' ? '}' : ']'); else if (ch === '}' || ch === ']') st.pop(); }
  let t = s; if (inStr) t += '"'; t = t.replace(/,\s*$/, ''); return t + st.reverse().join('');
}
function parseJson(txt, { partial } = {}) {
  let s = stripThought(String(txt || '')).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  const i = s.search(/[{[]/); if (i < 0) throw new Error('no JSON');
  const j = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']')); s = partial ? s.slice(i) : s.slice(i, j + 1);
  s = s.replace(TEX_RE, (m, a, b, cc) => a + b + '\\\\' + cc);
  const fixEsc = (x) => x.replace(/\\(u[0-9a-fA-F]{4}|.)/gs, (m, ch) => ch.length > 1 || '"\\/bfnrt'.includes(ch) ? m : '\\\\' + ch);
  const tries = [(x) => x, (x) => escCtrlInStrings(fixEsc(x)), (x) => escCtrlInStrings(fixEsc(x)).replace(/,\s*([}\]])/g, '$1'),
    (x) => closeJson(escCtrlInStrings(fixEsc(x)).replace(/,\s*([}\]])/g, '$1'))];
  let err; for (const f of tries) { try { return JSON.parse(f(s)); } catch (e) { err = e; } }
  throw err;
}
module.exports = { withSafety, SAFETY, complete, stream, status, health, discover, friendlyError, errKey, replyText, errMsg, cfg, parseJson, setDataDir, setStore, logLine, hashKey, cacheGet, cachePut };
