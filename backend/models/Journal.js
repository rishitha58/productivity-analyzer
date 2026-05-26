const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  content: { type: String, required: true },
  mood: { 
    type: String, 
    enum: ['excellent', 'good', 'neutral', 'low', 'terrible'],
    default: 'neutral'
  },
  moodScore: { type: Number, min: 1, max: 10, default: 5 },
  
  // NLP extraction results
  extractedData: {
    tasks: [{
      title: String,
      time: String,
      duration: Number,
      priority: String,
      category: String,
      intent: String,
    }],
    locations: [String],
    people: [String],
    keywords: [String],
    sentiment: String,
    travelMentions: [{
      destination: String,
      time: String,
      date: String,
    }],
  },
  
  // Sleep data for that day
  sleepData: {
    actualBedtime: String,
    actualWakeTime: String,
    hoursSlept: Number,
    quality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] },
  },
  
  isProcessed: { type: Boolean, default: false },
  processingError: String,
  
  tags: [String],
  wordCount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

journalSchema.index({ user: 1, date: -1 });
journalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', journalSchema);