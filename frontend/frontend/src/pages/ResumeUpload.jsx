import { useState, useRef } from "react";

const ATS_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and career coach with deep knowledge of how ATS systems parse and score resumes.

Analyze this resume thoroughly and return ONLY a valid JSON object (no markdown, no preamble) with this exact structure:

{
  "overallScore": <integer 0-100>,
  "breakdown": {
    "formatting": <integer 0-100>,
    "keywords": <integer 0-100>,
    "workExperience": <integer 0-100>,
    "education": <integer 0-100>,
    "skills": <integer 0-100>,
    "readability": <integer 0-100>
  },
  "strengths": [<3-5 specific strengths as strings>],
  "missingSkills": [<3-5 specific missing or weak areas as strings>],
  "suggestions": [<4-6 specific, actionable improvement suggestions as strings>],
  "jobTitleMatch": "<the most likely job title this resume targets>",
  "experienceLevel": "<Junior | Mid-level | Senior | Lead | Executive>"
}

Scoring rubric:
- formatting: ATS-parseable layout, no tables/columns/graphics, proper section headers, consistent date formats
- keywords: industry-relevant keywords, action verbs, role-specific terminology, measurable achievements
- workExperience: clarity of responsibilities, quantified impact (numbers/%), career progression, relevance
- education: degree relevance, certifications, continuous learning indicators
- skills: technical skills listed, soft skills implied, tools and technologies
- readability: clear language, no jargon overload, concise descriptions, professional tone

