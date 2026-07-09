const AAR_OUTCOME_TAG = { success: 'fssf-tag--ok', failure: 'fssf-tag--danger', partial: 'fssf-tag--warn' };

async function PageAARList(params, container) {
  if (!Auth.loaded) await Auth.refresh();
  const res = await api.get('/aars');
  const aars = res.aars;

  container.innerHTML = `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-end">
        <div>
          <div class="fssf-section-label">Debrief</div>
          <h1 class="mb-0">After Action Reports</h1>
        </div>
        ${Auth.hasRole('nco') ? '<a href="#/aars/new" class="btn btn-fssf btn-sm">New AAR</a>' : ''}
      </div>
      <div class="row g-4 mt-2">
        ${aars.map((a) => `
          <div class="col-md-6">
            <a href="#/aars/${a.id}" class="text-decoration-none">
              <div class="fssf-card card p-4 h-100">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="mb-0">${esc(a.title)}</h5>
                  ${a.outcome ? `<span class="fssf-tag ${AAR_OUTCOME_TAG[a.outcome] || ''}">${esc(a.outcome)}</span>` : ''}
                </div>
                <p style="opacity:0.85">${esc(a.summary || a.bodyMarkdown.slice(0, 140))}</p>
                <small class="fssf-mono opacity-75">${esc(a.author?.callsign || a.author?.username || '')} · ${fmtDate(a.createdAt)}</small>
              </div>
            </a>
          </div>`).join('') || '<p class="fssf-mono opacity-75">No AARs published yet.</p>'}
      </div>
    </div>`;
}
