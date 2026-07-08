// Simple global auth store. currentUser is null until /auth/me resolves.
const ROLE_LEVELS = { recruit: 0, member: 1, nco: 2, officer: 3, admin: 4 };

const Auth = {
  currentUser: null,
  loaded: false,
  listeners: [],

  onChange(fn) { this.listeners.push(fn); },
  _notify() { this.listeners.forEach((fn) => fn(this.currentUser)); },

  async refresh() {
    try {
      const data = await api.get('/auth/me');
      this.currentUser = data.user;
    } catch (_) {
      this.currentUser = null;
    }
    this.loaded = true;
    this._notify();
    return this.currentUser;
  },

  hasRole(minRole) {
    if (!this.currentUser) return false;
    return (ROLE_LEVELS[this.currentUser.role] ?? 0) >= (ROLE_LEVELS[minRole] ?? 99);
  },

  login() {
    window.location.href = `${window.FSSF_CONFIG.API_BASE}/auth/discord`;
  },

  async logout() {
    await api.post('/auth/logout');
    this.currentUser = null;
    this._notify();
    location.hash = '#/';
  },
};
