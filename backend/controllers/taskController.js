// backend/controllers/taskController.js
const Task = require('../models/Task');
const Sleep = require('../models/Sleep');
const schedulingService = require('../services/schedulingService');
const sleepService = require('../services/sleepService');
const notificationService = require('../services/notificationService');

// @desc Get tasks for a date
exports.getTasks = async (req, res, next) => {
  try {
    const { date, status, category, priority } = req.query;

    const query = { userId: req.user._id };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query['scheduledTime.start'] = { $gte: targetDate, $lt: nextDay };
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .sort({ priorityScore: -1, 'scheduledTime.start': 1 })
      .lean();

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc Update task status
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, completedAt, feedback } = req.body;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;

    if (status === 'completed') {
      task.completedAt = completedAt || new Date();
      task.actualDuration = req.body.actualDuration;
      if (feedback) task.feedbackScore = feedback;

      // Send to NLP for learning
      await updateMLModel(task, 'completed');
    }

    await task.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('task-updated', {
      taskId: task._id,
      status: task.status,
    });

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc Reschedule missed task
exports.rescheduleTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check sleep impact of new schedule
    const sleepImpact = await sleepService.checkTaskSleepImpact(
      req.user._id,
      [{ ...task.toObject(), scheduledTime: { start: new Date(newTime || newDate) } }]
    );

    if (sleepImpact.blocked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule task - it will impact your minimum sleep requirement',
        sleepWarning: sleepImpact.message,
      });
    }

    const oldDate = task.scheduledTime.start;
    const newScheduledDate = new Date(newTime || newDate);

    task.rescheduledFrom = oldDate;
    task.rescheduledCount += 1;
    task.status = 'rescheduled';
    task.scheduledTime.start = newScheduledDate;

    if (task.estimatedDuration) {
      task.scheduledTime.end = new Date(
        newScheduledDate.getTime() + task.estimatedDuration * 60 * 1000
      );
    }

    await task.save();

    res.json({ success: true, task, message: 'Task rescheduled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc Create manual task
exports.createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user._id,
      source: 'manual',
    };

    // Check sleep impact
    const sleepCheck = await sleepService.checkTaskSleepImpact(
      req.user._id,
      [taskData]
    );

    if (sleepCheck.blocked) {
      return res.status(400).json({
        success: false,
        message: sleepCheck.message,
      });
    }

    const task = await Task.create(taskData);

    // Schedule notification for task
    if (task.scheduledTime?.start) {
      await notificationService.scheduleTaskReminder(req.user._id, task);
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

async function updateMLModel(task, outcome) {
  try {
    await require('axios').post(
      `${process.env.NLP_SERVICE_URL}/ml/update`,
      { task: task.toObject(), outcome },
      { timeout: 5000 }
    );
  } catch (err) {
    console.error('ML update failed:', err.message);
  }
}

// @desc Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};