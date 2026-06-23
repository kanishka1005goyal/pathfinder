import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadTab from "./UploadTab";
 import axios from "axios";
const mockUser = { name: "Test User", email: "test@test.com" };
 
const mockHistory = [
  { id: 1, filename: "resume_v2.pdf", date: "2025-06-10", score: 82 },
  { id: 2, filename: "resume_v1.pdf", date: "2025-06-05", score: 67 },
  { id: 3, filename: "old_resume.pdf", date: "2025-05-28", score: 54 },
];
 
const mockActivity = [
  { id: 1, action: "Uploaded resume_v2.pdf", date: "2025-06-10" },
  { id: 2, action: "ATS Report generated — Score: 82", date: "2025-06-10" },
  { id: 3, action: "Chatbot session started", date: "2025-06-08" },
  { id: 4, action: "Uploaded resume_v1.pdf", date: "2025-06-05" },
];
 
const scoreColor = (s) => (s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444");
 
export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  // ── History: which resume's report is being viewed ──
  const [selectedResume, setSelectedResume] = useState(null);
 
  const viewReport = (resume) => {
    setSelectedResume(resume);
    setTab("report");
  };
 
  // ── Profile form state ──
  const [profile, setProfile] = useState({
    fullName: mockUser.name,
    email: mockUser.email,
    phone: "",
    location: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
 
  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setProfileSaved(false);
  };
 
  const handleProfileSave = () => {
    // TODO: replace with real API call, e.g.
    // await axios.put("/api/user/profile", profile, { headers: { Authorization: `Bearer ${token}` } });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };
 
  // ── Chatbot state ──
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
 
  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
 
    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
 
    // TODO: replace with real API call to your chatbot backend
setTimeout(() => {
  setMessages((prev) => [
    ...prev,
    {
      id: Date.now() + 1,
      sender: "bot",
      text: "Thanks for your message! This is a placeholder reply — connect the chatbot backend to enable real responses.",
    },
  ]);
}, 600);
  };
 
  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };
 
  // ── Logout ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
 
  const navItems = [
    { id: "overview", icon: "⊞", label: "Overview" },
    { id: "upload", icon: "↑", label: "Upload Resume" },
    { id: "report", icon: "📊", label: "ATS Report" },
    { id: "history", icon: "🕐", label: "History" },
    { id: "chatbot", icon: "💬", label: "Chatbot" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
 
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif", background: "#0f172a", color: "#e2e8f0" }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 60, transition: "width 0.3s",
        background: "#1e293b", display: "flex", flexDirection: "column",
        borderRight: "1px solid #334155", flexShrink: 0
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🧭</span>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 16, color: "#6366f1" }}>PathFinder</span>}
          <span onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: "auto", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}>☰</span>
        </div>
 
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setTab(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
                background: tab === item.id ? "#6366f1" : "transparent",
                color: tab === item.id ? "#fff" : "#94a3b8",
              }}>
              <span style={{ fontSize: 18, minWidth: 20, textAlign: "center" }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
            </div>
          ))}
        </nav>
 
        <div style={{ padding: "12px 8px", borderTop: "1px solid #334155" }}>
          <div onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, cursor: "pointer", color: "#ef4444"
            }}>
            <span style={{ fontSize: 18 }}>⏻</span>
            {sidebarOpen && <span style={{ fontSize: 14 }}>Logout</span>}
          </div>
        </div>
      </div>
 
      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
 
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              {tab === "overview" && `Welcome back, ${mockUser.name.split(" ")[0]} 👋`}
              {tab === "upload" && "Upload Resume"}
              {tab === "report" && "ATS Report"}
              {tab === "history" && "Resume History"}
              {tab === "chatbot" && "AI Chatbot"}
              {tab === "profile" && "My Profile"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>{mockUser.email}</p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16
          }}>
            {mockUser.name[0]}
          </div>
        </div>
 
        {/* Overview */}
        {tab === "overview" && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Latest ATS Score", value: "82", unit: "/100", color: "#22c55e" },
                { label: "Resumes Uploaded", value: "3", unit: "", color: "#6366f1" },
                { label: "Chatbot Sessions", value: "5", unit: "", color: "#f59e0b" },
                { label: "Profile Strength", value: "75", unit: "%", color: "#06b6d4" },
              ].map(card => (
                <div key={card.label} style={{
                  background: "#1e293b", borderRadius: 12, padding: "20px",
                  border: "1px solid #334155"
                }}>
                  <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 13 }}>{card.label}</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: card.color }}>
                    {card.value}<span style={{ fontSize: 14, color: "#64748b" }}>{card.unit}</span>
                  </p>
                </div>
              ))}
            </div>
 
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Quick Actions */}
              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "📄 Upload New Resume", action: "upload" },
                    { label: "📊 View ATS Report", action: "report" },
                    { label: "💬 Start Chatbot", action: "chatbot" },
                    { label: "🕐 View History", action: "history" },
                  ].map(btn => (
                    <button key={btn.label} onClick={() => setTab(btn.action)}
                      style={{
                        background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
                        padding: "10px 14px", color: "#e2e8f0", cursor: "pointer",
                        textAlign: "left", fontSize: 14, transition: "all 0.2s"
                      }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Recent Activity */}
              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Recent Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mockActivity.map(a => (
                    <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: 13, color: "#e2e8f0" }}>{a.action}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>{a.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* Upload — now using the fully functional UploadTab component */}
        {tab === "upload" && <UploadTab />}
 
        {/* ATS Report */}
        {tab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
            {selectedResume && (
              <div style={{
                background: "#1e293b", borderRadius: 12, padding: "12px 16px",
                border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Showing report for <strong style={{ color: "#e2e8f0" }}>{selectedResume.filename}</strong>
                </span>
                <button onClick={() => setSelectedResume(null)}
                  style={{ background: "transparent", color: "#6366f1", border: "none", cursor: "pointer", fontSize: 12 }}>
                  Clear
                </button>
              </div>
            )}
 
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155", textAlign: "center" }}>
              <p style={{ margin: "0 0 8px", color: "#64748b" }}>Your ATS Score</p>
              <p style={{ margin: 0, fontSize: 64, fontWeight: 800, color: scoreColor(selectedResume?.score ?? 82) }}>
                {selectedResume?.score ?? 82}
              </p>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>out of 100</p>
            </div>
            {[
              { label: "Keyword Match", score: 85 },
              { label: "Formatting", score: 90 },
              { label: "Skills Relevance", score: 78 },
              { label: "Experience Match", score: 72 },
            ].map(item => (
              <div key={item.label} style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: scoreColor(item.score) }}>{item.score}%</span>
                </div>
                <div style={{ background: "#0f172a", borderRadius: 99, height: 8 }}>
                  <div style={{ width: `${item.score}%`, height: "100%", borderRadius: 99, background: scoreColor(item.score), transition: "width 1s" }} />
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* History */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
            {mockHistory.map(h => (
              <div key={h.id} style={{
                background: "#1e293b", borderRadius: 12, padding: 20,
                border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 28 }}>📄</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{h.filename}</p>
                    <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>{h.date}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: scoreColor(h.score) }}>{h.score}</span>
                  <button onClick={() => viewReport(h)}
                    style={{
                      background: "#6366f1", color: "#fff", border: "none", borderRadius: 6,
                      padding: "6px 14px", cursor: "pointer", fontSize: 13
                    }}>View</button>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* Chatbot */}
        {tab === "chatbot" && (
          !chatStarted ? (
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155", maxWidth: 500, textAlign: "center" }}>
              <p style={{ fontSize: 48, margin: "0 0 16px" }}>💬</p>
              <h2 style={{ margin: "0 0 8px" }}>AI Career Assistant</h2>
              <p style={{ color: "#64748b", marginBottom: 24 }}>Get personalized career advice, resume tips, and job search guidance.</p>
              <button onClick={() => setChatStarted(true)}
                style={{
                  background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                  padding: "12px 32px", cursor: "pointer", fontWeight: 600, fontSize: 15
                }}>Start Chatting</button>
            </div>
          ) : (
            <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", maxWidth: 500, display: "flex", flexDirection: "column", height: 480 }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.length === 0 && (
                  <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginTop: 40 }}>
                    Ask me anything about your resume, skills, or job search 👋
                  </p>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{
                    alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                    background: m.sender === "user" ? "#6366f1" : "#0f172a",
                    color: m.sender === "user" ? "#fff" : "#e2e8f0",
                    border: m.sender === "user" ? "none" : "1px solid #334155",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    maxWidth: "80%",
                  }}>
                    {m.text}
                  </div>
                ))}
              </div>
 
              {/* Input */}
              <div style={{ display: "flex", gap: 8, padding: 16, borderTop: "1px solid #334155" }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Type your message..."
                  style={{
                    flex: 1, background: "#0f172a", border: "1px solid #334155",
                    borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none"
                  }}
                />
                <button onClick={sendMessage}
                  style={{
                    background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                    padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14
                  }}>Send</button>
              </div>
            </div>
          )
        )}
 
        {/* Profile */}
        {tab === "profile" && (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155", maxWidth: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "#6366f1",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700
              }}>{mockUser.name[0]}</div>
              <div>
                <h2 style={{ margin: 0 }}>{mockUser.name}</h2>
                <p style={{ margin: 0, color: "#64748b" }}>{mockUser.email}</p>
              </div>
            </div>
 
            {[
              { label: "Full Name", key: "fullName" },
              { label: "Email", key: "email" },
              { label: "Phone", key: "phone" },
              { label: "Location", key: "location" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>{field.label}</label>
                <input
                  value={profile[field.key]}
                  onChange={(e) => handleProfileChange(field.key, e.target.value)}
                  style={{
                    width: "100%", background: "#0f172a", border: "1px solid #334155",
                    borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box"
                  }}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
 
            <button onClick={handleProfileSave}
              style={{
                width: "100%", background: "#6366f1", color: "#fff", border: "none",
                borderRadius: 8, padding: "12px", cursor: "pointer", fontWeight: 600, fontSize: 15
              }}>Save Changes</button>
 
            {profileSaved && (
              <p style={{ marginTop: 12, color: "#22c55e", fontSize: 13, textAlign: "center" }}>
                Profile saved successfully!
              </p>
            )}
          </div>
        )}
 
      </div>
    </div>
  );
}
