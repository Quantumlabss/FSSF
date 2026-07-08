async function PageEventDetail(params, container) {
  const { id } = params;

  async function load() {
    const res = await api.get(`/events/${id}`);
    render(res.event);
  }

  function render(event) {
    const date = new Date(event.eventDate);
    const confirmed = event.signups.filter((s) => s.status === 'confirmed');
    const waitlist = event.signups.filter((s) => s.status === 'waitlist');
    const mySignup = Auth.currentUser ? event.signups.find((s) => s.user.id === Auth.currentUser.id) : null;

    let signupBox;
    if (!Auth.currentUser) {
      signupBox = `<div class="fssf-card card p-4"><p class="mb-0">Log in with Discord to sign up for this operation.</p></div>`;
    } else if (mySignup) {
      signupBox = `
        <div class="fssf-card card p-4">
          <h5>Signup</h5>
          <p class="mb-3">You're signed up as <strong>${mySignup.status === 'waitlist' ? 'WAITLISTED' : 'CONFIRMED'}</strong>${mySignup.roleSignup ? ` — ${esc(mySignup.roleSignup)}` : ''}.</p>
          <button class="btn btn-fssf-outline btn-sm" id="withdraw-btn">Withdraw</button>
        </div>`;
    } else {
      signupBox = `
        <div class="fssf-card card p-4">
          <h5>Signup</h5>
          <div id="signup-error" class="text-danger fssf-mono small mb-2"></div>
          <div class="fssf-form">
            <div class="mb-3">
              <label class="form-label">Preferred Role (optional)</label>
              <input class="form-control" id="role-signup-input" placeholder="e.g. Rifleman, SAW gunner, Medic">
            </div>
            <button class="btn btn-fssf btn-sm" id="signup-btn">Confirm Signup</button>
          </div>
        </div>`;
    }

    container.innerHTML = `
      <div class="container py-5">
        <div class="fssf-section-label">${esc(event.eventType)}</div>
        <h1>${esc(event.title)}</h1>
        <p class="fssf-mono opacity-75">
          ${fmtDateTime(date)}${event.mapName ? ` · Map: ${esc(event.mapName)}` : ''}${event.durationMinutes ? ` · ~${event.durationMinutes} min` : ''}
        </p>
        <div class="row g-4 mt-2">
          <div class="col-lg-7">
            <div class="fssf-card card p-4 mb-4">
              <h5>Briefing</h5>
              <p class="mb-0" style="white-space:pre-wrap;opacity:0.9">${esc(event.description || 'Full briefing to be issued closer to step-off.')}</p>
            </div>
            ${signupBox}
          </div>
          <div class="col-lg-5">
            <div class="fssf-card card p-4">
              <h5>Roster (${confirmed.length}${event.maxSlots ? `/${event.maxSlots}` : ''})</h5>
              <ul class="list-unstyled mb-0">
                ${confirmed.map((s) => `
                  <li class="fssf-mono d-flex justify-content-between py-1" style="border-bottom:1px dashed rgba(207,197,154,0.15)">
                    <span>${esc(s.user.callsign || s.user.username)}</span>
                    <span style="opacity:0.7">${esc(s.roleSignup || '—')}</span>
                  </li>`).join('') || '<li class="opacity-75">No confirmed signups yet.</li>'}
              </ul>
              ${waitlist.length ? `
                <h6 class="mt-3">Waitlist</h6>
                <ul class="list-unstyled mb-0">
                  ${waitlist.map((s) => `<li class="fssf-mono py-1">${esc(s.user.callsign || s.user.username)}</li>`).join('')}
                </ul>` : ''}
            </div>
          </div>
        </div>
      </div>`;

    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) signupBtn.addEventListener('click', async () => {
      const roleSignup = document.getElementById('role-signup-input').value;
      signupBtn.disabled = true;
      try {
        await api.post(`/events/${id}/signup`, { roleSignup });
        await load();
      } catch (err) {
        document.getElementById('signup-error').textContent = err.message;
        signupBtn.disabled = false;
      }
    });

    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) withdrawBtn.addEventListener('click', async () => {
      withdrawBtn.disabled = true;
      await api.del(`/events/${id}/signup`);
      await load();
    });
  }

  if (!Auth.loaded) await Auth.refresh();
  await load();
}
