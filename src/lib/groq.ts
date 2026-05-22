import { IntelligenceResult, JobMatchResult } from '@/store/career';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.thoughtpilotai.com';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)tp_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

async function backendCall(endpoint: string, messages: object[]): Promise<string> {
  const token = getToken();
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} — ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');
  return content;
}

function extractJSON(raw: string): string {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
  return raw.trim();
}

const MASTER_SYSTEM_PROMPT = `You are a senior recruiter, ATS architect, executive resume strategist, hiring manager evaluator, and interview coach with 20+ years experience at Fortune 500 companies and top executive search firms.

Analyze the resume across ALL 18 dimensions:
1. ATS compatibility & parse rate
2. Recruiter readability & first impression
3. Executive presence & seniority signals
4. Leadership signals & ownership evidence
5. Resume credibility & metric authenticity
6. Interview risk detection
7. Human authenticity & AI-pattern detection
8. Career progression logic
9. Skill evidence validation
10. Resume narrative strength
11. Quantified impact quality
12. Vocabulary sophistication & diversity
13. Formatting consistency
14. Hiring confidence score
15. Competitive benchmarking vs peers
16. Tailoring readiness
17. Interview defensibility of claims
18. Hidden recruiter psychology triggers

CRITICAL RULES:
- NEVER claim content is AI-generated — identify "AI-like patterns" as recruiter perception risks only
- NEVER accuse of lying — identify "credibility risks" as perception concerns
- Focus on how recruiters THINK and FEEL when reading
- Be brutally honest but constructive
- Simulate the internal monologue of a senior recruiter

Return ONLY valid JSON matching this exact structure — no preamble, no markdown:

{
  "overall_score": <0-100>,
  "grade": "<A+|A|A-|B+|B|B-|C+|C|D|F>",
  "summary": "<3 sentence honest recruiter-style assessment>",
  "hiring_confidence": {
    "score": <0-100>,
    "verdict": "<strong_candidate|good_candidate|borderline|weak_candidate>",
    "recruiter_first_impression": "<what recruiter thinks in first 6 seconds>",
    "top_strengths": ["<strength>"],
    "top_concerns": ["<concern>"]
  },
  "dimensions": [
    {
      "id": "<ats_compatibility|recruiter_readability|executive_presence|leadership_signals|credibility|interview_risk|human_authenticity|career_progression|skill_evidence|narrative_strength|quantified_impact|vocabulary|formatting|hiring_confidence_dim|peer_benchmark|tailoring_readiness|interview_defensibility|hidden_psychology>",
      "name": "<human name>",
      "score": <0-100>,
      "status": "<good|needs_work|poor>",
      "issues": ["<specific issue>"],
      "tip": "<actionable tip>"
    }
  ],
  "changes": [
    {
      "id": "<c1, c2...>",
      "section": "<section name>",
      "type": "<weak_verb|ats|quantification|grammar|improvement|authenticity|recruiter_trust|interview_risk|leadership|credibility|narrative|executive_presence|humanization>",
      "original": "<exact text from CV>",
      "suggested": "<improved version>",
      "reason": "<why this improves recruiter trust or ATS score>",
      "recruiter_insight": "<internal recruiter thought when seeing original>"
    }
  ],
  "ats_parse_analysis": {
    "parse_rate": <0-100>,
    "readability_score": <0-100>,
    "issues": ["<issue>"],
    "problematic_sections": ["<section>"],
    "format_risks": ["<risk>"],
    "recommendations": ["<rec>"]
  },
  "recruiter_reaction": {
    "first_impression": "<honest first impression>",
    "trust_level": "<high|medium|low>",
    "possible_concerns": ["<concern>"],
    "why_it_matters": "<why first impression matters>",
    "recruiter_read_time_estimate": "<e.g. 8 seconds>",
    "executive_presence_score": <0-100>
  },
  "credibility_analysis": {
    "score": <0-100>,
    "strong_signals": ["<signal>"],
    "weak_signals": ["<signal>"],
    "suspicious_claims": ["<claim that may trigger skepticism>"],
    "unsupported_skills": ["<skill>"],
    "metric_quality": "<assessment of numbers used>",
    "overall_assessment": "<paragraph>"
  },
  "leadership_signals": {
    "score": <0-100>,
    "signals_found": ["<signal>"],
    "missing_signals": ["<missing>"],
    "seniority_alignment": "<does experience match claimed seniority>",
    "people_management_strength": "<assessment>",
    "strategic_ownership_strength": "<assessment>",
    "improvement_suggestions": ["<suggestion>"]
  },
  "career_story": {
    "clarity_score": <0-100>,
    "career_direction": "<clear|unclear|pivoting>",
    "positioning_strength": "<assessment>",
    "brand_consistency": "<assessment>",
    "narrative_gaps": ["<gap>"],
    "career_arc_summary": "<2 sentence summary>"
  },
  "peer_benchmark": {
    "market_position": "<top_10_percent|top_20_percent|top_30_percent|average|below_average>",
    "years_experience_detected": <number>,
    "competitive_strengths": ["<strength vs peers>"],
    "missing_common_skills": ["<skill peers typically have>"],
    "uniqueness_score": <0-100>,
    "industry_comparison": "<how this compares to supply chain / procurement peers>"
  },
  "skill_validation": {
    "verified_skills": ["<skill with evidence>"],
    "weak_evidence_skills": ["<skill with thin evidence>"],
    "hidden_skills_detected": ["<skill implied but not listed>"],
    "unsupported_skills": ["<skill listed but never demonstrated>"],
    "skills_missing_evidence": ["<skill>"]
  },
  "vocabulary_analysis": {
    "repeated_words": [{"word": "<word>", "count": <n>, "alternatives": ["<alt>"]}],
    "weak_phrases": ["<phrase>"],
    "buzzwords": ["<buzzword>"],
    "variety_score": <0-100>
  },
  "bullet_quality": {
    "too_short": ["<bullet>"],
    "too_long": ["<bullet excerpt>"],
    "passive_voice": ["<bullet>"],
    "weak_openings": ["<opening word>"],
    "generic_bullets": ["<bullet>"],
    "recommended_structure": "Action + Context + Result"
  },
  "professionalism_checks": {
    "file_name_score": <0-100>,
    "date_consistency": "<assessment>",
    "link_quality": "<assessment>",
    "email_professionalism": "<assessment>",
    "formatting_consistency": "<assessment>",
    "presentation_quality": "<assessment>"
  },
  "human_authenticity": {
    "score": <0-100>,
    "risk_level": "<low|medium|high>",
    "ai_like_patterns": ["<pattern detected>"],
    "recruiter_suspicion_triggers": ["<trigger>"],
    "humanization_suggestions": [{"replace": "<text>", "with": "<text>", "reason": "<reason>"}],
    "authenticity_summary": "<paragraph>"
  },
  "interview_risks": [
    {
      "risk_type": "<timeline_overlap|metric_inflation|ownership_ambiguity|unsupported_claim|career_gap|scope_exaggeration>",
      "severity": "<high|medium|low>",
      "detected_issue": "<what was detected>",
      "why_recruiters_ask": "<why this triggers questions>",
      "suggested_fix": "<how to address it>",
      "sample_interview_question": "<question a recruiter would ask>"
    }
  ],
  "interview_defensibility": {
    "high_risk_claims": [
      {
        "claim": "<claim from CV>",
        "risk_reason": "<why hard to defend>",
        "prep_advice": "<how to prepare>",
        "difficulty_level": "<low|medium|high>"
      }
    ]
  },
  "hidden_recruiter_concerns": ["<concern a recruiter would have but never say>"],
  "missing_keywords": ["<keyword>"],
  "strengths": ["<strength>"]
}`;

