import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, X, Check, CheckCheck, Trash2, Settings,
  Clock, Moon, Sun, AlertCircle, Trophy, Info, Loader2
} from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  generateNotifications,
} from "../services/aiService";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load notifications + generate new ones periodically
  useEffect(() => {
    loadData();
    
    // Request browser notification permission
    requestPermission();

    // Check every 60 seconds
    const interval = setInterval(() => {
      generateAndLoad();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const loadData = async () => {
    try {
      const [notifs, countData] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setUnreadCount(countData.count || 0);
    } catch (e) {
      console.error("Load notifications failed:", e);
    }
  };

  const generateAndLoad = async () => {
    try {
      const result = await generateNotifications();
      
      // Show browser notifications for new ones
      if (result.notifications?.length > 0 && Notification.permission === "granted") {
        result.notifications.forEach((notif) => {
          if (!notif.shown) {
            new Notification(notif.title, {
              body: notif.message,
              icon: "/favicon.ico",
              tag: notif._id?.toString(),
            });
          }
        });
      }
      
      await loadData();
    } catch (e) {
      console.error("Generate failed:", e);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      await markNotificationRead(notif._id);
      await loadData();
    }
    
    // Navigate if has action
    // Navigate based on notification type
if (notif.type === "undone") {
  // ⭐ Undone notifications go to History page
  navigate("/history");
  setIsOpen(false);
} else if (notif.actionUrl) {
  navigate(notif.actionUrl);
  setIsOpen(false);
}
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await loadData();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotification(id);
    await loadData();
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    await clearAllNotifications();
    await loadData();
  };

  // Get icon for notification type
  const getIcon = (type) => {
    const icons = {
      task: Clock,
      sleep: Moon,
      wakeup: Sun,
      undone: AlertCircle,
      achievement: Trophy,
      info: Info,
      reminder: Bell,
    };
    return icons[type] || Bell;
  };

  // Get color for notification type
  const getColor = (type, priority) => {
    if (priority === "high") return "bg-blush-100 text-blush-500";
    const colors = {
      task: "bg-lavender-100 text-lavender-500",
      sleep: "bg-babyBlue-100 text-babyBlue-500",
      wakeup: "bg-peach-100 text-peach-500",
      undone: "bg-blush-100 text-blush-500",
      achievement: "bg-mint-100 text-mint-500",
      info: "bg-babyBlue-100 text-babyBlue-500",
      reminder: "bg-lavender-100 text-lavender-500",
    };
    return colors[type] || "bg-lavender-100 text-lavender-500";
  };

  // Format time
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon relative"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-blush-400 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-large border border-lavender-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-primary text-white">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold font-display">🔔 Notifications</h3>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Mark all read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs opacity-80">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up! ✨"}
              </p>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <Bell className="w-12 h-12 mx-auto text-lavender-200 mb-3" />
                  <p className="text-sm text-gray-500 font-semibold">
                    No notifications yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    We'll notify you when something important happens
                  </p>
                </div>
              ) : (
                notifications.map((notif, i) => {
                  const Icon = getIcon(notif.type);
                  const colorClass = getColor(notif.type, notif.priority);
                  
                  return (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-lavender-50 cursor-pointer transition-all group ${
                        notif.read
                          ? "bg-white hover:bg-lavender-50"
                          : "bg-lavender-50/50 hover:bg-lavender-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-2xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-bold ${
                              notif.read ? "text-gray-700" : "text-gray-900"
                            }`}>
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-lavender-400 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className={`text-xs mt-1 ${
                            notif.read ? "text-gray-500" : "text-gray-700"
                          }`}>
                            {notif.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTime(notif.createdAt)}
                            </span>
                            
                            {notif.actionLabel && (
                              <span className="text-xs text-lavender-500 font-semibold">
                                {notif.actionLabel} →
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(notif._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blush-500 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-cream border-t border-lavender-100">
                <button
                  onClick={() => {
                    navigate("/notifications");
                    setIsOpen(false);
                  }}
                  className="w-full text-xs text-center text-lavender-500 font-semibold hover:text-lavender-600"
                >
                  View All & Settings →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;