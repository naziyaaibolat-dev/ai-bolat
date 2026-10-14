'use strict';
/* AI-bolat — жария SEO сайты: сервер жағында жасалатын HTML (kk / ru / en), hreflang, Open Graph, JSON-LD,
   robots.txt, sitemap.xml, құпиялылық / шарттар / аккаунтты жою беттері, 404, /setup беті. */
const CFG = require('./config');
const T = require('./site-text');
const LEGAL = require('./legal');
const LANGS = ['kk', 'ru', 'en'];
const HL = { kk: 'kk-KZ', ru: 'ru-KZ', en: 'en' };
const OG_LOCALE = { kk: 'kk_KZ', ru: 'ru_RU', en: 'en_US' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const U = (p) => CFG.PUBLIC_URL + p;
const home = (l) => (l === 'kk' ? '/' : `/${l}/`);
const pg = (l, p) => `/${l}/${p}`;
const year = () => new Date().getFullYear();
const BUILD_DATE = new Date().toISOString().slice(0, 10);

function aiName() {
  if (process.env.AI_PROVIDER_NAME) return process.env.AI_PROVIDER_NAME;
  const b = String(process.env.AI_BASE_URL || '');
  if (/generativelanguage\.googleapis|aiplatform\.googleapis/.test(b)) return 'Google Gemini API (Google LLC)';
  if (/openai\.com/.test(b)) return 'OpenAI API (OpenAI, L.L.C.)';
  if (/anthropic\.com/.test(b)) return 'Anthropic Claude API (Anthropic PBC)';
  if (/openai\.azure\.com/.test(b)) return 'Azure OpenAI Service (Microsoft)';
  return b ? (() => { try { return new URL(b).host; } catch (e) { return 'AI provider'; } })() : 'OpenAI API (OpenAI, L.L.C.)';
}
function smsName() {
  const p = String(process.env.SMS_PROVIDER || '').toLowerCase();
  return { mobizon: 'Mobizon (mobizon.kz)', smsc: 'SMSC.kz', twilio: 'Twilio Inc.' }[p] || 'Mobizon (mobizon.kz)';
}
const LOC = {
  kz: ['Қазақстан Республикасында', 'в Республике Казахстан', 'in the Republic of Kazakhstan'],
  eu: ['Еуропалық Одақта (Германия, Франкфурт)', 'в Европейском союзе (Германия, Франкфурт)', 'in the European Union (Frankfurt, Germany)'],
  us: ['АҚШ-та', 'в США', 'in the United States']
};
function legalCtx(l) {
  const loc = LOC[String(process.env.DATA_LOCATION || 'kz').toLowerCase()] || [process.env.DATA_LOCATION, process.env.DATA_LOCATION, process.env.DATA_LOCATION];
  return { org: esc(CFG.ORG_NAME), email: esc(CFG.CONTACT_EMAIL), ai: esc(aiName()), sms: esc(smsName()), loc: esc(loc[0]), loc_ru: esc(loc[1]), loc_en: esc(loc[2]),
    url: esc(CFG.PUBLIC_URL), delete_url: pg(l, 'delete-account'), backup_days: Math.max(7, Math.ceil(CFG.BACKUP_KEEP * Math.max(CFG.BACKUP_HOURS, 24) / 24)) };
}

/* ---------- ортақ макет ---------- */
function layout(o) {
  const l = o.lang, t = T[l];
  const alts = LANGS.map(x => `<link rel="alternate" hreflang="${x}" href="${U(o.path(x))}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${U(o.path('kk'))}">`;
  const ld = (o.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('');
  const langSw = LANGS.map(x => `<a href="${o.path(x)}" hreflang="${x}" lang="${x}"${x === l ? ' aria-current="true" class="on"' : ''}>${x.toUpperCase()}</a>`).join('');
  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
${o.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${U(o.path(l))}">
${alts}
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="AI-bolat">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${U(o.path(l))}">
<meta property="og:image" content="${U('/img/og-image.png')}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="${OG_LOCALE[l]}">${LANGS.filter(x => x !== l).map(x => `<meta property="og:locale:alternate" content="${OG_LOCALE[x]}">`).join('')}
<meta name="twitter:card" content="summary_large_image">
${CFG.GOOGLE_SITE_VERIFICATION ? `<meta name="google-site-verification" content="${esc(CFG.GOOGLE_SITE_VERIFICATION)}">` : ''}
<meta name="theme-color" content="#06264A">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/css/site.css?v=${esc(require('../package.json').version)}">
${ld}
</head>
<body class="site">
<div class="bgfx" aria-hidden="true"></div>
<header class="top"><div class="wrap">
<a class="brand" href="${home(l)}"><img src="/img/logo.svg" width="36" height="36" alt=""><span>AI-bolat</span></a>
<nav class="menu" aria-label="main"><a href="${home(l)}#subjects">${esc(t.nav_subjects)}</a><a href="${pg(l, 'exams')}">${esc(t.nav_exams)}</a></nav>
<div class="langs" aria-label="${esc(t.lang_label)}">${langSw}</div>
<a class="btn sm ghost" href="/app/#/login">${esc(t.nav_login)}</a>
</div></header>
<main>${o.body}</main>
<footer class="foot"><div class="wrap">
<div class="fcol"><a class="brand" href="${home(l)}"><img src="/img/logo.svg" width="28" height="28" alt=""><span>AI-bolat</span></a><p class="muted">${esc(t.ai_note)}</p></div>
<nav class="fcol"><a href="${pg(l, 'privacy')}">${esc(t.foot_privacy)}</a><a href="${pg(l, 'terms')}">${esc(t.foot_terms)}</a><a href="${pg(l, 'delete-account')}">${esc(t.foot_delete)}</a><a href="mailto:${esc(CFG.CONTACT_EMAIL)}">${esc(t.foot_contact)}: ${esc(CFG.CONTACT_EMAIL)}</a></nav>
<p class="copy muted">© ${year()} ${esc(CFG.ORG_NAME)} · <span>${langSw}</span></p>
</div></footer>
<script src="/js/site.js?v=${esc(require('../package.json').version)}" defer></script>
</body></html>`;
}

/* ---------- деректер ---------- */
let _ex = null;
function examStats() {
  if (_ex) return _ex; const E = require('./exams'); const by = { ubt: {}, pisa: {}, olymp: {} }; let total = 0; const samples = { ubt: null, pisa: null, olymp: null };
  for (const it of E.ITEMS.values()) { if (!by[it.k]) continue; by[it.k][it.s] = (by[it.k][it.s] || 0) + 1; total++; if (!samples[it.k] && it.ty === 's' && it.q.length < 180 && !/\$/.test(it.q) && Array.isArray(it.o)) samples[it.k] = it; }
  return (_ex = { by, total, samples, SUBJ: E.SUBJ });
}
function subjList(CAT) { return [...CAT.SUBJECTS.entries ? CAT.SUBJECTS.entries() : Object.entries(CAT.SUBJECTS)]; }
function subjTopics(CAT, sid) { const s = (CAT.SUBJECTS.get ? CAT.SUBJECTS.get(sid) : CAT.SUBJECTS[sid]); if (!s) return null; const grades = s.grades.map(g => ({ g, topics: CAT.topicsOf(sid, g) || [] })).filter(x => x.topics.length); return { s, grades, n: grades.reduce((a, x) => a + x.topics.length, 0) }; }
const LI = { kk: 0, ru: 1, en: 2 };

function orgLd() { return { '@type': process.env.ORG_TYPE || 'EducationalOrganization', '@id': U('/#org'), name: CFG.ORG_NAME, url: U('/'), logo: U('/img/icon-512.png'), email: CFG.CONTACT_EMAIL, areaServed: 'KZ' }; }

/* ---------- басты бет ---------- */
function homePage(l, CAT) {
  const t = T[l], st = CAT.stats(), ex = examStats();
  const subjects = subjList(CAT).map(([id, s]) => { const x = subjTopics(CAT, id); const g = s.grades; return `<a class="scard" style="--c:${esc(s.color)}" href="${pg(l, 'subjects/' + id)}"><span class="si">${s.icon}</span><b>${esc(s[l])}</b><small>${g[0]}–${g[g.length - 1]} ${esc(t.grades)} · ${x ? x.n : 0} ${esc(t.topics_word)}</small></a>`; }).join('');
  const play = CFG.PLAY_URL ? `<a class="btn play" href="${esc(CFG.PLAY_URL)}" rel="noopener">▶ ${esc(t.cta_play)}</a>` : '';
  const body = `
<section class="hero"><div class="wrap hgrid">
<div><p class="kicker">${esc(t.hero_kicker)}</p><h1>${esc(t.hero_h1)}</h1><p class="lead">${esc(t.hero_lead)}</p>
<div class="ctas"><a class="btn" href="/app/#/register?role=student">${esc(t.cta_student)}</a><a class="btn ghost" href="/app/#/register?role=teacher">${esc(t.cta_teacher)}</a>${play}<button class="btn ghost" id="installBtn" hidden>📲 ${esc(t.cta_install)}</button></div>
<ul class="stats"><li><b>${st.subjects}</b>${esc(t.stats[0])}</li><li><b>${st.topics}</b>${esc(t.stats[1])}</li><li><b>${ex.total}+</b>${esc(t.stats[2])}</li><li><b>3</b>${esc(t.stats[3])}</li></ul></div>
<div class="hero-art"><img src="/img/shots/phone-home.png" width="360" height="640" alt="AI-bolat" loading="eager" fetchpriority="high"></div>
</div></section>
<section class="wrap"><h2>${esc(t.feat_h)}</h2><div class="fgrid">${t.feats.map(f => `<article class="fcard"><span class="fi">${f[0]}</span><h3>${esc(f[1])}</h3><p>${esc(f[2])}</p></article>`).join('')}</div></section>
<section class="wrap"><h2>${esc(t.how_h)}</h2><ol class="how">${t.how.map(h => `<li><span>${h[0]}</span><div><b>${esc(h[1])}</b><p>${esc(h[2])}</p></div></li>`).join('')}</ol></section>
<section class="wrap" id="subjects"><h2>${esc(t.subj_h)}</h2><p class="muted">${esc(t.subj_lead)}</p><div class="sgrid">${subjects}</div></section>
<section class="wrap"><div class="band"><div><h2>${esc(t.exams_h1)}</h2><p>${esc(t.exams_desc)}</p></div><a class="btn" href="${pg(l, 'exams')}">${esc(t.exams_h1)} →</a></div></section>
<section class="wrap faq"><h2>${esc(t.faq_h)}</h2>${t.faq.map(q => `<details><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join('')}</section>`;
  const jsonld = [
    { '@context': 'https://schema.org', '@graph': [
      orgLd(),
      { '@type': 'WebSite', '@id': U('/#website'), url: U('/'), name: 'AI-bolat', inLanguage: ['kk', 'ru', 'en'], publisher: { '@id': U('/#org') } },
      { '@type': 'WebApplication', name: 'AI-bolat', url: U('/app/'), applicationCategory: 'EducationalApplication', operatingSystem: 'Web, Android', inLanguage: ['kk', 'ru', 'en'],
        description: t.home_desc, image: U('/img/og-image.png'), offers: { '@type': 'Offer', price: '0', priceCurrency: 'KZT' }, publisher: { '@id': U('/#org') },
        audience: { '@type': 'EducationalAudience', educationalRole: ['student', 'teacher'] } },
      { '@type': 'FAQPage', mainEntity: t.faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) }
    ] }];
  return layout({ lang: l, title: t.home_title, desc: t.home_desc, path: home, body, jsonld });
}

/* ---------- пән беті ---------- */
function subjectPage(l, CAT, sid) {
  const t = T[l]; const x = subjTopics(CAT, sid); if (!x) return null;
  const name = x.s[l], g = x.s.grades;
  const body = `<section class="wrap page"><p><a href="${home(l)}#subjects">${esc(t.back_subjects)}</a></p>
<h1><span class="si">${x.s.icon}</span> ${esc(name)}</h1><p class="lead">${esc(t.subj_page_desc(name, x.n, `${g[0]}–${g[g.length - 1]}`))}</p>
<nav class="chips">${x.grades.map(gr => `<a href="#g${gr.g}">${esc(t.grade_h(gr.g))}</a>`).join('')}</nav>
${x.grades.map(gr => `<h2 id="g${gr.g}">${esc(t.grade_h(gr.g))} <small class="muted">· ${gr.topics.length} ${esc(t.topics_word)}</small></h2>
<ol class="topics">${gr.topics.map(tp => `<li><a href="/app/#/lesson/${esc(tp.id)}">${esc(tp[l] || tp.kk)}</a></li>`).join('')}</ol>
<p><a class="btn sm" href="/app/#/subject/${esc(sid)}/${gr.g}">${esc(t.open_topic)} →</a></p>`).join('')}
</section>`;
  const jsonld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'AI-bolat', item: U(home(l)) }, { '@type': 'ListItem', position: 2, name, item: U(pg(l, 'subjects/' + sid)) }] },
    { '@type': 'Course', name: `${name} (1–11)`, description: t.subj_page_desc(name, x.n, `${g[0]}–${g[g.length - 1]}`), inLanguage: HL[l], isAccessibleForFree: true,
      provider: orgLd(), educationalLevel: `${g[0]}–${g[g.length - 1]}`, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT15M' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KZT', category: 'Free' } }
  ] }];
  return layout({ lang: l, title: t.subj_page_title(name), desc: t.subj_page_desc(name, x.n, `${g[0]}–${g[g.length - 1]}`), path: (x2) => pg(x2, 'subjects/' + sid), body, jsonld });
}

