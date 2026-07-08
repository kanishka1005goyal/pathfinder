import dotenv from "dotenv";
dotenv.config();

import { setServers } from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import skillGapRoutes from "./routes/skillGapRoutes.js";
import { admin, adminRouter } from "./admin.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 PathFinder Backend is Running");
});

// Check Environment Variables
if (!process.env.GROQ_API_KEY) {
  console.error("❌ FATAL: GROQ_API_KEY is missing from .env");
  process.exit(1);
}

console.log(
  "✅ GROQ_API_KEY loaded:",
  process.env.GROQ_API_KEY.slice(0, 7) + "..."
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/skill-gap", skillGapRoutes);

// AdminJS
app.use(admin.options.rootPath, adminRouter);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log("➡️ Chat handled by FastAPI on port 8000");
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });