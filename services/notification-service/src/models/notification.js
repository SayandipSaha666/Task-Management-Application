const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true 
  },
  type: {
    type: String,
    required: true,
    enum: [
      'user.registered',
      'user.loggedIn',
      'user.loggedOut',
      'task.created',
      'task.updated',
      'task.deleted',
      'task.statusChanged'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true              
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,  
    default: {}
  }
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
