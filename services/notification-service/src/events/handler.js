const Notification = require('../models/notification');

// Map event types to human-readable notifications
const eventConfig = {
  'user.registered': {
    title: '🎉 Welcome!',
    message: (p) => `Welcome to Task Manager, ${p.userName || 'new user'}!`
  },
  'user.loggedIn': {
    title: '🔐 Login detected',
    message: (p) => `You logged in from a new session.`
  },
  'user.loggedOut': {
    title: '👋 Logged out',
    message: (p) => `You have been logged out successfully.`
  },
  'task.created': {
    title: '📝 New task created',
    message: (p) => `Task "${p.title}" has been created with ${p.priority} priority.`
  },
  'task.updated': {
    title: '✏️ Task updated',
    message: (p) => `A task has been updated.`
  },
  'task.deleted': {
    title: '🗑️ Task deleted',
    message: (p) => `Task "${p.title}" has been deleted.`
  },
  'task.statusChanged': {
    title: '🔄 Status changed',
    message: (p) => `Task moved from "${p.from}" to "${p.to}".`
  }
};

const handleEvent = async (event) => {
  const { eventType, payload } = event;
  const config = eventConfig[eventType];

  if (!config) {
    console.warn(`Unknown event type: ${eventType}`);
    return;
  }

  try {
    const notification = await Notification.create({
      userId: payload.userId,
      type: eventType,
      title: config.title,
      message: config.message(payload),
      metadata: payload
    });

    console.log(`Notification created: [${eventType}] for user ${payload.userId}`);
  } catch (error) {
    console.error(` Failed to create notification for ${eventType}:`, error.message);
    throw error;    // Re-throw so consumer.js can nack the message
  }
};

module.exports = { handleEvent };
