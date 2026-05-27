'use client';
import { useState, useEffect, useRef } from 'react';
import { useCareerStore } from '@/store/career';
import ScoreRing from './ScoreRing';
import ChangeCard from './ChangeCard';

// ─── Bullet Quote Card ───────────────────────────────────────────────────────
// Shows exact bullet text with word count, issue badge, and suggested fix
function BulletQuote({ text, wordCount, issue, fix, type = 'warn' }: {
  text: string; wordCount?: number; issue: string; fix?: string; type?: 'warn' | 'error' | 'info';
}) {
  const [expanded, setExpanded] = useState(false);
  const badgeColor = type === 'error' ? 'var(--red)' : type === 'info' ? 'var(--accent)' : 'var(--amber)';
  const badgeBg    = type === 'error' ? 'var(--red-dim)' : type === 'info' ? 'var(--accent-dim)' : 'var(--amber-dim)';
  const PREVIEW_LEN = 100;
  const isLong = text.length > PREVIEW_LEN;
  const displayText = isLong && !expanded ? text.slice(0, PREVIEW_LEN) + '…' : text;

  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 10, marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Quote block */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0, marginTop: 1 }}>❝</span>
          <p style={{
            fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: 0,
            fontStyle: 'italic', flex: 1,
          }}>
            {displayText}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: '0 4px' }}
              >
                {expanded ? 'less' : 'more'}
              </button>
            )}
          </p>
          {wordCount !== undefined && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
              background: wordCount > 35 ? 'var(--red-dim)' : wordCount < 10 ? 'var(--amber-dim)' : 'var(--green-soft)',
              color: wordCount > 35 ? 'var(--red)' : wordCount < 10 ? 'var(--amber)' : 'var(--green)',
              flexShrink: 0, marginTop: 1,
            }}>
              {wordCount}w
            </span>
          )}
        </div>
      </div>
      {/* Issue + fix */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
            background: badgeBg, color: badgeColor, flexShrink: 0,
          }}>
            {type === 'error' ? '⛔' : '⚠️'} {issue}
          </span>
          {fix && (
            <span style={{ fontSize: 12, color: 'var(--green)', lineHeight: 1.5 }}>
              → {fix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Weak verb chip ──────────────────────────────────────────────────────────
function WeakVerbChip({ verb, bulletStart, replacement }: {
  verb: string; bulletStart: string; replacement: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'inline-flex', marginBottom: 6, marginRight: 6 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--amber)', fontFamily: 'inherit',
        }}
      >
        {verb} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 10, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 10,
          padding: '12px 14px', marginTop: 32, maxWidth: 280, boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Bullet starting with:</div>
          <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 10 }}>"{bulletStart}…"</p>
          <div style={{ fontSize: 12, color: 'var(--green)' }}>→ Replace with: <strong>{replacement}</strong></div>
        </div>
      )}
    </div>
  );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 0, fontFamily: 'DM Sans, sans-serif',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{q}</span>
        <span style={{ color: 'var(--text3)', fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65, marginTop: 8, animation: 'fadeIn 0.2s ease' }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function ReportSection({ id, icon, title, issueCount, status, children }: {
  id: string; icon: string; title: string;
  issueCount: number; status: 'pass' | 'warn' | 'fail';
  children: React.ReactNode;
}) {
  const statusColor = status === 'pass' ? 'var(--green)' : status === 'warn' ? 'var(--amber)' : 'var(--red)';
  const statusBg = status === 'pass' ? 'var(--green-dim)' : status === 'warn' ? 'var(--amber-dim)' : 'var(--red-dim)';
  const statusBorder = status === 'pass' ? 'rgba(45,212,160,0.25)' : status === 'warn' ? 'rgba(245,166,35,0.25)' : 'rgba(255,91,91,0.25)';
  const statusLabel = issueCount === 0 ? 'No issues' : `${issueCount} issue${issueCount > 1 ? 's' : ''}`;
  return (
    <div id={id} style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', marginBottom: 16, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, flex: 1 }}>{title}</h3>
        <div style={{
          padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
          background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor,
        }}>
          {issueCount === 0 ? '✓ ' : '⚠ '}{statusLabel}
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

// ─── Sidebar nav ────────────────────────────────────────────────────────────
function NavGroup({ label, score, icon, items, activeSection, onSelect }: {
  label: string; score: number; icon: string;
  items: { id: string; label: string; issues: number }[];
  activeSection: string; onSelect: (id: string) => void;
}) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--bg3)' }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
      </div>
      {items.map(item => {
        const isActive = activeSection === item.id;
        const issueColor = item.issues === 0 ? 'var(--green)' : item.issues <= 2 ? 'var(--amber)' : 'var(--red)';
        return (
          <div key={item.id} onClick={() => onSelect(item.id)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 12px 7px 28px', cursor: 'pointer', borderRadius: 6,
            background: isActive ? 'var(--accent-dim)' : 'transparent',
            borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}>
            <span style={{ fontSize: 12, color: isActive ? 'var(--accent)' : 'var(--text2)', fontWeight: isActive ? 500 : 400 }}>
              {item.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: issueColor }}>
              {item.issues === 0 ? '✓' : String(item.issues)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Verdict banner ─────────────────────────────────────────────────────────
function Verdict({ pass, passText, failText }: { pass: boolean; passText: string; failText: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
      background: pass ? 'var(--green-dim)' : 'var(--red-dim)',
      border: `1px solid ${pass ? 'rgba(45,212,160,0.3)' : 'rgba(255,91,91,0.3)'}`,
      borderRadius: 10, marginBottom: 18,
    }}>
      <span style={{ fontSize: 18 }}>{pass ? '✅' : '⛔'}</span>
      <span style={{ fontSize: 14, color: pass ? 'var(--green)' : 'var(--red)', lineHeight: 1.5, fontWeight: 500 }}>
        {pass ? passText : failText}
      </span>
    </div>
  );
}

// ─── Safe string helper ─────────────────────────────────────────────────────
function safeStr(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    // Handle {text, issue, fix} objects from new Groq format
    if (val.text) return `${val.text}${val.issue ? ` — ${val.issue}` : ''}${val.fix ? ` → ${val.fix}` : ''}`;
    if (val.problem) return `${val.section ? val.section + ': ' : ''}${val.problem}${val.fix ? ` → ${val.fix}` : ''}`;
    return JSON.stringify(val);
  }
  return String(val);
}

// ─── Issue item ─────────────────────────────────────────────────────────────
function IssueItem({ text, type = 'warn' }: { text: any; type?: 'warn' | 'error' | 'info' }) {
  const icon = type === 'error' ? '⛔' : type === 'info' ? 'ℹ️' : '⚠️';
  const color = type === 'error' ? 'var(--red)' : type === 'info' ? 'var(--accent)' : 'var(--amber)';
  // If it's an object with text/issue/fix, render as BulletQuote-style inline
  const displayText = safeStr(text);
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
      borderRadius: 8, marginBottom: 8,
      background: type === 'error' ? 'var(--red-dim)' : type === 'info' ? 'var(--accent-dim)' : 'var(--amber-dim)',
      border: `1px solid ${type === 'error' ? 'rgba(255,91,91,0.2)' : type === 'info' ? 'rgba(124,111,247,0.2)' : 'rgba(245,166,35,0.2)'}`,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color, lineHeight: 1.55 }}>{displayText}</span>
    </div>
  );
}

