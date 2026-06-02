import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Calendar,
  TrendingUp,
  Award,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
} from 'lucide-react';
import MilestoneCard from './MilestoneCard';
import { useGoals } from '../../hooks/useGoals';
import { formatDate, getDaysUntil } from '../../utils/dateHelper';
import { ConfirmModal } from '../common/Modal';

const GoalProgress = ({ goal, onEdit, onDelete }) => {
  const { completeMilestone, calculateGoalProgress } = useGoals();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!goal) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-lavender-100">
        <Target size={48} className="text-lavender-300 mx-auto mb-3" />
        <p className="text-gray-500">Select a goal to view progress</p>
      </div>
    );
  }

  const progress = calculateGoalProgress(goal);
  const completedMilestones =
    goal.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  const daysLeft = goal.deadline ? getDaysUntil(goal.deadline) : null;

  // Get category gradient
  const categoryGradients = {
    career: 'from-babyBlue-300 to-lavender-300',
    education: 'from-lavender-300 to-peach-300',
    health: 'from-blush-300 to-peach-300',
    finance: 'from-mint-300 to-softGreen-300',
    learning: 'from-peach-300 to-yellow-300',
    fitness: 'from-softGreen-300 to-mint-300',
  };
  const gradient = categoryGradients[goal.category] || categoryGradients.career;

  const handleComplete = async (milestoneId) => {
    await completeMilestone(goal.id, milestoneId);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) await onDelete(goal.id);
    setDeleteConfirm(false);
  };

  return (
    <div className="space-y-5">
      {/* Goal Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl shadow-medium`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative p-6 md:p-8 text-white">
          {/* Top row */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Target size={26} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                  {goal.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-display font-bold mt-1">
                  {goal.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(goal)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-blush-400/40 backdrop-blur-sm transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {goal.description && (
            <p className="text-white/90 text-sm leading-relaxed mb-5 max-w-2xl">
              {goal.description}
            </p>
          )}

          {/* Progress section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={16} /> Progress
              </span>
              <span className="text-3xl font-display font-bold">
                {progress}%
              </span>
            </div>

            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full shadow-glow"
              />
            </div>

            {progress === 100 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-semibold flex items-center gap-2 mt-2"
              >
                <Sparkles size={16} /> Goal Achieved! Congratulations! 🎉
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={`${completedMilestones}/${totalMilestones}`}
          color="mint"
        />
        <StatCard
          icon={Calendar}
          label="Days Left"
          value={daysLeft !== null ? `${daysLeft}d` : '—'}
          color="babyBlue"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${goal.streak || 0} days`}
          color="peach"
        />
        <StatCard
          icon={Award}
          label="Phase"
          value={`${Math.min(completedMilestones + 1, totalMilestones)}/${totalMilestones}`}
          color="lavender"
        />
      </motion.div>

      {/* Milestones Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 shadow-soft border border-lavender-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center">
            <Award className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-gray-800">
              Milestones Roadmap
            </h3>
            <p className="text-xs text-gray-500">
              Your journey to achieving this goal
            </p>
          </div>
        </div>

        {!goal.milestones || goal.milestones.length === 0 ? (
          <div className="text-center py-10">
            <Clock size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No milestones yet. AI is generating your roadmap...
            </p>
          </div>
        ) : (
          <div>
            {goal.milestones.map((milestone, idx) => (
              <MilestoneCard
                key={milestone.id || idx}
                milestone={milestone}
                index={idx}
                totalMilestones={goal.milestones.length}
                onComplete={handleComplete}
                isLocked={
                  idx > 0 && !goal.milestones[idx - 1]?.completed
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal?"
        message={`Are you sure you want to delete "${goal.title}"? All milestones and progress will be lost.`}
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

// Stat Card Subcomponent
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    mint: 'from-mint-200 to-softGreen-200 text-mint-500',
    babyBlue: 'from-babyBlue-200 to-lavender-200 text-babyBlue-500',
    peach: 'from-peach-200 to-blush-200 text-peach-500',
    lavender: 'from-lavender-200 to-babyBlue-200 text-lavender-500',
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="bg-white rounded-2xl p-4 shadow-soft border border-lavender-100"
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-display font-bold text-lg text-gray-800">{value}</p>
    </motion.div>
  );
};

export default GoalProgress;