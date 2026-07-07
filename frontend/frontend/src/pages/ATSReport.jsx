import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ScoreBreakdownChart from "../components/ScoreBreakdownChart";

const scoreColor = (s) => (s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444");

export default function ATSReport() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resumeId) return;
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/resume/report/${resumeId}`);
        setResume(res.data);
      } catch (err) {
        setError("Could not load report.");
      }
    };
    fetchReport();
  }, [resumeId]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a", color: "#e2e8f0",
      padding: 28, fontFamily: "Inter, sans-serif"
    }}>
      <h1 style={{ marginBottom: 20 }}>ATS Report</h1>

      {!resumeId && <p style={{ color: "#64748b" }}>No resume selected.</p>}
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {resume && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155", textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", color: "#64748b" }}>{resume.filename}</p>
            <p style={{ margin: 0, fontSize: 64, fontWeight: 800, color: scoreColor(resume.atsScore) }}>
              {resume.atsScore}
            </p>
            <p style={{ margin: "4px 0 0", color: "#64748b" }}>out of 100</p>
          </div>

          {resume.breakdown && <ScoreBreakdownChart breakdown={resume.breakdown} />}
        </div>
      )}
    </div>
  );
}