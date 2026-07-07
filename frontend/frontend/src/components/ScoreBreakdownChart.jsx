import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const scoreColor = (s) => (s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444");
const scoreLabel = (s) => (s >= 75 ? "Strong" : s >= 50 ? "Needs Work" : "Weak");

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#ec4899"];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div style={{
        background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
        padding: "8px 12px", fontSize: 12
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0" }}>{point.category}</p>
        <p style={{ margin: "2px 0 0", color: scoreColor(point.score) }}>
          {point.score}% · {scoreLabel(point.score)}
        </p>
      </div>
    );
  }
  return null;
}

export default function ScoreBreakdownChart({ breakdown }) {
  if (!breakdown) {
    return <p style={{ color: "#64748b", fontSize: 13 }}>No breakdown data available.</p>;
  }

  const chartData = [
    { category: "Keyword Match", score: breakdown.keywordMatch ?? 0 },
    { category: "Formatting", score: breakdown.formatting ?? 0 },
    { category: "Skills Relevance", score: breakdown.skillsRelevance ?? 0 },
    { category: "Experience Match", score: breakdown.experienceMatch ?? 0 },
  ];

  const average = Math.round(
    chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
  );
  const strongest = chartData.reduce((a, b) => (a.score > b.score ? a : b));
  const weakest = chartData.reduce((a, b) => (a.score < b.score ? a : b));

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Score Breakdown</h3>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>
          Avg: <strong style={{ color: scoreColor(average) }}>{average}%</strong>
        </span>
      </div>

      {/* Pie Chart — proportion of each category */}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="score"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            label={({ score }) => `${score}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#1e293b" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: "#cbd5e1", fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Bar Chart — easy side-by-side comparison */}
      <ResponsiveContainer width="100%" height={200} style={{ marginTop: 8 }}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
          <YAxis type="category" dataKey="category" stroke="#cbd5e1" fontSize={12} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={scoreColor(d.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Quick insight */}
      <div style={{
        marginTop: 14, padding: "10px 12px", background: "#0f172a",
        border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#94a3b8"
      }}>
        💪 Strongest: <strong style={{ color: "#22c55e" }}>{strongest.category}</strong> ({strongest.score}%)
        &nbsp;·&nbsp;
        📉 Needs focus: <strong style={{ color: "#ef4444" }}>{weakest.category}</strong> ({weakest.score}%)
      </div>
    </div>
  );
}