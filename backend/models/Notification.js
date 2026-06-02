import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["task", "sleep", "wakeup", "undone", "achievement", "reminder", "info"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  emoji: { type: String, default: "🔔" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  
  // Optional links
  actionUrl: String, // Where to go when clicked
  actionLabel: String, // Button text
  
  // Related data
  taskId: String,
  
  // Status
  read: { type: Boolean, default: false },
  shown: { type: Boolean, default: false }, // Browser notification shown
  
  // Scheduling
  scheduledFor: Date, // When to trigger
  triggered: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);