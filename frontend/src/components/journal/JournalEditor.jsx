import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Save,
  Wand2,
  Calendar,
  Smile,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useJournal } from '../../hooks/useJournal';
import { useTasks } from '../../hooks/useTasks';
import { getGreeting, getTimeEmoji, formatFullDate } from '../../utils/dateHelper';

const moods = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100' },
  { emoji: '😌', label: 'Calm', color: 'bg-mint-100' },
  { emoji: '🎯', label: 'Focused', color: 'bg-babyBlue-100' },
  { emoji: '⚡', label: 'Energetic', color: 'bg-peach-100' },
  { emoji: '😔', label: 'Sad', color: 'bg-lavender-100' },
  { emoji: '😴', label: 'Tired', color: 'bg-blush-100' },
];

const prompts = [
  'What are you working on today?',
  'What\'s on your mind right now?',
  'Describe your goals for today...',
  'How are you feeling about today?',
  'What tasks need your attention?',
];

const JournalEditor = ({ onTasksExtracted }) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  const [wordCount, setWordCount] = useState(0);

  const { createJournal, extractTasks, extracting, loading } = useJournal();
  const { createBulkTasks } = useTasks();

  // Rotate prompts every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update word count
  useEffect(() => {
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length);
  }, [content]);

  const handleExtractTasks = async () => {
    if (!content.trim()) return;
    const result = await extractTasks(content);
    if (result.success && result.data?.tasks) {
      setExtractedTasks(result.data.tasks);
      setShowExtracted(true);
    }
  };

  const handleSaveAndCreateTasks = async () => {
    if (!content.trim()) return;

    // Save journal first
    const journalResult = await createJournal(content);

    if (journalResult.success) {
      // Then add tasks
      if (extractedTasks.length > 0) {
        await createBulkTasks(extractedTasks);
        if (onTasksExtracted) onTasksExtracted(extractedTasks);
      }

      // Reset
      setContent('');
      setExtractedTasks([]);
      setShowExtracted(false);
      setSelectedMood(null);
    }
  };

  const removeExtractedTask = (idx) => {
    setExtractedTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
            {getTimeEmoji()} {getGreeting()}!
          </h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Calendar size={14} /> {formatFullDate(new Date())}
          </p>
        </div>
      </motion.div>

      {/* Editor Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white rounded-3xl shadow-soft overflow-hidden border border-lavender-100"
      >
        {/* Decorative gradient bar */}
        <div className="h-2 bg-gradient-to-r from-lavender-300 via-peach-300 to-mint-300" />

        <div className="p-6 md:p-8">
          {/* Editor Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-peach-300 to-blush-300 flex items-center justify-center shadow-soft">
              <BookOpen className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg text-gray-800">
                Today's Journal
              </h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPrompt}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-gray-500"
                >
                  {currentPrompt}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Mood Selector */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <Smile size={12} /> How are you feeling?
            </p>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <motion.button
                  key={mood.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-sm transition-all ${
                    selectedMood?.label === mood.label
                      ? `${mood.color} border-2 border-lavender-300 shadow-soft`
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{mood.emoji}</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing about your day... 

Example: I need to finish my React project by 5 PM. Then I have a meeting with Sarah at 6:30 PM. Don't forget to buy groceries on the way home."
              className="w-full min-h-[280px] p-5 bg-gradient-to-br from-lavender-50 to-peach-50 border-2 border-lavender-100 rounded-2xl focus:border-lavender-300 focus:outline-none focus:ring-4 focus:ring-lavender-100 resize-none text-gray-700 leading-relaxed placeholder:text-gray-400 transition-all"
            />

            {/* Word counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-xs text-gray-500">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles size={14} className="text-lavender-400" />
              <span>AI will extract tasks automatically</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!content.trim() || extracting}
                onClick={handleExtractTasks}
                className="px-5 py-2.5 bg-gradient-to-r from-lavender-300 to-babyBlue-300 text-white font-medium rounded-xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extracting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Wand2 size={16} />
                )}
                {extracting ? 'Extracting...' : 'Extract Tasks'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!content.trim() || loading}
                onClick={handleSaveAndCreateTasks}
                className="px-5 py-2.5 bg-gradient-to-r from-mint-300 to-softGreen-300 text-white font-medium rounded-xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Journal
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Extracted Tasks Preview */}
      <AnimatePresence>
        {showExtracted && extractedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-soft p-6 border border-mint-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-300 to-softGreen-300 flex items-center justify-center">
                <CheckCircle2 className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-800">
                  ✨ Extracted Tasks ({extractedTasks.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Review and edit before saving
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {extractedTasks.map((task, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-mint-50 to-softGreen-50 rounded-xl border border-mint-100 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint-300 to-softGreen-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {task.title}
                    </p>
                    {(task.scheduledTime || task.priority) && (
                      <div className="flex items-center gap-2 mt-1">
                        {task.scheduledTime && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            ⏰ {task.scheduledTime}
                          </span>
                        )}
                        {task.priority && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              task.priority === 'high'
                                ? 'bg-blush-100 text-blush-500'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-mint-100 text-mint-500'
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeExtractedTask(idx)}
                    className="opacity-0 group-hover:opacity-100 text-blush-400 hover:text-blush-500 text-sm transition-opacity"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Click "Save Journal" to add these tasks to your dashboard
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEditor;