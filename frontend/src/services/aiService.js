// ═══════════════════════════════════════
//   API SERVICE — Backend Connection
// ═══════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("🔗 API URL:", API_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
};

// ═══════════════════════════════════════
//   AUTH
// ═══════════════════════════════════════
export const signupUser = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const completeOnboarding = async (data) => {
  const res = await fetch(`${API_URL}/auth/onboarding`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getCurrentUser = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   GOALS & ROADMAP
// ═══════════════════════════════════════
export const getRoadmap = async () => {
  const res = await fetch(`${API_URL}/auth/roadmap`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updatePhase = async (currentPhase) => {
  const res = await fetch(`${API_URL}/auth/phase`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPhase }),
  });
  return handleResponse(res);
};

export const regenerateRoadmap = async () => {
  const res = await fetch(`${API_URL}/auth/regenerate-roadmap`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
// ═══════════════════════════════════════
//   ✏️ UPDATE GOAL
// ═══════════════════════════════════════
export const updateGoal = async (goal, duration, regenerateRoadmap = false) => {
  const res = await fetch(`${API_URL}/auth/goal`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ goal, duration, regenerateRoadmap }),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   ➕ CREATE GOAL (for users who skipped)
// ═══════════════════════════════════════
export const createGoal = async (goal, duration) => {
  const res = await fetch(`${API_URL}/auth/create-goal`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ goal, duration }),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   🗑️ DELETE GOAL
// ═══════════════════════════════════════
export const deleteGoal = async () => {
  const res = await fetch(`${API_URL}/auth/goal`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   ✏️ EDIT PHASE
// ═══════════════════════════════════════
export const editPhase = async (phaseIndex, data) => {
  const res = await fetch(`${API_URL}/auth/phase-edit/${phaseIndex}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   JOURNAL
// ═══════════════════════════════════════
export const submitJournal = async (rawText) => {
  const res = await fetch(`${API_URL}/journal`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rawText }),
  });
  return handleResponse(res);
};

export const getTodayJournal = async () => {
  const res = await fetch(`${API_URL}/journal/today`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getJournalHistory = async () => {
  const res = await fetch(`${API_URL}/journal`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const toggleTaskDone = async (taskId) => {
  const res = await fetch(`${API_URL}/journal/task/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const deleteTask = async (taskId) => {
  const res = await fetch(`${API_URL}/journal/task/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   PRODUCTIVITY & HISTORY
// ═══════════════════════════════════════
export const getProductivityStats = async () => {
  const res = await fetch(`${API_URL}/journal/productivity`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getTaskHistory = async () => {
  const res = await fetch(`${API_URL}/journal/history`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getUndoneTasks = async () => {
  const res = await fetch(`${API_URL}/journal/undone`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const carryForwardTasks = async (tasks) => {
  const res = await fetch(`${API_URL}/journal/carry-forward`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tasks }),
  });
  return handleResponse(res);
};
// ═══════════════════════════════════════
//   ✅ MARK PAST TASK AS DONE
// ═══════════════════════════════════════
export const markPastTaskDone = async (journalDate, taskId) => {
  const res = await fetch(`${API_URL}/journal/task/${journalDate}/${taskId}/mark-done`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   ❌ SKIP PAST TASK
// ═══════════════════════════════════════
export const skipPastTask = async (journalDate, taskId) => {
  const res = await fetch(`${API_URL}/journal/task/${journalDate}/${taskId}/skip`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   KEY POINTS
// ═══════════════════════════════════════
export const generateKeyPoints = async (topic, text, sourceType = "text") => {
  const res = await fetch(`${API_URL}/ai/keypoints`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ topic, text, sourceType }),
  });
  return handleResponse(res);
};

export const getAllKeyPoints = async () => {
  const res = await fetch(`${API_URL}/ai/keypoints`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const deleteKeyPoint = async (id) => {
  const res = await fetch(`${API_URL}/ai/keypoints/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const extractKeyPoints = async (topic, text) => {
  return generateKeyPoints(topic, text, "text");
};

// ═══════════════════════════════════════
//   AI FEATURES
// ═══════════════════════════════════════
export const generateMockTest = async (topic, numQuestions = 5) => {
  const res = await fetch(`${API_URL}/ai/mocktest`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ topic, numQuestions }),
  });
  return handleResponse(res);
};

export const getFoodRecommendation = async () => {
  const res = await fetch(`${API_URL}/ai/food`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   DOUBTS (Focus Mode)
// ═══════════════════════════════════════
export const askDoubt = async (question, topic, taskId, taskTitle) => {
  const res = await fetch(`${API_URL}/doubts/ask`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ question, topic, taskId, taskTitle }),
  });
  return handleResponse(res);
};

export const getAllDoubts = async () => {
  const res = await fetch(`${API_URL}/doubts`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getDoubtsByTopic = async () => {
  const res = await fetch(`${API_URL}/doubts/topics`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const generateTestFromDoubts = async (topic = null, numQuestions = 5) => {
  const res = await fetch(`${API_URL}/doubts/generate-test`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ topic, numQuestions }),
  });
  return handleResponse(res);
};

export const deleteDoubt = async (id) => {
  const res = await fetch(`${API_URL}/doubts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getDoubts = async () => getAllDoubts();

// ═══════════════════════════════════════
//   NOTES
// ═══════════════════════════════════════
export const getNotes = async () => {
  const res = await fetch(`${API_URL}/notes`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createNote = async (noteData) => {
  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(noteData),
  });
  return handleResponse(res);
};

export const updateNote = async (id, noteData) => {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(noteData),
  });
  return handleResponse(res);
};

export const deleteNote = async (id) => {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   MOCK TESTS
// ═══════════════════════════════════════
export const getMockTests = async () => {
  const res = await fetch(`${API_URL}/tests`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const submitMockTest = async (testId, answers) => {
  const res = await fetch(`${API_URL}/tests/${testId}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ answers }),
  });
  return handleResponse(res);
};

export const getMistakes = async () => {
  const res = await fetch(`${API_URL}/tests/mistakes/all`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
// ═══════════════════════════════════════
//   📝 GENERATE TEST FROM NOTES
// ═══════════════════════════════════════
export const generateTestFromNotes = async (noteIds, numQuestions = 5) => {
  const res = await fetch(`${API_URL}/ai/mocktest-from-notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ noteIds, numQuestions }),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   AI CHAT
// ═══════════════════════════════════════
export const sendChatMessage = async (message, chatId = null) => {
  const res = await fetch(`${API_URL}/chat/send`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, chatId }),
  });
  return handleResponse(res);
};

export const getAllChats = async () => {
  const res = await fetch(`${API_URL}/chat`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getChat = async (id) => {
  const res = await fetch(`${API_URL}/chat/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const deleteChat = async (id) => {
  const res = await fetch(`${API_URL}/chat/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const clearAllChats = async () => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   NOTIFICATIONS
// ═══════════════════════════════════════
export const getNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getUnreadCount = async () => {
  const res = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const markNotificationRead = async (id) => {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const clearAllNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const generateNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getNotificationSettings = async () => {
  const res = await fetch(`${API_URL}/notifications/settings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updateNotificationSettings = async (settings) => {
  const res = await fetch(`${API_URL}/notifications/settings`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   TRAVEL
// ═══════════════════════════════════════
export const getAllTravels = async () => {
  const res = await fetch(`${API_URL}/travel`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getTodayTravels = async () => {
  const res = await fetch(`${API_URL}/travel/today`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const autoExtractTravels = async (fromLocation) => {
  const res = await fetch(`${API_URL}/travel/auto-extract`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fromLocation }),
  });
  return handleResponse(res);
};

export const createTravel = async (travelData) => {
  const res = await fetch(`${API_URL}/travel`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(travelData),
  });
  return handleResponse(res);
};

export const updateTravel = async (id, data) => {
  const res = await fetch(`${API_URL}/travel/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteTravel = async (id) => {
  const res = await fetch(`${API_URL}/travel/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   LEGACY COMPATIBILITY
// ═══════════════════════════════════════
export const extractTasksFromJournal = async (text) => {
  const result = await submitJournal(text);
  return result.journal?.tasks || [];
};

export const extractTasksWithGoalContext = async (text) => {
  const result = await submitJournal(text);
  return {
    tasks: result.journal?.tasks || [],
    suggestions: result.suggestions || [],
    motivation: result.journal?.motivation || "Keep going! 🌸",
  };
};

export const generateGoalRoadmap = async () => null;
export const chatWithAI = async () => "Coming soon!";
export const analyzeHabitDrift = async () => ({ drifting: false });
// ═══════════════════════════════════════
//   📋 GENERATE KEY POINTS FROM NOTES
// ═══════════════════════════════════════
export const generateKeyPointsFromNotes = async (noteIds) => {
  const res = await fetch(`${API_URL}/ai/keypoints-from-notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ noteIds }),
  });
  return handleResponse(res);
};

// ═══════════════════════════════════════
//   📄 GENERATE KEY POINTS FROM FILES
// ═══════════════════════════════════════
export const generateKeyPointsFromFiles = async (files, topic = "") => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  
  // Append all files
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  if (topic) {
    formData.append("topic", topic);
  }

  const res = await fetch(`${API_URL}/ai/keypoints-from-files`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // ⚠️ Don't set Content-Type - browser sets it with boundary for FormData
    },
    body: formData,
  });
  return handleResponse(res);
};