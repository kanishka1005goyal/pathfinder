require("dotenv").config();
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Resume Schema ──
const Resume = mongoose.model("Resume", new mongoose.Schema({
  filename: String,
  parsedText: String,
  atsScore: Number,
  breakdown: {
    keywordMatch: Number,
    formatting: Number,
    skillsRelevance: Number,
    experienceMatch: Number,
  },
  missingSkills: [String],
  suggestions: [String],
  strengths: [String],
  uploadedAt: { type: Date, default: Date.now },
}));

// ── Multer (memory storage) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});

// ── POST /api/resume/upload ──
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    // 1. Parse PDF
    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed.text;

    // 2. OpenAI ATS analysis
    const prompt = `
You are an ATS (Applicant Tracking System) analyzer. Analyze the following resume and return a JSON object with this exact structure:

{
  "overallScore": <number 0-100>,
  "breakdown": {
    "keywordMatch": <number 0-100>,
    "formatting": <number 0-100>,
    "skillsRelevance": <number 0-100>,
    "experienceMatch": <number 0-100>
  },
  "missingSkills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "strengths": ["strength1", "strength2"]
}

Resume:
${resumeText}

Return ONLY valid JSON, no extra text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    // 3. Sanitize + parse JSON
    const raw = completion.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const atsResult = JSON.parse(raw);

    // 4. Save to MongoDB
    const resume = await Resume.create({
      filename: req.file.originalname,
      parsedText: resumeText,
      atsScore: atsResult.overallScore,
      breakdown: atsResult.breakdown,
      missingSkills: atsResult.missingSkills,
      suggestions: atsResult.suggestions,
      strengths: atsResult.strengths,
    });

    res.json({
      success: true,
      resumeId: resume._id,
      filename: req.file.originalname,
      atsResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/resume/report/:id ──
router.get("/report/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/resume/history ──
router.get("/history", async (req, res) => {
  try {
    const resumes = await Resume.find()
      .sort({ uploadedAt: -1 })
      .select("filename atsScore uploadedAt");
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;