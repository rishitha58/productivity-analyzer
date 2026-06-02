import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, FileText, CheckCircle2, XCircle, Loader2,
  Sparkles, X, Trophy, Brain, AlertCircle, MessageCircle,
  StickyNote, Search, Check
} from "lucide-react";
import {
  getMockTests, generateMockTest, generateTestFromDoubts,
  generateTestFromNotes, // ⭐ NEW
  submitMockTest, getAllDoubts, getNotes // ⭐ NEW
} from "../services/aiService";

const MockTestsPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [notes, setNotes] = useState([]); // ⭐ NEW
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Form
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [testSource, setTestSource] = useState("topic");
  
  // ⭐ NEW: Notes selection
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [noteSearch, setNoteSearch] = useState("");

  // Active test
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testsData, doubtsData, notesData] = await Promise.all([
        getMockTests(),
        getAllDoubts(),
        getNotes(), // ⭐ NEW
      ]);
      setTests(Array.isArray(testsData) ? testsData : []);
      setDoubts(Array.isArray(doubtsData) ? doubtsData : []);
      setNotes(Array.isArray(notesData) ? notesData : []); // ⭐ NEW
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    // Validations per source
    if (testSource === "topic" && !topic.trim()) {
      alert("Please enter a topic");
      return;
    }
    if (testSource === "doubts" && doubts.length === 0) {
      alert("No doubts available! Ask questions in Focus Mode first.");
      return;
    }
    if (testSource === "notes" && selectedNoteIds.length === 0) {
      alert("Please select at least one note");
      return;
    }

    setGenerating(true);
    try {
      let test;
      if (testSource === "doubts") {
        test = await generateTestFromDoubts(topic || null, numQuestions);
      } else if (testSource === "notes") {
        test = await generateTestFromNotes(selectedNoteIds, numQuestions); // ⭐ NEW
      } else {
        test = await generateMockTest(topic, numQuestions);
      }
      
      // Reset form
      setShowCreate(false);
      setTopic("");
      setSelectedNoteIds([]);
      setNoteSearch("");
      
      await loadData();
      setActiveTest(test);
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  // ⭐ NEW: Toggle note selection
  const toggleNoteSelection = (noteId) => {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  // ⭐ NEW: Filter notes by search
  const filteredNotes = notes.filter((note) => {
    const search = noteSearch.toLowerCase();
    return (
      note.title?.toLowerCase().includes(search) ||
      note.content?.toLowerCase().includes(search) ||
      note.category?.toLowerCase().includes(search)
    );
  });

  // ⭐ NEW: Calculate total content length of selected notes
  const selectedContentLength = notes
    .filter((n) => selectedNoteIds.includes(n._id))
    .reduce((sum, n) => sum + (n.content?.length || 0), 0);

  const handleAnswer = (qIndex, ansIndex) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: ansIndex });
  };

  const handleSubmit = async () => {
    try {
      const result = await submitMockTest(activeTest._id, answers);
      setActiveTest(result);
      setSubmitted(true);
      await loadData();
    } catch (e) {
      alert("Submit failed: " + e.message);
    }
  };

  const startTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setSubmitted(test.completed || false);
  };

  const closeTest = () => {
    setActiveTest(null);
    setAnswers({});
    setSubmitted(false);
  };

  // ⭐ NEW: Color map for note categories
  const getNoteColor = (color) => {
    const colors = {
      lavender: "bg-lavender-50 border-lavender-200",
      peach: "bg-peach-50 border-peach-200",
      mint: "bg-mint-50 border-mint-200",
      babyBlue: "bg-babyBlue-50 border-babyBlue-200",
      yellow: "bg-yellow-50 border-yellow-200",
    };
    return colors[color] || colors.lavender;
  };

  // ─── TEST TAKING VIEW (unchanged) ───
  if (activeTest) {
    const score = submitted ? activeTest.score : 0;
    const total = activeTest.totalQuestions;

    return (
      <div className="min-h-screen bg-cream">
        <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={closeTest} className="btn-icon">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-700 font-display">
                  📝 {activeTest.topic}
                </h1>
                <p className="text-xs text-gray-400">
                  {total} questions
                  {activeTest.source === "notes" && " • From your notes 📝"}
                  {activeTest.source === "doubts" && " • From your doubts 💬"}
                </p>
              </div>
            </div>

            {!submitted && Object.keys(answers).length === total && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSubmit}
                className="btn-primary"
              >
                Submit Test
              </motion.button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card mb-6 text-center ${
                score / total >= 0.7 ? "bg-mint-50" : "bg-peach-50"
              }`}
            >
              <Trophy className={`w-16 h-16 mx-auto mb-3 ${
                score / total >= 0.7 ? "text-mint-500" : "text-peach-500"
              }`} />
              <h2 className="text-3xl font-bold text-gray-700 font-display mb-2">
                {score} / {total}
              </h2>
              <p className="text-gray-500">
                {score / total >= 0.7 ? "Excellent work! 🎉" : "Keep practicing! 💪"}
              </p>
            </motion.div>
          )}

          <div className="space-y-6">
            {activeTest.questions.map((q, qi) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.05 }}
                className="card"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-xs font-bold text-lavender-500 mt-1">
                    Q{qi + 1}
                  </span>
                  <p className="flex-1 text-gray-700 font-medium">{q.question}</p>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const isCorrect = submitted && oi === q.correctIndex;
                    const isWrong = submitted && isSelected && oi !== q.correctIndex;

                    return (
                      <motion.button
                        key={oi}
                        whileHover={!submitted ? { x: 4 } : {}}
                        onClick={() => handleAnswer(qi, oi)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          isCorrect
                            ? "border-mint-300 bg-mint-50"
                            : isWrong
                            ? "border-blush-300 bg-blush-50"
                            : isSelected
                            ? "border-lavender-300 bg-lavender-50"
                            : "border-lavender-100 hover:border-lavender-200"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCorrect ? "bg-mint-300 text-white" :
                          isWrong ? "bg-blush-300 text-white" :
                          isSelected ? "bg-lavender-300 text-white" :
                          "bg-lavender-100 text-gray-500"
                        }`}>
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <span className="text-sm text-gray-700 flex-1">{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-mint-500" />}
                        {isWrong && <XCircle className="w-5 h-5 text-blush-500" />}
                      </motion.button>
                    );
                  })}
                </div>

                {submitted && q.explanation && (
                  <div className="mt-4 p-3 bg-babyBlue-50 rounded-xl">
                    <p className="text-xs font-semibold text-babyBlue-500 mb-1">💡 Explanation</p>
                    <p className="text-xs text-gray-700">{q.explanation}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {!submitted && Object.keys(answers).length < total && (
            <p className="text-center text-sm text-gray-400 mt-6">
              {Object.keys(answers).length} of {total} answered
            </p>
          )}
        </main>
      </div>
    );
  }

  // ─── TESTS LIST VIEW ───
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">📝 Mock Tests</h1>
              <p className="text-xs text-gray-400">
                {tests.length} tests • {doubts.length} doubts • {notes.length} notes
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Test
          </motion.button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Doubts Info Banner */}
        {doubts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-4 bg-gradient-ocean"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-babyBlue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">
                  You have {doubts.length} doubts from Focus Mode!
                </p>
                <p className="text-xs text-gray-600">
                  Generate a personalized test based on what you asked
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setTestSource("doubts");
                  setShowCreate(true);
                }}
                className="px-4 py-2 bg-white text-babyBlue-500 rounded-xl text-xs font-bold"
              >
                Generate Now →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ⭐ NEW: Notes Info Banner */}
        {notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6 bg-gradient-to-r from-mint-50 to-lavender-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
                <StickyNote className="w-6 h-6 text-mint-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">
                  📝 Test yourself on your notes!
                </p>
                <p className="text-xs text-gray-600">
                  {notes.length} notes available — pick any to create a test
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setTestSource("notes");
                  setShowCreate(true);
                }}
                className="px-4 py-2 bg-white text-mint-500 rounded-xl text-xs font-bold"
              >
                Select Notes →
              </motion.button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-lavender-400 animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No tests yet
            </h3>
            <p className="text-gray-500 mb-6">
              Generate from a topic, your doubts, or your notes!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Create Test
            </motion.button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test, i) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                onClick={() => startTest(test)}
                className="card cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    test.source === "notes" ? "bg-gradient-to-br from-mint-300 to-lavender-300" :
                    test.source === "doubts" ? "bg-gradient-to-br from-babyBlue-300 to-lavender-300" :
                    "bg-gradient-primary"
                  }`}>
                    {test.source === "notes" ? (
                      <StickyNote className="w-5 h-5 text-white" />
                    ) : test.source === "doubts" ? (
                      <MessageCircle className="w-5 h-5 text-white" />
                    ) : (
                      <FileText className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {test.completed && (
                    <span className={`badge ${
                      test.score / test.totalQuestions >= 0.7
                        ? "badge-mint" : "badge-peach"
                    }`}>
                      {test.score}/{test.totalQuestions}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-700 mb-1">{test.topic}</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {test.totalQuestions} questions
                  {test.source === "notes" && " • from notes"}
                  {test.source === "doubts" && " • from doubts"}
                </p>

                <div className="flex items-center gap-2">
                  {test.completed ? (
                    <span className="text-xs text-gray-500">✓ Completed</span>
                  ) : (
                    <span className="text-xs text-lavender-500 font-semibold">▶ Start Test</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-700 font-display">
                  ✨ Generate Mock Test
                </h2>
                <button onClick={() => setShowCreate(false)} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* ⭐ UPDATED: 3 Source Options */}
                <div>
                  <label className="label">Generate From</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTestSource("topic")}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        testSource === "topic"
                          ? "border-lavender-300 bg-lavender-50"
                          : "border-lavender-100"
                      }`}
                    >
                      <Brain className="w-5 h-5 mx-auto mb-1 text-lavender-500" />
                      <p className="text-xs font-semibold">Topic</p>
                      <p className="text-[10px] text-gray-400">Fresh</p>
                    </button>
                    <button
                      onClick={() => setTestSource("doubts")}
                      disabled={doubts.length === 0}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        doubts.length === 0
                          ? "opacity-50 cursor-not-allowed border-gray-200"
                          : testSource === "doubts"
                          ? "border-lavender-300 bg-lavender-50"
                          : "border-lavender-100"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 mx-auto mb-1 text-babyBlue-500" />
                      <p className="text-xs font-semibold">Doubts</p>
                      <p className="text-[10px] text-gray-400">{doubts.length} saved</p>
                    </button>
                    {/* ⭐ NEW: Notes Option */}
                    <button
                      onClick={() => setTestSource("notes")}
                      disabled={notes.length === 0}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        notes.length === 0
                          ? "opacity-50 cursor-not-allowed border-gray-200"
                          : testSource === "notes"
                          ? "border-lavender-300 bg-lavender-50"
                          : "border-lavender-100"
                      }`}
                    >
                      <StickyNote className="w-5 h-5 mx-auto mb-1 text-mint-500" />
                      <p className="text-xs font-semibold">Notes</p>
                      <p className="text-[10px] text-gray-400">{notes.length} saved</p>
                    </button>
                  </div>

                  {testSource === "doubts" && doubts.length === 0 && (
                    <p className="text-xs text-blush-500 mt-2">
                      ⚠️ Ask questions in Focus Mode to use this
                    </p>
                  )}
                  {testSource === "notes" && notes.length === 0 && (
                    <p className="text-xs text-blush-500 mt-2">
                      ⚠️ Create notes first to use this option
                    </p>
                  )}
                </div>

                {/* TOPIC INPUT (for topic & doubts source) */}
                {testSource !== "notes" && (
                  <div>
                    <label className="label">
                      {testSource === "topic" ? "Topic Name" : "Filter Doubts by Topic (optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder={testSource === "topic" ? "e.g. Binary Search" : "Leave empty for all"}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="input"
                    />
                  </div>
                )}

                {/* ⭐ NEW: NOTES SELECTOR */}
                {testSource === "notes" && (
                  <div>
                    <label className="label">
                      Select Notes ({selectedNoteIds.length} selected)
                    </label>

                    {/* Search bar */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notes..."
                        value={noteSearch}
                        onChange={(e) => setNoteSearch(e.target.value)}
                        className="input pl-10"
                      />
                    </div>

                    {/* Selected info */}
                    {selectedNoteIds.length > 0 && (
                      <div className="mb-2 p-2 bg-lavender-50 rounded-xl flex items-center justify-between">
                        <p className="text-xs text-gray-600">
                          ✓ {selectedNoteIds.length} notes • ~{selectedContentLength} chars
                        </p>
                        <button
                          onClick={() => setSelectedNoteIds([])}
                          className="text-xs text-blush-500 hover:underline font-semibold"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Notes list */}
                    <div className="max-h-64 overflow-y-auto space-y-2 border border-lavender-100 rounded-xl p-2">
                      {filteredNotes.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-4">
                          No notes match your search
                        </p>
                      ) : (
                        filteredNotes.map((note) => {
                          const isSelected = selectedNoteIds.includes(note._id);
                          return (
                            <motion.button
                              key={note._id}
                              whileHover={{ x: 2 }}
                              onClick={() => toggleNoteSelection(note._id)}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                                isSelected
                                  ? "border-lavender-300 bg-lavender-50"
                                  : `border-transparent ${getNoteColor(note.color)} hover:border-lavender-200`
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-lavender-400 border-lavender-400"
                                  : "border-gray-300 bg-white"
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-700 truncate">
                                  {note.pinned && "📌 "}{note.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                  {note.content || "(empty)"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] px-2 py-0.5 bg-white/60 rounded-full text-gray-500">
                                    {note.category}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {note.content?.length || 0} chars
                                  </span>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })
                      )}
                    </div>

                    {selectedContentLength > 0 && selectedContentLength < 100 && (
                      <p className="text-xs text-yellow-600 mt-2">
                        ⚠️ Selected notes are short — consider selecting more for better questions
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="label">Number of Questions</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="input"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleGenerate}
                  disabled={
                    generating ||
                    (testSource === "topic" && !topic.trim()) ||
                    (testSource === "doubts" && doubts.length === 0) ||
                    (testSource === "notes" && selectedNoteIds.length === 0)
                  }
                  className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
                    !generating &&
                    ((testSource === "topic" && topic.trim()) ||
                      (testSource === "doubts" && doubts.length > 0) ||
                      (testSource === "notes" && selectedNoteIds.length > 0))
                      ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Test
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockTestsPage;