import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import TaskList from "../components/tasks/TaskList";
import TaskCalendar from "../components/tasks/TaskCalendar";

const tabs = [
  { id: "list", label: "📋 List" },
  { id: "calendar", label: "📅 Calendar" },
];

const statsData = [
  { label: "Total Tasks", value: "12", color: "bg-primary/20", emoji: "📌" },
  { label: "Completed", value: "7", color: "bg-success/40", emoji: "✅" },
  { label: "Pending", value: "5", color: "bg-warning/50", emoji: "⏳" },
  { label: "Overdue", value: "1", color: "bg-error/40", emoji: "🚨" },
];

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 space-y-6"
        >

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-700">
                ✅ My Tasks
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage and track your daily tasks
              </p>
            </div>

            {/* Add Task Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-primary text-white rounded-2xl 
                         text-sm font-semibold shadow-soft"
            >
              + Add Task
            </motion.button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`${stat.color} rounded-2xl p-4 shadow-card`}
              >
                <div className="text-xl mb-1">{stat.emoji}</div>
                <div className="text-xl font-bold text-gray-700">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl shadow-card p-1 w-fit gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold 
                            transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-soft"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-card p-6"
            >
              {activeTab === "list" ? (
                <TaskList />
              ) : (
                <TaskCalendar />
              )}
            </motion.div>
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
};

export default TasksPage;