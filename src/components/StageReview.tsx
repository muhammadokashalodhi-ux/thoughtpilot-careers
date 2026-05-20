'use client';
import { useState } from 'react';
import { useCareerStore, Dimension } from '@/store/career';
import ScoreRing from './ScoreRing';
import ChangeCard from './ChangeCard';

function DimensionCard({ dim, index }: { dim: Dimension; index: number }) {
  const color = dim.status === 'good' ? 'var(--green)' : dim.status === 'needs_work' ? 'var(--amber)' : 'var(--red)';
  const bg = dim.status === 'good' ? 'var(--green-dim)' : dim.status === 'needs_work' ? 'var(--amber-dim)' : 'var(--red-dim)';

  return (
    <div
      className="card animate-fade"
      style={{ animationDelay: `${index * 0.05}s`, padding: '14px' }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{dim.name}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{dim.score}</span>
      </div>
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 99, marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${dim.score}%`, background: color,
          borderRadius: 99, transition: 'width 1s ease',
        }} />
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
        borderRadius: 6, background: bg, fontSize: 11, fontWeight: 600, color,
      }}>
        {dim.status === 'good' ? '✓ Good' : dim.status === 'needs_work' ? '⚠ Needs Work' : '✕ Poor'}
      </div>
      {dim.tip && (
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, lineHeight: 1.4 }}>{dim.tip}</p>
      )}
    </div>
  );
}

export default function StageReview() {
  const {
    atsResult, changes, setStage,
    approveChange, discardChange, editChange, approveAll,
  } = useCareerStore();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'discarded'>('all');
  const [showDimensions, setShowDimensions] = useState(true);

  if (!atsResult) return null;

  const approved = changes.filter((c) => c.status === 'approved').length;
  const discarded = changes.filter((c) => c.status === 'discarded').length;
  const pending = changes.filter((c) => c.status === 'pending').length;

  const filtered = filter === 'all' ? changes : changes.filter((c) => c.status === filter);

  return (
    <div className="animate-fade" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Score header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
      }}>
        <ScoreRing score={atsResult.overall_score} grade={atsResult.grade} size={120} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Your ATS Report</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            {atsResult.summary}
          </p>
          {atsResult.strengths.length > 0 && (
            <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              {atsResult.strengths.map((s, i) => (
                <span key={i} className="badge badge-green">{s}</span>
              ))}
            </div>
          )}
        </div>
        {atsResult.missing_keywords.length > 0 && (
          <div style={{
            background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: 10, padding: '12px 16px', minWidth: 180,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 8 }}>
              Missing Keywords
            </div>
            <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              {atsResult.missing_keywords.slice(0, 8).map((kw, i) => (
                <span key={i} className="badge badge-amber">{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dimensions grid */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 16 }}>Dimension Scores</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDimensions(!showDimensions)}>
            {showDimensions ? 'Hide ▲' : 'Show ▼'}
          </button>
        </div>
        {showDimensions && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {atsResult.dimensions.map((dim, i) => (
              <DimensionCard key={dim.id} dim={dim} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Changes section */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              Suggested Changes ({changes.length})
            </h3>
            <div className="flex gap-3">
              <span style={{ fontSize: 13, color: 'var(--green)' }}>✓ {approved} approved</span>
              <span style={{ fontSize: 13, color: 'var(--red)' }}>✕ {discarded} discarded</span>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>⏳ {pending} pending</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-green btn-sm" onClick={approveAll}>
              ✅ Approve All
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 8,
          padding: 4, marginBottom: 16, border: '1px solid var(--border)',
          width: 'fit-content',
        }}>
          {(['all', 'pending', 'approved', 'discarded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s ease',
                background: filter === f ? 'var(--bg2)' : 'transparent',
                color: filter === f ? 'var(--text)' : 'var(--text3)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  ({f === 'pending' ? pending : f === 'approved' ? approved : discarded})
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text3)', fontSize: 14 }}>
              No {filter} changes
            </div>
          ) : (
            filtered.map((change, i) => (
              <ChangeCard
                key={change.id}
                change={change}
                index={i}
                onApprove={() => approveChange(change.id)}
                onDiscard={() => discardChange(change.id)}
                onEdit={(text) => editChange(change.id, text)}
              />
            ))
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between" style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setStage(1)}>
          ← Back to Upload
        </button>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setStage(5)}>
            Skip → Export
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => setStage(4)}>
            Proceed to Job Match →
          </button>
        </div>
      </div>
    </div>
  );
}
