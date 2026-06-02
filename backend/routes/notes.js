import express from "express";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const notes = await Note.find({ userId: req.user._id }).sort({ pinned: -1, updatedAt: -1 });
  res.json(notes);
});

router.post("/", protect, async (req, res) => {
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.json(note);
});

router.put("/:id", protect, async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  );
  res.json(note);
});

router.delete("/:id", protect, async (req, res) => {
  await Note.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

export default router;