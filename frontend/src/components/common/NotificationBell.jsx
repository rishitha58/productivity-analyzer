import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { getRelativeTime } from '../../utils/dateHelper';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const getTypeStyle = (type) => {
    const styles = {
      success: 'bg-mint-100 text-mint-500',
      error: 'bg-blush-100 text-blush-500',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-babyBlue-100 text-babyBlue-500',
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-peach-100 hover:bg-peach-200 transition-colors"
      >
        <Bell size={18} className="text-peach-500" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-gradient-to-br from-blush-400 to-blush-500 text-white text-xs font-bold flex items-center justify-center px-1.5 shadow-soft"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blush-400/40 animate-ping" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-large border border-lavender-100 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-lavender-50 to-peach-50 border-b border-lavender-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : 'You are all caught up!'}
                  </p>
                </div>
                {notifications.length > 0 && (
                  <div className="flex gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <Check size={16} className="text-mint-500" />
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      title="Clear all"
                      className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      <Trash2 size={16} className="text-blush-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications list */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-lavender-100 flex items-center justify-center">
                      <Bell size={24} className="text-lavender-400" />
                    </div>
                    <p className="text-sm text-gray-500">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      We will notify you about important updates
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-lavender-50">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`group px-4 py-3 hover:bg-lavender-50/50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-lavender-50/30' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeStyle(
                              notification.type
                            )}`}
                          >
                            <Bell size={14} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {notification.title && (
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {notification.title}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getRelativeTime(notification.timestamp)}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blush-100 transition-all"
                          >
                            <X size={14} className="text-gray-400" />
                          </button>

                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-lavender-400 flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;