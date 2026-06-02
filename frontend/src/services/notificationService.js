import api from './api';

export const notificationService = {
  // Get all notifications
  getAllNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications',
      };
    }
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    try {
      const response = await api.get('/notifications/unread');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unread',
      };
    }
  },

  // Mark as read
  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark as read',
      };
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all as read',
      };
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification',
      };
    }
  },

  // Create custom notification
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create notification',
      };
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update preferences',
      };
    }
  },

  // Get notification preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/notifications/preferences');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch preferences',
      };
    }
  },
};

// ============ INSIGHTS SERVICE ============
export const insightsService = {
  // Get productivity insights
  getProductivityInsights: async (period = 'week') => {
    try {
      const response = await api.get(`/insights/productivity?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch insights',
      };
    }
  },

  // Get habit drift analysis
  getHabitDrift: async () => {
    try {
      const response = await api.get('/insights/habit-drift');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch habit drift',
      };
    }
  },

  // Get user behavior analysis
  getBehaviorAnalysis: async () => {
    try {
      const response = await api.get('/insights/behavior');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch behavior',
      };
    }
  },

  // Get weekly summary
  getWeeklySummary: async () => {
    try {
      const response = await api.get('/insights/weekly-summary');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch summary',
      };
    }
  },

  // Get completion trends
  getCompletionTrends: async (days = 30) => {
    try {
      const response = await api.get(`/insights/trends?days=${days}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch trends',
      };
    }
  },
};

export default notificationService;