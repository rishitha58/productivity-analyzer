import express from "express";
import Doubt from "../models/Doubt.js";
import MockTest from "../models/MockTest.js";
import { protect } from "../middleware/auth.js";

// 🔵 Gemini (fallback for /ask, primary for /generate-test)
import { answerDoubt, generateTestFromDoubts } from "../services/aiService.js";

// 🟣 Groq (primary for /ask)
import { answerDoubtWithGroq } from "../services/groqService.js";

const router = express.Router();

// ═══════════════════════════════════════
//   🧠 ASK AI A DOUBT (Groq + Gemini fallback)
// ═══════════════════════════════════════
router.post("/ask", protect, async (req, res) => {
  try {
    const { question, topic, taskId, taskTitle } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    console.log("🧠 Doubt asked:", question.substring(0, 50));

    const userContext = {
      isStudent: req.user.isStudent,
    };

    // 🚀 Try Groq first, fallback to Gemini
    let aiResponse;
    let provider = "groq";

    try {
      console.log("🟣 Trying Groq for doubt...");
      aiResponse = await answerDoubtWithGroq(question, topic, userContext);
    } catch (groqError) {
      console.log("⚠️  Groq failed, falling back to Gemini...");
      console.log("   Reason:", groqError.message?.substring(0, 100));

      try {
        aiResponse = await answerDoubt(question, topic, userContext);
        provider = "gemini";
      } catch (geminiError) {
        console.error("❌ Both AI services failed!");
        console.error("   Groq:", groqError.message);
        console.error("   Gemini:", geminiError.message);

        return res.status(503).json({
          error: "AI services are temporarily unavailable. Try again in a moment!",
        });
      }
    }

    console.log(`✅ Doubt answered by: ${provider}`);

    // Save doubt to DB
    const doubt = await Doubt.create({
      userId: req.user._id,
      taskId,
      taskTitle,
      topic: aiResponse.topic || topic,
      question,
      answer: aiResponse.answer,
      difficulty: aiResponse.difficulty,
    });

    res.json({
      doubt,
      keyPoints: aiResponse.keyPoints,
      relatedQuestions: aiResponse.relatedQuestions,
      provider, // ⭐ Optional: tells frontend which AI answered
    });
  } catch (e) {
    console.error("❌ Doubt error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   📋 GET ALL DOUBTS
// ═══════════════════════════════════════
router.get("/", protect, async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(doubts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🏷️ GET DOUBTS GROUPED BY TOPIC
// ═══════════════════════════════════════
router.get("/topics", protect, async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user._id });

    // Group by topic
    const grouped = {};
    doubts.forEach((d) => {
      const topic = d.topic || "General";
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(d);
    });

    const topics = Object.keys(grouped).map((topic) => ({
      topic,
      count: grouped[topic].length,
      doubts: grouped[topic],
    }));

    res.json(topics);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   📝 GENERATE MOCK TEST FROM DOUBTS
//   (Uses Gemini - needs strict JSON output)
// ═══════════════════════════════════════
router.post("/generate-test", protect, async (req, res) => {
  try {
    const { topic, numQuestions = 5 } = req.body;

    const filter = { userId: req.user._id };
    if (topic) filter.topic = topic;

    const doubts = await Doubt.find(filter).limit(20);

    if (doubts.length === 0) {
      return res.status(400).json({
        error: "No doubts found. Ask questions in Focus Mode first!",
      });
    }

    console.log(`🔵 Generating test from ${doubts.length} doubts (Gemini)...`);
    const questions = await generateTestFromDoubts(doubts, numQuestions);

    if (questions.length === 0) {
      return res.status(500).json({ error: "AI couldn't generate questions" });
    }

    const test = await MockTest.create({
      userId: req.user._id,
      topic: topic || `Doubts Review (${doubts.length} doubts)`,
      questions,
      totalQuestions: questions.length,
      source: "doubts",
    });

    console.log(`✅ Test created with ${questions.length} questions`);
    res.json(test);
  } catch (e) {
    console.error("❌ Generate test error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🗑️ DELETE DOUBT
// ═══════════════════════════════════════
router.delete("/:id", protect, async (req, res) => {
  try {
    await Doubt.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;