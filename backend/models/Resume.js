import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
});

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
export default Resume;