import { IntelligenceResult, JobMatchResult } from '@/store/career';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.thoughtpilotai.com';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)tp_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function backendCall(endpoint: string, messages: object[], retries = 3): Promise<string> {
  const token = getToken();

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ messages }),
    });

    // 429 — rate limited: wait and retry
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') || '30', 10);
      const waitMs = Math.min(retryAfter * 1000, attempt * 12000); // cap at 36s
      console.warn(`[groq] 429 on ${endpoint} — waiting ${waitMs}ms (attempt ${attempt}/${retries})`);
      if (attempt < retries) {
        await sleep(waitMs);
        continue;
      }
      throw new Error('Rate limit reached — please wait 30 seconds and try again');
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${res.status} — ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');
    return content;
  }

  throw new Error('Analysis failed after retries — please try again');
}

function extractJSON(raw: string): string {
  if (!raw || !raw.trim()) throw new Error('Empty response from AI — Groq returned no content');
  let json = raw;
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) json = fence[1].trim();
  else {
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}');
    if (start === -1) throw new Error('No JSON object found in AI response');
    if (end <= start) throw new Error('AI response was truncated — JSON incomplete. Try a shorter CV or retry.');
    json = raw.slice(start, end + 1);
  }
  // Strip control characters
  json = json
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\r\n/g, '\\n')
    .replace(/\r/g, '\\n');
  try {
    JSON.parse(json);
  } catch {
    throw new Error('AI response was cut off mid-JSON. Try a shorter CV or retry.');
  }
  return json;
}

// ── Shared scoring rules injected into both prompts ───────────────────────────
const SCORING_RULES = `STRICT SCORING RULES — NON-NEGOTIABLE:
- 90–100: Virtually flawless. Less than 1% of resumes qualify.
- 80–89: Strong. Minor fixable issues only. Top 10% of candidates.
- 70–79: Good but clear gaps present. Average strong candidate.
- 60–69: Mediocre. Multiple issues actively hurting this resume.
- Below 60: Significant problems. Would not shortlist without major rewrites.
- HARD RULE: Overall score CANNOT exceed 78 if ANY single dimension scores below 70.
- HARD RULE: Overall score CANNOT exceed 85 unless EVERY dimension scores above 80.
- HARD RULE: Two-column layout OR photo → Formatting MAX 72, ATS MAX 75.
- HARD RULE: Phrase repeated 3+ times → Vocabulary MAX 75.
- HARD RULE: No direct people management evidence → Leadership MAX 74.
- HARD RULE: Claims without verifiable context → Interview Risk MAX 70.
- HARD RULE: Bullets longer than 3 lines → Recruiter Readability MAX 76.

ANALYSIS RULES:
- NEVER claim content is AI-generated — identify as "recruiter perception risks" only
- NEVER accuse of lying — identify "credibility risks" as perception concerns
- CRITICAL: Always quote exact CV text when identifying issues. Never say "some bullets".
- For bullet issues: include the FULL bullet text verbatim so the user knows exactly which line to fix.`;

