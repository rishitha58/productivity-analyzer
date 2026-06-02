import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XCircle,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Filter,
  Search,
  TrendingDown,
  BookOpen,
  Brain,
  Eye,
  Calendar,
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { getRelativeTime } from '../../utils/dateHelper';

const ImportedNotes = () => {
  const { getMistakes, loading } = useAI();
  const [view, setView] = useState('mistakes'); // 'mistakes' | 'ai-notes'
  const [filter, setFilter] = useState('all'); // 'all' | 'reviewed' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [mistakes, setMistakes] = useState([]);
  const [aiNotes, setAiNotes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock data for now
    setMistakes([
      {
        id: '1',
        question: 'What is the difference between useState and useEffect?',
        userAnswer: 'They are the same hook',
        correctAnswer: 'useState manages state, useEffect handles side effects',
        explanation: 'useState is for managing component state, while useEffect handles side effects like API calls, subscriptions, and DOM mutations.',
        topic: 'React Hooks',
        difficulty: 'medium',
        date: new Date(Date.now() - 86400000).toISOString(),
        reviewed: false,
      },
      {
        id: '2',
        question: 'What is closure in JavaScript?',
        userAnswer: 'A function inside another function',
        correctAnswer: 'A function that has access to variables in its outer scope, even after the outer function returns',
        explanation: 'Closures allow inner functions to remember and access variables from their lexical scope, even when called outside that scope.',
        topic: 'JavaScript',
        difficulty: 'hard',
        date: new Date(Date.now() - 172800000).toISOString(),
        reviewed: true,
      },
      {
        id: '3',
        question: 'What is the time complexity of binary search?',
        userAnswer: 'O(n)',
        correctAnswer: 'O(log n)',
        explanation: 'Binary search divides the search space in half each iteration, resulting in logarithmic time complexity.',
        topic: 'Algorithms',
        difficulty: 'easy',
        date: new Date(Date.now() - 259200000).toISOString(),
        reviewed: false,
      },
    ]);

    setAiNotes([
      {
        id: '1',
        title: 'React Hooks Deep Dive',
        topic: 'React',
        source: 'AI Chat',
        points: [
          'useState returns an array with current state and setter function',
          'useEffect runs after every render by default',
          'Custom hooks must start with the word "use"',
          'Rules of hooks: only call at top level, only from React functions',
        ],
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        title: 'JavaScript Promises',
        topic: 'JavaScript',
        source: 'Important Points',
        points: [
          'Promises represent eventual completion of async operations',
          'Can be in three states: pending, fulfilled, rejected',
          'Use .then() and .catch() to handle results',
          'async/await is syntactic sugar over promises',
        ],
        date: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  };

  // Filter mistakes
  const filteredMistakes = mistakes.filter((m) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'reviewed' && m.reviewed) ||
      (filter === 'pending' && !m.reviewed);
    const matchesSearch =
      !searchQuery ||
      m.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Mark as reviewed
  const markReviewed = (id) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reviewed: !m.reviewed } : m))
    );
  };

  const stats = {
    total: mistakes.length,
    reviewed: mistakes.filter((m) => m.reviewed).length,
    pending: mistakes.filter((m) => !m.reviewed).length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush-300 to-peach-300 flex items-center justify-center shadow-soft">
            <Brain className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800">
              Review & Learn
            </h2>
            <p className="text-sm text-gray-500">
              Your mistakes and AI-generated notes
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 bg-lavender-50 p-1 rounded-2xl">
          <button
            onClick={() => setView('mistakes')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              view === 'mistakes'
                ? 'bg-gradient-to-r from-blush-300 to-peach-300 text-white shadow-soft'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <XCircle size={14} />
            Mistakes ({stats.total})
          </button>
          <button
            onClick={() => setView('ai-notes')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              view === 'ai-notes'
                ? 'bg-gradient-to-r from-lavender-300 to-babyBlue-300 text-white shadow-soft'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Sparkles size={14} />
            AI Notes ({aiNotes.length})
          </button>
        </div>
      </motion.div>

      {/* Mistakes View */}
      {view === 'mistakes' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={XCircle}
              label="Total"
              value={stats.total}
              color="blush"
            />
            <StatCard
              icon={CheckCircle}
              label="Reviewed"
              value={stats.reviewed}
              color="mint"
            />
            <StatCard
              icon={AlertCircle}
              label="Pending"
              value={stats.pending}
              color="yellow"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2">
              {['all', 'pending', 'reviewed'].map((f) => (
                <motion.button
                  key={f}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                    filter === f
                      ? 'bg-gradient-to-r from-lavender-300 to-babyBlue-300 text-white shadow-soft'
                      : 'bg-white text-gray-600 border border-lavender-100 hover:bg-lavender-50'
                  }`}
                >
                  {f}
                </motion.button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs ml-auto">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mistakes..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-lavender-100 rounded-xl focus:border-lavender-300 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Mistakes List */}
          {filteredMistakes.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title="No mistakes here!"
              subtitle="Take a mock test to see your mistakes"
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredMistakes.map((mistake, idx) => (
                  <motion.div
                    key={mistake.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white rounded-2xl p-5 shadow-soft border-2 transition-all ${
                      mistake.reviewed
                        ? 'border-mint-200 bg-mint-50/30'
                        : 'border-blush-200 hover:shadow-medium'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-lavender-100 text-lavender-500 rounded-lg font-semibold">
                          {mistake.topic}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                            mistake.difficulty === 'easy'
                              ? 'bg-mint-100 text-mint-500'
                              : mistake.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-blush-100 text-blush-500'
                          }`}
                        >
                          {mistake.difficulty}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {getRelativeTime(mistake.date)}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => markReviewed(mistake.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          mistake.reviewed
                            ? 'bg-mint-100 text-mint-500'
                            : 'bg-gray-100 text-gray-400 hover:bg-mint-100 hover:text-mint-500'
                        }`}
                        title={
                          mistake.reviewed ? 'Reviewed' : 'Mark as reviewed'
                        }
                      >
                        <CheckCircle size={16} />
                      </motion.button>
                    </div>

                    {/* Question */}
                    <h4 className="font-semibold text-gray-800 mb-3 leading-relaxed">
                      ❓ {mistake.question}
                    </h4>

                    {/* Answers */}
                    <div className="space-y-2 mb-3">
                      <div className="p-3 bg-blush-50 rounded-xl border border-blush-200">
                        <p className="text-xs font-semibold text-blush-500 mb-1">
                          ❌ Your Answer
                        </p>
                        <p className="text-sm text-gray-700">{mistake.userAnswer}</p>
                      </div>

                      <div className="p-3 bg-mint-50 rounded-xl border border-mint-200">
                        <p className="text-xs font-semibold text-mint-500 mb-1">
                          ✅ Correct Answer
                        </p>
                        <p className="text-sm text-gray-700">{mistake.correctAnswer}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    {mistake.explanation && (
                      <div className="p-3 bg-gradient-to-r from-lavender-50 to-babyBlue-50 rounded-xl border border-lavender-200">
                        <p className="text-xs font-semibold text-lavender-500 mb-1 flex items-center gap-1">
                          <Sparkles size={11} />
                          Explanation
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {mistake.explanation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* AI Notes View */}
      {view === 'ai-notes' && (
        <>
          {aiNotes.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No AI notes yet"
              subtitle="Generate important points or chat with AI to create notes"
            />
          ) : (
            <div className="space-y-4">
              {aiNotes.map((note, idx) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-soft border border-lavender-100 hover:shadow-medium transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center">
                        <BookOpen className="text-white" size={18} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-800">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 bg-lavender-100 text-lavender-500 rounded-md font-semibold">
                            {note.topic}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Sparkles size={10} />
                            {note.source}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {getRelativeTime(note.date)}
                    </span>
                  </div>

                  {/* Points */}
                  <div className="space-y-2">
                    {note.points.map((point, pIdx) => (
                      <motion.div
                        key={pIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + pIdx * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-lavender-50 to-babyBlue-50 rounded-xl"
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-lavender-400 to-babyBlue-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {pIdx + 1}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed flex-1">
                          {point}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blush: 'from-blush-300 to-peach-300',
    mint: 'from-mint-300 to-softGreen-300',
    yellow: 'from-yellow-300 to-peach-300',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-4 shadow-soft border border-lavender-100 text-center"
    >
      <div
        className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-display font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16 bg-white rounded-3xl border border-lavender-100"
  >
    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-lavender-100 to-babyBlue-100 flex items-center justify-center">
      <Icon size={32} className="text-lavender-400" />
    </div>
    <h3 className="text-lg font-display font-bold text-gray-700">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
  </motion.div>
);

export default ImportedNotes;