/* ---------- емтихан беті ---------- */
function examsPage(l) {
  const t = T[l], ex = examStats(), i = LI[l];
  const kinds = ['ubt', 'pisa', 'olymp'].map(k => { const subs = Object.entries(ex.by[k]); const n = subs.reduce((a, s) => a + s[1], 0);
    return `<article class="fcard"><h3>${esc(t.kind[k])} <small class="muted">· ${n} ${esc(t.questions)}</small></h3><ul class="plain">${subs.map(([s, c]) => `<li>${esc((ex.SUBJ[s] || [s, s, s])[i])} — ${c}</li>`).join('')}</ul>
<p><a class="btn sm" href="/app/#/exam">${esc(t.try_now)} →</a></p></article>`; }).join('');
  const samples = Object.entries(ex.samples).filter(s => s[1]).map(([k, it]) => `<article class="qcard" lang="kk"><p class="muted">${esc(t.kind[k])} · ${esc((ex.SUBJ[it.s] || [it.s])[0])}</p><p><b>${esc(it.q)}</b></p><ol type="A">${it.o.map(o => `<li>${esc(o)}</li>`).join('')}</ol></article>`).join('');
  const body = `<section class="wrap page"><h1>${esc(t.exams_h1)}</h1><p class="lead">${esc(t.exams_desc)}</p><p>${esc(t.exams_lead)}</p>
<div class="fgrid">${kinds}</div><h2>${esc(t.exams_sample)}</h2><p class="muted">${esc(t.exams_note)}</p><div class="fgrid">${samples}</div></section>`;
  return layout({ lang: l, title: t.exams_title, desc: t.exams_desc, path: (x) => pg(x, 'exams'), body,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'AI-bolat', item: U(home(l)) }, { '@type': 'ListItem', position: 2, name: t.exams_h1, item: U(pg(l, 'exams')) }] }] });
}

