import { useState, useRef } from "react";
import axios from "axios";

export default function UploadTab() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const inputRef = useRef(null);

  const ALLOWED = [".pdf", ".doc", ".docx"];
  const MAX_SIZE = 5 * 1024 * 1024;

  const handleFile = (f) => {
    if (!f) return;
    setError("");
    setSuccess(false);
    setProgress(0);
    setAtsResult(null);
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

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError("");
    setSuccess(false);
    setProgress(0);
    setAtsResult(null);
  };

  const startUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setSuccess(false);
    setProgress(0);
    setAtsResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token");   // ← ye line add karo

      const res = await axios.post("http://localhost:5000/api/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,           // ← ye line add karo
        },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / e.total)),
      });

      setProgress(100);
      setUploading(false);
      setSuccess(true);
      setAtsResult(res.data.atsResult);
      setResumeId(res.data.resumeId);
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || "Upload failed.");
    }
  };

  const scoreColor = (s) =>
    s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  const s = {
    card: {
      background: "#1e293b", borderRadius: 12, padding: 28,
      border: "1px solid #334155", maxWidth: 500,
      fontFamily: "Inter, sans-serif", color: "#e2e8f0",
    },
    dropZone: {
      border: `2px dashed ${file ? "#22c55e" : dragging ? "#6366f1" : "#334155"}`,
      background: file ? "rgba(34,197,94,0.05)" : dragging ? "rgba(99,102,241,0.08)" : "transparent",
      borderRadius: 12, padding: "40px 24px", textAlign: "center",
      transition: "all 0.2s", cursor: "pointer", userSelect: "none",
    },
    btn: {
      background: "#6366f1", color: "#fff", border: "none",
      borderRadius: 8, padding: "10px 22px", cursor: "pointer",
      fontWeight: 600, fontSize: 14,
    },
    btnOutline: {
      background: "transparent", color: "#94a3b8", border: "1px solid #334155",
      borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13,
    },
    uploadBtn: {
      width: "100%", marginTop: 20,
      background: !file || uploading ? "#334155" : "#6366f1",
      color: !file || uploading ? "#64748b" : "#fff",
      border: "none", borderRadius: 8, padding: 13,
      cursor: !file || uploading ? "not-allowed" : "pointer",
      fontWeight: 600, fontSize: 15,
    },
  };

  return (
    <div style={s.card}>
      {/* Format tags */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 6 }}>
        {[".pdf", ".doc", ".docx"].map((f) => (
          <span key={f} style={{
            background: "#0f172a", border: "1px solid #334155",
            borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#94a3b8",
          }}>{f}</span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569" }}>Max 5MB</span>
      </div>

      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      {/* Drop Zone */}
      <div style={s.dropZone} onClick={openPicker}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
      >
        {!file ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📄</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Drop your resume here</p>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>or click the button below to browse</p>
            <button style={s.btn} onClick={(e) => { e.stopPropagation(); openPicker(); }}>Browse File</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{file.name}</p>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>{(file.size / 1024).toFixed(1)} KB</p>
            <button style={s.btnOutline} onClick={clearFile}>Change file</button>
          </>
        )}
      </div>

      {/* Error */}
      {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10 }}>{error}</p>}

      {/* Progress */}
      {uploading && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
            <span>Uploading...</span><span>{progress}%</span>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 99, background: "#6366f1", transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={{
          marginTop: 20, background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8,
          padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <p style={{ fontWeight: 600, color: "#22c55e", fontSize: 14 }}>Resume uploaded successfully!</p>
            <p style={{ fontSize: 12, color: "#16a34a", marginTop: 3 }}>ATS analysis complete</p>
          </div>
        </div>
      )}

      {/* ATS Result */}
      {atsResult && (
        <div style={{ marginTop: 20, background: "#0f172a", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 4, fontSize: 13 }}>ATS Score</p>
          <p style={{ textAlign: "center", fontSize: 52, fontWeight: 800, margin: 0, color: scoreColor(atsResult.overallScore) }}>
            {atsResult.overallScore}
          </p>
          <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 2 }}>out of 100</p>

          {/* Breakdown */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(atsResult.breakdown).map(([key, val]) => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span style={{ fontWeight: 700, color: scoreColor(val) }}>{val}%</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 99, height: 6 }}>
                  <div style={{ width: `${val}%`, height: "100%", borderRadius: 99, background: scoreColor(val), transition: "width 1s" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {atsResult.strengths?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: "#22c55e", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>✅ Strengths</p>
              {atsResult.strengths.map((s, i) => (
                <p key={i} style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0" }}>• {s}</p>
              ))}
            </div>
          )}

          {/* Missing Skills */}
          {atsResult.missingSkills?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>❌ Missing Skills</p>
              {atsResult.missingSkills.map((s, i) => (
                <p key={i} style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0" }}>• {s}</p>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {atsResult.suggestions?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: "#f59e0b", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>💡 Suggestions</p>
              {atsResult.suggestions.map((s, i) => (
                <p key={i} style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0" }}>• {s}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <button style={s.uploadBtn} onClick={startUpload} disabled={!file || uploading}>
        {uploading ? `Uploading... ${progress}%` : "Upload & Analyze"}
      </button>
    </div>
  );
}