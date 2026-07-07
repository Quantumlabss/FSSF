require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const sequelize = require('./src/config/db');
require('./src/models'); // load models + associations

const authRoutes = require('./src/routes/auth');
const eventRoutes = require('./src/routes/events');
const rosterRoutes = require('./src/routes/roster');
const applicationRoutes = require('./src/routes/applications');
const promotionRoutes = require('./src/routes/promotions');
const galleryRoutes = require('./src/routes/gallery');
const aarRoutes = require('./src/routes/aars');
const adminRoutes = require('./src/routes/admin');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'fssf-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/roster', rosterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/aars', aarRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler (e.g. multer file-size/type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL.');
    app.listen(PORT, () => console.log(`FSSF API listening on port ${PORT}`));
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  }
}

start();
