import { useState } from 'react';
import axios from 'axios';

export default function InterviewQuestions({ resumeId, targetRole }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [revealedHints, setRevealedHints] = useState({});

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/skill-gap/interview-questions`, {
        resumeId,
        targetRole
      });
      setData(res.data);
    } catch (err) {
      setError('Could not generate questions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleHint = (key) => {
    setRevealedHints(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSection = (title, questions, colorAccent, prefix) => (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: 14, color: colorAccent }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {questions.map((q, i) => {
          const key = `${prefix}-${i}`;
          return (
            <div key={key} style={{
              background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: 12
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{i + 1}. {q.question}</p>
              <button onClick={() => toggleHint(key)}
                style={{
                  background: "none", border: "none", color: "#6366f1", fontSize: 11,
                  cursor: "pointer", padding: "6px 0 0", textDecoration: "underline"
                }}>
                {revealedHints[key] ? "Hide hint" : "Show hint"}
              </button>
              {revealedHints[key] && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                  💡 {q.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 16 }}>
      {!data && (
        <button onClick={fetchQuestions} disabled={loading || !targetRole}
          style={{
            background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14,
            opacity: !targetRole ? 0.5 : 1
          }}>
          {loading ? 'Generating questions...' : '🎤 Generate Interview Questions'}
        </button>
      )}

      {!targetRole && !data && (
        <p style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
          Enter a target role above first.
        </p>
      )}

      {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 12 }}>
          {renderSection("💻 Technical", data.technical, "#6366f1", "tech")}
          {renderSection("🧠 Behavioral", data.behavioral, "#22c55e", "behav")}
          {renderSection("📄 Resume-Specific", data.resumeSpecific, "#f59e0b", "resume")}
        </div>
      )}
    </div>
  );
}