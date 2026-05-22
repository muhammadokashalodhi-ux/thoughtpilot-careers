'use client';
import { useState } from 'react';
import { useCareerStore } from '@/store/career';

function AuthenticityMeter({ score, riskLevel }: { score: number; riskLevel: string }) {
  const color = riskLevel === 'low' ? 'var(--green)' : riskLevel === 'medium' ? 'var(--amber)' : 'var(--red)';
  const label = riskLevel === 'low' ? 'Sounds Human ✓' : riskLevel === 'medium' ? 'Some AI Patterns' : 'High AI-Pattern Risk';
  return (
    <div style={{ textAlign: 'center', padding: '24px 20px' }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%', margin: '0 auto 12px',
        background: `conic-gradient(${color} ${score * 3.6}deg, var(--bg3) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%', background: 'var(--bg2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Sora,sans-serif' }}>{score}</span>
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Authenticity Score</div>
    </div>
  );
}

export default function StageHumanAuthenticity() {
  const { intelligenceResult, setStage } = useCareerStore();
  const [openSuggestion, setOpenSuggestion] = useState<number | null>(null);
  if (!intelligenceResult) return null;

  const ha = intelligenceResult.human_authenticity;
  const pc = intelligenceResult.professionalism_checks;
  const bq = intelligenceResult.bullet_quality;

  return (
    <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>🔍 Human Authenticity Analysis</h2>
        <p style={{ color: 'var(--text2)' }}>
          Detect AI-like writing patterns that reduce recruiter trust — and how to sound more human.
        </p>
      </div>

      {/* Authenticity meter + summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24,
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20,
        alignItems: 'center',
      }}>
        <AuthenticityMeter score={ha?.score || 0} riskLevel={ha?.risk_level || 'medium'} />
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>Authenticity Assessment</h3>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14 }}>
            {ha?.authenticity_summary}
          </p>
          {ha?.recruiter_suspicion_triggers?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Recruiter Suspicion Triggers
              </div>
              <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                {ha.recruiter_suspicion_triggers.map((t: string, i: number) => (
                  <span key={i} className="badge badge-amber">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI-like patterns */}
      {ha?.ai_like_patterns?.length > 0 && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>🤖 AI-Like Patterns Detected</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ha.ai_like_patterns.map((p: string, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', background: 'var(--amber-dim)',
                border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8,
              }}>
                <span style={{ color: 'var(--amber)', fontSize: 14, marginTop: 1 }}>⚠</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Humanization suggestions */}
      {ha?.humanization_suggestions?.length > 0 && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>✍️ Humanization Suggestions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ha.humanization_suggestions.map((s: any, i: number) => (
              <div key={i} style={{
                border: '1px solid var(--border)', borderRadius: 10,
                overflow: 'hidden', cursor: 'pointer',
              }} onClick={() => setOpenSuggestion(openSuggestion === i ? null : i)}>
                <div style={{ padding: '12px 16px', background: 'var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Suggestion {i + 1}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{openSuggestion === i ? '▲ Hide' : '▼ Show'}</span>
                </div>
                {openSuggestion === i && (
                  <div style={{ padding: '14px 16px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>Replace</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--red-dim)', padding: '8px 12px', borderRadius: 6, textDecoration: 'line-through' }}>
                        {s.replace}
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>With</div>
                      <div style={{ fontSize: 13, color: 'var(--green)', background: 'var(--green-dim)', padding: '8px 12px', borderRadius: 6 }}>
                        {s.with}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>💡 {s.reason}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bullet quality + professionalism */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>📋 Bullet Quality</div>
          {bq?.weak_openings?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, marginBottom: 6 }}>WEAK OPENINGS</div>
              {bq.weak_openings.slice(0, 4).map((w: string, i: number) => (
                <span key={i} className="badge badge-amber" style={{ marginRight: 4, marginBottom: 4 }}>{w}</span>
              ))}
            </div>
          )}
          {bq?.passive_voice?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>PASSIVE VOICE</div>
              {bq.passive_voice.slice(0, 2).map((p: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>"{p}"</div>
              ))}
            </div>
          )}
          {bq?.generic_bullets?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>GENERIC BULLETS</div>
              {bq.generic_bullets.slice(0, 2).map((b: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>— "{b.slice(0, 60)}…"</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--accent-dim)', borderRadius: 6, fontSize: 12, color: 'var(--accent)' }}>
            💡 Best structure: {bq?.recommended_structure}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>🧹 Professionalism</div>
          {[
            { label: 'Date Consistency', val: pc?.date_consistency },
            { label: 'Email', val: pc?.email_professionalism },
            { label: 'Links', val: pc?.link_quality },
            { label: 'Formatting', val: pc?.formatting_consistency },
            { label: 'Presentation', val: pc?.presentation_quality },
          ].map((item, i) => (
            item.val && (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{item.label}: </span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{item.val}</span>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(4)}>← Recruiter Intelligence</button>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setStage(7)}>Skip → Export</button>
          <button className="btn btn-primary btn-lg" onClick={() => setStage(6)}>Interview Risks →</button>
        </div>
      </div>
    </div>
  );
}
