import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Brain, Music, Pause, Play, SkipForward, X, Send,
  ArrowLeft, Clock, Sparkles, Bot,
  Lightbulb, BookOpen, Coffee, Loader2, StickyNote,
  FileText, Zap, ExternalLink,Edit3
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askDoubt, getTodayJournal } from "../services/aiService";
import { useStudyMode } from "../context/StudyModeContext";
import MusicPlayer from "../components/study/MusicPlayer"; // ⭐ Import your component!

// Markdown renderer
const MarkdownRenderer = ({ children, isUser = false }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ node, ...props }) => <h1 className={`text-base font-bold mt-2 mb-1 ${isUser ? "text-white" : "text-gray-800"}`} {...props} />,
      h2: ({ node, ...props }) => <h2 className={`text-sm font-bold mt-2 mb-1 ${isUser ? "text-white" : "text-gray-800"}`} {...props} />,
      h3: ({ node, ...props }) => <h3 className={`text-sm font-semibold mt-2 mb-1 ${isUser ? "text-white" : "text-gray-700"}`} {...props} />,
      strong: ({ node, ...props }) => <strong className={`font-bold ${isUser ? "text-white" : "text-lavender-600"}`} {...props} />,
      em: ({ node, ...props }) => <em className={`italic ${isUser ? "text-white/90" : "text-gray-600"}`} {...props} />,
      code: ({ node, inline, ...props }) => inline ? (
        <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${isUser ? "bg-white/20 text-white" : "bg-lavender-100 text-lavender-700"}`} {...props} />
      ) : (
        <code className="block p-3 bg-gray-800 text-mint-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre" {...props} />
      ),
      pre: ({ node, ...props }) => <pre className="my-2 rounded-xl overflow-hidden" {...props} />,
      ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
      li: ({ node, ...props }) => <li className={`text-sm ${isUser ? "text-white" : "text-gray-700"}`} {...props} />,
      p: ({ node, ...props }) => <p className={`text-sm leading-relaxed my-1.5 ${isUser ? "text-white" : "text-gray-700"}`} {...props} />,
      blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-3 my-2 italic ${isUser ? "border-white/40 text-white/90" : "border-lavender-300 text-gray-600"}`} {...props} />,
      a: ({ node, ...props }) => <a className={`underline ${isUser ? "text-white" : "text-lavender-500"}`} {...props} />,
    }}
  >
    {children}
  </ReactMarkdown>
);

const StudyFocusPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const {
  isStudyMode,
  enterStudyMode,
  exitStudyMode,
  currentTask,
  setCurrentTask,
  timerActive,
  timeLeft,
  timerDuration,
  isBreak,
  sessionCount,
  doubtsAsked,
  incrementDoubts,
  toggleTimer,
  resetTimer,
  skipSession,
  startTimer,
  formatTime,
  isMusicPlaying,
  currentMusic,
  setFocusDuration,   
  setBreakDuration,    
} = useStudyMode();

  const [showAI, setShowAI] = useState(false);
  const [doubts, setDoubts] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [askingAI, setAskingAI] = useState(false);
  const chatEndRef = useRef(null);
  const [showMusic, setShowMusic] = useState(false);
  const [editingTime, setEditingTime] = useState(false);   
