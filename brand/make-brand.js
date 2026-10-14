'use strict';
/* AI-bolat v3.2 бренді: логотип SVG-лері (шаңырақ + «А» киіз үй сұлбасы + нейрон түйіндері + ұшқын).
   node brand/make-brand.js → brand/*.svg (PNG-лерді scripts/make-icons.js салады) */
const fs = require('fs'), path = require('path');
const C = { sky1: '#29C5F6', sky2: '#0A7FC2', navy: '#06264A', gold1: '#FFE07A', gold2: '#F4B41A', gold3: '#D98E04', white: '#FFFFFF' };
const defs = (id = '') => `<defs>
<linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient>
<linearGradient id="au${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.gold1}"/><stop offset=".55" stop-color="${C.gold2}"/><stop offset="1" stop-color="${C.gold3}"/></linearGradient>
<radialGradient id="gl${id}" cx=".5" cy=".32" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
/* белгі 64×64 торда. detail: 0 — favicon (қарапайым), 1 — толық */
function mark(detail = 1, id = '', ink = null) {
  const au = ink || `url(#au${id})`, node = ink ? ink : '#fff';
  const rays = detail ? `<g stroke="${ink || '#fff'}" stroke-width="1.6" stroke-linecap="round" opacity="${ink ? 1 : .75}"><path d="M29.2 27.4 L23 49"/><path d="M34.8 27.4 L41 49"/></g>` : '';
  const lattice = detail
    ? `<g fill="none" stroke="${au}" stroke-width="2" stroke-linecap="round"><path d="M24.6 17.6 Q32 22.4 39.4 17.6"/><path d="M24.6 22.4 Q32 17.6 39.4 22.4"/><path d="M29.6 12.6 Q27 20 29.6 27.4"/><path d="M34.4 12.6 Q37 20 34.4 27.4"/></g>`
    : `<g fill="none" stroke="${au}" stroke-width="2.6" stroke-linecap="round"><path d="M25 20 H39"/><path d="M32 13 V27"/></g>`;
  const nodes = detail
    ? `<g fill="${node}"><circle cx="13.5" cy="50" r="3.1"/><circle cx="23" cy="50" r="2.3"/><circle cx="41" cy="50" r="2.3"/><circle cx="50.5" cy="50" r="3.1"/><circle cx="32" cy="40.5" r="2.6"/></g>`
    : `<g fill="${node}"><circle cx="13.5" cy="50" r="3.6"/><circle cx="50.5" cy="50" r="3.6"/></g>`;
  const bar = `<path d="M19.2 40.5 H44.8" stroke="${node}" stroke-width="${detail ? 2.4 : 3.2}" stroke-linecap="round"/>`;
  const legs = `<g fill="none" stroke="${au}" stroke-width="${detail ? 3.6 : 4.6}" stroke-linecap="round" stroke-linejoin="round"><path d="M26 25.6 L13.5 50"/><path d="M38 25.6 L50.5 50"/></g>`;
  const ring = `<circle cx="32" cy="20" r="${detail ? 9.2 : 9.6}" fill="${ink ? 'none' : 'rgba(6,38,74,.18)'}" stroke="${au}" stroke-width="${detail ? 3 : 3.8}"/>`;
  const spark = detail ? `<path d="M50.5 7.5 l1.9 4.6 4.6 1.9 -4.6 1.9 -1.9 4.6 -1.9 -4.6 -4.6 -1.9 4.6 -1.9z" fill="${ink || C.gold1}"/><circle cx="50.5" cy="14" r="1.2" fill="${ink ? 'none' : '#fff'}"/>` : '';
  return rays + legs + bar + ring + lattice + nodes + spark;
}
const icon = ({ detail = 1, rx = 15, full = false, scale = 1 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${defs()}${full ? `<rect width="64" height="64" fill="url(#bg)"/>` : `<rect x="1" y="1" width="62" height="62" rx="${rx}" fill="url(#bg)"/>`}<rect ${full ? 'width="64" height="64"' : `x="1" y="1" width="62" height="62" rx="${rx}"`} fill="url(#gl)"/><g transform="translate(32 31) scale(${scale}) translate(-32 -30)">${mark(detail)}</g></svg>`;
const bare = (ink) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 3 56 52">${defs()}${mark(1, '', ink)}</svg>`;
const word = (dark) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64">${defs()}<rect x="1" y="1" width="62" height="62" rx="15" fill="url(#bg)"/><rect x="1" y="1" width="62" height="62" rx="15" fill="url(#gl)"/><g transform="translate(32 31) translate(-32 -30)">${mark(1)}</g>
<text x="78" y="44" font-family="'Segoe UI','Noto Sans',Roboto,Arial,sans-serif" font-size="36" font-weight="800" letter-spacing="-1"><tspan fill="url(#au)">AI</tspan><tspan fill="${dark ? '#fff' : C.navy}">-bolat</tspan></text></svg>`;
const out = {
  'logo.svg': icon(), 'logo-mark-transparent.svg': bare(), 'logo-mono-white.svg': bare('#fff'), 'logo-mono-navy.svg': bare(C.navy),
  'favicon.svg': icon({ detail: 0, rx: 14 }), 'maskable.svg': icon({ full: true, scale: .72 }), 'play-icon.svg': icon({ full: true, scale: .86 }),
  'logo-horizontal-dark-bg.svg': word(true), 'logo-horizontal-light-bg.svg': word(false)
};
for (const [f, s] of Object.entries(out)) fs.writeFileSync(path.join(__dirname, f), s);
fs.writeFileSync(path.join(__dirname, 'COLORS.json'), JSON.stringify(C, null, 1));
module.exports = { icon, bare, word, C };
console.log('brand:', Object.keys(out).join(', '));
