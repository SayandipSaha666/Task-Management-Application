const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('./services');

const setupProxies = (app) => {
  Object.entries(services).forEach(([prefix, config]) => {
    app.use(
      prefix,
      createProxyMiddleware({
        target: config.target,
        changeOrigin: true,
        pathRewrite: {
          [`^${prefix}`]: ''    // Strip the prefix: /api/user/register → /register
        },

        // ─── Forward cookies from service → client ─────────
        on: {
          proxyRes: (proxyRes, req, res) => {
            // Preserve Set-Cookie headers from downstream services
            // (User Service sets the JWT cookie on login/register)
            const setCookieHeaders = proxyRes.headers['set-cookie'];
            if (setCookieHeaders) {
              res.setHeader('set-cookie', setCookieHeaders);
            }
          },
          error: (err, req, res) => {
            console.error(`❌ Proxy error for ${prefix}:`, err.message);
            res.status(502).json({
              success: false,
              message: `Service unavailable: ${prefix}`
            });
          }
        },

        // Log each proxied request
        logger: console
      })
    );

    console.log(`📡 Proxy: ${prefix} → ${config.target}`);
  });
};

module.exports = setupProxies;
