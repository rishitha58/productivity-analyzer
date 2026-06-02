import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Target, Calendar, CheckCircle2, Circle, Award,
  Sparkles, AlertTriangle, Loader2, RefreshCw, TrendingUp,
  Map, Lightbulb, Star
} from "lucide-react";
import { getRoadmap, updatePhase, regenerateRoadmap, getProductivityStats } from "../services/aiService";

const GoalsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roadmapData, statsData] = await Promise.all([
        getRoadmap(),
        getProductivityStats(),
      ]);
      setData(roadmapData);
      setStats(statsData);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseChange = async (phaseName) => {
    try {
      await updatePhase(phaseName);
      await loadData();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate your roadmap? This will replace the current one.")) return;
    setRegenerating(true);
    try {
      await regenerateRoadmap();
      await loadData();
      alert("✅ New roadmap generated!");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-lavender-400 animate-spin" />
      </div>
    );
  }

  if (!data?.goal) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="bg-white border-b border-lavender-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-700 font-display">🎯 My Goals</h1>
          </div>
        </header>
        <div className="max-w-6xl mx-auto p-6">
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No goal set
            </h3>
            <p className="text-gray-500">
              Set a goal during onboarding to see your roadmap
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">🎯 My Goal</h1>
              <p className="text-xs text-gray-400">{data.duration}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-icon"
            title="Regenerate roadmap"
          >
            {regenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* 🎯 GOAL BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-3xl p-8 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <Target className="w-12 h-12 mx-auto mb-3 relative z-10" />
          <p className="text-xs uppercase tracking-wider mb-2 opacity-80 relative z-10">
            Long-term Goal
          </p>
          <h2 className="text-2xl font-bold font-display mb-3 relative z-10">
            {data.goal}
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm relative z-10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{data.duration}</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{stats?.overall?.goalProgress || 0}% progress</span>
            </div>
          </div>
        </motion.div>

        {/* 📊 GOAL PROGRESS */}
        {stats?.overall?.goalAlignedTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-base font-bold text-gray-700 font-display mb-4">
               Your Progress
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Goal-aligned tasks</span>
                  <span className="text-sm font-bold text-gray-700">
                    {stats.overall.goalAlignedCompleted} / {stats.overall.goalAlignedTasks}
                  </span>
                </div>
                <div className="w-full h-3 bg-lavender-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.overall.goalProgress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.overall.goalProgress}% of goal-related tasks completed
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🗺️ ROADMAP PHASES */}
        {data.roadmap?.phases && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center">
                <Map className="w-5 h-5 text-mint-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 font-display">
                Your Roadmap
              </h3>
            </div>

            {data.roadmap.phases.map((phase, i) => {
              const isCurrent = phase.name === data.currentPhase;
              const isExpanded = expandedPhase === i;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card cursor-pointer transition-all ${
                    isCurrent ? "border-2 border-lavender-300 bg-lavender-50" : ""
                  }`}
                  onClick={() => setExpandedPhase(isExpanded ? null : i)}
                >
                  <div className="flex items-start gap-4">
                    {/* Phase number */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isCurrent
                        ? "bg-gradient-primary text-white shadow-soft"
                        : "bg-lavender-100 text-lavender-500"
                    }`}>
                      {i + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-base font-bold text-gray-700 font-display">
                            {phase.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {phase.duration}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="badge bg-lavender-300 text-white flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        🎯 <strong>Focus:</strong> {phase.focus}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {/* Milestones */}
                            <div className="mt-4">
                              <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">
                                🏆 Milestones
                              </h5>
                              <ul className="space-y-2">
                                {phase.milestones?.map((m, mi) => (
                                  <li key={mi} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-mint-500 mt-0.5 flex-shrink-0" />
                                    {m}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Daily Habits */}
                            {phase.dailyHabits?.length > 0 && (
                              <div className="mt-4 p-4 bg-babyBlue-50 rounded-2xl">
                                <h5 className="text-xs font-bold text-babyBlue-500 uppercase mb-2">
                                  🔄 Daily Habits
                                </h5>
                                <ul className="space-y-1">
                                  {phase.dailyHabits.map((h, hi) => (
                                    <li key={hi} className="text-sm text-gray-700">
                                      • {h}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Mark as current */}
                            {!isCurrent && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePhaseChange(phase.name);
                                }}
                                className="mt-4 px-4 py-2 bg-lavender-300 text-white text-xs font-semibold rounded-xl shadow-soft"
                              >
                                Set as Current Phase
                              </motion.button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ⚡ CRITICAL SUCCESS FACTORS */}
        {data.roadmap?.criticalSuccess?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-ocean"
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-babyBlue-500" />
              <h3 className="text-base font-bold text-gray-700 font-display">
                Critical Success Factors
              </h3>
            </div>
            <ul className="space-y-2">
              {data.roadmap.criticalSuccess.map((cs, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-babyBlue-500 mt-0.5 flex-shrink-0" />
                  {cs}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ⚠️ WARNING SIGN */}
        {data.roadmap?.warningSign && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-peach-50 border-2 border-peach-200"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-peach-500 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  ⚠️ Watch Out For
                </h3>
                <p className="text-sm text-gray-700">
                  {data.roadmap.warningSign}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default GoalsPage;