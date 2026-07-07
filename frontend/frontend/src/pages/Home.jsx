import { useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "📄",
    title: "Resume Analysis",
    body: "AI-powered deep scan of your content, identifying structural weaknesses and high-impact phrases.",
  },
  {
    icon: "📊",
    title: "ATS Scoring",
    body: "Measure how well your resume survives automated filters used by 95% of Fortune 500 companies.",
  },
  {
    icon: "🤖",
    title: "AI Career Assistant",
    body: "24/7 personalized coaching to refine your career narrative and interview storytelling skills.",
  },
  {
    icon: "🎯",
    title: "Skill Recommendations",
    body: "Identify critical skill gaps based on your target job descriptions and market demand trends.",
  },
  {
    icon: "🎤",
    title: "Interview Preparation",
    body: "Generate role-specific behavioral and technical questions derived from your actual experience.",
  },
  {
    icon: "💼",
    title: "Smart Job Matching",
    body: "Automatically match your optimized resume with curated job listings where you rank in the top 10%.",
  },
];

const STEPS = [
  {
    number: 1,
    title: "Upload Resume",
    body: "Seamlessly import your PDF or DOCX file to start the engine.",
  },
  {
    number: 2,
    title: "AI Analysis",
    body: "Our LLMs conduct a semantic analysis of your work history.",
  },
  {
    number: 3,
    title: "Optimize Report",
    body: "Apply suggested keywords and structural fixes for ATS compliance.",
  },
  {
    number: 4,
    title: "Land the Job",
    body: "Apply with confidence using a resume optimized for human and machine.",
  },
];

const ATS_TAGS = [
  { label: "Keywords", style: { top: "6%", left: "2%" } },
  { label: "Contact information", style: { top: "48%", left: "-4%" } },
  { label: "Skills", style: { top: "82%", left: "34%" } },
];

const SCORE_FACTORS = [
  {
    number: 1,
    title: "How much of your resume we can read",
    body: "Just like a real ATS, we parse your file's structure first. Columns, tables, and image-based headers often get scrambled or dropped entirely before a human ever sees them.",
  },
  {
    number: 2,
    title: "How closely you match the role",
    body: "We compare your skills, titles, and keywords against the job description you're targeting, and flag the gaps that are most likely to get you filtered out.",
  },
  {
    number: 3,
    title: "Whether the basics are machine-readable",
    body: "Dates, contact details, links, and file format all affect whether a system can extract your information correctly, regardless of how strong the writing is.",
  },
];

const WHY_POINTS = [
  {
    icon: "🛡️",
    title: "Your data is safe",
    body: "Bank-grade security with row level access. Your resume is encrypted and never shared.",
  },
  {
    icon: "⚡",
    title: "Instant resume score",
    body: "Get real-time, accurate ATS score feedback in seconds, powered by our AI engine.",
  },
  {
    icon: "🎯",
    title: "ATS keyword scoring",
    body: "Match your resume precisely to job requirements and beat applicant tracking systems.",
  },
];
const TESTIMONIALS = [
  {
    rating: 5,
    quote:
      "My ATS score went from 41 to 89 in one session. Got 4 interview calls the following week after months of silence.",
    metric: "+48 ATS pts",
    metricType: "neutral",
    avatar: "MJ",
    name: "Marcus Johnson",
    role: "Software Engineer",
    company: "Now at Stripe",
  },
  {
    rating: 5,
    quote:
      "The skill gap analysis was eye-opening. It told me exactly which 3 certifications would make me competitive for senior PM roles. Landed one in 6 weeks.",
    metric: "Hired in 6 weeks",
    metricType: "success",
    avatar: "PN",
    name: "Priya Nair",
    role: "Senior Product Manager",
    company: "Now at Figma",
  },
  {
    rating: 5,
    quote:
      "I was applying to 40 jobs a week with zero callbacks. PathFinder's job matcher cut that to 8 targeted applications — and I got 5 interviews.",
    metric: "5/8 interviews",
    metricType: "highlight",
    avatar: "DC",
    name: "David Chen",
    role: "Data Scientist",
    company: "Now at Databricks",
  },
];

const RESULT_STATS = [
  { value: "50,000+", label: "Job seekers helped" },
  { value: "11 days", label: "Avg time to first interview" },
  { value: "78%", label: "Offer acceptance rate" },
  { value: "4.9 / 5", label: "User satisfaction" },
];

