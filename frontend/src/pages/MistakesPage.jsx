import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, Loader2, Lightbulb } from "lucide-react";
import { getMistakes } from "../services/aiService";

const MistakesPage = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState("all");

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const data = await getMistakes();
      setMistakes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const topics = ["all", ...new Set(mistakes.map((m) => m.topic).filter(Boolean))];
  const filtered = filterTopic === "all" ? mistakes : mistakes.filter((m) => m.topic === filterTopic);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">
                🎯 Mistakes Review
              </h1>
              <p className="text-xs text-gray-400">{mistakes.length} mistakes to learn from</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-lavender-400 animate-spin" />
          </div>
        ) : mistakes.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No mistakes yet!
            </h3>
            <p className="text-gray-500">
              Take some mock tests to start tracking what to improve
            </p>
          </div>
        ) : (
          <>
            {/* Topic Filter */}
            <div className="card mb-6">
              <p className="label mb-2">Filter by Topic</p>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterTopic(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      filterTopic === t
                        ? "bg-blush-300 text-white"
                        : "bg-blush-50 text-gray-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Mistakes List */}
            <div className="space-y-4">
              {filtered.map((m, i) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blush-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-blush-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-blush">{m.topic}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{m.question}</p>
                    </div>
                  </div>

                  {/* Your wrong answer */}
                  <div className="bg-blush-50 border border-blush-200 rounded-xl p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-blush-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blush-500 mb-1">Your Answer</p>
                        <p className="text-sm text-gray-700">{m.userAnswer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Correct answer */}
                  <div className="bg-mint-50 border border-mint-200 rounded-xl p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-mint-500 mb-1">Correct Answer</p>
                        <p className="text-sm text-gray-700">{m.correctAnswer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {m.explanation && (
                    <div className="bg-babyBlue-50 border border-babyBlue-200 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-babyBlue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-babyBlue-500 mb-1">Explanation</p>
                          <p className="text-sm text-gray-700">{m.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MistakesPage;