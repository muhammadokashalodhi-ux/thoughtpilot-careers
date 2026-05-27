// src/lib/export.ts
// CV export — PDF via iframe print, Word via RTF download
// Uses structured templates from templates.ts

import { ParsedCV, parseCV, applyApprovedChanges } from './cvParser';
import { renderTemplate, TemplateId } from './templates';

// ── Get final CV with approved changes applied ────────────────────────────
export function getFinalCV(
  rawCvText: string,
  changes: Array<{ status: string; original: string; suggested: string }>
): ParsedCV {
  const parsed = parseCV(rawCvText);
  return applyApprovedChanges(parsed, changes);
}

// ── Export as PDF via iframe print ────────────────────────────────────────
export function exportAsPDF(html: string, filename = 'cv.pdf'): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  // Wait for fonts/styles to load then print
  const tryPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }
  };

  // Give fonts time to load
  setTimeout(tryPrint, 800);
}

// ── Export as Word (.rtf) ─────────────────────────────────────────────────
export function exportAsWord(cv: ParsedCV, filename = 'cv.rtf'): void {
  const bold   = (s: string) => `\\b ${s}\\b0`;
  const italic = (s: string) => `\\i ${s}\\i0`;
  const section = (title: string) => `\\pard\\sb240\\sa60\\b\\fs22 ${title.toUpperCase()}\\b0\\fs20\\par\\pard\\sb0\\sa0\\brdrb\\brdrs\\brdrw10\\brsp20\\par`;

  const lines: string[] = [
    '{\\rtf1\\ansi\\deff0',
    '{\\fonttbl{\\f0\\froman\\fcharset0 Calibri;}{\\f1\\froman\\fcharset0 Times New Roman;}}',
    '{\\colortbl;\\red26\\green39\\blue68;\\red45\\blue150\\green100;}',
    '\\widowctrl\\hyphauto',
    `\\pard\\sa200\\b\\fs32 ${cv.name}\\b0\\par`,
    `\\pard\\sa60\\fs20\\cf2 ${cv.headline}\\cf0\\par`,
    '',
    cv.email    ? `\\pard\\sa40\\fs18 Email: ${cv.email}\\par` : '',
    cv.phone    ? `\\pard\\sa40\\fs18 Phone: ${cv.phone}\\par` : '',
    cv.location ? `\\pard\\sa40\\fs18 Location: ${cv.location}\\par` : '',
    cv.linkedin ? `\\pard\\sa40\\fs18 LinkedIn: ${cv.linkedin}\\par` : '',
    '',
    cv.summary ? `${section('Professional Summary')}\\pard\\sa160\\fs20 ${cv.summary}\\par` : '',
    '',
  ];

  if (cv.experience.length) {
    lines.push(section('Work Experience'));
    for (const exp of cv.experience) {
      lines.push(`\\pard\\sa60\\b\\fs21 ${exp.role}\\b0\\par`);
      lines.push(`\\pard\\sa40\\fs20 ${exp.company}  ${italic(exp.dates)}${exp.location ? `  ${exp.location}` : ''}\\par`);
      for (const b of exp.bullets) {
        lines.push(`\\pard\\li360\\fi-180\\sa40\\fs19 \\bullet  ${b}\\par`);
      }
      lines.push('\\pard\\sa120\\par');
    }
  }

  if (cv.education.length) {
    lines.push(section('Education'));
    for (const edu of cv.education) {
      lines.push(`\\pard\\sa60\\b\\fs21 ${edu.degree}\\b0\\par`);
      if (edu.school) lines.push(`\\pard\\sa40\\fs20 ${edu.school}  ${italic(edu.dates)}\\par`);
      lines.push('\\pard\\sa80\\par');
    }
  }

  if (cv.skills.length) {
    lines.push(section('Skills'));
    lines.push(`\\pard\\sa120\\fs20 ${cv.skills.join(', ')}\\par`);
  }

  if (cv.certifications.length) {
    lines.push(section('Certifications'));
    for (const cert of cv.certifications) {
      lines.push(`\\pard\\li360\\fi-180\\sa40\\fs19 \\bullet  ${cert.name}${cert.date ? `  ${italic(cert.date)}` : ''}\\par`);
    }
  }

  if (cv.languages.length) {
    lines.push(section('Languages'));
    lines.push(`\\pard\\sa120\\fs20 ${cv.languages.map(l => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(', ')}\\par`);
  }

  for (const extra of cv.extras) {
    lines.push(section(extra.heading));
    for (const line of extra.lines) {
      lines.push(`\\pard\\li360\\fi-180\\sa40\\fs19 \\bullet  ${line}\\par`);
    }
  }

  lines.push('}');

  const rtf = lines.filter(Boolean).join('\n');
  const blob = new Blob([rtf], { type: 'application/rtf' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename.replace('.pdf', '.rtf').replace('.docx', '.rtf');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Main export function ──────────────────────────────────────────────────
export function exportCV(
  rawCvText: string,
  changes: Array<{ status: string; original: string; suggested: string }>,
  templateId: TemplateId,
  format: 'pdf' | 'word',
  userName = 'cv',
): void {
  const finalCV  = getFinalCV(rawCvText, changes);
  const filename = `${userName.toLowerCase().replace(/\s+/g, '-')}-cv`;

  if (format === 'pdf') {
    const html = renderTemplate(templateId, finalCV);
    exportAsPDF(html, `${filename}.pdf`);
  } else {
    exportAsWord(finalCV, `${filename}.rtf`);
  }
}
