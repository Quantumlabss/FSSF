const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AAR = sequelize.define('AAR', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventId: { type: DataTypes.INTEGER, field: 'event_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  summary: { type: DataTypes.TEXT },
  bodyMarkdown: { type: DataTypes.TEXT, allowNull: false, field: 'body_markdown' },
  outcome: { type: DataTypes.STRING(50) },
  authoredBy: { type: DataTypes.INTEGER, field: 'authored_by' },
  published: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'aars',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AAR;