Be precise and realistic — do not inflate scores. A score of 70+ means ATS-ready. Under 50 means major issues.`;

async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

function scoreColor(s) {
  if (s >= 75) return "#1D9E75";
  if (s >= 50) return "#BA7517";
  return "#E24B4A";
}

const BREAKDOWN_LABELS = {
  formatting: "Formatting",
  keywords: "Keywords",
  workExperience: "Work Experience",
  education: "Education",
  skills: "Skills",
  readability: "Readability",
};

export default function ATSAnalyzer() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const ALLOWED = [".pdf", ".doc", ".docx"];
  const MAX_SIZE = 5 * 1024 * 1024;

  const handleFile = (f) => {
    if (!f) return;
    setError("");
    setAtsResult(null);
    setProgress(0);
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      setError("Only PDF, DOC, or DOCX files are allowed.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File exceeds 5MB limit.");
      return;
    }
    setFile(f);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError("");
    setAtsResult(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const startAnalysis = async () => {
    if (!file || analyzing) return;
    setAnalyzing(true);
    setError("");
    setAtsResult(null);

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isPdf = ext === ".pdf";

    try {
      setProgress(20);
      setProgressLabel("Reading file...");

      const base64Data = await fileToBase64(file);

      setProgress(45);
      setProgressLabel("Sending to Claude for analysis...");

      const messages = isPdf
        ? [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64Data,
                  },
                },
                { type: "text", text: ATS_PROMPT },
              ],
            },
          ]
        : [
            {
              role: "user",
              content: `${ATS_PROMPT}\n\n[Note: The file "${file.name}" is a Word document. Unfortunately .doc/.docx binary cannot be parsed directly. Please inform the user to convert to PDF for accurate analysis, and return a JSON with a message field explaining this instead of scores.]`,
            },
          ];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages,
        }),
      });

      setProgress(80);
      setProgressLabel("Processing results...");

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API error");

      const raw = data.content.map((i) => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse analysis response.");
      const result = JSON.parse(jsonMatch[0]);

      if (result.message) {
        setError(result.message);
        setAnalyzing(false);
        return;
      }

      setProgress(100);
      setProgressLabel("Done!");
      setTimeout(() => setProgress(0), 800);
      setAtsResult(result);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const s = {
    card: {
      background: "#1e293b",
      borderRadius: 12,
      padding: 28,
      border: "1px solid #334155",
      maxWidth: 520,
      fontFamily: "Inter, sans-serif",
      color: "#e2e8f0",
    },
    fmtTag: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 6,
      padding: "3px 10px",
      fontSize: 12,
      color: "#94a3b8",
    },
    dropZone: {
      border: `2px dashed ${
        file ? "#1D9E75" : dragging ? "#534AB7" : "#334155"
      }`,
      background: file
        ? "rgba(29,158,117,0.05)"
        : dragging
        ? "rgba(83,74,183,0.07)"
        : "transparent",
      borderRadius: 12,
      padding: "40px 24px",
      textAlign: "center",
      transition: "all 0.2s",
      cursor: "pointer",
      userSelect: "none",
    },
    browseBtn: {
      background: "transparent",
      color: "#94a3b8",
      border: "1px solid #334155",
      borderRadius: 8,
      padding: "8px 18px",
      cursor: "pointer",
      fontSize: 13,
    },
    analyzeBtn: {
      width: "100%",
      marginTop: 20,
      background: !file || analyzing ? "#334155" : "#534AB7",
      color: !file || analyzing ? "#64748b" : "#fff",
      border: "none",
      borderRadius: 8,
      padding: 13,
      cursor: !file || analyzing ? "not-allowed" : "pointer",
      fontWeight: 600,
      fontSize: 15,
      transition: "background 0.2s",
    },
  };

  return (
    <div style={s.card}>
      {/* Format tags */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 6 }}>
        {[".pdf", ".doc", ".docx"].map((fmt) => (
          <span key={fmt} style={s.fmtTag}>{fmt}</span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569" }}>Max 5MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Drop Zone */}
      <div
        style={s.dropZone}
        onClick={() => { if (inputRef.current) { inputRef.current.value = ""; inputRef.current.click(); }}}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
      >
        {!file ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📄</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              Drop your resume here
            </p>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
              PDF recommended for best accuracy
            </p>
            <button style={s.browseBtn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse File
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{file.name}</p>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button style={s.browseBtn} onClick={clearFile}>Change file</button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10 }}>{error}</p>
      )}

      {/* Progress */}
      {analyzing && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
            <span>{progressLabel}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 99, background: "#534AB7", transition: "width 0.4s ease" }} />
          </div>
        </div>
      )}

      {/* ATS Result */}
      {atsResult && (
        <div style={{ marginTop: 20, background: "#0f172a", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
          {/* Overall score */}
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 4, fontSize: 13 }}>ATS Score</p>
          <p style={{ textAlign: "center", fontSize: 60, fontWeight: 800, margin: 0, color: scoreColor(atsResult.overallScore) }}>
            {atsResult.overallScore}
          </p>
          <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 2 }}>out of 100</p>

          {/* Target role & level */}
          {atsResult.jobTitleMatch && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              Target: <strong style={{ color: "#e2e8f0" }}>{atsResult.jobTitleMatch}</strong>
              {atsResult.experienceLevel && <> &middot; {atsResult.experienceLevel}</>}
            </p>
          )}

          {/* Breakdown */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(atsResult.breakdown).map(([key, val]) => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>{BREAKDOWN_LABELS[key] || key}</span>
                  <span style={{ fontWeight: 700, color: scoreColor(val) }}>{val}%</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 99, height: 6 }}>
                  <div style={{ width: `${val}%`, height: "100%", borderRadius: 99, background: scoreColor(val), transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {atsResult.strengths?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: "#1D9E75", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>✅ Strengths</p>
              {atsResult.strengths.map((item, i) => (
                <p key={i} style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0" }}>• {item}</p>
              ))}
            </div>
          )}

          {/* Missing / Weak areas */}
          {atsResult.missingSkills?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: "#E24B4A", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>❌ Areas to Improve</p>
              {atsResult.missingSkills.map((item, i) => (
                <p key={i} style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0" }}>• {item}</p>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {atsResult.suggestions?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: "#BA7517", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>💡 Suggestions</p>
              {atsResult.suggestions.map((item, i) => (
                <p key={i} style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0" }}>• {item}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analyze button */}
      <button style={s.analyzeBtn} onClick={startAnalysis} disabled={!file || analyzing}>
        {analyzing ? `Analyzing... ${progress}%` : "Upload & Analyze"}
      </button>
    </div>
  );
}