const [customMinutes, setCustomMinutes] = useState("");  

  useEffect(() => {
    if (isStudyMode && currentTask) {
      console.log("📚 Resuming existing study session");
      return;
    }
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await getTodayJournal();
      const task = data.tasks?.find((t) => t._id === taskId || t.id == taskId);
      
      if (task) {
        if (!isStudyMode) {
          console.log("🎯 Starting new focus session for:", task.title);
          enterStudyMode(task);
          startTimer(25);
        } else {
          setCurrentTask(task);
        }
      }
    } catch (e) {
      console.error("Failed to load task:", e);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [doubts]);

  const handleAskAI = async () => {
    if (!currentQuestion.trim()) return;
    
    setAskingAI(true);
    const question = currentQuestion;
    setCurrentQuestion("");

    setDoubts((prev) => [...prev, { role: "user", text: question, loading: false }]);
    setDoubts((prev) => [...prev, { role: "ai", text: "", loading: true }]);

    try {
      const response = await askDoubt(
        question,
        currentTask?.category || "general",
        taskId,
        currentTask?.title || "Study Session"
      );

      incrementDoubts();

      setDoubts((prev) => {
        const newDoubts = [...prev];
        newDoubts[newDoubts.length - 1] = {
          role: "ai",
          text: response.doubt.answer,
          keyPoints: response.keyPoints,
          relatedQuestions: response.relatedQuestions,
          loading: false,
          saved: true,
        };
        return newDoubts;
      });
    } catch (err) {
      setDoubts((prev) => {
        const newDoubts = [...prev];
        newDoubts[newDoubts.length - 1] = {
          role: "ai",
          text: "Sorry, I couldn't process that. Try again!",
          loading: false,
        };
        return newDoubts;
      });
    } finally {
      setAskingAI(false);
    }
  };

  const handleQuickAsk = (question) => {
    setCurrentQuestion(question);
    setTimeout(() => handleAskAI(), 100);
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  const quickActions = [
    { icon: StickyNote, label: "Notes", color: "from-mint-300 to-mint-400", bg: "bg-mint-50", text: "text-mint-600", onClick: () => navigate("/notes") },
    { icon: Lightbulb, label: "Key Points", color: "from-yellow-300 to-peach-300", bg: "bg-yellow-50", text: "text-yellow-700", onClick: () => navigate("/important") },
    { icon: FileText, label: "Mock Test", color: "from-babyBlue-300 to-lavender-300", bg: "bg-babyBlue-50", text: "text-babyBlue-600", onClick: () => navigate("/mocktests") },
  ];

  return (
    <div className="min-h-screen bg-gradient-study relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-lavender-300 opacity-20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-mint-300 opacity-20 rounded-full blur-3xl animate-float" />

      {/* ─── TOP BAR ─── */}
      <header className="relative z-10 bg-white/60 backdrop-blur-md border-b border-lavender-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button whileHover={{ x: -3 }} onClick={handleExit} className="btn-icon">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Focus Mode
            </p>
            <h1 className="text-base font-bold text-gray-700 font-display">
              {currentTask?.title || "Study Session"}
            </h1>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMusic(!showMusic)}
              className={`btn-icon ${showMusic ? "bg-mint-300 text-white" : ""}`}
            >
              <Music className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAI(!showAI)}
              className={`btn-icon ${showAI ? "bg-lavender-300 text-white" : ""}`}
            >
              <Bot className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* ─── LEFT: TIMER CARD ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card text-center ${showAI || showMusic ? "lg:col-span-5" : "lg:col-span-8"}`}
          >
            <div className="flex justify-center gap-2 mb-6">
              <span className={`badge ${!isBreak ? "badge-lavender" : "badge-mint"}`}>
                {!isBreak ? "🎯 Focus Time" : "☕ Break Time"}
              </span>
              {sessionCount > 0 && (
                <span className="badge bg-peach-100 text-peach-500">
                  🍅 {sessionCount} session{sessionCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <motion.div
  animate={{ scale: timerActive ? [1, 1.02, 1] : 1 }}
  transition={{ repeat: timerActive ? Infinity : 0, duration: 2 }}
  className="my-8"
>
  {/* Clickable / Editable Timer */}
  {editingTime && !timerActive ? (
    // ⭐ EDIT MODE: Input field
    <div className="flex items-center justify-center gap-2">
      <input
        type="number"
        min="1"
        max="120"
        value={customMinutes}
        onChange={(e) => setCustomMinutes(e.target.value)}
        onBlur={() => {
          const mins = parseInt(customMinutes);
          if (mins > 0 && mins <= 120) {
            if (isBreak) {
              setBreakDuration(mins);
            } else {
              setFocusDuration(mins);
            }
          }
          setEditingTime(false);
          setCustomMinutes("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const mins = parseInt(customMinutes);
            if (mins > 0 && mins <= 120) {
              if (isBreak) {
                setBreakDuration(mins);
              } else {
                setFocusDuration(mins);
              }
            }
            setEditingTime(false);
            setCustomMinutes("");
          }
          if (e.key === "Escape") {
            setEditingTime(false);
            setCustomMinutes("");
          }
        }}
        autoFocus
        placeholder="25"
        className="text-6xl font-bold text-center w-40 bg-transparent border-b-2 border-lavender-300 focus:outline-none focus:border-lavender-500 font-display"
      />
      <span className="text-3xl text-gray-400 font-display">min</span>
    </div>
  ) : (
    // ⭐ DISPLAY MODE: Click to edit
    <motion.button
      whileHover={!timerActive ? { scale: 1.02 } : {}}
      onClick={() => {
        if (!timerActive) {
          setEditingTime(true);
          setCustomMinutes(Math.floor(timeLeft / 60).toString());
        }
      }}
      className={`text-7xl font-bold text-gradient font-display tracking-tight group relative ${
        !timerActive ? "cursor-pointer hover:opacity-80" : "cursor-default"
      }`}
    >
      {formatTime(timeLeft)}
      {!timerActive && (
        <Edit3 className="w-5 h-5 absolute -top-1 -right-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  )}
  
  <p className="text-sm text-gray-400 mt-2">
    {editingTime 
      ? "Type minutes (1-120) and press Enter" 
      : !timerActive 
        ? "Click time to edit" 
        : !isBreak 
          ? "Stay focused, you got this!" 
          : "Take a deep breath"}
  </p>

  {/* ⭐ QUICK PRESET BUTTONS (only when not running) */}
  {!timerActive && !editingTime && (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap justify-center gap-2 mt-4"
    >
      <span className="text-xs text-gray-500 font-semibold self-center mr-2">
        {isBreak ? "☕ Break:" : "🎯 Focus:"}
      </span>
      {(isBreak ? [5, 10, 15, 20] : [15, 25, 45, 60]).map((mins) => (
        <motion.button
          key={mins}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isBreak) {
              setBreakDuration(mins);
            } else {
              setFocusDuration(mins);
            }
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            Math.floor(timerDuration / 60) === mins
              ? isBreak
                ? "bg-mint-300 text-white shadow-soft"
                : "bg-lavender-300 text-white shadow-soft"
              : "bg-white text-gray-600 border border-lavender-200 hover:bg-lavender-50"
          }`}
        >
          {mins}m
        </motion.button>
      ))}
      <motion.button
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditingTime(true);
          setCustomMinutes(Math.floor(timerDuration / 60).toString());
        }}
        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-gray-600 border border-lavender-200 hover:bg-lavender-50 flex items-center gap-1"
      >
        <Edit3 className="w-3 h-3" />
        Custom
      </motion.button>
    </motion.div>
  )}
