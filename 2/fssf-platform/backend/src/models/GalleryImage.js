const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GalleryImage = sequelize.define('GalleryImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imagePath: { type: DataTypes.TEXT, allowNull: false, field: 'image_path' },
  caption: { type: DataTypes.STRING(255) },
  eventId: { type: DataTypes.INTEGER, field: 'event_id' },
  uploadedBy: { type: DataTypes.INTEGER, field: 'uploaded_by' },
}, {
  tableName: 'gallery_images',
  underscored: true,
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false,
});

module.exports = GalleryImage;
