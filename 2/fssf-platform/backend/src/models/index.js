const sequelize = require('../config/db');
const User = require('./User');
const Rank = require('./Rank');
const Promotion = require('./Promotion');
const Event = require('./Event');
const EventSignup = require('./EventSignup');
const Application = require('./Application');
const GalleryImage = require('./GalleryImage');
const AAR = require('./AAR');

// ---- Associations ----

// User <-> Rank
Rank.hasMany(User, { foreignKey: 'rankId', as: 'members' });
User.belongsTo(Rank, { foreignKey: 'rankId', as: 'rank' });

// Promotions
User.hasMany(Promotion, { foreignKey: 'userId', as: 'promotions' });
Promotion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Promotion.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuer' });
Promotion.belongsTo(Rank, { foreignKey: 'oldRankId', as: 'oldRank' });
Promotion.belongsTo(Rank, { foreignKey: 'newRankId', as: 'newRank' });

// Events <-> Signups <-> Users
Event.hasMany(EventSignup, { foreignKey: 'eventId', as: 'signups', onDelete: 'CASCADE' });
EventSignup.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
User.hasMany(EventSignup, { foreignKey: 'userId', as: 'eventSignups' });
EventSignup.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Applications
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Application.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Gallery
GalleryImage.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
GalleryImage.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// AARs
AAR.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
AAR.belongsTo(User, { foreignKey: 'authoredBy', as: 'author' });

module.exports = {
  sequelize,
  User,
  Rank,
  Promotion,
  Event,
  EventSignup,
  Application,
  GalleryImage,
  AAR,
};
