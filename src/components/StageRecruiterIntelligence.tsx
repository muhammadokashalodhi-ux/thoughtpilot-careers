'use client';
import { useCareerStore } from '@/store/career';
import ScoreRing from './ScoreRing';

function TrustGauge({ level }: { level: string }) {
  const map: Record<string, { color: string; pct: number; label: string }> = {
    high:   { color: 'var(--green)', pct: 88, label: 'High Trust' },
    medium: { color: 'var(--amber)', pct: 55, label: 'Medium Trust' },
    low:    { color: 'var(--red)',   pct: 22, label: 'Low Trust' },
  };
  const v = map[level] || map.medium;
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>Recruiter Trust Level</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.label}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${v.pct}%`, background: v.color, borderRadius: 99, transition: 'width 1.2s ease' }} />
      </div>
    </div>
  );
}

function SignalRow({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 14, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, color, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

export default function StageRecruiterIntelligence() {
  const { intelligenceResult, setStage } = useCareerStore();
  if (!intelligenceResult) return null;

  const r = intelligenceResult;
  const rr = r.recruiter_reaction;
  const ca = r.credibility_analysis;
  const ls = r.leadership_signals;
  const cs = r.career_story;
  const hc = r.hiring_confidence;

  return (
    <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>🧠 Recruiter Intelligence</h2>
        <p style={{ color: 'var(--text2)' }}>How a senior recruiter experiences your resume — their internal monologue.</p>
      </div>

      {/* First impression card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-dim), var(--bg2))',
        border: '1px solid rgba(124,111,247,0.3)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: 40, width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>🧑‍💼</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Recruiter First Impression · {rr?.recruiter_read_time_estimate || '6–8 seconds'}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 14 }}>
              "{rr?.first_impression}"
            </p>
            <TrustGauge level={rr?.trust_level || 'medium'} />
          </div>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Sora,sans-serif' }}>
              {rr?.executive_presence_score || 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Executive Presence</div>
          </div>
        </div>
        {rr?.possible_concerns?.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(124,111,247,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Possible Recruiter Concerns
            </div>
            <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              {rr.possible_concerns.map((c: string, i: number) => (
                <span key={i} className="badge badge-amber">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16, marginBottom: 20 }}>

        {/* Credibility */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>🔬 Credibility</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: ca?.score >= 75 ? 'var(--green)' : ca?.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
              {ca?.score || 0}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{ca?.overall_assessment}</p>
          {ca?.strong_signals?.slice(0, 3).map((s: string, i: number) => (
            <SignalRow key={i} icon="✓" text={s} color="var(--green)" />
          ))}
          {ca?.suspicious_claims?.slice(0, 2).map((s: string, i: number) => (
            <SignalRow key={i} icon="⚠" text={s} color="var(--amber)" />
          ))}
        </div>

        {/* Leadership */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>🎖️ Leadership</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: ls?.score >= 75 ? 'var(--green)' : ls?.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
              {ls?.score || 0}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            <strong>Seniority:</strong> {ls?.seniority_alignment}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
            <strong>Strategic ownership:</strong> {ls?.strategic_ownership_strength}
          </p>
          {ls?.signals_found?.slice(0, 3).map((s: string, i: number) => (
            <SignalRow key={i} icon="✓" text={s} color="var(--green)" />
          ))}
          {ls?.missing_signals?.slice(0, 2).map((s: string, i: number) => (
            <SignalRow key={i} icon="✕" text={s} color="var(--red)" />
          ))}
        </div>

        {/* Career Story */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>📖 Career Story</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: cs?.clarity_score >= 75 ? 'var(--green)' : cs?.clarity_score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
              {cs?.clarity_score || 0}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{cs?.career_arc_summary}</p>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: 'var(--text3)' }}>Direction: </span>
            <span style={{ color: 'var(--text2)', fontWeight: 500 }}>
              {cs?.career_direction?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div style={{ fontSize: 12, marginBottom: 10 }}>
            <span style={{ color: 'var(--text3)' }}>Brand: </span>
            <span style={{ color: 'var(--text2)' }}>{cs?.brand_consistency}</span>
          </div>
          {cs?.narrative_gaps?.map((g: string, i: number) => (
            <SignalRow key={i} icon="⚠" text={g} color="var(--amber)" />
          ))}
        </div>
      </div>

      {/* Hidden recruiter concerns — highest value section */}
      {r.hidden_recruiter_concerns?.length > 0 && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid rgba(255,91,91,0.25)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🔮</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Hidden Recruiter Concerns</span>
            <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 4 }}>
              — things recruiters think but never say
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {r.hidden_recruiter_concerns.map((c: string, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', background: 'var(--red-dim)',
                border: '1px solid rgba(255,91,91,0.2)', borderRadius: 8,
              }}>
                <span style={{ color: 'var(--red)', fontSize: 14, marginTop: 1 }}>👁</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill validation */}
      {r.skill_validation && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>✅ Verified Skills</div>
            {r.skill_validation.verified_skills?.slice(0, 6).map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--green)', marginBottom: 4 }}>✓ {s}</div>
            ))}
            {r.skill_validation.unsupported_skills?.length > 0 && (
              <>
                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 10, marginBottom: 8, color: 'var(--red)' }}>Unsupported Skills</div>
                {r.skill_validation.unsupported_skills.map((s: string, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--red)', marginBottom: 4 }}>✕ {s}</div>
                ))}
              </>
            )}
          </div>
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>📝 Vocabulary Analysis</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
              Variety Score: <strong style={{ color: 'var(--accent)' }}>{r.vocabulary_analysis?.variety_score}/100</strong>
            </div>
            {r.vocabulary_analysis?.repeated_words?.slice(0, 4).map((w: any, i: number) => (
              <div key={i} style={{ marginBottom: 8, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)' }}>
                  "{w.word}" used {w.count}× — try: {w.alternatives?.slice(0,3).join(', ')}
                </div>
              </div>
            ))}
            {r.vocabulary_analysis?.weak_phrases?.slice(0, 3).map((p: string, i: number) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 3 }}>⚠ Weak: "{p}"</div>
            ))}
          </div>
        </div>
      )}

      {/* Hiring confidence breakdown */}
      <div className="card-lg" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>🎯 Hiring Confidence Breakdown</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <ScoreRing score={hc?.score || 0} size={100} showGrade={false} label="Hire Confidence" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ marginBottom: 12 }}>
              {hc?.top_strengths?.map((s: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--green)', marginBottom: 6 }}>✓ {s}</div>
              ))}
            </div>
            <div>
              {hc?.top_concerns?.map((c: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--amber)', marginBottom: 6 }}>⚠ {c}</div>
              ))}
            </div>
          </div>
        </div>
        {hc?.recruiter_first_impression && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
            "{hc.recruiter_first_impression}"
          </div>
        )}
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(3)}>← ATS Intelligence</button>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setStage(7)}>Skip → Export</button>
          <button className="btn btn-primary btn-lg" onClick={() => setStage(5)}>Human Authenticity →</button>
        </div>
      </div>
    </div>
  );
}
