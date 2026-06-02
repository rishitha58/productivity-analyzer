import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  taskId: String, // The study task that triggered this doubt
  taskTitle: String, // For context
  topic: String, // Detected topic (e.g., "Binary Search")
  
  question: { type: String, required: true },
  answer: String, // AI's answer
  
  // For mock test generation later
  usedInMockTest: { type: Boolean, default: false },
  
  // Difficulty for adaptive testing
  difficulty: { type: String, default: "medium" }, // easy, medium, hard
  
  createdAt: { type: Date, default: Date.now },
});

doubtSchema.index({ userId: 1, topic: 1 });

export default mongoose.model("Doubt", doubtSchema);