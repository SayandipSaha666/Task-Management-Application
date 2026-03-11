const jwt = require('jsonwebtoken');
const services = require('../config/services');

const authMiddleware = (req, res, next) => {
  // ─── Step 1: Find which service this request targets ─────
  const matchedPrefix = Object.keys(services).find(prefix =>
    req.path.startsWith(prefix)
  );

  if (!matchedPrefix) {
    return next();  // Not a service route (health check, etc.)
  }

  // ─── Step 2: Check if this is a public route ─────────────
  const service = services[matchedPrefix];
  const subPath = req.path.replace(matchedPrefix, '');  // e.g., /api/user/register → /register

  if (service.publicRoutes.includes(subPath)) {
    console.log(`🔓 Public route: ${req.method} ${req.path}`);
    return next();   // No JWT needed for public routes
  }

  // ─── Step 3: Extract token from cookie ───────────────────
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  // ─── Step 4: Verify JWT ──────────────────────────────────
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // ─── Step 5: Inject X-User-Id header ───────────────────
    // Downstream services trust this header — they don't
    // need to verify the token themselves
    req.headers['x-user-id'] = decoded.id;

    console.log(`🔐 Authenticated: ${req.method} ${req.path} (User: ${decoded.id})`);
    return next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
