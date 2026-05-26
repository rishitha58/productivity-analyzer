const Task = require('../models/Task');
const Journal = require('../models/Journal');
const Insight = require('../models/Insight');
const axios = require('axios');

exports.getInsights = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const userId = req.user._id;

    const now = new Date();
    let startDate = new Date();
    if (period === 'daily') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    const tasks = await Task.find({
      userId,
      createdAt: { $gte: startDate }
    });

    const completed = tasks.filter(t => t.status === 'completed').length;
    const missed = tasks.filter(t => t.status === 'missed').length;
    const total = tasks.length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    const studyTasks = tasks.filter(t => t.category === 'study' && t.status === 'completed');
    const studyHours = studyTasks.reduce((acc, t) => acc + (t.duration || 0), 0) / 60;

    // Call NLP service for habit analysis
    let habitDrift = { detected: false, areas: [], recommendations: [] };
    try {
      const nlpResponse = await axios.post(
        `${process.env.NLP_SERVICE_URL}/insights/habit-drift`,
        { userId, period }
      );
      habitDrift = nlpResponse.data;
    } catch (e) {}

    const insight = {
      period,
      metrics: {
        tasksCompleted: completed,
        tasksMissed: missed,
        totalTasks: total,
        completionRate: parseFloat(completionRate),
        studyHours: parseFloat(studyHours.toFixed(1)),
        productivityScore: Math.min(100, Math.round(completionRate * 0.7 + studyHours * 3)),
        streakDays: await calculateStreak(userId)
      },
      habitDrift,
      tasksByCategory: getTasksByCategory(tasks),
      tasksByDay: getTasksByDay(tasks, startDate),
      completionTrend: await getCompletionTrend(userId)
    };

    res.json(insight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const calculateStreak = async (userId) => {
  const tasks = await Task.find({ userId, status: 'completed' }).sort({ completedAt: -1 });
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const dayTasks = tasks.filter(t => {
      const d = new Date(t.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === currentDate.getTime();
    });
    if (dayTasks.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else break;
  }
  return streak;
};

const getTasksByCategory = (tasks) => {
  const categories = {};
  tasks.forEach(t => {
    if (!categories[t.category]) categories[t.category] = { total: 0, completed: 0 };
    categories[t.category].total++;
    if (t.status === 'completed') categories[t.category].completed++;
  });
  return categories;
};

const getTasksByDay = (tasks, startDate) => {
  const days = {};
  tasks.forEach(t => {
    const day = new Date(t.createdAt).toLocaleDateString();
    if (!days[day]) days[day] = { total: 0, completed: 0 };
    days[day].total++;
    if (t.status === 'completed') days[day].completed++;
  });
  return days;
};

const getCompletionTrend = async (userId) => {
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const start = new Date();
    start.setDate(start.getDate() - (i + 1) * 7);
    const end = new Date();
    end.setDate(end.getDate() - i * 7);

    const tasks = await Task.find({
      userId,
      createdAt: { $gte: start, $lt: end }
    });

    const completed = tasks.filter(t => t.status === 'completed').length;
    const rate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
    weeks.unshift({ week: `Week ${4 - i}`, rate: parseFloat(rate.toFixed(1)) });
  }
  return weeks;
};