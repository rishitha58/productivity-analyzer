// backend/models/Mistake.js
const mongoose = require('mongoose');

const MistakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  mockTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',
  },
  question: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: String,
  topic: String,
  subject: String,
  difficulty: String,
  isReviewed: {
    type: Boolean,
    default: false,
  },
  reviewedAt: Date,
  tags: [String],
  reviewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Mistake', MistakeSchema);