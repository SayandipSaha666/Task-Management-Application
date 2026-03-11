const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification-controller');

router.get('/:userId', getNotifications);          // GET /user123
router.patch('/:id/read', markAsRead);             // PATCH /abc123/read
router.patch('/:userId/read-all', markAllAsRead);  // PATCH /user123/read-all

module.exports = router;
