'use strict';
/* ===== Әкімші панелі: ескертулер, статистика, шағымдар, резервтік көшірме ===== */
route('admin', async (view) => {
  if (!State.user || !State.user.is_admin) { view.innerHTML = `<div class="page">${errBox({ message: T('forbidden') === 'forbidden' ? '403' : T('forbidden') })}</div>`; return; }
  const draw = async () => {
    const [o, r] = await Promise.all([api('GET', '/api/admin/overview'), api('GET', '/api/admin/reports')]);
    const c = o.counts;
    view.innerHTML = `<div class="page"><h1>🛡️ ${T('adm_title')}</h1><p class="muted small">v${esc(o.version)} · ${esc(o.public_url)} · ${o.prod ? 'production' : 'development'} · SMS: ${esc(o.sms.provider)} · AI: ${o.ai.enabled ? '✓' : '✗'}</p>
      <div class="card"><h2>⚠️ ${T('adm_warn')}</h2>${o.warnings.length ? `<ul class="warnlist">${o.warnings.map(w => `<li class="warnbox">${esc(T('w_' + w))}</li>`).join('')}</ul>` : `<p class="ok">${T('adm_ok')}</p>`}</div>
      <div class="card"><h2>📊 ${T('adm_counts')}</h2><div class="grid4">${[['🧑‍🏫', c.teachers], ['🎒', c.students], ['🏫', c.classes], ['🕹️', c.results], ['🎯', c.exams], ['🤖', c.bolat], ['⚑', c.reports_open], ['💾', c.db_mb + ' MB']].map(x => `<div class="stat"><b class="grad-t">${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div></div>
      <div class="card"><h2>⚑ ${T('adm_reports')}</h2>${r.reports.length ? `<div class="scrollx"><table class="tbl"><thead><tr><th>#</th><th>${T('date')}</th><th></th><th></th><th></th><th></th></tr></thead><tbody>${r.reports.map(x => `<tr class="${x.status !== 'open' ? 'muted' : ''}">
        <td>${x.id}</td><td class="small">${fmtDate(x.created_at)}</td><td><b>${esc(x.kind)}</b><br><small>${esc(x.ref || '')}</small></td><td>${esc(T('rr_' + x.reason))}<br><small>${esc(x.user_name || '—')} (${esc(x.user_role || '')})</small></td>
        <td class="small" style="max-width:420px">${esc(x.note || '')}${x.note ? '<hr>' : ''}<span class="muted">${esc((x.excerpt || '').slice(0, 400))}</span></td>
        <td>${x.status === 'open' ? `<button class="btn sm" data-st="resolved" data-id="${x.id}">${T('adm_resolve')}</button> <button class="btn sm ghost" data-st="dismissed" data-id="${x.id}">${T('adm_dismiss')}</button>` : esc(x.status)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${T('adm_none')}</p>`}</div>
      <div class="card"><h2>💾 ${T('adm_backups')}</h2><div class="row"><button class="btn" id="bkNow">${T('adm_backup_now')}</button><a class="btn ghost" href="/api/admin/backup/download">${T('adm_download')}</a></div>
        <ul class="small">${o.backups.map(b => `<li>${esc(b.file)} · ${b.kb} KB</li>`).join('') || '<li class="muted">—</li>'}</ul></div></div>`;
    $$('[data-st]', view).forEach(b => b.onclick = async () => { await api('POST', '/api/admin/reports/' + b.dataset.id, { status: b.dataset.st }); draw(); });
    $('#bkNow', view).onclick = async () => { await api('POST', '/api/admin/backup'); toast('✓'); draw(); };
  };
  await draw();
});
