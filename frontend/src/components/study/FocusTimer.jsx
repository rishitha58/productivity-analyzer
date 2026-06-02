import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useStudyMode } from '../../context/StudyModeContext';

const FocusTimer = () => {
  const {
    timerActive,
    timerDuration,
    timeLeft,
    sessionCount,
    isBreak,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  } = useStudyMode();

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [hasStarted, setHasStarted] = useState(false);

  const durations = [
    { value: 15, label: '15m', emoji: '⚡' },
    { value: 25, label: '25m', emoji: '🎯' },
    { value: 45, label: '45m', emoji: '🚀' },
    { value: 60, label: '60m', emoji: '🔥' },
  ];

  // Calculate progress percentage
  const progress = timerDuration > 0 ? ((timerDuration - timeLeft) / timerDuration) * 100 : 0;

  // SVG circle parameters
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleStart = () => {
    setHasStarted(true);
    startTimer(selectedDuration);
  };

  const handleReset = () => {
    resetTimer();
    setHasStarted(false);
  };

  useEffect(() => {
    if (timeLeft === 0 && hasStarted) {
      setHasStarted(false);
    }
  }, [timeLeft, hasStarted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-soft border border-white/40"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: timerActive ? 360 : 0 }}
          transition={{ duration: 60, repeat: timerActive ? Infinity : 0, ease: 'linear' }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 mb-3 shadow-soft"
        >
          {isBreak ? (
            <Coffee size={26} className="text-white" />
          ) : (
            <Brain size={26} className="text-white" />
          )}
        </motion.div>
        <h3 className="text-xl font-display font-bold text-gray-800">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {isBreak
            ? 'Take a deep breath and relax 🌸'
            : 'Stay focused and avoid distractions'}
        </p>
      </div>

      {/* Circular Timer */}
      <div className="relative flex items-center justify-center mb-6">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8DCF5"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle gradient */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C3B1E1" />
              <stop offset="50%" stopColor="#B8D8F8" />
              <stop offset="100%" stopColor="#B5EAD7" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#timerGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(195, 177, 225, 0.5))',
            }}
          />
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={timeLeft}
            initial={{ scale: 1 }}
            animate={{ scale: timerActive ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1, repeat: timerActive ? Infinity : 0 }}
            className="text-5xl md:text-6xl font-display font-bold text-gradient-primary tracking-tight"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-semibold">
            {timerActive ? 'In Progress' : hasStarted ? 'Paused' : 'Ready'}
          </p>
          {sessionCount > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-mint-500">
              <CheckCircle2 size={14} />
              <span className="font-semibold">{sessionCount} completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Duration Selector */}
      {!hasStarted && !timerActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <p className="text-xs font-semibold text-gray-500 mb-2 text-center">
            Choose duration
          </p>
          <div className="grid grid-cols-4 gap-2">
            {durations.map((d) => (
              <motion.button
                key={d.value}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDuration(d.value)}
                className={`py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                  selectedDuration === d.value
                    ? 'bg-gradient-to-br from-lavender-200 to-babyBlue-200 text-lavender-600 shadow-soft border-2 border-lavender-300'
                    : 'bg-lavender-50 text-gray-600 border-2 border-transparent hover:border-lavender-200'
                }`}
              >
                <span className="text-lg">{d.emoji}</span>
                <span className="text-xs font-semibold">{d.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!hasStarted && !timerActive ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-8 py-3.5 bg-gradient-to-r from-lavender-400 to-babyBlue-400 text-white font-semibold rounded-2xl shadow-medium hover:shadow-glow transition-all flex items-center gap-2"
          >
            <Play size={18} fill="white" />
            Start Focus
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={timerActive ? pauseTimer : resumeTimer}
              className="px-6 py-3 bg-gradient-to-r from-peach-300 to-blush-300 text-white font-medium rounded-xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2"
            >
              {timerActive ? (
                <>
                  <Pause size={16} fill="white" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={16} fill="white" />
                  Resume
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, rotate: -180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4 }}
              onClick={handleReset}
              className="p-3 bg-white border-2 border-lavender-200 text-lavender-500 rounded-xl hover:border-lavender-300 hover:bg-lavender-50 transition-all"
              title="Reset"
            >
              <RotateCcw size={18} />
            </motion.button>
          </>
        )}
      </div>

      {/* Session info */}
      {sessionCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 pt-5 border-t border-lavender-100"
        >
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-2xl font-display font-bold text-mint-500">
                {sessionCount}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Sessions</p>
            </div>
            <div className="w-px h-10 bg-lavender-100" />
            <div>
              <p className="text-2xl font-display font-bold text-lavender-500">
                {Math.floor((sessionCount * selectedDuration) / 60)}h{' '}
                {(sessionCount * selectedDuration) % 60}m
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Focus</p>
            </div>
            <div className="w-px h-10 bg-lavender-100" />
            <div>
              <p className="text-2xl font-display font-bold text-peach-500">
                {Math.floor(sessionCount / 4)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Long Breaks</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FocusTimer;