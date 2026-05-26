const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const axios = require('axios');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await require('../models/User').find({ onboardingComplete: true });

    for (const user of users) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentTasks = await Task.find({
        userId: user._id,
        createdAt: { $gte: weekAgo }
      });

      const completionRate = recentTasks.length > 0
        ? recentTasks.filter(t => t.status === 'completed').length / recentTasks.length
        : 0;

      if (completionRate < 0.5 && recentTasks.length > 5) {
        await Notification.create({
          userId: user._id,
          type: 'habit-drift',
          title: '📊 Productivity Alert',
          message: `Your task completion rate dropped to ${(completionRate * 100).toFixed(0)}%. Let\'s get back on track!`,
          data: { completionRate }
        });
      }
    }
  } catch (err) {
    console.error('Habit analyzer error:', err);
  }
});