// ═══════════════════════════════════════════════════════════════════════════════
// CALL 1 — CORE REPORT (70B model)
// Scores, recruiter reaction, ATS, changes, dimensions, strengths
// ~25K tokens total
// ═══════════════════════════════════════════════════════════════════════════════
const CORE_SYSTEM_PROMPT = `You are a brutally honest senior recruiter and ATS architect with 20+ years at Fortune 500 firms. You have reviewed 50,000+ resumes. You do NOT inflate scores.

${SCORING_RULES}
ANALYSIS RULES:
- Quote exact CV text verbatim for every issue — never say "some bullets"
- Score like a strict examiner — a generous score helps nobody
- Lead summary with the biggest weakness first

Return ONLY valid JSON — no preamble, no markdown:

{
  "overall_score": <0-100>,
  "grade": "<A+|A|A-|B+|B|B-|C+|C|D|F>",
  "summary": "<3 sentence brutally honest assessment — lead with biggest weakness first>",
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
      "issues": ["<specific issue — quote exact CV text verbatim>"],
      "tip": "<one specific actionable fix — never generic>"
    }
  ],
  "changes": [
    {
      "id": "<c1|c2|...>",
      "section": "<section name>",
      "type": "<weak_verb|ats|quantification|grammar|improvement|authenticity|recruiter_trust|interview_risk|leadership|credibility|narrative|executive_presence|humanization>",
      "original": "<exact text from CV verbatim>",
      "suggested": "<improved version>",
      "reason": "<why this improves recruiter trust or ATS>",
      "recruiter_insight": "<internal recruiter thought when seeing original>"
    }
  ],
  "ats_parse_analysis": {
    "parse_rate": <0-100>,
    "readability_score": <0-100>,
    "issues": [{"section": "<section>", "problem": "<specific problem>", "fix": "<how to fix>"}],
    "problematic_sections": ["<section>"],
    "format_risks": ["<risk with location>"],
    "recommendations": ["<specific recommendation>"]
  },
  "recruiter_reaction": {
    "first_impression": "<honest first impression>",
    "trust_level": "<high|medium|low>",
    "possible_concerns": ["<concern>"],
    "why_it_matters": "<why first impression matters>",
    "recruiter_read_time_estimate": "<e.g. 8 seconds>",
    "executive_presence_score": <0-100>
  },
  "missing_keywords": ["<keyword>"],
  "strengths": ["<strength — must reference specific CV evidence>"]
}`;

// ═══════════════════════════════════════════════════════════════════════════════
// CALL 2 — DEEP INTEL (70B model)
// Credibility, leadership, career story, peer benchmark, interview risks, hidden concerns
// ~20K tokens total
// ═══════════════════════════════════════════════════════════════════════════════
const DEEP_INTEL_SYSTEM_PROMPT = `You are a brutally honest executive search consultant and interview coach with 20+ years at Fortune 500 firms. You detect credibility risks, leadership gaps, and interview landmines that most candidates miss.

RULES:
- Quote exact CV text verbatim when identifying any issue
- Never say "some bullets" — always cite the specific text
- Never accuse of lying — frame as "credibility risks" or "perception concerns"
- Be specific: name the company, role, date, or claim you're flagging

Return ONLY valid JSON — no preamble, no markdown:

{
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
      "detected_issue": "<what was detected — quote exact CV text>",
      "why_recruiters_ask": "<why this triggers questions>",
      "suggested_fix": "<how to address it>",
      "sample_interview_question": "<question a recruiter would ask>"
    }
  ],
  "interview_defensibility": {
    "high_risk_claims": [
      {
        "claim": "<claim from CV verbatim>",
        "risk_reason": "<why hard to defend>",
        "prep_advice": "<how to prepare>",
        "difficulty_level": "<low|medium|high>"
      }
    ]
  },
  "hidden_recruiter_concerns": ["<concern a recruiter would have but never say out loud>"]
}`;

// ═══════════════════════════════════════════════════════════════════════════════
// CALL 3 — BULLET & VOCABULARY CHECKS (8B model — pattern matching only)
// bullet_quality, vocabulary_analysis, professionalism_checks
// ~15K tokens total — uses fast 8B model
// ═══════════════════════════════════════════════════════════════════════════════
const BULLET_CHECK_SYSTEM_PROMPT = `You are a precise resume editor. Analyze bullet points and vocabulary for technical quality issues.
Be exact — quote the full bullet text verbatim for every issue.
Return ONLY valid JSON — no preamble, no markdown:

{
  "bullet_quality": {
    "too_short": [{"text": "<exact bullet verbatim>", "word_count": <n>, "fix": "<suggested rewrite>"}],
    "too_long": [{"text": "<exact bullet verbatim — full text>", "word_count": <n>, "fix": "<how to split it into two bullets>"}],
    "passive_voice": [{"text": "<exact bullet verbatim>", "fix": "<rewrite in active voice>"}],
    "weak_openings": [{"verb": "<weak verb>", "bullet_start": "<first 8 words of that bullet>", "replacement": "<stronger verb>"}],
    "generic_bullets": [{"text": "<exact bullet verbatim>", "issue": "<why it is generic>", "fix": "<specific rewrite with metric placeholder>"}],
    "recommended_structure": "Action + Context + Result"
  },
  "vocabulary_analysis": {
    "repeated_words": [{"word": "<word>", "count": <n>, "alternatives": ["<alt1>", "<alt2>", "<alt3>"]}],
    "weak_phrases": ["<exact phrase from CV>"],
    "buzzwords": ["<buzzword found>"],
    "variety_score": <0-100>
  },
  "professionalism_checks": {
    "file_name_score": <0-100>,
    "date_consistency": "<assessment>",
    "link_quality": "<assessment>",
    "email_professionalism": "<assessment>",
    "formatting_consistency": "<assessment>",
    "presentation_quality": "<assessment>"
  }
}`;

