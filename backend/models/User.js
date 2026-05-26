const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  
  // Onboarding
  onboardingCompleted: { type: Boolean, default: false },
  isStudent: { type: Boolean, default: false },
  
  // Long-term goal from onboarding
  primaryGoal: {
    title: String,
    duration: Number, // in months
    durationUnit: { type: String, enum: ['days', 'weeks', 'months', 'years'], default: 'months' },
    startDate: Date,
    targetDate: Date,
    category: String,
  },
  
  // Sleep schedule
  sleepSchedule: {
    bedtime: { type: String, default: '23:00' },
    wakeTime: { type: String, default: '07:00' },
    minimumSleep: { type: Number, default: 7 }, // hours
    alarmEnabled: { type: Boolean, default: true },
  },
  
  // Food preferences
  foodPreferences: {
    dietType: { 
      type: String, 
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'keto', 'mixed'], 
      default: 'mixed' 
    },
    preferredMealTimes: {
      breakfast: { type: String, default: '08:00' },
      lunch: { type: String, default: '13:00' },
      dinner: { type: String, default: '20:00' },
    },
    allergies: [String],
    cuisinePreferences: [String],
  },
  
  // Study preferences
  studyPreferences: {
    preferredStudyTime: { 
      type: String, 
      enum: ['morning', 'afternoon', 'evening', 'night'], 
      default: 'morning' 
    },
    sessionDuration: { type: Number, default: 45 }, // minutes
    breakDuration: { type: Number, default: 15 }, // minutes
    musicPreference: { type: String, default: 'lofi' },
  },
  
  // Travel history
  visitedPlaces: [{
    name: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    visitedAt: Date,
  }],
  
  // Home location
  homeLocation: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  
  // Stats
  stats: {
    totalTasksCompleted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
    productivityScore: { type: Number, default: 0 },
  },
  
  // Notifications
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    taskReminders: { type: Boolean, default: true },
    habitReminders: { type: Boolean, default: true },
    travelAlerts: { type: Boolean, default: true },
    sleepAlerts: { type: Boolean, default: true },
  },
  
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.updatedAt = new Date();
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);