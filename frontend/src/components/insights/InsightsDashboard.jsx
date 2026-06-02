import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  Sparkles,
  Brain,
} from 'lucide-react';
import {
  ProductivityLineChart,
  FocusTimeChart,
  CategoryBarChart,
  CategoryPieChart,
  ProductivityScoreChart,
} from './ProductivityChart';
import HabitDriftCard from './HabitDriftCard';

const InsightsDashboard = () => {
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'year'
  const [stats, setStats] = useState({
    totalTasks: 89,
    completedTasks: 67,
    avgFocusHours: 3.2,
    streak: 12,
    productivityScore: 75,
    goalsProgress: 4,
  });

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  const completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">
            📊 Insights & Analytics
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Track your productivity trends and patterns
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center bg-white rounded-2xl p-1 shadow-soft border border-lavender-100">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                period === p.id
                  ? 'bg-gradient-to-r from-lavender-300 to-babyBlue-300 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completedTasks}
          subtext={`of ${stats.totalTasks}`}
          color="mint"
          delay={0}
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${completionRate}%`}
          subtext="this week"
          color="babyBlue"
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          label="Focus Time"
          value={`${stats.avgFocusHours}h`}
          subtext="daily avg"
          color="lavender"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          label="Streak"
          value={stats.streak}
          subtext="days"
          color="peach"
          delay={0.3}
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={stats.goalsProgress}
          subtext="in progress"
          color="yellow"
          delay={0.4}
        />
        <StatCard
          icon={Sparkles}
          label="Score"
          value={stats.productivityScore}
          subtext="out of 100"
          color="blush"
          delay={0.5}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Productivity Line Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <ProductivityLineChart />
        </div>

        {/* Productivity Score */}
        <div className="lg:col-span-1">
          <ProductivityScoreChart score={stats.productivityScore} />
        </div>
      </div>

      {/* Focus + Categories Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <FocusTimeChart />
        <CategoryBarChart />
      </div>

      {/* Pie Chart + Habit Drift */}
      <div className="grid lg:grid-cols-2 gap-5">
        <CategoryPieChart />
        <HabitDriftCard />
      </div>

      {/* Best Performance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lavender-200 via-peach-200 to-mint-200 p-6 md:p-8"
      >
        {/* Decorative orbs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />

        <div className="relative grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="text-lavender-600" size={20} />
              <p className="text-xs font-bold text-lavender-600 uppercase tracking-widest">
                AI Insight
              </p>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">
              You're most productive on Thursdays 🌟
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your average completion rate is <strong>89% on Thursdays</strong>, with peak focus time
              between <strong>9 AM - 12 PM</strong>. Try scheduling your most important tasks during these
              hours for maximum impact!
            </p>
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-7xl md:text-8xl"
            >
              🎯
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============ STAT CARD COMPONENT ============
const StatCard = ({ icon: Icon, label, value, subtext, color, delay = 0 }) => {
  const colorMap = {
    mint: { gradient: 'from-mint-300 to-softGreen-300', bg: 'bg-mint-50' },
    babyBlue: { gradient: 'from-babyBlue-300 to-lavender-300', bg: 'bg-babyBlue-50' },
    lavender: { gradient: 'from-lavender-300 to-babyBlue-300', bg: 'bg-lavender-50' },
    peach: { gradient: 'from-peach-300 to-blush-300', bg: 'bg-peach-50' },
    yellow: { gradient: 'from-yellow-300 to-peach-300', bg: 'bg-yellow-50' },
    blush: { gradient: 'from-blush-300 to-peach-300', bg: 'bg-blush-50' },
  };

  const colorStyle = colorMap[color] || colorMap.lavender;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`${colorStyle.bg} rounded-2xl p-4 shadow-soft border border-white/40 cursor-pointer`}
    >
      <div
        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorStyle.gradient} flex items-center justify-center mb-2 shadow-soft`}
      >
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-xs text-gray-500 mb-0.5 font-medium">{label}</p>
      <p className="text-xl font-display font-bold text-gray-800">{value}</p>
      {subtext && <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>}
    </motion.div>
  );
};

export default InsightsDashboard;