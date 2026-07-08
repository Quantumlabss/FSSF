async function PageHome(params, container) {
  container.innerHTML = `
    <section class="fssf-hero">
      <div class="container position-relative">
        <div class="eyebrow">Pavlov VR // Milsim Unit // Est. 2024</div>
        <h1>First Special<br>Service Force</h1>
        <p class="lead">
          A joint Canadian-American strike force built for coordinated small-unit tactics
          in Pavlov VR. We run structured operations, hold members to a standard, and
          train the way we fight — together.
        </p>
        <div class="d-flex gap-3 flex-wrap">
          <a href="#/apply" class="btn btn-fssf">Apply For Selection</a>
          <a href="#/events" class="btn btn-fssf-outline">View Operations Calendar</a>
        </div>
      </div>
    </section>

    <section class="container py-5">
      <div class="d-flex justify-content-between align-items-end mb-3">
        <div>
          <div class="fssf-section-label">Sitrep</div>
          <h2 class="mb-0">Upcoming Operations</h2>
        </div>
        <a href="#/events" class="btn btn-fssf-outline btn-sm">Full Calendar</a>
      </div>
      <div class="row g-4" id="home-events"><p class="fssf-mono opacity-75">Loading…</p></div>
    </section>

    <section class="container pb-5">
      <div class="fssf-divider"></div>
      <div class="row g-4 align-items-center">
        <div class="col-lg-5">
          <div class="fssf-section-label">Force Strength</div>
          <h2 id="home-roster-count">— Active Operators</h2>
          <p style="opacity:0.85">
            Every rank on the roster below is synced live from our Discord server,
            so what you see here is exactly who is on deck for the next op.
          </p>
          <a href="#/roster" class="btn btn-fssf-outline btn-sm">View Full Roster</a>
        </div>
        <div class="col-lg-7">
          <div class="fssf-card card p-3">
            <div class="d-flex flex-wrap gap-2" id="home-roster-badges">
              <span class="fssf-mono opacity-75">Roster syncing…</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  api.get('/events').then((res) => {
    const events = res.events.slice(0, 3);
    document.getElementById('home-events').innerHTML = events.length
      ? events.map((e) => `<div class="col-md-4">${eventCardHtml(e)}</div>`).join('')
      : '<p class="fssf-mono opacity-75">No operations currently scheduled.</p>';
  }).catch(() => {});

  api.get('/roster').then((res) => {
    document.getElementById('home-roster-count').textContent = `${res.roster.length} Active Operators`;
    document.getElementById('home-roster-badges').innerHTML = res.roster.slice(0, 14)
      .map((m) => `<span class="fssf-rank-badge">${esc(m.rank?.abbreviation || 'RCT')} · ${esc(m.callsign || m.username)}</span>`)
      .join('') || '<span class="fssf-mono opacity-75">Roster is empty.</span>';
  }).catch(() => {});
}
