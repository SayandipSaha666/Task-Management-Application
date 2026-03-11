require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./database/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const userRoutes = require('./routes/user-routes');

const app = express();
const PORT = process.env.PORT || 4001;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
// Docker and the API Gateway use this to know if the service is alive
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Cron Job for Render Deployment
let url = process.env?.HEALTH_URL;
const interval = 300000;
function reloadWebsite(){
  axios
  .get(url)
  .then(response => console.log('Website reloaded successfully'))
  .catch(error => console.error('Failed to reload website:', error));
}

setInterval(reloadWebsite, interval);

// ─── Routes ────────────────────────────────────────────────────
app.use('/', userRoutes);

// ─── Start Server ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB();          // Step 1: Connect to database FIRST
  await connectRabbitMQ();    // Step 2: Connect to RabbitMQ
  app.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
  });
};

startServer();
