'use client';

import React from 'react';

interface BrieflyLogoProps {
  size?: number | string;
  showWordmark?: boolean;
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  darkTheme?: boolean;
}

export function BrieflyLogo({
  size = 36,
  showWordmark = false,
  className = '',
  variant = 'icon',
  darkTheme = false,
}: BrieflyLogoProps) {
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 36;
  const wordmarkSize = Math.round(numericSize * 0.55);

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Split Newspaper & Neural AI Vector Emblem */}
      <svg
        width={numericSize}
        height={numericSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Subtle glow / gradient definitions */}
          <linearGradient id="briefly-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0073e0" />
            <stop offset="100%" stopColor="#005ab3" />
          </linearGradient>
          <linearGradient id="briefly-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb691" />
            <stop offset="100%" stopColor="#c25300" />
          </linearGradient>
          <linearGradient id="briefly-node" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* LEFT HALF: NEWSPAPER / EDITORIAL DISPATCH */}
        {/* Background Paper Page Layer */}
        <path
          d="M20 32H30V74H20C17.79 74 16 72.21 16 70V36C16 33.79 17.79 32 20 32Z"
          fill="none"
          stroke={darkTheme ? '#475569' : '#94a3b8'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Foreground Folded Sheet */}
        <path
          d="M30 24H50V78H28C23.58 78 20 74.42 20 70V30"
          fill="none"
          stroke={darkTheme ? '#cbd5e1' : '#1e293b'}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blue Headline Block */}
        <rect
          x="28"
          y="30"
          width="18"
          height="16"
          rx="2"
          fill="url(#briefly-blue)"
        />

        {/* Text lines */}
        <line
          x1="30"
          y1="51"
          x2="48"
          y2="51"
          stroke={darkTheme ? '#94a3b8' : '#64748b'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="30"
          y1="57"
          x2="48"
          y2="57"
          stroke={darkTheme ? '#94a3b8' : '#64748b'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Amber Category/Insight Tag Blocks */}
        <rect
          x="28"
          y="63"
          width="8"
          height="6"
          rx="1"
          fill="#d97706"
        />
        <rect
          x="38"
          y="63"
          width="8"
          height="6"
          rx="1"
          fill="#d97706"
        />

        {/* CENTRAL DIVIDER / SPINE */}
        <line
          x1="52"
          y1="24"
          x2="52"
          y2="78"
          stroke="#0284c7"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* RIGHT HALF: NEURAL BRAIN NETWORK + VERIFIED TICK */}
        {/* Neural Circuit Branch 1 (Top) */}
        <path
          d="M52 32H60C64 32 66 26 66 24"
          stroke="#0284c7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="66" cy="24" r="3.5" fill="#38bdf8" />

        {/* Neural Circuit Branch 2 (Mid-Upper loop) */}
        <path
          d="M52 42H64C72 42 78 48 78 54C78 60 74 65 68 67"
          stroke="#0284c7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="78" cy="54" r="3" fill="#38bdf8" />

        {/* Neural Circuit Branch 3 (Mid-Lower loop) */}
        <path
          d="M52 56H58C62 56 64 64 68 64C72 64 74 61 74 58"
          stroke="#0284c7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="68" cy="64" r="3" fill="#38bdf8" />

        {/* Neural Circuit Branch 4 (Bottom lobe) */}
        <path
          d="M52 68H60C66 68 68 76 64 78C60 80 56 76 56 72"
          stroke="#0284c7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="56" cy="72" r="3" fill="#38bdf8" />

        {/* VERIFICATION CHECKMARK (Copper / Amber in brain center) */}
        <path
          d="M60 52L66 58L79 43"
          stroke="#ea580c"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark (Optional) */}
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className="font-headline font-bold tracking-tight text-on-surface leading-none"
            style={{ fontSize: `${wordmarkSize}px` }}
          >
            Briefly
          </span>
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant font-semibold mt-0.5">
            Distilled Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

export default BrieflyLogo;
