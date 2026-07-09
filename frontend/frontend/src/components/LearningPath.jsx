import { useState } from 'react';
import axios from 'axios';

export default function LearningPath({ missingSkills }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const fetchLearningPath = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/skill-gap/learning-path`, {
        missingSkills
      });
      setPlan(res.data.learningPlan);
    } catch (err) {
      setError('Could not load learning path. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {!plan && (
        <button onClick={fetchLearningPath} disabled={loading}
          style={{
            background: "#22c55e", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14
          }}>
          {loading ? 'Generating plan...' : '📚 Get Learning Path'}
        </button>
      )}

      {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

      {plan && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {plan.map((item, i) => (
            <div key={i} style={{
              background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 16
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 14 }}>{item.skill}</strong>
                <span style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  background: "#334155", color: "#94a3b8"
                }}>
                  {item.difficulty} · ~{item.estimatedWeeks}w
                </span>
              </div>

              <ul style={{ margin: "8px 0", paddingLeft: 18, fontSize: 12, color: "#94a3b8" }}>
                {item.topics.map((t, j) => <li key={j}>{t}</li>)}
              </ul>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <a href={item.resources.youtube} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#ef4444" }}>▶ YouTube</a>
                <a href={item.resources.coursera} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#6366f1" }}>🎓 Coursera</a>
                <a href={item.resources.freeCodeCamp} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#22c55e" }}>💻 freeCodeCamp</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}