/* ---------- құқықтық беттер ---------- */
function legalPage(l, kind) {
  const t = T[l], G = LEGAL[l]; const c = legalCtx(l);
  const title = G[kind + '_title'], html = G[kind](c);
  const body = `<section class="wrap page legal"><h1>${esc(title)}</h1><p class="muted">${esc(t.updated)}: ${esc(process.env.LEGAL_UPDATED || BUILD_DATE)}</p>${html}</section>`;
  const slug = kind === 'delete' ? 'delete-account' : kind;
  return layout({ lang: l, title: `${title} — AI-bolat`, desc: `${title}: AI-bolat (${CFG.ORG_NAME}).`, path: (x) => pg(x, slug), body });
}

/* ---------- 404 ---------- */
function notFound(req, res) {
  const m = req.path.match(/^\/(ru|en|kk)(\/|$)/); const l = m ? m[1] : 'kk'; const t = T[l];
  res.status(404).type('html').setHeader('Cache-Control', 'no-cache');
  res.send(layout({ lang: l, title: `${t.nf_title} — AI-bolat`, desc: t.nf_text, path: home, noindex: true,
    body: `<section class="wrap page center"><h1>404 · ${esc(t.nf_title)}</h1><p class="lead">${esc(t.nf_text)}</p><p><a class="btn" href="${home(l)}">${esc(t.nf_home)}</a> <a class="btn ghost" href="/app/">${esc(t.nav_app)}</a></p></section>` }));
}

