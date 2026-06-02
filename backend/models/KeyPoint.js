import mongoose from "mongoose";

const keyPointSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  points: [String],
  source: { type: String, default: "ai" }, // ai, pdf, manual
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("KeyPoint", keyPointSchema);