// ─── Repeat word row ────────────────────────────────────────────────────────
function RepeatRow({ word, count, alternatives }: { word: string; count: number; alternatives: string[] }) {
  return (
    <div style={{ padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 8, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>{count}× "{word}"</span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>— repeated too often</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
        Try:{' '}
        {(alternatives || []).slice(0, 3).map((a: any, i: number) => (
          <span key={i} style={{ display: 'inline-block', marginRight: 6, padding: '1px 8px', background: 'var(--bg4)', borderRadius: 4, color: 'var(--text2)', fontWeight: 500 }}>{typeof a === 'string' ? a : String(a)}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Bullet row ─────────────────────────────────────────────────────────────
function BulletRow({ text, tag }: { text: any; tag: string }) {
  const display = typeof text === 'object' && text !== null
    ? (text.text || text.original || JSON.stringify(text))
    : String(text ?? '');
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 6, background: 'var(--red-dim)', border: '1px solid rgba(255,91,91,0.15)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{tag}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, fontStyle: 'italic' }}>"{display}"</div>
    </div>
  );
}

// ─── Risk card (extracted to avoid hook-in-loop) ────────────────────────────
function RiskCard({ risk, defaultOpen }: { risk: any; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const sev = risk.severity as string;
  const c = sev === 'high' ? 'var(--red)' : sev === 'medium' ? 'var(--amber)' : 'var(--green)';
  const bg = sev === 'high' ? 'var(--red-dim)' : sev === 'medium' ? 'var(--amber-dim)' : 'var(--green-dim)';
  return (
    <div style={{ border: `1px solid ${c}40`, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: bg, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <span style={{ fontSize: 10, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: 0.5, padding: '2px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 4 }}>{sev}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {risk.risk_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{risk.detected_issue}</div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '16px', background: 'var(--bg2)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Why Recruiters Probe This</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{risk.why_recruiters_ask}</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>How to Address It</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{risk.suggested_fix}</p>
            </div>
          </div>
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.2)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Expect This Question</div>
            <p style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic' }}>"{risk.sample_interview_question}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Humanization suggestion card ───────────────────────────────────────────
function HumanizationCard({ s, index }: { s: any; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div style={{ padding: '10px 14px', background: 'var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Suggestion {index + 1}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </div>
      {open && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={{ padding: '8px 14px', background: 'var(--red-dim)' }}>
            <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Replace</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', textDecoration: 'line-through' }}>{s.replace}</div>
          </div>
          <div style={{ padding: '8px 14px', background: 'var(--green-dim)' }}>
            <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>With</div>
            <div style={{ fontSize: 12, color: 'var(--green)' }}>{s.with}</div>
          </div>
          <div style={{ padding: '8px 14px', background: 'var(--bg3)', fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>💡 {s.reason}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main StageReport ────────────────────────────────────────────────────────
export default function StageReport() {
  const { intelligenceResult, changes, setStage, approveChange, discardChange, editChange, approveAll } = useCareerStore();
  const [activeSection, setActiveSection] = useState('ats-parse');
  const [changeFilter, setChangeFilter] = useState<'all' | 'pending' | 'approved' | 'discarded'>('all');
  const lastScrollY = useRef(0);

  // Hide progress bar on scroll down, show on scroll up
  useEffect(() => {
    function onScroll() {
      const current = window.scrollY;
      const shouldHide = current > 120 && current > lastScrollY.current;
      const pb = document.getElementById('cs-progress-bar');
      if (pb) pb.classList.toggle('hidden', shouldHide);
      lastScrollY.current = current;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!intelligenceResult) return null;

  const r = intelligenceResult;
  const ats = r.ats_parse_analysis;
  const rr = r.recruiter_reaction;
  const ca = r.credibility_analysis;
  const ls = r.leadership_signals;
  const cs = r.career_story;
  const hc = r.hiring_confidence;
  const ha = r.human_authenticity;
  const pc = r.professionalism_checks;
  const bq = r.bullet_quality;
  const sv = r.skill_validation;
  const va = r.vocabulary_analysis;
  const pb = r.peer_benchmark;
  const risks = r.interview_risks || [];
  const defensibility = r.interview_defensibility?.high_risk_claims || [];

  const approved = changes.filter(c => c.status === 'approved').length;
  const discardedCount = changes.filter(c => c.status === 'discarded').length;
  const pending = changes.filter(c => c.status === 'pending').length;
  const filtered = changeFilter === 'all' ? changes : changes.filter(c => c.status === changeFilter);

  const getDimScore = (id: string) => r.dimensions?.find((d: any) => d.id === id)?.score || 70;
  const getDimIssues = (id: string) => r.dimensions?.find((d: any) => d.id === id)?.issues || [];

  const contentScore = Math.round(((getDimScore('quantified_impact') + (va?.variety_score || 70) + (ats?.readability_score || 70) + getDimScore('recruiter_readability')) / 4));
  const sectionsScore = Math.round(((getDimScore('formatting') + (pc?.file_name_score || 85)) / 2));
  const atsEssentialScore = Math.round(((ats?.parse_rate || 80) + getDimScore('ats_compatibility')) / 2);
  const hrFlagsScore = Math.round(((ca?.score || 80) + getDimScore('interview_risk') + (pb?.uniqueness_score || 80)) / 3);
  const seniorityScore = Math.round(((ls?.score || 75) + getDimScore('leadership_signals') + getDimScore('career_progression')) / 3);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const NAV = [
    {
      label: 'Content', score: contentScore, icon: '📝',
      items: [
        { id: 'ats-parse', label: 'ATS Parse Rate', issues: ats?.issues?.length || 0 },
        { id: 'quantify', label: 'Quantified Impact', issues: bq?.generic_bullets?.length || 0 },
        { id: 'repetition', label: 'Repetition', issues: va?.repeated_words?.filter((w: any) => w.count >= 3).length || 0 },
        { id: 'grammar', label: 'Spelling & Grammar', issues: getDimIssues('recruiter_readability').length },
        { id: 'bullets', label: 'Bullet Consistency', issues: (bq?.too_short?.length || 0) + (bq?.too_long?.length || 0) },
        { id: 'changes', label: 'Suggested Changes', issues: pending },
      ],
    },
    {
      label: 'Sections', score: sectionsScore, icon: '📋',
      items: [
        { id: 'sections-essential', label: 'Essential Sections', issues: 0 },
        { id: 'sections-contact', label: 'Contact Information', issues: 0 },
        { id: 'sections-order', label: 'Section Order', issues: 0 },
      ],
    },
    {
      label: 'ATS Essentials', score: atsEssentialScore, icon: '⚡',
      items: [
        { id: 'ats-design', label: 'Design & Format', issues: ats?.format_risks?.length || 0 },
        { id: 'ats-keywords', label: 'Keyword Coverage', issues: r.missing_keywords?.length || 0 },
        { id: 'ats-dates', label: 'Dates & Links', issues: 0 },
      ],
    },
    {
      label: 'HR Red Flags', score: hrFlagsScore, icon: '🚩',
      items: [
        { id: 'credibility', label: 'Credibility', issues: ca?.suspicious_claims?.length || 0 },
        { id: 'interview-risks', label: 'Interview Risks', issues: risks.length },
        { id: 'peer-benchmark', label: 'Peer Benchmarking', issues: pb?.missing_common_skills?.length || 0 },
        { id: 'hidden-concerns', label: 'Hidden Concerns', issues: r.hidden_recruiter_concerns?.length || 0 },
      ],
    },
    {
      label: 'Authenticity', score: ha?.score || 75, icon: '🧬',
      items: [
        { id: 'authenticity', label: 'Human Authenticity', issues: ha?.ai_like_patterns?.length || 0 },
        { id: 'employment-gaps', label: 'Employment Gaps', issues: 0 },
      ],
    },
    {
      label: 'Seniority', score: seniorityScore, icon: '📈',
      items: [
        { id: 'career-progression', label: 'Career Progression', issues: cs?.narrative_gaps?.length || 0 },
        { id: 'skill-evidence', label: 'Skill Evidence', issues: (sv?.unsupported_skills?.length || 0) + (sv?.weak_evidence_skills?.length || 0) },
        { id: 'leadership', label: 'Leadership Signals', issues: ls?.missing_signals?.length || 0 },
        { id: 'executive-presence', label: 'Executive Presence', issues: (rr?.executive_presence_score || 0) < 70 ? 1 : 0 },
      ],
    },
  ];

  return (
    <div className="animate-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Hero */}
      <div style={{
        display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
      }}>
        <ScoreRing score={r.overall_score} grade={r.grade} size={120} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Recruiter Intelligence Report</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{r.summary}</p>
          <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            {r.strengths?.slice(0, 3).map((s: any, i: number) => <span key={i} className="badge badge-green">{safeStr(s)}</span>)}
          </div>
        </div>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)', borderRadius: 12, padding: '16px 20px', minWidth: 180, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Hiring Confidence</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>{hc?.score}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
            {hc?.verdict?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </div>
          <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${hc?.score}%`, background: 'var(--accent)', borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Sidebar — independent scroll */}
        <div style={{
          position: 'sticky',
          top: 'calc(60px + env(safe-area-inset-top, 0px) + 8px)',
          height: 'calc(100vh - 100px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 12px',
          scrollbarWidth: 'thin',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 }}>Report Sections</div>
          {NAV.map(group => (
            <NavGroup key={group.label} {...group} activeSection={activeSection} onSelect={scrollTo} />
          ))}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <button className="btn btn-primary w-full" style={{ fontSize: 13, width: '100%' }} onClick={() => setStage(7)}>
              Export CV →
            </button>
          </div>
        </div>

        {/* Report sections */}
        <div>

          {/* ── ATS Parse Rate ── */}
          <ReportSection id="ats-parse" icon="⚡" title="ATS Parse Rate"
            issueCount={ats?.issues?.length || 0}
            status={(ats?.parse_rate || 0) >= 90 ? 'pass' : (ats?.parse_rate || 0) >= 70 ? 'warn' : 'fail'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Recruiters use Applicant Tracking Systems to filter resumes before a human ever reads them.
              A high parse rate means the ATS correctly extracts your name, titles, dates, and skills —
              so your resume actually reaches a recruiter's screen instead of being filtered out automatically.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[{ label: 'Parse Rate', val: ats?.parse_rate || 0 }, { label: 'Readability Score', val: ats?.readability_score || 0 }].map(item => {
                const c = item.val >= 85 ? 'var(--green)' : item.val >= 65 ? 'var(--amber)' : 'var(--red)';
                return (
                  <div key={item.label} style={{ padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: 'Sora,sans-serif' }}>{item.val}%</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{item.label}</div>
                    <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 99, marginTop: 8 }}>
                      <div style={{ height: '100%', width: `${item.val}%`, background: c, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Verdict
              pass={(ats?.parse_rate || 0) >= 85}
              passText={`Parsed at ${ats?.parse_rate}%. The ATS successfully extracted your experience, titles, and skills.`}
              failText={`Parse rate is ${ats?.parse_rate}%. The ATS is struggling to read sections — your experience may be invisible to recruiters.`}
            />
            {ats?.issues?.map((iss: any, i: number) => (
              typeof iss === 'object'
                ? <BulletQuote key={i} text={`${iss.section || ''}: ${iss.problem || ''}`} issue={iss.section || 'Issue'} fix={iss.fix} type="warn" />
                : <IssueItem key={i} text={String(iss)} type="warn" />
            ))}
            {ats?.format_risks?.map((fr: any, i: number) => <IssueItem key={i} text={typeof fr === 'string' ? fr : JSON.stringify(fr)} type="error" />)}
            {(ats?.recommendations?.length || 0) > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Recommendations</div>
                {ats.recommendations.map((rec: any, i: number) => <IssueItem key={i} text={safeStr(rec)} type="info" />)}
              </div>
            )}
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>FAQs</div>
              <FAQ q="What kills ATS parse rate?" a="Two-column layouts, tables, headers/footers, text boxes, and graphics all confuse ATS parsers. Single-column, plain-text formatting gives maximum compatibility with all major ATS systems." />
              <FAQ q="Does a high parse rate guarantee I get seen?" a="It means your content reaches the ATS scoring stage. After that, keyword relevance determines your score. Parse rate is the entry ticket — keywords are what win the game." />
              <FAQ q="Should I have two versions of my resume?" a="Yes. An ATS-optimised plain version for online applications, and a visually designed version for direct referrals and networking. Never submit a designed resume through an online portal." />
            </div>
          </ReportSection>

          {/* ── Quantified Impact ── */}
          <ReportSection id="quantify" icon="📊" title="Quantified Impact"
            issueCount={bq?.generic_bullets?.length || 0}
            status={getDimScore('quantified_impact') >= 75 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Numbers are the fastest way to communicate scale, impact, and credibility. A bullet with a
              metric is significantly more memorable than one without. Recruiters instinctively trust candidates
              who quantify their work — it signals analytical thinking and genuine business awareness.
            </p>
            <Verdict
              pass={getDimScore('quantified_impact') >= 75}
              passText="Strong quantification throughout. Your metrics give recruiters a clear picture of the scale you operate at."
              failText="Several bullets describe responsibilities without showing measurable impact. Recruiters cannot gauge your scale from duties alone."
            />
            {getDimIssues('quantified_impact').map((iss: any, i: number) => (
              typeof iss === 'object'
                ? <BulletQuote key={i} text={iss.text || JSON.stringify(iss)} issue={iss.issue || 'Issue'} fix={iss.fix} type="warn" />
                : <IssueItem key={i} text={String(iss)} type="warn" />
            ))}
            {bq?.generic_bullets?.slice(0, 4).map((b: any, i: number) => (
              <BulletRow key={i} text={b} tag="No measurable impact" />
            ))}
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>FAQs</div>
              <FAQ q="What if my role doesn't have obvious numbers?" a="Every role has something measurable — volume, frequency, scope, or time saved. 'Managed supplier relationships' becomes 'Managed 40+ supplier relationships across 3 countries'. The number is what sticks." />
              <FAQ q="Can I estimate if I don't have exact figures?" a="Yes — use ranges or approximations: 'reduced processing time by approximately 30%'. Estimates are far stronger than vague descriptions, as long as you can defend them in an interview." />
            </div>
          </ReportSection>

          {/* ── Repetition ── */}
          <ReportSection id="repetition" icon="🔁" title="Repetition"
            issueCount={va?.repeated_words?.filter((w: any) => w.count >= 3).length || 0}
            status={(va?.variety_score || 0) >= 75 ? 'pass' : (va?.variety_score || 0) >= 60 ? 'warn' : 'fail'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Repeating the same verbs and phrases makes every role sound identical and signals a limited vocabulary.
              Senior recruiters notice repetition immediately — it flattens your narrative and makes your
              resume harder to remember after scanning 50 others.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: (va?.variety_score || 0) >= 75 ? 'var(--green)' : 'var(--amber)', fontFamily: 'Sora,sans-serif' }}>{va?.variety_score || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Variety Score</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${va?.variety_score || 0}%`, background: (va?.variety_score || 0) >= 75 ? 'var(--green)' : 'var(--amber)', borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Vocabulary diversity — aim for 80+</div>
              </div>
            </div>
            {va?.repeated_words?.filter((w: any) => w.count >= 3).map((w: any, i: number) => (
              <RepeatRow key={i} word={w.word} count={w.count} alternatives={w.alternatives || []} />
            ))}
            {va?.weak_phrases?.slice(0, 4).map((p: any, i: number) => (
              <IssueItem key={i} text={`Weak phrase: "${safeStr(p)}"`} type="warn" />
            ))}
            {va?.buzzwords?.slice(0, 3).map((b: any, i: number) => (
              <IssueItem key={i} text={`Overused buzzword: "${safeStr(b)}" — replace with specific evidence`} type="warn" />
            ))}
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>FAQs</div>
              <FAQ q="Is some repetition acceptable?" a="Repeating role-specific keywords intentionally for ATS is fine. Repeating action verbs like 'managed' or 'responsible for' across every bullet is what weakens the resume." />
              <FAQ q="What are the worst offenders?" a="'Managed', 'responsible for', 'worked on', 'assisted with', and 'helped' are the most common weak repeats. Replace each with a specific verb that shows exactly what you did and how." />
            </div>
          </ReportSection>

          {/* ── Grammar ── */}
          <ReportSection id="grammar" icon="✍️" title="Spelling & Grammar"
            issueCount={getDimIssues('recruiter_readability').length}
            status={getDimScore('recruiter_readability') >= 80 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              A single typo signals carelessness. Recruiters interpret grammar errors as a preview of
              your work quality — if you can't proofread the document you're using to make a first impression,
              what does that say about your attention to detail on the job?
            </p>
            <Verdict
              pass={getDimScore('recruiter_readability') >= 80}
              passText="No critical grammar or tense issues detected. Your resume reads cleanly and professionally."
              failText="Readability issues detected. Inconsistent tense, weak phrasing, and unclear structures all affect recruiter trust."
            />
            {getDimIssues('recruiter_readability').map((iss: any, i: number) => <IssueItem key={i} text={safeStr(iss)} type="warn" />)}
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>FAQs</div>
              <FAQ q="Past or present tense?" a="Current roles: present tense. All previous roles: past tense. Mixing tenses within the same role is one of the most common errors recruiter notice." />
              <FAQ q="British vs American English?" a="Pick one and be consistent. Mixing 'optimise' and 'optimize' in the same document reads as careless editing, not regional preference." />
            </div>
          </ReportSection>

          {/* ── Bullet Consistency ── */}
          <ReportSection id="bullets" icon="🎯" title="Bullet Consistency"
            issueCount={(bq?.too_short?.length || 0) + (bq?.too_long?.length || 0)}
            status={((bq?.too_short?.length || 0) + (bq?.too_long?.length || 0)) === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Recruiters spend 6–10 seconds on initial scan. Bullets outside the 10–35 word range break
              reading rhythm — too short and they feel vague, too long and they're impossible to skim.
            </p>
            <Verdict
              pass={((bq?.too_short?.length || 0) + (bq?.too_long?.length || 0)) === 0}
              passText="All bullets fall within the optimal 10–35 word range. Your resume is easy to scan."
              failText={`${(bq?.too_short?.length || 0) + (bq?.too_long?.length || 0)} bullets fall outside the recommended range and disrupt recruiter reading flow.`}
            />
            {bq?.too_short?.slice(0, 4).map((b: any, i: number) => (
              typeof b === 'object'
                ? <BulletQuote key={`s${i}`} text={b.text || ''} wordCount={b.word_count} issue={`Only ${b.word_count || '?'}w`} fix={b.fix} type="warn" />
                : <BulletRow key={`s${i}`} text={String(b)} tag={`Too short — ${String(b).split(' ').length} words (aim for 10–35)`} />
            ))}
            {bq?.too_long?.slice(0, 3).map((b: any, i: number) => (
              <BulletRow key={`l${i}`} text={b} tag="Too long — split into two focused bullets" />
            ))}
            {(bq?.weak_openings?.length || 0) > 0 && (
              <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', marginBottom: 8 }}>WEAK OPENING WORDS</div>
                <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {bq.weak_openings.map((w: any, i: number) => (
                    typeof w === 'object'
                      ? <WeakVerbChip key={i} verb={w.verb || String(w)} bulletStart={w.bullet_start || ''} replacement={w.replacement || 'Led / Delivered / Built'} />
                      : <span key={i} className="badge badge-amber">{String(w)}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                  Replace with strong action verbs: Led, Delivered, Built, Reduced, Negotiated, Implemented, Drove
                </div>
              </div>
            )}
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>FAQs</div>
              <FAQ q="What is the ideal bullet structure?" a="Action verb → context/scope → measurable result. Example: 'Renegotiated freight contracts with 12 carriers, cutting logistics costs by 11% and eliminating $80K annual demurrage.'" />
              <FAQ q="How do I fix a bullet that's too short?" a="Add the missing context: who was affected, what the scope was, what the outcome was. A 4-word bullet almost always lacks at least two of these elements." />
            </div>
          </ReportSection>

          {/* ── Suggested Changes ── */}
          <ReportSection id="changes" icon="✏️" title="Suggested Changes"
            issueCount={pending} status={pending === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              AI-generated improvements across ATS compatibility, recruiter trust, humanization, leadership
              framing, and credibility. Approve what fits, edit to match your voice, discard what doesn't apply.
            </p>
            <div className="flex items-center justify-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div className="flex gap-3">
                <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ {approved}</span>
                <span style={{ fontSize: 12, color: 'var(--red)' }}>✕ {discardedCount}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>⏳ {pending}</span>
              </div>
              <button className="btn btn-green btn-sm" onClick={approveAll}>✅ Approve All</button>
            </div>
            <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 8, padding: 3, marginBottom: 14, border: '1px solid var(--border)', width: 'fit-content' }}>
              {(['all', 'pending', 'approved', 'discarded'] as const).map(f => (
                <button key={f} onClick={() => setChangeFilter(f)} style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 500,
                  background: changeFilter === f ? 'var(--bg2)' : 'transparent',
                  color: changeFilter === f ? 'var(--text)' : 'var(--text3)',
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.length === 0
                ? <div style={{ textAlign: 'center', padding: 28, color: 'var(--text3)', fontSize: 14 }}>No {changeFilter} changes</div>
                : filtered.map((c, i) => (
                    <ChangeCard key={c.id} change={c} index={i}
                      onApprove={() => approveChange(c.id)}
                      onDiscard={() => discardChange(c.id)}
                      onEdit={t => editChange(c.id, t)}
                    />
                  ))
              }
            </div>
          </ReportSection>

          {/* ── Essential Sections ── */}
          <ReportSection id="sections-essential" icon="📋" title="Essential Sections" issueCount={0} status="pass">
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              The three non-negotiable sections every professional resume must contain. Missing any creates
              immediate doubt about the candidate's understanding of professional standards.
            </p>
            <Verdict pass={true} passText="All essential sections detected: Professional Summary, Work Experience, and Education." failText="" />
            <FAQ q="What are the absolute must-haves?" a="Experience (with dates, titles, company names), Education (degree, institution, year), and a Summary or Profile. Skills is strongly recommended but varies by industry." />
          </ReportSection>

          {/* ── Contact Information ── */}
          <ReportSection id="sections-contact" icon="📞" title="Contact Information" issueCount={0} status="pass">
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Missing or buried contact details means an automatic pass — not because you're unqualified,
              but because a recruiter with 200 other resumes will simply move on.
            </p>
            <Verdict pass={true} passText="Contact information is present and clearly formatted at the top of your resume." failText="" />
            {pc?.email_professionalism && <IssueItem text={`Email: ${pc.email_professionalism}`} type="info" />}
            {pc?.link_quality && <IssueItem text={`Links: ${pc.link_quality}`} type="info" />}
            <FAQ q="Should I include my full address?" a="No. City and country is sufficient and safer. Full street addresses are outdated and create unnecessary privacy exposure in digital applications." />
          </ReportSection>

          {/* ── Section Order ── */}
          <ReportSection id="sections-order" icon="📐" title="Section Order" issueCount={0} status="pass">
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Recruiters scan in the first 3 seconds to decide if they keep reading. Your most valuable
              content — Summary and Experience — must appear before anything else.
            </p>
            <Verdict pass={true} passText="Impact-first hierarchy detected. Summary → Experience → Education is the optimal order for experienced professionals." failText="" />
            <FAQ q="Should education come before experience?" a="Only for recent graduates. If you have 2+ years of work history, Experience always comes first. Recruiters want to see what you've done, not where you studied." />
          </ReportSection>

          {/* ── ATS Design ── */}
          <ReportSection id="ats-design" icon="🎨" title="Design & Format"
            issueCount={ats?.format_risks?.length || 0}
            status={(ats?.format_risks?.length || 0) === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Design choices that look great to humans can be completely invisible to machines. Tables,
              columns, graphics, icons, and custom fonts all create parsing failures that eliminate you
              before a human ever reads your resume.
            </p>
            <Verdict
              pass={(ats?.format_risks?.length || 0) === 0}
              passText="No major format risks detected. Your resume structure is ATS-safe."
              failText={`${ats?.format_risks?.length} format issue(s) detected that may cause ATS parsing failures.`}
            />
            {ats?.format_risks?.map((fr: any, i: number) => <IssueItem key={i} text={fr} type="error" />)}
            {pc?.formatting_consistency && <IssueItem text={pc.formatting_consistency} type="info" />}
            <FAQ q="Are two-column resumes ATS-safe?" a="No. Most ATS systems read left-to-right, top-to-bottom. Two-column layouts cause information to merge between columns, making both sections unreadable to the parser." />
            <FAQ q="Can I use icons and graphics?" a="Not in resumes submitted through ATS portals. Save the designed version for direct submissions and networking events only." />
          </ReportSection>

          {/* ── Keyword Coverage ── */}
          <ReportSection id="ats-keywords" icon="🔑" title="Keyword Coverage"
            issueCount={r.missing_keywords?.length || 0}
            status={(r.missing_keywords?.length || 0) === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              ATS systems score resumes by matching keywords. A resume with the right experience but
              wrong terminology scores lower than a weaker resume that uses the exact language
              the recruiter searched for.
            </p>
            {(r.missing_keywords?.length || 0) > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 10 }}>
                  {r.missing_keywords.length} keywords commonly expected for this profile are absent:
                </div>
                <div className="flex" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {r.missing_keywords.map((kw: any, i: number) => <span key={i} className="badge badge-amber">{safeStr(kw)}</span>)}
                </div>
              </>
            )}
            {(r.missing_keywords?.length || 0) === 0 && (
              <Verdict pass={true} passText="Keyword coverage is strong. No critical missing keywords detected for this profile." failText="" />
            )}
            <FAQ q="How do I know which keywords to add?" a="Mirror the exact language from job descriptions you're targeting. If 3 out of 5 postings say 'vendor management' and your resume says 'supplier coordination', you're losing ATS points even though they mean the same thing." />
          </ReportSection>

          {/* ── Dates & Links ── */}
          <ReportSection id="ats-dates" icon="📅" title="Dates & Links" issueCount={0} status="pass">
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Date inconsistencies and broken links are silent credibility killers. Recruiters cross-reference
              your resume with LinkedIn — any mismatch triggers doubt about accuracy.
            </p>
            <Verdict pass={true} passText="Date formatting is consistent and no broken links detected." failText="" />
            {pc?.date_consistency && <IssueItem text={`Date format: ${pc.date_consistency}`} type="info" />}
            <FAQ q="Should I use month-year or just year?" a="Month-Year (e.g. 'Apr 2022 – Mar 2025') is preferred for roles in the last 10 years. Be consistent throughout — mixing formats reads as careless editing." />
          </ReportSection>

          {/* ── Credibility ── */}
          <ReportSection id="credibility" icon="🔬" title="Credibility"
            issueCount={ca?.suspicious_claims?.length || 0}
            status={(ca?.score || 0) >= 80 ? 'pass' : (ca?.score || 0) >= 65 ? 'warn' : 'fail'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              This evaluates whether your resume reads as believable to a hiring manager. Logical progression,
              responsibilities matching your title, realistic metrics, and skills backed by actual experience
              all build credibility. Anything that feels inflated or vague creates doubt — and doubt leads to rejection.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: (ca?.score || 0) >= 75 ? 'var(--green)' : 'var(--amber)', marginBottom: 4 }}>{ca?.score || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Credibility Score</div>
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>Metric Quality</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{ca?.metric_quality}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14 }}>{ca?.overall_assessment}</p>
            {(ca?.strong_signals?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Strong Trust Signals</div>
                {ca.strong_signals.map((s: any, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--green)', marginBottom: 6, display: 'flex', gap: 8 }}><span>✓</span><span>{safeStr(s)}</span></div>
                ))}
              </div>
            )}
            {(ca?.suspicious_claims?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Hiring Managers May Question</div>
                {ca.suspicious_claims.map((s: any, i: number) => <IssueItem key={i} text={s} type="warn" />)}
              </div>
            )}
            {(ca?.unsupported_skills?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Unsupported Skills</div>
                {ca.unsupported_skills.map((s: any, i: number) => (
                  <IssueItem key={i} text={`"${s}" is listed but not demonstrated in experience`} type="error" />
                ))}
              </div>
            )}
            <FAQ q="What makes a resume look inflated?" a="Claiming sole ownership of team achievements, using C-suite language for mid-level roles, metrics with no context, and skills listed without supporting evidence." />
            <FAQ q="How do I improve credibility fast?" a="Add scope to every achievement: team size, budget managed, number of stakeholders, time period. Replace vague claims like 'improved efficiency' with 'reduced order processing from 5 days to 2'." />
          </ReportSection>

          {/* ── Interview Risks ── */}
          <ReportSection id="interview-risks" icon="⚠️" title="Interview Risks"
            issueCount={risks.length}
            status={risks.filter((r: any) => r.severity === 'high').length > 0 ? 'fail' : risks.length === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Your resume sets the agenda for your interview. Every vague claim, overlapping date, or
              inflated metric becomes a probing question. Identifying these now means you walk in
              prepared — not defensive.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'High Risk', count: risks.filter((r: any) => r.severity === 'high').length, color: 'var(--red)', bg: 'var(--red-dim)' },
                { label: 'Medium Risk', count: risks.filter((r: any) => r.severity === 'medium').length, color: 'var(--amber)', bg: 'var(--amber-dim)' },
                { label: 'Low Risk', count: risks.filter((r: any) => r.severity === 'low').length, color: 'var(--green)', bg: 'var(--green-dim)' },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px', background: item.bg, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: item.color, fontFamily: 'Sora,sans-serif' }}>{item.count}</div>
                  <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
            </div>
            {risks.length === 0 && <Verdict pass={true} passText="No significant interview risks detected in your resume." failText="" />}
            {[
              ...risks.filter((r: any) => r.severity === 'high'),
              ...risks.filter((r: any) => r.severity === 'medium'),
              ...risks.filter((r: any) => r.severity === 'low'),
            ].map((risk: any, i: number) => (
              <RiskCard key={i} risk={risk} defaultOpen={i === 0} />
            ))}
            {defensibility.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🛡️ Can You Defend These Claims?</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                  {defensibility.map((claim: any, i: number) => {
                    const dc = claim.difficulty_level === 'high' ? 'var(--red)' : claim.difficulty_level === 'medium' ? 'var(--amber)' : 'var(--green)';
                    return (
                      <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: dc, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{claim.difficulty_level} difficulty</div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>"{claim.claim}"</div>
                        <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 8 }}>⚠ {claim.risk_reason}</div>
                        <div style={{ background: 'var(--green-dim)', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: 'var(--green)' }}>💡 {claim.prep_advice}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <FAQ q="What counts as an interview risk?" a="Timeline overlaps, metrics without baseline context, implied ownership of team achievements, skills listed but never demonstrated, and career transitions that aren't explained." />
            <FAQ q="Should I fix these on the resume or just prepare answers?" a="Both. Fix what can be fixed in text. For things that can't be changed, prepare a tight 90-second answer that owns the situation directly without being defensive." />
          </ReportSection>

          {/* ── Peer Benchmark ── */}
          <ReportSection id="peer-benchmark" icon="📊" title="Peer Benchmarking"
            issueCount={pb?.missing_common_skills?.length || 0}
            status={(pb?.uniqueness_score || 0) >= 70 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Where does your profile stand against other candidates competing for the same roles?
              This benchmark compares your experience, skills, and positioning against typical profiles
              at your seniority level.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Market Position', val: pb?.market_position?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || '—', isText: true },
                { label: 'Experience Detected', val: `${pb?.years_experience_detected || 0} yrs`, isText: true },
                { label: 'Uniqueness Score', val: `${pb?.uniqueness_score || 0}`, isText: false },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: item.isText ? 13 : 28, fontWeight: 700, color: 'var(--accent)', fontFamily: item.isText ? 'DM Sans,sans-serif' : 'Sora,sans-serif', marginBottom: 4 }}>{String(item.val)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14 }}>{pb?.industry_comparison}</p>
            {(pb?.competitive_strengths?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Where You Beat Peers</div>
                {pb.competitive_strengths.map((s: any, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--green)', marginBottom: 6, display: 'flex', gap: 8 }}><span>✓</span><span>{safeStr(s)}</span></div>
                ))}
              </div>
            )}
            {(pb?.missing_common_skills?.length || 0) > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Skills Typical Peers Have That You're Missing</div>
                {pb.missing_common_skills.map((s: any, i: number) => <IssueItem key={i} text={s} type="warn" />)}
              </div>
            )}
            <FAQ q="What does market position mean?" a="An estimate of where your profile ranks against other candidates with similar titles and experience applying for the same types of roles. Top 20% means your profile is stronger than roughly 80% of comparable candidates." />
          </ReportSection>

          {/* ── Hidden Concerns ── */}
          <ReportSection id="hidden-concerns" icon="🔮" title="Hidden Recruiter Concerns"
            issueCount={r.hidden_recruiter_concerns?.length || 0}
            status={(r.hidden_recruiter_concerns?.length || 0) === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              These are questions recruiters form in their heads but never ask — concerns that influence
              decisions without appearing in feedback. Understanding them gives you the chance to
              proactively address them before they cost you the interview.
            </p>
            {(r.hidden_recruiter_concerns?.length || 0) > 0
              ? r.hidden_recruiter_concerns.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,91,91,0.2)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>👁</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>{safeStr(c)}</span>
                  </div>
                ))
              : <Verdict pass={true} passText="No significant hidden concerns detected for this profile." failText="" />
            }
            <FAQ q="Why do recruiters have hidden concerns?" a="Professional norms prevent recruiters from asking certain questions directly. Seniority mismatches, unexplained technical claims, scope ambiguity, and career trajectory doubts all influence hiring decisions silently." />
          </ReportSection>

          {/* ── Human Authenticity ── */}
          <ReportSection id="authenticity" icon="🧬" title="Human Authenticity"
            issueCount={ha?.ai_like_patterns?.length || 0}
            status={(ha?.score || 0) >= 75 ? 'pass' : (ha?.score || 0) >= 55 ? 'warn' : 'fail'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Recruiters are increasingly suspicious of polished, generic language that feels produced
              rather than lived. This identifies patterns that reduce trust — not because they prove anything,
              but because they activate recruiter skepticism. Specific, authentic writing always outperforms
              generic polish.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 20, alignItems: 'center', marginBottom: 20, padding: '16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 84, height: 84, borderRadius: '50%', margin: '0 auto',
                  background: `conic-gradient(${(ha?.score || 0) >= 75 ? 'var(--green)' : (ha?.score || 0) >= 55 ? 'var(--amber)' : 'var(--red)'} ${(ha?.score || 0) * 3.6}deg, var(--bg4) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: (ha?.score || 0) >= 75 ? 'var(--green)' : (ha?.score || 0) >= 55 ? 'var(--amber)' : 'var(--red)', fontFamily: 'Sora,sans-serif' }}>{ha?.score || 0}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Authenticity</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: (ha?.risk_level === 'low') ? 'var(--green)' : (ha?.risk_level === 'medium') ? 'var(--amber)' : 'var(--red)' }}>
                  {(ha?.risk_level === 'low') ? 'Low AI-Pattern Risk' : (ha?.risk_level === 'medium') ? 'Moderate AI-Like Patterns Detected' : 'High AI-Pattern Risk'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{ha?.authenticity_summary}</p>
              </div>
            </div>
            {ha?.ai_like_patterns?.map((p: any, i: number) => <IssueItem key={i} text={p} type="warn" />)}
            {(ha?.recruiter_suspicion_triggers?.length || 0) > 0 && (
              <div style={{ marginTop: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Recruiter Suspicion Triggers</div>
                <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {ha.recruiter_suspicion_triggers.map((t: any, i: number) => <span key={i} className="badge badge-amber">{safeStr(t)}</span>)}
                </div>
              </div>
            )}
            {(ha?.humanization_suggestions?.length || 0) > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Humanization Suggestions</div>
                {ha.humanization_suggestions.slice(0, 5).map((s: any, i: number) => (
                  <HumanizationCard key={i} s={s} index={i} />
                ))}
              </div>
            )}
            <FAQ q="How do recruiters detect AI-assisted writing?" a="Over-polished language, uniform sentence length, strategic vocabulary density, and the absence of specific human details — exact team sizes, named projects, personal context — all activate suspicion." />
            <FAQ q="Is using AI to improve a resume acceptable?" a="Using AI to fix structure or grammar is fine. A resume that reads as entirely AI-generated raises concerns about your actual communication ability, which recruiters will test in the interview." />
          </ReportSection>

          {/* ── Employment Gaps ── */}
          <ReportSection id="employment-gaps" icon="📅" title="Employment Gaps" issueCount={0} status="pass">
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Unexplained gaps or patterns of very short roles signal instability. This analyses your
              timeline for patterns that would create doubt about continuity or commitment.
            </p>
            <Verdict pass={true} passText="Career timeline is consistent. No unexplained gaps or instability signals detected." failText="" />
            <FAQ q="How long of a gap is a red flag?" a="Any gap over 3 months that isn't labelled creates recruiter curiosity. Label career breaks, consulting periods, or sabbaticals with a clear title and 1–2 bullets explaining what you did." />
          </ReportSection>

          {/* ── Career Progression ── */}
          <ReportSection id="career-progression" icon="📈" title="Career Progression"
            issueCount={cs?.narrative_gaps?.length || 0}
            status={(cs?.clarity_score || 0) >= 75 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Recruiters want to see a career that makes sense — increasing scope, deepening expertise,
              and a clear direction. A resume that tells a coherent story is trusted faster than one
              that reads as a disconnected list of jobs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: (cs?.clarity_score || 0) >= 75 ? 'var(--green)' : 'var(--amber)', fontFamily: 'Sora,sans-serif', marginBottom: 4 }}>{cs?.clarity_score || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Clarity Score</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 3 }}>Direction</div>
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, marginBottom: 6 }}>
                  {cs?.career_direction?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>Brand consistency</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{cs?.brand_consistency}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14 }}>{cs?.career_arc_summary}</p>
            {cs?.narrative_gaps?.map((g: any, i: number) => <IssueItem key={i} text={g} type="warn" />)}
            <FAQ q="How do I show progression without title changes?" a="Show what expanded inside each role: larger budgets, more complex stakeholders, broader geography, higher-stakes decisions. Progression is about scope and impact, not just title." />
          </ReportSection>

          {/* Skill Evidence */}
          <ReportSection id="skill-evidence" icon="✅" title="Skill Evidence"
            issueCount={(sv?.unsupported_skills?.length || 0) + (sv?.weak_evidence_skills?.length || 0)}
            status={(sv?.unsupported_skills?.length || 0) === 0 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Every skill in your skills section needs to appear in your experience bullets. Recruiters
              compare the two — unsupported skills look like keyword stuffing and damage credibility.
              Skills with evidence build trust; skills without it create doubt.
            </p>
            {(sv?.verified_skills?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Verified — Evidence Found</div>
                <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {sv.verified_skills.slice(0, 10).map((s: any, i: number) => <span key={i} className="badge badge-green">✓ {safeStr(s)}</span>)}
                </div>
              </div>
            )}
            {(sv?.unsupported_skills?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>No Supporting Evidence Found</div>
                {sv.unsupported_skills.map((s: any, i: number) => (
                  <IssueItem key={i} text={`"${s}" listed in skills but never demonstrated in experience`} type="error" />
                ))}
              </div>
            )}
            {(sv?.weak_evidence_skills?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Thin Evidence</div>
                {sv.weak_evidence_skills.map((s: any, i: number) => (
                  <IssueItem key={i} text={`"${s}" mentioned once without context or outcome`} type="warn" />
                ))}
              </div>
            )}
            {(sv?.hidden_skills_detected?.length || 0) > 0 && (
              <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Add These to Your Skills Section</div>
                <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {sv.hidden_skills_detected.map((s: any, i: number) => <span key={i} className="badge badge-accent">{safeStr(s)}</span>)}
                </div>
              </div>
            )}
            <FAQ q="What do I do with unsupported skills?" a="Either add a bullet that demonstrates the skill in action, or remove it. A skill listed but never shown creates an expectation you cannot meet in the interview." />
          </ReportSection>

          {/* Leadership Signals */}
          <ReportSection id="leadership" icon="🎖️" title="Leadership Signals"
            issueCount={ls?.missing_signals?.length || 0}
            status={(ls?.score || 0) >= 75 ? 'pass' : (ls?.score || 0) >= 55 ? 'warn' : 'fail'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              For mid-to-senior roles, recruiters look past execution and search for evidence of ownership,
              influence, and strategic thinking. Candidates who only describe tasks get positioned lower
              than those who show they drove outcomes and influenced decisions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: (ls?.score || 0) >= 75 ? 'var(--green)' : 'var(--amber)', fontFamily: 'Sora,sans-serif', marginBottom: 4 }}>{ls?.score || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Leadership Score</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>Seniority alignment</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{ls?.seniority_alignment}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>Strategic ownership</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{ls?.strategic_ownership_strength}</div>
              </div>
            </div>
            {(ls?.signals_found?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Leadership Evidence Found</div>
                {ls.signals_found.map((s: any, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--green)', marginBottom: 6, display: 'flex', gap: 8 }}><span>✓</span><span>{safeStr(s)}</span></div>
                ))}
              </div>
            )}
            {(ls?.missing_signals?.length || 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Missing Leadership Evidence</div>
                {ls.missing_signals.map((s: any, i: number) => <IssueItem key={i} text={s} type="error" />)}
              </div>
            )}
            {(ls?.improvement_suggestions?.length || 0) > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>How to Strengthen Leadership Framing</div>
                {ls.improvement_suggestions.map((s: any, i: number) => <IssueItem key={i} text={s} type="info" />)}
              </div>
            )}
            <FAQ q="Can I show leadership without being a manager?" a="Yes. Leadership signals include: owning a project end-to-end, driving cross-functional decisions, managing vendor relationships with authority, or being the go-to expert for a strategic domain." />
            <FAQ q="What is people management strength?" a="Evidence that you have hired, managed, developed, or made performance decisions about other people. At senior levels, the absence of this makes recruiters question whether you can lead teams, not just processes." />
          </ReportSection>

          {/* Executive Presence */}
          <ReportSection id="executive-presence" icon="👔" title="Executive Presence"
            issueCount={(rr?.executive_presence_score || 0) < 70 ? 1 : 0}
            status={(rr?.executive_presence_score || 0) >= 75 ? 'pass' : 'warn'}>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
              Executive presence on a resume is the first impression a senior hiring manager forms before
              reading a single bullet — the combination of formatting confidence, language authority,
              career framing, and how you position your professional identity.
            </p>
            <div style={{ padding: '16px 20px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: (rr?.executive_presence_score || 0) >= 75 ? 'var(--green)' : 'var(--amber)', fontFamily: 'Sora,sans-serif' }}>
                    {rr?.executive_presence_score || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Presence Score</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Recruiter First Impression</div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic' }}>"{rr?.first_impression}"</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Trust Level</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99,
                background: rr?.trust_level === 'high' ? 'var(--green-dim)' : rr?.trust_level === 'medium' ? 'var(--amber-dim)' : 'var(--red-dim)',
                color: rr?.trust_level === 'high' ? 'var(--green)' : rr?.trust_level === 'medium' ? 'var(--amber)' : 'var(--red)',
                fontSize: 13, fontWeight: 600,
              }}>
                {rr?.trust_level === 'high' ? '✓ High Trust' : rr?.trust_level === 'medium' ? '⚠ Medium Trust' : '⛔ Low Trust'}
              </div>
            </div>
            {rr?.possible_concerns?.map((c: any, i: number) => <IssueItem key={i} text={c} type="warn" />)}
            <FAQ q="What signals executive presence on a resume?" a="Confident, direct language without hedging. Strategic framing at business level, not task level. A concise summary that positions you rather than listing duties. Clean structure that conveys control." />
          </ReportSection>

          {/* Footer nav */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', flexWrap: 'wrap', gap: 12,
          }}>
            <button className="btn btn-ghost" onClick={() => setStage(1)}>← Back to Upload</button>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => setStage(7)}>Skip → Export</button>
              <button className="btn btn-primary btn-lg" onClick={() => setStage(7)}>Job Match & Export →</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