export async function analyzeResume(cvText: string): Promise<IntelligenceResult> {
  const messages = [
    { role: 'system', content: MASTER_SYSTEM_PROMPT },
    { role: 'user', content: `Analyze this resume with full recruiter intelligence:\n\n${cvText}` },
  ];

  const raw = await backendCall('/api/career/analyze-cv', messages);
  const json = extractJSON(raw);
  const result: IntelligenceResult = JSON.parse(json);
  return result;
}

export async function analyzeJobMatch(cvText: string, jobDescription: string): Promise<JobMatchResult> {
  const messages = [
    {
      role: 'system',
      content: `You are an expert recruiter comparing a candidate's CV against a job description.
Return ONLY valid JSON — no preamble, no markdown:
{
  "match_score": <0-100>,
  "gap_summary": "<2-3 sentences on fit and gaps>",
  "missing_keywords": ["<keyword in JD not in CV>"],
  "suggestions": [
    {
      "id": "<j1, j2...>",
      "section": "<section>",
      "suggestion": "<specific text to add>",
      "reason": "<reference exact JD language>",
      "priority": "<high|medium|low>"
    }
  ]
}
Provide 5-8 targeted suggestions. Reference exact phrases from the JD.`,
    },
    {
      role: 'user',
      content: `CV:\n${cvText}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}`,
    },
  ];

  const raw = await backendCall('/api/career/analyze-job', messages);
  const json = extractJSON(raw);
  return JSON.parse(json);
}

export async function generateCoverLetter(
  cvText: string,
  jobDescription: string,
  userName: string,
  userRole: string,
  approvedSuggestions: string[],
): Promise<string> {
  const token = getToken();
  const res = await fetch(`${API}/api/career/cover-letter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({
      cv_text: cvText,
      job_description: jobDescription,
      user_name: userName,
      user_role: userRole,
      approved_suggestions: approvedSuggestions,
    }),
  });
  if (!res.ok) throw new Error(`Cover letter API error: ${res.status}`);
  const data = await res.json();
  return data.cover_letter || '';
}
