const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id' },
  discordId: { type: DataTypes.STRING(32), allowNull: false, field: 'discord_id' },
  discordUsername: { type: DataTypes.STRING(100), allowNull: false, field: 'discord_username' },
  age: { type: DataTypes.INTEGER },
  timezone: { type: DataTypes.STRING(50) },
  hoursInPavlov: { type: DataTypes.INTEGER, field: 'hours_in_pavlov' },
  experience: { type: DataTypes.TEXT },
  whyJoin: { type: DataTypes.TEXT, field: 'why_join' },
  referral: { type: DataTypes.STRING(150) },
  status: {
    type: DataTypes.ENUM('pending', 'interview', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  reviewedBy: { type: DataTypes.INTEGER, field: 'reviewed_by' },
  reviewNotes: { type: DataTypes.TEXT, field: 'review_notes' },
}, {
  tableName: 'applications',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Application;
