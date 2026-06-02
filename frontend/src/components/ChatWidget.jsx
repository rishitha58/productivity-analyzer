import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageCircle, X, Send, Sparkles, Loader2, Maximize2,
  Bot, User, ChevronDown
} from "lucide-react";
import { sendChatMessage } from "../services/aiService";

const QUICK_PROMPTS = [
  "💡 Give me a study tip",
  "🎯 How can I reach my goal faster?",
  "📚 Suggest what to study today",
  "💪 I need motivation",
];

const ChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ⭐ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const welcomeMsg = {
        role: "ai",
        content: `Hi ${user.name || "there"}! 👋 I'm your AI assistant.\n\nI can help you with:\n• Study tips & explanations\n• Reaching your goal: **${user.goal || "your objectives"}**\n• Motivation & advice\n• Anything else you need!\n\nWhat would you like to talk about?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen]);

  // ⭐ MOVED: Conditional return is NOW AFTER all hooks (this is the fix!)
  const hideOnPaths = ["/", "/journal"];
  const shouldHide = hideOnPaths.includes(location.pathname) || location.pathname.includes("/focus");
  
  if (shouldHide) {
    return null;
  }

  const handleSend = async (messageText = null) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, {
      role: "ai",
      content: "",
      timestamp: new Date(),
      loading: true,
    }]);

    try {
      const response = await sendChatMessage(text, chatId);
      
      if (!chatId) setChatId(response.chatId);

      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          content: response.aiResponse,
          timestamp: new Date(),
          loading: false,
        };
        return newMsgs;
      });
    } catch (error) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          content: "Sorry, I'm having trouble right now 😔 Please try again!",
          timestamp: new Date(),
          loading: false,
          error: true,
        };
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (content) => {
    return content
      .split("\n")
      .map((line, i) => {
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        line = line.replace(/`(.*?)`/g, '<code class="bg-lavender-100 px-1 rounded text-xs">$1</code>');
        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          return `<li class="ml-4">${line.replace(/^[\s•-]+/, "")}</li>`;
        }
        if (/^\d+\./.test(line.trim())) {
          return `<li class="ml-4">${line.replace(/^\d+\.\s*/, "")}</li>`;
        }
        return line || "<br/>";
      })
      .join("<br/>");
  };

  return (
    <>
      {/* ═══════ FLOATING BUTTON ═══════ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-primary rounded-full shadow-large flex items-center justify-center text-white z-40 group"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            
            <motion.div
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-lavender-300"
            />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-blush-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}

            <div className="absolute right-full mr-3 px-3 py-2 bg-gray-700 text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask AI anything 💬
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════ CHAT WINDOW ═══════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-large z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center"
                >
                  <Bot className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="font-bold font-display">AI Assistant</h3>
                  <p className="text-xs opacity-80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-mint-300 rounded-full" />
                    Always here to help
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/ai");
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg"
                  title="Open full chat"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-lavender-300 text-white rounded-br-sm"
                          : msg.error
                          ? "bg-blush-100 text-gray-700 rounded-bl-sm"
                          : "bg-white text-gray-700 rounded-bl-sm shadow-soft"
                      }`}
                    >
                      {msg.loading ? (
                        <div className="flex items-center gap-2 py-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-2 h-2 bg-lavender-300 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-2 h-2 bg-lavender-300 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-2 h-2 bg-lavender-300 rounded-full"
                          />
                        </div>
                      ) : (
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                      )}
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-peach-300 flex items-center justify-center flex-shrink-0 order-2">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pt-2 pb-3 bg-cream">
                <p className="text-xs text-gray-400 mb-2">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <motion.button
                      key={prompt}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSend(prompt)}
                      className="text-xs px-3 py-1.5 bg-white border border-lavender-200 rounded-full hover:bg-lavender-50 transition"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-lavender-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-cream rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    input.trim() && !loading
                      ? "bg-lavender-300 text-white hover:bg-lavender-400"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;