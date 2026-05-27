'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useCareerStore } from '@/store/career';
import { analyzeJobMatch, generateCoverLetter } from '@/lib/groq';
import ScoreRing from './ScoreRing';
import { exportCV, getFinalCV } from '@/lib/export';
import { renderTemplate, TEMPLATES, TemplateId } from '@/lib/templates';
import { launchConfetti } from '@/lib/confetti';
import { exportCoverLetter } from '@/lib/export';

const PRIORITY_BADGE: Record<string, string> = {
  high: 'badge-red', medium: 'badge-amber', low: 'badge-neutral',
};

// ── Template card with live preview ──────────────────────────────────────────
function TemplateCard({ id, selected, onClick, plan, cv }: {
  id: TemplateId; selected: boolean; onClick: () => void;
  plan: string; cv: ReturnType<typeof getFinalCV>;
}) {
  const tpl     = TEMPLATES[id];
  const locked  = tpl.plan === 'pro' && !['pro', 'beta', 'admin'].includes(plan)
               || tpl.plan === 'beta' && !['beta', 'pro', 'admin'].includes(plan);
  const [html, setHtml] = useState('');

  useEffect(() => {
    try { setHtml(tpl.render(cv)); } catch { setHtml(''); }
  }, [cv, id]);

  return (
    <div
      onClick={() => !locked && onClick()}
      style={{
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: locked ? 'not-allowed' : 'pointer',
        position: 'relative',
        background: 'var(--bg2)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 3px var(--accent-soft)' : undefined,
        opacity: locked ? 0.6 : 1,
      }}
    >
      {/* Mini preview iframe */}
      <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: '#fff' }}>
        {html ? (
          <iframe
            srcDoc={html}
            style={{
              width: '210mm', height: '297mm', border: 'none',
              transform: 'scale(0.24)', transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
            title={tpl.name}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>
            Preview loading…
          </div>
        )}
        {selected && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            ✓
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{tpl.name}</span>
        <span className={`badge ${tpl.plan === 'free' ? 'badge-green' : tpl.plan === 'beta' ? 'badge-accent' : 'badge-amber'}`} style={{ fontSize: 10 }}>
          {locked ? '🔒 ' : ''}{tpl.plan === 'free' ? 'Free' : tpl.plan === 'beta' ? 'Beta+' : 'Pro'}
        </span>
      </div>

      {/* Accent bar */}
      <div style={{ height: 3, background: tpl.accent }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StageExport() {
  const {
    selectedTemplate, setSelectedTemplate,
    getFinalCvText, cvText: rawCvText,
    handoff, coverLetter, setCoverLetter,
    jobDescription, setJobDescription,
    jobMatchResult, setJobMatchResult,
    jobMatchLoading, setJobMatchLoading,
    jobSuggestions, approveJobSuggestion, discardJobSuggestion,
    coverLetterLoading, setCoverLetterLoading,
    changes, setStage, intelligenceResult,
  } = useCareerStore();

  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [exported, setExported]   = useState(false);
  const [jdError, setJdError]     = useState('');
  const [clError, setClError]     = useState('');
  const [tab, setTab]             = useState<'jobmatch' | 'export'>('export');
  const [previewFull, setPreview] = useState(false);

  const cvText  = getFinalCvText();
  const userName = handoff?.user.full_name || 'Your Name';
  const plan     = handoff?.user.plan || 'free';

  // Parse CV once — memoized so it doesn't re-run on every render
  const parsedCV = useMemo(() => {
    try { return getFinalCV(rawCvText || cvText, changes || []); }
    catch { return getFinalCV(cvText, []); }
  }, [rawCvText, cvText, changes]);

  // Count approved changes
  const approvedCount = (changes || []).filter((c: any) => c.status === 'approved').length;

  // Current template id mapped from old string to new TemplateId
  const templateIdMap: Record<string, TemplateId> = {
    classic: 'classic-navy', modern: 'modern-teal', minimal: 'minimal-dark',
    executive: 'executive-red', compact: 'tech-sidebar',
    'classic-navy': 'classic-navy', 'modern-teal': 'modern-teal',
    'minimal-dark': 'minimal-dark', 'executive-red': 'executive-red',
    'tech-sidebar': 'tech-sidebar',
  };
  const currentTemplateId: TemplateId = templateIdMap[selectedTemplate] || 'classic-navy';

  // Full preview HTML
  const previewHtml = useMemo(() => {
    try { return renderTemplate(currentTemplateId, parsedCV); } catch { return ''; }
  }, [currentTemplateId, parsedCV]);

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
      const approved = jobSuggestions.filter((s: any) => s.status === 'approved').map((s: any) => s.suggestion);
      const cl = await generateCoverLetter(cvText, jobDescription, userName, handoff?.profile?.user_role || 'Professional', approved);
      setCoverLetter(cl);
    } catch (e: any) { setClError(e.message || 'Cover letter generation failed.'); }
    finally { setCoverLetterLoading(false); }
  };

  const handleExportPDF = () => {
    exportCV(rawCvText || cvText, changes || [], currentTemplateId, 'pdf', userName);
    setExported(true);
    launchConfetti(3000);
  };

  const handleExportWord = () => {
    exportCV(rawCvText || cvText, changes || [], currentTemplateId, 'word', userName);
    setExported(true);
    launchConfetti(2500);
  };

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

  const templateIds = Object.keys(TEMPLATES) as TemplateId[];

  return (
    <div className="animate-fade" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Job Match & Export</h2>
        <p style={{ color: 'var(--text2)' }}>Tailor your CV for a specific role, then export in your chosen template.</p>
        {intelligenceResult && (
          <div style={{ marginTop: 10, display: 'inline-flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '8px 18px', background: 'var(--green-soft)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99 }}>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              ATS Score: {intelligenceResult.overall_score}/100 · Grade {intelligenceResult.grade}
            </span>
            {approvedCount > 0 && (
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, background: 'var(--accent-soft)', padding: '2px 10px', borderRadius: 100 }}>
                ✨ {approvedCount} improvement{approvedCount !== 1 ? 's' : ''} applied
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
        {([['jobmatch', '🎯 Job Match'] , ['export', '📄 Export CV']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
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
              <div style={{ display:'flex', gap:24, alignItems:'center', flexWrap:'wrap', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:20 }}>
                <ScoreRing score={jobMatchResult.match_score} label="Job Match" size={100} showGrade={false} />
                <div style={{ flex:1, minWidth:200 }}>
                  <h3 style={{ marginBottom:6 }}>Match Analysis</h3>
                  <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6, marginBottom:10 }}>{jobMatchResult.gap_summary}</p>
                  {jobMatchResult.missing_keywords?.length > 0 && (
                    <div className="flex" style={{ gap:6, flexWrap:'wrap' }}>
                      {jobMatchResult.missing_keywords.map((kw: string, i: number) => <span key={i} className="badge badge-amber">{kw}</span>)}
                    </div>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setJobMatchResult(null)}>Re-analyse</button>
              </div>

              <div style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:15, marginBottom:12 }}>Tailoring Suggestions</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {jobSuggestions.map((s: any) => (
                    <div key={s.id} style={{
                      background: s.status==='approved' ? 'rgba(34,197,94,0.04)' : s.status==='discarded' ? 'rgba(239,68,68,0.04)' : 'var(--bg2)',
                      border: `1px solid ${s.status==='approved' ? 'rgba(34,197,94,0.3)' : s.status==='discarded' ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                      borderRadius:'var(--radius)', padding:'12px 14px',
                      opacity: s.status==='discarded' ? 0.5 : 1, transition:'all 0.2s',
                    }}>
                      <div className="flex gap-2 items-center" style={{ marginBottom:8, flexWrap:'wrap' }}>
                        <span className="badge badge-neutral">{s.section}</span>
                        <span className={`badge ${PRIORITY_BADGE[s.priority]}`}>{s.priority} priority</span>
                        {s.status==='approved' && <span className="badge badge-green">✓ Added</span>}
                        {s.status==='discarded' && <span className="badge badge-red">✕ Skipped</span>}
                      </div>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>{s.suggestion}</div>
                      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>{s.reason}</div>
                      <div className="flex gap-2">
                        <button className="btn btn-green btn-sm" onClick={() => approveJobSuggestion(s.id)} disabled={s.status==='approved'}>✅ Add</button>
                        <button className="btn btn-red btn-sm" onClick={() => discardJobSuggestion(s.id)} disabled={s.status==='discarded'}>✕ Skip</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-lg" style={{ marginBottom:20 }}>
                <div className="flex items-center justify-between" style={{ marginBottom:12, flexWrap:'wrap', gap:10 }}>
                  <div>
                    <h3 style={{ fontSize:15 }}>Cover Letter</h3>
                    <p style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>AI-written from your CV + approved suggestions</p>
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
              <div style={{ textAlign:'right' }}>
                <button className="btn btn-primary" onClick={() => setTab('export')}>Proceed to Export →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {tab === 'export' && (
        <div className="animate-fade">

          {/* Applied changes banner */}
          {approvedCount > 0 && (
            <div style={{ background:'var(--green-soft)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--green)', fontWeight:500 }}>
              ✨ <strong>{approvedCount} approved improvement{approvedCount !== 1 ? 's' : ''}</strong> from the analysis have been applied to your CV export.
            </div>
          )}

          {/* Template picker */}
          <h3 style={{ fontSize:15, marginBottom:14 }}>Choose Template</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:12, marginBottom:28 }}>
            {templateIds.map(id => (
              <TemplateCard
                key={id} id={id}
                selected={currentTemplateId === id}
                onClick={() => setSelectedTemplate(id)}
                plan={plan}
                cv={parsedCV}
              />
            ))}
          </div>

          {/* Live preview */}
          <div className="card-lg" style={{ marginBottom:20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom:12 }}>
              <div>
                <h3 style={{ fontSize:14 }}>Live Preview — {TEMPLATES[currentTemplateId].name}</h3>
                <p style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Exactly what your exported CV will look like</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreview(!previewFull)}>
                {previewFull ? '⬆ Collapse' : '⬇ Full preview'}
              </button>
            </div>
            <div style={{
              background:'#f0f0f0', borderRadius:8, overflow:'hidden',
              height: previewFull ? 'auto' : 340,
              border:'1px solid var(--border)',
              position:'relative',
            }}>
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  style={{
                    width: '210mm', height: previewFull ? '297mm' : '297mm',
                    border: 'none', display: 'block',
                    transform: previewFull ? 'scale(0.62)' : 'scale(0.42)',
                    transformOrigin: 'top left',
                  }}
                  title="CV Preview"
                />
              ) : (
                <div style={{ height:340, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)' }}>
                  Generating preview…
                </div>
              )}
              {!previewFull && (
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(transparent, rgba(240,240,240,0.95))', pointerEvents:'none' }} />
              )}
            </div>
          </div>

          {/* Download */}
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:16 }}>
            <h3 style={{ fontSize:14, marginBottom:14 }}>Download</h3>
            <div className="flex gap-3" style={{ flexWrap:'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={handleExportPDF}>📄 Export as PDF</button>
              <button className="btn btn-secondary btn-lg" onClick={handleExportWord}>📝 Export as Word</button>
              {coverLetter && <button className="btn btn-ghost btn-lg" onClick={() => exportCoverLetter(coverLetter, userName)}>✉️ Cover Letter</button>}
            </div>
            {exported && (
              <div className="animate-fade" style={{ marginTop:12, padding:'10px 14px', background:'var(--green-soft)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:8, fontSize:13, color:'var(--green)' }}>
                ✓ Export started! Save as PDF from the print dialog. Your improvements are included.
              </div>
            )}
          </div>

          {/* Save to profile */}
          {handoff && (
            <div style={{ background:'var(--accent-soft)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:'var(--radius-lg)', padding:'18px 22px' }}>
              <div className="flex items-center justify-between" style={{ flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--accent)', marginBottom:3 }}>Save to ThoughtPilot Profile</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>Sync your improved CV back to {handoff.user.full_name}'s profile for use in post generation.</div>
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
