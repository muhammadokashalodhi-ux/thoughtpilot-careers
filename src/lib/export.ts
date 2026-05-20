import { ExportTemplate } from '@/store/career';

export interface ExportData {
  cvText: string;
  userName: string;
  userEmail?: string;
  template: ExportTemplate;
}

const TEMPLATE_STYLES: Record<ExportTemplate, string> = {
  classic: `
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; margin: 0; padding: 0; }
    .cv-wrapper { max-width: 750px; margin: 0 auto; padding: 40px 50px; }
    h1 { font-size: 22pt; font-weight: bold; text-align: center; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 10pt; color: #444; margin-bottom: 16px; }
    hr { border: none; border-top: 1.5px solid #000; margin: 12px 0; }
    h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0 6px; border-bottom: 0.5px solid #ccc; padding-bottom: 3px; }
    p, li { font-size: 11pt; line-height: 1.5; margin-bottom: 4px; }
    ul { padding-left: 18px; }
    .contact { text-align: center; font-size: 10pt; color: #555; margin-bottom: 8px; }
  `,
  modern: `
    body { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; color: #1a1a2e; margin: 0; padding: 0; }
    .cv-wrapper { max-width: 750px; margin: 0 auto; }
    .header { background: #4f46e5; color: white; padding: 32px 50px 24px; }
    .header h1 { font-size: 24pt; font-weight: 700; margin-bottom: 4px; }
    .header .subtitle { font-size: 12pt; opacity: 0.85; }
    .header .contact { font-size: 10pt; opacity: 0.75; margin-top: 8px; }
    .body { padding: 28px 50px; }
    h2 { font-size: 12pt; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 8px; }
    p, li { font-size: 11pt; line-height: 1.55; margin-bottom: 4px; }
    ul { padding-left: 18px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
  `,
  minimal: `
    body { font-family: 'Georgia', serif; font-size: 11pt; color: #222; margin: 0; padding: 0; background: #fff; }
    .cv-wrapper { max-width: 680px; margin: 0 auto; padding: 60px 50px; }
    h1 { font-size: 28pt; font-weight: normal; letter-spacing: -1px; margin-bottom: 6px; }
    .subtitle { font-size: 12pt; color: #666; margin-bottom: 6px; font-style: italic; }
    .contact { font-size: 10pt; color: #888; margin-bottom: 40px; }
    h2 { font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; color: #999; margin: 32px 0 12px; }
    p, li { font-size: 11pt; line-height: 1.7; margin-bottom: 6px; }
    ul { padding-left: 0; list-style: none; }
    ul li::before { content: "— "; color: #ccc; }
    hr { border: none; border-top: 0.5px solid #eee; margin: 0; }
  `,
  executive: `
    body { font-family: 'Garamond', 'Georgia', serif; font-size: 11pt; color: #1a1a1a; margin: 0; padding: 0; }
    .cv-wrapper { max-width: 750px; margin: 0 auto; }
    .header { background: #1a1a2e; color: #e8e0d0; padding: 40px 50px; }
    .header h1 { font-size: 26pt; font-weight: normal; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
    .header .subtitle { font-size: 12pt; color: #b8a898; letter-spacing: 0.5px; }
    .header .contact { font-size: 10pt; color: #7a6a5a; margin-top: 12px; }
    .accent-bar { height: 3px; background: linear-gradient(90deg, #c9a96e, #e8c98e); }
    .body { padding: 36px 50px; }
    h2 { font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8b7355; margin: 24px 0 10px; }
    p, li { font-size: 11pt; line-height: 1.65; margin-bottom: 5px; }
    ul { padding-left: 18px; }
    hr { border: none; border-top: 0.5px solid #d4c5b0; margin: 8px 0; }
  `,
  compact: `
    body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #1a1a1a; margin: 0; padding: 0; }
    .cv-wrapper { max-width: 750px; margin: 0 auto; padding: 30px 40px; display: grid; grid-template-columns: 200px 1fr; gap: 0; }
    .sidebar { background: #f8f8fa; padding: 24px 18px; border-right: 2px solid #e8e8f0; }
    .main-col { padding: 24px 0 24px 24px; }
    .full-width { grid-column: 1 / -1; }
    h1 { font-size: 18pt; font-weight: bold; color: #1a1a1a; }
    .subtitle { font-size: 10pt; color: #555; margin-bottom: 4px; }
    .contact { font-size: 9pt; color: #666; line-height: 1.8; }
    h2.sidebar-h { font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #7c6ff7; margin: 18px 0 6px; }
    h2.main-h { font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; margin: 16px 0 6px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
    p, li { font-size: 10pt; line-height: 1.45; margin-bottom: 3px; }
    ul { padding-left: 14px; }
  `,
};

