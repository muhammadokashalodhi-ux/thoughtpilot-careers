'use client';
import { useState } from 'react';
import { CVChange, ChangeType } from '@/store/career';

interface ChangeCardProps {
  change: CVChange;
  onApprove: () => void;
  onDiscard: () => void;
  onEdit: (text: string) => void;
  index: number;
}

const TYPE_LABELS: Record<ChangeType, string> = {
  weak_verb: 'Weak Verb',
  ats: 'ATS Keyword',
  quantification: 'Add Numbers',
  grammar: 'Grammar',
  improvement: 'Improvement',
  authenticity: 'Authenticity',
  recruiter_trust: 'Recruiter Trust',
  interview_risk: 'Interview Risk',
  leadership: 'Leadership',
  credibility: 'Credibility',
  narrative: 'Narrative',
  executive_presence: 'Executive Presence',
  humanization: 'Humanization',
};

const TYPE_COLORS: Record<ChangeType, string> = {
  weak_verb: 'badge-amber',
  ats: 'badge-accent',
  quantification: 'badge-green',
  grammar: 'badge-red',
  improvement: 'badge-neutral',
  authenticity: 'badge-amber',
  recruiter_trust: 'badge-accent',
  interview_risk: 'badge-red',
  leadership: 'badge-accent',
  credibility: 'badge-amber',
  narrative: 'badge-neutral',
  executive_presence: 'badge-accent',
  humanization: 'badge-green',
};

export default function ChangeCard({ change, onApprove, onDiscard, onEdit, index }: ChangeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(change.suggested);

  const handleEdit = () => { onEdit(editText); setEditing(false); };

  const statusBorder =
    change.status === 'approved' ? '1px solid rgba(45,212,160,0.4)' :
    change.status === 'discarded' ? '1px solid rgba(255,91,91,0.3)' : '1px solid var(--border)';
  const statusBg =
    change.status === 'approved' ? 'rgba(45,212,160,0.04)' :
    change.status === 'discarded' ? 'rgba(255,91,91,0.04)' : 'var(--bg2)';

  return (
    <div className="animate-fade" style={{
      background: statusBg, border: statusBorder, borderRadius: 'var(--radius)',
      padding: 16, animationDelay: `${index * 0.04}s`,
      opacity: change.status === 'discarded' ? 0.45 : 1,
      transition: 'opacity 0.2s, border-color 0.2s, background 0.2s',
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="badge badge-neutral">{change.section}</span>
          <span className={`badge ${TYPE_COLORS[change.type] || 'badge-neutral'}`}>{TYPE_LABELS[change.type] || change.type}</span>
          {change.status === 'approved' && <span className="badge badge-green">✓ Approved</span>}
          {change.status === 'discarded' && <span className="badge badge-red">✕ Discarded</span>}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
          {expanded ? 'Hide insight ▲' : 'Recruiter insight ▼'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
        <div style={{ background:'var(--red-dim)', border:'1px solid rgba(255,91,91,0.2)', borderRadius:8, padding:'9px 12px', fontSize:13 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--red)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>Before</div>
          <span style={{ color:'var(--text2)', textDecoration:'line-through' }}>{change.original}</span>
        </div>
        <div style={{ background:'var(--green-dim)', border:'1px solid rgba(45,212,160,0.2)', borderRadius:8, padding:'9px 12px', fontSize:13 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--green)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>After</div>
          {editing ? (
            <div style={{ display:'flex', gap:8, flexDirection:'column' }}>
              <textarea className="input" value={editText} onChange={e => setEditText(e.target.value)} rows={3} style={{ fontSize:13 }} />
              <div className="flex gap-2">
                <button className="btn btn-green btn-sm" onClick={handleEdit}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <span style={{ color:'var(--green)' }}>{change.editedText || change.suggested}</span>
          )}
        </div>
      </div>

      {expanded && (
        <div style={{ background:'var(--bg3)', borderRadius:8, padding:'12px', marginBottom:10, fontSize:13, animation:'fadeIn 0.2s ease' }}>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontWeight:600, color:'var(--accent)' }}>Why it matters: </span>
            <span style={{ color:'var(--text2)' }}>{change.reason}</span>
          </div>
          <div>
            <span style={{ fontWeight:600, color:'var(--amber)' }}>Recruiter sees: </span>
            <span style={{ color:'var(--text2)' }}>{change.recruiter_insight}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button className="btn btn-green btn-sm" onClick={onApprove} disabled={change.status === 'approved'}>✅ Approve</button>
        <button className="btn btn-red btn-sm" onClick={onDiscard} disabled={change.status === 'discarded'}>✕ Discard</button>
        {!editing && change.status !== 'discarded' && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setExpanded(false); }}>✏️ Edit</button>
        )}
      </div>
    </div>
  );
}
