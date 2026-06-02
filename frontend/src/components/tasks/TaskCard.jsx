import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  Edit3,
  Trash2,
  MoreVertical,
  Calendar,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { getCategoryColor, getPriorityColor } from '../../utils/colorHelper';
import { formatTime, getSmartDateLabel, isToday } from '../../utils/dateHelper';
import { getPriorityEmoji } from '../../utils/priorityHelper';

const TaskCard = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onReschedule,
  compact = false,
  dimmed = false, // for dashboard "lighter" view
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const categoryStyle = getCategoryColor(task.category || 'default');
  const priorityStyle = getPriorityColor(task.priority || 'low');

  const isOverdue =
    !task.completed &&
    task.deadline &&
    new Date(task.deadline) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01 }}
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        task.completed
          ? 'border-mint-200 bg-mint-50/40'
          : isOverdue
          ? 'border-blush-200'
          : `${categoryStyle.border} hover:shadow-medium`
      } ${dimmed && !task.completed ? 'opacity-70 hover:opacity-100' : ''} ${
        compact ? 'p-3' : 'p-4 md:p-5'
      }`}
    >
      {/* Priority gradient bar (left side) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${priorityStyle.gradient}`}
      />

      <div className="flex items-start gap-3 pl-2">
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle && onToggle(task.id)}
          className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-gradient-to-br from-mint-300 to-softGreen-300 border-transparent'
              : `${priorityStyle.border} bg-white hover:${priorityStyle.bg}`
          }`}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </motion.button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4
            className={`font-medium text-gray-800 leading-snug ${
              compact ? 'text-sm' : 'text-base'
            } ${task.completed ? 'line-through text-gray-400' : ''}`}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && !compact && (
            <p
              className={`text-sm text-gray-500 mt-1 line-clamp-2 ${
                task.completed ? 'line-through' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {/* Time */}
            {task.scheduledTime && (
              <span className="text-xs text-gray-500 flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <Clock size={11} />
                {formatTime(task.scheduledTime)}
              </span>
            )}

            {/* Date (only if not today) */}
            {task.scheduledTime && !isToday(task.scheduledTime) && (
              <span className="text-xs text-gray-500 flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <Calendar size={11} />
                {getSmartDateLabel(task.scheduledTime)}
              </span>
            )}

            {/* Priority badge */}
            {task.priority && (
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${priorityStyle.bg} ${priorityStyle.text}`}
              >
                <Flag size={10} />
                {task.priority}
              </span>
            )}

            {/* Category badge */}
            {task.category && (
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
              >
                {task.category}
              </span>
            )}

            {/* Overdue warning */}
            {isOverdue && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-2 py-1 rounded-lg font-medium bg-blush-100 text-blush-500 flex items-center gap-1"
              >
                <AlertCircle size={10} />
                Overdue
              </motion.span>
            )}

            {/* Duration */}
            {task.duration && (
              <span className="text-xs text-gray-400">
                {task.duration} min
              </span>
            )}
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-lavender-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </motion.button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-large border border-lavender-100 overflow-hidden z-20"
              >
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(task);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-lavender-50 flex items-center gap-2 transition-colors"
                  >
                    <Edit3 size={14} className="text-babyBlue-400" />
                    Edit
                  </button>
                )}
                {onReschedule && (
                  <button
                    onClick={() => {
                      onReschedule(task);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-lavender-50 flex items-center gap-2 transition-colors"
                  >
                    <Calendar size={14} className="text-lavender-400" />
                    Reschedule
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-blush-500 hover:bg-blush-50 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Completion celebration */}
      {task.completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 text-xs text-mint-500 font-semibold"
        >
          ✨ Done!
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskCard;