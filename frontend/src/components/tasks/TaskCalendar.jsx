import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { isSameDay, isToday, formatTime } from '../../utils/dateHelper';
import { getPriorityColor } from '../../utils/colorHelper';

const TaskCalendar = () => {
  const { tasks } = useTasks();
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get days based on view mode
  const days = useMemo(() => {
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    } else {
      // Month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startPadding = firstDay.getDay();
      const totalDays = lastDay.getDate();

      const daysArr = [];
      // Padding days from previous month
      for (let i = startPadding - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        daysArr.push({ date: d, isPadding: true });
      }
      // Current month days
      for (let i = 1; i <= totalDays; i++) {
        daysArr.push({ date: new Date(year, month, i), isPadding: false });
      }
      // End padding
      const remaining = 42 - daysArr.length; // 6 weeks * 7 days
      for (let i = 1; i <= remaining; i++) {
        daysArr.push({
          date: new Date(year, month + 1, i),
          isPadding: true,
        });
      }
      return daysArr;
    }
  }, [currentDate, viewMode]);

  // Get tasks for a specific day
  const getTasksForDay = (date) => {
    return tasks.filter(
      (t) => t.scheduledTime && isSameDay(t.scheduledTime, date)
    );
  };

  // Selected day tasks
  const selectedDayTasks = useMemo(() => {
    return getTasksForDay(selectedDate);
  }, [selectedDate, tasks]);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Header title
  const headerTitle = useMemo(() => {
    if (viewMode === 'week') {
      const start = days[0];
      const end = days[6];
      if (!start || !end) return '';
      const sameMonth = start.getMonth() === end.getMonth();
      if (sameMonth) {
        return `${start.toLocaleDateString('en-US', {
          month: 'long',
        })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;
    }
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate, viewMode, days]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-babyBlue-300 to-lavender-300 flex items-center justify-center shadow-soft">
              <CalendarIcon className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-gray-800">
                {headerTitle}
              </h2>
              <p className="text-xs text-gray-500">
                {tasks.length} tasks scheduled
              </p>
            </div>
          </div>

          {/* Navigation & View Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-lavender-50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-lavender-500 shadow-soft'
                    : 'text-gray-500'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-lavender-500 shadow-soft'
                    : 'text-gray-500'
                }`}
              >
                Month
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-mint-100 text-mint-500 text-xs font-medium rounded-xl hover:bg-mint-200 transition-colors"
            >
              Today
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-xl hover:bg-lavender-100 transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-500" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 rounded-xl hover:bg-lavender-100 transition-colors"
              >
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100"
      >
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={`grid grid-cols-7 gap-2`}>
          {days.map((dayData, idx) => {
            const date = viewMode === 'week' ? dayData : dayData.date;
            const isPadding = viewMode === 'month' ? dayData.isPadding : false;
            const dayTasks = getTasksForDay(date);
            const isSelected = isSameDay(date, selectedDate);
            const isCurrent = isToday(date);
            const completedTasks = dayTasks.filter((t) => t.completed).length;

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedDate(date)}
                className={`relative p-2 md:p-3 rounded-xl text-left transition-all min-h-[70px] md:min-h-[90px] ${
                  isSelected
                    ? 'bg-gradient-to-br from-lavender-200 to-babyBlue-200 shadow-medium border-2 border-lavender-300'
                    : isCurrent
                    ? 'bg-gradient-to-br from-peach-100 to-blush-100 border-2 border-peach-300'
                    : isPadding
                    ? 'bg-gray-50/50 border border-transparent hover:bg-lavender-50 opacity-40'
                    : 'bg-lavender-50 border border-transparent hover:bg-lavender-100'
                }`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-peach-500'
                        : isSelected
                        ? 'text-lavender-500'
                        : isPadding
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-peach-400 animate-pulse" />
                  )}
                </div>

                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayTasks.slice(0, 3).map((task) => {
                      const priority = getPriorityColor(task.priority || 'low');
                      return (
                        <div
                          key={task.id}
                          className={`w-1.5 h-1.5 rounded-full ${priority.solid}`}
                        />
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-gray-500 font-semibold">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Task count label (mobile hidden) */}
                {dayTasks.length > 0 && (
                  <div className="hidden md:block mt-1 text-[10px] text-gray-500">
                    {completedTasks}/{dayTasks.length} done
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Day Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-gray-800">
              {isToday(selectedDate)
                ? "Today's Schedule"
                : selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedDayTasks.length}{' '}
              {selectedDayTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>

        {selectedDayTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-lavender-100 flex items-center justify-center">
              <CalendarIcon size={24} className="text-lavender-400" />
            </div>
            <p className="text-sm text-gray-500">No tasks scheduled</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayTasks.map((task) => {
              const priority = getPriorityColor(task.priority || 'low');
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                    task.completed
                      ? 'bg-mint-50 border-mint-200'
                      : `${priority.bg} ${priority.border}`
                  }`}
                >
                  <div
                    className={`w-2 h-12 rounded-full bg-gradient-to-b ${priority.gradient}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-800'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.scheduledTime && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {formatTime(task.scheduledTime)}
                      </p>
                    )}
                  </div>
                  {task.completed && (
                    <CheckCircle2 size={18} className="text-mint-500" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TaskCalendar;