// ── SessionStorage cache — survives inactivity logout within same tab ───────
const ANALYSIS_CACHE_KEY = 'tp_cs_analysis';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cvHash(text: string): string {
  // Simple hash from first+last 100 chars + length
  const sample = text.slice(0, 100) + text.slice(-100) + text.length;
  let h = 0;
  for (let i = 0; i < sample.length; i++) {
    h = (Math.imul(31, h) + sample.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export function saveAnalysisToCache(cvText: string, result: IntelligenceResult): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify({
      hash:     cvHash(cvText),
      result,
      savedAt:  Date.now(),
    }));
  } catch {}
}

export function loadAnalysisFromCache(cvText: string): IntelligenceResult | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ANALYSIS_CACHE_KEY);
    if (!raw) return null;
    const { hash, result, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > CACHE_TTL_MS) return null;    // expired
    if (hash !== cvHash(cvText)) return null;                 // different CV
    return result as IntelligenceResult;
  } catch { return null; }
}

export function clearAnalysisCache(): void {
  if (typeof sessionStorage === 'undefined') return;
  try { sessionStorage.removeItem(ANALYSIS_CACHE_KEY); } catch {}
}

// Max CV chars to prevent token overflow
const MAX_CV_CHARS = 12000;

// Extract only experience + skills from CV for deep intel call
// Reduces tokens by ~35% — deep intel doesn't need contact/edu/certs
function extractExperienceSection(cvText: string): string {
  const lines = cvText.split('\n');
  const EXPERIENCE_HEADERS = /^(experience|work|employment|professional|career|positions|skills|competencies|expertise)/i;
  const SKIP_HEADERS = /^(education|certifications|certificates|languages|interests|hobbies|references|awards|volunteer)/i;
  const HEADER_LINE = /^[A-Z][A-Z\s&]{3,}$/;

  let inRelevantSection = false;
  let result: string[] = [];

  // Always include first 15 lines (name, headline, summary)
  result.push(...lines.slice(0, 15));

  for (let i = 15; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { if (inRelevantSection) result.push(''); continue; }

    const isHeader = HEADER_LINE.test(line) || line.length < 40;

    if (isHeader) {
      if (EXPERIENCE_HEADERS.test(line)) {
        inRelevantSection = true;
        result.push(line);
      } else if (SKIP_HEADERS.test(line)) {
        inRelevantSection = false;
      } else if (inRelevantSection) {
        result.push(line);
      }
    } else if (inRelevantSection) {
      result.push(line);
    }
  }

  const extracted = result.join('\n').trim();
  // Fallback: if extraction too short, return full CV
  return extracted.length > 500 ? extracted : cvText;
}

