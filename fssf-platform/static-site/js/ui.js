// ---------- Escaping / formatting helpers ----------
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function fmtDate(d, opts) {
  return new Date(d).toLocaleDateString(undefined, opts || { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(d) {
  return new Date(d).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
}

// ---------- Navbar ----------
const NAV_LINKS = [
  { to: '#/', label: 'Home' },
  { to: '#/about', label: 'About' },
  { to: '#/tactics', label: 'Tactics' },
  { to: '#/events', label: 'Events' },
  { to: '#/roster', label: 'Roster' },
  { to: '#/gallery', label: 'Gallery' },
  { to: '#/aars', label: 'AARs' },
  { to: '#/apply', label: 'Apply' },
];

function renderNavbar() {
  const el = document.getElementById('navbar');
  const currentPath = location.hash.slice(1) || '/';
  const links = NAV_LINKS.map((l) => {
    const active = l.to === `#${currentPath}` ? 'active' : '';
    return `<a class="nav-link ${active}" href="${l.to}">${l.label}</a>`;
  }).join('');

  const commandLink = Auth.hasRole('nco')
    ? `<a class="nav-link" href="#/admin">Command</a>` : '';

  let authArea;
  if (!Auth.loaded) {
    authArea = '';
  } else if (Auth.currentUser) {
    const u = Auth.currentUser;
    authArea = `
      <div class="dropdown">
        <button class="btn btn-fssf-outline btn-sm dropdown-toggle fssf-mono" data-bs-toggle="dropdown">
          <img src="${esc(u.avatarUrl)}" width="20" height="20" style="border-radius:50%;margin-right:6px;" alt="">
          ${esc(u.callsign || u.username)}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#/apply">My Applications</a></li>
          ${Auth.hasRole('nco') ? '<li><a class="dropdown-item" href="#/admin">Command Dashboard</a></li>' : ''}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logout-link">Log out</a></li>
        </ul>
      </div>`;
  } else {
    authArea = `<button class="btn btn-fssf btn-sm" id="login-btn">Login with Discord</button>`;
  }

  el.innerHTML = `
    <nav class="navbar navbar-expand-lg fssf-navbar" data-bs-theme="dark">
      <div class="container">
        <a class="navbar-brand" href="#/">FSSF</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#fssf-nav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="fssf-nav">
          <div class="navbar-nav me-auto">${links}${commandLink}</div>
          <div class="d-flex">${authArea}</div>
        </div>
      </div>
    </nav>`;

  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) loginBtn.addEventListener('click', () => Auth.login());
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
}

function renderFooter() {
  document.getElementById('footer').innerHTML = `
    <footer class="fssf-footer py-4 mt-5">
      <div class="container d-flex flex-wrap justify-content-between gap-2">
        <span>FSSF // FIRST SPECIAL SERVICE FORCE // PAVLOV VR MILSIM UNIT</span>
        <span>EST. 2024 — GRID REF UNKNOWN — ${new Date().getFullYear()}</span>
      </div>
    </footer>`;
}

// ---------- Shared card renderers ----------
const TYPE_TAG_CLASS = {
  operation: 'fssf-tag--danger', training: 'fssf-tag--ok', selection: 'fssf-tag--warn',
  social: 'fssf-tag--ok', other: 'fssf-tag--warn',
};

function eventCardHtml(event) {
  const date = new Date(event.eventDate);
  const confirmed = (event.signups || []).filter((s) => s.status === 'confirmed').length;
  return `
    <div class="fssf-card card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${esc(event.eventType)}</span>
        <span class="fssf-tag ${TYPE_TAG_CLASS[event.eventType] || 'fssf-tag--ok'}">
          ${event.maxSlots ? `${confirmed}/${event.maxSlots} SLOTS` : `${confirmed} SIGNED UP`}
        </span>
      </div>
      <div class="card-body">
        <h5 class="mb-1">${esc(event.title)}</h5>
        <p class="fssf-mono mb-2" style="font-size:0.8rem;opacity:0.85">
          ${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} —
          ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          ${event.mapName ? ` · ${esc(event.mapName)}` : ''}
        </p>
        <p class="mb-3" style="opacity:0.9">
          ${esc((event.description || 'No briefing provided yet.').slice(0, 130))}${event.description?.length > 130 ? '…' : ''}
        </p>
        <a href="#/events/${event.id}" class="btn btn-fssf-outline btn-sm">View Briefing</a>
      </div>
    </div>`;
}

function rankBadgeHtml(rank) {
  return `<span class="fssf-rank-badge">${esc(rank ? (rank.abbreviation || rank.name) : 'UNRANKED')}</span>`;
}

// ---------- Route guard ----------
// Call at the top of a protected page handler:
//   if (!(await guard(container, 'nco'))) return;
async function guard(container, minRole) {
  if (!Auth.loaded) await Auth.refresh();
  if (!Auth.currentUser) {
    container.innerHTML = `<div class="container py-5"><div class="fssf-card card p-4"><h5>Login Required</h5><p class="mb-0">Log in with Discord to view this page.</p></div></div>`;
    return false;
  }
  if (!Auth.hasRole(minRole)) {
    container.innerHTML = `<div class="container py-5"><div class="fssf-card card p-4"><h5>Access Denied</h5><p class="mb-0">Your clearance level does not permit access to this page.</p></div></div>`;
    return false;
  }
  return true;
}
