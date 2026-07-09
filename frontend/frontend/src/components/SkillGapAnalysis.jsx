import { useState } from 'react';
import axios from 'axios';
import LearningPath from './LearningPath';
import InterviewQuestions from './InterviewQuestions';
export default function SkillGapAnalysis({ resumeId }) {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      setError('Please enter a target role');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/skill-gap/analyze`,
        { resumeId, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError('Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="e.g. Backend Developer, Data Analyst"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          style={{
            flex: 1, background: "#1e293b", border: "1px solid #334155",
            borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none"
          }}
        />
        <button onClick={handleAnalyze} disabled={loading}
          style={{
            background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap"
          }}>
          {loading ? 'Analyzing...' : 'Analyze Gap'}
        </button>
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 20 }}>Match: {result.matchPercentage}%</h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>{result.summary}</p>
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#22c55e" }}>✅ Matched Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.matchedSkills.map((s, i) => (
                <span key={i} style={{
                  background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid #22c55e",
                  borderRadius: 6, padding: "4px 10px", fontSize: 12
                }}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#ef4444" }}>❌ Missing Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.missingSkills.map((s, i) => (
                <span key={i} style={{
                  background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid #ef4444",
                  borderRadius: 6, padding: "4px 10px", fontSize: 12
                }}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>📚 Recommendations</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{
                  background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: 12
                }}>
                  <strong style={{ fontSize: 13 }}>{r.skill}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{r.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {result.missingSkills && result.missingSkills.length > 0 && (
            <LearningPath missingSkills={result.missingSkills} />
          )}
          {result.missingSkills && result.missingSkills.length > 0 && (
  <LearningPath missingSkills={result.missingSkills} />
)}

<InterviewQuestions resumeId={resumeId} targetRole={targetRole} />
        </div>
      )}
    </div>
  );
}