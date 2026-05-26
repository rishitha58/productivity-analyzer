// backend/controllers/sleepController.js
const Sleep = require('../models/Sleep');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const sleepService = require('../services/sleepService');

// @desc Update sleep schedule
exports.updateSleepSchedule = async (req, res, next) => {
  try {
    const { bedtime, wakeTime, minimumSleep, alarmEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'sleepSchedule.bedtime': bedtime,
          'sleepSchedule.wakeTime': wakeTime,
          'sleepSchedule.minimumSleep': minimumSleep || 5,
          'sleepSchedule.alarmEnabled': alarmEnabled,
        },
      },
      { new: true }
    );

    // Reschedule alarm
    if (alarmEnabled) {
      await scheduleAlarm(req.user._id, wakeTime);
    }

    // Check if any existing tasks conflict with sleep schedule
    const conflictingTasks = await sleepService.findSleepConflicts(
      req.user._id,
      bedtime,
      wakeTime
    );

    res.json({
      success: true,
      sleepSchedule: user.sleepSchedule,
      conflictingTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Log daily sleep
exports.logSleep = async (req, res, next) => {
  try {
    const { bedtime, wakeTime, quality, notes } = req.body;

    const bedDate = new Date();
    const wakeDate = new Date();

    const [bedH, bedM] = bedtime.split(':');
    const [wakeH, wakeM] = wakeTime.split(':');

    bedDate.setHours(parseInt(bedH), parseInt(bedM), 0, 0);
    wakeDate.setHours(parseInt(wakeH), parseInt(wakeM), 0, 0);

    // If wake time is before bed time, it's next day
    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const sleepHours = (wakeDate - bedDate) / (1000 * 60 * 60);
    const user = await User.findById(req.user._id);
    const minimumSleep = user.sleepSchedule?.minimumSleep || 5;

    const sleepLog = await Sleep.create({
      userId: req.user._id,
      bedtime,
      wakeTime,
      actualSleepHours: sleepHours,
      quality,
      notes,
      date: new Date(),
    });

    let warning = null;
    if (sleepHours < minimumSleep) {
      warning = `You only got ${sleepHours.toFixed(1)} hours of sleep. Minimum recommended is ${minimumSleep} hours.`;

      // Automatically adjust today's tasks
      const adjustedTasks = await sleepService.adjustTasksForSleepDebt(
        req.user._id,
        sleepHours,
        minimumSleep
      );

      sleepLog.tasksRemovedDueToSleep = adjustedTasks.map((t) => t._id);
      await sleepLog.save();
    }

    res.json({
      success: true,
      sleepLog,
      sleepHours,
      warning,
      isAdequate: sleepHours >= minimumSleep,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get sleep history
exports.getSleepHistory = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sleepHistory = await Sleep.find({
      userId: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const avgSleep = sleepHistory.length > 0
      ? sleepHistory.reduce((sum, s) => sum + s.actualSleepHours, 0) / sleepHistory.length
      : 0;

    res.json({
      success: true,
      sleepHistory,
      averageSleepHours: avgSleep.toFixed(1),
      totalDaysTracked: sleepHistory.length,
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Schedule alarm notification
async function scheduleAlarm(userId, wakeTime) {
  // Cancel existing alarm
  await Notification.deleteMany({
    userId,
    type: 'alarm',
    isSent: false,
  });

  const [hours, minutes] = wakeTime.split(':');
  const alarmTime = new Date();
  alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // If alarm time has passed today, schedule for tomorrow
  if (alarmTime < new Date()) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }

  await Notification.create({
    userId,
    title: '⏰ Good Morning!',
    message: `Rise and shine! Time to start your productive day. Check your journal and today's tasks.`,
    type: 'alarm',
    priority: 'critical',
    scheduledFor: alarmTime,
    metadata: {
      action: 'open-journal',
      actionUrl: '/journal',
    },
  });
}