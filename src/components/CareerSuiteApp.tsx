'use client';
import { useCareerStore, Stage } from '@/store/career';
import StageUpload from './StageUpload';
import StageAnalysis from './StageAnalysis';
import StageReview from './StageReview';
import StageJobMatch from './StageJobMatch';
import StageExport from './StageExport';

const STAGES: { num: Stage; label: string; icon: string }[] = [
  { num: 1, label: 'Upload CV', icon: '📄' },
  { num: 2, label: 'Analysis', icon: '🔍' },
  { num: 3, label: 'Review', icon: '✏️' },
  { num: 4, label: 'Job Match', icon: '🎯' },
  { num: 5, label: 'Export', icon: '⬇️' },
];

function ProgressBar({ current }: { current: Stage }) {
  return (
    <div style={{ width: '100%', marginBottom: 40 }}>
      {/* Mobile: compact */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 0, position: 'relative', overflowX: 'auto', paddingBottom: 4 }}
      >
        {STAGES.map((s, i) => {
          const isDone = s.num < current;
          const isActive = s.num === current;
          const isLocked = s.num > current;

          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  width: 32,
                  height: 2,
                  background: isDone ? 'var(--accent)' : 'var(--bg3)',
                  transition: 'background 0.4s ease',
                  flexShrink: 0,
                }} />
              )}

              {/* Step bubble */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 38, height: 38,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--bg3)',
                  border: isActive ? '2px solid var(--accent-hover)' : isDone ? 'none' : '1px solid var(--border)',
                  fontSize: isDone ? 14 : 16,
                  fontWeight: 700,
                  color: isDone || isActive ? '#fff' : 'var(--text3)',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 0 0 4px var(--accent-dim)' : undefined,
                  flexShrink: 0,
                }}>
                  {isDone ? '✓' : s.icon}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : isDone ? 'var(--text2)' : 'var(--text3)',
                  whiteSpace: 'nowrap', textAlign: 'center',
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
    case 3: return <StageReview />;
    case 4: return <StageJobMatch />;
    case 5: return <StageExport />;
    default: return <StageUpload />;
  }
}

export default function CareerSuiteApp() {
  const { stage, handoff } = useCareerStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top nav */}
      <header style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>
            ✈️ ThoughtPilot
          </span>
          <span style={{ color: 'var(--border-strong)', fontSize: 16 }}>|</span>
          <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>Career Suite</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {handoff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
              }}>
                {handoff.user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{handoff.user.full_name}</span>
              <span className="badge badge-accent" style={{ fontSize: 11 }}>{handoff.user.plan}</span>
            </div>
          )}
          <a
            href={process.env.NEXT_PUBLIC_APP_URL || 'https://thoughtpilotai.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            ← ThoughtPilot
          </a>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '36px 24px', maxWidth: 960, margin: '0 auto' }}>
        <ProgressBar current={stage} />
        <StageContent stage={stage} />
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 60, padding: '24px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        fontSize: 12, color: 'var(--text3)',
      }}>
        ThoughtPilot Career Suite · Powered by Groq AI ·{' '}
        <a href="https://thoughtpilotai.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          thoughtpilotai.com
        </a>
      </footer>
    </div>
  );
}
