'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useCareerStore } from '@/store/career';
import CareerSuiteApp from '@/components/CareerSuiteApp';

const API     = process.env.NEXT_PUBLIC_API_URL  || 'https://api.thoughtpilotai.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL  || 'https://app.thoughtpilotai.com';
const COOKIE_DOMAIN = '.thoughtpilotai.com';

// ── Theme helpers ─────────────────────────────────────────────────────────────
function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('tp_theme') as 'dark' | 'light') || 'dark';
}

function setTheme(t: 'dark' | 'light') {
  localStorage.setItem('tp_theme', t);
  document.documentElement.setAttribute('data-theme', t);
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ userName }: { userName?: string }) {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => { setThemeState(getTheme()); }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  }

  return (
    <nav className="cs-nav">
      <a href={APP_URL} className="cs-nav-brand">
        <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
          {/* Gradient fallback — always visible behind image */}
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', fontWeight: 700,
          }}>tp</div>
          {/* Actual icon — covers the fallback when it loads */}
          <img
            src="/icons/icon-32.png"
            alt="ThoughtPilot AI"
            className="cs-nav-logo"
            style={{ position: 'absolute', inset: 0, width: 32, height: 32, borderRadius: 8 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div>
          <div className="cs-nav-title font-display">ThoughtPilot AI</div>
          <div className="cs-nav-subtitle font-sans">Career Suite</div>
        </div>
      </a>

      <div className="cs-nav-right">
        {userName && (
          <span className="font-sans" style={{ fontSize: 13, color: 'var(--text3)' }}>
            {userName}
          </span>
        )}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <a href={APP_URL + '/dashboard'} className="cs-back-link font-sans">
          ← <span>Back to dashboard</span>
        </a>
      </div>
    </nav>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <>
      <Navbar />
      <div className="cs-main" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, minHeight: '100vh',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <span className="font-sans" style={{ color: 'var(--text3)', fontSize: 14 }}>
          Loading Career Suite…
        </span>
      </div>
    </>
  );
}

// ── Login / unauthenticated screen ────────────────────────────────────────────
function LoginScreen() {
  const redirectUrl = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : 'https://careers.thoughtpilotai.com'
  );

  const features = [
    { icon: '🧠', title: 'Recruiter Intelligence',  desc: '18-dimension CV analysis' },
    { icon: '🔍', title: 'Authenticity Check',       desc: 'AI-pattern detection' },
    { icon: '🎯', title: 'Interview Risk Prep',       desc: 'Flag hard questions early' },
    { icon: '📄', title: '5 Export Templates',        desc: 'PDF or Word download' },
  ];

  return (
    <>
      <Navbar />
      <div className="cs-main" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: 500, width: '100%', textAlign: 'center',
          animation: 'fadeIn 0.4s ease',
        }}>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
          }}>
            <span style={{ fontSize: 32, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>tp</span>
          </div>

          <h1 className="font-display" style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.5px' }}>
            Career Suite
          </h1>
          <p className="font-sans" style={{ color: 'var(--text2)', marginBottom: 6, lineHeight: 1.7 }}>
            AI that thinks like a senior recruiter — 18-dimension CV analysis, ATS optimisation and professional exports.
          </p>
          <p className="font-sans" style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 36 }}>
            Sign in with your ThoughtPilot account to get started.
          </p>

          {/* CTA */}
          <a
            href={`${APP_URL}/login?redirect=${redirectUrl}`}
            className="btn btn-primary btn-lg font-display"
            style={{
              display: 'inline-flex', margin: '0 auto 40px',
              boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
              letterSpacing: '-0.3px',
            }}
          >
            Sign in with ThoughtPilot →
          </a>

          {/* Feature grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, textAlign: 'left',
          }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div className="font-display" style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
                  {f.title}
                </div>
                <div className="font-sans" style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          <p className="font-sans" style={{ marginTop: 28, fontSize: 12, color: 'var(--text3)' }}>
            Don't have an account?{' '}
            <a href={`${APP_URL}/signup`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Sign up free
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Page() {
  const { handoff, setHandoff, authLoading, setAuthLoading, restoreFromCache } = useCareerStore();

  // ── Inactivity logout — mirrors main app behaviour ──────────────────────────
  useEffect(() => {
    if (!handoff) return;

    const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
    let timer: ReturnType<typeof setTimeout> | null = null;

    function resetTimer() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // Clear cookie and redirect to login
        Cookies.remove('tp_token', { domain: COOKIE_DOMAIN });
        Cookies.remove('tp_token');
        window.location.href = `${APP_URL}/login?redirect=${encodeURIComponent(window.location.href)}`;
      }, INACTIVITY_MS);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [handoff]);

  useEffect(() => {
    // Apply saved theme on mount
    const saved = localStorage.getItem('tp_theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    const init = async () => {
      // Step 1: Check URL for token passed from main app
      const params   = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      if (urlToken) {
        Cookies.set('tp_token', urlToken, {
          expires:  7,
          sameSite: 'lax',
          secure:   true,
          domain:   COOKIE_DOMAIN,
        });
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Step 2: Get token from cookie
      const token = urlToken || Cookies.get('tp_token');
      if (!token) { setAuthLoading(false); return; }

      // Step 3: Handoff
      try {
        const { data } = await axios.get(`${API}/api/career/handoff`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setHandoff(data);

        // Step 4: Restore cached analysis if available
        if (data.cv_analysis_cache) {
          const cachedAt = data.cv_analyzed_at ? new Date(data.cv_analyzed_at) : null;
          const ageHours = cachedAt
            ? (Date.now() - cachedAt.getTime()) / (1000 * 60 * 60)
            : 999;

          if (ageHours < 168) { // 7 days — matches backend cache TTL
            restoreFromCache(data.cv_analysis_cache);
            console.log(`[career] Restored cached analysis (${Math.round(ageHours)}h old)`);
          }
        }
      } catch (err) {
        Cookies.remove('tp_token', { domain: COOKIE_DOMAIN });
        Cookies.remove('tp_token');
        console.error('[handoff] failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    init();
  }, []);

  if (authLoading) return <LoadingScreen />;
  if (!handoff)    return <LoginScreen />;

  return (
    <>
      <Navbar userName={handoff.user?.full_name?.split(' ')[0]} />
      <div className="cs-main">
        <CareerSuiteApp />
      </div>
    </>
  );
}
