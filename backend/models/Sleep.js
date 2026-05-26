// backend/models/Sleep.js
const mongoose = require('mongoose');

const SleepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  bedtime: {
    type: String,
    required: true,
  },
  wakeTime: {
    type: String,
    required: true,
  },
  actualSleepHours: {
    type: Number,
    required: true,
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good',
  },
  notes: String,
  alarmSet: Boolean,
  alarmTime: String,
  tasksRemovedDueToSleep: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sleep', SleepSchema);