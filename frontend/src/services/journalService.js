import api, { nlpApi } from './api';

export const journalService = {
  // Create a new journal entry
  createJournal: async (content) => {
    try {
      const response = await api.post('/journal', { content });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create journal',
      };
    }
  },

  // Get all journal entries
  getAllJournals: async () => {
    try {
      const response = await api.get('/journal');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch journals',
      };
    }
  },

  // Get today's journal
  getTodayJournal: async () => {
    try {
      const response = await api.get('/journal/today');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch today journal',
      };
    }
  },

  // Get journal by ID
  getJournalById: async (id) => {
    try {
      const response = await api.get(`/journal/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch journal',
      };
    }
  },

  // Update journal
  updateJournal: async (id, content) => {
    try {
      const response = await api.put(`/journal/${id}`, { content });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update journal',
      };
    }
  },

  // Delete journal
  deleteJournal: async (id) => {
    try {
      await api.delete(`/journal/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete journal',
      };
    }
  },

  // Extract tasks from journal using NLP service
  extractTasksFromJournal: async (content) => {
    try {
      const response = await nlpApi.post('/extract', { text: content });
      return { success: true, data: response.data };
    } catch (error) {
      // Fallback - simple task extraction if NLP fails
      const lines = content.split('\n').filter((line) => line.trim());
      const tasks = lines.map((line, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        title: line.trim(),
        category: 'personal',
        priority: 'medium',
        completed: false,
      }));

      return {
        success: true,
        data: { tasks, fallback: true },
      };
    }
  },

  // Get journal history (last N days)
  getJournalHistory: async (days = 30) => {
    try {
      const response = await api.get(`/journal/history?days=${days}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch history',
      };
    }
  },
};

export default journalService;