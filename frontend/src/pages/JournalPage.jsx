import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Loader2, AlertCircle, Clock, MapPin,
  Target, Lightbulb, Plus, CheckCircle2, Navigation, Car,
  Bike, PersonStanding, Bell, X, Save
} from "lucide-react";
import { submitJournal, getTodayJournal, createTravel } from "../services/aiService";

const JournalPage = () => {
  const navigate = useNavigate();
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [existingTasks, setExistingTasks] = useState([]);
  const [isAddingMore, setIsAddingMore] = useState(false);
  
  // 🆕 Travel modal state
  const [travelTaskQueue, setTravelTaskQueue] = useState([]);
  const [currentTravelTask, setCurrentTravelTask] = useState(null);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [travelForm, setTravelForm] = useState({
    fromLocation: localStorage.getItem("homeLocation") || "",
    mode: "driving",
    enableReminder: true,
  });
  const [creatingTravel, setCreatingTravel] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "Friend";
  const userGoal = user.goal || null;

  useEffect(() => {
    checkExistingJournal();
  }, []);

  const checkExistingJournal = async () => {
    try {
      const data = await getTodayJournal();
      if (data && data.tasks && data.tasks.length > 0) {
        setExistingTasks(data.tasks);
        setIsAddingMore(true);
      }
    } catch (e) {
      console.error("Check failed:", e);
    }
  };

  const handleConvert = async () => {
    if (!journal.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await submitJournal(journal);
      console.log("✅ Response:", response);

      const newTasks = response.journal?.tasks || [];
      
      setResult({
        tasks: newTasks,
        motivation: response.journal?.motivation || "",
        suggestions: response.suggestions || [],
        newTasksAdded: response.newTasksAdded || 0,
      });

      // 🎯 DETECT TRAVEL TASKS — Only new tasks added in this submission
      const recentTravelTasks = newTasks.slice(-response.newTasksAdded).filter(
        (t) => t.category === "travel" || (t.location && t.location.trim() !== "")
      );
      
      if (recentTravelTasks.length > 0) {
        setTravelTaskQueue(recentTravelTasks);
        setCurrentTravelTask(recentTravelTasks[0]);
        setShowTravelModal(true);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "AI failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTravelDecision = async (wantsReminder) => {
    if (!wantsReminder) {
      // Skip this one
      moveToNextTravelTask();
      return;
    }

    // User wants reminder — show form
    setTravelForm({
      ...travelForm,
      enableReminder: true,
    });
  };

  const handleCreateTravelReminder = async () => {
    if (!travelForm.fromLocation.trim()) {
      alert("Please enter your starting location");
      return;
    }

    setCreatingTravel(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      await createTravel({
        destination: currentTravelTask.location || currentTravelTask.title,
        meetingTime: currentTravelTask.time,
        meetingDate: today,
        mode: travelForm.mode,
        fromLocation: travelForm.fromLocation,
      });

      // Save home location for next time
      localStorage.setItem("homeLocation", travelForm.fromLocation);

      console.log("✅ Travel reminder created!");
      moveToNextTravelTask();
    } catch (e) {
      alert("Failed to create reminder: " + e.message);
    } finally {
      setCreatingTravel(false);
    }
  };

  const moveToNextTravelTask = () => {
    const newQueue = travelTaskQueue.slice(1);
    setTravelTaskQueue(newQueue);
    
    if (newQueue.length > 0) {
      setCurrentTravelTask(newQueue[0]);
    } else {
      setShowTravelModal(false);
      setCurrentTravelTask(null);
    }
  };

  const handleAcceptSuggestion = (suggestion) => {
    const newTask = {
      id: Date.now(),
      title: suggestion.title,
      priority: suggestion.priority,
      category: "study",
      goalAligned: true,
      goalContribution: suggestion.reason,
      done: false,
    };
    setResult({
      ...result,
      tasks: [...result.tasks, newTask],
      suggestions: result.suggestions.filter((s) => s.title !== suggestion.title),
    });
  };

  const handleSaveAndContinue = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("lastJournalDate", today);
    setTimeout(() => navigate("/dashboard"), 100);
  };

  const handleAddMore = () => {
    setResult(null);
    setJournal("");
    setError("");
  };

  const categoryColors = {
    study: "bg-lavender-100 text-lavender-500",
    work: "bg-babyBlue-100 text-babyBlue-500",
    personal: "bg-peach-100 text-peach-500",
    health: "bg-mint-100 text-mint-500",
    travel: "bg-blush-100 text-blush-500",
  };

  const priorityColors = {
    high: "bg-blush-100 text-blush-500",
    medium: "bg-peach-100 text-peach-500",
    low: "bg-mint-100 text-mint-500",
  };

  return (
    <div className="min-h-screen bg-gradient-dreamy p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-6xl mb-4"
          >
            📝
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-700 font-display mb-2">
            {isAddingMore ? "Add More Tasks" : `Hi, ${userName}!`} 🌸
          </h1>
          <p className="text-sm text-gray-600">
            {isAddingMore
              ? "Tell me what else you need to do today"
              : "Tell me about your day — AI organizes it ✨"}
          </p>

          {userGoal && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-lavender-100 rounded-full">
              <Target className="w-4 h-4 text-lavender-500" />
              <span className="text-xs font-semibold text-lavender-500">
                Goal: {userGoal}
              </span>
            </div>
          )}
        </div>

        {/* Existing Tasks Banner */}
        {isAddingMore && existingTasks.length > 0 && !result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-4 bg-mint-50 border-mint-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint-500" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">
                  You already have {existingTasks.length} task{existingTasks.length > 1 ? "s" : ""} today
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Your tasks are saved. Add new ones — they won't replace them!
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs text-mint-500 font-semibold hover:underline"
              >
                Dashboard →
              </button>
            </div>
          </motion.div>
        )}

        {/* Journal Input */}
        <div className="card mb-6">
          <label className="label">
            {isAddingMore ? "What ELSE do you need to do?" : "Today's Plan"}
          </label>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={6}
            placeholder={isAddingMore
              ? "Example: I also need to visit the bookstore at 5pm in Connaught Place..."
              : "Example: Today I want to study React at 9am, then meet at Cafe Connaught at 3pm..."}
            disabled={loading || result}
            className="textarea text-base"
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blush-500 bg-blush-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!result && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConvert}
              disabled={!journal.trim() || loading}
              className={`w-full mt-4 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                journal.trim() && !loading
                  ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isAddingMore ? "Add These Tasks" : "Convert to Tasks"}
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card mb-4 bg-mint-50 border-mint-200"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-mint-500" />
                <div>
                  <p className="text-sm font-bold text-gray-700">
                    ✨ Added {result.newTasksAdded} new task{result.newTasksAdded !== 1 ? "s" : ""}!
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total today: {result.tasks.length} task{result.tasks.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </motion.div>

            {result.motivation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-primary rounded-3xl p-5 mb-6 text-white"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{result.motivation}</p>
                </div>
              </motion.div>
            )}

            {/* Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-lavender-400" />
                <h3 className="text-base font-bold text-gray-700 font-display">
                  All Your Tasks Today ({result.tasks?.length || 0})
                </h3>
              </div>

              {result.tasks && result.tasks.length > 0 ? (
                <div className="space-y-3">
                  {result.tasks.map((task, i) => (
                    <motion.div
                      key={task._id || task.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl border-2 ${
                        task.goalAligned
                          ? "bg-mint-50 border-mint-200"
                          : task.category === "travel" || task.location
                          ? "bg-blush-50 border-blush-200"
                          : "bg-cream border-transparent"
                      } ${task.done ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 mt-0.5 ${
                          task.done ? "bg-mint-300 border-mint-300" : "border-lavender-200"
                        }`}>
                          {task.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className={`text-sm font-medium ${task.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                              {task.title}
                            </p>
                            <div className="flex gap-1 flex-shrink-0">
                              {task.goalAligned && (
                                <span className="badge bg-mint-200 text-mint-500 flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Goal
                                </span>
                              )}
                              {(task.category === "travel" || task.location) && (
                                <span className="badge bg-blush-200 text-blush-500 flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  Travel
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
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
                                <Clock className="w-3 h-3" />
                                {task.time}
                              </span>
                            )}
                            {task.location && (
                              <span className="badge bg-peach-100 text-peach-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {task.location}
                              </span>
                            )}
                          </div>
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
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No tasks. Try writing more specific details.
                </div>
              )}
            </motion.div>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-6 bg-gradient-ocean"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-bold text-gray-700 font-display">
                    AI Suggestions for Your Goal
                  </h3>
                </div>
                <div className="space-y-2">
                  {result.suggestions.map((sug, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-md rounded-xl p-3 flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{sug.title}</p>
                        <p className="text-xs text-gray-500 mt-1">💡 {sug.reason}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleAcceptSuggestion(sug)}
                        className="text-xs bg-mint-300 text-gray-700 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        + Add
                      </motion.button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleAddMore}
                className="flex-1 py-3 bg-white border border-lavender-200 text-gray-600 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add More Tasks
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleSaveAndContinue}
                className="flex-1 py-3 bg-mint-300 text-gray-700 rounded-2xl font-semibold text-sm shadow-soft hover:bg-mint-400 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </>
        )}
      </motion.div>

      {/* ═══════ 🆕 TRAVEL REMINDER MODAL ═══════ */}
      <AnimatePresence>
        {showTravelModal && currentTravelTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header with travel icon */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-16 h-16 mx-auto mb-3 bg-gradient-primary rounded-3xl flex items-center justify-center"
                >
                  <Navigation className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-700 font-display">
                  🗺️ Travel Task Detected!
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Setup smart reminder for this trip
                </p>
              </div>

              {/* Travel Task Info */}
              <div className="card bg-blush-50 border-blush-200 mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  📍 {currentTravelTask.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentTravelTask.location && (
                    <span className="badge bg-white text-blush-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentTravelTask.location}
                    </span>
                  )}
                  {currentTravelTask.time && (
                    <span className="badge bg-white text-blush-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {currentTravelTask.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="bg-gradient-ocean rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-gray-700 mb-1">
                  ⏰ Want me to remind you when to leave?
                </p>
                <p className="text-xs text-gray-600">
                  I'll calculate travel time and notify you in advance
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="label">📍 Your Starting Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Home, Office, Hyderabad"
                    value={travelForm.fromLocation}
                    onChange={(e) => setTravelForm({ ...travelForm, fromLocation: e.target.value })}
                    className="input"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    💾 We'll save this for future trips
                  </p>
                </div>

                <div>
                  <label className="label">🚗 How will you travel?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "driving", label: "Driving", icon: Car, emoji: "🚗" },
                      { id: "cycling", label: "Cycling", icon: Bike, emoji: "🚴" },
                      { id: "walking", label: "Walking", icon: PersonStanding, emoji: "🚶" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setTravelForm({ ...travelForm, mode: m.id })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          travelForm.mode === m.id
                            ? "border-lavender-300 bg-lavender-50"
                            : "border-lavender-100"
                        }`}
                      >
                        <div className="text-2xl mb-1">{m.emoji}</div>
                        <p className="text-xs font-semibold text-gray-700">{m.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated time will show after calculation */}
                {travelForm.fromLocation && currentTravelTask.time && (
                  <div className="bg-mint-50 rounded-xl p-3 border border-mint-200">
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-mint-500" />
                      You'll be notified <strong>before</strong> you need to leave!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTravelDecision(false)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm"
                >
                  Skip
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTravelReminder}
                  disabled={!travelForm.fromLocation.trim() || creatingTravel}
                  className={`flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 ${
                    travelForm.fromLocation.trim() && !creatingTravel
                      ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {creatingTravel ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Yes, Remind Me
                    </>
                  )}
                </motion.button>
              </div>

              {/* Queue indicator */}
              {travelTaskQueue.length > 1 && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  {travelTaskQueue.length - 1} more travel task{travelTaskQueue.length > 2 ? "s" : ""} after this
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalPage;