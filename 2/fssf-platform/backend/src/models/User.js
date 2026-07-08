const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  discordId: { type: DataTypes.STRING(32), unique: true, allowNull: false, field: 'discord_id' },
  username: { type: DataTypes.STRING(100), allowNull: false },
  discriminator: { type: DataTypes.STRING(8) },
  avatarUrl: { type: DataTypes.TEXT, field: 'avatar_url' },
  email: { type: DataTypes.STRING(255) },
  callsign: { type: DataTypes.STRING(100) },
  role: {
    type: DataTypes.ENUM('recruit', 'member', 'nco', 'officer', 'admin'),
    allowNull: false,
    defaultValue: 'recruit',
  },
  rankId: { type: DataTypes.INTEGER, field: 'rank_id' },
  position: { type: DataTypes.STRING(100) },
  unit: { type: DataTypes.STRING(100), defaultValue: 'FSSF' },
  joinDate: { type: DataTypes.DATEONLY, field: 'join_date', defaultValue: DataTypes.NOW },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE, field: 'last_login' },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
