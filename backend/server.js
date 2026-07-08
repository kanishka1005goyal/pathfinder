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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PathFinder Backend is Running 🚀");
});


if (!process.env.GROQ_API_KEY) {

  console.error("❌ FATAL: GROQ_API_KEY is missing from .env");

  process.exit(1);

}

console.log("✅ GROQ_API_KEY loaded:", process.env.GROQ_API_KEY.slice(0, 7) + "...");


// ✅ Auth + resume only — chat is handled by FastAPI on port 8000

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);

app.use('/api/skill-gap', skillGapRoutes);

app.use(admin.options.rootPath, adminRouter);
mongoose.connect(process.env.MONGO_URI)

  .then(() => {

    console.log("✅ MongoDB connected");

    console.log("✅ Express server running on port 5000 (auth + resume)");

    console.log("➡️  Chat handled by FastAPI on port 8000");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

  .catch((err) => console.error("❌ DB connection error:", err));