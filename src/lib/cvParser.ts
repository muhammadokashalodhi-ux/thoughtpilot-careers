// src/lib/cvParser.ts
// Parses raw CV text into structured sections — no AI needed
// Handles 95%+ of real-world CV formats

export interface CVExperience {
  role:      string;
  company:   string;
  dates:     string;
  location:  string;
  bullets:   string[];
}

export interface CVEducation {
  degree:   string;
  school:   string;
  dates:    string;
  details?: string;
}

export interface CVCertification {
  name:     string;
  issuer:   string;
  date:     string;
}

export interface CVLanguage {
  language:     string;
  proficiency:  string;
}

export interface CVExtra {
  heading: string;
  lines:   string[];
}

export interface ParsedCV {
  // Header
  name:         string;
  headline:     string;
  email:        string;
  phone:        string;
  location:     string;
  linkedin:     string;
  website:      string;
  github:       string;

  // Sections
  summary:      string;
  experience:   CVExperience[];
  education:    CVEducation[];
  skills:       string[];
  certifications: CVCertification[];
  languages:    CVLanguage[];
  extras:       CVExtra[];   // any unrecognised sections

  // Meta
  sectionOrder: string[];    // order sections appeared in original CV
  rawText:      string;
}

// ── Section header aliases ─────────────────────────────────────────────────
const SECTION_MAP: Record<string, string> = {
  // Summary
  'summary': 'summary', 'professional summary': 'summary', 'profile': 'summary',
  'about': 'summary', 'about me': 'summary', 'career objective': 'summary',
  'objective': 'summary', 'personal statement': 'summary', 'overview': 'summary',

  // Experience
  'experience': 'experience', 'work experience': 'experience',
  'professional experience': 'experience', 'employment': 'experience',
  'employment history': 'experience', 'work history': 'experience',
  'career history': 'experience', 'positions held': 'experience',
  'relevant experience': 'experience',

  // Education
  'education': 'education', 'academic background': 'education',
  'educational background': 'education', 'qualifications': 'education',
  'academic qualifications': 'education',

  // Skills
  'skills': 'skills', 'technical skills': 'skills', 'core skills': 'skills',
  'key skills': 'skills', 'competencies': 'skills', 'areas of expertise': 'skills',
  'expertise': 'skills', 'skill set': 'skills', 'skills & competencies': 'skills',
  'hard skills': 'skills', 'soft skills': 'skills', 'tools': 'skills',
  'technologies': 'skills', 'general skills': 'skills',

  // Certifications
  'certifications': 'certifications', 'certificates': 'certifications',
  'professional certifications': 'certifications', 'licenses': 'certifications',
  'certifications and memberships': 'certifications', 'courses': 'certifications',
  'courses & training': 'certifications', 'training': 'certifications',
  'professional development': 'certifications',

  // Languages
  'languages': 'languages', 'language skills': 'languages',

  // Awards
  'awards': 'awards', 'honors': 'awards', 'achievements': 'awards',
  'accomplishments': 'awards', 'recognition': 'awards',

  // Projects
  'projects': 'projects', 'personal projects': 'projects',
  'key projects': 'projects', 'notable projects': 'projects',

  // Volunteer
  'volunteer': 'volunteer', 'volunteering': 'volunteer',
  'community involvement': 'volunteer', 'social work': 'volunteer',

  // Publications
  'publications': 'publications', 'research': 'publications',
  'papers': 'publications',

  // Interests
  'interests': 'interests', 'hobbies': 'interests',
  'personal interests': 'interests',

  // References
  'references': 'references',
};

// ── Detect if a line is a section header ──────────────────────────────────
function detectSectionHeader(line: string): string | null {
  const clean = line.trim()
    .replace(/^[^a-zA-Z]+/, '')  // strip leading symbols
    .replace(/[:\-–—_]+$/, '')   // strip trailing symbols
    .toLowerCase()
    .trim();

  if (!clean || clean.length > 60) return null;

  // Direct match
  if (SECTION_MAP[clean]) return SECTION_MAP[clean];

  // All caps check (e.g. "WORK EXPERIENCE")
  if (line.trim() === line.trim().toUpperCase() && line.trim().length > 2) {
    const lower = line.trim().toLowerCase().replace(/[^a-z\s&]/g, '').trim();
    if (SECTION_MAP[lower]) return SECTION_MAP[lower];
  }

  return null;
}

