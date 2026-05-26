const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  targetDate: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  progress: { type: Number, default: 0 },
});

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String,
    enum: ['career', 'education', 'health', 'finance', 'personal', 'relationship', 'skill', 'other'],
    default: 'personal'
  },
  
  // Timeline
  startDate: { type: Date, default: Date.now },
  targetDate: { type: Date, required: true },
  duration: Number, // in days
  
  // Progress
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'paused', 'abandoned'],
    default: 'not-started'
  },
  
  // Phases and milestones
  phases: [{
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    progress: { type: Number, default: 0 },
    milestones: [milestoneSchema],
  }],
  
  // Current milestone
  currentPhase: { type: Number, default: 0 },
  
  // AI generated roadmap
  roadmap: {
    generatedAt: Date,
    plan: String,
    weeklyTargets: [String],
    resources: [String],
  },
  
  // Daily tasks from goal
  dailyTaskQuota: { type: Number, default: 1 },
  
  completedAt: Date,
  isPrimary: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

goalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Goal', goalSchema);