/* ---------- алғашқы әкімші беті ---------- */
function setupPage() {
  return `<!doctype html><html lang="kk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>AI-bolat · Алғашқы әкімші / Первый администратор</title><link rel="stylesheet" href="/css/site.css"></head><body class="site"><div class="bgfx"></div>
<section class="wrap page narrow"><h1>🛠️ Алғашқы әкімшіні жасау</h1><p class="muted">Первый администратор · First admin. Бұл бет әкімші жасалған соң өздігінен жабылады.</p>
<form id="f" class="form"><label>ADMIN_SETUP_TOKEN<input name="token" required autocomplete="off"></label>
<label>Аты-жөні / Имя<input name="name" required minlength="2"></label><label>Телефон<input name="phone" required placeholder="+7 7XX XXX XX XX"></label>
<label>Құпиясөз / Пароль (≥ 8)<input name="password" type="password" required minlength="8" autocomplete="new-password"></label>
<button class="btn">Жасау / Создать</button><p id="msg" role="status"></p></form></section>
<script>document.getElementById('f').onsubmit=async function(e){e.preventDefault();var d=Object.fromEntries(new FormData(this));var m=document.getElementById('msg');
try{var r=await fetch('/api/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});var j=await r.json();if(!r.ok)throw new Error(j.error||r.status);
m.textContent='✓ Дайын! Бағытталуда…';location.href='/app/#/admin';}catch(err){m.textContent='✗ '+err.message;}};</script></body></html>`;
}