// ── Extract contact info from header block ────────────────────────────────
function extractContact(lines: string[]): Partial<ParsedCV> {
  const text = lines.join(' ');
  const result: Partial<ParsedCV> = { email: '', phone: '', linkedin: '', website: '', github: '' };

  const emailM = text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  if (emailM) result.email = emailM[0];

  const phoneM = text.match(/(\+?[\d][\d\s\-().]{6,}[\d])/);
  if (phoneM) result.phone = phoneM[0].trim();

  const liM = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (liM) result.linkedin = 'https://' + liM[0];

  const ghM = text.match(/github\.com\/[\w-]+/i);
  if (ghM) result.github = 'https://' + ghM[0];

  const webM = text.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,})(?!.*linkedin|.*github)/i);
  if (webM && !webM[0].includes('@')) result.website = webM[0];

  return result;
}

// ── Parse experience block into structured entries ────────────────────────
function parseExperienceBlock(text: string): CVExperience[] {
  const entries: CVExperience[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let current: CVExperience | null = null;
  const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\d{4})/i;
  const bulletPattern = /^[•\-\*▪●◦➢►→]\s+/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = bulletPattern.test(line);
    const hasDate = datePattern.test(line);
    const isShort = line.length < 80;

    if (isBullet && current) {
      current.bullets.push(line.replace(bulletPattern, '').trim());
      continue;
    }

    // Date line
    if (hasDate && isShort && current && !isBullet) {
      if (!current.dates) {
        current.dates = line;
      } else {
        current.location = line;
      }
      continue;
    }

    // New role — short non-bullet line that isn't a date
    if (!isBullet && isShort && !hasDate) {
      // If next line looks like a company (short, title case, no bullets)
      const nextLine = lines[i + 1] || '';
      const looksLikeRole = line.split(' ').length <= 8 && !datePattern.test(line);

      if (looksLikeRole) {
        if (current) entries.push(current);
        current = { role: line, company: '', dates: '', location: '', bullets: [] };
        if (nextLine && !bulletPattern.test(nextLine) && !datePattern.test(nextLine) && nextLine.length < 60) {
          current.company = nextLine;
          i++; // skip company line
        }
        continue;
      }
    }

    // Continuation bullet (starts with spaces)
    if (current && current.bullets.length > 0 && line.startsWith('  ')) {
      current.bullets[current.bullets.length - 1] += ' ' + line.trim();
      continue;
    }

    // Default: add to bullets if we have a current entry
    if (current) {
      current.bullets.push(line);
    }
  }

  if (current) entries.push(current);
  return entries.filter(e => e.role);
}

// ── Parse education block ─────────────────────────────────────────────────
function parseEducationBlock(text: string): CVEducation[] {
  const entries: CVEducation[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const datePattern = /\b(\d{4})\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (datePattern.test(line) || line.length < 10) continue;
    const next = lines[i + 1] || '';
    const dateNext = lines[i + 2] || '';
    entries.push({
      degree: line,
      school: next && !datePattern.test(next) ? next : '',
      dates:  datePattern.test(dateNext) ? dateNext : (datePattern.test(next) ? next : ''),
    });
    if (next) i++;
    if (dateNext && datePattern.test(dateNext)) i++;
  }

  return entries;
}

// ── Parse skills block ────────────────────────────────────────────────────
function parseSkillsBlock(text: string): string[] {
  return text
    .split(/[,\n•|\-\/]/)
    .map(s => s.trim().replace(/^[^a-zA-Z]+/, ''))
    .filter(s => s.length > 1 && s.length < 50);
}

// ── Parse certifications block ────────────────────────────────────────────
function parseCertificationsBlock(text: string): CVCertification[] {
  const certs: CVCertification[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const dateM = line.match(/\b(\d{4}|\d{2}\/\d{4}|[A-Z][a-z]+\s\d{4})\b/);
    certs.push({
      name:   line.replace(dateM?.[0] || '', '').replace(/[-–—]$/, '').trim(),
      issuer: '',
      date:   dateM?.[0] || '',
    });
  }
  return certs.filter(c => c.name.length > 3);
}

