import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// All routes
import authRoutes from "./routes/auth.js";
import journalRoutes from "./routes/journal.js";
import aiRoutes from "./routes/ai.js";
import notesRoutes from "./routes/notes.js";
import testsRoutes from "./routes/tests.js";
import doubtsRoutes from "./routes/doubts.js";
import chatRoutes from "./routes/chat.js";
import notificationRoutes from "./routes/notifications.js";
import travelRoutes from "./routes/travel.js";  // 🆕 IMPORTANT

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

connectDB();

// Health check
app.get("/", (req, res) => res.json({ message: "🚀 API Running!" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/tests", testsRoutes);
app.use("/api/doubts", doubtsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/travel", travelRoutes);  

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});