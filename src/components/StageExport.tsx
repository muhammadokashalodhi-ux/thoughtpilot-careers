'use client';
import { useState } from 'react';
import { useCareerStore } from '@/store/career';
import { analyzeJobMatch } from '@/lib/groq';
import ScoreRing from './ScoreRing';

const PRIORITY_BADGE: Record<string, string> = {
  high: 'badge-red', medium: 'badge-amber', low: 'badge-neutral',
};

export default function StageExport() {
  const {
    getFinalCvText,
    handoff,
    jobDescription, setJobDescription,
    jobMatchResult, setJobMatchResult,
    jobMatchLoading, setJobMatchLoading,
    jobSuggestions, approveJobSuggestion, discardJobSuggestion,
    changes, setStage, intelligenceResult,
  } = useCareerStore();

  const [jdError, setJdError] = useState('');
  const cvText = getFinalCvText();
  const approvedCount = (changes || []).filter((c: any) => c.status === 'approved').length;

  const handleAnalyzeMatch = async () => {
    if (jobDescription.trim().length < 50) { setJdError('Paste the full job description (at least 50 words).'); return; }
    setJdError(''); setJobMatchLoading(true);
    try {
      const result = await analyzeJobMatch(cvText, jobDescription);
      setJobMatchResult(result);
    } catch (e: any) { setJdError(e.message || 'Job match failed — please retry.'); }
    finally { setJobMatchLoading(false); }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
        <h2 className="font-display" style={{ fontSize: 24, marginBottom: 8, letterSpacing: '-0.4px' }}>
          Job Match Analysis
        </h2>
        <p className="font-sans" style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
          Paste a job description to see how well your CV matches, what keywords are missing, and exactly what to add to stand out.
        </p>
        {intelligenceResult && (
          <div style={{ marginTop: 14, display: 'inline-flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '8px 20px', background: 'var(--green-soft)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99 }}>
            <span className="font-sans" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              ATS Score: {intelligenceResult.overall_score}/100 · Grade {intelligenceResult.grade}
            </span>
            {approvedCount > 0 && (
              <span className="font-sans" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, background: 'var(--accent-soft)', padding: '2px 10px', borderRadius: 100 }}>
                ✨ {approvedCount} improvement{approvedCount !== 1 ? 's' : ''} approved
              </span>
            )}
          </div>
        )}
      </div>

      {/* Job Match */}
      {!jobMatchResult ? (
        <div className="card-lg" style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <label className="font-display" style={{ display: 'block', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              Paste Job Description
            </label>
            <p className="font-sans" style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
              Copy the full job posting — the more detail the better the match analysis.
            </p>
          </div>
          <textarea
            className="input font-sans"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            rows={12}
            placeholder="Paste the full job description here — title, responsibilities, requirements…"
            style={{ fontSize: 13 }}
          />
          {jdError && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 6, fontSize: 13, color: 'var(--red)' }}>
              {jdError}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
            <span className="font-sans" style={{ fontSize: 12, color: 'var(--text3)' }}>
              {jobDescription.split(/\s+/).filter(Boolean).length} words
            </span>
            <button className="btn btn-primary font-display" onClick={handleAnalyzeMatch} disabled={jobMatchLoading}>
              {jobMatchLoading ? (
                <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Analysing match…</>
              ) : '🎯 Analyse Match'}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-scale">
          {/* Match score */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20 }}>
            <ScoreRing score={jobMatchResult.match_score} label="Job Match" size={100} showGrade={false} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 className="font-display" style={{ marginBottom: 6, fontSize: 16 }}>Match Analysis</h3>
              <p className="font-sans" style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.65, marginBottom: 12 }}>
                {jobMatchResult.gap_summary}
              </p>
              {jobMatchResult.missing_keywords?.length > 0 && (
                <div>
                  <div className="font-sans" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Missing keywords
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {jobMatchResult.missing_keywords.map((kw: string, i: number) => (
                      <span key={i} className="badge badge-amber">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-ghost btn-sm font-sans" onClick={() => setJobMatchResult(null)}>
              Re-analyse
            </button>
          </div>

          {/* Suggestions */}
          {jobSuggestions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 className="font-display" style={{ fontSize: 15, marginBottom: 4 }}>Tailoring Suggestions</h3>
              <p className="font-sans" style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
                Add these to your CV to improve your match score. Approve the ones relevant to your experience.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jobSuggestions.map((s: any) => (
                  <div key={s.id} style={{
                    background: s.status === 'approved' ? 'rgba(34,197,94,0.04)' : s.status === 'discarded' ? 'rgba(239,68,68,0.04)' : 'var(--bg2)',
                    border: `1px solid ${s.status === 'approved' ? 'rgba(34,197,94,0.3)' : s.status === 'discarded' ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: '12px 14px',
                    opacity: s.status === 'discarded' ? 0.5 : 1, transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-neutral font-sans">{s.section}</span>
                      <span className={`badge font-sans ${PRIORITY_BADGE[s.priority]}`}>{s.priority} priority</span>
                      {s.status === 'approved' && <span className="badge badge-green font-sans">✓ Added</span>}
                      {s.status === 'discarded' && <span className="badge badge-red font-sans">✕ Skipped</span>}
                    </div>
                    <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.suggestion}</div>
                    <div className="font-sans" style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, lineHeight: 1.5 }}>{s.reason}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-green btn-sm font-sans" onClick={() => approveJobSuggestion(s.id)} disabled={s.status === 'approved'}>✅ Add to CV</button>
                      <button className="btn btn-red btn-sm font-sans" onClick={() => discardJobSuggestion(s.id)} disabled={s.status === 'discarded'}>✕ Skip</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coming soon — export features */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>🚀</span>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Coming Soon</div>
            <div className="font-sans" style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>These features are in development and will be available soon</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { icon: '✍️', title: 'AI Cover Letter', desc: 'Auto-written from your CV and the job description' },
            { icon: '📄', title: 'CV Export PDF', desc: '5 professional templates, ATS-safe layout' },
            { icon: '📝', title: 'CV Export Word', desc: 'Edit-ready .docx with all improvements applied' },
            { icon: '🔗', title: 'LinkedIn Optimiser', desc: 'Match your CV to your LinkedIn profile' },
          ].map(f => (
            <div key={f.title} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>{f.title}</span>
                <span className="badge badge-neutral font-sans" style={{ fontSize: 10, marginLeft: 'auto' }}>Soon</span>
              </div>
              <p className="font-sans" style={{ fontSize: 12, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost font-sans" onClick={() => setStage(6)}>← Back to Report</button>
        <span className="font-sans" style={{ fontSize: 12, color: 'var(--text3)' }}>Recruiter Intelligence complete 🚀</span>
      </div>
    </div>
  );
}
