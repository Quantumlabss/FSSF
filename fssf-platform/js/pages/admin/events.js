async function PageAdminEvents(params, container) {
  if (!(await guard(container, 'nco'))) return;

  let editingId = null;

  async function load() {
    const res = await api.get('/events');
    document.getElementById('admin-events-table').innerHTML = res.events.map((e) => `
      <tr>
        <td>${esc(e.title)}</td>
        <td>${esc(e.eventType)}</td>
        <td class="fssf-mono">${fmtDateTime(e.eventDate)}</td>
        <td>${e.signups.length}${e.maxSlots ? `/${e.maxSlots}` : ''}</td>
        <td class="text-end">
          <button class="btn btn-fssf-outline btn-sm me-2 edit-btn" data-id="${e.id}">Edit</button>
          <button class="btn btn-fssf-outline btn-sm del-btn" data-id="${e.id}">Delete</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="5" class="fssf-mono opacity-75">No events yet.</td></tr>`;

    document.querySelectorAll('.edit-btn').forEach((btn) => btn.addEventListener('click', () => {
      const ev = res.events.find((e) => String(e.id) === btn.dataset.id);
      fillForm(ev);
    }));
    document.querySelectorAll('.del-btn').forEach((btn) => btn.addEventListener('click', async () => {
      if (!confirm('Delete this event?')) return;
      await api.del(`/events/${btn.dataset.id}`);
      await load();
    }));
  }

  function fillForm(ev) {
    editingId = ev.id;
    document.getElementById('form-title-label').textContent = 'Edit Event';
    document.getElementById('f-title').value = ev.title;
    document.getElementById('f-description').value = ev.description || '';
    document.getElementById('f-eventType').value = ev.eventType;
    document.getElementById('f-mapName').value = ev.mapName || '';
    document.getElementById('f-eventDate').value = ev.eventDate.slice(0, 16);
    document.getElementById('f-durationMinutes').value = ev.durationMinutes || 90;
    document.getElementById('f-maxSlots').value = ev.maxSlots || '';
    document.getElementById('cancel-edit').classList.remove('d-none');
  }

  function resetForm() {
    editingId = null;
    document.getElementById('form-title-label').textContent = 'New Event';
    document.getElementById('event-form').reset();
    document.getElementById('f-durationMinutes').value = 90;
    document.getElementById('cancel-edit').classList.add('d-none');
  }

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Command Post</div>
      <h1>Manage Events</h1>

      <form class="fssf-form fssf-card card p-4 my-4" id="event-form">
        <div class="text-danger fssf-mono small mb-2" id="event-error"></div>
        <h5 id="form-title-label">New Event</h5>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label">Title</label><input required class="form-control" id="f-title"></div>
          <div class="col-md-3"><label class="form-label">Type</label>
            <select class="form-select" id="f-eventType">
              ${['operation', 'training', 'selection', 'social', 'other'].map((t) => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3"><label class="form-label">Map</label><input class="form-control" id="f-mapName"></div>
          <div class="col-md-4"><label class="form-label">Date &amp; Time</label><input required type="datetime-local" class="form-control" id="f-eventDate"></div>
          <div class="col-md-4"><label class="form-label">Duration (min)</label><input type="number" class="form-control" id="f-durationMinutes" value="90"></div>
          <div class="col-md-4"><label class="form-label">Max Slots</label><input type="number" class="form-control" id="f-maxSlots"></div>
          <div class="col-12"><label class="form-label">Briefing / Description</label><textarea class="form-control" rows="3" id="f-description"></textarea></div>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-fssf btn-sm" id="submit-btn">Create Event</button>
          <button type="button" class="btn btn-fssf-outline btn-sm d-none" id="cancel-edit">Cancel</button>
        </div>
      </form>

      <div class="table-responsive">
        <table class="table fssf-table align-middle">
          <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Signups</th><th></th></tr></thead>
          <tbody id="admin-events-table"><tr><td colspan="5" class="fssf-mono opacity-75">Loading…</td></tr></tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('cancel-edit').addEventListener('click', resetForm);

  document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('event-error').textContent = '';
    const payload = {
      title: document.getElementById('f-title').value,
      description: document.getElementById('f-description').value,
      eventType: document.getElementById('f-eventType').value,
      mapName: document.getElementById('f-mapName').value,
      eventDate: document.getElementById('f-eventDate').value,
      durationMinutes: document.getElementById('f-durationMinutes').value,
      maxSlots: document.getElementById('f-maxSlots').value || null,
    };
    try {
      if (editingId) await api.put(`/events/${editingId}`, payload);
      else await api.post('/events', payload);
      resetForm();
      await load();
    } catch (err) {
      document.getElementById('event-error').textContent = err.message;
    }
  });

  await load();
}
