import axios from 'axios';
import { useState } from 'react';

const scoreColor = (s) => (s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444");

export default function ResumeCompare({ history }) {
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [resumeA, setResumeA] = useState(null);
  const [resumeB, setResumeB] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBoth = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token'); // ya jo bhi key use karti ho token store karne ke liye

    const [resA, resB] = await Promise.all([
      axios.get(`http://localhost:5000/api/resume/report/${idA}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`http://localhost:5000/api/resume/report/${idB}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ]);
    setResumeA(resA.data);
    setResumeB(resB.data);
  } catch (err) {
    console.error('Compare fetch error:', err);
  } finally {
    setLoading(false);
  }
};

  const renderBreakdownRow = (label, keyName) => {
    const a = resumeA?.breakdown?.[keyName] ?? 0;
    const b = resumeB?.breakdown?.[keyName] ?? 0;
    const winner = a > b ? 'A' : b > a ? 'B' : null;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          width: 40, textAlign: "right", fontSize: 13, fontWeight: 700,
          color: winner === 'A' ? "#22c55e" : "#94a3b8"
        }}>{a}%</span>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>{label}</div>
        <span style={{
          width: 40, textAlign: "left", fontSize: 13, fontWeight: 700,
          color: winner === 'B' ? "#22c55e" : "#94a3b8"
        }}>{b}%</span>
      </div>
    );
  };

  const canCompare = idA && idB && idA !== idB;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select value={idA} onChange={(e) => setIdA(e.target.value)}
          style={{
            flex: 1, background: "#1e293b", border: "1px solid #334155",
            borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13
          }}>
          <option value="">-- Resume A --</option>
          {history.map(h => <option key={h._id} value={h._id}>{h.filename}</option>)}
        </select>

        <select value={idB} onChange={(e) => setIdB(e.target.value)}
          style={{
            flex: 1, background: "#1e293b", border: "1px solid #334155",
            borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13
          }}>
          <option value="">-- Resume B --</option>
          {history.map(h => <option key={h._id} value={h._id}>{h.filename}</option>)}
        </select>
      </div>

      <button
        onClick={fetchBoth}
        disabled={!canCompare || loading}
        style={{
          width: "100%", marginBottom: 20, padding: "12px 20px",
          background: canCompare ? "linear-gradient(90deg, #a855f7, #ec4899)" : "#334155",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 700,
          cursor: canCompare && !loading ? "pointer" : "not-allowed",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.2s ease"
        }}
      >
        {loading ? "Comparing..." : "Compare Resumes"}
      </button>

      {idA && idB && idA === idB && (
        <p style={{ color: "#f59e0b", fontSize: 13 }}>Please select two different resumes.</p>
      )}

      {resumeA && resumeB && idA !== idB && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Overall Score */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16
          }}>
            {[resumeA, resumeB].map((r, i) => (
              <div key={i} style={{
                background: "#1e293b", borderRadius: 12, padding: 20,
                border: "1px solid #334155", textAlign: "center"
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b" }}>{r.filename}</p>
                <p style={{ margin: 0, fontSize: 42, fontWeight: 800, color: scoreColor(r.atsScore) }}>
                  {r.atsScore}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>ATS Score</p>
              </div>
            ))}
          </div>

          {/* Breakdown comparison */}
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
            <h4 style={{ margin: "0 0 14px", fontSize: 14, textAlign: "center" }}>Score Breakdown</h4>
            {renderBreakdownRow("Keyword Match", "keywordMatch")}
            {renderBreakdownRow("Formatting", "formatting")}
            {renderBreakdownRow("Skills Relevance", "skillsRelevance")}
            {renderBreakdownRow("Experience Match", "experienceMatch")}
          </div>

          {/* Strengths side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[resumeA, resumeB].map((r, i) => (
              <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
                <h5 style={{ margin: "0 0 8px", fontSize: 13, color: "#22c55e" }}>✅ Strengths</h5>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#94a3b8" }}>
                  {(r.strengths || []).map((s, j) => <li key={j}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Missing skills side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[resumeA, resumeB].map((r, i) => (
              <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
                <h5 style={{ margin: "0 0 8px", fontSize: 13, color: "#ef4444" }}>❌ Missing Skills</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(r.missingSkills || []).map((s, j) => (
                    <span key={j} style={{
                      background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid #ef4444",
                      borderRadius: 6, padding: "3px 8px", fontSize: 11
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div style={{
            background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
            padding: 14, textAlign: "center", fontSize: 13
          }}>
            {resumeA.atsScore === resumeB.atsScore ? (
              <span style={{ color: "#94a3b8" }}>Both resumes score equally.</span>
            ) : (
              <span style={{ color: "#22c55e" }}>
                🏆 <strong>{resumeA.atsScore > resumeB.atsScore ? resumeA.filename : resumeB.filename}</strong> scores higher overall
                ({Math.max(resumeA.atsScore, resumeB.atsScore)} vs {Math.min(resumeA.atsScore, resumeB.atsScore)})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}