import { ATSResult, JobMatchResult } from '@/store/career';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function getKey(): string {
  const key = process.env.NEXT_PUBLIC_GROQ_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_GROQ_KEY is not set');
  return key;
}

async function groqChat(systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} — ${err}`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

function extractJSON(raw: string): string {
  // Strip markdown fences if present
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  // Find first { to last }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
  return raw.trim();
}

export async function analyzeCV(cvText: string): Promise<ATSResult> {
  const systemPrompt = `You are an expert ATS and CV analyst. Analyze this CV across 10 dimensions.
Return ONLY valid JSON — no preamble, no markdown fences, no explanation.

The JSON structure must be exactly:
{
  "overall_score": <number 0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<2-3 sentence honest assessment>",
  "dimensions": [
    {
      "id": "<one of: weak_verbs|quantification|keywords|length|repetition|dates_gaps|summary_quality|skills_coverage|formatting|overall_impact>",
      "name": "<human readable name>",
      "score": <number 0-100>,
      "status": "<good|needs_work|poor>",
      "issues": ["<specific issue found in CV>"],
      "tip": "<actionable improvement tip>"
    }
  ],
  "changes": [
    {
      "id": "<unique id like c1, c2...>",
      "section": "<Work Experience|Summary|Skills|Education|etc>",
      "type": "<weak_verb|ats|quantification|grammar|improvement>",
      "original": "<exact text from CV — must appear verbatim in the CV>",
      "suggested": "<improved version>",
      "reason": "<why this improves ATS score>",
      "recruiter_insight": "<what a recruiter thinks when they see the original>"
    }
  ],
  "missing_keywords": ["<keyword>"],
  "strengths": ["<strength>"]
}

Include ALL 10 dimensions. Include 5-12 specific changes. Be brutally honest but constructive.`;

  const raw = await groqChat(systemPrompt, `Here is the CV to analyze:\n\n${cvText}`);
  const json = extractJSON(raw);
  const result: ATSResult = JSON.parse(json);

  // Ensure all changes start with pending status (store adds it)
  return result;
}

export async function analyzeJobMatch(cvText: string, jobDescription: string): Promise<JobMatchResult> {
  const systemPrompt = `You are an expert recruiter and ATS specialist. Compare this CV against the job description.
Return ONLY valid JSON — no preamble, no markdown, no explanation.

{
  "match_score": <number 0-100>,
  "gap_summary": "<2-3 sentences describing the fit and key gaps>",
  "missing_keywords": ["<keyword from JD missing from CV>"],
  "suggestions": [
    {
      "id": "<j1, j2...>",
      "section": "<Summary|Skills|Work Experience|etc>",
      "suggestion": "<specific text to add or change>",
      "reason": "<why — reference specific JD language>",
      "priority": "<high|medium|low>"
    }
  ]
}

Provide 4-8 targeted suggestions. Be specific — reference exact phrases from the job description.`;

  const raw = await groqChat(
    systemPrompt,
    `CV:\n${cvText}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}`,
  );
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
  const systemPrompt = `You are an expert career coach and professional writer. 
Write a compelling, personalized cover letter. Be specific, confident, and concise.
Use a professional but human tone. 3 paragraphs max. Do NOT use generic phrases.
Return ONLY the cover letter text — no subject line, no metadata, no preamble.`;

  const context = approvedSuggestions.length > 0
    ? `\n\nKey tailored points to include:\n${approvedSuggestions.join('\n')}`
    : '';

  const raw = await groqChat(
    systemPrompt,
    `Write a cover letter for ${userName} (${userRole}) applying to this role.\n\nCV:\n${cvText}${context}\n\nJOB DESCRIPTION:\n${jobDescription}`,
  );

  return raw.trim();
}
