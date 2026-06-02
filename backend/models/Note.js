import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: String,
  category: { type: String, default: "personal" },
  color: { type: String, default: "lavender" },
  tags: [String],
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Note", noteSchema);