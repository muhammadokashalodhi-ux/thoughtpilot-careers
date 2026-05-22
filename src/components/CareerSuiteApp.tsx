'use client';
import { useCareerStore, Stage } from '@/store/career';
import StageUpload from './StageUpload';
import StageAnalysis from './StageAnalysis';
import StageATSIntelligence from './StageATSIntelligence';
import StageRecruiterIntelligence from './StageRecruiterIntelligence';
import StageHumanAuthenticity from './StageHumanAuthenticity';
import StageInterviewRisk from './StageInterviewRisk';
import StageJobMatch from './StageJobMatch';
import StageExport from './StageExport';

const STAGES: { num: Stage; label: string; icon: string }[] = [
  { num: 1, label: 'Upload', icon: '📄' },
  { num: 2, label: 'Scanning', icon: '🤖' },
  { num: 3, label: 'ATS Intel', icon: '⚡' },
  { num: 4, label: 'Recruiter', icon: '🧠' },
  { num: 5, label: 'Authenticity', icon: '🔍' },
  { num: 6, label: 'Interview', icon: '🎯' },
  { num: 7, label: 'Export', icon: '⬇️' },
];

function ProgressBar({ current }: { current: Stage }) {
  return (
    <div style={{ width: '100%', marginBottom: 36, overflowX: 'auto' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        gap: 0, minWidth: 480, padding: '4px 0 8px',
      }}>
        {STAGES.map((s, i) => {
          const isDone = s.num < current;
          const isActive = s.num === current;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start' }}>
              {i > 0 && (
                <div style={{
                  width: 28, height: 2, marginTop: 18,
                  background: isDone ? 'var(--accent)' : 'var(--bg3)',
                  transition: 'background 0.4s ease', flexShrink: 0,
                }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--bg3)',
                  border: isActive ? '2px solid var(--accent-hover)' : 'none',
                  fontSize: isDone ? 13 : 15, fontWeight: 700,
                  color: isDone || isActive ? '#fff' : 'var(--text3)',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 0 0 4px var(--accent-dim)' : undefined,
                  flexShrink: 0,
                }}>
                  {isDone ? '✓' : s.icon}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : isDone ? 'var(--text2)' : 'var(--text3)',
                  whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 56,
                  lineHeight: 1.2,
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageContent({ stage }: { stage: Stage }) {
  switch (stage) {
    case 1: return <StageUpload />;
    case 2: return <StageAnalysis />;
    case 3: return <StageATSIntelligence />;
    case 4: return <StageRecruiterIntelligence />;
    case 5: return <StageHumanAuthenticity />;
    case 6: return <StageInterviewRisk />;
    case 7: return <StageExport />;
    default: return <StageUpload />;
  }
}

export default function CareerSuiteApp() {
  const { stage, handoff } = useCareerStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>
            ✈️ ThoughtPilot
          </span>
          <span style={{ color: 'var(--border-strong)', fontSize: 16 }}>|</span>
          <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Recruiter Intelligence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {handoff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {handoff.user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{handoff.user.full_name}</span>
              <span className="badge badge-accent" style={{ fontSize: 10 }}>{handoff.user.plan}</span>
            </div>
          )}
          <a
            href={process.env.NEXT_PUBLIC_APP_URL || 'https://app.thoughtpilotai.com'}
            className="btn btn-ghost btn-sm"
          >← ThoughtPilot</a>
        </div>
      </header>

      <main style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <ProgressBar current={stage} />
        <StageContent stage={stage} />
      </main>

      <footer style={{
        marginTop: 60, padding: '20px 24px', textAlign: 'center',
        borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)',
      }}>
        ThoughtPilot Recruiter Intelligence · Powered by Groq AI ·{' '}
        <a href="https://thoughtpilotai.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          thoughtpilotai.com
        </a>
      </footer>
    </div>
  );
}
