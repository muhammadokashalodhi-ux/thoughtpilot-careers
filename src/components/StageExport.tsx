'use client';
import { useState } from 'react';
import axios from 'axios';
import { useCareerStore, ExportTemplate } from '@/store/career';
import { analyzeJobMatch, generateCoverLetter } from '@/lib/groq';
import TemplatePreview from './TemplatePreview';
import ScoreRing from './ScoreRing';
import { exportAsPDF, exportAsWord, exportCoverLetter } from '@/lib/export';
import { launchConfetti } from '@/lib/confetti';

const TEMPLATES: ExportTemplate[] = ['classic', 'modern', 'minimal', 'executive', 'compact'];

const PRIORITY_BADGE: Record<string, string> = {
  high: 'badge-red', medium: 'badge-amber', low: 'badge-neutral',
};

export default function StageExport() {
  const {
    selectedTemplate, setSelectedTemplate,
    getFinalCvText, handoff, coverLetter, setCoverLetter,
    jobDescription, setJobDescription,
    jobMatchResult, setJobMatchResult,
    jobMatchLoading, setJobMatchLoading,
    jobSuggestions, approveJobSuggestion, discardJobSuggestion,
    coverLetterLoading, setCoverLetterLoading,
    setStage, intelligenceResult,
  } = useCareerStore();

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [exported, setExported] = useState(false);
  const [jdError, setJdError] = useState('');
  const [clError, setClError] = useState('');
  const [tab, setTab] = useState<'jobmatch' | 'export'>('export');

  const cvText = getFinalCvText();
  const userName = handoff?.user.full_name || 'Your Name';
  const plan = handoff?.user.plan || 'free';

  const handleAnalyzeMatch = async () => {
    if (jobDescription.trim().length < 50) { setJdError('Paste the full job description.'); return; }
    setJdError(''); setJobMatchLoading(true);
    try {
      const result = await analyzeJobMatch(cvText, jobDescription);
      setJobMatchResult(result);
    } catch (e: any) { setJdError(e.message || 'Job match failed.'); }
    finally { setJobMatchLoading(false); }
  };

  const handleGenerateCoverLetter = async () => {
    setCoverLetterLoading(true); setClError('');
    try {
      const approved = jobSuggestions.filter(s => s.status === 'approved').map(s => s.suggestion);
      const cl = await generateCoverLetter(cvText, jobDescription, userName, handoff?.profile?.role || 'Professional', approved);
      setCoverLetter(cl);
    } catch (e: any) { setClError(e.message || 'Cover letter generation failed.'); }
    finally { setCoverLetterLoading(false); }
  };

  const handleExportPDF = () => { exportAsPDF({ cvText, userName, template: selectedTemplate }); setExported(true); launchConfetti(3000); };
  const handleExportWord = () => { exportAsWord({ cvText, userName, template: selectedTemplate }); setExported(true); launchConfetti(2500); };

  const handleSaveToProfile = async () => {
    if (!handoff) return;
    setSaving(true); setSaveMsg('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/career/save-cv`,
        { cv_text: cvText }, { withCredentials: true });
      setSaveMsg('✓ Saved to your ThoughtPilot profile!');
      launchConfetti(2000);
    } catch { setSaveMsg('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Job Match & Export</h2>
        <p style={{ color: 'var(--text2)' }}>Tailor your CV for a specific role, then export in your chosen template.</p>
        {intelligenceResult && (
          <div style={{ marginTop: 10, display: 'inline-flex', gap: 16, alignItems: 'center', padding: '6px 16px', background: 'var(--green-dim)', border: '1px solid rgba(45,212,160,0.3)', borderRadius: 99 }}>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
              ATS Score: {intelligenceResult.overall_score}/100 · Grade {intelligenceResult.grade} · Hiring Confidence: {intelligenceResult.hiring_confidence?.score}/100
            </span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
        {([['jobmatch', '🎯 Job Match (Optional)'], ['export', '📄 Export CV']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 500, transition: 'all 0.15s ease',
            background: tab === t ? 'var(--bg2)' : 'transparent',
            color: tab === t ? 'var(--text)' : 'var(--text2)',
            boxShadow: tab === t ? 'var(--shadow)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* ── JOB MATCH TAB ── */}
      {tab === 'jobmatch' && (
        <div className="animate-fade">
          {!jobMatchResult ? (
            <div className="card-lg" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 10 }}>Paste Job Description</label>
              <textarea className="input" value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                rows={12} placeholder="Paste the full job description here…" style={{ fontSize: 13 }} />
              {jdError && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--red)' }}>{jdError}</div>}
              <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{jobDescription.split(/\s+/).filter(Boolean).length} words</span>
                <button className="btn btn-primary" onClick={handleAnalyzeMatch} disabled={jobMatchLoading}>
                  {jobMatchLoading ? <><span style={{ width:13,height:13,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite',display:'inline-block' }} /> Analysing…</> : '🎯 Analyse Match'}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-scale">
              {/* Match score */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20 }}>
                <ScoreRing score={jobMatchResult.match_score} label="Job Match" size={100} showGrade={false} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ marginBottom: 6 }}>Match Analysis</h3>
                  <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{jobMatchResult.gap_summary}</p>
                  {jobMatchResult.missing_keywords?.length > 0 && (
                    <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                      {jobMatchResult.missing_keywords.map((kw, i) => <span key={i} className="badge badge-amber">{kw}</span>)}
                    </div>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setJobMatchResult(null)}>Re-analyse</button>
              </div>

              {/* Suggestions */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, marginBottom: 12 }}>Tailoring Suggestions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {jobSuggestions.map((s, i) => (
                    <div key={s.id} style={{
                      background: s.status === 'approved' ? 'rgba(45,212,160,0.04)' : s.status === 'discarded' ? 'rgba(255,91,91,0.04)' : 'var(--bg2)',
                      border: `1px solid ${s.status === 'approved' ? 'rgba(45,212,160,0.3)' : s.status === 'discarded' ? 'rgba(255,91,91,0.25)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)', padding: '12px 14px',
                      opacity: s.status === 'discarded' ? 0.5 : 1, transition: 'all 0.2s ease',
                    }}>
                      <div className="flex gap-2 items-center" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-neutral">{s.section}</span>
                        <span className={`badge ${PRIORITY_BADGE[s.priority]}`}>{s.priority} priority</span>
                        {s.status === 'approved' && <span className="badge badge-green">✓ Added</span>}
                        {s.status === 'discarded' && <span className="badge badge-red">✕ Skipped</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.suggestion}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>{s.reason}</div>
                      <div className="flex gap-2">
                        <button className="btn btn-green btn-sm" onClick={() => approveJobSuggestion(s.id)} disabled={s.status === 'approved'}>✅ Add</button>
                        <button className="btn btn-red btn-sm" onClick={() => discardJobSuggestion(s.id)} disabled={s.status === 'discarded'}>✕ Skip</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover letter */}
              <div className="card-lg" style={{ marginBottom: 20 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15 }}>Cover Letter</h3>
                    <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>AI-written from your CV + approved suggestions</p>
                  </div>
                  <button className="btn btn-primary" onClick={handleGenerateCoverLetter} disabled={coverLetterLoading}>
                    {coverLetterLoading ? <><span style={{ width:13,height:13,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite',display:'inline-block' }} /> Writing…</> : coverLetter ? '🔄 Regenerate' : '✍️ Generate'}
                  </button>
                </div>
                {clError && <div style={{ padding:'10px 14px', background:'var(--red-dim)', borderRadius:8, fontSize:13, color:'var(--red)', marginBottom:10 }}>{clError}</div>}
                {coverLetter && (
                  <div className="animate-fade">
                    <div style={{ background:'var(--bg3)', borderRadius:10, padding:'18px 22px', fontSize:13, lineHeight:1.75, whiteSpace:'pre-wrap', border:'1px solid var(--border)', maxHeight:300, overflowY:'auto', marginBottom:10 }}>
                      {coverLetter}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => exportCoverLetter(coverLetter, userName)}>📄 Export Cover Letter</button>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={() => setTab('export')}>Proceed to Export →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {tab === 'export' && (
        <div className="animate-fade">
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Choose Template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
              {TEMPLATES.map(t => (
                <TemplatePreview key={t} template={t} selected={selectedTemplate === t}
                  onClick={() => setSelectedTemplate(t)} plan={plan} userName={userName} />
              ))}
            </div>
          </div>

          {/* CV preview */}
          <div className="card-lg" style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: 14 }}>CV Preview</h3>
              <span className="badge badge-green">{cvText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'14px 18px', fontSize:11, lineHeight:1.7, color:'var(--text2)', maxHeight:180, overflowY:'auto', fontFamily:'monospace', border:'1px solid var(--border)', whiteSpace:'pre-wrap' }}>
              {cvText.slice(0, 1000)}{cvText.length > 1000 ? '\n…' : ''}
            </div>
          </div>

          {/* Download */}
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:16 }}>
            <h3 style={{ fontSize: 14, marginBottom: 14 }}>Download</h3>
            <div className="flex gap-3" style={{ flexWrap:'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={handleExportPDF}>📄 Export as PDF</button>
              <button className="btn btn-secondary btn-lg" onClick={handleExportWord}>📝 Export as Word</button>
              {coverLetter && <button className="btn btn-ghost btn-lg" onClick={() => exportCoverLetter(coverLetter, userName)}>✉️ Cover Letter</button>}
            </div>
            {exported && (
              <div className="animate-fade" style={{ marginTop:12, padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(45,212,160,0.3)', borderRadius:8, fontSize:13, color:'var(--green)' }}>
                ✓ Export started! Save as PDF from the print dialog.
              </div>
            )}
          </div>

          {/* Save to profile */}
          {handoff && (
            <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(124,111,247,0.3)', borderRadius:'var(--radius-lg)', padding:'18px 22px' }}>
              <div className="flex items-center justify-between" style={{ flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--accent)', marginBottom:3 }}>Save to ThoughtPilot Profile</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>Sync your improved CV back to {handoff.user.full_name}'s profile.</div>
                </div>
                <button className="btn btn-primary" onClick={handleSaveToProfile} disabled={saving}>
                  {saving ? 'Saving…' : '☁️ Save to Profile'}
                </button>
              </div>
              {saveMsg && <div className="animate-fade" style={{ marginTop:8, fontSize:13, color: saveMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>{saveMsg}</div>}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between" style={{ marginTop:28, paddingTop:20, borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(6)}>← Interview Risks</button>
        <span style={{ fontSize:12, color:'var(--text3)' }}>Recruiter Intelligence complete 🚀</span>
      </div>
    </div>
  );
}
