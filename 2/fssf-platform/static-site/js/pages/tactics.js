const FSSF_DOCTRINE = [
  { title: 'Movement', body: 'Bounding overwatch as the default movement technique across open ground; buddy pairs never move simultaneously without cover.' },
  { title: 'Communication', body: 'Callouts follow clock-direction + distance + target. Comms discipline is enforced — command net stays clear for taskings.' },
  { title: 'Room Clearing', body: 'Standard two-and-four man stacks, corner-fed entries, and a designated point man on every breach.' },
  { title: 'Fire Support', body: 'Support gunners hold suppressive arcs on command; maneuver elements do not cross a live gun-target line.' },
];

async function PageTactics(params, container) {
  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Field Manual Extract</div>
      <h1>Tactics &amp; Doctrine</h1>
      <p style="opacity:0.85;max-width:42rem">
        New operators are trained against this baseline doctrine before their first
        operation. Squad leads may adapt to mission-specific needs, but every op starts
        from the same shared playbook.
      </p>
      <div class="row g-4 mt-3">
        ${FSSF_DOCTRINE.map((d) => `
          <div class="col-md-6">
            <div class="fssf-card card p-4 h-100">
              <h5>${esc(d.title)}</h5>
              <p class="mb-0" style="opacity:0.9">${esc(d.body)}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}
