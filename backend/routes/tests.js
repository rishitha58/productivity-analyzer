import express from "express";
import MockTest from "../models/MockTest.js";
import Mistake from "../models/Mistake.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const tests = await MockTest.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(tests);
});

router.post("/:id/submit", protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await MockTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: "Test not found" });

    let score = 0;
    for (let i = 0; i < test.questions.length; i++) {
      const q = test.questions[i];
      const userAnswer = answers[i];
      q.userAnswer = userAnswer;
      q.isCorrect = userAnswer === q.correctIndex;
      if (q.isCorrect) score++;
      else {
        await Mistake.create({
          userId: req.user._id,
          testId: test._id,
          topic: test.topic,
          question: q.question,
          userAnswer: q.options[userAnswer],
          correctAnswer: q.options[q.correctIndex],
          explanation: q.explanation,
        });
      }
    }

    test.score = score;
    test.completed = true;
    test.takenAt = new Date();
    await test.save();

    res.json(test);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/mistakes/all", protect, async (req, res) => {
  const mistakes = await Mistake.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(mistakes);
});

export default router;