'use client';
import { useRef, useState, DragEvent } from 'react';
import { useCareerStore } from '@/store/career';

export default function StageUpload() {
  const { cvText, setCvText, setCvFileName, setStage, handoff } = useCareerStore();
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setCvFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'txt', 'doc', 'docx'].includes(ext)) {
      setError('Please upload a PDF, Word (.docx), or .txt file.');
      return;
    }
    if (ext === 'txt') {
      const text = await file.text();
      setCvText(text);
      setActiveTab('paste');
    } else if (ext === 'pdf') {
      // PDF: read as text via FileReader (basic extraction)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Basic text extraction from PDF — for a real app use pdf.js
        const textContent = result.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s{3,}/g, '\n');
        setCvText(textContent.trim() || `[PDF: ${file.name}]\nPlease paste your CV text below for best results.`);
        setActiveTab('paste');
      };
      reader.readAsText(file);
    } else {
      // Word: basic text extraction
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const cleaned = result.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s{3,}/g, '\n');
        setCvText(cleaned.trim() || `[Word document: ${file.name}]\nPlease paste your CV text below.`);
        setActiveTab('paste');
      };
      reader.readAsText(file);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const useProfile = () => {
    if (handoff?.cv_prefill) {
      setCvText(handoff.cv_prefill);
      setCvFileName('ThoughtPilot Profile');
      setActiveTab('paste');
    }
  };

  const canProceed = cvText.trim().length > 100;

  return (
    <div className="animate-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Upload Your CV</h2>
        <p style={{ color: 'var(--text2)' }}>
          Drop your CV, paste the text, or use your ThoughtPilot profile to get started.
        </p>
      </div>

      {/* Profile pre-fill */}
      {handoff?.cv_prefill && (
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid rgba(124,111,247,0.3)',
          borderRadius: 'var(--radius)',
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent)' }}>
              ✨ ThoughtPilot Profile Available
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {handoff.user.full_name} · {handoff.profile?.role || 'Professional'}
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={useProfile}>
            Use My Profile
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 20, border: '1px solid var(--border)' }}>
        {(['upload', 'paste'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, transition: 'all 0.15s ease',
              background: activeTab === tab ? 'var(--bg2)' : 'transparent',
              color: activeTab === tab ? 'var(--text)' : 'var(--text2)',
              boxShadow: activeTab === tab ? 'var(--shadow)' : 'none',
            }}
          >
            {tab === 'upload' ? '📄 Upload File' : '✏️ Paste Text'}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--accent-dim)' : 'var(--bg2)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
            {dragging ? 'Drop it here!' : 'Drag & drop your CV'}
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
            Supports PDF, Word (.docx), and plain text (.txt)
          </div>
          <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
            Browse Files
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>
      )}

      {/* Paste tab */}
      {activeTab === 'paste' && (
        <div>
          <textarea
            className="input"
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            rows={16}
            placeholder="Paste your full CV text here…

Example:
John Smith
Senior Software Engineer | London, UK

EXPERIENCE
Software Engineer — Acme Corp (2020–Present)
• Led development of microservices architecture serving 2M users
• Reduced API latency by 40% through caching optimisation

EDUCATION
BSc Computer Science — University of London (2017)"
            style={{ fontSize: 13, lineHeight: 1.6, fontFamily: 'monospace' }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {cvText.length.toLocaleString()} characters · {cvText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
            {cvText.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCvText('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,91,91,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setStage(2)}
          disabled={!canProceed}
        >
          Analyze My CV →
        </button>
      </div>

      {!canProceed && cvText.length > 0 && (
        <p style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
          Need at least 100 characters to analyze
        </p>
      )}
    </div>
  );
}
