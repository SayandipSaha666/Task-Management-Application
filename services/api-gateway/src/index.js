require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authMiddleware = require('./middleware/auth');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const setupProxies = require('./config/proxy');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Allowed Origins ──────────────────────────────────────────
// Trim trailing slashes — browser sends "https://example.com" (no slash)
// but users often paste "https://example.com/" — CORS does exact matching!
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'])
  .map(origin => origin.trim().replace(/\/+$/, ''));
console.log('✅ CORS allowed origins:', allowedOrigins);

// ─── Middleware (order matters!) ───────────────────────────────
// 1. Manual CORS headers on EVERY response (including proxy errors)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 2. CORS middleware (belt-and-suspenders — works alongside manual headers)
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

// 2. Cookie parser — extract token from cookies
app.use(cookieParser());

// 3. Request logging
app.use(morgan('short'));

// 4. Rate limiting
app.use(generalLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);

// 5. Auth middleware — verify JWT, inject X-User-Id
app.use(authMiddleware);

// ─── Health Check (Gateway's own) ──────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Cron Job for Render Deployment
let url = process.env?.HEALTH_URL;
const interval = 390000;
function reloadWebsite(){
  axios
  .get(url)
  .then(response => console.log('api-gateway Cron job working...'))
  .catch(error => console.error('Failed to reload website:', error));
}

setInterval(reloadWebsite, interval);

// ─── Proxy Setup ───────────────────────────────────────────────
// Must come AFTER auth middleware so JWT is verified before proxying
setupProxies(app);

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Routing to services...`);
});
