const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Promotion = sequelize.define('Promotion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  oldRankId: { type: DataTypes.INTEGER, field: 'old_rank_id' },
  newRankId: { type: DataTypes.INTEGER, allowNull: false, field: 'new_rank_id' },
  issuedBy: { type: DataTypes.INTEGER, field: 'issued_by' },
  reason: { type: DataTypes.TEXT },
}, {
  tableName: 'promotions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Promotion;
