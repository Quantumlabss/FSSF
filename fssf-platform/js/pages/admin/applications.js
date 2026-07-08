const ADMIN_APP_STATUSES = ['pending', 'interview', 'accepted', 'rejected'];
const ADMIN_APP_STATUS_TAG = { pending: 'fssf-tag--warn', interview: 'fssf-tag--warn', accepted: 'fssf-tag--ok', rejected: 'fssf-tag--danger' };

async function PageAdminApplications(params, container) {
  if (!(await guard(container, 'nco'))) return;

  let filter = 'pending';

  async function load() {
    const res = await api.get('/applications', filter ? { status: filter } : {});
    const list = document.getElementById('applications-list');
    list.innerHTML = res.applications.map((a) => `
      <div class="col-lg-6">
        <div class="fssf-card card p-4 h-100">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="mb-0">${esc(a.discordUsername)}</h5>
            <span class="fssf-tag ${ADMIN_APP_STATUS_TAG[a.status]}">${esc(a.status)}</span>
          </div>
          <p class="fssf-mono opacity-75 mb-2">Age ${esc(a.age ?? '—')} · ${esc(a.timezone || '—')} · ${a.hoursInPavlov ?? '—'}h in Pavlov</p>
          <p style="opacity:0.9"><strong>Why join:</strong> ${esc(a.whyJoin)}</p>
          ${a.experience ? `<p style="opacity:0.85"><strong>Experience:</strong> ${esc(a.experience)}</p>` : ''}
          <textarea class="form-control fssf-form mb-2 app-notes" data-id="${a.id}" rows="2" placeholder="Review notes (visible to staff)">${esc(a.reviewNotes || '')}</textarea>
          <div class="d-flex gap-2 flex-wrap">
            ${ADMIN_APP_STATUSES.filter((s) => s !== a.status).map((s) => `<button class="btn btn-fssf-outline btn-sm status-btn" data-id="${a.id}" data-status="${s}">Mark ${s}</button>`).join('')}
          </div>
        </div>
      </div>`).join('') || '<p class="fssf-mono opacity-75">No applications in this queue.</p>';

    document.querySelectorAll('.status-btn').forEach((btn) => btn.addEventListener('click', async () => {
      const notesEl = document.querySelector(`.app-notes[data-id="${btn.dataset.id}"]`);
      await api.put(`/applications/${btn.dataset.id}/status`, { status: btn.dataset.status, reviewNotes: notesEl.value });
      await load();
    }));
  }

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Command Post</div>
      <h1>Recruitment Applications</h1>
      <div class="d-flex gap-2 my-3" id="filter-buttons"></div>
      <div class="row g-4" id="applications-list"><p class="fssf-mono opacity-75">Loading…</p></div>
    </div>`;

  const filterButtons = document.getElementById('filter-buttons');
  ['', ...ADMIN_APP_STATUSES].forEach((s) => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${filter === s ? 'btn-fssf' : 'btn-fssf-outline'}`;
    btn.textContent = s || 'All';
    btn.addEventListener('click', () => {
      filter = s;
      [...filterButtons.children].forEach((b) => b.className = 'btn btn-sm btn-fssf-outline');
      btn.className = 'btn btn-sm btn-fssf';
      load();
    });
    filterButtons.appendChild(btn);
  });

  await load();
}
