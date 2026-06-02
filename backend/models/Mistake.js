import mongoose from "mongoose";

const mistakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest" },
  topic: String,
  question: String,
  userAnswer: String,
  correctAnswer: String,
  explanation: String,
  reviewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Mistake", mistakeSchema);