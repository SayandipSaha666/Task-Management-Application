require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./database/database');
const { connectAndConsume } = require('./events/consumer');
const notificationRoutes = require('./routes/notification-routes');

const app = express();
const PORT = process.env.PORT || 4003;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'notification-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Cron Job for Render Deployment
let url = process.env?.HEALTH_URL;
const interval = 360000;
function reloadWebsite(){
  axios
  .get(url)
  .then(response => console.log('Website reloaded successfully'))
  .catch(error => console.error('Failed to reload website:', error));
}

// setInterval(reloadWebsite, interval);

// ─── Routes ────────────────────────────────────────────────────
app.use('/', notificationRoutes);

// ─── Start Server ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  await connectAndConsume();     // ← Start listening for RabbitMQ events
  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
  });
};

startServer();
