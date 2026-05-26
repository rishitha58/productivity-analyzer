const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['general', 'study', 'important-points', 'mistake', 'summary'],
    default: 'general'
  },
  
  // For important points
  topic: String,
  subject: String,
  
  // For mistakes
  mistakeDetails: {
    question: String,
    wrongAnswer: String,
    correctAnswer: String,
    explanation: String,
    source: { type: String, enum: ['mocktest', 'ai-chat', 'manual'] },
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    reviewed: { type: Boolean, default: false },
    reviewCount: { type: Number, default: 0 },
  },
  
  // For PDF imports
  sourceFile: {
    name: String,
    url: String,
    uploadedAt: Date,
  },
  
  // AI generated additions (points not covered in PDF)
  aiAdditions: [{
    point: String,
    importance: String,
    addedAt: Date,
  }],
  
  tags: [String],
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '#ffffff' },
  
  studySessionId: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

noteSchema.index({ user: 1, type: 1 });
noteSchema.index({ user: 1, topic: 1 });

module.exports = mongoose.model('Note', noteSchema);