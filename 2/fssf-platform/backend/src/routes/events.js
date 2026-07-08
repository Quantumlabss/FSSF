const express = require('express');
const router = express.Router();
const { Event, EventSignup, User, Rank } = require('../models');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// List upcoming/all events (public)
router.get('/', optionalAuth, async (req, res) => {
  const events = await Event.findAll({
    order: [['eventDate', 'ASC']],
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username', 'callsign'] },
      {
        model: EventSignup,
        as: 'signups',
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'callsign', 'rankId'] }],
      },
    ],
  });
  res.json({ events });
});

router.get('/:id', async (req, res) => {
  const event = await Event.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username', 'callsign'] },
      {
        model: EventSignup,
        as: 'signups',
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'callsign', 'rankId'] }],
      },
    ],
  });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ event });
});

// Create (NCO+)
router.post('/', requireAuth, requireRole('nco'), async (req, res) => {
  const { title, description, eventType, mapName, eventDate, durationMinutes, maxSlots, bannerUrl } = req.body;
  if (!title || !eventDate) return res.status(400).json({ error: 'title and eventDate are required' });

  const event = await Event.create({
    title, description, eventType, mapName, eventDate, durationMinutes, maxSlots, bannerUrl,
    createdBy: req.user.id,
  });
  res.status(201).json({ event });
});

// Update (NCO+)
router.put('/:id', requireAuth, requireRole('nco'), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const fields = ['title', 'description', 'eventType', 'mapName', 'eventDate', 'durationMinutes', 'maxSlots', 'bannerUrl'];
  fields.forEach((f) => { if (req.body[f] !== undefined) event[f] = req.body[f]; });
  await event.save();
  res.json({ event });
});

// Delete (Officer+)
router.delete('/:id', requireAuth, requireRole('officer'), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  await event.destroy();
  res.json({ success: true });
});

// ---- Signups ----

router.post('/:id/signup', requireAuth, async (req, res) => {
  const event = await Event.findByPk(req.params.id, { include: [{ model: EventSignup, as: 'signups' }] });
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const confirmedCount = event.signups.filter((s) => s.status === 'confirmed').length;
  const status = event.maxSlots && confirmedCount >= event.maxSlots ? 'waitlist' : 'confirmed';

  const [signup, created] = await EventSignup.findOrCreate({
    where: { eventId: event.id, userId: req.user.id },
    defaults: { status, roleSignup: req.body.roleSignup },
  });

  if (!created) {
    signup.status = 'confirmed';
    signup.roleSignup = req.body.roleSignup || signup.roleSignup;
    await signup.save();
  }

  res.status(201).json({ signup });
});

router.delete('/:id/signup', requireAuth, async (req, res) => {
  const signup = await EventSignup.findOne({ where: { eventId: req.params.id, userId: req.user.id } });
  if (!signup) return res.status(404).json({ error: 'Signup not found' });
  await signup.destroy();
  res.json({ success: true });
});

module.exports = router;
