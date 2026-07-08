async function PageRanks(params, container) {
  const [ranksRes, promoRes] = await Promise.all([
    api.get('/roster/ranks'),
    api.get('/promotions'),
  ]);
  const ranks = [...ranksRes.ranks].reverse();
  const promotions = promoRes.promotions.slice(0, 20);

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Chain of Command</div>
      <h1>Ranks &amp; Promotions</h1>
      <div class="row g-4 mt-2">
        <div class="col-lg-6">
          <div class="fssf-card card p-4">
            <h5>Rank Structure</h5>
            <ol class="list-unstyled mb-0">
              ${ranks.map((r) => `
                <li class="d-flex justify-content-between py-2" style="border-bottom:1px dashed rgba(207,197,154,0.15)">
                  <span>${esc(r.name)}</span><span class="fssf-mono opacity-75">${esc(r.abbreviation || '')}</span>
                </li>`).join('')}
            </ol>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="fssf-card card p-4">
            <h5>Recent Promotions</h5>
            <ul class="list-unstyled mb-0">
              ${promotions.map((p) => `
                <li class="py-2" style="border-bottom:1px dashed rgba(207,197,154,0.15)">
                  <strong>${esc(p.user?.callsign || p.user?.username || '')}</strong>
                  <span class="fssf-mono opacity-75">${esc(p.oldRank?.abbreviation || '—')} → ${esc(p.newRank?.abbreviation || '')}</span>
                  <div class="fssf-mono" style="font-size:0.7rem;opacity:0.6">${fmtDate(p.createdAt)}</div>
                </li>`).join('') || '<li class="opacity-75">No promotions recorded yet.</li>'}
            </ul>
          </div>
        </div>
      </div>
    </div>`;
}
