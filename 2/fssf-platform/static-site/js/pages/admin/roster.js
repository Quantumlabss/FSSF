async function PageAdminRoster(params, container) {
  if (!(await guard(container, 'nco'))) return;
  const canEditPermission = Auth.hasRole('officer');

  async function load() {
    const res = await api.get('/roster');
    document.getElementById('admin-roster-table').innerHTML = res.roster.map((m) => `
      <tr>
        <td><input class="form-control form-control-sm fssf-form callsign-input" data-id="${m.id}" value="${esc(m.callsign || '')}" placeholder="${esc(m.username)}"></td>
        <td class="fssf-mono">${esc(m.rank?.abbreviation || 'RCT')}</td>
        <td><input class="form-control form-control-sm fssf-form position-input" data-id="${m.id}" value="${esc(m.position || '')}"></td>
        ${canEditPermission ? `<td>
          <select class="form-select form-select-sm fssf-form role-select" data-id="${m.id}">
            ${['recruit', 'member', 'nco', 'officer', 'admin'].map((r) => `<option value="${r}" ${m.role === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </td>` : ''}
        <td class="text-end">
          <button class="btn btn-fssf-outline btn-sm me-2 save-btn" data-id="${m.id}">Save</button>
          <button class="btn btn-fssf-outline btn-sm remove-btn" data-id="${m.id}">Remove</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="5" class="fssf-mono opacity-75">Roster is empty.</td></tr>`;

    document.querySelectorAll('.save-btn').forEach((btn) => btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const patch = {
        callsign: document.querySelector(`.callsign-input[data-id="${id}"]`).value,
        position: document.querySelector(`.position-input[data-id="${id}"]`).value,
      };
      const roleSel = document.querySelector(`.role-select[data-id="${id}"]`);
      if (roleSel) patch.role = roleSel.value;
      await api.put(`/roster/${id}`, patch);
      await load();
    }));

    document.querySelectorAll('.remove-btn').forEach((btn) => btn.addEventListener('click', async () => {
      if (!confirm('Remove this member from the active roster?')) return;
      await api.del(`/roster/${btn.dataset.id}`);
      await load();
    }));
  }

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Command Post</div>
      <h1>Manage Roster</h1>
      <p class="fssf-mono opacity-75">Rank &amp; permission level sync automatically from Discord roles. Position/callsign can be edited here.</p>
      <div class="table-responsive mt-3">
        <table class="table fssf-table align-middle">
          <thead><tr><th>Callsign</th><th>Rank</th><th>Position</th>${canEditPermission ? '<th>Permission</th>' : ''}<th></th></tr></thead>
          <tbody id="admin-roster-table"><tr><td colspan="5" class="fssf-mono opacity-75">Loading…</td></tr></tbody>
        </table>
      </div>
    </div>`;

  await load();
}
