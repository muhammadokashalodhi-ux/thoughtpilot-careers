'use client';
import { useRef, useState, useEffect, DragEvent } from 'react';
import { useCareerStore } from '@/store/career';

declare global {
  interface Window {
    pdfjsLib: any;
    mammoth: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export default function StageUpload() {
  const { cvText, setCvText, setCvFileName, setStage, handoff } = useCareerStore();
  const [dragging, setDragging]   = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [error, setError]         = useState('');
  const [extracting, setExtracting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preload PDF.js and Mammoth on mount
  useEffect(() => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js').catch(() => {});
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js').catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    setError('');
    setExtracting(true);
    setCvFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !['pdf', 'txt', 'doc', 'docx'].includes(ext)) {
      setError('Please upload a PDF, Word (.docx), or .txt file.');
      setExtracting(false);
      return;
    }

    try {
      if (ext === 'txt') {
        const text = await file.text();
        setCvText(text);
        setActiveTab('paste');

      } else if (ext === 'pdf') {
        // Load PDF.js if not already loaded
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

        const pdfjs = window.pdfjsLib;
        if (!pdfjs) throw new Error('PDF.js failed to load');

        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        const cleaned = fullText.replace(/\s{3,}/g, '\n').trim();

        if (cleaned.length < 50) {
          setError('This PDF appears to be scanned or image-based. Please paste your CV text manually.');
          setActiveTab('paste');
        } else {
          setCvText(cleaned);
          setActiveTab('paste');
        }

      } else if (ext === 'docx' || ext === 'doc') {
        // Load Mammoth.js if not already loaded
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');

        const mammoth = window.mammoth;
        if (!mammoth) throw new Error('Mammoth.js failed to load');

        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const cleaned = result.value.replace(/\s{3,}/g, '\n').trim();

        if (cleaned.length < 50) {
          setError('Could not extract text from this Word document. Please paste your CV text manually.');
          setActiveTab('paste');
        } else {
          setCvText(cleaned);
          setActiveTab('paste');
        }
      }
    } catch (err: any) {
      console.error('[StageUpload] extraction error:', err);
      setError('Failed to read file — please paste your CV text manually.');
      setActiveTab('paste');
    } finally {
      setExtracting(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver  = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
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
      <div style={{
        display: 'flex', gap: 0, background: 'var(--bg3)',
        borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        {(['upload', 'paste'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s ease',
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
          onClick={() => !extracting && fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: extracting ? 'wait' : 'pointer',
            background: dragging ? 'var(--accent-dim)' : 'var(--bg2)',
            transition: 'all 0.2s ease',
          }}
        >
          {extracting ? (
            <>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)',
                animation: 'spin 0.9s linear infinite',
                margin: '0 auto 16px',
              }} />
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                Extracting text…
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>
                Reading your CV, please wait
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                {dragging ? 'Drop it here!' : 'Drag & drop your CV'}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
                Supports PDF, Word (.docx), and plain text (.txt)
              </div>
              <button
                className="btn btn-secondary"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse Files
              </button>
            </>
          )}
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
            placeholder={`Paste your full CV text here…\n\nExample:\nJohn Smith\nSenior SCM Manager | Dubai, UAE\n\nEXPERIENCE\nSupply Chain Manager — Acme Corp (2020–Present)\n• Led end-to-end procurement for $50M annual spend\n• Reduced supplier lead times by 35%\n\nEDUCATION\nBSc Logistics — University of London (2017)`}
            style={{ fontSize: 13, lineHeight: 1.6, fontFamily: 'monospace' }}
          />
          <div style={{
            marginTop: 8, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {cvText.length.toLocaleString()} characters
              · {cvText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
            {cvText.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCvText('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px',
          background: 'var(--red-dim)',
          border: '1px solid rgba(255,91,91,0.3)',
          borderRadius: 8, fontSize: 13, color: 'var(--red)',
        }}>
          {error}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setStage(2)}
          disabled={!canProceed || extracting}
        >
          Analyze My CV →
        </button>
      </div>

      {!canProceed && cvText.length > 0 && !extracting && (
        <p style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
          Need at least 100 characters to analyze
        </p>
      )}
    </div>
  );
}