// ── Main analyzeResume — 3 parallel calls ─────────────────────────────────────
export async function analyzeResume(cvText: string): Promise<IntelligenceResult> {
  const trimmedCV = cvText.length > MAX_CV_CHARS
    ? cvText.slice(0, MAX_CV_CHARS) + '\n\n[CV trimmed for analysis]'
    : cvText;

  // For deep intel (credibility, leadership, interview risks) we only need
  // the experience section + skills — not contact info, education, certifications
  // This cuts ~2,400 tokens from the deep call
  const trimmedCVForDeep = extractExperienceSection(trimmedCV);

  const userContent      = `Analyze this resume. Be strict and honest — do not inflate scores:\n\n${trimmedCV}`;
  const deepUserContent  = `Analyze credibility, leadership signals, and interview risks in this resume. Quote exact text for every issue:\n\n${trimmedCVForDeep}`;
  const bulletUserContent = `Analyze the bullets and vocabulary in this resume. Quote every issue verbatim:\n\n${trimmedCV}`;

  // Stagger calls to avoid simultaneous 429s
  // Wrap each in a timeout so one failure doesn't hang forever
  const withTimeout = (promise: Promise<string>, ms: number, label: string): Promise<string | null> =>
    Promise.race([
      promise.then(r => r).catch(e => { console.warn(`[groq] ${label} failed:`, e.message); return null; }),
      sleep(ms).then(() => { console.warn(`[groq] ${label} timed out after ${ms}ms`); return null; }),
    ]);

  const bulletPromise = backendCall('/api/career/analyze-bullets', [
    { role: 'system', content: BULLET_CHECK_SYSTEM_PROMPT },
    { role: 'user',   content: bulletUserContent },
  ]);

  await sleep(800);
  const corePromise = backendCall('/api/career/analyze-cv', [
    { role: 'system', content: CORE_SYSTEM_PROMPT },
    { role: 'user',   content: userContent },
  ]);

  await sleep(1200);
  const deepPromise = backendCall('/api/career/analyze-deep', [
    { role: 'system', content: DEEP_INTEL_SYSTEM_PROMPT },
    { role: 'user',   content: deepUserContent },
  ]);

  // Wait for all — 90s timeout per call, null on failure
  const [coreRaw, deepRaw, bulletRaw] = await Promise.all([
    withTimeout(corePromise,   90000, 'analyze-cv'),
    withTimeout(deepPromise,   90000, 'analyze-deep'),
    withTimeout(bulletPromise, 45000, 'analyze-bullets'),
  ]);

  // Core is mandatory — fail if it didn't return
  if (!coreRaw) throw new Error('Core analysis failed — please retry');

  // Parse all 3 responses — deep and bullet are optional fallbacks
  const core   = JSON.parse(extractJSON(coreRaw!));
  const deep   = deepRaw   ? (() => { try { return JSON.parse(extractJSON(deepRaw));   } catch { return {}; } })() : {};
  const bullet = bulletRaw ? (() => { try { return JSON.parse(extractJSON(bulletRaw)); } catch { return {}; } })() : {};

  // Merge — core is authoritative, deep and bullet fill in extra sections
  const result: IntelligenceResult = {
    ...core,
    ...deep,
    ...bullet,
  };

  // Save to sessionStorage — survives inactivity logout within same browser tab
  saveAnalysisToCache(cvText, result);

  return result;
}

export async function analyzeJobMatch(cvText: string, jobDescription: string): Promise<JobMatchResult> {
  const messages = [
    {
      role: 'system',
      content: `You are an expert recruiter comparing a CV against a job description.
Return ONLY valid JSON — no preamble, no markdown:
{
  "match_score": <0-100>,
  "gap_summary": "<2-3 sentences on fit and gaps>",
  "missing_keywords": ["<keyword in JD not in CV>"],
  "suggestions": [
    {
      "id": "<j1|j2|...>",
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

  const raw  = await backendCall('/api/career/analyze-job', messages);
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
      cv_text:              cvText,
      job_description:      jobDescription,
      user_name:            userName,
      user_role:            userRole,
      approved_suggestions: approvedSuggestions,
    }),
  });
  if (!res.ok) throw new Error(`Cover letter API error: ${res.status}`);
  const data = await res.json();
  return data.cover_letter || '';
}
