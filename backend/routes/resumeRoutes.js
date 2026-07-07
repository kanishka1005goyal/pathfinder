import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Groq from "groq-sdk";
import mammoth from "mammoth";
import authMiddleware from "../middleware/authMiddleware.js";
import Resume from "../models/Resume.js";

const router = express.Router();

console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "YES" : "MISSING");

// ── Multer ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and DOCX files allowed"));
  },
});

// ── Groq analysis (single, top-level function) ──
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

Return ONLY valid JSON, no extra text, no markdown fences, no explanation.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(raw);
  } catch (parseErr) {
    console.error("Groq raw output that failed to parse:\n", raw);
    throw new Error("Groq returned malformed JSON. Please retry.");
  }
}

// ── POST /api/resume/upload ──
router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  try {
    let resumeText = "";
    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      resumeText = parsed.text;
    } else {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(422).json({ message: "Could not extract text. Please upload a text-based PDF or DOCX resume." });
    }

    const lowerText = resumeText.toLowerCase();
    if (!lowerText.includes("skills") && !lowerText.includes("education") && !lowerText.includes("experience") && !lowerText.includes("projects")) {
      return res.status(400).json({ message: "Uploaded file does not appear to be a resume." });
    }

    const atsResult = await analyzeWithGroq(resumeText);   // ← ye line hi missing thi

    const resume = await Resume.create({
      user: req.userId,
      filename: req.file.originalname,
      parsedText: resumeText,
      atsScore: atsResult.overallScore,
      breakdown: atsResult.breakdown,
      missingSkills: atsResult.missingSkills,
      suggestions: atsResult.suggestions,
      strengths: atsResult.strengths,
    });

    res.json({ success: true, resumeId: resume._id, filename: req.file.originalname, atsResult });
  } catch (err) {
    console.error("Upload error:", err.message);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ message: "Groq returned malformed JSON. Please retry." });
    }
    res.status(500).json({ message: err.message || "Internal server error." });
  }
});

// ── GET /api/resume/history — only this user's resumes ──
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId })
      .sort({ uploadedAt: -1 })
      .select("filename atsScore uploadedAt breakdown");
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal server error." });
  }
});

// ── GET /api/resume/report/:id ──
router.get("/report/:id", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal server error." });
  }
});

export default router;