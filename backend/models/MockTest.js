import mongoose from "mongoose";

const mockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  source: { type: String, default: "topic" }, // topic | doubts | notes ⭐
  sourceNoteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }], // ⭐ NEW
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
    userAnswer: Number,
    isCorrect: Boolean,
  }],
  score: Number,
  totalQuestions: Number,
  completed: { type: Boolean, default: false },
  takenAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("MockTest", mockTestSchema);