/* ---------- маршруттар ---------- */
function register(app, D) {
  const { CAT } = D;
  const html = (res, s, cache = 'public, max-age=600') => { res.type('html').setHeader('Cache-Control', cache); res.send(s); };
  const memo = new Map(); const cached = (k, fn) => { if (CFG.IS_PROD && memo.has(k)) return memo.get(k); const v = fn(); if (v) memo.set(k, v); return v; };
  app.get('/', (req, res) => { if (req.user && req.query.home === undefined) return res.redirect(302, '/app/'); html(res, cached('home:kk', () => homePage('kk', CAT)), 'no-cache'); });
  app.get(['/kk', '/kk/'], (req, res) => res.redirect(301, '/'));
  app.get(/^\/(ru|en)\/?$/, (req, res) => { const l = req.path.slice(1, 3); if (!req.path.endsWith('/')) return res.redirect(301, `/${l}/`); html(res, cached('home:' + l, () => homePage(l, CAT))); });
  app.get('/:lang(kk|ru|en)/subjects/:sid', (req, res, next) => { const p = cached(`s:${req.params.lang}:${req.params.sid}`, () => subjectPage(req.params.lang, CAT, req.params.sid)); if (!p) return next(); html(res, p); });
  app.get('/:lang(kk|ru|en)/exams', (req, res) => html(res, cached('ex:' + req.params.lang, () => examsPage(req.params.lang))));
  app.get('/:lang(kk|ru|en)/:kind(privacy|terms|delete-account)', (req, res) => html(res, cached(`lg:${req.params.lang}:${req.params.kind}`, () => legalPage(req.params.lang, req.params.kind === 'delete-account' ? 'delete' : req.params.kind))));
  app.get(['/privacy', '/terms', '/delete-account', '/exams'], (req, res) => res.redirect(301, '/kk' + req.path));
  app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /setup\n\nSitemap: ${U('/sitemap.xml')}\n`));
  app.get('/sitemap.xml', (req, res) => {
    const pages = [home, (l) => pg(l, 'exams'), ...Object.keys(CAT.SUBJECTS).map(id => (l) => pg(l, 'subjects/' + id)), (l) => pg(l, 'privacy'), (l) => pg(l, 'terms'), (l) => pg(l, 'delete-account')];
    const urls = pages.flatMap((f, i) => LANGS.map(l => `<url><loc>${U(f(l))}</loc><lastmod>${BUILD_DATE}</lastmod><changefreq>${i < 2 ? 'weekly' : 'monthly'}</changefreq><priority>${i === 0 ? '1.0' : i < 2 ? '0.8' : i < pages.length - 3 ? '0.7' : '0.3'}</priority>${LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${U(f(x))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${U(f('kk'))}"/></url>`));
    res.type('application/xml').setHeader('Cache-Control', 'public, max-age=3600');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  });
}
module.exports = { register, notFound, setupPage, homePage, legalPage, aiName };
