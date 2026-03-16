require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./database/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const taskRoutes = require('./routes/task-routes');

const app = express();
const PORT = process.env.PORT || 4002;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'task-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Cron Job for Render Deployment
let url = process.env?.HEALTH_URL;
const interval = 330000;
function reloadWebsite(){
  axios
  .get(url)
  .then(response => console.log('task-service Cron job working...'))
  .catch(error => console.error('Failed to reload website:', error));
}

setInterval(reloadWebsite, interval);

// ─── Routes ────────────────────────────────────────────────────
app.use('/', taskRoutes);

// ─── Start Server ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`🚀 Task Service running on port ${PORT}`);
  });
};

startServer();
