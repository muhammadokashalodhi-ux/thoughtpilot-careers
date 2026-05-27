// src/lib/templates.ts
// 5 professional CV templates — pure HTML/CSS, print-optimised
// Each template: (cv: ParsedCV) => string (complete HTML document)

import { ParsedCV } from './cvParser';

// ── Shared helpers ────────────────────────────────────────────────────────
const esc = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const bullet = (b: string) => `<li>${esc(b)}</li>`;
const bullets = (bs: string[]) => bs.length
  ? `<ul>${bs.map(bullet).join('')}</ul>` : '';

const expBlock = (exp: ParsedCV['experience'][0], accentColor: string) => `
  <div class="exp-block">
    <div class="exp-header">
      <div>
        <div class="exp-role">${esc(exp.role)}</div>
        <div class="exp-company">${esc(exp.company)}</div>
      </div>
      <div class="exp-meta">
        <div class="exp-dates" style="color:${accentColor}">${esc(exp.dates)}</div>
        ${exp.location ? `<div class="exp-location">${esc(exp.location)}</div>` : ''}
      </div>
    </div>
    ${bullets(exp.bullets)}
  </div>`;

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — Classic Navy
// Two-column: dark navy sidebar left, white main right
// Inspired by Catherine Barnett template
// ════════════════════════════════════════════════════════════════════════════
export function templateClassicNavy(cv: ParsedCV): string {
  const accent = '#2dd4a0'; // teal
  const navy   = '#1a2744';

  const sidebarSkills = cv.skills.slice(0, 20);
  const langs = cv.languages.map(l =>
    `<div class="lang-item"><div class="lang-name">${esc(l.language)}</div>
     <div class="lang-prof">${esc(l.proficiency)}</div></div>`
  ).join('');

  const certs = cv.certifications.map(c =>
    `<div class="cert-item"><div>${esc(c.name)}</div>${c.date ? `<div class="cert-date">${esc(c.date)}</div>` : ''}</div>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700&family=Open+Sans:wght@300;400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Open Sans',sans-serif;font-size:9pt;line-height:1.5;color:#333;background:#fff}
  .wrapper{display:grid;grid-template-columns:200px 1fr;min-height:297mm;width:210mm}
  .sidebar{background:${navy};color:#fff;padding:24px 16px;display:flex;flex-direction:column;gap:20px}
  .main{padding:28px 28px;background:#fff}

  /* Sidebar */
  .sidebar-name{font-family:'Raleway',sans-serif;font-size:16pt;font-weight:700;line-height:1.2;color:#fff;margin-bottom:4px}
  .sidebar-headline{font-size:8pt;color:${accent};font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
  .contact-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:8pt;color:rgba(255,255,255,0.8)}
  .contact-icon{color:${accent};flex-shrink:0;margin-top:1px}
  .sidebar-section-title{font-family:'Raleway',sans-serif;font-weight:700;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:${accent};border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:4px;margin-bottom:10px}
  .skill-item{font-size:8pt;color:rgba(255,255,255,0.85);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
  .lang-item{margin-bottom:8px}
  .lang-name{font-size:8.5pt;color:#fff;font-weight:600}
  .lang-prof{font-size:7.5pt;color:${accent};font-style:italic}
  .cert-item{margin-bottom:8px;font-size:7.5pt;color:rgba(255,255,255,0.85)}
  .cert-date{color:${accent};font-size:7pt}

  /* Main */
  .main-name{display:none}
  .section-title{font-family:'Raleway',sans-serif;font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${navy};display:flex;align-items:center;gap:8px;margin:20px 0 10px}
  .section-title::after{content:'';flex:1;height:1px;background:${accent}}
  .summary{font-size:8.5pt;line-height:1.7;color:#444;margin-bottom:4px}
  .exp-block{margin-bottom:14px}
  .exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
  .exp-role{font-weight:700;font-size:9.5pt;color:${navy}}
  .exp-company{font-size:8.5pt;color:#555}
  .exp-dates{font-size:8pt;font-weight:600;text-align:right}
  .exp-location{font-size:7.5pt;color:#888;text-align:right}
  .exp-meta{text-align:right;flex-shrink:0;margin-left:8px}
  ul{padding-left:14px;margin-top:4px}
  li{font-size:8.5pt;color:#444;margin-bottom:3px;line-height:1.5}
  .edu-block{margin-bottom:10px}
  .edu-degree{font-weight:700;font-size:9pt;color:${navy}}
  .edu-school{font-size:8.5pt;color:#555}
  .edu-dates{font-size:8pt;color:${accent}}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.wrapper{width:210mm}}
</style></head><body>
<div class="wrapper">
  <div class="sidebar">
    <div>
      <div class="sidebar-name">${esc(cv.name)}</div>
      <div class="sidebar-headline">${esc(cv.headline)}</div>
      ${cv.email    ? `<div class="contact-item"><span class="contact-icon">✉</span>${esc(cv.email)}</div>` : ''}
      ${cv.phone    ? `<div class="contact-item"><span class="contact-icon">☏</span>${esc(cv.phone)}</div>` : ''}
      ${cv.location ? `<div class="contact-item"><span class="contact-icon">◎</span>${esc(cv.location)}</div>` : ''}
      ${cv.linkedin ? `<div class="contact-item"><span class="contact-icon">in</span>${esc(cv.linkedin.replace('https://',''))}</div>` : ''}
      ${cv.website  ? `<div class="contact-item"><span class="contact-icon">⊕</span>${esc(cv.website)}</div>` : ''}
    </div>
    ${sidebarSkills.length ? `<div>
      <div class="sidebar-section-title">Skills</div>
      ${sidebarSkills.map(s => `<div class="skill-item">${esc(s)}</div>`).join('')}
    </div>` : ''}
    ${cv.languages.length ? `<div>
      <div class="sidebar-section-title">Languages</div>
      ${langs}
    </div>` : ''}
    ${cv.certifications.length ? `<div>
      <div class="sidebar-section-title">Certifications</div>
      ${certs}
    </div>` : ''}
  </div>

  <div class="main">
    ${cv.summary ? `<div class="summary">${esc(cv.summary)}</div>` : ''}
    ${cv.experience.length ? `
      <div class="section-title">Work Experience</div>
      ${cv.experience.map(e => expBlock(e, accent)).join('')}
    ` : ''}
    ${cv.education.length ? `
      <div class="section-title">Education</div>
      ${cv.education.map(e => `
        <div class="edu-block">
          <div class="edu-degree">${esc(e.degree)}</div>
          <div class="edu-school">${esc(e.school)}</div>
          <div class="edu-dates">${esc(e.dates)}</div>
        </div>
      `).join('')}
    ` : ''}
    ${cv.extras.map(ex => `
      <div class="section-title">${esc(ex.heading)}</div>
      ${ex.lines.map(l => `<div style="font-size:8.5pt;margin-bottom:4px">${esc(l)}</div>`).join('')}
    `).join('')}
  </div>
</div>
</body></html>`;
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Executive Red
// Single column, diamond section icons, skills as pills
// ════════════════════════════════════════════════════════════════════════════
export function templateExecutiveRed(cv: ParsedCV): string {
  const accent = '#c0392b';
  const pillSkills = cv.skills.map(s =>
    `<span class="skill-pill">${esc(s)}</span>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Source+Sans+3:wght@300;400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Source Sans 3',sans-serif;font-size:9pt;color:#2c2c2c;background:#fff;padding:20mm 18mm;width:210mm}
  h1{font-family:'Montserrat',sans-serif;font-size:24pt;font-weight:800;color:#1a1a1a;letter-spacing:-1px}
  .headline{font-size:10pt;color:${accent};font-weight:600;margin-top:2px;margin-bottom:10px}
  .contact-row{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:4px;padding:10px 0;border-top:2px solid ${accent};border-bottom:2px solid #eee}
  .contact-item{font-size:8pt;color:#555;display:flex;align-items:center;gap:5px}
  .section-title{display:flex;align-items:center;gap:10px;margin:20px 0 10px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:9pt;text-transform:uppercase;letter-spacing:2px;color:#1a1a1a}
  .section-title::before{content:'◆';color:${accent};font-size:8pt}
  .section-title::after{content:'';flex:1;height:1px;background:#ddd;margin-left:8px}
  .summary{font-size:9pt;line-height:1.7;color:#444;margin-bottom:4px}
  .exp-block{margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0f0f0}
  .exp-block:last-child{border-bottom:none}
  .exp-header{display:flex;justify-content:space-between;align-items:flex-start}
  .exp-role{font-family:'Montserrat',sans-serif;font-weight:700;font-size:10pt;color:#1a1a1a}
  .exp-company{font-size:8.5pt;color:#666;margin-top:1px}
  .exp-dates{font-size:8pt;color:${accent};font-weight:600;text-align:right}
  .exp-location{font-size:7.5pt;color:#999;text-align:right}
  .exp-meta{text-align:right;flex-shrink:0;margin-left:8px}
  ul{list-style:none;padding:0;margin-top:6px}
  li{font-size:8.5pt;color:#444;margin-bottom:4px;padding-left:14px;position:relative;line-height:1.55}
  li::before{content:'○';position:absolute;left:0;color:${accent};font-size:7pt;top:2px}
  .skill-pill{display:inline-block;padding:3px 10px;background:#f5f5f5;border:1px solid #ddd;border-radius:3px;font-size:8pt;margin:3px 3px 3px 0;color:#333}
  .edu-block{margin-bottom:10px}
  .edu-degree{font-weight:600;font-size:9.5pt}
  .edu-school{font-size:8.5pt;color:#666}
  .edu-dates{font-size:8pt;color:${accent};font-style:italic}
  .cert-item{font-size:8.5pt;margin-bottom:5px;color:#444;padding-left:14px;position:relative}
  .cert-item::before{content:'◆';position:absolute;left:0;color:${accent};font-size:7pt;top:2px}
  .lang-row{display:flex;flex-wrap:wrap;gap:16px}
  .lang-item{font-size:8.5pt}.lang-name{font-weight:600}
  .lang-prof{font-size:7.5pt;color:#888;font-style:italic}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;width:210mm}}
</style></head><body>
  <h1>${esc(cv.name)}</h1>
  <div class="headline">${esc(cv.headline)}</div>
  <div class="contact-row">
    ${cv.email    ? `<span class="contact-item">✉ ${esc(cv.email)}</span>` : ''}
    ${cv.phone    ? `<span class="contact-item">☏ ${esc(cv.phone)}</span>` : ''}
    ${cv.location ? `<span class="contact-item">◎ ${esc(cv.location)}</span>` : ''}
    ${cv.linkedin ? `<span class="contact-item">in ${esc(cv.linkedin.replace('https://',''))}</span>` : ''}
    ${cv.website  ? `<span class="contact-item">⊕ ${esc(cv.website)}</span>` : ''}
  </div>
  ${cv.summary ? `<div class="summary" style="margin-top:14px">${esc(cv.summary)}</div>` : ''}
  ${cv.skills.length ? `<div class="section-title">Areas of Expertise</div><div>${pillSkills}</div>` : ''}
  ${cv.experience.length ? `<div class="section-title">Work Experience</div>${cv.experience.map(e => expBlock(e, accent)).join('')}` : ''}
  ${cv.education.length ? `<div class="section-title">Education</div>${cv.education.map(e => `
    <div class="edu-block">
      <div class="edu-degree">${esc(e.degree)}</div>
      <div class="edu-school">${esc(e.school)}</div>
      <div class="edu-dates">${esc(e.dates)}</div>
    </div>`).join('')}` : ''}
  ${cv.certifications.length ? `<div class="section-title">Certifications</div>${cv.certifications.map(c => `
    <div class="cert-item">${esc(c.name)}${c.date ? ` <span style="color:#999;font-size:7.5pt">${esc(c.date)}</span>` : ''}</div>`).join('')}` : ''}
  ${cv.languages.length ? `<div class="section-title">Languages</div><div class="lang-row">${cv.languages.map(l => `
    <div class="lang-item"><div class="lang-name">${esc(l.language)}</div><div class="lang-prof">${esc(l.proficiency)}</div></div>`).join('')}</div>` : ''}
  ${cv.extras.map(ex => `<div class="section-title">${esc(ex.heading)}</div>${ex.lines.map(l => `<div class="cert-item">${esc(l)}</div>`).join('')}`).join('')}
</body></html>`;
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — Modern Teal
// Large teal header, two-column body
// ════════════════════════════════════════════════════════════════════════════
export function templateModernTeal(cv: ParsedCV): string {
  const accent  = '#0d7377';
  const accent2 = '#14a085';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Nunito',sans-serif;font-size:9pt;color:#2c2c2c;background:#fff;width:210mm}
  .header{background:${accent};color:#fff;padding:24px 28px 20px}
  .header-name{font-size:22pt;font-weight:800;letter-spacing:-0.5px}
  .header-headline{font-size:9.5pt;color:rgba(255,255,255,0.8);margin-top:2px;margin-bottom:12px}
  .header-summary{font-size:8.5pt;line-height:1.65;color:rgba(255,255,255,0.9);max-width:600px}
  .contact-bar{background:#0a5c60;padding:8px 28px;display:flex;flex-wrap:wrap;gap:20px}
  .contact-item{font-size:7.5pt;color:rgba(255,255,255,0.85);display:flex;align-items:center;gap:5px}
  .body{display:grid;grid-template-columns:1fr 200px;gap:0;padding:0}
  .main-col{padding:20px 20px 20px 28px}
  .side-col{background:#f8fafb;padding:20px 16px;border-left:1px solid #e8edf0}
  .section-title{font-size:8.5pt;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:${accent};border-bottom:2px solid ${accent};padding-bottom:4px;margin:16px 0 10px;display:flex;align-items:center;gap:7px}
  .section-icon{width:18px;height:18px;background:${accent};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9pt;color:#fff;flex-shrink:0}
  .exp-block{margin-bottom:14px}
  .exp-header{display:flex;justify-content:space-between}
  .exp-role{font-weight:700;font-size:9.5pt;color:#1a1a1a}
  .exp-company{font-size:8.5pt;color:#555}
  .exp-dates{font-size:8pt;color:${accent2};font-weight:600;text-align:right}
  .exp-location{font-size:7.5pt;color:#999;text-align:right}
  .exp-meta{text-align:right;flex-shrink:0;margin-left:8px}
  ul{padding-left:14px;margin-top:4px}
  li{font-size:8pt;margin-bottom:3px;line-height:1.5;color:#444}
  .skill-item{font-size:8pt;padding:3px 0;border-bottom:1px solid #eee;color:#333}
  .edu-block{margin-bottom:10px}
  .edu-degree{font-weight:700;font-size:8.5pt;color:#1a1a1a}
  .edu-school{font-size:8pt;color:#555}
  .edu-dates{font-size:7.5pt;color:${accent2};font-style:italic}
  .cert-item{font-size:7.5pt;margin-bottom:6px;color:#444}
  .cert-name{font-weight:600}
  .cert-date{color:${accent2}}
  .lang-item{margin-bottom:7px}
  .lang-name{font-size:8.5pt;font-weight:700;color:#1a1a1a}
  .lang-prof{font-size:7.5pt;color:#888;font-style:italic}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;width:210mm}}
</style></head><body>
  <div class="header">
    <div class="header-name">${esc(cv.name)}</div>
    <div class="header-headline">${esc(cv.headline)}</div>
    ${cv.summary ? `<div class="header-summary">${esc(cv.summary)}</div>` : ''}
  </div>
  <div class="contact-bar">
    ${cv.email    ? `<span class="contact-item">✉ ${esc(cv.email)}</span>` : ''}
    ${cv.phone    ? `<span class="contact-item">☏ ${esc(cv.phone)}</span>` : ''}
    ${cv.location ? `<span class="contact-item">◎ ${esc(cv.location)}</span>` : ''}
    ${cv.linkedin ? `<span class="contact-item">in ${esc(cv.linkedin.replace('https://',''))}</span>` : ''}
    ${cv.website  ? `<span class="contact-item">⊕ ${esc(cv.website)}</span>` : ''}
  </div>
  <div class="body">
    <div class="main-col">
      ${cv.experience.length ? `<div class="section-title"><span class="section-icon">💼</span>Work Experience</div>${cv.experience.map(e => expBlock(e, accent2)).join('')}` : ''}
      ${cv.extras.map(ex => `<div class="section-title">${esc(ex.heading)}</div>${ex.lines.map(l => `<div style="font-size:8pt;margin-bottom:4px;color:#444">${esc(l)}</div>`).join('')}`).join('')}
    </div>
    <div class="side-col">
      ${cv.skills.length ? `<div class="section-title"><span class="section-icon">⚡</span>Skills</div>${cv.skills.map(s => `<div class="skill-item">${esc(s)}</div>`).join('')}` : ''}
      ${cv.education.length ? `<div class="section-title"><span class="section-icon">🎓</span>Education</div>${cv.education.map(e => `
        <div class="edu-block">
          <div class="edu-degree">${esc(e.degree)}</div>
          <div class="edu-school">${esc(e.school)}</div>
          <div class="edu-dates">${esc(e.dates)}</div>
        </div>`).join('')}` : ''}
      ${cv.certifications.length ? `<div class="section-title"><span class="section-icon">🏆</span>Certifications</div>${cv.certifications.map(c => `
        <div class="cert-item"><div class="cert-name">${esc(c.name)}</div>${c.date ? `<div class="cert-date">${esc(c.date)}</div>` : ''}</div>`).join('')}` : ''}
      ${cv.languages.length ? `<div class="section-title"><span class="section-icon">🌐</span>Languages</div>${cv.languages.map(l => `
        <div class="lang-item"><div class="lang-name">${esc(l.language)}</div><div class="lang-prof">${esc(l.proficiency)}</div></div>`).join('')}` : ''}
    </div>
  </div>
</body></html>`;
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — Minimal Dark
// Dark header block, two-column body, authoritative executive feel
// ════════════════════════════════════════════════════════════════════════════
export function templateMinimalDark(cv: ParsedCV): string {
  const accent = '#c9a84c'; // gold

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Jost',sans-serif;font-size:9pt;color:#1a1a1a;background:#fff;width:210mm}
  .header{background:#1c2333;padding:28px 28px 20px;display:flex;align-items:flex-start;justify-content:space-between}
  .header-left{}
  .header-name{font-family:'Cormorant Garamond',serif;font-size:26pt;font-weight:700;color:#fff;letter-spacing:-0.5px;line-height:1.1}
  .header-headline{font-size:9pt;color:${accent};font-weight:500;margin-top:4px;text-transform:uppercase;letter-spacing:2px}
  .header-summary{font-size:8pt;color:rgba(255,255,255,0.75);line-height:1.65;margin-top:10px;max-width:380px}
  .contact-box{background:#141b2d;padding:14px;border-radius:2px;min-width:180px;margin-left:20px}
  .contact-item{font-size:7.5pt;color:rgba(255,255,255,0.8);margin-bottom:5px;display:flex;gap:8px;align-items:flex-start}
  .contact-label{color:${accent};font-size:7pt;text-transform:uppercase;letter-spacing:1px;flex-shrink:0;min-width:24px;padding-top:1px}
  .body{display:grid;grid-template-columns:1fr 200px;padding:20px 28px;gap:24px}
  .section-title{font-family:'Cormorant Garamond',serif;font-size:11pt;font-weight:700;color:#1c2333;margin:18px 0 10px;padding-bottom:4px;border-bottom:2px solid ${accent}}
  .exp-block{margin-bottom:14px}
  .exp-header{display:flex;justify-content:space-between}
  .exp-role{font-weight:600;font-size:9.5pt;color:#1c2333}
  .exp-company{font-size:8.5pt;color:#666}
  .exp-dates{font-size:8pt;color:${accent};font-weight:500;text-align:right}
  .exp-location{font-size:7.5pt;color:#999;text-align:right}
  .exp-meta{text-align:right;flex-shrink:0;margin-left:8px}
  ul{padding-left:14px;margin-top:4px}
  li{font-size:8pt;margin-bottom:3px;color:#444;line-height:1.55}
  .side-section-title{font-family:'Cormorant Garamond',serif;font-size:10pt;font-weight:700;color:#1c2333;margin:16px 0 8px;padding-bottom:3px;border-bottom:1px solid ${accent}}
  .skill-item{font-size:8pt;padding:2px 0;border-bottom:1px solid #f0f0f0;color:#333}
  .edu-block{margin-bottom:10px}
  .edu-degree{font-weight:600;font-size:9pt}
  .edu-school{font-size:8pt;color:#555}
  .edu-dates{font-size:7.5pt;color:${accent}}
  .cert-item{font-size:7.5pt;margin-bottom:6px;border-bottom:1px solid #f5f5f5;padding-bottom:5px}
  .lang-name{font-weight:600;font-size:8.5pt}
  .lang-prof{font-size:7.5pt;color:#888;font-style:italic}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;width:210mm}}
</style></head><body>
  <div class="header">
    <div class="header-left">
      <div class="header-name">${esc(cv.name)}</div>
      <div class="header-headline">${esc(cv.headline)}</div>
      ${cv.summary ? `<div class="header-summary">${esc(cv.summary)}</div>` : ''}
    </div>
    <div class="contact-box">
      ${cv.email    ? `<div class="contact-item"><span class="contact-label">✉</span>${esc(cv.email)}</div>` : ''}
      ${cv.phone    ? `<div class="contact-item"><span class="contact-label">☏</span>${esc(cv.phone)}</div>` : ''}
      ${cv.location ? `<div class="contact-item"><span class="contact-label">◎</span>${esc(cv.location)}</div>` : ''}
      ${cv.linkedin ? `<div class="contact-item"><span class="contact-label">in</span>${esc(cv.linkedin.replace('https://',''))}</div>` : ''}
      ${cv.website  ? `<div class="contact-item"><span class="contact-label">⊕</span>${esc(cv.website)}</div>` : ''}
    </div>
  </div>
  <div class="body">
    <div>
      ${cv.experience.length ? `<div class="section-title">Work Experience</div>${cv.experience.map(e => expBlock(e, accent)).join('')}` : ''}
      ${cv.extras.map(ex => `<div class="section-title">${esc(ex.heading)}</div>${ex.lines.map(l => `<div style="font-size:8.5pt;margin-bottom:4px">${esc(l)}</div>`).join('')}`).join('')}
    </div>
    <div>
      ${cv.skills.length ? `<div class="side-section-title">General Skills</div>${cv.skills.slice(0,16).map(s => `<div class="skill-item">${esc(s)}</div>`).join('')}` : ''}
      ${cv.education.length ? `<div class="side-section-title">Education</div>${cv.education.map(e => `
        <div class="edu-block"><div class="edu-degree">${esc(e.degree)}</div><div class="edu-school">${esc(e.school)}</div><div class="edu-dates">${esc(e.dates)}</div></div>`).join('')}` : ''}
      ${cv.certifications.length ? `<div class="side-section-title">Certifications</div>${cv.certifications.map(c => `
        <div class="cert-item"><strong>${esc(c.name)}</strong>${c.date ? `<div style="color:${accent};font-size:7.5pt">${esc(c.date)}</div>` : ''}</div>`).join('')}` : ''}
      ${cv.languages.length ? `<div class="side-section-title">Languages</div>${cv.languages.map(l => `
        <div style="margin-bottom:8px"><div class="lang-name">${esc(l.language)}</div><div class="lang-prof">${esc(l.proficiency)}</div></div>`).join('')}` : ''}
    </div>
  </div>
</body></html>`;
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5 — Tech Sidebar
// Dark right sidebar, left main, coral/red accent bullets — skills-forward
// ════════════════════════════════════════════════════════════════════════════
export function templateTechSidebar(cv: ParsedCV): string {
  const accent  = '#e74c3c'; // coral red
  const dark    = '#1a2744';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'IBM Plex Sans',sans-serif;font-size:9pt;color:#1a1a1a;background:#fff;width:210mm;display:grid;grid-template-columns:1fr 195px;min-height:297mm}
  .main{padding:24px 22px 24px 26px}
  .sidebar{background:${dark};padding:24px 16px;color:#fff;display:flex;flex-direction:column;gap:18px}

  /* Main */
  .main-header{margin-bottom:18px}
  .main-name{font-size:22pt;font-weight:700;color:${dark};letter-spacing:-0.5px}
  .main-headline{font-size:9.5pt;color:${accent};font-weight:600;margin-top:2px;margin-bottom:10px}
  .main-summary{font-size:8.5pt;line-height:1.65;color:#555;padding:10px 14px;border-left:3px solid ${accent};background:#fef9f9}
  .section-title{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${dark};margin:18px 0 8px;display:flex;align-items:center;gap:8px}
  .section-title::before{content:'';width:14px;height:2px;background:${accent}}
  .section-title::after{content:'';flex:1;height:1px;background:#e0e0e0;margin-left:4px}
  .exp-block{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #f0f0f0}
  .exp-block:last-child{border-bottom:none}
  .exp-header{display:flex;justify-content:space-between}
  .exp-role{font-weight:600;font-size:9.5pt;color:${dark}}
  .exp-company{font-size:8.5pt;color:#666;display:flex;align-items:center;gap:6px}
  .exp-dates{font-size:8pt;color:${accent};font-weight:500;text-align:right}
  .exp-location{font-size:7.5pt;color:#999;text-align:right}
  .exp-meta{text-align:right;flex-shrink:0;margin-left:8px}
  ul{list-style:none;padding:0;margin-top:5px}
  li{font-size:8pt;margin-bottom:4px;padding-left:12px;position:relative;line-height:1.5;color:#333}
  li::before{content:'■';position:absolute;left:0;color:${accent};font-size:5pt;top:3px}
  .edu-block{margin-bottom:10px}
  .edu-degree{font-weight:600;font-size:9pt;color:${dark}}
  .edu-school{font-size:8.5pt;color:#666}
  .edu-dates{font-size:8pt;color:${accent};font-style:italic}

  /* Sidebar */
  .sidebar-name{display:none}
  .sidebar-section-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${accent};border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px;margin-bottom:10px}
  .contact-item{font-size:7.5pt;color:rgba(255,255,255,0.8);margin-bottom:6px;line-height:1.4;word-break:break-word}
  .contact-label{color:${accent};font-size:7pt;display:block;text-transform:uppercase;letter-spacing:0.5px}
  .skill-pill{display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:2px;font-size:7.5pt;margin:2px 2px;color:rgba(255,255,255,0.85)}
  .cert-item{font-size:7.5pt;color:rgba(255,255,255,0.8);margin-bottom:6px;line-height:1.4}
  .cert-date{color:${accent};font-size:7pt}
  .lang-item{margin-bottom:7px}
  .lang-name{font-size:8pt;color:#fff;font-weight:600}
  .lang-prof{font-size:7pt;color:rgba(255,255,255,0.6);font-style:italic}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;width:210mm;display:grid}}
</style></head><body>
  <div class="main">
    <div class="main-header">
      <div class="main-name">${esc(cv.name)}</div>
      <div class="main-headline">${esc(cv.headline)}</div>
      ${cv.summary ? `<div class="main-summary">${esc(cv.summary)}</div>` : ''}
    </div>
    ${cv.experience.length ? `<div class="section-title">Work Experience</div>${cv.experience.map(e => expBlock(e, accent)).join('')}` : ''}
    ${cv.education.length ? `<div class="section-title">Education</div>${cv.education.map(e => `
      <div class="edu-block">
        <div class="edu-degree">${esc(e.degree)}</div>
        <div class="edu-school">${esc(e.school)}</div>
        <div class="edu-dates">${esc(e.dates)}</div>
      </div>`).join('')}` : ''}
    ${cv.extras.map(ex => `<div class="section-title">${esc(ex.heading)}</div>${ex.lines.map(l => `<div style="font-size:8pt;margin-bottom:4px">${esc(l)}</div>`).join('')}`).join('')}
  </div>

  <div class="sidebar">
    <div>
      <div style="font-size:15pt;font-weight:700;color:#fff;line-height:1.2;margin-bottom:3px">${esc(cv.name)}</div>
      <div style="font-size:8pt;color:${accent};font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">${esc(cv.headline)}</div>
      ${cv.email    ? `<div class="contact-item"><span class="contact-label">Email</span>${esc(cv.email)}</div>` : ''}
      ${cv.phone    ? `<div class="contact-item"><span class="contact-label">Phone</span>${esc(cv.phone)}</div>` : ''}
      ${cv.location ? `<div class="contact-item"><span class="contact-label">Location</span>${esc(cv.location)}</div>` : ''}
      ${cv.linkedin ? `<div class="contact-item"><span class="contact-label">LinkedIn</span>${esc(cv.linkedin.replace('https://',''))}</div>` : ''}
      ${cv.github   ? `<div class="contact-item"><span class="contact-label">GitHub</span>${esc(cv.github.replace('https://',''))}</div>` : ''}
      ${cv.website  ? `<div class="contact-item"><span class="contact-label">Web</span>${esc(cv.website)}</div>` : ''}
    </div>
    ${cv.skills.length ? `<div>
      <div class="sidebar-section-title">Technical Skills</div>
      ${cv.skills.slice(0, 18).map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}
    </div>` : ''}
    ${cv.certifications.length ? `<div>
      <div class="sidebar-section-title">Certifications</div>
      ${cv.certifications.map(c => `<div class="cert-item">${esc(c.name)}${c.date ? `<div class="cert-date">${esc(c.date)}</div>` : ''}</div>`).join('')}
    </div>` : ''}
    ${cv.languages.length ? `<div>
      <div class="sidebar-section-title">Languages</div>
      ${cv.languages.map(l => `<div class="lang-item"><div class="lang-name">${esc(l.language)}</div><div class="lang-prof">${esc(l.proficiency)}</div></div>`).join('')}
    </div>` : ''}
  </div>
</body></html>`;
}

// ── Template registry ─────────────────────────────────────────────────────
export type TemplateId = 'classic-navy' | 'executive-red' | 'modern-teal' | 'minimal-dark' | 'tech-sidebar';

export const TEMPLATES: Record<TemplateId, {
  id:       TemplateId;
  name:     string;
  plan:     'free' | 'beta' | 'pro';
  accent:   string;
  render:   (cv: ParsedCV) => string;
}> = {
  'classic-navy':   { id: 'classic-navy',   name: 'Classic Navy',   plan: 'free', accent: '#2dd4a0', render: templateClassicNavy   },
  'executive-red':  { id: 'executive-red',  name: 'Executive Red',  plan: 'free', accent: '#c0392b', render: templateExecutiveRed  },
  'modern-teal':    { id: 'modern-teal',    name: 'Modern Teal',    plan: 'beta', accent: '#0d7377', render: templateModernTeal    },
  'minimal-dark':   { id: 'minimal-dark',   name: 'Minimal Dark',   plan: 'beta', accent: '#c9a84c', render: templateMinimalDark   },
  'tech-sidebar':   { id: 'tech-sidebar',   name: 'Tech Sidebar',   plan: 'pro',  accent: '#e74c3c', render: templateTechSidebar   },
};

export function renderTemplate(id: TemplateId, cv: ParsedCV): string {
  return TEMPLATES[id].render(cv);
}
