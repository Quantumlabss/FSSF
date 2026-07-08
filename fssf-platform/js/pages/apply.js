const APP_STATUS_TAG = { pending: 'fssf-tag--warn', interview: 'fssf-tag--warn', accepted: 'fssf-tag--ok', rejected: 'fssf-tag--danger' };

async function PageApply(params, container) {
  if (!Auth.loaded) await Auth.refresh();
  const u = Auth.currentUser;

  let mine = [];
  if (u) {
    try { mine = (await api.get('/applications/mine')).applications; } catch (_) {}
  }

  container.innerHTML = `
    <div class="container py-5">
      <div class="fssf-section-label">Selection</div>
      <h1>Apply to FSSF</h1>
      <p style="opacity:0.85;max-width:42rem">
        We run a short selection process to make sure new operators fit the unit's
        standard. Fill out the form below — command staff typically respond within a
        few days on Discord.
      </p>

      ${mine.length ? `
        <div class="fssf-card card p-4 my-4">
          <h5>Your Applications</h5>
          <ul class="list-unstyled mb-0">
            ${mine.map((a) => `
              <li class="d-flex justify-content-between py-2" style="border-bottom:1px dashed rgba(207,197,154,0.15)">
                <span class="fssf-mono">${fmtDate(a.createdAt)}</span>
                <span class="fssf-tag ${APP_STATUS_TAG[a.status]}">${esc(a.status)}</span>
              </li>`).join('')}
          </ul>
        </div>` : ''}

      <div id="apply-form-area"></div>
    </div>`;

  const area = document.getElementById('apply-form-area');
  area.innerHTML = `
    <form class="fssf-form fssf-card card p-4" id="apply-form" style="max-width:38rem">
      <div class="text-danger fssf-mono small mb-3" id="apply-error"></div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Discord Username</label>
          <input required class="form-control" id="f-discordUsername" value="${esc(u?.username || '')}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Discord ID</label>
          <input required class="form-control" id="f-discordId" value="${esc(u?.discordId || '')}" placeholder="e.g. 123456789012345678">
        </div>
        <div class="col-md-4">
          <label class="form-label">Age</label>
          <input type="number" min="13" class="form-control" id="f-age">
        </div>
        <div class="col-md-4">
          <label class="form-label">Timezone</label>
          <input class="form-control" id="f-timezone" placeholder="e.g. EST">
        </div>
        <div class="col-md-4">
          <label class="form-label">Hours in Pavlov</label>
          <input type="number" min="0" class="form-control" id="f-hoursInPavlov">
        </div>
        <div class="col-12">
          <label class="form-label">Relevant Experience</label>
          <textarea class="form-control" rows="3" id="f-experience" placeholder="Other units, milsim/tactical games, real-world experience, etc."></textarea>
        </div>
        <div class="col-12">
          <label class="form-label">Why do you want to join FSSF?</label>
          <textarea required class="form-control" rows="4" id="f-whyJoin"></textarea>
        </div>
        <div class="col-12">
          <label class="form-label">How did you hear about us?</label>
          <input class="form-control" id="f-referral">
        </div>
      </div>
      <button class="btn btn-fssf mt-4" id="apply-submit">Submit Application</button>
    </form>`;

  document.getElementById('apply-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('apply-submit');
    btn.disabled = true; btn.textContent = 'Submitting…';
    document.getElementById('apply-error').textContent = '';

    const payload = {
      discordUsername: document.getElementById('f-discordUsername').value,
      discordId: document.getElementById('f-discordId').value,
      age: document.getElementById('f-age').value || null,
      timezone: document.getElementById('f-timezone').value,
      hoursInPavlov: document.getElementById('f-hoursInPavlov').value || null,
      experience: document.getElementById('f-experience').value,
      whyJoin: document.getElementById('f-whyJoin').value,
      referral: document.getElementById('f-referral').value,
    };

    try {
      await api.post('/applications', payload);
      area.innerHTML = `<div class="fssf-card card p-4"><h5>Application Received</h5><p class="mb-0">Command staff will review your application and reach out on Discord.</p></div>`;
    } catch (err) {
      document.getElementById('apply-error').textContent = err.message;
      btn.disabled = false; btn.textContent = 'Submit Application';
    }
  });
}
