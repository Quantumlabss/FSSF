async function PageEvents(params, container) {
  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Operations Calendar</div>
      <h1>Events</h1>
      <div class="row g-4 mt-2" id="events-list">
        <p class="fssf-mono opacity-75">Loading operations calendar…</p>
      </div>
    </div>`;

  try {
    const res = await api.get('/events');
    const el = document.getElementById('events-list');
    el.innerHTML = res.events.length
      ? res.events.map((e) => `<div class="col-md-4">${eventCardHtml(e)}</div>`).join('')
      : '<p class="fssf-mono opacity-75">No operations currently scheduled.</p>';
  } catch (err) {
    document.getElementById('events-list').innerHTML = `<p class="text-danger fssf-mono">${esc(err.message)}</p>`;
  }
}
