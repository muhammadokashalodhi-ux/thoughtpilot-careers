'use client';
import { useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useCareerStore } from '@/store/career';
import CareerSuiteApp from '@/components/CareerSuiteApp';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://thoughtpilot-ai-backend-production.up.railway.app';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://careers.thoughtpilotai.com';

export default function Page() {
  const { handoff, setHandoff, authLoading, setAuthLoading } = useCareerStore();

  useEffect(() => {
    const init = async () => {
      const token = Cookies.get('tp_token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`${API}/api/career/handoff`, {
          withCredentials: true,
        });
        setHandoff(data);
      } catch {
        // Token invalid / expired — treat as logged out
        Cookies.remove('tp_token');
      } finally {
        setAuthLoading(false);
      }
    };
    init();
  }, []);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>Loading ThoughtPilot Career Suite…</span>
      </div>
    );
  }

  if (!handoff) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          textAlign: 'center', maxWidth: 480, padding: '0 24px',
          animation: 'fadeIn 0.4s ease',
        }}>
          {/* Logo */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), #9b6ff5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 32, boxShadow: '0 8px 32px rgba(124,111,247,0.4)',
          }}>
            ✈️
          </div>

          <h1 style={{ fontSize: 28, marginBottom: 12, fontFamily: 'Sora, sans-serif' }}>
            ThoughtPilot Career Suite
          </h1>
          <p style={{ color: 'var(--text2)', marginBottom: 8, lineHeight: 1.6 }}>
            AI-powered CV analysis, ATS optimisation, job matching, and professional exports.
          </p>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>
            Sign in with your ThoughtPilot account to get started.
          </p>

          <a
            href={`https://thoughtpilotai.com/login?redirect=${encodeURIComponent('https://careers.thoughtpilotai.com')}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--accent)', color: '#fff',
              padding: '14px 32px', borderRadius: 'var(--radius)',
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(124,111,247,0.4)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}
          >
            ✈️ Sign in with ThoughtPilot
          </a>

          {/* Feature previews */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 40,
            textAlign: 'left',
          }}>
            {[
              { icon: '🔍', title: 'ATS Analysis', desc: '10-dimension CV scoring' },
              { icon: '✏️', title: 'Smart Edits', desc: 'Approve or tweak each change' },
              { icon: '🎯', title: 'Job Matching', desc: 'Tailor your CV per role' },
              { icon: '📄', title: '5 Templates', desc: 'Export as PDF or Word' },
            ].map((f) => (
              <div key={f.title} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <CareerSuiteApp />;
}
