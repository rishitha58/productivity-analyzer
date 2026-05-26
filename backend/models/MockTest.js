const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  topic: String,
  userAnswer: String,
  isCorrect: Boolean,
  timeTaken: Number, // seconds
});

const mockTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  topic: String,
  subject: String,
  
  questions: [questionSchema],
  
  // Source of questions
  generatedFrom: {
    aiChats: [String], // conversation IDs
    importantPoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    pdfs: [String],
  },
  
  // Results
  totalQuestions: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  skippedQuestions: Number,
  score: Number, // percentage
  timeTaken: Number, // total seconds
  
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  
  // Mistakes extracted for review
  mistakesExtracted: { type: Boolean, default: false },
  
  startedAt: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MockTest', mockTestSchema);