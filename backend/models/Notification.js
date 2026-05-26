const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['task', 'goal', 'habit', 'travel', 'sleep', 'food', 'insight', 'system', 'alarm'],
    default: 'system'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  // Scheduling
  scheduledFor: Date,
  sent: { type: Boolean, default: false },
  sentAt: Date,
  
  // Reference
  referenceId: String,
  referenceModel: String,
  
  // Travel specific
  travelDetails: {
    destination: String,
    departureTime: String,
    travelDuration: Number,
    route: String,
  },
  
  read: { type: Boolean, default: false },
  readAt: Date,
  
  actionUrl: String,
  
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, sent: 1, scheduledFor: 1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);