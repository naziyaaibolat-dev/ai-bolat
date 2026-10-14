'use strict';
/* Тақырыптар каталогы v3.2 — ҚР үлгілік оқу бағдарламалары (№399 бұйрық, 2025 өзг.) бойынша:
   пән → сынып → тоқсан → бөлім → сабақ тақырыбы. Дерек: shared/catalog/catalog-v32.json */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'shared', 'catalog');
const RAW = JSON.parse(fs.readFileSync(path.join(DIR, 'catalog-v32.json'), 'utf8'));
const MIGRATE = (() => { try { return JSON.parse(fs.readFileSync(path.join(DIR, 'migrate-v32.json'), 'utf8')).map || {}; } catch { return {}; } })();
const SUBJECTS = RAW.subjects;
const CAT = {}, SECTIONS = {}, EXTRA = {};
const TOPICS = new Map();
for (const key of Object.keys(RAW.lists)) {
  const L = RAW.lists[key]; const i = key.lastIndexOf('-'); const subj = key.slice(0, i), g = +key.slice(i + 1);
  SECTIONS[key] = L.sections.map((s, si) => ({ i: si, q: s.q, kk: s.kk, ru: s.ru, en: s.en, count: 0 }));
  if (L.extra) EXTRA[key] = true;
  CAT[key] = L.topics.map((t, o) => {
    const sec = SECTIONS[key][t.s] || SECTIONS[key][0]; if (sec) sec.count++;
    const x = { id: t.id, n: t.n, o: o + 1, q: t.q, s: t.s, kk: t.kk, ru: t.ru, en: t.en };
    if (t.obj) x.obj = t.obj; if (t.full) x.full = t.full; if (L.extra) x.extra = 1;
    TOPICS.set(t.id, { ...x, subject: subj, grade: g, key });
    return x;
  });
}
const ORDER = Object.keys(SUBJECTS);
function subjectsForGrade(g) { return ORDER.filter(s => SUBJECTS[s].grades.includes(+g)).map(s => ({ id: s, ...SUBJECTS[s], count: (CAT[s + '-' + g] || []).length, sections: (SECTIONS[s + '-' + g] || []).length, extra: EXTRA[s + '-' + g] ? 1 : 0 })); }
function topicsOf(subj, g) { return CAT[subj + '-' + g] || []; }
function sectionsOf(subj, g) { return SECTIONS[subj + '-' + g] || []; }
function sectionOf(t) { return t ? (SECTIONS[t.subject + '-' + t.grade] || [])[t.s] || null : null; }
function nextOf(t) { const l = CAT[t.subject + '-' + t.grade] || []; const x = l[t.o]; return x ? x.id : null; }
function stats() { let t = 0, s = 0; for (const k in CAT) { t += CAT[k].length; s += SECTIONS[k].length; } return { subjects: ORDER.length, lists: Object.keys(CAT).length, sections: s, topics: t }; }
function counts() { const o = {}; for (const s of ORDER) { o[s] = { total: 0, grades: {} }; for (const g of SUBJECTS[s].grades) { const n = (CAT[s + '-' + g] || []).length; o[s].grades[g] = n; o[s].total += n; } } return o; }
const tTitle = (t, lang) => (t && (t[lang] || t.kk)) || '';
/* ескі id → жаңа id (v3.1 → v3.2) */
function resolveId(id) { if (TOPICS.has(id)) return id; const m = MIGRATE[id]; return m && TOPICS.has(m.to) ? m.to : null; }
/* іздеу: барлық пән/сынып бойынша, бөлім атауын да қоса */
function search(q, lang, limit = 60, filter = {}) {
  q = String(q || '').toLowerCase().trim(); if (q.length < 2) return [];
  const words = q.split(/\s+/).filter(Boolean); const out = [];
  for (const t of TOPICS.values()) {
    if (filter.grade && t.grade !== +filter.grade) continue; if (filter.subject && t.subject !== filter.subject) continue;
    const sec = sectionOf(t) || {};
    const hay = (t.kk + '|' + t.ru + '|' + t.en + '|' + (t.full || '') + '|' + (sec.kk || '') + '|' + (sec.ru || '') + '|' + (sec.en || '')).toLowerCase();
    if (!words.every(w => hay.includes(w))) continue;
    const title = (t[lang] || t.kk).toLowerCase(); const score = (title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2);
    out.push({ score, t, sec });
  }
  out.sort((a, b) => a.score - b.score || a.t.grade - b.t.grade);
  return out.slice(0, limit).map(({ t, sec }) => ({ id: t.id, kk: t.kk, ru: t.ru, en: t.en, q: t.q, o: t.o, subject: t.subject, grade: t.grade, section: { kk: sec.kk, ru: sec.ru, en: sec.en } }));
}
module.exports = { SUBJECTS, CAT, SECTIONS, TOPICS, MIGRATE, SOURCE: RAW.source, subjectsForGrade, topicsOf, sectionsOf, sectionOf, nextOf, stats, counts, tTitle, resolveId, search };
