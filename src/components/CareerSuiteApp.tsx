'use client';
import { useCareerStore, Stage } from '@/store/career';
import StageUpload from './StageUpload';
import StageAnalysis from './StageAnalysis';
import StageReport from './StageReport';
import StageExport from './StageExport';

const STAGES: { num: Stage; label: string; icon: string }[] = [
  { num: 1, label: 'Upload', icon: '📄' },
  { num: 2, label: 'Scanning', icon: '🤖' },
  { num: 3, label: 'Full Report', icon: '📊' },
  { num: 7, label: 'Export', icon: '⬇️' },
];

function ProgressBar({ current }: { current: Stage }) {
  const displayStages = STAGES;
  const currentIndex = displayStages.findIndex(s => s.num === current);

  return (
    <div style={{ width: '100%', marginBottom: 32, overflowX: 'auto' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        gap: 0, minWidth: 320, padding: '4px 0 8px',
      }}>
        {displayStages.map((s, i) => {
          const isDone = currentIndex > i;
          const isActive = currentIndex === i;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start' }}>
              {i > 0 && (
                <div style={{
                  width: 48, height: 2, marginTop: 18,
                  background: isDone ? 'var(--accent)' : 'var(--bg3)',
                  transition: 'background 0.4s ease', flexShrink: 0,
                }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--bg3)',
                  border: isActive ? '2px solid var(--accent-hover)' : 'none',
                  fontSize: isDone ? 14 : 16, fontWeight: 700,
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
    // Stages 3, 4, 5, 6 all show the unified report
    case 3:
    case 4:
    case 5:
    case 6: return <StageReport />;
    case 7: return <StageExport />;
    default: return <StageUpload />;
  }
}

export default function CareerSuiteApp() {
  const { stage, handoff } = useCareerStore();

  // Determine which progress step to highlight
  const progressStage: Stage = (stage >= 3 && stage <= 6) ? 3 : stage;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Progress bar sits just below the fixed navbar from page.tsx */}
      <div style={{
        position: 'sticky', top: 'calc(60px + env(safe-area-inset-top, 0px))',
        zIndex: 90, background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 24px',
      }}>
        <ProgressBar current={progressStage} />
      </div>

      <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
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