const Home = () => {
  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <span className="hero-badge">
          <span className="dot" /> New: AI Career Copilot 2.0
        </span>

        <h1>
          Navigate your career with <span className="accent">AI precision.</span>
        </h1>

        <p className="hero-lede">
          Improve your resume, increase ATS scores, and discover missing
          skills. Our AI-driven engine accelerates your journey from
          applicant to top candidate.
        </p>

        <div className="hero-buttons">
          <Link to="/register">
            <button className="primary-btn">Start Free Trial →</button>
          </Link>
          <Link to="/demo">
            <button className="ghost-btn">▷ Watch Demo</button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features reveal" id="features">
        <div className="section-head">
          <h2>Precision Powered Features</h2>
          <p className="section-lede">Everything you need to outperform the competition.</p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="card" key={f.title}>
              <div className="card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ATS Understanding Check */}
      <section className="ats-check reveal" id="ats-check">
        <div className="ats-visual">
          <div className="ats-resume-card">
            <div className="ats-resume-header">
              <div className="ats-avatar">JB</div>
              <div>
                <p className="ats-name">Jasmine Bell</p>
                <p className="ats-role">Senior Frontend Engineer</p>
              </div>
            </div>

            <div className="ats-resume-section">
              <p className="ats-section-title">Experience</p>
              <div className="ats-resume-line wide" />
              <div className="ats-resume-line" />
              <div className="ats-resume-line short" />
            </div>

            <div className="ats-resume-section">
              <p className="ats-section-title">Skills</p>
              <div className="ats-resume-line" />
              <div className="ats-resume-line short" />
            </div>

            <div className="ats-resume-section">
              <p className="ats-section-title">Education</p>
              <div className="ats-resume-line wide" />
            </div>
          </div>
          {ATS_TAGS.map((tag) => (
            <span className="ats-tag" style={tag.style} key={tag.label}>
              {tag.label}
            </span>
          ))}
        </div>

        <div className="ats-copy">
          <h2>Get an ATS understanding check</h2>
          <p>
            Part of your resume score comes from how well the file itself can
            be parsed. We've modeled our checker on the applicant tracking
            systems companies actually use, so you know exactly where a
            machine might misread your resume before a recruiter ever sees it.
          </p>
          <p>
            For every upload, we check for role-relevant skills and keywords,
            readable contact details, consistent date formatting, and a
            file structure that survives being scanned, then hand you clear
            suggestions to fix what's holding your score back.
          </p>
        </div>
      </section>

      {/* Score breakdown */}
      <section className="score-breakdown reveal" id="score-breakdown">
        <div className="section-head">
          <h2>How we calculate your ATS score</h2>
          <p className="section-lede">
            Three signals combine into a single score you can act on.
          </p>
        </div>

        <div className="factor-list">
          {SCORE_FACTORS.map((f) => (
            <div className="factor" key={f.number}>
              <div className="factor-number">{f.number}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="steps reveal" id="how-it-works">
        <div className="section-head">
          <h2>How it Works</h2>
          <p className="section-lede">Four simple steps to transform your professional trajectory.</p>
        </div>

        <div className="step-grid">
          {STEPS.map((s) => (
            <div className="step" key={s.number}>
              <div className={`step-number ${s.number === 4 ? "active" : ""}`}>{s.number}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Use Our ATS Score Checker */}
      <section className="why-use reveal" id="why-use">
        <div className="section-head">
          <h2>Why use our ATS score checker?</h2>
        </div>

        <div className="why-grid">
          {WHY_POINTS.map((w) => (
            <div className="why-card" key={w.title}>
              <div className="why-icon">{w.icon}</div>
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="cta reveal">
        <div className="cta-panel">
          <h2>Ready to Build Your Dream Career?</h2>
          <p>
            Join PathFinder AI today and experience the future of work. Join
            over 50,000 professionals who have optimized their path.
          </p>
          <Link to="/register">
            <button className="cta-btn">Get Started Now</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <div>🧭 PathFinder AI</div>
          <div className="footer-copy">© 2024 Pathfinder AI. Precision career intelligence.</div>
        </div>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/support">Contact Support</a>
          <a href="/blog">Career Blog</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;