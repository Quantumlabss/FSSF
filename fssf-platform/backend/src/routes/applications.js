const express = require('express');
const router = express.Router();
const { Application, User } = require('../models');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Public submission - no login required, but if the applicant is logged in
// via Discord we attach their user record.
router.post('/', optionalAuth, async (req, res) => {
  const { discordId, discordUsername, age, timezone, hoursInPavlov, experience, whyJoin, referral } = req.body;
  if (!discordId || !discordUsername || !whyJoin) {
    return res.status(400).json({ error: 'discordId, discordUsername and whyJoin are required' });
  }

  const application = await Application.create({
    userId: req.user?.id || null,
    discordId,
    discordUsername,
    age,
    timezone,
    hoursInPavlov,
    experience,
    whyJoin,
    referral,
  });

  res.status(201).json({ application });
});

// Applicant can check their own status
router.get('/mine', requireAuth, async (req, res) => {
  const applications = await Application.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']],
  });
  res.json({ applications });
});

// Staff review queue (NCO+)
router.get('/', requireAuth, requireRole('nco'), async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const applications = await Application.findAll({
    where,
    order: [['created_at', 'ASC']],
    include: [{ model: User, as: 'reviewer', attributes: ['id', 'username'] }],
  });
  res.json({ applications });
});

router.get('/:id', requireAuth, requireRole('nco'), async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json({ application });
});

// Move an application through the workflow: pending -> interview -> accepted/rejected
router.put('/:id/status', requireAuth, requireRole('nco'), async (req, res) => {
  const { status, reviewNotes } = req.body;
  const allowed = ['pending', 'interview', 'accepted', 'rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const application = await Application.findByPk(req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  application.status = status;
  application.reviewNotes = reviewNotes ?? application.reviewNotes;
  application.reviewedBy = req.user.id;
  await application.save();

  // If accepted and the applicant has a linked account, bump them to 'member'.
  if (status === 'accepted' && application.userId) {
    const user = await User.findByPk(application.userId);
    if (user && user.role === 'recruit') {
      user.role = 'member';
      await user.save();
      // The bot's role-sync loop (or a webhook here) should also assign the
      // "Member" Discord role at this point - see bot/roleSync.js
    }
  }

  res.json({ application });
});

module.exports = router;
