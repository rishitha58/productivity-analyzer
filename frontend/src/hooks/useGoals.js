import { useState, useCallback } from 'react';
import { goalService } from '../services/goalService';
import { useNotification } from '../context/NotificationContext';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast, addNotification } = useNotification();

  // Fetch all goals
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await goalService.getAllGoals();
    if (result.success) {
      setGoals(result.data || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  // Fetch single goal
  const fetchGoalById = async (id) => {
    setLoading(true);
    const result = await goalService.getGoalById(id);
    if (result.success) {
      setActiveGoal(result.data);
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Create new goal (system divides into phases automatically)
  const createGoal = async (goalData) => {
    setLoading(true);
    const result = await goalService.createGoal(goalData);
    if (result.success) {
      setGoals((prev) => [...prev, result.data]);
      showToast('Goal created! Let\'s achieve it! 🎯', 'success');
      addNotification({
        title: '🎯 New Goal Created',
        message: `Your goal "${goalData.title}" has been broken into milestones`,
        type: 'success',
      });
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Update goal
  const updateGoal = async (id, updates) => {
    setLoading(true);
    const result = await goalService.updateGoal(id, updates);
    if (result.success) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? result.data : g))
      );
      if (activeGoal?.id === id) {
        setActiveGoal(result.data);
      }
      showToast('Goal updated ✏️', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Delete goal
  const deleteGoal = async (id) => {
    const result = await goalService.deleteGoal(id);
    if (result.success) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (activeGoal?.id === id) setActiveGoal(null);
      showToast('Goal deleted', 'success');
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Get goal progress
  const getProgress = async (id) => {
    const result = await goalService.getGoalProgress(id);
    return result;
  };

  // Complete milestone
  const completeMilestone = async (goalId, milestoneId) => {
    const result = await goalService.completeMilestone(goalId, milestoneId);
    if (result.success) {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            return {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed: true } : m
              ),
            };
          }
          return g;
        })
      );
      showToast('Milestone achieved! 🏆', 'success');
      addNotification({
        title: '🏆 Milestone Completed!',
        message: 'Great progress! Keep going!',
        type: 'success',
      });
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Regenerate goal plan (when user edits substantially)
  const regenerateGoalPlan = async (id, updates) => {
    setLoading(true);
    const result = await goalService.regenerateGoalPlan(id, updates);
    if (result.success) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? result.data : g))
      );
      showToast('Plan regenerated! ✨', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Get insights for a goal
  const getInsights = async (id) => {
    const result = await goalService.getGoalInsights(id);
    return result;
  };

  // Calculate overall progress for a goal
  const calculateGoalProgress = (goal) => {
    if (!goal || !goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter((m) => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  return {
    goals,
    activeGoal,
    loading,
    error,
    fetchGoals,
    fetchGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    getProgress,
    completeMilestone,
    regenerateGoalPlan,
    getInsights,
    calculateGoalProgress,
    setActiveGoal,
  };
};

export default useGoals;