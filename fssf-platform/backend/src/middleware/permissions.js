// Simple role hierarchy used across the API.
// recruit < member < nco < officer < admin
const ROLE_RANKS = { recruit: 0, member: 1, nco: 2, officer: 3, admin: 4 };

// requireRole('nco') allows nco, officer, admin (anything >= the given role).
function requireRole(minRole) {
  const minLevel = ROLE_RANKS[minRole] ?? 99;
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const level = ROLE_RANKS[req.user.role] ?? -1;
    if (level < minLevel) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// requireAnyRole(['officer','admin']) - exact set match, for narrower gates.
function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireRole, requireAnyRole, ROLE_RANKS };
