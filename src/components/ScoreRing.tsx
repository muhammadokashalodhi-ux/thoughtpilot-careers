'use client';
import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showGrade?: boolean;
  grade?: string;
  label?: string;
  animate?: boolean;
}

function getColor(score: number): string {
  if (score >= 75) return 'var(--green)';
  if (score >= 55) return 'var(--amber)';
  return 'var(--red)';
}

function getGradientId(score: number): string {
  if (score >= 75) return 'ringGreen';
  if (score >= 55) return 'ringAmber';
  return 'ringRed';
}

export default function ScoreRing({
  score,
  size = 140,
  strokeWidth = 10,
  showGrade = true,
  grade,
  label = 'ATS Score',
  animate = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = getColor(score);

  useEffect(() => {
    if (!animate) { setDisplayScore(score); return; }
    let start: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [score, animate]);

  const gid = getGradientId(score);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="ringGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4a0" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="ringAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5a623" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="ringRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5b5b" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg3)"
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />

        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - (showGrade ? 10 : 4)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: size * 0.22,
            fontWeight: 700,
            fontFamily: 'Sora, sans-serif',
            fill: color,
          }}
        >
          {displayScore}
        </text>

        {showGrade && grade && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.15}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: size * 0.13,
              fontWeight: 600,
              fontFamily: 'Sora, sans-serif',
              fill: 'var(--text2)',
            }}
          >
            Grade {grade}
          </text>
        )}
      </svg>
      {label && (
        <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, textAlign: 'center' }}>
          {label}
        </span>
      )}
    </div>
  );
}
