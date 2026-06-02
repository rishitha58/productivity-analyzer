import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import StudyMode from "../components/study/StudyMode";
import MusicPlayer from "../components/study/MusicPlayer";
import DndToggle from "../components/study/DndToggle";
import FocusTimer from "../components/study/FocusTimer";

const StudyPage = () => {
  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <Navbar />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 space-y-6"
        >

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-700">
                🎓 Study Mode
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Focus deeply. Block distractions. Learn faster.
              </p>
            </div>

            {/* DnD Toggle */}
            <DndToggle />
          </div>

          {/* Focus Timer - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/20 via-white 
                       to-accent/20 rounded-3xl shadow-card p-8"
          >
            <FocusTimer />
          </motion.div>

          {/* Study Mode + Music Grid */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Study Mode Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-card p-6"
            >
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                📚 Study Session
              </h2>
              <StudyMode />
            </motion.div>

            {/* Music Player */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-card p-6"
            >
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                🎵 Focus Music
              </h2>
              <MusicPlayer />
            </motion.div>

          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default StudyPage;