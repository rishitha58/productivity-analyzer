import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Moon, Sun, AlertCircle, Trophy,
  Clock, BellOff, Loader2, Save, CheckCircle2
} from "lucide-react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  markAllNotificationsRead,
} from "../services/aiService";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, notifs] = await Promise.all([
        getNotificationSettings(),
        getNotifications(),
      ]);
      setSettings(settingsData || {});
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("🎉 Notifications Enabled!", {
          body: "You'll now receive browser notifications",
        });
      }
    }
  };

  const settingItems = [
    {
      key: "taskReminders",
      icon: Clock,
      title: "Task Reminders",
      description: "Get notified when task time arrives",
      color: "bg-lavender-100 text-lavender-500",
    },
    {
      key: "sleepReminders",
      icon: Moon,
      title: "Sleep Reminders",
      description: "30 mins before sleep + at sleep time",
      color: "bg-babyBlue-100 text-babyBlue-500",
    },
    {
      key: "wakeUpGreeting",
      icon: Sun,
      title: "Wake Up Greeting",
      description: "Morning greeting + journal reminder",
      color: "bg-peach-100 text-peach-500",
    },
    {
      key: "undoneAlerts",
      icon: AlertCircle,
      title: "Undone Task Alerts",
      description: "Evening reminder for unfinished tasks",
      color: "bg-blush-100 text-blush-500",
    },
    {
      key: "achievements",
      icon: Trophy,
      title: "Achievements",
      description: "Celebrate streaks & milestones",
      color: "bg-mint-100 text-mint-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-lavender-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-700 font-display">
              🔔 Notifications
            </h1>
            <p className="text-xs text-gray-400">
              {notifications.length} total • {notifications.filter((n) => !n.read).length} unread
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Browser Permission Banner */}
        {"Notification" in window && Notification.permission !== "granted" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-ocean"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
                <Bell className="w-6 h-6 text-babyBlue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-700">
                  Enable Browser Notifications
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Get reminders even when the app is closed
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-white text-babyBlue-500 rounded-xl font-semibold text-xs shadow-soft"
              >
                Enable
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-700 font-display">
              ⚙️ Notification Preferences
            </h2>
            {saved && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-mint-500 font-bold flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </motion.span>
            )}
          </div>

          <div className="space-y-3">
            {settingItems.map((item) => {
              const Icon = item.icon;
              const enabled = settings[item.key] !== false; // Default true
              
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-cream rounded-2xl"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enabled ? "bg-lavender-300" : "bg-gray-300"
                    }`}
                  >
                    <motion.div
                      animate={{ x: enabled ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-soft"
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Reminder Time */}
          <div className="mt-6 p-4 bg-lavender-50 rounded-2xl">
            <label className="label">
              Notify me before task (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.reminderMinutes || 10}
              onChange={(e) => setSettings({ ...settings, reminderMinutes: parseInt(e.target.value) })}
              className="input mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              You'll get a notification this many minutes before each task
            </p>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 py-3 bg-lavender-300 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-soft"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </motion.button>
        </motion.div>

        {/* All Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-gray-700 font-display mb-4">
            📋 All Notifications
          </h2>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="w-12 h-12 mx-auto text-lavender-200 mb-3" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 rounded-xl ${
                    notif.read ? "bg-cream" : "bg-lavender-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{notif.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-700">{notif.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="badge bg-lavender-300 text-white">New</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default NotificationsPage;