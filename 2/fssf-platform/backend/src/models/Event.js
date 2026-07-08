const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  eventType: {
    type: DataTypes.ENUM('operation', 'training', 'selection', 'social', 'other'),
    defaultValue: 'operation',
    field: 'event_type',
  },
  mapName: { type: DataTypes.STRING(150), field: 'map_name' },
  eventDate: { type: DataTypes.DATE, allowNull: false, field: 'event_date' },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 90, field: 'duration_minutes' },
  maxSlots: { type: DataTypes.INTEGER, field: 'max_slots' },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },
  bannerUrl: { type: DataTypes.TEXT, field: 'banner_url' },
}, {
  tableName: 'events',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Event;
