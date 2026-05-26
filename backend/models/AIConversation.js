// backend/models/AIConversation.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    isStudyRelated: Boolean,
    topic: String,
    hasImportantPoints: Boolean,
  },
});

const AIConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionType: {
    type: String,
    enum: ['general', 'study', 'important-points', 'mock-test-prep', 'goal-planning'],
    default: 'general',
  },
  topic: String,
  subject: String,
  messages: [MessageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  studySessionId: String,
  importantPointsGenerated: Boolean,
  mockTestReadyTopics: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('AIConversation', AIConversationSchema);