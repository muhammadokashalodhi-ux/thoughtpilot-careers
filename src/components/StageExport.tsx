'use client';
import { useState } from 'react';
import axios from 'axios';
import { useCareerStore, ExportTemplate } from '@/store/career';
import TemplatePreview from './TemplatePreview';
import { exportAsPDF, exportAsWord, exportCoverLetter } from '@/lib/export';
import { launchConfetti } from '@/lib/confetti';

const TEMPLATES: ExportTemplate[] = ['classic', 'modern', 'minimal', 'executive', 'compact'];

export default function StageExport() {
  const {
    selectedTemplate, setSelectedTemplate,
    getFinalCvText, handoff, coverLetter, setStage, atsResult,
  } = useCareerStore();

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [exported, setExported] = useState(false);

  const cvText = getFinalCvText();
  const userName = handoff?.user.full_name || 'Your Name';
  const plan = handoff?.user.plan || 'free';

  const handleExportPDF = () => {
    exportAsPDF({ cvText, userName, template: selectedTemplate });
    setExported(true);
    launchConfetti(3000);
  };

  const handleExportWord = () => {
    exportAsWord({ cvText, userName, template: selectedTemplate });
    setExported(true);
    launchConfetti(2500);
  };

  const handleExportCoverLetter = () => {
    if (!coverLetter) return;
    exportCoverLetter(coverLetter, userName);
  };

  const handleSaveToProfile = async () => {
    if (!handoff) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/career/save-cv`,
        { cv_text: cvText, user_id: handoff.user.id },
        { withCredentials: true },
      );
      setSaveMsg('✓ CV saved to your ThoughtPilot profile!');
      launchConfetti(2000);
    } catch {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Export Your Improved CV</h2>
        <p style={{ color: 'var(--text2)' }}>
          Choose a template and download your polished, ATS-optimised CV.
        </p>
        {atsResult && (
          <div style={{ marginTop: 12, display: 'inline-flex', gap: 16, alignItems: 'center', padding: '8px 18px', background: 'var(--green-dim)', border: '1px solid rgba(45,212,160,0.3)', borderRadius: 99 }}>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
              ATS Score: {atsResult.overall_score}/100 · Grade {atsResult.grade}
            </span>
          </div>
        )}
      </div>

      {/* Template selection */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Choose Template</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}>
          {TEMPLATES.map((t) => (
            <TemplatePreview
              key={t}
              template={t}
              selected={selectedTemplate === t}
              onClick={() => setSelectedTemplate(t)}
              plan={plan}
              userName={userName}
            />
          ))}
        </div>
      </div>

      {/* CV preview snippet */}
      <div className="card-lg" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 15 }}>CV Preview</h3>
          <span className="badge badge-green">
            {cvText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <div style={{
          background: 'var(--bg3)', borderRadius: 10, padding: '16px 20px',
          fontSize: 12, lineHeight: 1.7, color: 'var(--text2)',
          maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace',
          border: '1px solid var(--border)', whiteSpace: 'pre-wrap',
        }}>
          {cvText.slice(0, 1200)}{cvText.length > 1200 ? '\n…' : ''}
        </div>
      </div>

      {/* Export buttons */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 20,
      }}>
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Download</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={handleExportPDF}>
            📄 Export as PDF
          </button>
          <button className="btn btn-secondary btn-lg" onClick={handleExportWord}>
            📝 Export as Word (.rtf)
          </button>
          {coverLetter && (
            <button className="btn btn-ghost btn-lg" onClick={handleExportCoverLetter}>
              ✉️ Export Cover Letter
            </button>
          )}
        </div>
        {exported && (
          <div className="animate-fade" style={{
            marginTop: 14, padding: '10px 14px',
            background: 'var(--green-dim)', border: '1px solid rgba(45,212,160,0.3)',
            borderRadius: 8, fontSize: 13, color: 'var(--green)',
          }}>
            ✓ Export started! The print/save dialog should have opened.
          </div>
        )}
      </div>

      {/* Save to profile */}
      {handoff && (
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
        }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)', marginBottom: 4 }}>
                Save to ThoughtPilot Profile
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                Sync your improved CV back to <strong>{handoff.user.full_name}</strong>'s profile.
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSaveToProfile}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Saving…
                </>
              ) : '☁️ Save to Profile'}
            </button>
          </div>
          {saveMsg && (
            <div className="animate-fade" style={{
              marginTop: 10, fontSize: 13,
              color: saveMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)',
            }}>
              {saveMsg}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between" style={{ paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(4)}>
          ← Back to Job Match
        </button>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          All done! Your CV has been improved 🚀
        </div>
      </div>
    </div>
  );
}
