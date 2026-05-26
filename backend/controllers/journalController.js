// backend/controllers/journalController.js
const Journal = require('../models/Journal');
const Task = require('../models/Task');
const axios = require('axios');
const notificationService = require('../services/notificationService');
const sleepService = require('../services/sleepService');
const travelService = require('../services/travelService');

// @desc Create journal entry
exports.createJournal = async (req, res, next) => {
  try {
    const { content, mood, date, sleepData } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Journal content cannot be empty',
      });
    }

    // Save initial journal entry
    const journal = await Journal.create({
      userId: req.user._id,
      content,
      mood,
      date: date || new Date(),
      sleepDataCollected: !!sleepData,
    });

    // Process sleep data if provided
    if (sleepData) {
      await sleepService.processSleepData(req.user._id, sleepData);
    }

    // Send to NLP service for processing
    let extractedData = null;
    try {
      const nlpResponse = await axios.post(
        `${process.env.NLP_SERVICE_URL}/extract`,
        {
          text: content,
          userId: req.user._id.toString(),
          journalId: journal._id.toString(),
        },
        { timeout: 30000 }
      );
      extractedData = nlpResponse.data;
    } catch (nlpError) {
      console.error('NLP service error:', nlpError.message);
      // Generate basic tasks as fallback
      extractedData = generateBasicTasks(content);
    }

    // Update journal with extracted data
    journal.extractedData = extractedData;
    journal.processedAt = new Date();
    await journal.save();

    // Generate tasks from extracted data
    const createdTasks = await createTasksFromExtraction(
      req.user._id,
      journal._id,
      extractedData,
      req.user
    );

    // Handle travel mentions
    if (extractedData.travelMentions && extractedData.travelMentions.length > 0) {
      await handleTravelMentions(
        req.user._id,
        journal._id,
        extractedData.travelMentions,
        res,
        journal
      );
    }

    // Check sleep impact on new tasks
    const sleepCheck = await sleepService.checkTaskSleepImpact(
      req.user._id,
      createdTasks
    );

    res.status(201).json({
      success: true,
      journal,
      tasks: createdTasks,
      sleepWarnings: sleepCheck.warnings,
      travelMentions: extractedData.travelMentions || [],
      message: 'Journal processed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Create tasks from NLP extraction
async function createTasksFromExtraction(userId, journalId, extractedData, user) {
  const tasks = [];

  if (!extractedData?.tasks) return tasks;

  for (const extractedTask of extractedData.tasks) {
    const priorityScore = calculatePriorityScore(extractedTask);

    const task = await Task.create({
      userId,
      journalId,
      title: extractedTask.title,
      category: extractedTask.category || 'other',
      priority: mapPriority(priorityScore),
      priorityScore,
      estimatedDuration: parseInt(extractedTask.duration) || 30,
      scheduledTime: {
        start: calculateStartTime(extractedTask.time),
        end: calculateEndTime(extractedTask.time, extractedTask.duration),
      },
      dueDate: new Date(),
      source: 'journal',
      tags: [extractedTask.category, extractedTask.intent].filter(Boolean),
    });

    tasks.push(task);
  }

  return tasks;
}

// Helper: Calculate priority score
function calculatePriorityScore(task) {
  let score = 50;
  if (task.priority === 'high') score += 30;
  if (task.priority === 'medium') score += 15;
  if (task.intent === 'urgent') score += 20;
  if (task.time) score += 10;
  return Math.min(score, 100);
}

// Helper: Map priority
function mapPriority(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Helper: Calculate time slots
function calculateStartTime(timeStr) {
  if (!timeStr) return new Date();
  // Parse natural language time
  const now = new Date();
  // Basic parsing - NLP service handles complex cases
  return now;
}

function calculateEndTime(timeStr, duration) {
  const start = calculateStartTime(timeStr);
  const durationMinutes = parseInt(duration) || 30;
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

// Helper: Handle travel mentions
async function handleTravelMentions(userId, journalId, travelMentions, res, journal) {
  for (const travel of travelMentions) {
    await travelService.processTravelMention(userId, journalId, travel);
  }
}

// Fallback: Generate basic tasks
function generateBasicTasks(content) {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  return {
    tasks: lines.slice(0, 5).map((line, i) => ({
      title: line.trim().substring(0, 100),
      category: 'other',
      priority: 'medium',
      duration: '30',
      time: null,
      intent: 'general',
    })),
    travelMentions: [],
    locations: [],
    emotions: [],
  };
}

// @desc Get all journals
exports.getJournals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const journals = await Journal.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Journal.countDocuments(query);

    res.json({
      success: true,
      journals,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get today's journal
exports.getTodayJournal = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const journal = await Journal.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({ success: true, journal });
  } catch (error) {
    next(error);
  }
};