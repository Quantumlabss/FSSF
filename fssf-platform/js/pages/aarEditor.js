async function PageAAREditor(params, container) {
  if (!(await guard(container, 'nco'))) return;

  const isEdit = Boolean(params.id);
  const events = (await api.get('/events')).events;

  let existing = { eventId: '', title: '', summary: '', bodyMarkdown: '', outcome: 'success' };
  if (isEdit) {
    const a = (await api.get(`/aars/${params.id}`)).aar;
    existing = { eventId: a.eventId || '', title: a.title, summary: a.summary || '', bodyMarkdown: a.bodyMarkdown, outcome: a.outcome || 'success' };
  }

  container.innerHTML = `
    <div class="container py-5" style="max-width:48rem">
      <div class="fssf-section-label">Debrief Editor</div>
      <h1>${isEdit ? 'Edit AAR' : 'New After Action Report'}</h1>
      <div class="fssf-form fssf-card card p-4 mt-3">
        <div class="text-danger fssf-mono small mb-3" id="aar-error"></div>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Title</label>
            <input class="form-control" id="f-title" value="${esc(existing.title)}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Linked Event</label>
            <select class="form-select" id="f-eventId">
              <option value="">— none —</option>
              ${events.map((e) => `<option value="${e.id}" ${String(existing.eventId) === String(e.id) ? 'selected' : ''}>${esc(e.title)}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Outcome</label>
            <select class="form-select" id="f-outcome">
              ${['success', 'partial', 'failure'].map((o) => `<option value="${o}" ${existing.outcome === o ? 'selected' : ''}>${o[0].toUpperCase() + o.slice(1)}</option>`).join('')}
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Summary</label>
            <input class="form-control" id="f-summary" value="${esc(existing.summary)}" placeholder="One-line summary shown in the AAR list">
          </div>
          <div class="col-12">
            <label class="form-label">Full Report</label>
            <textarea class="form-control" rows="12" id="f-body" placeholder="Objective, execution, what worked, what didn't, follow-up actions…">${esc(existing.bodyMarkdown)}</textarea>
          </div>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-fssf-outline btn-sm" id="save-draft">Save Draft</button>
          <button class="btn btn-fssf btn-sm" id="save-publish">Publish</button>
        </div>
      </div>
    </div>`;

  async function save(published) {
    document.getElementById('aar-error').textContent = '';
    const payload = {
      eventId: document.getElementById('f-eventId').value || null,
      title: document.getElementById('f-title').value,
      summary: document.getElementById('f-summary').value,
      bodyMarkdown: document.getElementById('f-body').value,
      outcome: document.getElementById('f-outcome').value,
      published,
    };
    try {
      const res = isEdit ? await api.put(`/aars/${params.id}`, payload) : await api.post('/aars', payload);
      location.hash = `#/aars/${res.aar.id}`;
    } catch (err) {
      document.getElementById('aar-error').textContent = err.message;
    }
  }

  document.getElementById('save-draft').addEventListener('click', () => save(false));
  document.getElementById('save-publish').addEventListener('click', () => save(true));
}
