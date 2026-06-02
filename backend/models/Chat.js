import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: { type: String, default: "New Chat" },
  messages: [{
    role: { type: String, enum: ["user", "ai"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);