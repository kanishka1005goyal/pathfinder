import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "20px", background: "#1e293b" }}>
      <Link to="/" style={{ color: "white", marginRight: "20px" }}>
        Home
      </Link>

      <Link to="/login" style={{ color: "white", marginRight: "20px" }}>
        Login
      </Link>

      <Link to="/register" style={{ color: "white", marginRight: "20px" }}>
        Register
      </Link>

      <Link to="/dashboard" style={{ color: "white" }}>
        Dashboard
      </Link>
    </nav>
  );
};

export default Navbar;