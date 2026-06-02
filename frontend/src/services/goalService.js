import api from './api';

export const goalService = {
  // Get all goals
  getAllGoals: async () => {
    try {
      const response = await api.get('/goals');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch goals',
      };
    }
  },

  // Get goal by ID
  getGoalById: async (id) => {
    try {
      const response = await api.get(`/goals/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch goal',
      };
    }
  },

  // Create a new goal (system divides into phases and milestones)
  createGoal: async (goalData) => {
    try {
      const response = await api.post('/goals', goalData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create goal',
      };
    }
  },

  // Update goal
  updateGoal: async (id, updates) => {
    try {
      const response = await api.put(`/goals/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update goal',
      };
    }
  },

  // Delete goal
  deleteGoal: async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete goal',
      };
    }
  },

  // Get goal progress
  getGoalProgress: async (id) => {
    try {
      const response = await api.get(`/goals/${id}/progress`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch progress',
      };
    }
  },

  // Complete a milestone
  completeMilestone: async (goalId, milestoneId) => {
    try {
      const response = await api.patch(
        `/goals/${goalId}/milestones/${milestoneId}/complete`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to complete milestone',
      };
    }
  },

  // Regenerate goal plan (when user edits)
  regenerateGoalPlan: async (id, updates) => {
    try {
      const response = await api.post(`/goals/${id}/regenerate`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to regenerate plan',
      };
    }
  },

  // Get insights for a goal
  getGoalInsights: async (id) => {
    try {
      const response = await api.get(`/goals/${id}/insights`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch insights',
      };
    }
  },
};

export default goalService;