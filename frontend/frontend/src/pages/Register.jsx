

import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
 
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirm)
      return setError("Passwords do not match");
 
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
 
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="register-container">
      <div className="register-box">
 
        <div className="auth-brand">🧭 PathFinder AI</div>
        <h1>Create Account</h1>
        <p className="subtitle">Start your journey with PathFinder AI</p>
 
        <form className="register-form" onSubmit={handleSubmit}>
          {error && <p className="error-msg">{error}</p>}
 
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
 
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
 
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
 
          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm"
              placeholder="Confirm password"
              value={formData.confirm}
              onChange={handleChange}
              required
            />
          </div>
 
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
 
          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
 
export default Register;