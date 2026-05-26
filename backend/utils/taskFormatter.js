const User = require('../models/User');

exports.checkSleepConflict = async (user, taskData) => {
  if (!user.sleepSchedule || !taskData.scheduledTime) {
    return { conflicts: false };
  }

  const { bedtime, wakeTime, minSleepHours } = user.sleepSchedule;
  const [bedH, bedM] = bedtime.split(':').map(Number);
  const [wakeH, wakeM] = wakeTime.split(':').map(Number);

  const taskTime = new Date(taskData.scheduledTime);
  const taskHour = taskTime.getHours();
  const taskMin = taskTime.getMinutes();
  const taskEndHour = taskHour + Math.floor((taskData.duration || 60) / 60);

  // Sleep window check
  const sleepStart = bedH * 60 + bedM;
  const taskStart = taskHour * 60 + taskMin;
  const taskEnd = taskEndHour * 60 + taskMin;

  // Calculate sleep hours
  let sleepHours = wakeH - bedH;
  if (sleepHours < 0) sleepHours += 24;

  if (taskEnd > sleepStart || (sleepHours - (taskData.duration || 60) / 60) < (minSleepHours || 5)) {
    return {
      conflicts: true,
      suggestion: `This task may affect your sleep. Consider scheduling it before ${bedtime}.`
    };
  }

  return { conflicts: false };
};

exports.formatTask = (nlpTask) => ({
  title: nlpTask.title || 'Untitled Task',
  category: nlpTask.category || 'other',
  priority: nlpTask.priority || 'medium',
  duration: nlpTask.duration || 60,
  scheduledTime: nlpTask.time ? new Date(nlpTask.time) : null,
  tags: nlpTask.tags || []
});