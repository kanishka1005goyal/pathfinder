import "./Home.css";
import { Link } from "react-router-dom";
 
const Home = () => {
  return (
    <div className="home">
 
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-logo">🧭 PathFinder AI</div>
        <h2>AI Resume Analyzer &amp; Career Copilot</h2>
        <p>
          Improve your resume, increase ATS score, discover missing skills,
          generate interview questions and accelerate your career journey
          using Artificial Intelligence.
        </p>
        <div className="hero-buttons">
          <Link to="/register">
            <button className="primary-btn">Get Started</button>
          </Link>
          <Link to="/upload">
            <button className="secondary-btn">Upload Resume</button>
          </Link>
        </div>
      </section>
 
      {/* Features */}
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="card">
            <h3>📄 Resume Analysis</h3>
            <p>AI-powered resume evaluation and feedback.</p>
          </div>
          <div className="card">
            <h3>📊 ATS Score</h3>
            <p>Measure resume compatibility with ATS systems.</p>
          </div>
          <div className="card">
            <h3>🤖 AI Career Assistant</h3>
            <p>Get personalized career guidance and support.</p>
          </div>
          <div className="card">
            <h3>🎯 Skill Recommendations</h3>
            <p>Identify missing skills required for jobs.</p>
          </div>
          <div className="card">
            <h3>🎤 Interview Preparation</h3>
            <p>Generate role-specific interview questions.</p>
          </div>
          <div className="card">
            <h3>💼 Job Matching</h3>
            <p>Match your resume with job descriptions.</p>
          </div>
        </div>
      </section>
 
      {/* How It Works */}
      <section className="steps">
        <h2>How It Works</h2>
        <div className="step-grid">
          <div className="step">
            <h3>1️⃣ Upload Resume</h3>
            <p>Upload your PDF or DOCX resume.</p>
          </div>
          <div className="step">
            <h3>2️⃣ AI Analysis</h3>
            <p>Our AI evaluates your resume instantly.</p>
          </div>
          <div className="step">
            <h3>3️⃣ ATS Report</h3>
            <p>Get ATS score and improvement suggestions.</p>
          </div>
          <div className="step">
            <h3>4️⃣ Get Hired</h3>
            <p>Apply confidently with an optimized resume.</p>
          </div>
        </div>
      </section>
 
      {/* Footer CTA */}
      <section className="cta">
        <h2>Ready to Build Your Dream Career?</h2>
        <p>Join PathFinder AI and take your resume to the next level.</p>
        <Link to="/register">
          <button className="primary-btn">Start Now</button>
        </Link>
      </section>
 
    </div>
  );
};
 
export default Home;
 