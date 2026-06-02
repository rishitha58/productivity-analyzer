import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Target, Calendar, CheckCircle2, Award,
  Sparkles, AlertTriangle, Loader2, RefreshCw, TrendingUp,
  Map, Star, Edit3, Trash2, Plus, X, Save
} from "lucide-react";
import { 
  getRoadmap, 
  updatePhase, 
  regenerateRoadmap, 
  getProductivityStats,
  updateGoal,
  createGoal,
  deleteGoal,
  editPhase
} from "../services/aiService";

const DURATION_OPTIONS = [
  "1 month", "2 months", "3 months", "6 months", 
  "1 year", "2 years", "3 years"
];

const GoalsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editingPhaseIdx, setEditingPhaseIdx] = useState(null);

  // Form states
  const [formGoal, setFormGoal] = useState("");
  const [formDuration, setFormDuration] = useState("6 months");
  const [formRegenRoadmap, setFormRegenRoadmap] = useState(true);
  const [saving, setSaving] = useState(false);

  // Phase edit state
  const [phaseEdit, setPhaseEdit] = useState({
    name: "",
    duration: "",
    focus: "",
    milestones: [],
    dailyHabits: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roadmapData, statsData] = await Promise.all([
        getRoadmap(),
        getProductivityStats(),
      ]);
      setData(roadmapData);
      setStats(statsData);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseChange = async (phaseName) => {
    try {
      await updatePhase(phaseName);
      await loadData();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate your roadmap? This will replace the current one.")) return;
    setRegenerating(true);
    try {
      await regenerateRoadmap();
      await loadData();
      alert("✅ New roadmap generated!");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setRegenerating(false);
    }
  };

  // ⭐ CREATE NEW GOAL (for users who skipped)
  const handleCreateGoal = async () => {
    if (!formGoal.trim()) {
      alert("Please enter your goal");
      return;
    }
    setSaving(true);
    try {
      await createGoal(formGoal.trim(), formDuration);
      setShowCreateModal(false);
      setFormGoal("");
      await loadData();
      alert("✅ Goal created with AI-generated roadmap!");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ⭐ UPDATE GOAL
  const handleUpdateGoal = async () => {
    if (!formGoal.trim()) {
      alert("Please enter your goal");
      return;
    }
    setSaving(true);
    try {
      await updateGoal(formGoal.trim(), formDuration, formRegenRoadmap);
      setShowEditGoalModal(false);
      await loadData();
      alert(formRegenRoadmap 
        ? "✅ Goal updated & new roadmap generated!" 
        : "✅ Goal updated!"
      );
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ⭐ DELETE GOAL
  const handleDeleteGoal = async () => {
    if (!confirm("⚠️ Delete your goal and entire roadmap? This cannot be undone.")) return;
    try {
      await deleteGoal();
      await loadData();
      alert("Goal deleted. You can create a new one anytime!");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  // ⭐ EDIT PHASE
  const openPhaseEdit = (idx, phase) => {
    setPhaseEdit({
      name: phase.name || "",
      duration: phase.duration || "",
      focus: phase.focus || "",
      milestones: [...(phase.milestones || [])],
      dailyHabits: [...(phase.dailyHabits || [])],
    });
    setEditingPhaseIdx(idx);
  };

  const handleSavePhase = async () => {
    setSaving(true);
    try {
      await editPhase(editingPhaseIdx, phaseEdit);
      setEditingPhaseIdx(null);
      await loadData();
      alert("✅ Phase updated!");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditGoal = () => {
    setFormGoal(data.goal || "");
    setFormDuration(data.duration || "6 months");
    setFormRegenRoadmap(false);
    setShowEditGoalModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-lavender-400 animate-spin" />
      </div>
    );
  }

  // ─── NO GOAL VIEW (with CREATE option!) ───
  if (!data?.goal) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="bg-white border-b border-lavender-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-700 font-display">🎯 My Goals</h1>
          </div>
        </header>
        <div className="max-w-6xl mx-auto p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-16"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-700 font-display mb-3">
              No goal set yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Set a long-term goal and let AI create a personalized roadmap with phases, 
              milestones, and daily habits to help you achieve it!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormGoal("");
                setFormDuration("6 months");
                setShowCreateModal(true);
              }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-2xl font-semibold shadow-soft flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Create My Goal
            </motion.button>
          </motion.div>
        </div>

        {/* CREATE GOAL MODAL */}
        <AnimatePresence>
          {showCreateModal && (
            <GoalModal
              title="🎯 Create Your Long-term Goal"
              formGoal={formGoal}
              setFormGoal={setFormGoal}
              formDuration={formDuration}
              setFormDuration={setFormDuration}
              showRegenOption={false}
              onClose={() => setShowCreateModal(false)}
              onSave={handleCreateGoal}
              saving={saving}
              saveLabel="Create Goal & Generate Roadmap"
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── HAS GOAL VIEW ───
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">🎯 My Goal</h1>
              <p className="text-xs text-gray-400">{data.duration}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* ⭐ EDIT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={openEditGoal}
              className="btn-icon"
              title="Edit goal"
            >
              <Edit3 className="w-5 h-5 text-gray-600" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleRegenerate}
              disabled={regenerating}
              className="btn-icon"
              title="Regenerate roadmap"
            >
              {regenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {/* ⭐ DELETE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleDeleteGoal}
              className="btn-icon"
              title="Delete goal"
            >
              <Trash2 className="w-5 h-5 text-blush-500" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* GOAL BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-3xl p-8 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <Target className="w-12 h-12 mx-auto mb-3 relative z-10" />
          <p className="text-xs uppercase tracking-wider mb-2 opacity-80 relative z-10">
            Long-term Goal
          </p>
          <h2 className="text-2xl font-bold font-display mb-3 relative z-10">
            {data.goal}
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm relative z-10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{data.duration}</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{stats?.overall?.goalProgress || 0}% progress</span>
            </div>
          </div>
        </motion.div>

        {/* PROGRESS */}
        {stats?.overall?.goalAlignedTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-base font-bold text-gray-700 font-display mb-4">
              📊 Your Progress
            </h3>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Goal-aligned tasks</span>
                <span className="text-sm font-bold text-gray-700">
                  {stats.overall.goalAlignedCompleted} / {stats.overall.goalAlignedTasks}
                </span>
              </div>
              <div className="w-full h-3 bg-lavender-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.overall.goalProgress}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-primary rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.overall.goalProgress}% of goal-related tasks completed
              </p>
            </div>
          </motion.div>
        )}

        {/* ROADMAP PHASES */}
        {data.roadmap?.phases && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center">
                <Map className="w-5 h-5 text-mint-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 font-display">
                Your Roadmap
              </h3>
            </div>

            {data.roadmap.phases.map((phase, i) => {
              const isCurrent = phase.name === data.currentPhase;
              const isExpanded = expandedPhase === i;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card transition-all ${
                    isCurrent ? "border-2 border-lavender-300 bg-lavender-50" : ""
                  }`}
                >
                  <div 
                    className="flex items-start gap-4 cursor-pointer"
                    onClick={() => setExpandedPhase(isExpanded ? null : i)}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isCurrent
                        ? "bg-gradient-primary text-white shadow-soft"
                        : "bg-lavender-100 text-lavender-500"
                    }`}>
                      {i + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-base font-bold text-gray-700 font-display">
                            {phase.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {phase.duration}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <span className="badge bg-lavender-300 text-white flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Current
                            </span>
                          )}
                          {/* ⭐ EDIT PHASE BUTTON */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openPhaseEdit(i, phase);
                            }}
                            className="p-1.5 hover:bg-lavender-100 rounded-lg"
                            title="Edit phase"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                          </motion.button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        🎯 <strong>Focus:</strong> {phase.focus}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4">
                              <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">
                                🏆 Milestones
                              </h5>
                              <ul className="space-y-2">
                                {phase.milestones?.map((m, mi) => (
                                  <li key={mi} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-mint-500 mt-0.5 flex-shrink-0" />
                                    {m}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {phase.dailyHabits?.length > 0 && (
                              <div className="mt-4 p-4 bg-babyBlue-50 rounded-2xl">
                                <h5 className="text-xs font-bold text-babyBlue-500 uppercase mb-2">
                                  🔄 Daily Habits
                                </h5>
                                <ul className="space-y-1">
                                  {phase.dailyHabits.map((h, hi) => (
                                    <li key={hi} className="text-sm text-gray-700">
                                      • {h}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {!isCurrent && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePhaseChange(phase.name);
                                }}
                                className="mt-4 px-4 py-2 bg-lavender-300 text-white text-xs font-semibold rounded-xl shadow-soft"
                              >
                                Set as Current Phase
                              </motion.button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CRITICAL SUCCESS FACTORS */}
        {data.roadmap?.criticalSuccess?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-ocean"
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-babyBlue-500" />
              <h3 className="text-base font-bold text-gray-700 font-display">
                Critical Success Factors
              </h3>
            </div>
            <ul className="space-y-2">
              {data.roadmap.criticalSuccess.map((cs, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-babyBlue-500 mt-0.5 flex-shrink-0" />
                  {cs}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* WARNING SIGN */}
        {data.roadmap?.warningSign && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-peach-50 border-2 border-peach-200"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-peach-500 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  ⚠️ Watch Out For
                </h3>
                <p className="text-sm text-gray-700">
                  {data.roadmap.warningSign}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* ⭐ EDIT GOAL MODAL */}
      <AnimatePresence>
        {showEditGoalModal && (
          <GoalModal
            title="✏️ Edit Your Goal"
            formGoal={formGoal}
            setFormGoal={setFormGoal}
            formDuration={formDuration}
            setFormDuration={setFormDuration}
            showRegenOption={true}
            formRegenRoadmap={formRegenRoadmap}
            setFormRegenRoadmap={setFormRegenRoadmap}
            onClose={() => setShowEditGoalModal(false)}
            onSave={handleUpdateGoal}
            saving={saving}
            saveLabel={formRegenRoadmap ? "Save & Regenerate Roadmap" : "Save Changes"}
          />
        )}
      </AnimatePresence>

      {/* ⭐ EDIT PHASE MODAL */}
      <AnimatePresence>
        {editingPhaseIdx !== null && (
          <PhaseEditModal
            phaseEdit={phaseEdit}
            setPhaseEdit={setPhaseEdit}
            onClose={() => setEditingPhaseIdx(null)}
            onSave={handleSavePhase}
            saving={saving}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

// ⭐ GOAL MODAL COMPONENT
const GoalModal = ({ 
  title, formGoal, setFormGoal, formDuration, setFormDuration, 
  showRegenOption, formRegenRoadmap, setFormRegenRoadmap,
  onClose, onSave, saving, saveLabel 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-700 font-display">{title}</h2>
        <button onClick={onClose} className="btn-icon">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Your Goal</label>
          <textarea
            value={formGoal}
            onChange={(e) => setFormGoal(e.target.value)}
            placeholder="e.g. Get a job in AI/ML field, Become a senior developer, Master DSA..."
            rows={3}
            className="textarea"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 Be specific. AI will create a roadmap based on this.
          </p>
        </div>

        <div>
          <label className="label">Duration</label>
          <select
            value={formDuration}
            onChange={(e) => setFormDuration(e.target.value)}
            className="input"
          >
            {DURATION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {showRegenOption && (
          <div className="p-3 bg-peach-50 border border-peach-200 rounded-xl">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formRegenRoadmap}
                onChange={(e) => setFormRegenRoadmap(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  🔄 Regenerate roadmap
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  AI will create a new roadmap based on your updated goal. 
                  Current roadmap will be replaced.
                </p>
              </div>
            </label>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={!formGoal.trim() || saving}
          className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
            formGoal.trim() && !saving
              ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saveLabel}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// ⭐ PHASE EDIT MODAL COMPONENT
const PhaseEditModal = ({ phaseEdit, setPhaseEdit, onClose, onSave, saving }) => {
  const updateMilestone = (idx, value) => {
    const newMilestones = [...phaseEdit.milestones];
    newMilestones[idx] = value;
    setPhaseEdit({ ...phaseEdit, milestones: newMilestones });
  };

  const addMilestone = () => {
    setPhaseEdit({ ...phaseEdit, milestones: [...phaseEdit.milestones, ""] });
  };

  const removeMilestone = (idx) => {
    setPhaseEdit({ 
      ...phaseEdit, 
      milestones: phaseEdit.milestones.filter((_, i) => i !== idx) 
    });
  };

  const updateHabit = (idx, value) => {
    const newHabits = [...phaseEdit.dailyHabits];
    newHabits[idx] = value;
    setPhaseEdit({ ...phaseEdit, dailyHabits: newHabits });
  };

  const addHabit = () => {
    setPhaseEdit({ ...phaseEdit, dailyHabits: [...phaseEdit.dailyHabits, ""] });
  };

  const removeHabit = (idx) => {
    setPhaseEdit({ 
      ...phaseEdit, 
      dailyHabits: phaseEdit.dailyHabits.filter((_, i) => i !== idx) 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700 font-display">✏️ Edit Phase</h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Phase Name</label>
            <input
              type="text"
              value={phaseEdit.name}
              onChange={(e) => setPhaseEdit({ ...phaseEdit, name: e.target.value })}
              className="input"
              placeholder="e.g. Foundation"
            />
          </div>

          <div>
            <label className="label">Duration</label>
            <input
              type="text"
              value={phaseEdit.duration}
              onChange={(e) => setPhaseEdit({ ...phaseEdit, duration: e.target.value })}
              className="input"
              placeholder="e.g. 2 months"
            />
          </div>

          <div>
            <label className="label">Focus</label>
            <textarea
              value={phaseEdit.focus}
              onChange={(e) => setPhaseEdit({ ...phaseEdit, focus: e.target.value })}
              className="textarea"
              rows={2}
              placeholder="What's the main focus of this phase?"
            />
          </div>

          {/* MILESTONES */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">🏆 Milestones</label>
              <button
                onClick={addMilestone}
                className="text-xs text-lavender-500 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {phaseEdit.milestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => updateMilestone(idx, e.target.value)}
                    className="input flex-1"
                    placeholder="Milestone..."
                  />
                  <button
                    onClick={() => removeMilestone(idx)}
                    className="btn-icon text-blush-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {phaseEdit.milestones.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No milestones yet. Click "Add" to create one.
                </p>
              )}
            </div>
          </div>

          {/* DAILY HABITS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">🔄 Daily Habits</label>
              <button
                onClick={addHabit}
                className="text-xs text-lavender-500 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {phaseEdit.dailyHabits.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHabit(idx, e.target.value)}
                    className="input flex-1"
                    placeholder="Daily habit..."
                  />
                  <button
                    onClick={() => removeHabit(idx)}
                    className="btn-icon text-blush-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {phaseEdit.dailyHabits.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No habits yet. Click "Add" to create one.
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={saving}
            className="w-full py-3 bg-lavender-300 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-soft hover:bg-lavender-400"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Phase
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GoalsPage;