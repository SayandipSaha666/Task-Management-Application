const Notification = require('../models/notification');

// ─── Get all notifications for a user ──────────────────────────
const getNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })    // Newest first
      .limit(50);                  // Don't return thousands

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

// ─── Mark a single notification as read ────────────────────────
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false, message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

// ─── Mark ALL notifications as read for a user ─────────────────
const markAllAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true, message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
