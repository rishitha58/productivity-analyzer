import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const suggestions = [
  "📌 Extract key points from my Physics notes",
  "📝 Generate mock test from today's topics",
  "💡 What should I study next?",
  "📊 Analyze my weak areas",
];

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI study assistant 🤖 Ask me anything about your studies, goals, or get key points extracted!",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
      { role: "ai", text: "Processing your request... 🧠" },
    ]);
    setInput("");
  };

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
          className="flex-1 flex flex-col p-6 gap-4"
        >

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-700">
              🤖 AI Assistant
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Powered by Grok AI · Extract points · Generate tests
            </p>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setInput(s)}
                className="text-xs px-4 py-2 bg-white border border-primary/30 
                           text-gray-600 rounded-full shadow-card hover:bg-primary/10 
                           transition-all"
              >
                {s}
              </motion.button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="flex-1 bg-white rounded-3xl shadow-card p-5 
                          overflow-y-auto space-y-4 max-h-[50vh]">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-primary/10 text-gray-700 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AI something..."
              className="flex-1 px-5 py-3 bg-white rounded-2xl border 
                         border-gray-200 text-sm text-gray-700 shadow-card 
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="px-5 py-3 bg-primary text-white rounded-2xl 
                         text-sm font-semibold shadow-soft"
            >
              Send 🚀
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default AIAssistantPage;