import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        background: "#1e293b",
        borderBottom: "1px solid #334155",
      }}
    >
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          to="/"
          style={{
            color: "#6366f1",
            fontWeight: 700,
            fontSize: 18,
            textDecoration: "none",
          }}
        >
          🧭 PathFinder
        </Link>

      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          to="/login"
          style={{
            color: "#e2e8f0",
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #334155",
          }}
        >
          Login
        </Link>

        <Link
          to="/register"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 16px",
            borderRadius: 6,
            background: "#6366f1",
            fontWeight: 600,
          }}
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;