async function PageAdminDashboard(params, container) {
  if (!(await guard(container, 'nco'))) return;
  const stats = await api.get('/admin/summary');

  const cards = [
    { label: 'Active Members', value: stats.memberCount, to: '#/admin/roster' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, to: '#/admin/events' },
    { label: 'Pending Applications', value: stats.pendingApplications, to: '#/admin/applications' },
    { label: 'Draft AARs', value: stats.draftAars, to: '#/aars' },
    { label: 'Gallery Photos', value: stats.galleryCount, to: '#/gallery' },
  ];

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Command Post</div>
      <h1>Command Dashboard</h1>
      <div class="row g-3 mt-2">
        ${cards.map((c) => `
          <div class="col-md-4 col-lg-3">
            <a href="${c.to}" class="text-decoration-none">
              <div class="fssf-card card p-4 h-100">
                <div class="fssf-mono" style="font-size:2rem">${c.value ?? '—'}</div>
                <div style="opacity:0.8">${c.label}</div>
              </div>
            </a>
          </div>`).join('')}
      </div>
      <div class="fssf-divider"></div>
      <div class="d-flex flex-wrap gap-3">
        <a href="#/admin/events" class="btn btn-fssf-outline">Manage Events</a>
        <a href="#/admin/applications" class="btn btn-fssf-outline">Review Applications</a>
        <a href="#/admin/roster" class="btn btn-fssf-outline">Manage Roster</a>
        <a href="#/admin/promotions" class="btn btn-fssf-outline">Issue Promotion</a>
        <a href="#/aars/new" class="btn btn-fssf-outline">Write AAR</a>
      </div>
    </div>`;
}
