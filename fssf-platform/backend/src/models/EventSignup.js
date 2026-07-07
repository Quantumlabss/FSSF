const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventSignup = sequelize.define('EventSignup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventId: { type: DataTypes.INTEGER, allowNull: false, field: 'event_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  status: {
    type: DataTypes.ENUM('confirmed', 'waitlist', 'declined'),
    defaultValue: 'confirmed',
  },
  roleSignup: { type: DataTypes.STRING(100), field: 'role_signup' },
}, {
  tableName: 'event_signups',
  underscored: true,
  timestamps: true,
  createdAt: 'signed_up_at',
  updatedAt: false,
});

module.exports = EventSignup;
