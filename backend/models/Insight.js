const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  
  // Productivity metrics
  metrics: {
    tasksTotal: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    tasksSkipped: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    journalWritten: { type: Boolean, default: false },
    moodScore: { type: Number, default: 5 },
  },
  
  // Habit analysis
  habitData: {
    streak: Number,
    consistencyScore: Number,
    bestTimeOfDay: String,
    peakProductivityHour: String,
  },
  
  // Drift detection
  driftDetected: { type: Boolean, default: false },
  driftDetails: {
    metric: String,
    previousValue: Number,
    currentValue: Number,
    dropPercentage: Number,
    suggestion: String,
  },
  
  // Recommendations
  recommendations: [String],
  
  // Sleep data
  sleepData: {
    averageHours: Number,
    quality: String,
    consistency: Number,
  },
  
  createdAt: { type: Date, default: Date.now },
});

insightSchema.index({ user: 1, date: -1 });
insightSchema.index({ user: 1, period: 1 });

module.exports = mongoose.model('Insight', insightSchema);