"""
Algorithmic Resume Parser — no AI/LLM required.
Uses regex, keyword matching, and heuristics to extract structured data.

Endpoint: POST /api/parse-resume
  Body: multipart/form-data with field "resume" (PDF or DOCX)
"""

import re
import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

# ─── Skill keyword bank ──────────────────────────────────────────────────────

TECH_SKILLS = {
    "languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "ruby",
        "go", "rust", "swift", "kotlin", "php", "scala", "r", "matlab",
        "bash", "shell", "sql", "html", "css",
    ],
    "frameworks": [
        "react", "angular", "vue", "nextjs", "nuxtjs", "django", "flask",
        "fastapi", "spring", "express", "nestjs", "laravel", "rails",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
        "nodejs", "node.js",
    ],
    "tools": [
        "git", "docker", "kubernetes", "aws", "azure", "gcp", "linux",
        "ci/cd", "jenkins", "github actions", "terraform", "ansible",
        "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
        "graphql", "rest", "api", "microservices", "agile", "scrum",
    ],
    "soft": [
        "leadership", "communication", "teamwork", "problem solving",
        "critical thinking", "project management", "time management",
        "collaboration", "mentoring", "adaptability",
    ],
}

# ─── Section header patterns ─────────────────────────────────────────────────

SECTION_PATTERNS = {
    "contact":     re.compile(r"\b(contact|personal\s+info|personal\s+details)\b", re.I),
    "summary":     re.compile(r"\b(summary|objective|profile|about\s+me|overview)\b", re.I),
    "education":   re.compile(r"\b(education|academic|qualification|degree|university|college)\b", re.I),
    "experience":  re.compile(r"\b(experience|employment|work\s+history|career|professional\s+background)\b", re.I),
    "skills":      re.compile(r"\b(skills|technical\s+skills|core\s+competencies|expertise|technologies)\b", re.I),
    "projects":    re.compile(r"\b(projects|portfolio|personal\s+projects|academic\s+projects)\b", re.I),
    "certifications": re.compile(r"\b(certifications?|certificates?|licenses?|credentials?)\b", re.I),
    "awards":      re.compile(r"\b(awards?|honors?|achievements?|recognition)\b", re.I),
}

# ─── Regex patterns ──────────────────────────────────────────────────────────

EMAIL_RE    = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE    = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
URL_RE      = re.compile(r"(https?://[^\s]+|linkedin\.com/in/[^\s]+|github\.com/[^\s]+)", re.I)
DATE_RE     = re.compile(
    r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
    r"[\s,]+(\d{4})"
    r"|\b(\d{4})\b",
    re.I,
)
YEAR_RANGE_RE = re.compile(
    r"(\d{4})\s*[-–—]\s*(\d{4}|present|current|now|till\s+date)", re.I
)
GPA_RE      = re.compile(r"\b(\d\.\d{1,2})\s*/\s*(\d\.\d{1,2}|\d)\b")
DEGREE_RE   = re.compile(
    r"\b(bachelor|b\.?s\.?|b\.?tech|b\.?e\.?|b\.?sc|master|m\.?s\.?|m\.?tech|"
    r"m\.?sc|ph\.?d|mba|associate|diploma)\b",
    re.I,
)

# ─── Extraction helpers ──────────────────────────────────────────────────────

def extract_text_from_pdf(data: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except ImportError:
        pass
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not extract PDF text. Install pdfplumber or pypdf.")


def extract_text_from_docx(data: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs)
    except ImportError:
        raise HTTPException(status_code=500, detail="python-docx not installed. Run: pip install python-docx")


def clean_text(text: str) -> str:
    """Normalise whitespace, remove non-printable chars."""
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


# ─── Section splitter ────────────────────────────────────────────────────────

def split_into_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"header": []}
    current = "header"

    for line in lines:
        stripped = line.strip()
        matched = False
        for sec_name, pattern in SECTION_PATTERNS.items():
            # A line is a section header if it's short and matches
            if pattern.search(stripped) and len(stripped) < 60:
                current = sec_name
                matched = True
                break
        if not matched:
            sections.setdefault(current, []).append(stripped)

    return {k: [l for l in v if l] for k, v in sections.items()}


# ─── Field extractors ────────────────────────────────────────────────────────

def extract_name(header_lines: list[str]) -> str:
    """
    Heuristic: the name is usually the first non-empty, non-email,
    non-phone, non-url line that has 2–4 capitalised words.
    """
    name_re = re.compile(r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$")
    for line in header_lines[:10]:
        line = line.strip()
        if name_re.match(line):
            return line
    return ""


def extract_contact(all_text: str) -> dict:
    emails   = EMAIL_RE.findall(all_text)
    phones   = PHONE_RE.findall(all_text)
    urls     = URL_RE.findall(all_text)

    linkedin = next((u for u in urls if "linkedin" in u.lower()), "")
    github   = next((u for u in urls if "github" in u.lower()), "")

    return {
        "email":    emails[0] if emails else "",
        "phone":    phones[0].strip() if phones else "",
        "linkedin": linkedin,
        "github":   github,
        "other_urls": [u for u in urls if u not in (linkedin, github)],
    }


def extract_skills(sections: dict[str, list[str]], all_text_lower: str) -> dict:
    # Gather all text from the skills section + full resume for broader match
    skill_section_text = " ".join(sections.get("skills", [])).lower()
    combined = skill_section_text + " " + all_text_lower

    found: dict[str, list[str]] = {}
    for category, keywords in TECH_SKILLS.items():
        matched = []
        for kw in keywords:
            # word-boundary match so "r" doesn't match "react"
            pattern = r"\b" + re.escape(kw) + r"\b"
            if re.search(pattern, combined, re.I):
                matched.append(kw)
        if matched:
            found[category] = matched

    return found


def extract_education(sections: dict[str, list[str]]) -> list[dict]:
    edu_lines = sections.get("education", [])
    text = " ".join(edu_lines)
    entries = []

    degrees = DEGREE_RE.findall(text)
    gpas    = GPA_RE.findall(text)
    years   = YEAR_RANGE_RE.findall(text)

    # Try to pull institution names (lines containing "university", "college", "institute")
    inst_re = re.compile(r"\b(university|college|institute|school|academy)\b", re.I)
    institutions = [l for l in edu_lines if inst_re.search(l)]

    entry = {
        "degrees":      list({d.upper() for d in degrees}),
        "institutions": institutions[:3],
        "gpa":          f"{gpas[0][0]}/{gpas[0][1]}" if gpas else "",
        "years":        [f"{y[0]}–{y[1]}" for y in years],
        "raw_lines":    edu_lines[:12],
    }
    entries.append(entry)
    return entries


def extract_experience(sections: dict[str, list[str]]) -> list[dict]:
    exp_lines = sections.get("experience", [])
    entries = []
    current: dict | None = None

    company_re = re.compile(r"\b(ltd|llc|inc|pvt|technologies|solutions|systems|corp|group)\b", re.I)

    for line in exp_lines:
        year_match = YEAR_RANGE_RE.search(line)
        if year_match and len(line) < 120:
            if current:
                entries.append(current)
            current = {
                "title": "",
                "company": "",
                "duration": f"{year_match.group(1)}–{year_match.group(2)}",
                "bullets": [],
                "raw": line,
            }
            # Try to extract title / company from same line
            before = line[:year_match.start()].strip(" |–-,")
            parts = [p.strip() for p in re.split(r"[|,@]", before) if p.strip()]
            if parts:
                current["title"] = parts[0]
            if len(parts) > 1:
                current["company"] = parts[1]
        elif current is not None:
            if line.startswith(("•", "-", "*", "·", "–", "▪")):
                current["bullets"].append(line.lstrip("•-*·–▪ "))
            elif company_re.search(line) and not current["company"]:
                current["company"] = line
            elif not current["title"] and len(line) < 80:
                current["title"] = line

    if current:
        entries.append(current)

    return entries[:10]  # cap at 10 roles


def extract_projects(sections: dict[str, list[str]]) -> list[dict]:
    proj_lines = sections.get("projects", [])
    projects = []
    current: dict | None = None

    for line in proj_lines:
        if len(line) < 80 and not line.startswith(("•", "-", "*")):
            if current:
                projects.append(current)
            current = {"name": line, "description": [], "tech": []}
            # Extract inline tech mentions
            for kw_list in TECH_SKILLS.values():
                for kw in kw_list:
                    if re.search(r"\b" + re.escape(kw) + r"\b", line, re.I):
                        current["tech"].append(kw)
        elif current:
            desc_line = line.lstrip("•-* ")
            current["description"].append(desc_line)
            for kw_list in TECH_SKILLS.values():
                for kw in kw_list:
                    if re.search(r"\b" + re.escape(kw) + r"\b", desc_line, re.I) and kw not in current["tech"]:
                        current["tech"].append(kw)

    if current:
        projects.append(current)

    return projects[:8]


def extract_certifications(sections: dict[str, list[str]]) -> list[str]:
    return [l for l in sections.get("certifications", []) if len(l) > 4][:10]


def extract_summary(sections: dict[str, list[str]]) -> str:
    lines = sections.get("summary", [])
    return " ".join(lines[:5])


# ─── Scoring engine ──────────────────────────────────────────────────────────

def compute_score(parsed: dict) -> dict:
    score = 0
    breakdown = {}
    suggestions = []
    strengths = []

    # 1. Contact completeness (20 pts)
    contact = parsed.get("contact", {})
    c_score = 0
    if contact.get("email"):    c_score += 7
    if contact.get("phone"):    c_score += 5
    if contact.get("linkedin"): c_score += 5; strengths.append("LinkedIn profile linked")
    if contact.get("github"):   c_score += 3; strengths.append("GitHub profile linked")
    if not contact.get("linkedin"):
        suggestions.append("Add your LinkedIn profile URL")
    if not contact.get("github"):
        suggestions.append("Add a GitHub profile link to showcase projects")
    breakdown["contactCompleteness"] = min(c_score, 20)
    score += breakdown["contactCompleteness"]

    # 2. Skills breadth (25 pts)
    skills = parsed.get("skills", {})
    total_skills = sum(len(v) for v in skills.values())
    s_score = min(total_skills * 2, 25)
    breakdown["skillsBreadth"] = s_score
    score += s_score
    if total_skills >= 10:
        strengths.append(f"Strong skills section ({total_skills} skills detected)")
    else:
        suggestions.append("Expand your skills section — aim for 10+ relevant keywords")

    # 3. Experience depth (25 pts)
    experience = parsed.get("experience", [])
    e_score = 0
    for exp in experience:
        if exp.get("title"):    e_score += 3
        if exp.get("company"):  e_score += 2
        if exp.get("duration"): e_score += 2
        e_score += min(len(exp.get("bullets", [])) * 2, 8)
    e_score = min(e_score, 25)
    breakdown["experienceDepth"] = e_score
    score += e_score
    if experience:
        strengths.append(f"{len(experience)} work experience entr{'y' if len(experience)==1 else 'ies'} found")
    else:
        suggestions.append("Add work experience with dates, titles, and bullet point achievements")

    # 4. Education (15 pts)
    education = parsed.get("education", [{}])
    ed = education[0] if education else {}
    ed_score = 0
    if ed.get("degrees"):      ed_score += 8
    if ed.get("institutions"): ed_score += 4
    if ed.get("years"):        ed_score += 3
    breakdown["education"] = min(ed_score, 15)
    score += breakdown["education"]

    # 5. Projects (10 pts)
    projects = parsed.get("projects", [])
    p_score = min(len(projects) * 4, 10)
    breakdown["projects"] = p_score
    score += p_score
    if projects:
        strengths.append(f"{len(projects)} project(s) highlighted")
    else:
        suggestions.append("Add a projects section to demonstrate practical experience")

    # 6. Summary (5 pts)
    summary = parsed.get("summary", "")
    sm_score = 5 if len(summary) > 50 else (3 if len(summary) > 10 else 0)
    breakdown["summaryPresent"] = sm_score
    score += sm_score
    if not summary:
        suggestions.append("Add a professional summary at the top of your resume")

    return {
        "overallScore": min(int(score), 100),
        "breakdown":    {k: int(v) for k, v in breakdown.items()},
        "suggestions":  suggestions[:6],
        "strengths":    strengths[:6],
    }


# ─── Main route ──────────────────────────────────────────────────────────────

@router.post("/api/parse-resume")
async def parse_resume(resume: UploadFile = File(...)):
    filename  = resume.filename or ""
    file_data = await resume.read()

    # Extract raw text
    if filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_data)
    elif filename.lower().endswith((".doc", ".docx")):
        raw_text = extract_text_from_docx(file_data)
    else:
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files are supported.")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the resume.")

    text        = clean_text(raw_text)
    lines       = text.splitlines()
    sections    = split_into_sections(lines)
    text_lower  = text.lower()

    parsed = {
        "filename":       filename,
        "name":           extract_name(sections.get("header", lines[:10])),
        "contact":        extract_contact(text),
        "summary":        extract_summary(sections),
        "skills":         extract_skills(sections, text_lower),
        "experience":     extract_experience(sections),
        "education":      extract_education(sections),
        "projects":       extract_projects(sections),
        "certifications": extract_certifications(sections),
        "sections_found": list(sections.keys()),
        "word_count":     len(text.split()),
        "char_count":     len(text),
    }

    scoring = compute_score(parsed)
    parsed.update(scoring)

    return JSONResponse(content=parsed)