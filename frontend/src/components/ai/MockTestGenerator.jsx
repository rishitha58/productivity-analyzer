import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  RefreshCw,
  Loader2,
  Brain,
  Trophy,
  Target,
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';

const MockTestGenerator = () => {
  const { generateMockTest, submitMockTest, loading } = useAI();

  const [stage, setStage] = useState('setup'); // 'setup' | 'taking' | 'results'
  const [config, setConfig] = useState({
    topic: '',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 15,
  });
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (stage !== 'taking' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, timeLeft]);

  const handleGenerate = async () => {
    if (!config.topic.trim()) return;
    const result = await generateMockTest(config);

    // Mock test data fallback
    const mockTest = result.data || {
      id: 'mock-' + Date.now(),
      topic: config.topic,
      questions: Array.from({ length: config.questionCount }, (_, i) => ({
        id: `q${i}`,
        question: `Sample question ${i + 1} about ${config.topic}?`,
        options: [
          'Option A - First choice',
          'Option B - Second choice',
          'Option C - Third choice',
          'Option D - Fourth choice',
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is the correct answer because of fundamental concepts in ${config.topic}.`,
      })),
    };

    setTest(mockTest);
    setTimeLeft(config.timeLimit * 60);
    setStage('taking');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [test.questions[currentQuestion].id]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    const mistakes = [];
    test.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      } else if (answers[q.id] !== undefined) {
        mistakes.push({
          question: q.question,
          userAnswer: q.options[answers[q.id]],
          correctAnswer: q.options[q.correctAnswer],
          explanation: q.explanation,
        });
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    setResults({
      score,
      correct: correctCount,
      total: test.questions.length,
      mistakes,
    });
    setStage('results');
  };

  const handleRetake = () => {
    setStage('setup');
    setTest(null);
    setAnswers({});
    setResults(null);
    setCurrentQuestion(0);
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ============ SETUP STAGE ============
  if (stage === 'setup') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-lavender-100 max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-peach-300 to-blush-300 flex items-center justify-center shadow-soft"
          >
            <FileText className="text-white" size={28} />
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-gradient-warm">
            Mock Test Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Test your knowledge on any topic ✨
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              📚 Topic
            </label>
            <input
              type="text"
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              placeholder="e.g., React Hooks, Photosynthesis, JavaScript Closures"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              ⚡ Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'hard'].map((diff) => (
                <motion.button
                  key={diff}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfig({ ...config, difficulty: diff })}
                  className={`py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                    config.difficulty === diff
                      ? diff === 'easy'
                        ? 'bg-mint-200 text-mint-600 border-2 border-mint-400'
                        : diff === 'medium'
                        ? 'bg-yellow-200 text-yellow-600 border-2 border-yellow-400'
                        : 'bg-blush-200 text-blush-600 border-2 border-blush-400'
                      : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                  }`}
                >
                  {diff === 'easy' && '🌱'} {diff === 'medium' && '⚡'}{' '}
                  {diff === 'hard' && '🔥'} {diff}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                📝 Questions
              </label>
              <select
                value={config.questionCount}
                onChange={(e) =>
                  setConfig({ ...config, questionCount: parseInt(e.target.value) })
                }
                className="input-field"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                ⏱️ Time Limit
              </label>
              <select
                value={config.timeLimit}
                onChange={(e) =>
                  setConfig({ ...config, timeLimit: parseInt(e.target.value) })
                }
                className="input-field"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !config.topic.trim()}
            onClick={handleGenerate}
            className="w-full py-4 bg-gradient-to-r from-peach-400 to-blush-400 text-white font-semibold rounded-2xl shadow-medium hover:shadow-glow-peach transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Test...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Mock Test
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ============ TAKING TEST STAGE ============
  if (stage === 'taking' && test) {
    const question = test.questions[currentQuestion];
    const isAnswered = answers[question.id] !== undefined;
    const progress = ((currentQuestion + 1) / test.questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center">
                <Brain className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-800">
                  {test.topic}
                </h3>
                <p className="text-xs text-gray-500">
                  Question {currentQuestion + 1} of {test.questions.length}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm ${
                timeLeft < 60
                  ? 'bg-blush-100 text-blush-500 animate-pulse'
                  : 'bg-lavender-100 text-lavender-500'
              }`}
            >
              <Clock size={14} />
              {formatTimer(timeLeft)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-lavender-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-lavender-400 to-babyBlue-400"
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-lavender-100"
          >
            <p className="text-xs font-semibold text-lavender-500 uppercase tracking-widest mb-2">
              Question {currentQuestion + 1}
            </p>
            <h4 className="text-lg md:text-xl font-display font-bold text-gray-800 leading-relaxed mb-6">
              {question.question}
            </h4>

            {/* Options */}
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const isSelected = answers[question.id] === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-3 border-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-lavender-100 to-babyBlue-100 border-lavender-400 shadow-soft'
                        : 'bg-white border-gray-200 hover:border-lavender-300 hover:bg-lavender-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-lavender-400 to-babyBlue-400 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span
                      className={`text-sm ${
                        isSelected ? 'text-gray-800 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={currentQuestion === 0}
            onClick={handlePrev}
            className="px-5 py-3 bg-white border-2 border-lavender-200 text-lavender-500 font-medium rounded-2xl hover:bg-lavender-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </motion.button>

          <span className="text-xs text-gray-500">
            {Object.keys(answers).length} / {test.questions.length} answered
          </span>

          {currentQuestion === test.questions.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-mint-400 to-softGreen-400 text-white font-medium rounded-2xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2"
            >
              <Check size={16} />
              Submit Test
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!isAnswered}
              onClick={handleNext}
              className="px-5 py-3 bg-gradient-to-r from-lavender-400 to-babyBlue-400 text-white font-medium rounded-2xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // ============ RESULTS STAGE ============
  if (stage === 'results' && results) {
    const getScoreColor = () => {
      if (results.score >= 80) return 'from-mint-400 to-softGreen-400';
      if (results.score >= 60) return 'from-babyBlue-400 to-lavender-400';
      if (results.score >= 40) return 'from-yellow-400 to-peach-400';
      return 'from-peach-400 to-blush-400';
    };

    const getScoreMessage = () => {
      if (results.score >= 80) return '🌟 Excellent work!';
      if (results.score >= 60) return '👍 Good job!';
      if (results.score >= 40) return '⚡ Keep practicing!';
      return '💪 You can do better!';
    };

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl shadow-medium"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor()} opacity-90`} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />

          <div className="relative p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <Trophy size={56} className="mx-auto mb-3" />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-7xl font-display font-bold mb-2"
            >
              {results.score}%
            </motion.div>

            <p className="text-xl font-display font-semibold mb-2">
              {getScoreMessage()}
            </p>
            <p className="text-sm opacity-90">
              You got {results.correct} out of {results.total} correct
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            icon={Check}
            label="Correct"
            value={results.correct}
            color="mint"
          />
          <StatBox
            icon={X}
            label="Incorrect"
            value={results.mistakes.length}
            color="blush"
          />
          <StatBox
            icon={Target}
            label="Accuracy"
            value={`${results.score}%`}
            color="lavender"
          />
        </div>

        {/* Mistakes Review */}
        {results.mistakes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blush-300 to-peach-300 flex items-center justify-center">
                <Award className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-800">
                  Review Mistakes
                </h3>
                <p className="text-xs text-gray-500">
                  Learn from these to improve next time
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {results.mistakes.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="p-4 bg-blush-50 rounded-2xl border border-blush-200"
                >
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Q: {m.question}
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className="text-blush-500">
                      <span className="font-semibold">Your answer:</span>{' '}
                      {m.userAnswer || 'Not answered'}
                    </p>
                    <p className="text-mint-600">
                      <span className="font-semibold">Correct answer:</span>{' '}
                      {m.correctAnswer}
                    </p>
                    {m.explanation && (
                      <p className="text-gray-600 mt-2 pt-2 border-t border-blush-200">
                        💡 {m.explanation}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetake}
            className="flex-1 py-3 bg-gradient-to-r from-lavender-400 to-babyBlue-400 text-white font-medium rounded-2xl shadow-soft hover:shadow-medium transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Take New Test
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
};

// Stat Box Component
const StatBox = ({ icon: Icon, label, value, color }) => {
  const colors = {
    mint: 'from-mint-300 to-softGreen-300',
    blush: 'from-blush-300 to-peach-300',
    lavender: 'from-lavender-300 to-babyBlue-300',
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

export default MockTestGenerator;