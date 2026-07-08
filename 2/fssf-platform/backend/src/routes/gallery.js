const express = require('express');
const router = express.Router();
const { GalleryImage, User, Event } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  const images = await GalleryImage.findAll({
    order: [['uploadedAt', 'DESC']],
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'username', 'callsign'] },
      { model: Event, as: 'event', attributes: ['id', 'title'] },
    ],
  });
  res.json({ images });
});

// Member+ can upload
router.post('/', requireAuth, requireRole('member'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });

  const image = await GalleryImage.create({
    imagePath: `/uploads/gallery/${req.file.filename}`,
    caption: req.body.caption,
    eventId: req.body.eventId || null,
    uploadedBy: req.user.id,
  });

  res.status(201).json({ image });
});

router.delete('/:id', requireAuth, requireRole('nco'), async (req, res) => {
  const image = await GalleryImage.findByPk(req.params.id);
  if (!image) return res.status(404).json({ error: 'Image not found' });
  await image.destroy();
  res.json({ success: true });
});

module.exports = router;
