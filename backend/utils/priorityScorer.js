exports.scoreTask = (task, userBehavior = {}) => {
  let score = 0;

  const priorityWeights = { high: 10, medium: 6, low: 3 };
  score += priorityWeights[task.priority] || 5;

  if (task.scheduledTime) {
    const timeUntil = (new Date(task.scheduledTime) - new Date()) / (1000 * 60 * 60);
    if (timeUntil < 1) score += 10;
    else if (timeUntil < 3) score += 6;
    else if (timeUntil < 6) score += 3;
  }

  if (task.goalId) score += 4;
  if (task.rescheduledCount > 0) score += task.rescheduledCount * 2;

  const categoryWeights = {
    study: 7, work: 8, health: 6, personal: 4, travel: 5, other: 2
  };
  score += categoryWeights[task.category] || 2;

  return score;
};