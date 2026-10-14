'use strict';
/* AI-bolat — өндіріс (production) баптаулары. Барлығы орта айнымалылары (env) арқылы; толық тізім: .env.example / DEPLOY.md */
const clean = (v) => String(v == null ? '' : v).trim().replace(/^["']|["']$/g, '').trim();
const bool = (v, def) => { const s = clean(v).toLowerCase(); if (!s) return def; return ['1', 'true', 'yes', 'on'].includes(s); };
const num = (v, def) => { const n = +clean(v); return Number.isFinite(n) && clean(v) !== '' ? n : def; };
function load() {
  const IS_PROD = clean(process.env.NODE_ENV).toLowerCase() === 'production';
  const PORT = +process.env.PORT || 8790;
  const PUBLIC_URL = (clean(process.env.PUBLIC_URL) || `http://localhost:${PORT}`).replace(/\/+$/, '');
  const https = /^https:/i.test(PUBLIC_URL);
  const tp = clean(process.env.TRUST_PROXY);
  return {
    IS_PROD, PORT, PUBLIC_URL, HTTPS: https,
    // Render/Fly/Nginx артында: 1 (бір прокси). Жергілікті желіде: өшірулі.
    TRUST_PROXY: tp ? (/^\d+$/.test(tp) ? +tp : bool(tp, false)) : (IS_PROD ? 1 : false),
    COOKIE_SECURE: bool(process.env.COOKIE_SECURE, IS_PROD && https),
    // DEV SMS (код экранда): өндірісте әдепкі бойынша ӨШІРУЛІ. Тек сынақ үшін ALLOW_DEV_SMS=1.
    ALLOW_DEV_SMS: bool(process.env.ALLOW_DEV_SMS, !IS_PROD),
    // Демо деректер (мұғалім +77000000001 т.б.): өндірісте әдепкі бойынша жасалмайды және кіру жабық.
    SEED_DEMO: bool(process.env.SEED_DEMO, !IS_PROD),
    // өндірісте демо кіру тек DEMO_PASSWORD (≥ 8 таңба) орнатылса ғана ашылады — «demo1234» жария болмауы үшін
    DEMO_LOGIN: bool(process.env.DEMO_LOGIN, !IS_PROD) && (!IS_PROD || clean(process.env.DEMO_PASSWORD).length >= 8),
    DEMO_PASSWORD: clean(process.env.DEMO_PASSWORD),
    // Әкімші: телефондар тізімі (+77011234567,+77021234567) және бір реттік орнату токені (/setup беті)
    ADMIN_PHONES: clean(process.env.ADMIN_PHONES).split(/[,;\s]+/).map(s => s.replace(/[^\d+]/g, '')).filter(Boolean),
    ADMIN_SETUP_TOKEN: clean(process.env.ADMIN_SETUP_TOKEN),
    // Жария беттер (құпиялылық саясаты т.б.)
    SITE_NAME: clean(process.env.SITE_NAME) || 'AI-bolat',
    ORG_NAME: clean(process.env.ORG_NAME) || 'AI-bolat',
    CONTACT_EMAIL: clean(process.env.CONTACT_EMAIL) || 'support@example.com',
    GOOGLE_SITE_VERIFICATION: clean(process.env.GOOGLE_SITE_VERIFICATION),
    // Android TWA (Digital Asset Links)
    ANDROID_PACKAGE: clean(process.env.ANDROID_PACKAGE) || 'kz.aibolat.app',
    ANDROID_CERT_SHA256: clean(process.env.ANDROID_CERT_SHA256).split(/[,;\s]+/).filter(s => /^([0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2}$/.test(s)),
    PLAY_URL: clean(process.env.PLAY_URL),
    // Шектеулер (бір IP / бір пайдаланушы)
    RATE_PER_MIN: num(process.env.RATE_LIMIT_PER_MIN, 300),
    AI_PER_MIN: num(process.env.AI_LIMIT_PER_MIN, 20),
    AI_PER_DAY: num(process.env.AI_LIMIT_PER_DAY, 300),
    // Резервтік көшірме: DATA_DIR/backups ішіне әр N сағат сайын, соңғы K данасы сақталады
    BACKUP_HOURS: num(process.env.BACKUP_HOURS, IS_PROD ? 24 : 0),
    BACKUP_KEEP: num(process.env.BACKUP_KEEP, 7),
    // Тіркелуде құпиялылық саясаты + трансшекаралық беруге келісім (өндірісте міндетті)
    REQUIRE_CONSENT: bool(process.env.REQUIRE_CONSENT, IS_PROD),
    AI_CHILD_SAFETY: bool(process.env.AI_CHILD_SAFETY, true)
  };
}
module.exports = load();
module.exports.reload = () => Object.assign(module.exports, load());
