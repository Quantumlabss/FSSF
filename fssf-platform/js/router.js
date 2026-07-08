// Minimal hash router. Register routes like '/events/:id' -> async (params, container) => {...}
const Router = {
  routes: [],

  register(pattern, handler) {
    // Turn '/events/:id' into a regex with named capture groups.
    const paramNames = [];
    const regexStr = pattern
      .replace(/\/:([^/]+)/g, (_, name) => { paramNames.push(name); return '/([^/]+)'; })
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexStr}$`);
    this.routes.push({ regex, paramNames, handler });
  },

  async resolve() {
    const container = document.getElementById('app');
    const hash = location.hash.slice(1) || '/';
    const path = hash.split('?')[0];

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
        container.innerHTML = '<div class="container py-5 fssf-mono opacity-75">Loading…</div>';
        window.scrollTo(0, 0);
        try {
          await route.handler(params, container);
        } catch (err) {
          console.error(err);
          container.innerHTML = `<div class="container py-5"><div class="fssf-card card p-4"><h5>Something went wrong</h5><p class="mb-0">${err.message || ''}</p></div></div>`;
        }
        renderNavbar();
        return;
      }
    }
    container.innerHTML = '<div class="container py-5"><h1>404</h1><p>Page not found.</p></div>';
  },

  start() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },
};
