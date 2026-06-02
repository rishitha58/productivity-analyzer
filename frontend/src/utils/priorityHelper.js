// ⭐ Task Priority Helper Functions

// Priority levels
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Priority weights for sorting
export const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

// Calculate priority based on multiple factors
export const calculatePriority = (task) => {
  let score = 0;

  // Factor 1: Deadline urgency
  if (task.deadline) {
    const daysUntilDeadline = getDaysBetween(new Date(), task.deadline);
    if (daysUntilDeadline <= 1) score += 5;
    else if (daysUntilDeadline <= 3) score += 3;
    else if (daysUntilDeadline <= 7) score += 1;
  }

  // Factor 2: Importance keywords in title
  const importantKeywords = [
    'urgent', 'asap', 'critical', 'important', 'must',
    'deadline', 'exam', 'test', 'interview', 'meeting',
  ];
  const titleLower = (task.title || '').toLowerCase();
  importantKeywords.forEach((keyword) => {
    if (titleLower.includes(keyword)) score += 2;
  });

  // Factor 3: Task category weight
  const categoryWeights = {
    study: 3,
    work: 3,
    health: 2,
    personal: 1,
    leisure: 0,
  };
  score += categoryWeights[task.category] || 0;

  // Factor 4: User-marked importance
  if (task.userMarkedImportant) score += 3;

  // Determine priority level
  if (score >= 6) return PRIORITY_LEVELS.HIGH;
  if (score >= 3) return PRIORITY_LEVELS.MEDIUM;
  return PRIORITY_LEVELS.LOW;
};

// Helper - get days between two dates
const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
};

// Sort tasks by priority
export const sortByPriority = (tasks) => {
  return [...tasks].sort((a, b) => {
    const aWeight = PRIORITY_WEIGHTS[a.priority] || 0;
    const bWeight = PRIORITY_WEIGHTS[b.priority] || 0;
    return bWeight - aWeight;
  });
};

// Sort tasks by deadline
export const sortByDeadline = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
};

// Sort tasks by combined priority + deadline
export const sortBySmartOrder = (tasks) => {
  return [...tasks].sort((a, b) => {
    const aWeight = PRIORITY_WEIGHTS[a.priority] || 0;
    const bWeight = PRIORITY_WEIGHTS[b.priority] || 0;

    // First compare priority
    if (aWeight !== bWeight) return bWeight - aWeight;

    // Then compare deadline
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
};

// Get priority label with emoji
export const getPriorityLabel = (priority) => {
  const labels = {
    high: '🔥 High',
    medium: '⚡ Medium',
    low: '🌿 Low',
  };
  return labels[priority] || labels.low;
};

// Get priority emoji only
export const getPriorityEmoji = (priority) => {
  const emojis = {
    high: '🔥',
    medium: '⚡',
    low: '🌿',
  };
  return emojis[priority] || emojis.low;
};

// Filter tasks by priority
export const filterByPriority = (tasks, priority) => {
  return tasks.filter((task) => task.priority === priority);
};

// Get incomplete tasks
export const getIncompleteTasks = (tasks) => {
  return tasks.filter((task) => !task.completed);
};

// Get completed tasks
export const getCompletedTasks = (tasks) => {
  return tasks.filter((task) => task.completed);
};

// Get tasks for today
export const getTodayTasks = (tasks) => {
  const today = new Date().toDateString();
  return tasks.filter((task) => {
    if (!task.scheduledTime) return false;
    return new Date(task.scheduledTime).toDateString() === today;
  });
};

// Get overdue tasks
export const getOverdueTasks = (tasks) => {
  const now = new Date();
  return tasks.filter((task) => {
    if (task.completed || !task.deadline) return false;
    return new Date(task.deadline) < now;
  });
};

// Calculate completion percentage
export const getCompletionPercentage = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

// Get productivity score (0-100)
export const getProductivityScore = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const completed = tasks.filter((t) => t.completed);
  const total = tasks.length;
  const completionRate = (completed.length / total) * 100;

  // Bonus for completing high priority tasks
  const highPriorityCompleted = completed.filter((t) => t.priority === 'high').length;
  const highPriorityTotal = tasks.filter((t) => t.priority === 'high').length;
  const priorityBonus =
    highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 10 : 0;

  return Math.min(100, Math.round(completionRate + priorityBonus));
};

// Estimate task duration (in minutes) if not provided
export const estimateTaskDuration = (task) => {
  if (task.duration) return task.duration;

  const categoryDefaults = {
    study: 60,
    work: 45,
    health: 30,
    personal: 30,
    leisure: 60,
  };

  return categoryDefaults[task.category] || 30;
};