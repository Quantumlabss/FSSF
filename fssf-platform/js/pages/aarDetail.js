async function PageAARDetail(params, container) {
  if (!Auth.loaded) await Auth.refresh();
  const res = await api.get(`/aars/${params.id}`);
  const aar = res.aar;

  container.innerHTML = `
    <div class="container py-5" style="max-width:48rem">
      <div class="fssf-section-label">${esc(aar.outcome || 'debrief')}</div>
      <div class="d-flex justify-content-between align-items-start">
        <h1>${esc(aar.title)}</h1>
        ${Auth.hasRole('nco') ? `<a href="#/aars/${aar.id}/edit" class="btn btn-fssf-outline btn-sm">Edit</a>` : ''}
      </div>
      <p class="fssf-mono opacity-75">
        ${esc(aar.author?.callsign || aar.author?.username || '')} · ${fmtDate(aar.createdAt)}${aar.event ? ` · ${esc(aar.event.title)}` : ''}
      </p>
      <div class="fssf-card card p-4 mt-3">
        <div style="white-space:pre-wrap;opacity:0.95">${esc(aar.bodyMarkdown)}</div>
      </div>
    </div>`;
}
