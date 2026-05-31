'use client';
import { useEffect, useRef, useState } from 'react';
import { useCareerStore } from '@/store/career';
import { analyzeResume, loadAnalysisFromCache } from '@/lib/groq';

const STEPS = [
  { label: 'Parsing resume structure', icon: '📄', duration: 700 },
  { label: 'Running ATS compatibility scan', icon: '⚡', duration: 800 },
  { label: 'Simulating recruiter first impression', icon: '👁️', duration: 900 },
  { label: 'Analysing leadership signals', icon: '🎖️', duration: 800 },
  { label: 'Evaluating credibility & metrics', icon: '🔬', duration: 900 },
  { label: 'Detecting human authenticity patterns', icon: '🧬', duration: 800 },
  { label: 'Scoring vocabulary & bullet quality', icon: '✍️', duration: 700 },
  { label: 'Identifying interview risks', icon: '⚠️', duration: 800 },
  { label: 'Benchmarking against peers', icon: '📊', duration: 700 },
  { label: 'Generating recruiter intelligence report', icon: '🧠', duration: 900 },
];

export default function StageAnalysis() {
  const { cvText, setIntelligenceResult, setChanges, setStage, setAnalysisError, analysisError } = useCareerStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let stepIdx = 0;
    const totalFake = STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;

    const advanceStep = () => {
      if (stepIdx >= STEPS.length) return;
      setCurrentStep(stepIdx);
      const dur = STEPS[stepIdx].duration;
      setTimeout(() => {
        setStepsDone((prev) => [...prev, stepIdx]);
        elapsed += dur;
        setProgress(Math.min(82, (elapsed / totalFake) * 82));
        stepIdx++;
        advanceStep();
      }, dur);
    };
    advanceStep();

    // Check sessionStorage cache first — avoids burning tokens on inactivity re-login
    const cached = loadAnalysisFromCache(cvText);
    if (cached) {
      console.log('[StageAnalysis] Using cached analysis result');
      const changes = cached.changes.map((c) => ({ ...c, status: 'pending' as const }));
      setIntelligenceResult(cached);
      setChanges(changes);
      setProgress(100);
      setDone(true);
      setTimeout(() => setStage(3), 800);
      return;
    }

    analyzeResume(cvText)
      .then((result) => {
        const changes = result.changes.map((c) => ({ ...c, status: 'pending' as const }));
        setIntelligenceResult(result);
        setChanges(changes);
        setProgress(100);
        setDone(true);
        setTimeout(() => setStage(3), 800);
      })
      .catch((err) => {
        setAnalysisError(err.message || 'Analysis failed. Please try again.');
      });
  }, []);

  if (analysisError) {
    return (
      <div className="animate-fade" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ marginBottom: 12 }}>Analysis Failed</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 24 }}>{analysisError}</p>
        <div className="flex gap-3 justify-center">
          <button className="btn btn-primary" onClick={() => { setAnalysisError(''); window.location.reload(); }}>
            Try Again
          </button>
          <button className="btn btn-ghost" onClick={() => setStage(1)}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: 580, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{done ? '🧠' : '🤖'}</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>
          {done ? 'Recruiter Intelligence Ready' : 'Running Recruiter Intelligence…'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          {done
            ? 'Your full recruiter intelligence report is ready.'
            : 'Simulating how a senior recruiter evaluates your resume across 18 dimensions.'}
        </p>
      </div>

      <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 6, marginBottom: 28, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--green))',
          borderRadius: 99, transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STEPS.map((step, i) => {
          const isDone = stepsDone.includes(i);
          const isActive = currentStep === i && !isDone;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: isDone ? 'var(--green-dim)' : isActive ? 'var(--accent-dim)' : 'var(--bg2)',
              border: `1px solid ${isDone ? 'rgba(45,212,160,0.25)' : isActive ? 'rgba(124,111,247,0.3)' : 'var(--border)'}`,
              transition: 'all 0.3s ease',
              opacity: i > currentStep + 1 ? 0.35 : 1,
            }}>
              <span style={{ fontSize: 16 }}>{step.icon}</span>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: isActive ? 500 : 400,
                color: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--text2)',
              }}>{step.label}</span>
              {isDone && <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>}
              {isActive && (
                <span style={{
                  width: 13, height: 13, borderRadius: '50%',
                  border: '2px solid var(--accent)', borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block',
                }} />
              )}
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text3)' }}>
        Groq · llama-3.3-70b-versatile · 18-dimension analysis
      </p>
    </div>
  );
}
