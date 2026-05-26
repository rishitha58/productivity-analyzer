// backend/models/ImportantPoints.js
const mongoose = require('mongoose');

const ImportantPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
  },
  subject: String,
  points: [{
    point: String,
    subtopics: [String],
    importance: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
    },
    source: {
      type: String,
      enum: ['ai-generated', 'pdf-gap', 'user-added'],
      default: 'ai-generated',
    },
    isFromPdf: Boolean,
    pdfMissed: Boolean,
  }],
  pdfContent: String,
  pdfFileName: String,
  hasPdf: {
    type: Boolean,
    default: false,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ImportantPoints', ImportantPointsSchema);