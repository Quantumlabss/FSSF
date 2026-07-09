const express = require('express');
const router = express.Router();
const { Promotion, User, Rank } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Full promotion history (public roster page can show this too)
router.get('/', async (req, res) => {
  const promotions = await Promotion.findAll({
    order: [['created_at', 'DESC']],
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'callsign'] },
      { model: User, as: 'issuer', attributes: ['id', 'username', 'callsign'] },
      { model: Rank, as: 'oldRank' },
      { model: Rank, as: 'newRank' },
    ],
  });
  res.json({ promotions });
});

router.get('/user/:userId', async (req, res) => {
  const promotions = await Promotion.findAll({
    where: { userId: req.params.userId },
    order: [['created_at', 'DESC']],
    include: [{ model: Rank, as: 'oldRank' }, { model: Rank, as: 'newRank' }],
  });
  res.json({ promotions });
});

// Issue a promotion (NCO+). Updates the member's current rank and logs the change.
router.post('/', requireAuth, requireRole('nco'), async (req, res) => {
  const { userId, newRankId, reason } = req.body;
  if (!userId || !newRankId) return res.status(400).json({ error: 'userId and newRankId are required' });

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: 'Member not found' });

  const newRank = await Rank.findByPk(newRankId);
  if (!newRank) return res.status(404).json({ error: 'Rank not found' });

  const promotion = await Promotion.create({
    userId,
    oldRankId: user.rankId,
    newRankId,
    issuedBy: req.user.id,
    reason,
  });

  user.rankId = newRankId;
  await user.save();

  // NOTE: to also push this rank change to Discord, the bot process listens
  // for new promotion rows (or you can call bot/rankSync.js directly here
  // via a shared queue/webhook) and swaps the member's Discord role.

  res.status(201).json({ promotion });
});

module.exports = router;
