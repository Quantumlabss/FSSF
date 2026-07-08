const DOCTRINE = [
  { title: 'Movement', body: 'Bounding overwatch as the default movement technique across open ground; buddy pairs never move simultaneously without cover.' },
  { title: 'Communication', body: 'Callouts follow clock-direction + distance + target. Comms discipline is enforced — command net stays clear for taskings.' },
  { title: 'Room Clearing', body: 'Standard two-and-four man stacks, corner-fed entries, and a designated point man on every breach.' },
  { title: 'Fire Support', body: 'Support gunners hold suppressive arcs on command; maneuver elements do not cross a live gun-target line.' },
];

export default function Tactics() {
  return (
    <div className="container py-5">
      <div className="fssf-section-label">Field Manual Extract</div>
      <h1>Tactics &amp; Doctrine</h1>
      <p style={{ opacity: 0.85, maxWidth: '42rem' }}>
        New operators are trained against this baseline doctrine before their first
        operation. Squad leads may adapt to mission-specific needs, but every op starts
        from the same shared playbook.
      </p>
      <div className="row g-4 mt-3">
        {DOCTRINE.map((d) => (
          <div className="col-md-6" key={d.title}>
            <div className="fssf-card card p-4 h-100">
              <h5>{d.title}</h5>
              <p className="mb-0" style={{ opacity: 0.9 }}>{d.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
