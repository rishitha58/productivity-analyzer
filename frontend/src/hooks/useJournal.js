import { useState, useEffect, useCallback } from 'react';
import { journalService } from '../services/journalService';
import { useNotification } from '../context/NotificationContext';

export const useJournal = () => {
  const [journals, setJournals] = useState([]);
  const [todayJournal, setTodayJournal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useNotification();

  // Fetch all journals
  const fetchJournals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await journalService.getAllJournals();
    if (result.success) {
      setJournals(result.data || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  // Fetch today's journal
  const fetchTodayJournal = useCallback(async () => {
    setLoading(true);
    const result = await journalService.getTodayJournal();
    if (result.success) {
      setTodayJournal(result.data);
    }
    setLoading(false);
  }, []);

  // Create new journal entry
  const createJournal = async (content) => {
    if (!content || !content.trim()) {
      showToast('Please write something in your journal', 'error');
      return { success: false };
    }

    setLoading(true);
    const result = await journalService.createJournal(content);

    if (result.success) {
      setTodayJournal(result.data);
      setJournals((prev) => [result.data, ...prev]);
      showToast('Journal saved successfully! 📖', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Extract tasks from journal text
  const extractTasks = async (content) => {
    if (!content || !content.trim()) {
      showToast('Please write something first', 'error');
      return { success: false };
    }

    setExtracting(true);
    const result = await journalService.extractTasksFromJournal(content);

    if (result.success) {
      if (result.data.fallback) {
        showToast('Tasks extracted (basic mode)', 'warning');
      } else {
        showToast('Tasks extracted successfully! ✨', 'success');
      }
    } else {
      showToast(result.error, 'error');
    }
    setExtracting(false);
    return result;
  };

  // Update journal
  const updateJournal = async (id, content) => {
    setLoading(true);
    const result = await journalService.updateJournal(id, content);
    if (result.success) {
      setJournals((prev) =>
        prev.map((j) => (j.id === id ? result.data : j))
      );
      if (todayJournal?.id === id) {
        setTodayJournal(result.data);
      }
      showToast('Journal updated! ✏️', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Delete journal
  const deleteJournal = async (id) => {
    const result = await journalService.deleteJournal(id);
    if (result.success) {
      setJournals((prev) => prev.filter((j) => j.id !== id));
      showToast('Journal deleted', 'success');
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Get journal history
  const getHistory = async (days = 30) => {
    setLoading(true);
    const result = await journalService.getJournalHistory(days);
    setLoading(false);
    return result;
  };

  return {
    journals,
    todayJournal,
    loading,
    extracting,
    error,
    fetchJournals,
    fetchTodayJournal,
    createJournal,
    extractTasks,
    updateJournal,
    deleteJournal,
    getHistory,
  };
};

export default useJournal;