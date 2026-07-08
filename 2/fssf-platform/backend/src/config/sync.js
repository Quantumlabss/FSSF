// One-off script: node src/config/sync.js
// Creates/updates tables from the Sequelize models (dev convenience,
// alternative to running sql/schema.sql by hand).
const sequelize = require('./db');
require('../models');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced.');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
})();