function cvTextToHTML(cvText: string, template: ExportTemplate, userName: string): string {
  const lines = cvText.split('\n');
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) { html += '</ul>'; inList = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeList(); html += '<br>'; continue; }

    // Detect heading-like lines (all caps, short, or ending with colon)
    if (line.length < 50 && (line === line.toUpperCase() || line.endsWith(':'))) {
      closeList();
      const tag = template === 'compact' ? 'h2 class="main-h"' : 'h2';
      html += `<${tag}>${line.replace(/:$/, '')}</${tag.split(' ')[0]}>`;
      continue;
    }

    // Bullet-like lines
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.replace(/^[•\-\*]\s*/, '')}</li>`;
      continue;
    }

    closeList();
    html += `<p>${line}</p>`;
  }
  closeList();
  return html;
}

function buildHTMLDocument(data: ExportData): string {
  const { cvText, userName, template } = data;
  const style = TEMPLATE_STYLES[template];
  const bodyContent = cvTextToHTML(cvText, template, userName);

  const isHeaderTemplate = ['modern', 'executive'].includes(template);
  const isCompact = template === 'compact';

  let innerHTML: string;
  if (isHeaderTemplate) {
    innerHTML = `<div class="header"><h1>${userName}</h1><div class="subtitle">Professional CV</div></div>${template === 'executive' ? '<div class="accent-bar"></div>' : ''}<div class="body">${bodyContent}</div>`;
  } else if (isCompact) {
    innerHTML = `<div class="sidebar"><h1>${userName}</h1><div class="subtitle">Professional CV</div></div><div class="main-col">${bodyContent}</div>`;
  } else {
    innerHTML = `<h1>${userName}</h1>${bodyContent}`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${userName} — CV</title>
<style>
  ${style}
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
<div class="cv-wrapper">${innerHTML}</div>
</body>
</html>`;
}

export function exportAsPDF(data: ExportData): void {
  const html = buildHTMLDocument(data);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}

export function exportAsWord(data: ExportData): void {
  const { cvText, userName } = data;

  // Generate RTF content
  const rtfLines = cvText.split('\n').map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '\\par';
    if (trimmed.length < 50 && trimmed === trimmed.toUpperCase()) {
      return `\\pard\\b ${trimmed}\\b0\\par`;
    }
    return `\\pard ${trimmed}\\par`;
  });

  const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}{\\f1 Arial;}}
{\\colortbl ;\\red0\\green0\\blue0;}
\\f0\\fs22
\\pard\\qc\\b\\fs28 ${userName}\\b0\\par
\\pard\\par
${rtfLines.join('\n')}
}`;

  const blob = new Blob([rtf], { type: 'application/rtf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${userName.replace(/\s+/g, '_')}_CV.rtf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCoverLetter(coverLetter: string, userName: string): void {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Cover Letter — ${userName}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; max-width: 680px; margin: 60px auto; padding: 0 40px; line-height: 1.8; }
  p { margin-bottom: 16px; }
  @media print { @page { margin: 2cm; } body { margin: 0; } }
</style>
</head>
<body>
${coverLetter.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}
