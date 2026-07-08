const express = require('express');
const router = express.Router();
const { User, Rank } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Public/live roster - active members ordered by rank tier desc, then name.
router.get('/', async (req, res) => {
  const users = await User.findAll({
    where: { active: true },
    attributes: ['id', 'username', 'callsign', 'position', 'unit', 'joinDate', 'role'],
    include: [{ model: Rank, as: 'rank' }],
    order: [[{ model: Rank, as: 'rank' }, 'tier', 'DESC'], ['username', 'ASC']],
  });
  res.json({ roster: users });
});

router.get('/ranks', async (req, res) => {
  const ranks = await Rank.findAll({ order: [['tier', 'ASC']] });
  res.json({ ranks });
});

// Admin/NCO: manage a member's position/unit/active status directly.
router.put('/:id', requireAuth, requireRole('nco'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Member not found' });

  const fields = ['callsign', 'position', 'unit', 'active'];
  fields.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });

  // Only officers+ can directly change someone's app role (recruit/member/nco/officer/admin)
  if (req.body.role !== undefined && ['officer', 'admin'].includes(req.user.role)) {
    user.role = req.body.role;
  }

  await user.save();
  res.json({ user });
});

router.delete('/:id', requireAuth, requireRole('officer'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Member not found' });
  user.active = false; // soft-delete, keep history for AARs/promotions
  await user.save();
  res.json({ success: true });
});

module.exports = router;
