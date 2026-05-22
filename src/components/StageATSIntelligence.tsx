'use client';
import { useState } from 'react';
import { useCareerStore } from '@/store/career';
import ScoreRing from './ScoreRing';
import ChangeCard from './ChangeCard';

function MiniBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{score}</span>
      </div>
      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function DimCard({ dim, index }: { dim: any; index: number }) {
  const [open, setOpen] = useState(false);
  const color = dim.status === 'good' ? 'var(--green)' : dim.status === 'needs_work' ? 'var(--amber)' : 'var(--red)';
  const bg = dim.status === 'good' ? 'var(--green-dim)' : dim.status === 'needs_work' ? 'var(--amber-dim)' : 'var(--red-dim)';
  return (
    <div className="card animate-fade" style={{ animationDelay: `${index * 0.04}s`, padding: 14, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{dim.name}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{dim.score}</span>
      </div>
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 99, marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${dim.score}%`, background: color, borderRadius: 99 }} />
      </div>
      <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, background: bg, fontSize: 11, fontWeight: 600, color }}>
        {dim.status === 'good' ? '✓ Good' : dim.status === 'needs_work' ? '⚠ Needs Work' : '✕ Poor'}
      </div>
      {open && dim.tip && (
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8, lineHeight: 1.5, animation: 'fadeIn 0.2s ease' }}>
          💡 {dim.tip}
        </p>
      )}
      {open && dim.issues?.length > 0 && (
        <ul style={{ marginTop: 6, paddingLeft: 14 }}>
          {dim.issues.map((iss: string, i: number) => (
            <li key={i} style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>{iss}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StageATSIntelligence() {
  const { intelligenceResult, changes, setStage, approveChange, discardChange, editChange, approveAll } = useCareerStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'discarded'>('all');
  const [showDims, setShowDims] = useState(true);

  if (!intelligenceResult) return null;

  const r = intelligenceResult;
  const ats = r.ats_parse_analysis;
  const approved = changes.filter(c => c.status === 'approved').length;
  const discarded = changes.filter(c => c.status === 'discarded').length;
  const pending = changes.filter(c => c.status === 'pending').length;
  const filtered = filter === 'all' ? changes : changes.filter(c => c.status === filter);

  return (
    <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Hero score row */}
      <div style={{
        display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 20,
      }}>
        <ScoreRing score={r.overall_score} grade={r.grade} size={120} />

        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 20, marginBottom: 6 }}>ATS Intelligence Report</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.65, marginBottom: 12 }}>{r.summary}</p>
          <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            {r.strengths?.slice(0, 4).map((s, i) => <span key={i} className="badge badge-green">{s}</span>)}
          </div>
        </div>

        {/* Hiring confidence */}
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)',
          borderRadius: 12, padding: '16px', minWidth: 200,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Hiring Confidence
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
            {r.hiring_confidence?.score}/100
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
            {r.hiring_confidence?.verdict?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          {r.hiring_confidence?.top_strengths?.slice(0, 2).map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--green)', marginBottom: 2 }}>✓ {s}</div>
          ))}
        </div>
      </div>

      {/* ATS Parse Analysis */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
      }}>
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>⚡ ATS Parse Analysis</div>
          <MiniBar score={ats?.parse_rate || 0} label="Parse Rate" color="var(--green)" />
          <MiniBar score={ats?.readability_score || 0} label="Readability" color="var(--accent)" />
          {ats?.issues?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {ats.issues.map((iss: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 4 }}>⚠ {iss}</div>
              ))}
            </div>
          )}
          {ats?.recommendations?.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              {ats.recommendations.map((r: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 3 }}>→ {r}</div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>📊 Peer Benchmark</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', marginBottom: 4, fontFamily: 'Sora,sans-serif' }}>
            {r.peer_benchmark?.market_position?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
            {r.peer_benchmark?.years_experience_detected} years detected · Uniqueness {r.peer_benchmark?.uniqueness_score}/100
          </div>
          {r.peer_benchmark?.competitive_strengths?.slice(0, 3).map((s: string, i: number) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--green)', marginBottom: 3 }}>✓ {s}</div>
          ))}
          {r.peer_benchmark?.missing_common_skills?.slice(0, 2).map((s: string, i: number) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 3 }}>⚠ Missing: {s}</div>
          ))}
        </div>
      </div>

      {/* Missing keywords */}
      {r.missing_keywords?.length > 0 && (
        <div style={{
          background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 8 }}>Missing ATS Keywords</div>
          <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            {r.missing_keywords.map((kw, i) => <span key={i} className="badge badge-amber">{kw}</span>)}
          </div>
        </div>
      )}

      {/* Dimensions */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 15 }}>18-Dimension Scores</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDims(!showDims)}>
            {showDims ? 'Hide ▲' : 'Show ▼'}
          </button>
        </div>
        {showDims && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
            {r.dimensions?.map((dim, i) => <DimCard key={dim.id} dim={dim} index={i} />)}
          </div>
        )}
      </div>

      {/* Changes */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Suggested Changes ({changes.length})</h3>
            <div className="flex gap-3">
              <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ {approved}</span>
              <span style={{ fontSize: 12, color: 'var(--red)' }}>✕ {discarded}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>⏳ {pending}</span>
            </div>
          </div>
          <button className="btn btn-green btn-sm" onClick={approveAll}>✅ Approve All</button>
        </div>

        <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 8, padding: 3, marginBottom: 14, border: '1px solid var(--border)', width: 'fit-content' }}>
          {(['all', 'pending', 'approved', 'discarded'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 500,
              background: filter === f ? 'var(--bg2)' : 'transparent',
              color: filter === f ? 'var(--text)' : 'var(--text3)',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 14 }}>No {filter} changes</div>
            : filtered.map((c, i) => (
                <ChangeCard key={c.id} change={c} index={i}
                  onApprove={() => approveChange(c.id)}
                  onDiscard={() => discardChange(c.id)}
                  onEdit={(t) => editChange(c.id, t)}
                />
              ))
          }
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(1)}>← Back to Upload</button>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setStage(7)}>Skip → Export</button>
          <button className="btn btn-primary btn-lg" onClick={() => setStage(4)}>Recruiter Intelligence →</button>
        </div>
      </div>
    </div>
  );
}
