import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Play, Pause, X, Maximize2, Clock, Brain, 
  Coffee, Sparkles, Music, MessageCircle
} from "lucide-react";
import { useStudyMode } from "../../context/StudyModeContext";

const FloatingStudyWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isStudyMode,
    currentTask,
    timerActive,
    timeLeft,
    isBreak,
    isMusicPlaying,
    doubtsAsked,
    formatTime,
    toggleTimer,
    exitStudyMode,
  } = useStudyMode();

  const [isExpanded, setIsExpanded] = useState(false);

const hiddenPaths = ["/", "/journal"];
const isOnFocusPage = location.pathname.startsWith("/focus");
const isOnHiddenPage = hiddenPaths.includes(location.pathname);

if (!isStudyMode || isOnFocusPage || isOnHiddenPage || !currentTask) return null;

  // Color based on time left
  const getTimerColor = () => {
    if (isBreak) return "from-mint-300 to-mint-400";
    if (timeLeft < 120) return "from-blush-300 to-blush-400"; // <2 min = red
    if (timeLeft < 300) return "from-peach-300 to-peach-400"; // <5 min = orange
    return "from-lavender-300 to-babyBlue-300";
  };

  const handleExpand = () => {
    if (currentTask?._id) {
      navigate(`/focus/${currentTask._id}`);
    } else if (currentTask?.id) {
      navigate(`/focus/${currentTask.id}`);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{
        top: -window.innerHeight + 200,
        bottom: 20,
        left: -window.innerWidth + 280,
        right: 20,
      }}
      initial={{ scale: 0, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-24 right-6 z-[100] cursor-move"
      style={{ touchAction: "none" }}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // ─── COMPACT VIEW ───
          <motion.div
            key="compact"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className={`bg-gradient-to-r ${getTimerColor()} text-white rounded-2xl shadow-glow p-3 backdrop-blur-md border border-white/40 min-w-[200px] cursor-pointer hover:shadow-2xl transition-shadow`}
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3">
              {/* Pulsing dot */}
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${timerActive ? "bg-white" : "bg-white/50"}`} />
                {timerActive && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping" />
                )}
              </div>

              {/* Icon */}
              {isBreak ? (
                <Coffee className="w-5 h-5 text-white" />
              ) : (
                <Brain className="w-5 h-5 text-white" />
              )}

              {/* Timer */}
              <div className="flex-1">
                <p className="text-lg font-bold font-display leading-none">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-[10px] opacity-90 uppercase tracking-wider">
                  {isBreak ? "Break" : "Focus"}
                </p>
              </div>

              {/* Quick controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTimer();
                }}
                className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                {timerActive ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          // ─── EXPANDED VIEW ───
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 border border-white/60 min-w-[280px]"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${getTimerColor()} flex items-center justify-center shadow-soft`}>
                  {isBreak ? (
                    <Coffee className="w-5 h-5 text-white" />
                  ) : (
                    <Brain className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    {isBreak ? "☕ Break Time" : "🎯 Focus Mode"}
                  </p>
                  <p className="text-xs text-gray-600 truncate max-w-[150px]">
                    {currentTask?.title || "Study Session"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Big Timer */}
            <div className="text-center my-4">
              <div className={`text-4xl font-bold font-display bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {timerActive ? "Running..." : "Paused"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                  timerActive
                    ? "bg-blush-100 text-blush-500 hover:bg-blush-200"
                    : "bg-lavender-100 text-lavender-500 hover:bg-lavender-200"
                }`}
              >
                {timerActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExpand}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-lavender-300 to-babyBlue-300 text-white hover:shadow-soft flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Open
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3 text-lavender-400" />
                </div>
                <p className="text-sm font-bold text-gray-700">{doubtsAsked}</p>
                <p className="text-[10px] text-gray-400">Doubts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Music className={`w-3 h-3 ${isMusicPlaying ? "text-mint-500" : "text-gray-300"}`} />
                </div>
                <p className="text-sm font-bold text-gray-700">{isMusicPlaying ? "ON" : "OFF"}</p>
                <p className="text-[10px] text-gray-400">Music</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-peach-400" />
                </div>
                <p className="text-sm font-bold text-gray-700">{isBreak ? "🌿" : "🎯"}</p>
                <p className="text-[10px] text-gray-400">Mode</p>
              </div>
            </div>

            {/* Exit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => {
    
                  exitStudyMode();
              }}
              className="w-full mt-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              End Session
            </motion.button>

            {/* Drag hint */}
            <p className="text-center text-[10px] text-gray-400 mt-2">
              ✋ Drag to move
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingStudyWidget;