import express from 'express';
import Groq from 'groq-sdk';
import Resume from '../models/Resume.js'; // apna actual path/filename check kar lena

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are a career coaching AI. Given a resume's extracted text and a target job role, analyze the skill gap.

Return ONLY valid JSON in this exact format, no markdown, no preamble:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "matchPercentage": 65,
  "recommendations": [
    { "skill": "skill name", "reason": "why it's needed for this role", "priority": "high|medium|low" }
  ],
  "summary": "2-3 sentence overall assessment"
}`;

    const userPrompt = `Target Role: ${targetRole}

Resume Content:
${resume.parsedText}

Analyze the skill gap between this resume and the target role.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
    });

    let rawResponse = completion.choices[0].message.content.trim();
    rawResponse = rawResponse.replace(/```json|```/g, '').trim();

    const skillGapData = JSON.parse(rawResponse);

    resume.skillGapAnalysis = {
      targetRole,
      ...skillGapData,
      analyzedAt: new Date()
    };
    await resume.save();

    res.json(skillGapData);

  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze skill gap' });
  }
});
// ── POST /api/skill-gap/learning-path ──────────────────────────────────────
router.post('/learning-path', async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({ error: 'missingSkills array is required' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are a career coaching AI. Given a list of missing skills, provide a learning plan for each.

Return ONLY valid JSON in this exact format, no markdown, no preamble:
{
  "learningPlan": [
    {
      "skill": "skill name",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedWeeks": 2,
      "topics": ["topic1", "topic2", "topic3"],
      "searchKeyword": "best search phrase for this skill's tutorials"
    }
  ]
}`;

    const userPrompt = `Missing skills: ${missingSkills.join(', ')}

For each skill, suggest a learning plan.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(raw);

    // Har skill ke liye real, valid search links khud banao (Groq se nahi)
    const enriched = data.learningPlan.map(item => ({
      ...item,
      resources: {
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchKeyword + ' tutorial')}`,
        coursera: `https://www.coursera.org/search?query=${encodeURIComponent(item.skill)}`,
        freeCodeCamp: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(item.skill)}`,
      }
    }));

    res.json({ learningPlan: enriched });

  } catch (error) {
    console.error('Learning path error:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});
// ── POST /api/skill-gap/interview-questions ────────────────────────────────
router.post('/interview-questions', async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are an interview coach. Given a resume and target job role, generate mock interview questions.

Return ONLY valid JSON in this exact format, no markdown, no preamble:
{
  "technical": [
    { "question": "...", "hint": "what a good answer should cover" }
  ],
  "behavioral": [
    { "question": "...", "hint": "what a good answer should cover" }
  ],
  "resumeSpecific": [
    { "question": "...", "hint": "why this is being asked based on their resume" }
  ]
}

Generate 4 questions per category. Resume-specific questions must reference actual details from the resume (projects, companies, skills mentioned).`;

    const userPrompt = `Target Role: ${targetRole}

Resume Content:
${resume.parsedText.slice(0, 6000)}

Generate mock interview questions for this candidate.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(raw);

    res.json(data);

  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});
// ── POST /api/skill-gap/mock-interview ─────────────────────────────────────
router.post('/mock-interview', async (req, res) => {
  try {
    const { resumeId, targetRole, conversationHistory } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are a professional interviewer conducting a mock interview for a ${targetRole} position.

Candidate's resume summary:
${resume.parsedText.slice(0, 3000)}

Rules:
- Ask ONE question at a time, like a real interview.
- After the candidate answers, give brief (1-2 sentence) constructive feedback, then ask the next question.
- Mix technical and behavioral questions relevant to ${targetRole}.
- Keep your responses short and conversational, like a real interviewer would speak.
- Do not repeat questions already asked.
- If this is the first message (empty history), start with a warm greeting and your first question.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.6,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });

  } catch (error) {
    console.error('Mock interview error:', error);
    res.status(500).json({ error: 'Failed to continue mock interview' });
  }
});
export default router;