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
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
console.log('✅ CORS allowed origins:', allowedOrigins);

// ─── Middleware (order matters!) ───────────────────────────────
// 1. CORS first — handle preflight requests
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,           // ← CRITICAL: allows cookies to be sent
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

// 2. Explicitly handle preflight OPTIONS (before proxy intercepts them)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);  // CORS headers already set by cors() above
  }
  next();
});

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

// ─── Proxy Setup ───────────────────────────────────────────────
// Must come AFTER auth middleware so JWT is verified before proxying
setupProxies(app);

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Routing to services...`);
});
