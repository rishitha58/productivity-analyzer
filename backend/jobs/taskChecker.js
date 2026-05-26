const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000);

    // Find missed tasks
    const missedTasks = await Task.find({
      scheduledTime: { $lt: fifteenMinutesAgo },
      status: 'pending'
    });

    for (const task of missedTasks) {
      await Task.findByIdAndUpdate(task._id, {
        status: 'missed',
        missedAt: now
      });

      // Create notification
      await Notification.create({
        userId: task.userId,
        type: 'task-missed',
        title: 'Task Missed',
        message: `You missed: "${task.title}". Would you like to reschedule?`,
        data: { taskId: task._id }
      });
    }

    // Send reminders for upcoming tasks (30 min before)
    const upcomingTime = new Date(now.getTime() + 30 * 60000);
    const upcomingTasks = await Task.find({
      scheduledTime: { $gte: now, $lte: upcomingTime },
      status: 'pending'
    });

    for (const task of upcomingTasks) {
      const existing = await Notification.findOne({
        userId: task.userId,
        'data.taskId': task._id,
        type: 'task-reminder',
        createdAt: { $gte: new Date(now - 60 * 60000) }
      });

      if (!existing) {
        await Notification.create({
          userId: task.userId,
          type: 'task-reminder',
          title: '⏰ Task Reminder',
          message: `"${task.title}" starts in 30 minutes!`,
          data: { taskId: task._id },
          scheduledFor: new Date(task.scheduledTime - 30 * 60000)
        });
      }
    }
  } catch (err) {
    console.error('Task checker error:', err);
  }
});