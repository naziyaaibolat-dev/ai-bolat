/* AI-bolat — жария сайт скрипті: ескі #/ сілтемелерін /app/-қа бағыттау, PWA орнату, service worker */
(function () {
  if (/^#\//.test(location.hash) && location.pathname === '/') { location.replace('/app/' + location.hash); return; }
  var deferred = null, btn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (btn) btn.hidden = false; });
  if (btn) btn.addEventListener('click', function () { if (!deferred) return; deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; btn.hidden = true; }); });
  window.addEventListener('appinstalled', function () { if (btn) btn.hidden = true; });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {}); });
})();
