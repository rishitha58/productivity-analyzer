import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calendar,
  Sparkles,
  Plus,
  X,
  Loader2,
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
  BookOpen,
  Dumbbell,
} from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';
import Modal from '../common/Modal';

const goalCategories = [
  { id: 'career', label: 'Career', icon: Briefcase, color: 'babyBlue' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'lavender' },
  { id: 'health', label: 'Health', icon: Heart, color: 'blush' },
  { id: 'finance', label: 'Finance', icon: TrendingUp, color: 'mint' },
  { id: 'learning', label: 'Learning', icon: BookOpen, color: 'peach' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'softGreen' },
];

const durationOptions = [
  { value: 30, label: '1 Month', emoji: '🌱' },
  { value: 90, label: '3 Months', emoji: '🌿' },
  { value: 180, label: '6 Months', emoji: '🌳' },
  { value: 365, label: '1 Year', emoji: '🎯' },
  { value: 730, label: '2 Years', emoji: '🚀' },
];

const GoalSetter = ({ isOpen, onClose, onGoalCreated }) => {
  const { createGoal, loading } = useGoals();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'career',
    duration: 90,
    startDate: new Date().toISOString().split('T')[0],
    customMilestones: [],
  });

  const [customMilestoneInput, setCustomMilestoneInput] = useState('');

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setFormData({
        title: '',
        description: '',
        category: 'career',
        duration: 90,
        startDate: new Date().toISOString().split('T')[0],
        customMilestones: [],
      });
    }, 300);
  };

  const addCustomMilestone = () => {
    if (!customMilestoneInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      customMilestones: [...prev.customMilestones, customMilestoneInput.trim()],
    }));
    setCustomMilestoneInput('');
  };

  const removeMilestone = (idx) => {
    setFormData((prev) => ({
      ...prev,
      customMilestones: prev.customMilestones.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    const result = await createGoal(formData);
    if (result.success) {
      if (onGoalCreated) onGoalCreated(result.data);
      handleClose();
    }
  };

  const selectedCategory = goalCategories.find((c) => c.id === formData.category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title=""
      showCloseButton={true}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center shadow-soft"
        >
          <Target className="text-white" size={28} />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-gradient-primary">
          Set Your Goal
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Step {step} of 3 - Let's build your roadmap! 🚀
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-gradient-to-r from-lavender-400 to-babyBlue-400'
                  : s < step
                  ? 'w-1.5 bg-mint-400'
                  : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Info */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                What's your goal? 🎯
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Land my dream software engineer job"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Why is this important to you? 💭
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your motivation and what success looks like..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {goalCategories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                      formData.category === cat.id
                        ? `bg-${cat.color}-100 border-${cat.color}-300 shadow-soft`
                        : 'bg-white border-gray-200 hover:border-lavender-200'
                    }`}
                  >
                    <cat.icon
                      size={20}
                      className={
                        formData.category === cat.id
                          ? `text-${cat.color}-500`
                          : 'text-gray-400'
                      }
                    />
                    <span
                      className={`text-xs font-medium ${
                        formData.category === cat.id
                          ? 'text-gray-800'
                          : 'text-gray-500'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Duration */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                How long will this take? ⏳
              </label>
              <div className="space-y-2">
                {durationOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() =>
                      setFormData({ ...formData, duration: opt.value })
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      formData.duration === opt.value
                        ? 'bg-gradient-to-r from-lavender-100 to-babyBlue-100 border-lavender-300 shadow-soft'
                        : 'bg-white border-gray-200 hover:border-lavender-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.value} days</p>
                      </div>
                    </div>
                    {formData.duration === opt.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-lavender-400 to-babyBlue-400 flex items-center justify-center"
                      >
                        <Sparkles size={12} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Start Date
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="input-field pl-11"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Custom Milestones (Optional) */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Add Custom Milestones (Optional) ✨
              </label>
              <p className="text-xs text-gray-500 mb-3">
                AI will generate milestones, but you can add your own too!
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customMilestoneInput}
                  onChange={(e) => setCustomMilestoneInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomMilestone()}
                  placeholder="e.g., Complete React course"
                  className="input-field flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addCustomMilestone}
                  className="px-4 bg-gradient-to-r from-mint-300 to-softGreen-300 text-white rounded-xl shadow-soft hover:shadow-medium transition-all"
                >
                  <Plus size={20} />
                </motion.button>
              </div>

              {/* Custom milestones list */}
              {formData.customMilestones.length > 0 && (
                <div className="space-y-2">
                  {formData.customMilestones.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 bg-mint-50 rounded-xl border border-mint-200"
                    >
                      <div className="w-6 h-6 rounded-lg bg-mint-300 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="flex-1 text-sm text-gray-700">{m}</span>
                      <button
                        onClick={() => removeMilestone(idx)}
                        className="text-blush-400 hover:text-blush-500"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-5 bg-gradient-to-br from-lavender-50 via-peach-50 to-mint-50 rounded-2xl border border-lavender-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-lavender-500" />
                Goal Summary
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Title:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {formData.title || 'Untitled goal'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Category:</span>{' '}
                  <span className="font-medium text-gray-800 capitalize">
                    {selectedCategory.label}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Duration:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {durationOptions.find((d) => d.value === formData.duration)?.label}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Custom milestones:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {formData.customMilestones.length}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-lavender-100">
        <button
          onClick={step === 1 ? handleClose : handleBack}
          className="btn-outline"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={step === 1 && !formData.title.trim()}
            onClick={handleNext}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading || !formData.title.trim()}
            onClick={handleSubmit}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Create Goal
              </>
            )}
          </motion.button>
        )}
      </div>
    </Modal>
  );
};

export default GoalSetter;