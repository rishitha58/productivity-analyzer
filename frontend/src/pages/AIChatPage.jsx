import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Loader2, Bot, User, Plus, Trash2,
  MessageCircle, Sparkles, X
} from "lucide-react";
import {
  sendChatMessage, getAllChats, getChat, deleteChat, clearAllChats
} from "../services/aiService";

const QUICK_PROMPTS = [
  { text: "Give me a study tip", emoji: "💡" },
  { text: "How can I reach my goal faster?", emoji: "🎯" },
  { text: "Explain a difficult concept", emoji: "📚" },
  { text: "I need motivation today", emoji: "💪" },
  { text: "Create a study plan for me", emoji: "📋" },
  { text: "How to stay focused?", emoji: "🧘" },
];

const AIChatPage = () => {
  const navigate = useNavigate();
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await getAllChats();
      setChats(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load chats:", e);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const chat = await getChat(chatId);
      setActiveChat(chat);
      setMessages(chat.messages);
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  const startNewChat = () => {
    setActiveChat(null);
    setMessages([
      {
        role: "ai",
        content: `Hi ${user.name || "there"}! 👋 What would you like to discuss?`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSend = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, {
      role: "ai",
      content: "",
      loading: true,
    }]);

    try {
      const response = await sendChatMessage(messageText, activeChat?._id);
      
      if (!activeChat) {
        setActiveChat({ _id: response.chatId, title: response.title });
        loadChats();
      }

      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          content: response.aiResponse,
          timestamp: new Date(),
        };
        return newMsgs;
      });
    } catch (error) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          content: "Sorry, something went wrong. Try again! 😔",
          error: true,
        };
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await deleteChat(chatId);
    if (activeChat?._id === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
    loadChats();
  };

  const handleClearAll = async () => {
    if (!confirm("Delete ALL chat history? This cannot be undone.")) return;
    await clearAllChats();
    setActiveChat(null);
    setMessages([]);
    loadChats();
  };

  const formatMessage = (content) => {
    return content
      .split("\n")
      .map((line) => {
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        line = line.replace(/`(.*?)`/g, '<code class="bg-lavender-100 px-1 rounded text-xs">$1</code>');
        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          return `<div class="ml-4">${line.replace(/^[\s•-]+/, "• ")}</div>`;
        }
        if (/^\d+\./.test(line.trim())) {
          return `<div class="ml-4">${line}</div>`;
        }
        return `<div>${line || "&nbsp;"}</div>`;
      })
      .join("");
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-lavender-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">🤖 AI Assistant</h1>
              <p className="text-xs text-gray-400">Your personal study coach</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={startNewChat}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </motion.button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-6 overflow-hidden">
        
        {/* ─── SIDEBAR: Chat History ─── */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 font-display flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Recent Chats
              </h3>
              {chats.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blush-500 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingChats ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-lavender-400 animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-lavender-200 mb-2" />
                  <p className="text-xs text-gray-400">No chats yet</p>
                  <p className="text-xs text-gray-300 mt-1">Start a new conversation!</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <motion.div
                    key={chat._id}
                    whileHover={{ x: 2 }}
                    onClick={() => loadChat(chat._id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all group ${
                      activeChat?._id === chat._id
                        ? "bg-lavender-100"
                        : "hover:bg-lavender-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {chat.preview}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(chat.updatedAt)} • {chat.messageCount} msgs
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat._id, e)}
                        className="opacity-0 group-hover:opacity-100 text-blush-500 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── CHAT AREA ─── */}
        <div className="flex-1 card flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-700 font-display mb-2">
                Hi {user.name || "there"}! 👋
              </h2>
              <p className="text-gray-500 mb-6">
                I'm your AI assistant. How can I help you today?
              </p>

              {user.goal && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-lavender-100 rounded-full mb-6">
                  <span className="text-xs font-semibold text-lavender-500">
                    🎯 Working towards: {user.goal}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 max-w-md w-full">
                {QUICK_PROMPTS.map((prompt) => (
                  <motion.button
                    key={prompt.text}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(prompt.text)}
                    className="card text-left hover:shadow-medium transition-all"
                  >
                    <div className="text-2xl mb-1">{prompt.emoji}</div>
                    <p className="text-xs font-semibold text-gray-700">{prompt.text}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[70%] ${msg.role === "user" ? "order-1" : ""}`}>
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-lavender-300 text-white rounded-br-sm"
                          : msg.error
                          ? "bg-blush-100 text-gray-700 rounded-bl-sm"
                          : "bg-cream text-gray-700 rounded-bl-sm"
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
                      {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-10 h-10 rounded-full bg-peach-300 flex items-center justify-center flex-shrink-0 order-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-lavender-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                placeholder="Ask me anything..."
                disabled={loading}
                className="input flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                  input.trim() && !loading
                    ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;