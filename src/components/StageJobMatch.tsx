'use client';
import { useState } from 'react';
import { useCareerStore, SuggestionPriority } from '@/store/career';
import { analyzeJobMatch, generateCoverLetter } from '@/lib/groq';
import ScoreRing from './ScoreRing';

const PRIORITY_BADGE: Record<SuggestionPriority, string> = {
  high: 'badge-red',
  medium: 'badge-amber',
  low: 'badge-neutral',
};

export default function StageJobMatch() {
  const {
    jobDescription, setJobDescription,
    jobMatchResult, setJobMatchResult,
    jobMatchLoading, setJobMatchLoading,
    jobSuggestions,
    approveJobSuggestion, discardJobSuggestion,
    coverLetter, setCoverLetter,
    coverLetterLoading, setCoverLetterLoading,
    setStage, handoff, getFinalCvText,
  } = useCareerStore();

  const [jdError, setJdError] = useState('');
  const [clError, setClError] = useState('');
  const [coverLetterEditing, setCoverLetterEditing] = useState(false);

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 50) {
      setJdError('Please paste the full job description (at least 50 characters).');
      return;
    }
    setJdError('');
    setJobMatchLoading(true);
    try {
      const result = await analyzeJobMatch(getFinalCvText(), jobDescription);
      setJobMatchResult(result);
    } catch (e: any) {
      setJdError(e.message || 'Job match analysis failed.');
    } finally {
      setJobMatchLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setCoverLetterLoading(true);
    setClError('');
    try {
      const approvedSuggestions = jobSuggestions
        .filter((s) => s.status === 'approved')
        .map((s) => s.suggestion);
      const cl = await generateCoverLetter(
        getFinalCvText(),
        jobDescription,
        handoff?.user.full_name || 'Applicant',
        handoff?.profile?.role || 'Professional',
        approvedSuggestions,
      );
      setCoverLetter(cl);
    } catch (e: any) {
      setClError(e.message || 'Cover letter generation failed.');
    } finally {
      setCoverLetterLoading(false);
    }
  };

  const approved = jobSuggestions.filter((s) => s.status === 'approved').length;
  const discarded = jobSuggestions.filter((s) => s.status === 'discarded').length;
  const pending = jobSuggestions.filter((s) => s.status === 'pending').length;

  return (
    <div className="animate-fade" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Job Match Analysis</h2>
        <p style={{ color: 'var(--text2)' }}>Paste the job description to see how well your CV matches and get tailored suggestions.</p>
      </div>

      {/* JD input */}
      {!jobMatchResult && (
        <div className="card-lg" style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 10 }}>
            Job Description
          </label>
          <textarea
            className="input"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            placeholder="Paste the full job description here…

We're looking for a Senior Product Manager with 5+ years of experience…"
            style={{ fontSize: 13, lineHeight: 1.6 }}
          />
          {jdError && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--red)' }}>{jdError}</div>
          )}
          <div className="flex items-center justify-between" style={{ marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>
              {jobDescription.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={jobMatchLoading}
            >
              {jobMatchLoading ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Analysing…
                </>
              ) : '🎯 Analyse Match'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {jobMatchResult && (
        <div className="animate-scale">
          {/* Score + summary */}
          <div style={{
            display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
          }}>
            <ScoreRing score={jobMatchResult.match_score} label="Job Match" size={110} showGrade={false} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ marginBottom: 8 }}>Match Analysis</h3>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                {jobMatchResult.gap_summary}
              </p>
              {jobMatchResult.missing_keywords.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 6 }}>
                    Missing from your CV:
                  </div>
                  <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {jobMatchResult.missing_keywords.map((kw, i) => (
                      <span key={i} className="badge badge-amber">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setJobMatchResult(null)}
            >
              Re-analyse
            </button>
          </div>

          {/* Suggestions */}
          <div style={{ marginBottom: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>Tailoring Suggestions ({jobSuggestions.length})</h3>
                <div className="flex gap-3">
                  <span style={{ fontSize: 13, color: 'var(--green)' }}>✓ {approved}</span>
                  <span style={{ fontSize: 13, color: 'var(--red)' }}>✕ {discarded}</span>
                  <span style={{ fontSize: 13, color: 'var(--text3)' }}>⏳ {pending}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jobSuggestions.map((s, i) => (
                <div
                  key={s.id}
                  className="animate-fade"
                  style={{
                    background: s.status === 'approved' ? 'rgba(45,212,160,0.04)' : s.status === 'discarded' ? 'rgba(255,91,91,0.04)' : 'var(--bg2)',
                    border: `1px solid ${s.status === 'approved' ? 'rgba(45,212,160,0.3)' : s.status === 'discarded' ? 'rgba(255,91,91,0.25)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '14px 16px',
                    opacity: s.status === 'discarded' ? 0.5 : 1,
                    animationDelay: `${i * 0.05}s`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div className="flex gap-2 items-center">
                      <span className="badge badge-neutral">{s.section}</span>
                      <span className={`badge ${PRIORITY_BADGE[s.priority]}`}>
                        {s.priority.charAt(0).toUpperCase() + s.priority.slice(1)} Priority
                      </span>
                      {s.status === 'approved' && <span className="badge badge-green">✓ Added</span>}
                      {s.status === 'discarded' && <span className="badge badge-red">✕ Skipped</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.suggestion}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{s.reason}</div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => approveJobSuggestion(s.id)}
                      disabled={s.status === 'approved'}
                    >✅ Add to CV</button>
                    <button
                      className="btn btn-red btn-sm"
                      onClick={() => discardJobSuggestion(s.id)}
                      disabled={s.status === 'discarded'}
                    >✕ Skip</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          <div className="card-lg" style={{ marginBottom: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>Cover Letter</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                  AI-written using your CV + approved suggestions
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerateCoverLetter}
                disabled={coverLetterLoading}
              >
                {coverLetterLoading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Writing…
                  </>
                ) : coverLetter ? '🔄 Regenerate' : '✍️ Generate Cover Letter'}
              </button>
            </div>

            {clError && (
              <div style={{ padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,91,91,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>
                {clError}
              </div>
            )}

            {coverLetter && (
              <div className="animate-fade">
                {coverLetterEditing ? (
                  <textarea
                    className="input"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={14}
                    style={{ fontSize: 14, lineHeight: 1.7 }}
                  />
                ) : (
                  <div style={{
                    background: 'var(--bg3)', borderRadius: 10, padding: '20px 24px',
                    fontSize: 14, lineHeight: 1.75, color: 'var(--text)',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid var(--border)',
                  }}>
                    {coverLetter}
                  </div>
                )}
                <div className="flex gap-2" style={{ marginTop: 12 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCoverLetterEditing(!coverLetterEditing)}
                  >
                    {coverLetterEditing ? '💾 Save edits' : '✏️ Edit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(3)}>
          ← Back to Review
        </button>
        <button className="btn btn-primary btn-lg" onClick={() => setStage(5)}>
          Proceed to Export →
        </button>
      </div>
    </div>
  );
}
