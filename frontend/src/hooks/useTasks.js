import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useNotification } from '../context/NotificationContext';
import {
  sortBySmartOrder,
  getTodayTasks,
  getCompletedTasks,
  getIncompleteTasks,
  getOverdueTasks,
  getCompletionPercentage,
  getProductivityScore,
} from '../utils/priorityHelper';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast, addNotification } = useNotification();

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await taskService.getAllTasks();
    if (result.success) {
      setTasks(result.data || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  // Fetch today's tasks
  const fetchTodayTasks = useCallback(async () => {
    setLoading(true);
    const result = await taskService.getTodayTasks();
    if (result.success) {
      setTasks(result.data || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  // Create single task
  const createTask = async (taskData) => {
    setLoading(true);
    const result = await taskService.createTask(taskData);
    if (result.success) {
      setTasks((prev) => [...prev, result.data]);
      showToast('Task created! 📝', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Create multiple tasks (from journal)
  const createBulkTasks = async (tasksArray) => {
    setLoading(true);
    const result = await taskService.createBulkTasks(tasksArray);
    if (result.success) {
      setTasks((prev) => [...prev, ...(result.data || [])]);
      showToast(`${tasksArray.length} tasks added! ✨`, 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Update task
  const updateTask = async (id, updates) => {
    const result = await taskService.updateTask(id, updates);
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...result.data } : t))
      );
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Complete task
  const completeTask = async (id) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );

    const result = await taskService.completeTask(id);
    if (result.success) {
      showToast('Task completed! 🎉', 'success');

      // Check if all today's tasks done
      const todayTasks = getTodayTasks(tasks);
      const completedCount = todayTasks.filter((t) => t.completed).length + 1;
      if (completedCount === todayTasks.length) {
        addNotification({
          title: '🎊 All Tasks Done!',
          message: 'Amazing! You completed all your tasks today!',
          type: 'success',
        });
      }
    } else {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: false } : t))
      );
      showToast(result.error, 'error');
    }
    return result;
  };

  // Uncomplete task
  const uncompleteTask = async (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: false } : t))
    );

    const result = await taskService.uncompleteTask(id);
    if (!result.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
      );
      showToast(result.error, 'error');
    }
    return result;
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.completed) {
      return await uncompleteTask(id);
    } else {
      return await completeTask(id);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    const result = await taskService.deleteTask(id);
    if (result.success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Task deleted', 'success');
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Reschedule task
  const rescheduleTask = async (id, newTime) => {
    const result = await taskService.rescheduleTask(id, newTime);
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, scheduledTime: newTime } : t))
      );
      showToast('Task rescheduled ⏰', 'success');
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Generate smart schedule
  const generateSchedule = async (preferences = {}) => {
    setLoading(true);
    const incompleteTasks = getIncompleteTasks(tasks);
    const result = await taskService.generateSmartSchedule(
      incompleteTasks,
      preferences
    );
    if (result.success) {
      // Update tasks with new scheduled times
      setTasks((prev) =>
        prev.map((t) => {
          const scheduled = result.data.find((s) => s.id === t.id);
          return scheduled ? { ...t, scheduledTime: scheduled.scheduledTime } : t;
        })
      );
      showToast('Schedule optimized! 🚀', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Check sleep conflict
  const checkSleepConflict = async (taskTime, taskDuration, sleepSchedule) => {
    return await taskService.checkSleepConflict(
      taskTime,
      taskDuration,
      sleepSchedule
    );
  };

  // Get task stats
  const getStats = async (period = 'week') => {
    return await taskService.getTaskStats(period);
  };

  // Computed values
  const todayTasks = getTodayTasks(tasks);
  const completedTasks = getCompletedTasks(tasks);
  const pendingTasks = getIncompleteTasks(tasks);
  const overdueTasks = getOverdueTasks(tasks);
  const sortedTasks = sortBySmartOrder(tasks);
  const completionPercentage = getCompletionPercentage(todayTasks);
  const productivityScore = getProductivityScore(todayTasks);

  return {
    tasks,
    sortedTasks,
    todayTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionPercentage,
    productivityScore,
    loading,
    error,
    fetchTasks,
    fetchTodayTasks,
    createTask,
    createBulkTasks,
    updateTask,
    completeTask,
    uncompleteTask,
    toggleTask,
    deleteTask,
    rescheduleTask,
    generateSchedule,
    checkSleepConflict,
    getStats,
  };
};

export default useTasks;