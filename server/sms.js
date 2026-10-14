'use strict';
/* SMS провайдер абстракциясы.
   SMS_PROVIDER=mobizon  + MOBIZON_API_KEY (+ MOBIZON_DOMAIN=api.mobizon.kz, MOBIZON_FROM) — Mobizon.kz арқылы нақты SMS
   SMS_PROVIDER=smsc     + SMSC_LOGIN + SMSC_PASSWORD (+ SMSC_SENDER)                      — SMSC.kz арқылы
   SMS_PROVIDER=twilio   + TWILIO_SID + TWILIO_TOKEN + TWILIO_FROM                          — Twilio
   бос болса → DEV режимі: код экранда және сервер журналында көрсетіледі. */
const clean = (v) => String(v || '').trim().replace(/^["']|["']$/g, '').trim();
function provider() { const p = clean(process.env.SMS_PROVIDER).toLowerCase(); return ['mobizon', 'smsc', 'twilio'].includes(p) ? p : 'dev'; }
function isDev() { return provider() === 'dev'; }
async function send(phone, text) {
  const p = provider(); const digits = phone.replace(/\D/g, '');
  if (p === 'dev') { console.log(`[SMS DEV] ${phone}: ${text}`); return { ok: true, dev: true }; }
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    if (p === 'mobizon') {
      const key = clean(process.env.MOBIZON_API_KEY); if (!key) throw new Error('MOBIZON_API_KEY орнатылмаған');
      const domain = clean(process.env.MOBIZON_DOMAIN) || 'api.mobizon.kz';
      const body = new URLSearchParams({ recipient: digits, text }); const from = clean(process.env.MOBIZON_FROM); if (from) body.set('from', from);
      const r = await fetch(`https://${domain}/service/message/sendsmsmessage?output=json&api=v1&apiKey=${encodeURIComponent(key)}`, { method: 'POST', body, signal: ctrl.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'cache-control': 'no-cache' } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.code !== 0) throw new Error('Mobizon: ' + (d.message || r.status) + (d.code !== undefined ? ' (code ' + d.code + ')' : ''));
      return { ok: true };
    }
    if (p === 'smsc') {
      const q = new URLSearchParams({ login: clean(process.env.SMSC_LOGIN), psw: clean(process.env.SMSC_PASSWORD), phones: digits, mes: text, charset: 'utf-8', fmt: '3' });
      const snd = clean(process.env.SMSC_SENDER); if (snd) q.set('sender', snd);
      const r = await fetch('https://smsc.kz/sys/send.php', { method: 'POST', body: q, signal: ctrl.signal });
      const d = await r.json().catch(() => ({})); if (!r.ok || d.error) throw new Error('SMSC: ' + (d.error || r.status)); return { ok: true };
    }
    if (p === 'twilio') {
      const sid = clean(process.env.TWILIO_SID), tok = clean(process.env.TWILIO_TOKEN);
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', signal: ctrl.signal,
        headers: { Authorization: 'Basic ' + Buffer.from(sid + ':' + tok).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: '+' + digits, From: clean(process.env.TWILIO_FROM), Body: text }) });
      const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error('Twilio: ' + (d.message || r.status)); return { ok: true };
    }
  } finally { clearTimeout(tm); }
}
module.exports = { send, provider, isDev };
