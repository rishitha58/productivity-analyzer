import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Trophy,
  Clock,
  Calendar,
  Flag,
  Lock,
} from 'lucide-react';
import { formatDate, getDaysUntil } from '../../utils/dateHelper';

const MilestoneCard = ({
  milestone,
  index,
  totalMilestones,
  onComplete,
  isLocked = false,
}) => {
  const isCompleted = milestone.completed;
  const daysLeft = milestone.deadline ? getDaysUntil(milestone.deadline) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && !isCompleted;

  // Determine phase color
  const phaseColors = [
    { bg: 'from-lavender-200 to-babyBlue-200', text: 'text-lavender-500', solid: 'bg-lavender-300' },
    { bg: 'from-peach-200 to-blush-200', text: 'text-peach-500', solid: 'bg-peach-300' },
    { bg: 'from-mint-200 to-softGreen-200', text: 'text-mint-500', solid: 'bg-mint-300' },
    { bg: 'from-babyBlue-200 to-mint-200', text: 'text-babyBlue-500', solid: 'bg-babyBlue-300' },
    { bg: 'from-yellow-200 to-peach-200', text: 'text-yellow-600', solid: 'bg-yellow-300' },
  ];

  const phaseColor = phaseColors[index % phaseColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-12 pb-6"
    >
      {/* Timeline line */}
      {index < totalMilestones - 1 && (
        <div
          className={`absolute left-[18px] top-10 bottom-0 w-0.5 ${
            isCompleted ? 'bg-mint-300' : 'bg-lavender-200'
          }`}
        />
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 top-0">
        <motion.div
          whileHover={{ scale: !isLocked && !isCompleted ? 1.15 : 1 }}
          whileTap={{ scale: !isLocked && !isCompleted ? 0.9 : 1 }}
          onClick={() => !isLocked && !isCompleted && onComplete?.(milestone.id)}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
            isCompleted
              ? 'bg-gradient-to-br from-mint-300 to-softGreen-300 shadow-soft'
              : isLocked
              ? 'bg-gray-200 cursor-not-allowed'
              : `bg-gradient-to-br ${phaseColor.bg} hover:shadow-medium`
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 size={20} className="text-white" strokeWidth={2.5} />
          ) : isLocked ? (
            <Lock size={14} className="text-gray-400" />
          ) : (
            <Circle size={20} className={phaseColor.text} strokeWidth={2.5} />
          )}

          {/* Pulse for current milestone */}
          {!isCompleted && !isLocked && (
            <span className={`absolute inset-0 rounded-full ${phaseColor.solid} opacity-30 animate-ping`} />
          )}
        </motion.div>
      </div>

      {/* Milestone card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`p-4 rounded-2xl border-2 transition-all ${
          isCompleted
            ? 'bg-mint-50 border-mint-200'
            : isLocked
            ? 'bg-gray-50 border-gray-200 opacity-60'
            : `bg-white border-lavender-100 hover:shadow-soft`
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-mint-200 text-mint-500'
                    : `${phaseColor.solid} text-white`
                }`}
              >
                Phase {index + 1}
              </span>
              {milestone.priority && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                    milestone.priority === 'high'
                      ? 'bg-blush-100 text-blush-500'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {milestone.priority}
                </span>
              )}
            </div>
            <h4
              className={`font-display font-bold ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}
            >
              {milestone.title}
            </h4>
          </div>

          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex-shrink-0"
            >
              <Trophy size={20} className="text-yellow-400" />
            </motion.div>
          )}
        </div>

        {/* Description */}
        {milestone.description && (
          <p
            className={`text-sm leading-relaxed mb-3 ${
              isCompleted ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {milestone.description}
          </p>
        )}

        {/* Tasks count */}
        {milestone.tasks && milestone.tasks.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-medium">
                {milestone.tasks.filter((t) => t.completed).length}/
                {milestone.tasks.length} tasks
              </span>
              <span className="text-xs font-bold text-lavender-500">
                {Math.round(
                  (milestone.tasks.filter((t) => t.completed).length /
                    milestone.tasks.length) *
                    100
                )}
                %
              </span>
            </div>
            <div className="h-1.5 bg-lavender-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (milestone.tasks.filter((t) => t.completed).length /
                      milestone.tasks.length) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.8 }}
                className={`h-full bg-gradient-to-r ${phaseColor.bg}`}
              />
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {milestone.deadline && (
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                isOverdue ? 'bg-blush-100 text-blush-500' : 'bg-gray-50 text-gray-500'
              }`}
            >
              <Calendar size={11} />
              {formatDate(milestone.deadline)}
              {daysLeft !== null && !isCompleted && (
                <span className="font-semibold ml-1">
                  ({daysLeft >= 0 ? `${daysLeft}d left` : `${Math.abs(daysLeft)}d overdue`})
                </span>
              )}
            </span>
          )}
          {milestone.duration && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-gray-500">
              <Clock size={11} />
              {milestone.duration}
            </span>
          )}
        </div>

        {/* Complete button */}
        {!isCompleted && !isLocked && onComplete && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete(milestone.id)}
            className={`mt-3 w-full py-2 bg-gradient-to-r ${phaseColor.bg} text-white font-medium text-sm rounded-xl shadow-soft hover:shadow-medium transition-all flex items-center justify-center gap-2`}
          >
            <Flag size={14} />
            Mark as Complete
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MilestoneCard;