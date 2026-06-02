import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isStudent: { type: Boolean, default: false },
  studyField: { type: String, default: null },
  profession: { type: String, default: null },
  hasGoal: { type: Boolean, default: false },
  goal: { type: String, default: null },
  duration: { type: String, default: null },
  goalRoadmap: { type: mongoose.Schema.Types.Mixed, default: null },
  currentPhase: { type: String, default: null },
  sleepSchedule: {
    sleepTime: { type: String, default: null },
    wakeTime: { type: String, default: null },
    hours: { type: String, default: null },
  },
  streak: { type: Number, default: 1 },
  lastJournalDate: { type: String, default: null },
  totalJournalsWritten: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  notificationSettings: {
  taskReminders: { type: Boolean, default: true },
  sleepReminders: { type: Boolean, default: true },
  wakeUpGreeting: { type: Boolean, default: true },
  undoneAlerts: { type: Boolean, default: true },
  achievements: { type: Boolean, default: true },
  browserNotifications: { type: Boolean, default: true },
  reminderMinutes: { type: Number, default: 10 }, // Notify X mins before task
},
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);