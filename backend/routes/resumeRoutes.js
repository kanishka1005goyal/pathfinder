import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

const router = express.Router();

console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "YES" : "MISSING");

// ── Resume Schema ──────────────────────────────────────────────────────────
const Resume = mongoose.model(
  "Resume",
  new mongoose.Schema({
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
  })
);

// ── Multer ─────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
 fileFilter: (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files allowed"));
  }
},
});

// ── Groq analysis ──────────────────────────────────────────────────────────
async function analyzeWithGroq(resumeText) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
${resumeText.slice(0, 6000)}

Return ONLY valid JSON, no extra text, no markdown fences.
`;

  const completion = await groq.chat.completions.create({
   model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const raw = completion.choices[0].message.content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(raw);
}

// ── POST /api/resume/upload ────────────────────────────────────────────────
router.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
let resumeText = "";

// PDF parsing
if (req.file.mimetype === "application/pdf") {
  const parsed = await pdfParse(req.file.buffer);

  console.log("========== PDF DEBUG ==========");
  console.log("File:", req.file.originalname);
  console.log("Pages:", parsed.numpages);
  console.log("Text Length:", parsed.text.length);
  console.log("===============================");

  resumeText = parsed.text;
}

// DOCX parsing
else if (
  req.file.mimetype ===
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
) {
  const result = await mammoth.extractRawText({
    buffer: req.file.buffer,
  });

  resumeText = result.value;
}

  if (!resumeText || resumeText.trim().length < 100) {
  return res.status(422).json({
    message:
      "This PDF appears to be image-based or scanned. Please upload a text-based PDF or DOCX resume.",
  });
}
 const lowerText = resumeText.toLowerCase();

if (
  !lowerText.includes("skills") &&
  !lowerText.includes("education") &&
  !lowerText.includes("experience") &&
  !lowerText.includes("projects")
) {
  return res.status(400).json({
    message: "Uploaded file does not appear to be a resume.",
  });
}
    const atsResult = await analyzeWithGroq(resumeText);

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
    console.error("Upload error:", err);

    if (err instanceof SyntaxError) {
      return res.status(502).json({ message: "AI returned malformed JSON. Please retry." });
    }

    res.status(500).json({ message: err.message || "Internal server error." });
  }
 
});

// ── GET /api/resume/report/:id ─────────────────────────────────────────────
router.get("/report/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    res.json(resume);
  } catch (err) {
    console.error("Report fetch error:", err);
    res.status(500).json({ message: err.message || "Internal server error." });
  }
});

export default router;