import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, Target, Flame, CheckCircle2,
  Calendar, BarChart3, Loader2, Sparkles, Trophy, Star,
  Award, Zap
} from "lucide-react";
import { getProductivityStats } from "../services/aiService";

const InsightsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getProductivityStats();
      console.log("📊 Stats:", data);
      setStats(data);
    } catch (e) {
      console.error("Stats failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Smart motivation based on data
  const getMotivation = () => {
    if (!stats) return { msg: "Loading...", emoji: "✨" };
    
    const rate = stats.overall?.completionRate || 0;
    const goalProgress = stats.overall?.goalProgress || 0;
    const streak = stats.overall?.streak || 0;
    const userName = user.name || "Friend";

    if (streak >= 7) return { 
      msg: `🔥 ${userName}, you're on a ${streak}-day streak! You're unstoppable!`, 
      emoji: "🔥" 
    };
    if (goalProgress >= 80) return { 
      msg: `🎯 Amazing! You're ${goalProgress}% on track with your goal!`, 
      emoji: "🎯" 
    };
    if (rate >= 80) return { 
      msg: `⭐ Outstanding ${userName}! ${rate}% completion rate!`, 
      emoji: "⭐" 
    };
    if (rate >= 60) return { 
      msg: `💪 Great work! Keep pushing forward!`, 
      emoji: "💪" 
    };
    if (rate >= 40) return { 
      msg: `🌱 Good progress! Consistency builds success.`, 
      emoji: "🌱" 
    };
    return { 
      msg: `🌸 Every journey begins with a single step. You got this!`, 
      emoji: "🌸" 
    };
  };

  const motivation = getMotivation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-lavender-400 animate-spin" />
      </div>
    );
  }

  // Empty state
  if (!stats || stats.overall?.totalDays === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="bg-white border-b border-lavender-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-700 font-display">
              📊 Productivity Insights
            </h1>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No data yet
            </h3>
            <p className="text-gray-500 mb-6">
              Complete tasks daily to see your productivity insights!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/journal")}
              className="btn-primary"
            >
              Write Your First Journal →
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-700 font-display">
              📊 Productivity Insights
            </h1>
            <p className="text-xs text-gray-400">
              {stats.overall.totalDays} days tracked
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* 🎯 MOTIVATION BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-3xl p-8 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-6xl mb-3 relative z-10"
          >
            {motivation.emoji}
          </motion.div>
          <h2 className="text-2xl font-bold font-display mb-3 relative z-10">
            {motivation.msg}
          </h2>
          {user.goal && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full relative z-10">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">🎯 {user.goal}</span>
            </div>
          )}
        </motion.div>

        {/* 📊 STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Days Active", 
              value: stats.overall.totalDays, 
              icon: Calendar, 
              bg: "bg-lavender-100", 
              iconBg: "bg-lavender-300", 
              text: "text-lavender-500",
              subtitle: "Journals written"
            },
            { 
              label: "Completion Rate", 
              value: `${stats.overall.completionRate}%`, 
              icon: TrendingUp, 
              bg: "bg-mint-100", 
              iconBg: "bg-mint-300", 
              text: "text-mint-500",
              subtitle: `${stats.overall.completedTasks}/${stats.overall.totalTasks} tasks`
            },
            { 
              label: "Goal Progress", 
              value: `${stats.overall.goalProgress}%`, 
              icon: Target, 
              bg: "bg-babyBlue-100", 
              iconBg: "bg-babyBlue-300", 
              text: "text-babyBlue-500",
              subtitle: `${stats.overall.goalAlignedCompleted}/${stats.overall.goalAlignedTasks} goal tasks`
            },
            { 
              label: "Current Streak", 
              value: `${stats.overall.streak}`, 
              icon: Flame, 
              bg: "bg-peach-100", 
              iconBg: "bg-peach-300", 
              text: "text-peach-500",
              subtitle: "days in a row"
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`${stat.bg} rounded-3xl p-5 shadow-soft`}
            >
              <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center mb-3 shadow-soft`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl font-bold ${stat.text} font-display`}>
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {stat.subtitle}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 📈 DAILY CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-lavender-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-700 font-display">
                  Daily Completion (Last 14 Days)
                </h3>
                <p className="text-xs text-gray-400">
                  Weekly average: <span className="font-bold text-lavender-500">{stats.overall.weeklyAvg}%</span>
                </p>
              </div>
            </div>
          </div>

          {stats.dailyData?.length > 0 ? (
            <>
              <div className="flex items-end gap-2 h-48 px-2">
                {stats.dailyData.slice(0, 14).reverse().map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Bar */}
                    <div className="w-full flex flex-col items-center relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs px-2 py-1 rounded transition-opacity">
                        {day.completionRate}%
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(day.completionRate * 1.5, 4)}px` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className={`w-full rounded-t-lg ${
                          day.completionRate >= 80
                            ? "bg-mint-300"
                            : day.completionRate >= 50
                            ? "bg-lavender-300"
                            : day.completionRate > 0
                            ? "bg-peach-300"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                    {/* Day label */}
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(day.date).toLocaleDateString("en", { weekday: "narrow" })}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-lavender-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-mint-300 rounded" />
                  <span className="text-xs text-gray-500">80%+</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-lavender-300 rounded" />
                  <span className="text-xs text-gray-500">50-79%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-peach-300 rounded" />
                  <span className="text-xs text-gray-500">1-49%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded" />
                  <span className="text-xs text-gray-500">0%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Complete tasks to see your chart!
            </div>
          )}
        </motion.div>

        {/* 📂 CATEGORY BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-peach-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-peach-500" />
            </div>
            <h3 className="text-base font-bold text-gray-700 font-display">
              Category Performance
            </h3>
          </div>

          {stats.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.categoryBreakdown).map(([cat, data]) => {
                const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                const colors = {
                  study: { bg: "bg-lavender-300", light: "bg-lavender-50", text: "text-lavender-500" },
                  work: { bg: "bg-babyBlue-300", light: "bg-babyBlue-50", text: "text-babyBlue-500" },
                  personal: { bg: "bg-peach-300", light: "bg-peach-50", text: "text-peach-500" },
                  health: { bg: "bg-mint-300", light: "bg-mint-50", text: "text-mint-500" },
                  travel: { bg: "bg-blush-300", light: "bg-blush-50", text: "text-blush-500" },
                };
                const c = colors[cat] || colors.study;
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-bold ${c.text} capitalize`}>
                        {cat}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {data.completed}/{data.total} ({rate}%)
                      </span>
                    </div>
                    <div className={`w-full h-3 ${c.light} rounded-full overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${c.bg}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">No data yet</p>
          )}
        </motion.div>

        {/* 🏆 BEST DAY */}
        {stats.overall.bestDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card bg-gradient-sunset text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-3 text-peach-500" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-1">
              🏆 Your Best Day
            </h3>
            <p className="text-lg font-bold text-gray-700">
              {new Date(stats.overall.bestDay).toLocaleDateString("en", { 
                weekday: "long", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {stats.overall.bestRate}% completion — Keep raising the bar!
            </p>
          </motion.div>
        )}

        {/* 💡 INSIGHTS BLOCK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-mint-500" />
            </div>
            <h3 className="text-base font-bold text-gray-700 font-display">
              💡 Quick Insights
            </h3>
          </div>

          <div className="space-y-3">
            {stats.overall.streak > 0 && (
              <div className="flex items-start gap-3 p-3 bg-peach-50 rounded-xl">
                <span className="text-xl">🔥</span>
                <p className="text-sm text-gray-700">
                  You're on a <strong>{stats.overall.streak}-day streak</strong>! 
                  {stats.overall.streak >= 7 && " That's amazing consistency!"}
                </p>
              </div>
            )}
            
            {stats.overall.goalProgress > 0 && (
              <div className="flex items-start gap-3 p-3 bg-babyBlue-50 rounded-xl">
                <span className="text-xl">🎯</span>
                <p className="text-sm text-gray-700">
                  You've completed <strong>{stats.overall.goalAlignedCompleted} goal-aligned tasks</strong> 
                  {" "}({stats.overall.goalProgress}% of total goal tasks).
                </p>
              </div>
            )}

            {stats.overall.completionRate >= 70 && (
              <div className="flex items-start gap-3 p-3 bg-mint-50 rounded-xl">
                <span className="text-xl">⭐</span>
                <p className="text-sm text-gray-700">
                  Excellent <strong>{stats.overall.completionRate}% completion rate</strong>! 
                  Top performers are at this level.
                </p>
              </div>
            )}

            {stats.overall.weeklyAvg > 0 && (
              <div className="flex items-start gap-3 p-3 bg-lavender-50 rounded-xl">
                <span className="text-xl">📈</span>
                <p className="text-sm text-gray-700">
                  Your <strong>weekly average is {stats.overall.weeklyAvg}%</strong>. 
                  {stats.overall.weeklyAvg > stats.overall.completionRate ? " You're improving!" : " Keep pushing!"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  );
};

export default InsightsPage;