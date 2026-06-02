import express from "express";
import Notification from "../models/Notification.js";
import Journal from "../models/Journal.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ═══════════════════════════════════════
//   GET all notifications
// ═══════════════════════════════════════
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   GET unread count
// ═══════════════════════════════════════
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   MARK as read
// ═══════════════════════════════════════
router.patch("/:id/read", protect, async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   MARK ALL as read
// ═══════════════════════════════════════
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   DELETE notification
// ═══════════════════════════════════════
router.delete("/:id", protect, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   CLEAR all notifications
// ═══════════════════════════════════════
router.delete("/", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   GENERATE notifications (smart logic)
// ═══════════════════════════════════════
router.post("/generate", protect, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5); // "HH:MM"
    
    const settings = user.notificationSettings || {};
    const newNotifications = [];

    // ─── 1. CHECK TASK ALARMS ───
    if (settings.taskReminders !== false) {
      const journal = await Journal.findOne({ userId: user._id, date: today });
      
      if (journal?.tasks) {
        for (const task of journal.tasks) {
          if (!task.time || task.done) continue;
          
          // Calculate notification time (X minutes before)
          const reminderMins = settings.reminderMinutes || 10;
          const [hour, min] = task.time.split(":").map(Number);
          const taskMinutes = hour * 60 + min;
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const diff = taskMinutes - currentMinutes;
          
          // Notify if within 10 mins before to 5 mins after
          if (diff <= reminderMins && diff >= -5) {
            const exists = await Notification.findOne({
              userId: user._id,
              type: "task",
              taskId: task._id?.toString(),
              createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Within last 30 min
            });
            
            if (!exists) {
              const isNow = diff <= 0;
              newNotifications.push({
                userId: user._id,
                type: "task",
                title: isNow ? "⏰ Task Time!" : "⏰ Upcoming Task",
                message: `${task.title} ${isNow ? "is now" : `in ${diff} mins`} ${task.location ? `at ${task.location}` : ""}`,
                emoji: task.goalAligned ? "🎯" : "⏰",
                priority: task.priority === "high" ? "high" : "medium",
                taskId: task._id?.toString(),
                actionUrl: task.category === "study" ? `/focus/${task._id}` : "/dashboard",
                actionLabel: task.category === "study" ? "Start Focus Mode" : "View",
              });
            }
          }
        }
      }
    }

    // ─── 2. SLEEP REMINDER ───
    if (settings.sleepReminders !== false && user.sleepSchedule?.sleepTime) {
      const sleepTime = user.sleepSchedule.sleepTime;
      const [sh, sm] = sleepTime.split(":").map(Number);
      const sleepMinutes = sh * 60 + sm;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Notify 30 mins before sleep + at sleep time
      const diff = sleepMinutes - currentMinutes;
      if ((diff <= 30 && diff >= 25) || (diff <= 0 && diff >= -5)) {
        const exists = await Notification.findOne({
          userId: user._id,
          type: "sleep",
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
        });
        
        if (!exists) {
          newNotifications.push({
            userId: user._id,
            type: "sleep",
            title: diff > 0 ? "😴 Sleep Soon" : "🌙 Time to Sleep!",
            message: diff > 0 
              ? `Your sleep time is at ${sleepTime}. Start winding down!`
              : `It's your sleep time. Put your phone away and rest! 💤`,
            emoji: "😴",
            priority: "high",
          });
        }
      }
    }

    // ─── 3. WAKE UP GREETING ───
    if (settings.wakeUpGreeting !== false && user.sleepSchedule?.wakeTime) {
      const wakeTime = user.sleepSchedule.wakeTime;
      const [wh, wm] = wakeTime.split(":").map(Number);
      const wakeMinutes = wh * 60 + wm;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const diff = currentMinutes - wakeMinutes;
      
      // Within 30 mins after wake time
      if (diff >= 0 && diff <= 30) {
        const exists = await Notification.findOne({
          userId: user._id,
          type: "wakeup",
          createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }, // Today
        });
        
        if (!exists) {
          newNotifications.push({
            userId: user._id,
            type: "wakeup",
            title: "🌅 Good Morning!",
            message: `Rise and shine, ${user.name}! Let's make today productive. Write your journal! 🌸`,
            emoji: "🌅",
            priority: "medium",
            actionUrl: "/journal",
            actionLabel: "Write Journal",
          });
        }
      }
    }

    // ─── 4. UNDONE TASKS ALERT (Evening) ───
    if (settings.undoneAlerts !== false) {
      const hour = now.getHours();
      
      // Evening check (8 PM)
      if (hour >= 20 && hour < 22) {
        const journal = await Journal.findOne({ userId: user._id, date: today });
        if (journal?.tasks) {
          const undone = journal.tasks.filter((t) => !t.done);
          
          if (undone.length > 0) {
            const exists = await Notification.findOne({
              userId: user._id,
              type: "undone",
              createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
            });
            
            if (!exists) {
              newNotifications.push({
                userId: user._id,
                type: "undone",
                title: "⚠️ Undone Tasks",
                message: `You have ${undone.length} unfinished task${undone.length > 1 ? "s" : ""} today. Did you forget to check them off?`,
                emoji: "⚠️",
                priority: "high",
                actionUrl: "/dashboard",
                actionLabel: "Review Tasks",
              });
            }
          }
        }
      }
    }

    // ─── 5. ACHIEVEMENTS ───
    if (settings.achievements !== false) {
      // Streak milestones
      if (user.streak === 7 || user.streak === 30 || user.streak === 100) {
        const exists = await Notification.findOne({
          userId: user._id,
          type: "achievement",
          message: { $regex: `${user.streak}-day streak` },
        });
        
        if (!exists) {
          newNotifications.push({
            userId: user._id,
            type: "achievement",
            title: "🎉 Achievement Unlocked!",
            message: `Amazing! You hit a ${user.streak}-day streak! Keep going! 🔥`,
            emoji: "🏆",
            priority: "high",
          });
        }
      }
    }

    // Save all
    if (newNotifications.length > 0) {
      await Notification.insertMany(newNotifications);
    }

    res.json({
      generated: newNotifications.length,
      notifications: newNotifications,
    });
  } catch (e) {
    console.error("❌ Generate notifications error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   UPDATE notification settings
// ═══════════════════════════════════════
router.patch("/settings", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: req.body },
      { new: true }
    );
    res.json(user.notificationSettings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   GET notification settings
// ═══════════════════════════════════════
router.get("/settings", protect, async (req, res) => {
  try {
    res.json(req.user.notificationSettings || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;