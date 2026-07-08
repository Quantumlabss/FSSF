const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rank = sequelize.define('Rank', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  abbreviation: { type: DataTypes.STRING(20) },
  tier: { type: DataTypes.INTEGER, allowNull: false },
  insigniaUrl: { type: DataTypes.TEXT, field: 'insignia_url' },
  discordRoleId: { type: DataTypes.STRING(32), field: 'discord_role_id' },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'ranks',
  underscored: true,
  timestamps: false,
});

module.exports = Rank;
