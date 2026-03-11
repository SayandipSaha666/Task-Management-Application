// ─── Route → Service mapping ───────────────────────────────────

const services = {
  '/api/user': {
    target: process.env.USER_SERVICE_URL || 'http://user-service:4001',
    publicRoutes: ['/register', '/login']
  },
  '/api/task': {
    target: process.env.TASK_SERVICE_URL || 'http://task-service:4002',
    publicRoutes: []
  },
  '/api/notification': {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003',
    publicRoutes: []
  }
};

module.exports = services;
