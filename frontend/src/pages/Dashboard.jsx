import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Target, BookOpen, Flame, Plus, LogOut,
  TrendingUp, Calendar, Sparkles, Clock, MapPin, UtensilsCrossed,
  StickyNote, AlertCircle, FileText, Brain, Moon, Lightbulb,
  Navigation, ChevronRight, Loader2, MessageCircle,
} from "lucide-react";
import { getTodayJournal, toggleTaskDone, getCurrentUser } from "../services/aiService";
import NotificationBell from "../components/NotificationBell";
import { useStudyMode } from "../context/StudyModeContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("tasks");
  const [user, setUser] = useState({});
  const [tasks, setTasks] = useState([]);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(localUser);

      try {
        const freshUser = await getCurrentUser();
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch (e) {
        console.log("Using cached user");
      }

      const todayData = await getTodayJournal();
      console.log("📋 Today's data:", todayData);
      setTasks(todayData.tasks || []);
      setMotivation(todayData.motivation || "");
    } catch (err) {
      console.error("❌ Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  const { currentTask, exitStudyMode } = useStudyMode();

 const handleToggleTask = async (taskId) => {
  // ⭐ Check if completing the studied task
  const taskBeforeToggle = tasks.find((t) => t._id === taskId);
  const wasCurrentlyStudying = currentTask && (
    String(currentTask._id) === String(taskId) || 
    String(currentTask.id) === String(taskId)
  );
  
  await toggleTaskDone(taskId);
  
  // If we just marked the studied task as DONE → exit focus mode
  if (wasCurrentlyStudying && taskBeforeToggle && !taskBeforeToggle.done) {
    console.log("✅ Studied task completed - exiting focus mode");
    exitStudyMode();
  }
  
  await loadData();  // ✅ FIXED: use loadData (not loadTasks)
};

  const userName = user.name || "Friend";
  const userInitial = userName.charAt(0).toUpperCase();
  const userGoal = user.goal || null;

  const completedCount = tasks.filter((t) => t?.done).length;
  const totalCount = tasks.length;
  const goalAlignedCount = tasks.filter((t) => t?.goalAligned).length;
  const travelTasks = tasks.filter((t) => t?.location || t?.category === "travel");

  const sleepSchedule = user.sleepSchedule || null;

  const stats = [
    { 
      label: "Tasks Today", 
      value: totalCount.toString(), 
      icon: CheckCircle2, 
      bg: "bg-lavender-100", 
      iconBg: "bg-lavender-300", 
      text: "text-lavender-500" 
    },
    { 
      label: "Completed", 
      value: completedCount.toString(), 
      icon: Target, 
      bg: "bg-mint-100", 
      iconBg: "bg-mint-300", 
      text: "text-mint-500" 
    },
    { 
      label: "Goal Tasks", 
      value: goalAlignedCount.toString(), 
      icon: TrendingUp, 
      bg: "bg-babyBlue-100", 
      iconBg: "bg-babyBlue-300", 
      text: "text-babyBlue-500" 
    },
    { 
      label: "Streak", 
      value: `${user.streak || 1} day`, 
      icon: Flame, 
      bg: "bg-peach-100", 
      iconBg: "bg-peach-300", 
      text: "text-peach-500" 
    },
  ];

  const priorityColors = {
    high: "bg-blush-100 text-blush-500",
    medium: "bg-peach-100 text-peach-500",
    low: "bg-mint-100 text-mint-500",
  };

  const categoryColors = {
    study: "bg-lavender-100 text-lavender-500",
    work: "bg-babyBlue-100 text-babyBlue-500",
    personal: "bg-peach-100 text-peach-500",
    health: "bg-mint-100 text-mint-500",
    travel: "bg-blush-100 text-blush-500",
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    if (hour < 21) return "Good Evening 🌇";
    return "Good Night 🌙";
  };

  // ✅ SIDEBAR SECTIONS — All features
  const sidebarSections = [
    { id: "tasks", label: "Tasks", icon: CheckCircle2, route: null },
    { id: "travel-quick", label: " Travel", icon: Navigation, route: "/travel" },
    { id: "insights", label: " Insights", icon: TrendingUp, route: "/insights" },
    { id: "goals", label: " My Goal", icon: Target, route: "/goals" },
    { id: "history", label: " History", icon: Calendar, route: "/history" },
    { id: "notes", label: " Notes", icon: StickyNote, route: "/notes" },
    { id: "important", label: " Key Points", icon: Lightbulb, route: "/important" },
    { id: "mocktests", label: " Mock Tests", icon: FileText, route: "/mocktests" },
    { id: "mistakes", label: " Mistakes", icon: AlertCircle, route: "/mistakes" },
    { id: "ai-chat", label: " AI Chat", icon: MessageCircle, route: "/ai" },
  ];

  const handleSidebarClick = (section) => {
    if (section.route) {
      navigate(section.route);
    } else {
      setActiveSection(section.id);
    }
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

      {/* ═══════ TOP BAR ═══════ */}
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">
                Productivity Analyzer
              </h1>
              <p className="text-xs text-gray-400">Your journey to focus</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="avatar-md">{userInitial}</div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              onClick={handleLogout} 
              className="btn-icon"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ═══════ WELCOME BANNER ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-dreamy rounded-3xl p-8 shadow-soft relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              {getGreeting()}
            </p>
            <h2 className="text-3xl font-bold text-gray-700 font-display mb-2">
              Welcome back, {userName}! 🌸
            </h2>
            <p className="text-sm text-gray-600 max-w-md">
              {totalCount === 0
                ? "No tasks today. Write your journal!"
                : `${totalCount} tasks today. ${completedCount} completed.`}
            </p>
            {userGoal && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full">
                <Target className="w-4 h-4 text-lavender-500" />
                <span className="text-xs font-semibold text-lavender-500">🎯 {userGoal}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════ STATS GRID ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`${stat.bg} rounded-3xl p-5 shadow-soft`}
            >
              <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center mb-3 shadow-soft`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-2xl font-bold ${stat.text} font-display`}>{stat.value}</div>
              <div className="text-xs text-gray-600 mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ═══════ MAIN LAYOUT: Sidebar + Content ═══════ */}
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ─── SIDEBAR ─── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-1"
          >
            <div className="card sticky top-24">
              <h3 className="text-sm font-bold text-gray-700 font-display mb-4 px-2">
                Quick Access
              </h3>
              <div className="space-y-1">
                {sidebarSections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSidebarClick(section)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeSection === section.id && !section.route
                        ? "bg-lavender-100 text-lavender-500"
                        : "text-gray-600 hover:bg-lavender-50"
                    }`}
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left text-xs">{section.label}</span>
                    {section.route && <ChevronRight className="w-3 h-3 text-gray-400" />}
                  </motion.button>
                ))}
              </div>

              {/* Sleep Schedule Card */}
              {sleepSchedule && (
                <div className="mt-6 p-4 bg-gradient-ocean rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-4 h-4 text-gray-700" />
                    <span className="text-xs font-bold text-gray-700">Sleep Schedule</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    🌙 {sleepSchedule.sleepTime} → ☀️ {sleepSchedule.wakeTime}
                  </p>
                  {sleepSchedule.hours && (
                    <p className="text-xs text-gray-500 mt-1">
                      {sleepSchedule.hours}h sleep
                    </p>
                  )}
                </div>
              )}

              {/* AI Notification Settings Link */}
              <button
                onClick={() => navigate("/notifications")}
                className="mt-3 w-full p-3 bg-cream rounded-xl text-xs text-gray-500 hover:bg-lavender-50 flex items-center gap-2"
              >
                <AlertCircle className="w-3 h-3" />
                Notification Settings
              </button>
            </div>
          </motion.div>

          {/* ─── CONTENT AREA ─── */}
          <div className="lg:col-span-3 space-y-6">

            {/* AI Motivation Banner */}
            {motivation && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-gradient-primary rounded-3xl p-5 text-white"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{motivation}</p>
                </div>
              </motion.div>
            )}

            {/* ═══ TASKS SECTION ═══ */}
            {activeSection === "tasks" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="card"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-lavender-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-lavender-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-700 font-display">
                        Today's Tasks
                      </h3>
                      <p className="text-xs text-gray-400">
                        {totalCount - completedCount} pending of {totalCount}
                      </p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    onClick={() => navigate("/journal")} 
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </motion.button>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📝</div>
                    <p className="text-gray-500 mb-4">No tasks for today yet</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      onClick={() => navigate("/journal")} 
                      className="btn-primary"
                    >
                      Write Journal →
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task, i) => (
                      <motion.div
                        key={task._id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-2xl border-2 ${
                          task.done 
                            ? "bg-mint-50 border-mint-200 opacity-60" 
                            : task.goalAligned 
                            ? "bg-mint-50 border-mint-200" 
                            : task.category === "travel" || task.location
                            ? "bg-blush-50 border-blush-200"
                            : "bg-cream border-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleTask(task._id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              task.done 
                                ? "bg-mint-300 border-mint-300" 
                                : "border-lavender-200"
                            }`}
                          >
                            {task.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </motion.button>

                          <div className="flex-1">
                            {/* Title + Badges */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className={`text-sm font-medium ${
                                task.done ? "line-through text-gray-400" : "text-gray-700"
                              }`}>
                                {task.title}
                              </p>
                              <div className="flex gap-1 flex-shrink-0">
                                {task.goalAligned && (
                                  <span className="badge bg-mint-200 text-mint-500 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> Goal
                                  </span>
                                )}
                                {(task.category === "travel" || task.location) && (
                                  <span className="badge bg-blush-200 text-blush-500 flex items-center gap-1">
                                    <Navigation className="w-3 h-3" /> Travel
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Meta Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {task.category && (
                                <span className={`badge ${categoryColors[task.category]}`}>
                                  {task.category}
                                </span>
                              )}
                              {task.priority && (
                                <span className={`badge ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                              )}
                              {task.time && (
                                <span className="badge bg-babyBlue-100 text-babyBlue-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {task.time}
                                </span>
                              )}
                              {task.location && (
                                <span className="badge bg-peach-100 text-peach-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {task.location}
                                </span>
                              )}
                              {task.estimatedDuration && (
                                <span className="text-xs text-gray-400">
                                  ⏱ {task.estimatedDuration}
                                </span>
                              )}
                            </div>

                            {/* 🧠 FOCUS MODE BUTTON (for study tasks) */}
                            {task.category === "study" && !task.done && (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/focus/${task._id || task.id}`);
                                }}
                                className="mt-2 px-4 py-2 bg-gradient-primary text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-soft hover:shadow-medium transition-all"
                              >
                                <Brain className="w-4 h-4" />
                                Enter Focus Mode →
                              </motion.button>
                            )}

                            {/* 🗺️ TRAVEL REMINDER BUTTON (for travel tasks) */}
                            {(task.category === "travel" || task.location) && !task.done && (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/travel");
                                }}
                                className="mt-2 ml-2 px-4 py-2 bg-blush-300 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-soft hover:bg-blush-400 transition-all inline-flex"
                              >
                                <Navigation className="w-4 h-4" />
                                Travel Reminder →
                              </motion.button>
                            )}

                            {/* Goal Contribution */}
                            {task.goalContribution && (
                              <p className="text-xs text-mint-500 italic mt-2">
                                💡 {task.goalContribution}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ FOOD SECTION ═══ */}
            {activeSection === "food" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="card"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-peach-100 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-peach-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-700 font-display">
                      Food Recommendation
                    </h3>
                    <p className="text-xs text-gray-400">Based on time of day</p>
                  </div>
                </div>

                <div className="bg-gradient-sunset rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-3">{food.emoji}</div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2 font-display">
                    Time for {food.meal}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Suggested: {food.suggestion}
                  </p>
                  <p className="text-xs text-gray-500">
                    💡 Eat mindfully and stay hydrated!
                  </p>
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* ═══════ QUICK ACTIONS BOTTOM ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: " Journal", icon: "📝", path: "/journal", color: "bg-lavender-100" },
            { label: " Ask AI", icon: "🤖", path: "/ai", color: "bg-mint-100" },
            { label: " Insights", icon: "📊", path: "/insights", color: "bg-babyBlue-100" },
            { label: " My Goal", icon: "🎯", path: "/goals", color: "bg-peach-100" },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)}
              className={`${action.color} rounded-2xl p-4 text-left shadow-soft hover:shadow-medium`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-semibold text-gray-700">
                {action.label}
              </div>
            </motion.button>
          ))}
        </motion.div>

      </main>
    </div>
  );
};

export default Dashboard;