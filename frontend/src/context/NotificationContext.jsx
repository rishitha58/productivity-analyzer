import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alarms, setAlarms] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request browser notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
    loadStoredNotifications();
  }, []);

  // Load notifications from localStorage
  const loadStoredNotifications = () => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  // Save to localStorage
  const saveNotifications = (notifs) => {
    localStorage.setItem('notifications', JSON.stringify(notifs));
  };

  // Request permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
    }
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info',
      ...notification,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
      saveNotifications(updated);
      return updated;
    });

    setUnreadCount((prev) => prev + 1);

    // Show toast
    showToast(newNotification.message, newNotification.type);

    // Show browser notification
    if (permissionGranted && notification.browserNotify !== false) {
      try {
        new Notification(newNotification.title || 'Productivity Analyzer', {
          body: newNotification.message,
          icon: '/vite.svg',
        });
      } catch (e) {}
    }
  };

  // Toast helpers
  const showToast = (message, type = 'info') => {
    const baseStyle = {
      borderRadius: '14px',
      padding: '14px 18px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      boxShadow: '0 8px 20px rgba(195, 177, 225, 0.3)',
    };

    switch (type) {
      case 'success':
        toast.success(message, {
          style: { ...baseStyle, background: '#C7F2C7', color: '#1F2937' },
          iconTheme: { primary: '#69CEA9', secondary: '#fff' },
        });
        break;
      case 'error':
        toast.error(message, {
          style: { ...baseStyle, background: '#FFB3B3', color: '#1F2937' },
          iconTheme: { primary: '#FF6565', secondary: '#fff' },
        });
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
          style: { ...baseStyle, background: '#FFF3B0', color: '#1F2937' },
        });
        break;
      default:
        toast(message, {
          icon: '💜',
          style: { ...baseStyle, background: '#E8DCF5', color: '#1F2937' },
        });
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  // Remove specific notification
  const removeNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  };

  // Alarm management
  const addAlarm = (alarm) => {
    const newAlarm = {
      id: Date.now().toString(),
      active: true,
      ...alarm,
    };
    setAlarms((prev) => [...prev, newAlarm]);
  };

  const removeAlarm = (id) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAlarm = (id) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  // Check alarms every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      alarms.forEach((alarm) => {
        if (alarm.active && alarm.time === currentTime) {
          addNotification({
            title: '⏰ Alarm',
            message: alarm.message || 'Time to wake up!',
            type: 'warning',
          });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [alarms]);

  const value = {
    notifications,
    unreadCount,
    alarms,
    permissionGranted,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    showToast,
    addAlarm,
    removeAlarm,
    toggleAlarm,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;