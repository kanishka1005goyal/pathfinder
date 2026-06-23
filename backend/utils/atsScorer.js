const KEYWORDS = [
  "javascript", "react", "node", "python", "sql", "api", "agile",
  "communication", "leadership", "problem solving", "typescript", "git"
];

function scoreResume(text) {
  const lower = text.toLowerCase();

  // Keyword Match
  const matched = KEYWORDS.filter(k => lower.includes(k));
  const keywordMatch = Math.round((matched.length / KEYWORDS.length) * 100);

  // Formatting — check for common section headers
  const sections = ["experience", "education", "skills", "summary", "projects"];
  const foundSections = sections.filter(s => lower.includes(s));
  const formatting = Math.round((foundSections.length / sections.length) * 100);

  // Skills Relevance — based on technical keywords density
  const wordCount = text.split(/\s+/).length;
  const techCount = matched.length;
  const skillsRelevance = Math.min(100, Math.round((techCount / (wordCount / 100)) * 10));

  // Experience Match — years mentioned
  const yearMatches = text.match(/\d+\s*(years?|yrs?)/gi) || [];
  const experienceMatch = Math.min(100, yearMatches.length * 20 + 40);

  const atsScore = Math.round(
    keywordMatch * 0.35 +
    formatting * 0.25 +
    skillsRelevance * 0.25 +
    experienceMatch * 0.15
  );

  return { atsScore, breakdown: { keywordMatch, formatting, skillsRelevance, experienceMatch } };
}

module.exports = { scoreResume };