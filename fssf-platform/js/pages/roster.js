let _rosterInterval = null;

async function PageRoster(params, container) {
  if (_rosterInterval) clearInterval(_rosterInterval);

  async function load() {
    const res = await api.get('/roster');
    const roster = res.roster;
    container.innerHTML = `
      <div class="container py-5">
        <div class="d-flex justify-content-between align-items-end">
          <div>
            <div class="fssf-section-label">Live Roster</div>
            <h1 class="mb-0">Force Roster</h1>
          </div>
          <span class="fssf-tag fssf-tag--ok">${roster.length} ACTIVE</span>
        </div>
        <p class="fssf-mono opacity-75 mt-2">Synced from Discord roles · auto-refreshes every 30s</p>
        <div class="table-responsive mt-3">
          <table class="table fssf-table align-middle">
            <thead><tr><th>Rank</th><th>Callsign</th><th>Position</th><th>Unit</th><th>Joined</th></tr></thead>
            <tbody>
              ${roster.map((m) => `
                <tr>
                  <td>${rankBadgeHtml(m.rank)}</td>
                  <td>${esc(m.callsign || m.username)}</td>
                  <td style="opacity:0.85">${esc(m.position || '—')}</td>
                  <td style="opacity:0.85">${esc(m.unit)}</td>
                  <td class="fssf-mono" style="opacity:0.7">${m.joinDate ? fmtDate(m.joinDate) : '—'}</td>
                </tr>`).join('') || `<tr><td colspan="5" class="fssf-mono opacity-75">Roster is empty.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  await load();
  _rosterInterval = setInterval(load, 30000);
}
