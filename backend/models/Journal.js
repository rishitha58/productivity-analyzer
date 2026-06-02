import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  rawText: String,
  motivation: String,
  tasks: [{
    title: String,
    priority: String,
    category: String,
    time: String,
    location: String,
    estimatedDuration: String,
    goalAligned: Boolean,
    goalContribution: String,
    done: { type: Boolean, default: false },
    completedAt: Date,
    skipped: { type: Boolean, default: false },        // ⭐ NEW
    skippedAt: Date,                                    // ⭐ NEW
    completedLate: { type: Boolean, default: false },  // ⭐ NEW (marked done after original date)
    carriedForward: { type: Boolean, default: false }, // ⭐ NEW
  }],
  createdAt: { type: Date, default: Date.now },
});

journalSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Journal", journalSchema);