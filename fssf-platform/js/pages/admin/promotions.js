async function PageAdminPromotions(params, container) {
  if (!(await guard(container, 'nco'))) return;

  const [rosterRes, ranksRes] = await Promise.all([api.get('/roster'), api.get('/roster/ranks')]);

  async function loadPromotions() {
    const res = await api.get('/promotions');
    document.getElementById('promotions-table').innerHTML = res.promotions.map((p) => `
      <tr>
        <td>${esc(p.user?.callsign || p.user?.username || '')}</td>
        <td class="fssf-mono">${esc(p.oldRank?.abbreviation || '—')} → ${esc(p.newRank?.abbreviation || '')}</td>
        <td style="opacity:0.85">${esc(p.reason || '—')}</td>
        <td>${esc(p.issuer?.callsign || p.issuer?.username || '—')}</td>
        <td class="fssf-mono">${fmtDate(p.createdAt)}</td>
      </tr>`).join('') || `<tr><td colspan="5" class="fssf-mono opacity-75">No promotions recorded yet.</td></tr>`;
  }

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Command Post</div>
      <h1>Promotions</h1>

      <form class="fssf-form fssf-card card p-4 my-4" id="promo-form" style="max-width:32rem">
        <div class="text-danger fssf-mono small mb-2" id="promo-error"></div>
        <h5>Issue Promotion</h5>
        <div class="mb-3">
          <label class="form-label">Member</label>
          <select required class="form-select" id="f-userId">
            <option value="">Select member…</option>
            ${rosterRes.roster.map((m) => `<option value="${m.id}">${esc(m.callsign || m.username)} (${esc(m.rank?.abbreviation || 'RCT')})</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">New Rank</label>
          <select required class="form-select" id="f-newRankId">
            <option value="">Select rank…</option>
            ${ranksRes.ranks.map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Reason</label>
          <textarea class="form-control" rows="2" id="f-reason"></textarea>
        </div>
        <button class="btn btn-fssf btn-sm">Issue Promotion</button>
        <p class="fssf-mono mt-2" style="font-size:0.7rem;opacity:0.6">
          Note: this updates the member's rank in-app. The Discord bot's role-sync cycle
          reconciles their Discord role automatically on its next pass.
        </p>
      </form>

      <div class="table-responsive">
        <table class="table fssf-table align-middle">
          <thead><tr><th>Member</th><th>Change</th><th>Reason</th><th>Issued By</th><th>Date</th></tr></thead>
          <tbody id="promotions-table"><tr><td colspan="5" class="fssf-mono opacity-75">Loading…</td></tr></tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('promo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('promo-error').textContent = '';
    const payload = {
      userId: document.getElementById('f-userId').value,
      newRankId: document.getElementById('f-newRankId').value,
      reason: document.getElementById('f-reason').value,
    };
    try {
      await api.post('/promotions', payload);
      document.getElementById('promo-form').reset();
      await loadPromotions();
    } catch (err) {
      document.getElementById('promo-error').textContent = err.message;
    }
  });

  await loadPromotions();
}
