import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, CheckCircle2, Circle, Clock, MapPin,
  Target, Loader2, ChevronDown, ChevronUp, AlertCircle,
  Check, Plus, X, Ban, Sparkles
} from "lucide-react";
import { 
  getTaskHistory, 
  getUndoneTasks, 
  carryForwardTasks,
  markPastTaskDone,
  skipPastTask
} from "../services/aiService";

const TaskHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [undoneTasks, setUndoneTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);
  const [processingTaskId, setProcessingTaskId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [histData, undoneData] = await Promise.all([
        getTaskHistory(),
        getUndoneTasks(),
      ]);
      setHistory(Array.isArray(histData) ? histData : []);
      setUndoneTasks(Array.isArray(undoneData) ? undoneData : []);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Mark task as done retrospectively
  const handleMarkDone = async (task) => {
    setProcessingTaskId(task._id?.toString());
    try {
      await markPastTaskDone(task.originalDate, task._id);
      await loadData();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setProcessingTaskId(null);
    }
  };

  // ⭐ Add to today
  const handleAddToday = async (task) => {
    setProcessingTaskId(task._id?.toString());
    try {
      await carryForwardTasks([task]);
      await loadData();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setProcessingTaskId(null);
    }
  };

  // ⭐ Skip task
  const handleSkip = async (task) => {
    if (!confirm(`Skip "${task.title}"? It will be removed from your to-do list.`)) {
      return;
    }
    setProcessingTaskId(task._id?.toString());
    try {
      await skipPastTask(task.originalDate, task._id);
      await loadData();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setProcessingTaskId(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return date.toLocaleDateString("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const categoryColors = {
    study: "bg-lavender-100 text-lavender-500",
    work: "bg-babyBlue-100 text-babyBlue-500",
    personal: "bg-peach-100 text-peach-500",
    health: "bg-mint-100 text-mint-500",
    travel: "bg-blush-100 text-blush-500",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-lavender-400 animate-spin" />
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
            <h1 className="text-lg font-bold text-gray-700 font-display">📅 Task History</h1>
            <p className="text-xs text-gray-400">{history.length} days tracked</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* ⭐ UNDONE TASKS BANNER (with 3 options each) */}
        {undoneTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-peach-50 border-2 border-peach-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-peach-500" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">
                  ⚠️ {undoneTasks.length} unfinished task{undoneTasks.length > 1 ? "s" : ""} from previous days
                </p>
                <p className="text-xs text-gray-500">
                  What would you like to do with each task?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {undoneTasks.map((task) => {
                const isProcessing = processingTaskId === task._id?.toString();
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-4 border border-peach-200"
                  >
                    {/* Task Info */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-700">
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            📅 From {formatDate(task.originalDate)} • {task.daysOld} day{task.daysOld > 1 ? "s" : ""} ago
                          </p>
                          {task.category && (
                            <span className={`badge text-xs ${categoryColors[task.category]}`}>
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ⭐ 3 ACTION BUTTONS */}
                    {isProcessing ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-5 h-5 text-lavender-400 animate-spin" />
                        <span className="ml-2 text-xs text-gray-500">Updating...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {/* I DID IT */}
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleMarkDone(task)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-mint-100 hover:bg-mint-200 text-mint-600 transition-all"
                          title="I actually did this task"
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-semibold">I Did It</span>
                        </motion.button>

                        {/* ADD TODAY */}
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAddToday(task)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-lavender-100 hover:bg-lavender-200 text-lavender-600 transition-all"
                          title="Carry forward to today"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-semibold">Add Today</span>
                        </motion.button>

                        {/* SKIP */}
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSkip(task)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                          title="I won't do this task"
                        >
                          <Ban className="w-4 h-4" />
                          <span className="text-xs font-semibold">Skip</span>
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 p-3 bg-white/60 rounded-xl">
              <p className="text-xs text-gray-600 leading-relaxed">
                💡 <strong>I Did It:</strong> Mark as completed (forgot to check off) •
                <strong className="ml-1">Add Today:</strong> Move to today's list •
                <strong className="ml-1">Skip:</strong> Won't do it
              </p>
            </div>
          </motion.div>
        )}

        {/* ⭐ EMPTY STATE: All caught up! */}
        {undoneTasks.length === 0 && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-r from-mint-50 to-lavender-50 border-2 border-mint-200 text-center py-6"
          >
            <Sparkles className="w-10 h-10 mx-auto text-mint-500 mb-2" />
            <p className="text-sm font-bold text-gray-700">All caught up! 🎉</p>
            <p className="text-xs text-gray-500 mt-1">
              No unfinished tasks from previous days
            </p>
          </motion.div>
        )}

        {/* History by Date */}
        {history.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-lavender-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No history yet
            </h3>
            <p className="text-gray-500">
              Complete tasks daily to build your history!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((day, i) => {
              const isExpanded = expandedDate === day.date;
              const skippedCount = day.tasks.filter(t => t.skipped).length;
              const lateCount = day.tasks.filter(t => t.completedLate).length;
              
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                >
                  <button
                    onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        day.completedTasks === day.totalTasks && day.totalTasks > 0
                          ? "bg-mint-100"
                          : "bg-lavender-100"
                      }`}>
                        <Calendar className={`w-5 h-5 ${
                          day.completedTasks === day.totalTasks && day.totalTasks > 0
                            ? "text-mint-500"
                            : "text-lavender-500"
                        }`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-700">
                          {formatDate(day.date)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {day.completedTasks}/{day.totalTasks} tasks completed
                          {lateCount > 0 && ` • ${lateCount} completed late`}
                          {skippedCount > 0 && ` • ${skippedCount} skipped`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-2 bg-lavender-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            day.totalTasks > 0 && day.completedTasks === day.totalTasks
                              ? "bg-mint-300"
                              : "bg-lavender-300"
                          }`}
                          style={{
                            width: `${day.totalTasks > 0
                              ? (day.completedTasks / day.totalTasks) * 100
                              : 0}%`,
                          }}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-lavender-100 space-y-2">
                          {day.tasks.map((task, ti) => {
                            // ⭐ Determine task status & styling
                            let bgColor = "bg-cream";
                            let textColor = "text-gray-700";
                            let icon = <Circle className="w-5 h-5 text-gray-300 mt-0.5" />;
                            let statusBadge = null;

                            if (task.skipped) {
                              bgColor = "bg-gray-100 opacity-70";
                              textColor = "text-gray-500 line-through";
                              icon = <Ban className="w-5 h-5 text-gray-400 mt-0.5" />;
                              statusBadge = (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                  ⊘ Skipped
                                </span>
                              );
                            } else if (task.done) {
                              if (task.completedLate) {
                                bgColor = "bg-babyBlue-50";
                                textColor = "line-through text-gray-500";
                                icon = <CheckCircle2 className="w-5 h-5 text-babyBlue-500 mt-0.5" />;
                                statusBadge = (
                                  <span className="text-xs bg-babyBlue-100 text-babyBlue-600 px-2 py-0.5 rounded-full">
                                    ⏰ Completed late
                                  </span>
                                );
                              } else {
                                bgColor = "bg-mint-50 opacity-80";
                                textColor = "line-through text-gray-400";
                                icon = <CheckCircle2 className="w-5 h-5 text-mint-500 mt-0.5" />;
                              }
                            } else if (task.carriedForward) {
                              bgColor = "bg-peach-50";
                              statusBadge = (
                                <span className="text-xs bg-peach-100 text-peach-600 px-2 py-0.5 rounded-full">
                                  📌 Carried forward
                                </span>
                              );
                            }

                            return (
                              <div
                                key={task._id || ti}
                                className={`flex items-start gap-3 p-3 rounded-xl ${bgColor}`}
                              >
                                {icon}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm ${textColor}`}>
                                      {task.title}
                                    </p>
                                    {statusBadge}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {task.category && (
                                      <span className={`badge text-xs ${categoryColors[task.category]}`}>
                                        {task.category}
                                      </span>
                                    )}
                                    {task.time && (
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {task.time}
                                      </span>
                                    )}
                                    {task.goalAligned && (
                                      <span className="text-xs text-mint-500">🎯 Goal</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TaskHistoryPage;