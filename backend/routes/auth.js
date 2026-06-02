import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateGoalRoadmap } from "../services/aiService.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", { 
    expiresIn: "30d" 
  });
};

// ─── SIGNUP ───
router.post("/signup", async (req, res) => {
  try {
    console.log("📩 Signup request:", req.body);
    
    const { name, email, password } = req.body;
    
    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    // Check existing
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password 
    });
    
    console.log("✅ User created:", user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (e) {
    console.error("❌ Signup error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ─── LOGIN ───
router.post("/login", async (req, res) => {
  try {
    console.log("📩 Login request:", req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    console.log("✅ Login successful:", user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isStudent: user.isStudent,
      goal: user.goal,
      sleepSchedule: user.sleepSchedule,
      token: generateToken(user._id),
    });
  } catch (e) {
    console.error("❌ Login error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ─── ONBOARDING ───
router.post("/onboarding", protect, async (req, res) => {
  try {
    console.log("📩 Onboarding for user:", req.user._id);
    console.log("Data:", req.body);
    
    const { 
      isStudent, 
      studyField, 
      profession, 
      hasGoal, 
      goal, 
      duration, 
      sleepSchedule 
    } = req.body;

    let goalRoadmap = null;
    let currentPhase = null;

    // Try to generate roadmap, don't fail if it errors
    if (hasGoal && goal) {
      try {
        console.log("🤖 Generating goal roadmap...");
        goalRoadmap = await generateGoalRoadmap(goal, duration, isStudent);
        currentPhase = goalRoadmap?.phases?.[0]?.name || "Foundation";
        console.log("✅ Roadmap generated");
      } catch (err) {
        console.error("⚠️ Roadmap generation failed (continuing anyway):", err.message);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        isStudent: !!isStudent, 
        studyField: studyField || null,
        profession: profession || null,
        hasGoal: !!hasGoal, 
        goal: goal || null, 
        duration: duration || null, 
        goalRoadmap, 
        currentPhase, 
        sleepSchedule: sleepSchedule || {},
      },
      { new: true }
    ).select("-password");

    console.log("✅ Onboarding saved");
    res.json(user);
  } catch (e) {
    console.error("❌ Onboarding error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET ME ───
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});
// ─── GET user's goal roadmap ───
router.get("/roadmap", protect, async (req, res) => {
  try {
    res.json({
      goal: req.user.goal,
      duration: req.user.duration,
      currentPhase: req.user.currentPhase,
      roadmap: req.user.goalRoadmap,
      isStudent: req.user.isStudent,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── UPDATE current phase ───
router.patch("/phase", protect, async (req, res) => {
  try {
    const { currentPhase } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { currentPhase },
      { new: true }
    );
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── REGENERATE roadmap ───
router.post("/regenerate-roadmap", protect, async (req, res) => {
  try {
    const { generateGoalRoadmap } = await import("../services/aiService.js");
    const roadmap = await generateGoalRoadmap(
      req.user.goal,
      req.user.duration,
      req.user.isStudent
    );
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        goalRoadmap: roadmap,
        currentPhase: roadmap?.phases?.[0]?.name || "Foundation"
      },
      { new: true }
    );
    
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// ═══════════════════════════════════════
//   ✏️ UPDATE GOAL (edit text & duration)
// ═══════════════════════════════════════
router.patch("/goal", protect, async (req, res) => {
  try {
    const { goal, duration, regenerateRoadmap = false } = req.body;

    if (!goal || !goal.trim()) {
      return res.status(400).json({ error: "Goal text required" });
    }

    console.log(`✏️ Updating goal for user ${req.user._id}`);

    const updates = {
      goal: goal.trim(),
      duration: duration || req.user.duration,
      hasGoal: true,
    };

    // Optionally regenerate the roadmap
    if (regenerateRoadmap) {
      try {
        console.log("🤖 Regenerating roadmap...");
        const newRoadmap = await generateGoalRoadmap(
          goal.trim(),
          duration || req.user.duration,
          req.user.isStudent
        );
        updates.goalRoadmap = newRoadmap;
        updates.currentPhase = newRoadmap?.phases?.[0]?.name || "Foundation";
        console.log("✅ New roadmap generated");
      } catch (err) {
        console.error("⚠️ Roadmap regeneration failed:", err.message);
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    console.log("✅ Goal updated successfully");
    res.json(user);
  } catch (e) {
    console.error("❌ Update goal error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   ➕ CREATE GOAL (for users who skipped)
// ═══════════════════════════════════════
router.post("/create-goal", protect, async (req, res) => {
  try {
    const { goal, duration } = req.body;

    if (!goal || !goal.trim()) {
      return res.status(400).json({ error: "Goal text required" });
    }
    if (!duration) {
      return res.status(400).json({ error: "Duration required" });
    }

    console.log(`➕ Creating goal for user ${req.user._id}`);

    let roadmap = null;
    let currentPhase = null;

    try {
      console.log("🤖 Generating roadmap...");
      roadmap = await generateGoalRoadmap(
        goal.trim(),
        duration,
        req.user.isStudent
      );
      currentPhase = roadmap?.phases?.[0]?.name || "Foundation";
      console.log("✅ Roadmap generated");
    } catch (err) {
      console.error("⚠️ Roadmap generation failed:", err.message);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        hasGoal: true,
        goal: goal.trim(),
        duration,
        goalRoadmap: roadmap,
        currentPhase,
      },
      { new: true }
    ).select("-password");

    console.log("✅ Goal created");
    res.json(user);
  } catch (e) {
    console.error("❌ Create goal error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🗑️ DELETE GOAL & ROADMAP
// ═══════════════════════════════════════
router.delete("/goal", protect, async (req, res) => {
  try {
    console.log(`🗑️ Deleting goal for user ${req.user._id}`);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        hasGoal: false,
        goal: null,
        duration: null,
        goalRoadmap: null,
        currentPhase: null,
      },
      { new: true }
    ).select("-password");

    console.log("✅ Goal deleted");
    res.json({ success: true, user });
  } catch (e) {
    console.error("❌ Delete goal error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   ✏️ EDIT SPECIFIC PHASE
// ═══════════════════════════════════════
router.patch("/phase-edit/:phaseIndex", protect, async (req, res) => {
  try {
    const { phaseIndex } = req.params;
    const { name, duration, focus, milestones, dailyHabits } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.goalRoadmap?.phases) {
      return res.status(404).json({ error: "No roadmap found" });
    }

    const idx = parseInt(phaseIndex);
    if (!user.goalRoadmap.phases[idx]) {
      return res.status(404).json({ error: "Phase not found" });
    }

    // Update phase fields (only provided ones)
    if (name !== undefined) user.goalRoadmap.phases[idx].name = name;
    if (duration !== undefined) user.goalRoadmap.phases[idx].duration = duration;
    if (focus !== undefined) user.goalRoadmap.phases[idx].focus = focus;
    if (milestones !== undefined) user.goalRoadmap.phases[idx].milestones = milestones;
    if (dailyHabits !== undefined) user.goalRoadmap.phases[idx].dailyHabits = dailyHabits;

    user.markModified("goalRoadmap");
    await user.save();

    console.log(`✅ Phase ${phaseIndex} updated`);
    res.json(user);
  } catch (e) {
    console.error("❌ Edit phase error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;