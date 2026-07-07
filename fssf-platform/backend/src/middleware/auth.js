const { verifyToken } = require('../utils/jwt');
const { User, Rank } = require('../models');

// Reads the JWT from the fssf_token cookie (or Authorization header as fallback),
// verifies it, and attaches the current user to req.user.
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.fssf_token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id, { include: [{ model: Rank, as: 'rank' }] });
    if (!user || !user.active) return res.status(401).json({ error: 'Account not active' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// Optional auth: attaches req.user if a valid token is present, but doesn't block the request.
async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.fssf_token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id, { include: [{ model: Rank, as: 'rank' }] });
    if (user && user.active) req.user = user;
  } catch (_) { /* ignore invalid token for optional auth */ }
  next();
}

module.exports = { requireAuth, optionalAuth };
