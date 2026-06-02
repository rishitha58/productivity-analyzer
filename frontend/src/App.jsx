import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// ─── Pages ───
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import JournalPage from "./pages/JournalPage";
import StudyFocusPage from "./pages/StudyFocusPage";
import NotesPage from "./pages/NotesPage";
import ImportantPointsPage from "./pages/ImportantPointsPage";
import MockTestsPage from "./pages/MockTestsPage";
import MistakesPage from "./pages/MistakesPage";
import InsightsPage from "./pages/InsightsPage";
import GoalsPage from "./pages/GoalsPage";
import TaskHistoryPage from "./pages/TaskHistoryPage";
import AIChatPage from "./pages/AIChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import TravelPage from "./pages/TravelPage";              
import PlaceholderPage from "./pages/PlaceholderPage";

// ─── Components ───
import ChatWidget from "./components/ChatWidget";
import FloatingStudyWidget from "./components/study/FloatingStudyWidget"; // ⭐ NEW

// ═══════════════════════════════════════
//   PROTECTED ROUTE
// ═══════════════════════════════════════
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
};

// ═══════════════════════════════════════
//   REQUIRE TODAY'S JOURNAL
// ═══════════════════════════════════════
const RequireJournal = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  const today = new Date().toISOString().split("T")[0];
  const lastJournal = localStorage.getItem("lastJournalDate");

  if (lastJournal !== today) {
    return <Navigate to="/journal" replace />;
  }

  return children;
};

// ═══════════════════════════════════════
//   APP
// ═══════════════════════════════════════
const App = () => {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<RequireJournal><Dashboard /></RequireJournal>} />
          <Route path="/focus/:taskId" element={<ProtectedRoute><StudyFocusPage /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/important" element={<ProtectedRoute><ImportantPointsPage /></ProtectedRoute>} />
          <Route path="/mocktests" element={<ProtectedRoute><MockTestsPage /></ProtectedRoute>} />
          <Route path="/mistakes" element={<ProtectedRoute><MistakesPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><TaskHistoryPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/travel" element={<ProtectedRoute><TravelPage /></ProtectedRoute>} />

          <Route path="/tasks" element={<ProtectedRoute><PlaceholderPage title="All Tasks" emoji="✅" description="View and manage all your tasks across days" /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><PlaceholderPage title="Study Mode" emoji="🎓" description="Click a study task on dashboard to enter focus mode" /></ProtectedRoute>} />

          <Route path="*" element={
            <div className="min-h-screen bg-cream flex items-center justify-center px-6">
              <div className="text-center">
                <div className="text-8xl mb-4">🌸</div>
                <h1 className="text-5xl font-bold text-gray-700 font-display mb-2">404</h1>
                <p className="text-gray-400 mb-6">Page not found</p>
                <a href="/dashboard" className="inline-block px-6 py-3 bg-lavender-300 text-white rounded-2xl font-semibold shadow-soft hover:bg-lavender-400 transition">
                  ← Back to Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AnimatePresence>

      {/* 🤖 Global Chat Widget */}
      <ChatWidget />

      {/* ⭐ NEW: Floating Study Timer (shows when in study mode, not on focus page) */}
      <FloatingStudyWidget />
    </>
  );
};

export default App;