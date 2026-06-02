import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { useNotification } from '../context/NotificationContext';

export const useAI = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useNotification();

  // Send message to AI
  const sendMessage = async (message, context = {}) => {
    if (!message || !message.trim()) {
      showToast('Please enter a message', 'error');
      return { success: false };
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);

    const result = await aiService.chatWithAI(message, context);

    if (result.success) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.data.response || result.data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } else {
      // Fallback message
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.fallback || 'Sorry, I had trouble responding. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    }
    setTyping(false);
    return result;
  };

  // Load chat history
  const loadHistory = useCallback(async (limit = 50) => {
    setLoading(true);
    const result = await aiService.getChatHistory(limit);
    if (result.success) {
      setMessages(result.data || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  // Clear chat
  const clearChat = async () => {
    const result = await aiService.clearChatHistory();
    if (result.success) {
      setMessages([]);
      showToast('Chat history cleared', 'success');
    } else {
      showToast(result.error, 'error');
    }
    return result;
  };

  // Generate important points for a topic
  const getImportantPoints = async (topic) => {
    if (!topic || !topic.trim()) {
      showToast('Please enter a topic', 'error');
      return { success: false };
    }

    setLoading(true);
    const result = await aiService.generateImportantPoints(topic);
    if (!result.success) {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Analyze PDF for missing points
  const analyzePDF = async (file, topic = '') => {
    if (!file) {
      showToast('Please select a PDF file', 'error');
      return { success: false };
    }

    setLoading(true);
    const result = await aiService.analyzePDF(file, topic);
    if (result.success) {
      showToast('PDF analyzed successfully! 📄', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Get recommendations
  const getRecommendations = async (type = 'general') => {
    setLoading(true);
    const result = await aiService.getRecommendations(type);
    setLoading(false);
    return result;
  };

  // Generate mock test
  const generateMockTest = async (options = {}) => {
    setLoading(true);
    const result = await aiService.generateMockTest(options);
    if (result.success) {
      showToast('Mock test generated! 📝', 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Submit mock test
  const submitMockTest = async (testId, answers) => {
    setLoading(true);
    const result = await aiService.submitMockTest(testId, answers);
    if (result.success) {
      showToast(`Score: ${result.data.score}%`, 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
    return result;
  };

  // Get mistakes
  const getMistakes = async () => {
    setLoading(true);
    const result = await aiService.getMistakes();
    setLoading(false);
    return result;
  };

  // Get food recommendation
  const getFoodRecommendation = async (foodPreference, timeOfDay) => {
    const result = await aiService.getFoodRecommendation(foodPreference, timeOfDay);
    return result;
  };

  return {
    messages,
    loading,
    typing,
    error,
    sendMessage,
    loadHistory,
    clearChat,
    getImportantPoints,
    analyzePDF,
    getRecommendations,
    generateMockTest,
    submitMockTest,
    getMistakes,
    getFoodRecommendation,
  };
};

export default useAI;