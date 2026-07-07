import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function MockInterview({ resumeId, targetRole }) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/skill-gap/mock-interview', {
        resumeId, targetRole, conversationHistory: []
      });
      setMessages([{ role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([{ role: 'assistant', content: 'Sorry, could not start the interview. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    const text = input.trim();
    if (!text) return;

    const updated = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/skill-gap/mock-interview', {
        resumeId, targetRole, conversationHistory: updated
      });
      setMessages([...updated, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([...updated, { role: 'assistant', content: 'Something went wrong, try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendAnswer();
  };

  if (!started) {
    return (
      <button onClick={startInterview} disabled={!targetRole}
        style={{
          background: "#ef4444", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14,
          opacity: !targetRole ? 0.5 : 1, marginTop: 16
        }}>
        🎙️ Start Mock Interview
      </button>
    );
  }

  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
      marginTop: 16, display: "flex", flexDirection: "column", height: 380
    }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #334155", fontSize: 13, fontWeight: 600 }}>
        🎙️ Mock Interview — {targetRole}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#6366f1" : "#0f172a",
            color: m.role === "user" ? "#fff" : "#e2e8f0",
            border: m.role === "user" ? "none" : "1px solid #334155",
            borderRadius: 10, padding: "8px 12px", fontSize: 13, maxWidth: "85%"
          }}>
            {m.content}
          </div>
        ))}
        {loading && <p style={{ color: "#64748b", fontSize: 12 }}>Interviewer is typing...</p>}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #334155" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          disabled={loading}
          style={{
            flex: 1, background: "#0f172a", border: "1px solid #334155",
            borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, outline: "none"
          }}
        />
        <button onClick={sendAnswer} disabled={loading}
          style={{
            background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13
          }}>Send</button>
      </div>
    </div>
  );
}