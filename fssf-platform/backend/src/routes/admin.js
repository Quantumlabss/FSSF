const express = require('express');
const router = express.Router();
const { User, Event, Application, AAR, GalleryImage } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Aggregate stats for the admin dashboard.
router.get('/summary', requireAuth, requireRole('nco'), async (req, res) => {
  const [memberCount, upcomingEvents, pendingApplications, draftAars, galleryCount] = await Promise.all([
    User.count({ where: { active: true } }),
    Event.count({ where: { eventDate: { [require('sequelize').Op.gte]: new Date() } } }),
    Application.count({ where: { status: 'pending' } }),
    AAR.count({ where: { published: false } }),
    GalleryImage.count(),
  ]);

  res.json({
    memberCount,
    upcomingEvents,
    pendingApplications,
    draftAars,
    galleryCount,
  });
});

// List all accounts with roles (admin only)
router.get('/users', requireAuth, requireRole('officer'), async (req, res) => {
  const users = await User.findAll({ order: [['username', 'ASC']] });
  res.json({ users });
});

module.exports = router;
