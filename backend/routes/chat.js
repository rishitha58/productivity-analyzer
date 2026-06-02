import express from "express";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/auth.js";

// 🔵 Gemini (fallback)
import { chatWithAssistant, generateChatTitle } from "../services/aiService.js";

// 🟣 Groq (primary)
import { chatWithGroq, generateChatTitleGroq } from "../services/groqService.js";

const router = express.Router();

// ═══════════════════════════════════════
//   💬 SEND MESSAGE (Groq + Gemini fallback)
// ═══════════════════════════════════════
router.post("/send", protect, async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message required" });
    }

    console.log("💬 Chat message from user:", req.user._id);

    let chat;

    // Build user context
    const userContext = {
      name: req.user.name,
      isStudent: req.user.isStudent,
      goal: req.user.goal,
      currentPhase: req.user.currentPhase,
      studyField: req.user.studyField,
      profession: req.user.profession,
    };

    // Get or create chat
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) return res.status(404).json({ error: "Chat not found" });
    } else {
      // 🆕 New chat - generate title (try Groq first, fallback to Gemini)
      let title;
      try {
        title = await generateChatTitleGroq(message);
      } catch (e) {
        console.log("⚠️ Groq title gen failed, trying Gemini...");
        try {
          title = await generateChatTitle(message);
        } catch (e2) {
          title = message.substring(0, 30) + "...";
        }
      }

      chat = await Chat.create({
        userId: req.user._id,
        title,
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // 🚀 Try Groq first, fallback to Gemini
    let aiResponse;
    let provider = "groq";

    try {
      console.log("🟣 Trying Groq...");
      aiResponse = await chatWithGroq(message, chat.messages, userContext);
    } catch (groqError) {
      console.log("⚠️  Groq failed, falling back to Gemini...");
      console.log("   Reason:", groqError.message?.substring(0, 100));

      try {
        aiResponse = await chatWithAssistant(message, chat.messages, userContext);
        provider = "gemini";
      } catch (geminiError) {
        console.error("❌ Both AI services failed!");
        console.error("   Groq:", groqError.message);
        console.error("   Gemini:", geminiError.message);

        return res.status(503).json({
          error: "AI services are temporarily unavailable. Please try again in a moment! 😔",
        });
      }
    }

    console.log(`✅ Chat response by: ${provider}`);

    // Add AI response
    chat.messages.push({
      role: "ai",
      content: aiResponse,
      timestamp: new Date(),
    });

    chat.updatedAt = new Date();
    await chat.save();

    console.log("✅ Chat saved");

    res.json({
      chatId: chat._id,
      title: chat.title,
      messages: chat.messages,
      aiResponse,
      provider, // ⭐ Optional: tells frontend which AI answered
    });
  } catch (e) {
    console.error("❌ Chat error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   📜 GET ALL CHATS
// ═══════════════════════════════════════
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .limit(50);

    const summaries = chats.map((c) => ({
      _id: c._id,
      title: c.title,
      preview: c.messages[c.messages.length - 1]?.content?.substring(0, 80) || "",
      messageCount: c.messages.length,
      updatedAt: c.updatedAt,
    }));

    res.json(summaries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   📖 GET SINGLE CHAT
// ═══════════════════════════════════════
router.get("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🗑️ DELETE SINGLE CHAT
// ═══════════════════════════════════════
router.delete("/:id", protect, async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🗑️ CLEAR ALL CHATS
// ═══════════════════════════════════════
router.delete("/", protect, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;