</motion.div>

            <div className="w-full h-2 bg-lavender-100 rounded-full overflow-hidden mb-6">
              <motion.div
                className={`h-full ${!isBreak ? "bg-lavender-300" : "bg-mint-300"}`}
                animate={{
                  width: `${((timerDuration - timeLeft) / timerDuration) * 100}%`,
                }}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`px-8 py-3 rounded-2xl font-semibold shadow-soft flex items-center gap-2 ${
                  timerActive
                    ? "bg-blush-300 text-white hover:bg-blush-400"
                    : "bg-lavender-300 text-white hover:bg-lavender-400"
                }`}
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timerActive ? "Pause" : "Start"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="px-6 py-3 bg-white border border-lavender-200 text-gray-600 rounded-2xl font-semibold"
              >
                Reset
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={skipSession}
                className="btn-icon"
                title="Skip to next session"
              >
                <SkipForward className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8">
              <div className="bg-lavender-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Doubts Asked</p>
                <p className="text-xl font-bold text-lavender-500">{doubtsAsked}</p>
              </div>
              <div className="bg-mint-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Music</p>
                <p className="text-xl">{isMusicPlaying ? "🎵" : "🔇"}</p>
              </div>
              <div className="bg-peach-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Sessions</p>
                <p className="text-xl font-bold text-peach-500">{sessionCount + 1}</p>
              </div>
            </div>
          </motion.div>

          {/* ─── MIDDLE: AI DOUBT SOLVER ─── */}
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="card flex flex-col h-[600px] lg:col-span-4"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-lavender-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-700 font-display">AI Doubt Solver</h3>
                      <p className="text-xs text-gray-400">Saved for mock test</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAI(false)} className="btn-icon">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {doubts.length === 0 ? (
                    <div className="text-center py-8">
                      <Lightbulb className="w-12 h-12 mx-auto text-lavender-300 mb-3" />
                      <p className="text-sm text-gray-500">No doubts yet</p>
                      <p className="text-xs text-gray-400 mt-1">Stuck on something? Just ask!</p>
                    </div>
                  ) : (
                    doubts.map((doubt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${doubt.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl ${
                            doubt.role === "user"
                              ? "bg-lavender-300 text-white rounded-br-sm"
                              : "bg-cream text-gray-700 rounded-bl-sm"
                          }`}
                        >
                          {doubt.loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : (
                            <>
                              <div className="prose prose-sm max-w-none">
                                <MarkdownRenderer isUser={doubt.role === "user"}>
                                  {doubt.text}
                                </MarkdownRenderer>
                              </div>
                              
                              {doubt.keyPoints && doubt.keyPoints.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-lavender-200">
                                  <p className="text-xs font-semibold mb-1 text-lavender-600">📌 Key Points:</p>
                                  <ul className="text-xs space-y-1 text-gray-700">
                                    {doubt.keyPoints.map((kp, j) => (
                                      <li key={j} className="flex items-start gap-1">
                                        <span className="text-lavender-400">•</span>
                                        <span>{kp}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {doubt.relatedQuestions && doubt.relatedQuestions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-lavender-200">
                                  <p className="text-xs font-semibold mb-2 text-mint-600">💡 You might also ask:</p>
                                  <div className="space-y-1.5">
                                    {doubt.relatedQuestions.map((rq, j) => (
                                      <motion.button
                                        key={j}
                                        whileHover={{ x: 2 }}
                                        onClick={() => handleQuickAsk(rq)}
                                        disabled={askingAI}
                                        className="block w-full text-left text-xs p-2 rounded-lg bg-mint-50 hover:bg-mint-100 text-gray-700 transition-colors disabled:opacity-50"
                                      >
                                        → {rq}
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {doubt.saved && (
                                <p className="text-xs mt-2 italic text-gray-400">
                                  ✓ Saved for mock test
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !askingAI && handleAskAI()}
                    placeholder="Ask your doubt..."
                    disabled={askingAI}
                    className="input flex-1"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAskAI}
                    disabled={!currentQuestion.trim() || askingAI}
                    className={`px-4 py-3 rounded-xl shadow-soft ${
                      currentQuestion.trim() && !askingAI
                        ? "bg-lavender-300 text-white hover:bg-lavender-400"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {askingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ⭐ MUSIC PLAYER (using your MusicPlayer component!) */}
          <AnimatePresence>
            {showMusic && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`${showAI ? "lg:col-span-3" : "lg:col-span-4"}`}
              >
                <MusicPlayer compact={false} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── RIGHT: QUICK ACTIONS SIDEBAR ─── */}
          {!showAI && !showMusic && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 space-y-4"
            >
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-lavender-500" />
                  <h3 className="font-bold text-gray-700 font-display">Quick Actions</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  ⏱️ Timer keeps running when you navigate away
                </p>

                <div className="space-y-3">
                {quickActions.map((action, i) => (
  <motion.button
    key={i}
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={action.onClick}
    className={`${action.bg} p-4 rounded-2xl hover:shadow-soft transition-all relative group w-full flex items-center gap-3`}
  >
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
      <action.icon className="w-5 h-5 text-white" />
    </div>
    <p className={`text-sm font-semibold ${action.text} flex-1 text-left`}>
      {action.label}
    </p>
    <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.button>
))}
                </div>
                {/* Add this near the Quick Actions */}
<div className="bg-lavender-50 border border-lavender-200 rounded-xl p-3 mt-3">
  <p className="text-xs text-gray-600">
    💡 <strong>Need help?</strong> Click the 🤖 bot icon (top right) — 
    your questions auto-save for mock tests!
  </p>
</div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-primary rounded-3xl p-5 text-white"
              >
                <Sparkles className="w-5 h-5 mb-2" />
                <p className="text-sm font-semibold mb-1">Pro Tip 💡</p>
                <p className="text-xs opacity-90">
                  The floating timer will follow you on any page. Click it to come back here!
                </p>
              </motion.div>

              <div className="card">
                <h3 className="text-sm font-bold text-gray-700 mb-3 font-display">📊 Session Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Doubts asked:</span>
                    <span className="font-bold text-lavender-500">{doubtsAsked}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sessions:</span>
                    <span className="font-bold text-peach-500">{sessionCount + 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-bold ${timerActive ? "text-mint-500" : "text-gray-400"}`}>
                      {timerActive ? "🟢 Active" : "⏸ Paused"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-primary rounded-3xl p-5 text-white text-center"
        >
          <Sparkles className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">
            <strong>{doubtsAsked} doubts</strong> saved for your next mock test!
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default StudyFocusPage;