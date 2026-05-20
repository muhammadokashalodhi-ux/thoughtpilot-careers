'use client';
import { useEffect, useState, useRef } from 'react';
import { useCareerStore } from '@/store/career';
import { analyzeCV } from '@/lib/groq';

const STEPS = [
  { label: 'Parsing CV structure', icon: '📄', duration: 800 },
  { label: 'Scanning action verbs', icon: '💬', duration: 900 },
  { label: 'Checking ATS keywords', icon: '🔍', duration: 1000 },
  { label: 'Analysing quantification', icon: '📊', duration: 900 },
  { label: 'Reviewing formatting', icon: '🎨', duration: 700 },
  { label: 'Identifying skill gaps', icon: '🧩', duration: 800 },
  { label: 'Scoring 10 dimensions', icon: '⚡', duration: 1000 },
  { label: 'Generating improvements', icon: '✨', duration: 600 },
];

export default function StageAnalysis() {
  const { cvText, setAtsResult, setChanges, setStage, setAnalysisError, analysisError } = useCareerStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let stepIdx = 0;
    let totalElapsed = 0;
    const totalFake = STEPS.reduce((a, s) => a + s.duration, 0);

    // Animate fake steps in parallel with real API call
    const advanceStep = () => {
      if (stepIdx >= STEPS.length) return;
      setCurrentStep(stepIdx);
      setTimeout(() => {
        setStepsDone((prev) => [...prev, stepIdx]);
        stepIdx++;
        totalElapsed += STEPS[stepIdx - 1]?.duration ?? 0;
        setProgress(Math.min(85, (totalElapsed / totalFake) * 85));
        advanceStep();
      }, STEPS[stepIdx]?.duration ?? 800);
    };
    advanceStep();

    // Real API call
    analyzeCV(cvText)
      .then((result) => {
        setProgress(100);
        setDone(true);
        // Attach status to changes
        const changes = result.changes.map((c) => ({ ...c, status: 'pending' as const }));
        setAtsResult(result);
        setChanges(changes);
        setTimeout(() => setStage(3), 900);
      })
      .catch((err) => {
        setAnalysisError(err.message || 'Analysis failed. Please try again.');
        setProgress(0);
      });
  }, []);

  if (analysisError) {
    return (
      <div className="animate-fade" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ marginBottom: 12 }}>Analysis Failed</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 24 }}>{analysisError}</p>
        <div className="flex gap-3 justify-center">
          <button className="btn btn-primary" onClick={() => { setAnalysisError(''); setStage(2); window.location.reload(); }}>
            Try Again
          </button>
          <button className="btn btn-ghost" onClick={() => setStage(1)}>← Back to Upload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {done ? '🎉' : '🤖'}
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>
          {done ? 'Analysis Complete!' : 'Analysing Your CV…'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          {done
            ? 'Your detailed ATS report is ready.'
            : 'Our AI is scanning your CV across 10 dimensions.'}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--bg3)',
        borderRadius: 99,
        height: 6,
        marginBottom: 32,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--green))',
          borderRadius: 99,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map((step, i) => {
          const isDone = stepsDone.includes(i);
          const isActive = currentStep === i && !isDone;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isDone ? 'var(--green-dim)' : isActive ? 'var(--accent-dim)' : 'var(--bg2)',
                border: `1px solid ${isDone ? 'rgba(45,212,160,0.25)' : isActive ? 'rgba(124,111,247,0.3)' : 'var(--border)'}`,
                transition: 'all 0.3s ease',
                opacity: i > currentStep + 1 ? 0.4 : 1,
              }}
            >
              <span style={{ fontSize: 18 }}>{step.icon}</span>
              <span style={{
                flex: 1,
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--text2)',
              }}>
                {step.label}
              </span>
              {isDone && <span style={{ color: 'var(--green)', fontSize: 16 }}>✓</span>}
              {isActive && (
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid var(--accent)',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text3)' }}>
        Powered by Groq · llama-3.3-70b-versatile
      </p>
    </div>
  );
}
