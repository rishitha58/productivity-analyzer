import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Loader2,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { getRelativeTime } from '../../utils/dateHelper';
import ReactMarkdown from 'react-markdown';

const quickPrompts = [
  { icon: '📚', text: 'Help me study a topic' },
  { icon: '🎯', text: 'Suggest a daily routine' },
  { icon: '💡', text: 'Give me a motivation quote' },
  { icon: '🧠', text: 'Explain a concept simply' },
];

const AIChatbot = ({ compact = false, studyContext = false }) => {
  const { messages, typing, sendMessage, clearChat, loadHistory } = useAI();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Load history on mount
  useEffect(() => {
    // loadHistory(); // Uncomment when backend ready
  }, []);

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || typing) return;

    setInput('');
    await sendMessage(messageText, { studyMode: studyContext });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-soft border border-lavender-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-lavender-100 via-babyBlue-100 to-mint-100 border-b border-lavender-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: typing ? [0, 10, -10, 0] : 0,
              scale: typing ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: typing ? Infinity : 0 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lavender-400 to-babyBlue-400 flex items-center justify-center shadow-soft"
          >
            <Bot className="text-white" size={20} />
          </motion.div>
          <div>
            <h3 className="font-display font-bold text-gray-800 flex items-center gap-2">
              AI Assistant
              <Sparkles size={14} className="text-lavender-500" />
            </h3>
            <p className="text-xs text-gray-500">
              {typing ? '✨ Thinking...' : 'Ready to help'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="p-2 rounded-xl bg-white/60 hover:bg-blush-100 transition-colors"
            title="Clear chat"
          >
            <Trash2 size={16} className="text-blush-400" />
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[300px]">
        {/* Welcome screen */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-lavender-200 to-babyBlue-200 flex items-center justify-center shadow-soft"
            >
              <MessageCircle size={36} className="text-lavender-500" />
            </motion.div>

            <h3 className="text-xl font-display font-bold text-gradient-primary mb-2">
              How can I help you today?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Ask me anything about productivity, studies, or daily planning ✨
            </p>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {quickPrompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSend(prompt.text)}
                  className="p-3 bg-lavender-50 hover:bg-lavender-100 rounded-xl text-left transition-all border border-lavender-200"
                >
                  <span className="text-xl mr-2">{prompt.icon}</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {prompt.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-peach-300 to-blush-300'
                    : 'bg-gradient-to-br from-lavender-300 to-babyBlue-300'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`group max-w-[80%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                } flex flex-col`}
              >
                <div
                  className={`relative px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-peach-100 to-blush-100 text-gray-800 rounded-tr-sm'
                      : message.isError
                      ? 'bg-blush-50 border border-blush-200 text-gray-800 rounded-tl-sm'
                      : 'bg-lavender-50 border border-lavender-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>

                {/* Meta + actions */}
                <div className="flex items-center gap-2 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gray-400">
                    {getRelativeTime(message.timestamp)}
                  </span>
                  <button
                    onClick={() => copyMessage(message.content, message.id)}
                    className="text-[10px] text-gray-400 hover:text-lavender-500 flex items-center gap-1"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check size={10} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-4 py-3 bg-lavender-50 border border-lavender-100 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                      className="w-2 h-2 rounded-full bg-lavender-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-lavender-100 bg-gradient-to-r from-lavender-50 to-babyBlue-50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-white border-2 border-lavender-200 rounded-2xl focus:border-lavender-400 focus:outline-none resize-none text-sm max-h-32"
              style={{
                minHeight: '48px',
                height: 'auto',
              }}
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-gray-400">
              Enter ↵
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || typing}
            className="p-3 bg-gradient-to-br from-lavender-400 to-babyBlue-400 text-white rounded-2xl shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {typing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
          <Lightbulb size={10} className="text-yellow-400" />
          Tip: Ask specific questions for better answers
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;