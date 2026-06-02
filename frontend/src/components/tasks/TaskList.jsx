import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Filter,
  Plus,
  Search,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import TaskCard from './TaskCard';
import { useTasks } from '../../hooks/useTasks';
import { sortBySmartOrder } from '../../utils/priorityHelper';
import { ConfirmModal } from '../common/Modal';
import { SkeletonCard } from '../common/Loader';

const TaskList = ({ 
  tasks = null,
  showHeader = true,
  showFilters = true,
  showAddButton = true,
  onAddTask,
  dimmed = false,
  emptyMessage = 'No tasks yet',
  emptySubMessage = 'Write in your journal to generate tasks!',
}) => {
  const {
    tasks: allTasks,
    toggleTask,
    deleteTask,
    loading,
    completionPercentage,
  } = useTasks();

  const displayTasks = tasks !== null ? tasks : allTasks;

  const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter & search
  const filteredTasks = useMemo(() => {
    let filtered = [...displayTasks];

    // Apply filter
    if (filter === 'pending') {
      filtered = filtered.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (filter === 'overdue') {
      filtered = filtered.filter(
        (t) => !t.completed && t.deadline && new Date(t.deadline) < new Date()
      );
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return sortBySmartOrder(filtered);
  }, [displayTasks, filter, searchQuery]);

  const pendingCount = displayTasks.filter((t) => !t.completed).length;
  const completedCount = displayTasks.filter((t) => t.completed).length;
  const overdueCount = displayTasks.filter(
    (t) => !t.completed && t.deadline && new Date(t.deadline) < new Date()
  ).length;

  const filters = [
    {
      id: 'all',
      label: 'All',
      count: displayTasks.length,
      icon: ListTodo,
      color: 'lavender',
    },
    {
      id: 'pending',
      label: 'Pending',
      count: pendingCount,
      icon: Clock,
      color: 'babyBlue',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: completedCount,
      icon: CheckCircle2,
      color: 'mint',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: overdueCount,
      icon: AlertCircle,
      color: 'blush',
    },
  ];

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Progress */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-300 to-softGreen-300 flex items-center justify-center shadow-soft">
                <CheckSquare className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800">
                  My Tasks
                </h2>
                <p className="text-sm text-gray-500">
                  {pendingCount} pending • {completedCount} completed
                </p>
              </div>
            </div>

            {showAddButton && onAddTask && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddTask}
                className="px-4 py-2 bg-gradient-to-r from-lavender-300 to-babyBlue-300 text-white font-medium rounded-xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Task
              </motion.button>
            )}
          </div>

          {/* Progress Bar */}
          {displayTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Today's Progress
                </span>
                <span className="text-xs font-bold text-lavender-500">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-2.5 bg-lavender-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-mint-300 via-babyBlue-300 to-lavender-300 rounded-full"
                />
              </div>
              {completionPercentage === 100 && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-mint-500 font-semibold mt-2 flex items-center gap-1"
                >
                  <Sparkles size={12} /> All tasks completed! Amazing work! 🎉
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Filters & Search */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-3"
        >
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {filters.map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                  filter === f.id
                    ? `bg-${f.color}-200 text-${f.color}-500 shadow-soft`
                    : 'bg-white text-gray-600 border border-lavender-100 hover:bg-lavender-50'
                }`}
              >
                <f.icon size={14} />
                {f.label}
                {f.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-md ${
                      filter === f.id ? 'bg-white/40' : 'bg-gray-100'
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="relative md:ml-auto md:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-3 py-2 bg-white border border-lavender-100 rounded-xl focus:border-lavender-300 focus:outline-none text-sm"
            />
          </div>
        </motion.div>
      )}

      {/* Task List */}
      {loading && filteredTasks.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-lavender-100"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-lavender-100 to-mint-100 flex items-center justify-center">
            <ListTodo size={36} className="text-lavender-400" />
          </div>
          <h3 className="text-lg font-display font-bold text-gray-700">
            {searchQuery ? 'No tasks found' : emptyMessage}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try a different search' : emptySubMessage}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                dimmed={dimmed}
                onToggle={toggleTask}
                onDelete={(id) => setDeleteConfirm(id)}
                onEdit={(t) => console.log('Edit task:', t)}
                onReschedule={(t) => console.log('Reschedule:', t)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Task?"
        message="This task will be permanently removed."
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default TaskList;