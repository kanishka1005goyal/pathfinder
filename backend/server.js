import dotenv from "dotenv";

dotenv.config();


import express from "express";

import cors from "cors";

import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";

import resumeRoutes from "./routes/resumeRoutes.js";


const app = express();

app.use(cors());

app.use(express.json());


if (!process.env.GROQ_API_KEY) {

  console.error("❌ FATAL: GROQ_API_KEY is missing from .env");

  process.exit(1);

}

console.log("✅ GROQ_API_KEY loaded:", process.env.GROQ_API_KEY.slice(0, 7) + "...");


// ✅ Auth + resume only — chat is handled by FastAPI on port 8000

app.use("/api/auth", authRoutes);

app.use("/api/resume", resumeRoutes);


mongoose.connect(process.env.MONGO_URI)

  .then(() => {

    console.log("✅ MongoDB connected");

    console.log("✅ Express server running on port 5000 (auth + resume)");

    console.log("➡️  Chat handled by FastAPI on port 8000");

    app.listen(5000);

  })

  .catch((err) => console.error("❌ DB connection error:", err));