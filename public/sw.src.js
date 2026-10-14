/* AI-bolat service worker v4 — офлайн: қабықша алдын ала кэштеледі, статика stale-while-revalidate,
   каталог пен ашылған сабақтар network-first (интернет жоқта — кэштен). Нұсқа: __VERSION__ */
const V = '__VERSION__';
const CACHE = 'aibolat-' + V, API = 'aibolat-api-' + V;
const SHELL = ['/app/', '/offline.html', '/img/logo.svg', '/img/favicon.svg', '/img/bolat.svg', '/img/icon-192.png', '/manifest.webmanifest',
  '/vendor/katex/katex.min.css', '/vendor/katex/katex.min.js', '/vendor/katex/auto-render.min.js',
  '/css/app.css?v=4.0', '/css/v3.css?v=4.0', '/css/v32.css?v=4.0', '/css/v4.css?v=4.0', '/js/theme-boot.js',
  ...['i18n', 'core', 'p-auth', 'p-home', 'p-explain', 'p-lesson', 'games', 'p-exam', 'p-classes', 'p-messages', 'p-bolat', 'p-profile', 'p-admin', 'p-lab', 'p-v4', 'app'].map(n => `/js/${n}.js?v=4.0`)];
const API_CACHEABLE = /^\/api\/(me|config|dashboard|catalog(\/.*)?|lesson\/[^/]+|v4\/lesson\/[^/]+\/media|v4\/analytics\/me|v4\/assignments|classes|assignments|announcements)$/;
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil((async () => {
  const ks = await caches.keys(); const had = ks.some(k => k.startsWith('aibolat-') && k !== CACHE && k !== API);
  await Promise.all(ks.filter(k => k.startsWith('aibolat-') && k !== CACHE && k !== API).map(k => caches.delete(k)));
  await self.clients.claim(); if (had) (await self.clients.matchAll({ type: 'window' })).forEach(c => c.postMessage({ type: 'sw-updated', version: V }));
})()); });
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'logout') caches.delete(API); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin || url.pathname === '/sw.js') return;
  if (url.pathname.startsWith('/api/')) {
    if (!API_CACHEABLE.test(url.pathname) || url.searchParams.get('wait') === '1') return;
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(API).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req).then(r => r || new Response(JSON.stringify({ error: 'offline', code: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { if (r.ok && url.pathname.startsWith('/app')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put('/app/', cp)); } return r; })
      .catch(() => caches.match(url.pathname.startsWith('/app') ? '/app/' : req).then(r => r || caches.match('/offline.html'))));
    return;
  }
  if (/^\/(css|js|img|vendor)\//.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(async c => { const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net; }));
  }
});
