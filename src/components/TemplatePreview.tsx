'use client';
import { ExportTemplate } from '@/store/career';

interface TemplatePreviewProps {
  template: ExportTemplate;
  selected: boolean;
  onClick: () => void;
  plan: string;
  userName?: string;
}

const TEMPLATES: Record<ExportTemplate, {
  name: string;
  tier: 'free' | 'beta' | 'pro';
  description: string;
  accent: string;
}> = {
  classic: { name: 'Classic', tier: 'free', description: 'ATS-safe, clean Times New Roman', accent: '#333' },
  modern: { name: 'Modern', tier: 'beta', description: 'Subtle colour header, contemporary', accent: '#4f46e5' },
  minimal: { name: 'Minimal', tier: 'beta', description: 'Whitespace-focused, elegant', accent: '#999' },
  executive: { name: 'Executive', tier: 'pro', description: 'Dark header, premium feel', accent: '#c9a96e' },
  compact: { name: 'Compact', tier: 'pro', description: 'Two-column, information-dense', accent: '#7c6ff7' },
};

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: 'Free', cls: 'badge-green' },
  beta: { label: 'Beta+', cls: 'badge-accent' },
  pro: { label: 'Pro', cls: 'badge-amber' },
};

function MockCV({ template, userName = 'Alex Johnson' }: { template: ExportTemplate; userName?: string }) {
  const t = TEMPLATES[template];

  if (template === 'classic') {
    return (
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 7, padding: '10px 12px', lineHeight: 1.4, color: '#111' }}>
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 9 }}>{userName}</div>
        <div style={{ textAlign: 'center', fontSize: 6, color: '#555', marginBottom: 4 }}>alex@email.com · London, UK</div>
        <hr style={{ borderTop: '1px solid #000', margin: '4px 0' }} />
        {['EXPERIENCE', 'EDUCATION', 'SKILLS'].map(sec => (
          <div key={sec}>
            <div style={{ fontWeight: 700, fontSize: 7, marginTop: 5 }}>{sec}</div>
            <div style={{ height: 3, background: '#eee', borderRadius: 2, margin: '2px 0' }} />
            <div style={{ height: 3, background: '#eee', borderRadius: 2, width: '80%', margin: '2px 0' }} />
          </div>
        ))}
      </div>
    );
  }

  if (template === 'modern') {
    return (
      <div style={{ fontFamily: 'sans-serif', fontSize: 7, overflow: 'hidden', borderRadius: 4 }}>
        <div style={{ background: '#4f46e5', color: 'white', padding: '8px 10px' }}>
          <div style={{ fontWeight: 700, fontSize: 9 }}>{userName}</div>
          <div style={{ fontSize: 6, opacity: 0.8 }}>Senior Product Manager</div>
        </div>
        <div style={{ padding: '8px 10px' }}>
          {['EXPERIENCE', 'EDUCATION', 'SKILLS'].map(sec => (
            <div key={sec}>
              <div style={{ fontWeight: 700, fontSize: 7, color: '#4f46e5', marginTop: 5 }}>{sec}</div>
              <div style={{ height: 3, background: '#eee', borderRadius: 2, margin: '2px 0' }} />
              <div style={{ height: 3, background: '#eee', borderRadius: 2, width: '70%', margin: '2px 0' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (template === 'minimal') {
    return (
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 7, padding: '12px', color: '#222' }}>
        <div style={{ fontSize: 11, fontWeight: 300, marginBottom: 2 }}>{userName}</div>
        <div style={{ fontSize: 6, color: '#999', fontStyle: 'italic', marginBottom: 8 }}>Senior Product Manager</div>
        {['EXPERIENCE', 'EDUCATION', 'SKILLS'].map(sec => (
          <div key={sec}>
            <div style={{ fontSize: 5, fontWeight: 700, letterSpacing: 2, color: '#aaa', marginTop: 6, textTransform: 'uppercase' }}>{sec}</div>
            <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, margin: '3px 0' }} />
            <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, width: '75%', margin: '2px 0' }} />
          </div>
        ))}
      </div>
    );
  }

  if (template === 'executive') {
    return (
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 7, overflow: 'hidden', borderRadius: 4 }}>
        <div style={{ background: '#1a1a2e', color: '#e8e0d0', padding: '10px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' }}>{userName}</div>
          <div style={{ fontSize: 6, color: '#b8a898', marginTop: 2 }}>SENIOR PRODUCT MANAGER</div>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #c9a96e, #e8c98e)' }} />
        <div style={{ padding: '8px 12px' }}>
          {['EXPERIENCE', 'EDUCATION', 'SKILLS'].map(sec => (
            <div key={sec}>
              <div style={{ fontSize: 5, fontWeight: 700, color: '#8b7355', letterSpacing: 2, marginTop: 5, textTransform: 'uppercase' }}>{sec}</div>
              <div style={{ height: 3, background: '#f0ece4', borderRadius: 2, margin: '2px 0' }} />
              <div style={{ height: 3, background: '#f0ece4', borderRadius: 2, width: '80%', margin: '2px 0' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Compact
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 6, display: 'grid', gridTemplateColumns: '40% 1fr', overflow: 'hidden', borderRadius: 4 }}>
      <div style={{ background: '#f8f8fa', padding: '8px', borderRight: '1.5px solid #e8e8f0' }}>
        <div style={{ fontWeight: 700, fontSize: 8, marginBottom: 2 }}>{userName}</div>
        <div style={{ color: '#555', fontSize: 5 }}>alex@email.com</div>
        <div style={{ color: '#555', fontSize: 5 }}>London, UK</div>
        <div style={{ color: '#7c6ff7', fontWeight: 700, fontSize: 5, marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 }}>SKILLS</div>
        {[80, 60, 90, 70].map((w, i) => (
          <div key={i} style={{ height: 2, background: '#7c6ff7', borderRadius: 2, width: `${w}%`, margin: '2px 0', opacity: 0.6 }} />
        ))}
      </div>
      <div style={{ padding: '8px' }}>
        {['EXPERIENCE', 'EDUCATION'].map(sec => (
          <div key={sec}>
            <div style={{ fontWeight: 700, fontSize: 6, borderBottom: '0.5px solid #eee', paddingBottom: 1, marginTop: 4, marginBottom: 2 }}>{sec}</div>
            <div style={{ height: 3, background: '#eee', borderRadius: 2, margin: '2px 0' }} />
            <div style={{ height: 3, background: '#eee', borderRadius: 2, width: '85%', margin: '2px 0' }} />
            <div style={{ height: 3, background: '#eee', borderRadius: 2, width: '65%', margin: '2px 0' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplatePreview({ template, selected, onClick, plan, userName }: TemplatePreviewProps) {
  const info = TEMPLATES[template];
  const badge = TIER_BADGE[info.tier];
  const locked =
    (info.tier === 'beta' && plan === 'free') ||
    (info.tier === 'pro' && !['pro', 'executive'].includes(plan));

  return (
    <div
      onClick={locked ? undefined : onClick}
      style={{
        background: 'var(--bg2)',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: locked ? 0.55 : 1,
        position: 'relative',
        boxShadow: selected ? '0 0 0 4px var(--accent-dim)' : undefined,
      }}
    >
      {/* Preview box */}
      <div style={{
        background: '#fff',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
        height: 110,
        border: '1px solid #e5e7eb',
      }}>
        <MockCV template={template} userName={userName} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{info.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{info.description}</div>
        </div>
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
      </div>

      {locked && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'var(--radius)',
          background: 'rgba(14,14,17,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600 }}>🔒 Upgrade to unlock</span>
        </div>
      )}
    </div>
  );
}