// ── Parse languages block ─────────────────────────────────────────────────
function parseLanguagesBlock(text: string): CVLanguage[] {
  const langs: CVLanguage[] = [];
  const proficiencyPattern = /(native|bilingual|fluent|professional|working|limited|basic|elementary|full professional|professional working|native or bilingual)/i;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const profM = line.match(proficiencyPattern);
    langs.push({
      language:    line.replace(proficiencyPattern, '').replace(/[-–—:]/g, '').trim(),
      proficiency: profM?.[0] || '',
    });
  }
  return langs.filter(l => l.language.length > 1);
}

// ── MAIN PARSER ───────────────────────────────────────────────────────────
export function parseCV(rawText: string): ParsedCV {
  const lines = rawText.split('\n');
  const result: ParsedCV = {
    name: '', headline: '', email: '', phone: '', location: '',
    linkedin: '', website: '', github: '',
    summary: '', experience: [], education: [], skills: [],
    certifications: [], languages: [], extras: [],
    sectionOrder: [], rawText,
  };

  // ── Step 1: Find section boundaries ──
  interface Section { key: string; label: string; startLine: number; }
  const sections: Section[] = [];

  for (let i = 0; i < lines.length; i++) {
    const key = detectSectionHeader(lines[i]);
    if (key) {
      sections.push({ key, label: lines[i].trim(), startLine: i });
    }
  }

  // ── Step 2: Extract header (everything before first section) ──
  const headerEnd = sections.length > 0 ? sections[0].startLine : Math.min(10, lines.length);
  const headerLines = lines.slice(0, headerEnd).filter(l => l.trim());

  if (headerLines.length > 0) {
    result.name = headerLines[0].trim();
    if (headerLines.length > 1 && headerLines[1].trim().length < 80) {
      result.headline = headerLines[1].trim();
    }
  }

  const contact = extractContact(headerLines);
  Object.assign(result, contact);

  // Extract location from header
  const locM = headerLines.join(' ').match(/\b([A-Z][a-z]+(?:[\s,]+[A-Z]{2,})?(?:,\s*[A-Z][a-z]+)?)\b(?=.*(?:UAE|UK|US|Canada|Australia|Pakistan|India)|\s*$)/);
  if (!result.location) {
    const cityM = headerLines.join('\n').match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?,?\s*(?:[A-Z]{2,}|[A-Z][a-z]+))/);
    if (cityM) result.location = cityM[0].trim();
  }

  // ── Step 3: Extract each section's text ──
  const sectionOrder: string[] = [];

  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    const nextSec = sections[si + 1];
    const startLine = sec.startLine + 1;
    const endLine   = nextSec ? nextSec.startLine : lines.length;
    const text      = lines.slice(startLine, endLine).join('\n').trim();

    if (!text) continue;

    // Track unique section order
    if (!sectionOrder.includes(sec.key)) sectionOrder.push(sec.key);

    switch (sec.key) {
      case 'summary':
        result.summary = text.replace(/\n+/g, ' ').trim();
        break;
      case 'experience':
        result.experience.push(...parseExperienceBlock(text));
        break;
      case 'education':
        result.education.push(...parseEducationBlock(text));
        break;
      case 'skills':
        result.skills.push(...parseSkillsBlock(text));
        break;
      case 'certifications':
        result.certifications.push(...parseCertificationsBlock(text));
        break;
      case 'languages':
        result.languages.push(...parseLanguagesBlock(text));
        break;
      default:
        result.extras.push({ heading: sec.label, lines: text.split('\n').filter(Boolean) });
        if (!sectionOrder.includes(sec.key)) sectionOrder.push(sec.key);
    }
  }

  result.sectionOrder = sectionOrder;

  // Deduplicate skills
  result.skills = Array.from(new Set(result.skills.filter(s => s.length > 1)));

  return result;
}

// ── Apply approved changes to parsed CV ───────────────────────────────────
export function applyApprovedChanges(cv: ParsedCV, changes: Array<{
  status: string; original: string; suggested: string;
}>): ParsedCV {
  const approved = changes.filter(c => c.status === 'approved');
  if (!approved.length) return cv;

  // Apply to raw text first
  let updatedText = cv.rawText;
  for (const change of approved) {
    if (change.original && change.suggested) {
      updatedText = updatedText.replace(change.original, change.suggested);
    }
  }

  // Re-parse with updated text
  return parseCV(updatedText);
}
