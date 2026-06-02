import express from "express";
import mongoose from "mongoose";
import Journal from "../models/Journal.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { extractTasksFromJournal } from "../services/aiService.js";

const router = express.Router();

// ═══════════════════════════════════════
//   ADD / APPEND tasks (NOT replace!)
// ═══════════════════════════════════════
router.post("/", protect, async (req, res) => {
  try {
    const { rawText } = req.body;
    const today = new Date().toISOString().split("T")[0];

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: "Journal text required" });
    }

    console.log("📝 Processing journal for user:", req.user._id);

    // Get AI to extract tasks
    const aiResult = await extractTasksFromJournal(rawText, {
      goal: req.user.goal,
      currentPhase: req.user.currentPhase,
      isStudent: req.user.isStudent,
    });

    const newTasks = aiResult.tasks || [];

    // 🎯 FIND existing journal for today
    let journal = await Journal.findOne({
      userId: req.user._id,
      date: today,
    });

    if (journal) {
      // 🎯 APPEND new tasks to existing ones
      console.log(`📌 Adding ${newTasks.length} tasks to existing journal`);
      
      journal.tasks.push(...newTasks);
      journal.rawText = journal.rawText + "\n\n--- Added later ---\n" + rawText;
      
      if (aiResult.motivation) {
        journal.motivation = aiResult.motivation;
      }
      
      await journal.save();
    } else {
      // 🆕 First entry of the day
      console.log(`🆕 Creating new journal with ${newTasks.length} tasks`);
      
      journal = await Journal.create({
        userId: req.user._id,
        date: today,
        rawText,
        tasks: newTasks,
        motivation: aiResult.motivation,
      });
    }

    await updateStreak(req.user._id, today);

    res.json({
      journal,
      suggestions: aiResult.missingGoalTasks || [],
      newTasksAdded: newTasks.length,
    });
  } catch (e) {
    console.error("❌ Journal error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   GET today's journal
// ═══════════════════════════════════════
router.get("/today", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const journal = await Journal.findOne({ userId: req.user._id, date: today });
    res.json(journal || { tasks: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   TOGGLE task done
// ═══════════════════════════════════════
router.patch("/task/:taskId", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const journal = await Journal.findOne({ userId: req.user._id, date: today });

    if (!journal) {
      return res.status(404).json({ error: "No journal today" });
    }

    const task = journal.tasks.id(req.params.taskId);
    if (task) {
      task.done = !task.done;
      task.completedAt = task.done ? new Date() : null;
      await journal.save();
    }
    res.json(journal);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   DELETE single task
// ═══════════════════════════════════════
router.delete("/task/:taskId", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const journal = await Journal.findOne({ userId: req.user._id, date: today });

    if (!journal) {
      return res.status(404).json({ error: "No journal today" });
    }

    journal.tasks = journal.tasks.filter(
      (t) => t._id.toString() !== req.params.taskId
    );
    await journal.save();

    res.json(journal);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   GET all journals (history)
// ═══════════════════════════════════════
router.get("/", protect, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    res.json(journals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   GET stats
// ═══════════════════════════════════════
router.get("/stats", protect, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id });
    
    let totalTasks = 0;
    let completedTasks = 0;
    let goalAlignedTasks = 0;
    let goalAlignedCompleted = 0;
    let totalDays = journals.length;
    
    journals.forEach((j) => {
      j.tasks.forEach((t) => {
        totalTasks++;
        if (t.done) completedTasks++;
        if (t.goalAligned) {
          goalAlignedTasks++;
          if (t.done) goalAlignedCompleted++;
        }
      });
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const goalProgress = goalAlignedTasks > 0 ? (goalAlignedCompleted / goalAlignedTasks) * 100 : 0;

    res.json({
      totalDays,
      totalTasks,
      completedTasks,
      goalAlignedTasks,
      goalAlignedCompleted,
      completionRate: Math.round(completionRate),
      goalProgress: Math.round(goalProgress),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   HELPER: Update user streak
// ═══════════════════════════════════════
async function updateStreak(userId, today) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const lastDate = user.lastJournalDate;

    if (!lastDate) {
      user.streak = 1;
      user.totalJournalsWritten = 1;
    } else {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return;
      } else if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 1;
      }

      user.totalJournalsWritten = (user.totalJournalsWritten || 0) + 1;
    }

    user.lastJournalDate = today;
    await user.save();
  } catch (e) {
    console.error("Streak update failed:", e);
  }
}

// ═══════════════════════════════════════
//   PRODUCTIVITY STATS (Charts + Analysis)
// ═══════════════════════════════════════
router.get("/productivity", protect, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id })
      .sort({ date: -1 });

    const dailyData = journals.map((j) => {
      const total = j.tasks.length;
      const completed = j.tasks.filter((t) => t.done).length;
      const goalAligned = j.tasks.filter((t) => t.goalAligned).length;
      const goalCompleted = j.tasks.filter((t) => t.goalAligned && t.done).length;

      return {
        date: j.date,
        total,
        completed,
        goalAligned,
        goalCompleted,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    let totalTasks = 0;
    let completedTasks = 0;
    let goalAlignedTasks = 0;
    let goalAlignedCompleted = 0;
    const categoryBreakdown = {};

    journals.forEach((j) => {
      j.tasks.forEach((t) => {
        totalTasks++;
        if (t.done) completedTasks++;
        if (t.goalAligned) goalAlignedTasks++;
        if (t.goalAligned && t.done) goalAlignedCompleted++;

        const cat = t.category || "personal";
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, completed: 0 };
        categoryBreakdown[cat].total++;
        if (t.done) categoryBreakdown[cat].completed++;
      });
    });

    const user = await User.findById(req.user._id);

    let bestDay = null;
    let bestRate = 0;
    dailyData.forEach((d) => {
      if (d.completionRate > bestRate) {
        bestRate = d.completionRate;
        bestDay = d.date;
      }
    });

    const last7 = dailyData.slice(0, 7);
    const weeklyAvg = last7.length > 0
      ? Math.round(last7.reduce((sum, d) => sum + d.completionRate, 0) / last7.length)
      : 0;

    res.json({
      dailyData: dailyData.slice(0, 30),
      overall: {
        totalDays: journals.length,
        totalTasks,
        completedTasks,
        goalAlignedTasks,
        goalAlignedCompleted,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        goalProgress: goalAlignedTasks > 0 ? Math.round((goalAlignedCompleted / goalAlignedTasks) * 100) : 0,
        streak: user?.streak || 0,
        weeklyAvg,
        bestDay,
        bestRate,
      },
      categoryBreakdown,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   TASK HISTORY (All tasks by date)
// ═══════════════════════════════════════
router.get("/history", protect, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(60);

    const history = journals.map((j) => ({
      date: j.date,
      tasks: j.tasks,
      totalTasks: j.tasks.length,
      completedTasks: j.tasks.filter((t) => t.done).length,
      rawText: j.rawText,
      motivation: j.motivation,
    }));

    res.json(history);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   ⭐ UNDONE TASKS (Smart filtering)
//   - Excludes tasks completed on any day
//   - Excludes tasks already in today
//   - Deduplicates by title
// ═══════════════════════════════════════
router.get("/undone", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get previous days' journals
    const journals = await Journal.find({
      userId: req.user._id,
      date: { $lt: today },
    })
      .sort({ date: -1 })
      .limit(14);

    // Get today's journal
    const todayJournal = await Journal.findOne({
      userId: req.user._id,
      date: today,
    });

    // ⭐ Build set of ALL task titles ever COMPLETED
    const completedTitles = new Set();
    
    journals.forEach((j) => {
      j.tasks.forEach((t) => {
        if (t.done) {
          completedTitles.add(t.title.toLowerCase().trim().replace(/\s+/g, " "));
        }
      });
    });
    
    if (todayJournal) {
      todayJournal.tasks.forEach((t) => {
        if (t.done) {
          completedTitles.add(t.title.toLowerCase().trim().replace(/\s+/g, " "));
        }
      });
    }

    // ⭐ Build set of ALL today's task titles (done or undone)
    const todayTaskTitles = new Set();
    if (todayJournal) {
      todayJournal.tasks.forEach((t) => {
        todayTaskTitles.add(t.title.toLowerCase().trim().replace(/\s+/g, " "));
      });
    }

    // Collect undone tasks from past
    const allUndoneTasks = [];
    journals.forEach((j) => {
      j.tasks.forEach((t) => {
        if (!t.done) {
          allUndoneTasks.push({
            _id: t._id,
            title: t.title,
            priority: t.priority,
            category: t.category,
            goalAligned: t.goalAligned,
            goalContribution: t.goalContribution,
            time: t.time,
            estimatedDuration: t.estimatedDuration,
            originalDate: j.date,
            daysOld: Math.floor(
              (new Date(today) - new Date(j.date)) / (1000 * 60 * 60 * 24)
            ),
          });
        }
      });
    });

    // ⭐ FILTER: Exclude tasks that are completed on any day OR already in today
    const filteredUndoneTasks = allUndoneTasks.filter((task) => {
      const key = task.title.toLowerCase().trim().replace(/\s+/g, " ");
      return !completedTitles.has(key) && !todayTaskTitles.has(key);
    });

    console.log(
      `📋 Undone: ${allUndoneTasks.length} total → ${filteredUndoneTasks.length} after filtering`
    );

    // Deduplicate by title: keep OLDEST occurrence
    const dedupedMap = {};
    filteredUndoneTasks.forEach((task) => {
      const key = task.title.toLowerCase().trim().replace(/\s+/g, " ");
      
      if (!dedupedMap[key]) {
        dedupedMap[key] = { ...task, occurrenceCount: 1 };
      } else {
        dedupedMap[key].occurrenceCount += 1;
        if (task.daysOld > dedupedMap[key].daysOld) {
          dedupedMap[key].originalDate = task.originalDate;
          dedupedMap[key].daysOld = task.daysOld;
        }
      }
    });

    const uniqueUndoneTasks = Object.values(dedupedMap).sort(
      (a, b) => b.daysOld - a.daysOld
    );

    console.log(`📋 Final: ${uniqueUndoneTasks.length} unique undone tasks shown`);

    res.json(uniqueUndoneTasks);
  } catch (e) {
    console.error("❌ Undone tasks error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   ⭐ ADD UNDONE TASK TO TODAY (No duplicates)
// ═══════════════════════════════════════
router.post("/carry-forward", protect, async (req, res) => {
  try {
    const { tasks } = req.body;
    const today = new Date().toISOString().split("T")[0];

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "No tasks provided" });
    }

    let journal = await Journal.findOne({ userId: req.user._id, date: today });

    if (!journal) {
      journal = await Journal.create({
        userId: req.user._id,
        date: today,
        rawText: "📌 Carried forward from previous days",
        tasks: tasks.map((t) => ({
          title: t.title,
          priority: t.priority || "medium",
          category: t.category || "personal",
          goalAligned: t.goalAligned || false,
          goalContribution: t.goalContribution || "",
          time: t.time || null,
          estimatedDuration: t.estimatedDuration || null,
          done: false,
          completedAt: null,
          carriedForward: true,
        })),
      });

      console.log(`✅ Carried forward ${tasks.length} tasks to new journal`);
    } else {
      // Check existing task titles
      const existingTitles = new Set(
        journal.tasks.map((t) => t.title.toLowerCase().trim().replace(/\s+/g, " "))
      );

      // Only add tasks not already in today
      const newTasks = tasks.filter((t) => {
        const key = t.title.toLowerCase().trim().replace(/\s+/g, " ");
        return !existingTitles.has(key);
      });

      const skipped = tasks.length - newTasks.length;
      if (skipped > 0) {
        console.log(`⚠️  Skipped ${skipped} duplicate task(s) already in today`);
      }

      if (newTasks.length === 0) {
        return res.json({
          ...journal.toObject(),
          message: "All selected tasks are already in today's list",
        });
      }

      journal.tasks.push(
        ...newTasks.map((t) => ({
          title: t.title,
          priority: t.priority || "medium",
          category: t.category || "personal",
          goalAligned: t.goalAligned || false,
          goalContribution: t.goalContribution || "",
          time: t.time || null,
          estimatedDuration: t.estimatedDuration || null,
          done: false,
          completedAt: null,
          carriedForward: true,
        }))
      );

      await journal.save();
      console.log(`✅ Added ${newTasks.length} carried-forward tasks`);
    }

    res.json(journal);
  } catch (e) {
    console.error("❌ Carry-forward error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🧹 CLEANUP TODAY'S DUPLICATE TASKS
// ═══════════════════════════════════════
router.post("/cleanup-duplicates", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const journal = await Journal.findOne({ userId: req.user._id, date: today });

    if (!journal) {
      return res.json({ message: "No journal today", removed: 0 });
    }

    const originalCount = journal.tasks.length;
    console.log(`🔍 Starting cleanup. Found ${originalCount} tasks`);

    const seen = new Map();
    const uniqueTasks = [];

    journal.tasks.forEach((task) => {
      const key = task.title.toLowerCase().trim().replace(/\s+/g, " ");
      
      if (!seen.has(key)) {
        seen.set(key, uniqueTasks.length);
        uniqueTasks.push(task);
      } else {
        const existingIndex = seen.get(key);
        const existing = uniqueTasks[existingIndex];
        
        // Keep completed version if duplicate exists
        if (task.done && !existing.done) {
          uniqueTasks[existingIndex] = task;
        }
      }
    });

    // Regenerate _ids to fix duplicate _id issue
    const cleanedTasks = uniqueTasks.map((task) => {
      const taskObj = task.toObject ? task.toObject() : task;
      return {
        ...taskObj,
        _id: new mongoose.Types.ObjectId(),
      };
    });

    journal.tasks = cleanedTasks;
    journal.markModified("tasks");
    await journal.save();

    const removed = originalCount - cleanedTasks.length;
    console.log(`✅ Cleaned ${removed} duplicates. Now ${cleanedTasks.length} unique tasks`);

    res.json({
      message: `Removed ${removed} duplicate tasks`,
      removed,
      remaining: cleanedTasks.length,
    });
  } catch (e) {
    console.error("❌ Cleanup error:", e);
    res.status(500).json({ error: e.message });
  }
});
// ═══════════════════════════════════════
//   ✅ MARK PAST TASK AS DONE (retrospectively)
// ═══════════════════════════════════════
router.patch("/task/:journalDate/:taskId/mark-done", protect, async (req, res) => {
  try {
    const { journalDate, taskId } = req.params;

    console.log(`✅ Marking task done: ${taskId} from ${journalDate}`);

    const journal = await Journal.findOne({
      userId: req.user._id,
      date: journalDate,
    });

    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    const task = journal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.done = true;
    task.completedAt = new Date();
    task.completedLate = true;
    task.skipped = false;

    journal.markModified("tasks");
    await journal.save();

    console.log(`✅ Marked task done: "${task.title}"`);

    res.json({ success: true, task });
  } catch (e) {
    console.error("❌ Mark done error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   ❌ SKIP TASK (won't do it)
// ═══════════════════════════════════════
router.patch("/task/:journalDate/:taskId/skip", protect, async (req, res) => {
  try {
    const { journalDate, taskId } = req.params;

    console.log(`⊘ Skipping task: ${taskId} from ${journalDate}`);

    const journal = await Journal.findOne({
      userId: req.user._id,
      date: journalDate,
    });

    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    const task = journal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.skipped = true;
    task.skippedAt = new Date();
    task.done = false;

    journal.markModified("tasks");
    await journal.save();

    console.log(`⊘ Skipped task: "${task.title}"`);

    res.json({ success: true, task });
  } catch (e) {
    console.error("❌ Skip task error:", e);
    res.status(500).json({ error: e.message });
  }
});
export default router;