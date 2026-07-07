import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UploadTab from "./UploadTab";
import ResumeParser from "./ResumeParser";
import axios from "axios";
import SkillGapAnalysis from '../components/SkillGapAnalysis';
import MockInterview from '../components/MockInterview';
import ScoreBreakdownChart from '../components/ScoreBreakdownChart';
import { generateATSReportPDF } from '../utils/generatePDF';
import ResumeCompare from '../components/ResumeCompare';
import {
  LayoutGrid, Upload, BarChart3, History as HistoryIcon, MessageCircle,
  Mic, Scale, User, Search, Bell, ChevronRight, FileText, Sparkles
} from 'lucide-react';
import '../styles/interactions.css';

const scoreColor = (s) => (s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444");

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSkillGap, setExpandedSkillGap] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({ latestScore: 0, resumeCount: 0, profileStrength: 0, chatbotSessions: 0 });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const loadDashboard = async () => {
      try {
        const [userRes, historyRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/user/me", authHeader),
          axios.get("http://localhost:5000/api/resume/history", authHeader),
          axios.get("http://localhost:5000/api/user/stats", authHeader),
        ]);
        setCurrentUser(userRes.data);
        setHistory(historyRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "", location: "" });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: currentUser.location || "",
      });
    }
  }, [currentUser]);

  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setProfileSaved(false);
  };

  const handleProfileSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user/profile",
        { name: profile.name, phone: profile.phone, location: profile.location },
        authHeader
      );
      setCurrentUser(res.data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const viewReport = (resume) => {
    setSelectedResume(resume);
    setTab("report");
  };

  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [interviewResumeId, setInterviewResumeId] = useState('');
  const [interviewTargetRole, setInterviewTargetRole] = useState('');

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: "Thanks for your message! This is a placeholder reply — connect the chatbot backend to enable real responses." },
      ]);
    }, 600);
  };

  const handleChatKeyDown = (e) => { if (e.key === "Enter") sendMessage(); };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { id: "overview", icon: LayoutGrid, label: "Overview" },
    { id: "upload", icon: Upload, label: "Upload Resume" },
    { id: "parse", icon: Search, label: "Parse Resume" },
    { id: "compare", icon: Scale, label: "Compare Resumes" },
    { id: "report", icon: BarChart3, label: "ATS Report" },
    { id: "history", icon: HistoryIcon, label: "History" },
    { id: "chatbot", icon: MessageCircle, label: "Chatbot" },
    { id: "interview", icon: Mic, label: "Mock Interview" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>
        {/* Skeleton Sidebar */}
        <div style={{ width: 220, background: "#1e293b", borderRight: "1px solid #334155", padding: 16 }}>
          <div className="skeleton" style={{ height: 32, borderRadius: 8, marginBottom: 24 }} />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 38, borderRadius: 10, marginBottom: 8 }} />
          ))}
        </div>

        {/* Skeleton Main */}
        <div style={{ flex: 1, padding: 28 }}>
          <div className="skeleton" style={{ height: 40, width: 280, borderRadius: 10, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 36, width: 320, borderRadius: 8, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 16, width: 240, borderRadius: 6, marginBottom: 24 }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: 16, marginBottom: 24 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
            <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
            <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
          </div>
        </div>
      </div>
    );
  }
  if (!currentUser) return null;

  const recentActivity = history.slice(0, 5).map(h => ({
    id: h._id,
    action: `Uploaded ${h.filename} — Score: ${h.atsScore}`,
    date: new Date(h.createdAt || h.uploadedAt).toLocaleDateString(),
  }));

  const tabTitles = {
    overview: "Overview",
    upload: "Upload Resume",
    parse: "Parse Resume",
    compare: "Compare Resumes",
    report: "ATS Report",
    history: "Resume History",
    chatbot: "AI Chatbot",
    interview: "Mock Interview",
    profile: "My Profile",
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif", background: "#0f172a", color: "#e2e8f0" }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 60, transition: "width 0.3s",
        background: "#1e293b", display: "flex", flexDirection: "column",
        borderRight: "1px solid #334155", flexShrink: 0
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "#6366f1",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
            }}>🧭</div>
            {sidebarOpen && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>PathFinder AI</div>
                <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 1, fontWeight: 600 }}>CAREER COACH</div>
              </div>
            )}
            <span onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ marginLeft: "auto", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}>☰</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="clickable-card" onClick={() => setTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                  background: tab === item.id ? "#6366f1" : "transparent",
                  color: tab === item.id ? "#fff" : "#94a3b8",
                }}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "12px 8px", borderTop: "1px solid #334155" }}>
          <div onClick={() => setShowLogoutConfirm(true)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", color: "#ef4444" }}>
            <span style={{ fontSize: 18 }}>⏻</span>
            {sidebarOpen && <span style={{ fontSize: 14 }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: 28 }}>

        {/* Top header row (search + bell + user) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, background: "#1e293b",
            border: "1px solid #334155", borderRadius: 10, padding: "8px 14px", width: 280
          }}>
            <Search size={16} color="#64748b" />
            <input placeholder="Search insights..."
              style={{ background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 13, width: "100%" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Bell size={20} color="#94a3b8" style={{ cursor: "pointer" }} />
            <span style={{ fontSize: 14, color: "#e2e8f0" }}>
              Welcome back, <strong>{currentUser.name?.split(" ")[0] || "there"}</strong>
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
              {currentUser.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Page title (skip on overview since it has its own big heading) */}
        {tab !== "overview" && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{tabTitles[tab]}</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>{currentUser.email}</p>
          </div>
        )}

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 800 }}>Dashboard Overview</h1>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14 }}>
              Accelerate your career journey with AI-driven insights.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: 16, marginBottom: 24 }}>
              {[
                { label: "LATEST ATS SCORE", value: stats.latestScore, unit: "/100", sub: "Based on last upload", color: "#22c55e" },
                { label: "RESUMES UPLOADED", value: stats.resumeCount, unit: "", sub: "Total in your account", color: "#6366f1" },
                { label: "CHATBOT SESSIONS", value: stats.chatbotSessions, unit: "", sub: "Career guidance chats", color: "#f59e0b" },
              ].map(card => (
                <div key={card.label} className="clickable-card" style={{ background: "#1e293b", borderRadius: 14, padding: "18px 20px", border: "1px solid #334155" }}>
                  <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: 11, letterSpacing: 0.5, fontWeight: 600 }}>{card.label}</p>
                  <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#e2e8f0" }}>
                    {card.value}<span style={{ fontSize: 15, color: "#64748b" }}>{card.unit}</span>
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: card.color }}>{card.sub}</p>
                </div>
              ))}

              <div style={{
                background: "#1e293b", borderRadius: 14, border: "1px solid #334155",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 20, width: 140
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: "50%",
                  background: `conic-gradient(#6366f1 ${stats.profileStrength * 3.6}deg, #334155 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%", background: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15
                  }}>
                    {stats.profileStrength}%
                  </div>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 10, color: "#64748b", letterSpacing: 0.5, fontWeight: 600 }}>PROFILE STRENGTH</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
              <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, border: "1px solid #334155" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Upload New Resume", icon: Upload, action: "upload" },
                    { label: "Run ATS Check", icon: BarChart3, action: "report" },
                    { label: "Start Mock Interview", icon: Mic, action: "interview" },
                  ].map(btn => {
                    const Icon = btn.icon;
                    return (
                      <button key={btn.label} className="clickable-btn" onClick={() => setTab(btn.action)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: btn.action === "upload" ? "#6366f1" : "#0f172a",
                          border: "1px solid #334155", borderRadius: 10,
                          padding: "12px 14px", color: "#fff", cursor: "pointer",
                          fontSize: 14, fontWeight: 500
                        }}>
                        <Icon size={16} />
                        <span style={{ flex: 1, textAlign: "left" }}>{btn.label}</span>
                        <ChevronRight size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Recent Activity</h3>
                  <span onClick={() => setTab("history")} style={{ fontSize: 12, color: "#6366f1", cursor: "pointer" }}>View All</span>
                </div>
                {recentActivity.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: 13 }}>No activity yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {recentActivity.map(a => (
                      <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, background: "#0f172a",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          <FileText size={16} color="#6366f1" />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{a.action}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#475569" }}>{a.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "upload" && <UploadTab />}
        {tab === "parse" && <ResumeParser />}

        {tab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
            {selectedResume && (
              <div style={{ background: "#1e293b", borderRadius: 12, padding: "12px 16px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Showing report for <strong style={{ color: "#e2e8f0" }}>{selectedResume.filename}</strong>
                </span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button onClick={() => generateATSReportPDF(selectedResume)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>📄 Download PDF</button>
                  <button onClick={() => setSelectedResume(null)} style={{ background: "transparent", color: "#6366f1", border: "none", cursor: "pointer", fontSize: 12 }}>Clear</button>
                </div>
              </div>
            )}
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155", textAlign: "center" }}>
              <p style={{ margin: "0 0 8px", color: "#64748b" }}>Your ATS Score</p>
              <p style={{ margin: 0, fontSize: 64, fontWeight: 800, color: scoreColor(selectedResume?.atsScore ?? stats.latestScore) }}>
                {selectedResume?.atsScore ?? stats.latestScore}
              </p>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>out of 100</p>
            </div>
            {selectedResume?.breakdown ? (
              <ScoreBreakdownChart breakdown={selectedResume.breakdown} />
            ) : (
              <p style={{ color: "#64748b", fontSize: 13 }}>Select a resume from History to see its detailed breakdown.</p>
            )}
          </div>
        )}

        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
            {history.length === 0 && <p style={{ color: "#64748b", fontSize: 13 }}>No resumes uploaded yet.</p>}
            {history.map(h => (
              <div key={h._id}>
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 28 }}>📄</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{h.filename}</p>
                      <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>{new Date(h.createdAt || h.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 18, color: scoreColor(h.atsScore) }}>{h.atsScore}</span>
                    <button onClick={() => viewReport(h)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>View</button>
                    <button onClick={() => setExpandedSkillGap(expandedSkillGap === h._id ? null : h._id)}
                      style={{ background: expandedSkillGap === h._id ? "#334155" : "transparent", color: "#6366f1", border: "1px solid #6366f1", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>
                      {expandedSkillGap === h._id ? "Hide Gap" : "Skill Gap"}
                    </button>
                  </div>
                </div>
                {expandedSkillGap === h._id && (
                  <div style={{ background: "#0f172a", borderRadius: 12, padding: 16, border: "1px solid #334155", marginTop: 8 }}>
                    <SkillGapAnalysis resumeId={h._id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "compare" && (
          <div style={{ maxWidth: 700 }}>
            {history.length < 2 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>Upload at least 2 resumes to use comparison.</p>
            ) : (
              <ResumeCompare history={history} />
            )}
          </div>
        )}

        {tab === "interview" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155", marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Select Resume</label>
              <select value={interviewResumeId} onChange={(e) => setInterviewResumeId(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, marginBottom: 14 }}>
                <option value="">-- Choose a resume --</option>
                {history.map(h => <option key={h._id} value={h._id}>{h.filename}</option>)}
              </select>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Target Role</label>
              <input type="text" placeholder="e.g. Backend Developer, Data Analyst"
                value={interviewTargetRole} onChange={(e) => setInterviewTargetRole(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            {interviewResumeId && interviewTargetRole ? (
              <MockInterview resumeId={interviewResumeId} targetRole={interviewTargetRole} />
            ) : (
              <p style={{ color: "#64748b", fontSize: 13 }}>Select a resume and enter a target role to start.</p>
            )}
          </div>
        )}

        {tab === "chatbot" && (
          !chatStarted ? (
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155", maxWidth: 500, textAlign: "center" }}>
              <p style={{ fontSize: 48, margin: "0 0 16px" }}>💬</p>
              <h2 style={{ margin: "0 0 8px" }}>AI Career Assistant</h2>
              <p style={{ color: "#64748b", marginBottom: 24 }}>Get personalized career advice, resume tips, and job search guidance.</p>
              <button onClick={() => setChatStarted(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>Start Chatting</button>
            </div>
          ) : (
            <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", maxWidth: 500, display: "flex", flexDirection: "column", height: 480 }}>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.length === 0 && <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginTop: 40 }}>Ask me anything about your resume, skills, or job search 👋</p>}
                {messages.map(m => (
                  <div key={m.id} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", background: m.sender === "user" ? "#6366f1" : "#0f172a", color: m.sender === "user" ? "#fff" : "#e2e8f0", border: m.sender === "user" ? "none" : "1px solid #334155", borderRadius: 12, padding: "10px 14px", fontSize: 13, maxWidth: "80%" }}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, padding: 16, borderTop: "1px solid #334155" }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatKeyDown} placeholder="Type your message..."
                  style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none" }} />
                <button onClick={sendMessage} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Send</button>
              </div>
            </div>
          )
        )}

        {tab === "profile" && (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155", maxWidth: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>
                {currentUser.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{currentUser.name}</h2>
                <p style={{ margin: 0, color: "#64748b" }}>{currentUser.email}</p>
              </div>
            </div>
            {[
              { label: "Full Name", key: "name" },
              { label: "Email", key: "email", disabled: true },
              { label: "Phone", key: "phone" },
              { label: "Location", key: "location" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>{field.label}</label>
                <input
                  value={profile[field.key]}
                  onChange={(e) => handleProfileChange(field.key, e.target.value)}
                  disabled={field.disabled}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: field.disabled ? "#64748b" : "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
            <button onClick={handleProfileSave} style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "12px", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>Save Changes</button>
            {profileSaved && <p style={{ marginTop: 12, color: "#22c55e", fontSize: 13, textAlign: "center" }}>Profile saved successfully!</p>}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e293b", borderRadius: 14, padding: 28,
            border: "1px solid #334155", maxWidth: 340, textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Log out?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#94a3b8" }}>
              You'll need to sign in again to access your dashboard.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, background: "#0f172a", border: "1px solid #334155",
                  borderRadius: 8, padding: "10px", color: "#e2e8f0", cursor: "pointer", fontSize: 13
                }}>
                Cancel
              </button>
              <button onClick={confirmLogout}
                style={{
                  flex: 1, background: "#ef4444", border: "none",
                  borderRadius: 8, padding: "10px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600
                }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}