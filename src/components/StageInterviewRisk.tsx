'use client';
import { useState } from 'react';
import { useCareerStore } from '@/store/career';

const SEVERITY_COLOR: Record<string, string> = {
  high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)',
};
const SEVERITY_BG: Record<string, string> = {
  high: 'var(--red-dim)', medium: 'var(--amber-dim)', low: 'var(--green-dim)',
};
const SEVERITY_BORDER: Record<string, string> = {
  high: 'rgba(255,91,91,0.25)', medium: 'rgba(245,166,35,0.25)', low: 'rgba(45,212,160,0.25)',
};

function RiskCard({ risk, index }: { risk: any; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const color = SEVERITY_COLOR[risk.severity] || 'var(--amber)';
  const bg = SEVERITY_BG[risk.severity] || 'var(--amber-dim)';
  const border = SEVERITY_BORDER[risk.severity] || 'rgba(245,166,35,0.25)';

  return (
    <div className="animate-fade" style={{
      border: `1px solid ${border}`, borderRadius: 'var(--radius)',
      overflow: 'hidden', animationDelay: `${index * 0.05}s`,
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          background: bg, cursor: 'pointer',
        }}
        onClick={() => setOpen(!open)}
      >
        <div style={{
          padding: '2px 8px', borderRadius: 6,
          background: 'rgba(255,255,255,0.12)', fontSize: 11, fontWeight: 700,
          color, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0,
        }}>
          {risk.severity}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
            {risk.risk_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{risk.detected_issue}</div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '16px', background: 'var(--bg2)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Why Recruiters Ask
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{risk.why_recruiters_ask}</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                How to Fix It
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{risk.suggested_fix}</p>
            </div>
          </div>
          <div style={{
            background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.2)',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
              Sample Interview Question
            </div>
            <p style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic' }}>
              "{risk.sample_interview_question}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DefensibilityCard({ claim, index }: { claim: any; index: number }) {
  const color = SEVERITY_COLOR[claim.difficulty_level] || 'var(--amber)';
  return (
    <div className="animate-fade" style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '14px 16px', animationDelay: `${index * 0.05}s`,
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {claim.difficulty_level} difficulty
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>"{claim.claim}"</div>
      <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 8 }}>⚠ {claim.risk_reason}</div>
      <div style={{
        background: 'var(--green-dim)', border: '1px solid rgba(45,212,160,0.2)',
        borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--green)',
      }}>
        💡 {claim.prep_advice}
      </div>
    </div>
  );
}

export default function StageInterviewRisk() {
  const { intelligenceResult, setStage } = useCareerStore();
  if (!intelligenceResult) return null;

  const risks = intelligenceResult.interview_risks || [];
  const defensibility = intelligenceResult.interview_defensibility?.high_risk_claims || [];
  const highRisks = risks.filter(r => r.severity === 'high');
  const medRisks = risks.filter(r => r.severity === 'medium');
  const lowRisks = risks.filter(r => r.severity === 'low');

  return (
    <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>🎯 Interview Risk Analysis</h2>
        <p style={{ color: 'var(--text2)' }}>
          Claims and patterns that will trigger hard recruiter questions — and how to prepare.
        </p>
      </div>

      {/* Risk summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'High Risk', count: highRisks.length, color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,91,91,0.3)' },
          { label: 'Medium Risk', count: medRisks.length, color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'rgba(245,166,35,0.3)' },
          { label: 'Low Risk', count: lowRisks.length, color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(45,212,160,0.3)' },
        ].map((item) => (
          <div key={item.label} style={{
            background: item.bg, border: `1px solid ${item.border}`,
            borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: item.color, fontFamily: 'Sora,sans-serif' }}>
              {item.count}
            </div>
            <div style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Risk cards */}
      {risks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Interview Risk Flags ({risks.length})</h3>
          {[...highRisks, ...medRisks, ...lowRisks].map((risk, i) => (
            <RiskCard key={i} risk={risk} index={i} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--green)', fontSize: 14, marginBottom: 24 }}>
          ✓ No significant interview risks detected
        </div>
      )}

      {/* Defensibility */}
      {defensibility.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>🛡️ Interview Defensibility</h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
            Can you realistically defend these claims if challenged?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {defensibility.map((claim, i) => (
              <DefensibilityCard key={i} claim={claim} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Job match CTA */}
      <div style={{
        background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)', marginBottom: 4 }}>
            Ready to tailor for a specific role?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Paste a job description to get a match score, missing keywords, and a custom cover letter.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setStage(6)}>
          Job Match & Export →
        </button>
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(5)}>← Human Authenticity</button>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setStage(7)}>Skip → Export</button>
          <button className="btn btn-primary btn-lg" onClick={() => setStage(7)}>Job Match & Export →</button>
        </div>
      </div>
    </div>
  );
}
