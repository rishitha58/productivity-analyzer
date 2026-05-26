const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['study', 'work', 'personal', 'health', 'travel', 'social', 'other'],
    default: 'other'
  },
  priority: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  priorityScore: { type: Number, default: 5 },
  
  // Scheduling
  scheduledDate: Date,
  scheduledStartTime: String,
  scheduledEndTime: String,
  estimatedDuration: { type: Number, default: 30 }, // minutes
  actualDuration: Number,
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'skipped', 'rescheduled'],
    default: 'pending'
  },
  completedAt: Date,
  completionPercentage: { type: Number, default: 0 },
  
  // Source
  source: { 
    type: String, 
    enum: ['journal', 'manual', 'goal', 'recurring', 'ai-suggested'],
    default: 'manual'
  },
  journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal' },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  
  // Rescheduling history
  rescheduleHistory: [{
    originalDate: Date,
    newDate: Date,
    reason: String,
    rescheduledAt: Date,
  }],
  rescheduleCount: { type: Number, default: 0 },
  
  // ML prediction
  completionProbability: { type: Number, default: 0.5 },
  
  // Recurring
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    daysOfWeek: [Number],
    endDate: Date,
  },
  
  // Sleep impact check
  affectsSleep: { type: Boolean, default: false },
  
  // Subtasks
  subtasks: [{
    title: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
  
  tags: [String],
  notes: String,
  reminder: {
    enabled: { type: Boolean, default: false },
    minutesBefore: { type: Number, default: 15 },
    sent: { type: Boolean, default: false },
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.index({ user: 1, scheduledDate: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });

taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', taskSchema);