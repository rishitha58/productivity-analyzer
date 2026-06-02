import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  MessageCircle,
  Music,
  Sparkles,
  Quote,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import FocusTimer from './FocusTimer';
import MusicPlayer from './MusicPlayer';
import DndToggle from './DndToggle';
import { useStudyMode } from '../../context/StudyModeContext';
import { useNavigate } from 'react-router-dom';

const motivationalQuotes = [
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Every accomplishment starts with the decision to try.', author: 'John F. Kennedy' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
];

const StudyMode = ({ onExit }) => {
  const { isStudyMode, exitStudyMode, totalStudyTime, studyStartTime } = useStudyMode();
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Rotate quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(
        motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update session timer
  useEffect(() => {
    if (!studyStartTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - studyStartTime) / 60000);
      setSessionMinutes(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [studyStartTime]);

  const handleExit = () => {
    exitStudyMode();
    if (onExit) onExit();
  };

  const openAI = () => {
    navigate('/ai');
  };

  if (!isStudyMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Soothing animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-lavender-100 via-babyBlue-100 to-mint-100" />

      {/* Floating decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lavender-200/40 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-peach-200/40 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-mint-200/40 blur-3xl"
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100, null],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-screen p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-400 to-babyBlue-400 flex items-center justify-center shadow-glow"
            >
              <Brain className="text-white" size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">
                Study Mode
              </h1>
              <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                <Sparkles size={12} className="text-lavender-400" />
                Stay focused. Stay amazing.
              </p>
            </div>
          </div>

          {/* Session timer */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <TrendingUp size={16} className="text-mint-500" />
            <div>
              <p className="text-xs text-gray-500">This session</p>
              <p className="font-display font-bold text-gray-800">
                {sessionMinutes}m
              </p>
            </div>
          </div>

          {/* Exit button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExit}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/60 backdrop-blur-md hover:bg-white/80 text-gray-700 rounded-xl border border-white/40 shadow-soft transition-all"
          >
            <X size={16} />
            <span className="hidden md:inline text-sm font-medium">Exit</span>
          </motion.button>
        </motion.div>

        {/* Inspirational quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <Quote className="mx-auto text-lavender-400 mb-3" size={28} />
            <p className="text-lg md:text-xl text-gray-700 font-display italic max-w-2xl mx-auto leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-sm text-gray-500 mt-2">— {currentQuote.author}</p>
          </motion.div>
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {/* Left column - Focus Timer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <FocusTimer />
          </motion.div>

          {/* Middle column - Music + Tips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-5"
          >
            <MusicPlayer />

            {/* Study Tips */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-5 shadow-soft border border-white/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-peach-300 flex items-center justify-center">
                  <Lightbulb size={18} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-gray-800">
                  Quick Tips
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-bold">✓</span>
                  <span>Take a 5-min break every 25 mins (Pomodoro)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-bold">✓</span>
                  <span>Drink water to stay hydrated 💧</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-bold">✓</span>
                  <span>Ask AI for doubts using the chat icon →</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right column - DnD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <DndToggle />
          </motion.div>
        </div>

        {/* Bottom info bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            💡 Use the AI chat for doubts • Music helps you focus • Stay
            consistent ✨
          </p>
        </motion.div>
      </div>

      {/* Floating AI Chat Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={openAI}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-400 to-babyBlue-400 text-white shadow-glow flex items-center justify-center group z-50"
      >
        <MessageCircle size={22} />

        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl bg-lavender-300 opacity-40 animate-ping" />

        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-white text-gray-700 text-xs rounded-lg shadow-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask AI for doubts
        </span>
      </motion.button>

      {/* Floating Music Mini-Player Indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 left-6 hidden lg:flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-lg rounded-xl border border-white/40 shadow-soft"
      >
        <Music size={14} className="text-lavender-500" />
        <span className="text-xs text-gray-600">Soothing vibes on 🎶</span>
      </motion.div>
    </motion.div>
  );
};

export default StudyMode;