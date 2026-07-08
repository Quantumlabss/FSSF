const express = require('express');
const router = express.Router();
const { AAR, User, Event } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Public: published AARs only
router.get('/', async (req, res) => {
  const where = req.query.all === 'true' ? {} : { published: true };
  const aars = await AAR.findAll({
    where,
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'callsign'] },
      { model: Event, as: 'event', attributes: ['id', 'title', 'eventDate'] },
    ],
  });
  res.json({ aars });
});

router.get('/:id', async (req, res) => {
  const aar = await AAR.findByPk(req.params.id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'callsign'] },
      { model: Event, as: 'event', attributes: ['id', 'title', 'eventDate'] },
    ],
  });
  if (!aar) return res.status(404).json({ error: 'AAR not found' });
  res.json({ aar });
});

// NCO+ can draft/edit AARs
router.post('/', requireAuth, requireRole('nco'), async (req, res) => {
  const { eventId, title, summary, bodyMarkdown, outcome, published } = req.body;
  if (!title || !bodyMarkdown) return res.status(400).json({ error: 'title and bodyMarkdown are required' });

  const aar = await AAR.create({
    eventId, title, summary, bodyMarkdown, outcome,
    published: !!published,
    authoredBy: req.user.id,
  });
  res.status(201).json({ aar });
});

router.put('/:id', requireAuth, requireRole('nco'), async (req, res) => {
  const aar = await AAR.findByPk(req.params.id);
  if (!aar) return res.status(404).json({ error: 'AAR not found' });

  const fields = ['eventId', 'title', 'summary', 'bodyMarkdown', 'outcome', 'published'];
  fields.forEach((f) => { if (req.body[f] !== undefined) aar[f] = req.body[f]; });
  await aar.save();
  res.json({ aar });
});

router.delete('/:id', requireAuth, requireRole('officer'), async (req, res) => {
  const aar = await AAR.findByPk(req.params.id);
  if (!aar) return res.status(404).json({ error: 'AAR not found' });
  await aar.destroy();
  res.json({ success: true });
});

module.exports = router;
