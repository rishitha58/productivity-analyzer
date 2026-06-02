import { motion } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Target,
  Coffee,
  Moon,
  Clock,
} from 'lucide-react';

const HabitDriftCard = ({ data }) => {
  // Default mock data
  const driftData = data || {
    currentWeekAvg: 65,
    lastWeekAvg: 82,
    drift: -17,
    insights: [
      {
        icon: Clock,
        type: 'warning',
        title: 'Late Start Times',
        description: 'You started 45 mins later this week on average',
      },
      {
        icon: Moon,
        type: 'info',
        title: 'Sleep Pattern',
        description: 'Average sleep dropped by 1.2 hours',
      },
      {
        icon: Coffee,
        type: 'tip',
        title: 'Take More Breaks',
        description: 'You skipped breaks 60% of the time',
      },
    ],
    suggestions: [
      'Try waking up 30 minutes earlier',
      'Schedule short breaks every hour',
      'Aim for at least 7 hours of sleep',
    ],
  };

  const isImproving = driftData.drift >= 0;
  const absChange = Math.abs(driftData.drift);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-soft border border-lavender-100 overflow-hidden"
    >
      {/* Header with gradient */}
      <div
        className={`p-5 md:p-6 ${
          isImproving
            ? 'bg-gradient-to-br from-mint-100 via-softGreen-100 to-babyBlue-100'
            : 'bg-gradient-to-br from-peach-100 via-blush-100 to-yellow-100'
        }`}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft ${
                isImproving
                  ? 'bg-gradient-to-br from-mint-300 to-softGreen-300'
                  : 'bg-gradient-to-br from-peach-300 to-blush-300'
              }`}
            >
              {isImproving ? (
                <TrendingUp className="text-white" size={22} />
              ) : (
                <TrendingDown className="text-white" size={22} />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-800">
                Habit Drift Detection
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {isImproving ? "📈 You're improving!" : '📉 Performance drop detected'}
              </p>
            </div>
          </div>

          {/* Change badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-sm ${
              isImproving
                ? 'bg-mint-200 text-mint-600'
                : 'bg-blush-200 text-blush-600'
            }`}
          >
            {isImproving ? '+' : ''}
            {driftData.drift}%
          </motion.div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-xs text-gray-500 mb-1">Last Week</p>
            <p className="text-2xl font-display font-bold text-gray-800">
              {driftData.lastWeekAvg}%
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-xs text-gray-500 mb-1">This Week</p>
            <p
              className={`text-2xl font-display font-bold ${
                isImproving ? 'text-mint-500' : 'text-blush-500'
              }`}
            >
              {driftData.currentWeekAvg}%
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6 space-y-5">
        {/* Insights */}
        {driftData.insights && driftData.insights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-yellow-500" />
              Key Observations
            </h4>
            <div className="space-y-2">
              {driftData.insights.map((insight, idx) => {
                const typeStyles = {
                  warning: {
                    bg: 'bg-blush-50',
                    border: 'border-blush-200',
                    iconBg: 'bg-blush-100',
                    iconColor: 'text-blush-500',
                  },
                  info: {
                    bg: 'bg-babyBlue-50',
                    border: 'border-babyBlue-200',
                    iconBg: 'bg-babyBlue-100',
                    iconColor: 'text-babyBlue-500',
                  },
                  tip: {
                    bg: 'bg-mint-50',
                    border: 'border-mint-200',
                    iconBg: 'bg-mint-100',
                    iconColor: 'text-mint-500',
                  },
                };
                const style = typeStyles[insight.type] || typeStyles.info;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${style.bg} border ${style.border}`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <insight.icon size={16} className={style.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {insight.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {driftData.suggestions && driftData.suggestions.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-lavender-50 to-babyBlue-50 border border-lavender-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-lavender-500" />
              Suggestions to Get Back on Track
            </h4>
            <ul className="space-y-2">
              {driftData.suggestions.map((suggestion, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <Target size={14} className="text-lavender-400 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HabitDriftCard;