async function PageAbout(params, container) {
  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Unit History</div>
      <h1>About FSSF</h1>
      <div class="row g-4 mt-2">
        <div class="col-lg-7">
          <p style="opacity:0.9">
            The First Special Service Force is a Pavlov VR milsim community built around
            structured operations, small-unit tactics, and a culture that takes both the
            game and its people seriously. We run weekly operations, dedicated training
            nights, and a proper selection process for anyone who wants to hold a slot on
            the roster.
          </p>
          <p style="opacity:0.9">
            Command staff plan every operation with a briefing, a mission map, and defined
            roles — no pickup-game chaos. After-action reports are written after every op
            so the unit actually learns and improves week over week.
          </p>
        </div>
        <div class="col-lg-5">
          <div class="fssf-card card p-4">
            <h5>What We Run</h5>
            <ul class="mb-0" style="opacity:0.9">
              <li>Weekly operations with structured OPORDs</li>
              <li>Dedicated new-operator training</li>
              <li>Selection-based recruitment</li>
              <li>Rank &amp; promotion structure synced to Discord</li>
              <li>Full after-action reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>`;
}
