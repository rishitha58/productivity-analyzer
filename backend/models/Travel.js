import mongoose from "mongoose";

const travelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  taskId: String,
  taskTitle: String,
  destination: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  meetingTime: String,
  meetingDate: { type: String, required: true },
  travelDurationMins: Number,
  leaveByTime: String,
  distanceKm: Number,
  mode: { type: String, enum: ["driving", "walking", "cycling"], default: "driving" },
  notified: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

travelSchema.index({ userId: 1, meetingDate: 1 });

export default mongoose.model("Travel", travelSchema);