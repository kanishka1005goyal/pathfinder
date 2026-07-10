import { useState, useRef } from "react";
import axios from "axios";

const scoreColor = (s) =>
  s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

const PYTHON_API = import.meta.env.VITE_FASTAPI_URL;

// ── Small reusable badge ─────────────────────────────────────────────────────
function Badge({ label, color = "#6366f1" }) {
  return (
    <span style={{
      display: "inline-block",
      background: color + "22",
      color,
      border: `1px solid ${color}55`,
      borderRadius: 6,
      padding: "2px 10px",
      fontSize: 12,
      marginRight: 6,
      marginBottom: 6,
    }}>{label}</span>
  );
}

// ── Section card wrapper ─────────────────────────────────────────────────────
function Card({ title, icon, children }) {
  return (
    <div style={{
      background: "#1e293b",
      borderRadius: 12,
      padding: "20px 22px",
      border: "1px solid #334155",
      marginBottom: 16,
    }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#e2e8f0", display: "flex", gap: 8, alignItems: "center" }}>
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

export default function ResumeParser() {
  const [file, setFile]       = useState(null);
  const [dragging, setDrag]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null);
  const inputRef              = useRef(null);

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return;
    setError("");
    setResult(null);
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setError("Only PDF, DOC, or DOCX files are supported.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setFile(f);
  };

  const clearFile = (e) => {
    e?.stopPropagation();
    setFile(null);
    setResult(null);
    setError("");
  };

  // ── Submit to backend ────────────────────────────────────────────────────
  const parseResume = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(`${PYTHON_API}/api/parse-resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Parsing failed — make sure the Python backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, fontFamily: "Inter, sans-serif" }}>

      {/* ── Upload card ─────────────────────────────────────────────────── */}
      <div style={{
        background: "#1e293b",
        borderRadius: 14,
        padding: "24px 26px",
        border: "1px solid #334155",
        marginBottom: 22,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🔍 Parse Resume</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
              Algorithmic extraction — no AI, 100% rule-based
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[".pdf", ".doc", ".docx"].map(t => (
              <span key={t} style={{
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: 6, padding: "3px 9px", fontSize: 11, color: "#94a3b8"
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => !file && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${file ? "#22c55e" : dragging ? "#6366f1" : "#334155"}`,
            background: file ? "rgba(34,197,94,0.05)" : dragging ? "rgba(99,102,241,0.08)" : "transparent",
            borderRadius: 10,
            padding: "32px 24px",
            textAlign: "center",
            cursor: file ? "default" : "pointer",
            transition: "all 0.2s",
            marginBottom: 16,
          }}
        >
          {!file ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
              <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 6px" }}>Drop your resume here</p>
              <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 18px" }}>or click to browse</p>
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                Browse File
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px", color: "#22c55e" }}>{file.name}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 14px" }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button onClick={clearFile}
                style={{ background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontSize: 13 }}>
                Change File
              </button>
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={parseResume}
          disabled={!file || loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 9, border: "none",
            background: !file || loading ? "#334155" : "#6366f1",
            color: !file || loading ? "#64748b" : "#fff",
            cursor: !file || loading ? "not-allowed" : "pointer",
            fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
              Parsing resume…
            </>
          ) : "🔍 Parse Resume"}
        </button>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {result && (
        <div>

          {/* Score banner */}
          <div style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "22px 26px",
            border: "1px solid #334155",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: 12 }}>Resume Score</p>
              <p style={{ margin: 0, fontSize: 56, fontWeight: 800, color: scoreColor(result.overallScore), lineHeight: 1 }}>
                {result.overallScore}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>/ 100</p>
            </div>
            <div style={{ flex: 1 }}>
              {Object.entries(result.breakdown || {}).map(([key, val]) => (
                <div key={key} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span style={{ fontWeight: 700, color: scoreColor(val) }}>{val}</span>
                  </div>
                  <div style={{ background: "#0f172a", borderRadius: 99, height: 5 }}>
                    <div style={{ width: `${Math.min(val * 4, 100)}%`, height: "100%", borderRadius: 99, background: scoreColor(val), transition: "width 1s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Name + Contact */}
          {(result.name || result.contact) && (
            <Card title="Contact Information" icon="📧">
              {result.name && (
                <p style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#a5b4fc" }}>{result.name}</p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                {result.contact?.email    && <span>✉️ {result.contact.email}</span>}
                {result.contact?.phone    && <span>📞 {result.contact.phone}</span>}
                {result.contact?.linkedin && <span>🔗 {result.contact.linkedin}</span>}
                {result.contact?.github   && <span>🐙 {result.contact.github}</span>}
              </div>
            </Card>
          )}

          {/* Summary */}
          {result.summary && (
            <Card title="Professional Summary" icon="📝">
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>{result.summary}</p>
            </Card>
          )}

          {/* Skills */}
          {result.skills && Object.keys(result.skills).length > 0 && (
            <Card title="Skills Detected" icon="🛠️">
              {Object.entries(result.skills).map(([cat, kws]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", textTransform: "capitalize", fontWeight: 600 }}>
                    {cat}
                  </p>
                  <div>
                    {kws.map(k => <Badge key={k} label={k} color={cat === "soft" ? "#f59e0b" : cat === "frameworks" ? "#06b6d4" : "#6366f1"} />)}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Experience */}
          {result.experience?.length > 0 && (
            <Card title="Work Experience" icon="💼">
              {result.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < result.experience.length - 1 ? "1px solid #1e293b" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{exp.title || "Role"}</span>
                    {exp.duration && <span style={{ fontSize: 12, color: "#6366f1", background: "#6366f122", borderRadius: 6, padding: "2px 8px" }}>{exp.duration}</span>}
                  </div>
                  {exp.company && <p style={{ margin: "0 0 6px", fontSize: 13, color: "#64748b" }}>{exp.company}</p>}
                  {exp.bullets?.slice(0, 3).map((b, j) => (
                    <p key={j} style={{ margin: "2px 0", fontSize: 12, color: "#94a3b8" }}>• {b}</p>
                  ))}
                </div>
              ))}
            </Card>
          )}

          {/* Education */}
          {result.education?.[0]?.degrees?.length > 0 && (
            <Card title="Education" icon="🎓">
              {result.education.map((ed, i) => (
                <div key={i}>
                  {ed.degrees.map(d => <Badge key={d} label={d} color="#22c55e" />)}
                  {ed.institutions.map((inst, j) => <p key={j} style={{ margin: "4px 0", fontSize: 13, color: "#94a3b8" }}>{inst}</p>)}
                  {ed.gpa && <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0" }}>GPA: {ed.gpa}</p>}
                  {ed.years.map((y, j) => <Badge key={j} label={y} color="#f59e0b" />)}
                </div>
              ))}
            </Card>
          )}

          {/* Projects */}
          {result.projects?.length > 0 && (
            <Card title="Projects" icon="🚀">
              {result.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{p.name}</p>
                  {p.description.slice(0, 2).map((d, j) => (
                    <p key={j} style={{ margin: "2px 0", fontSize: 12, color: "#94a3b8" }}>• {d}</p>
                  ))}
                  <div style={{ marginTop: 6 }}>
                    {p.tech.slice(0, 6).map(t => <Badge key={t} label={t} />)}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Certifications */}
          {result.certifications?.length > 0 && (
            <Card title="Certifications" icon="🏅">
              {result.certifications.map((c, i) => (
                <p key={i} style={{ margin: "3px 0", fontSize: 13, color: "#94a3b8" }}>• {c}</p>
              ))}
            </Card>
          )}

          {/* Strengths + Suggestions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {result.strengths?.length > 0 && (
              <Card title="Strengths" icon="✅">
                {result.strengths.map((s, i) => (
                  <p key={i} style={{ margin: "4px 0", fontSize: 13, color: "#22c55e" }}>✓ {s}</p>
                ))}
              </Card>
            )}
            {result.suggestions?.length > 0 && (
              <Card title="Suggestions" icon="💡">
                {result.suggestions.map((s, i) => (
                  <p key={i} style={{ margin: "4px 0", fontSize: 13, color: "#f59e0b" }}>→ {s}</p>
                ))}
              </Card>
            )}
          </div>

          {/* Meta */}
          <div style={{ marginTop: 8, color: "#475569", fontSize: 12, textAlign: "center" }}>
            Word count: {result.word_count} · Chars: {result.char_count} ·
            Sections found: {result.sections_found?.join(", ")}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}