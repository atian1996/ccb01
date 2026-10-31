import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import type { UniversityPartner } from '../data/competitionData';

export const BannerIllustration: React.FC<{
  theme: 'summit' | 'countdown' | 'ai_track' | 'finals';
}> = ({ theme }) => {
  const bgGradient =
    theme === 'summit'
      ? 'from-[#CFE4FF] via-[#E6F1FF] to-[#BBD8FF]'
      : theme === 'countdown'
      ? 'from-[#D4E7FF] via-[#EBF4FF] to-[#B8D7FF]'
      : theme === 'ai_track'
      ? 'from-[#CEE2FF] via-[#E5F0FF] to-[#BCD9FF]'
      : 'from-[#D2E6FF] via-[#E8F2FF] to-[#C0DCFF]';

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-r ${bgGradient}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 520"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="heroSkyGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#D8EAFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8EC0FF" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="heroRibbon" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#7FB5FF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#B8D8FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="shieldBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4FA0FF" />
            <stop offset="50%" stopColor="#1664FF" />
            <stop offset="100%" stopColor="#0A3D91" />
          </linearGradient>
          <linearGradient id="shieldRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#99CAFF" />
            <stop offset="100%" stopColor="#2B7BFF" />
          </linearGradient>
          <linearGradient id="goldLock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE58F" />
            <stop offset="50%" stopColor="#FFC53D" />
            <stop offset="100%" stopColor="#D48806" />
          </linearGradient>
          <linearGradient id="pedestalTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#D6E8FF" />
            <stop offset="100%" stopColor="#8ABFFF" />
          </linearGradient>
          <linearGradient id="pedestalSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6BA8FF" />
            <stop offset="50%" stopColor="#A8CEFF" />
            <stop offset="100%" stopColor="#4C90F5" />
          </linearGradient>
          <radialGradient id="nodeBubble" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#B5D6FF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#5B9EFF" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* Soft ambient sky-blue curves and architectural arches */}
        <path
          d="M-120 460 C 260 220, 640 80, 1180 340 C 1480 480, 1740 300, 2040 120 L 2040 520 L -120 520 Z"
          fill="url(#heroSkyGlow)"
        />
        <path
          d="M-80 -40 C 320 260, 820 380, 1440 80 C 1660 -20, 1840 40, 2000 160"
          stroke="url(#heroRibbon)"
          strokeWidth="48"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M120 520 C 460 320, 920 240, 1480 440"
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M60 480 C 420 280, 900 200, 1520 400"
          stroke="#75B0FF"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="8 8"
          fill="none"
        />

        {/* Perspective grid floor on bottom left & center */}
        <g stroke="#8CC0FF" strokeOpacity="0.28" strokeWidth="1">
          <line x1="80" y1="520" x2="460" y2="320" />
          <line x1="240" y1="520" x2="560" y2="320" />
          <line x1="400" y1="520" x2="660" y2="320" />
          <line x1="560" y1="520" x2="760" y2="320" />
          <line x1="720" y1="520" x2="860" y2="320" />
          <line x1="60" y1="460" x2="900" y2="460" />
          <line x1="160" y1="410" x2="880" y2="410" />
          <line x1="260" y1="365" x2="860" y2="365" />
        </g>

        {/* Soft glowing bokeh circles */}
        <circle cx="140" cy="110" r="14" fill="#FFFFFF" fillOpacity="0.55" />
        <circle cx="210" cy="280" r="24" fill="#FFFFFF" fillOpacity="0.4" />
        <circle cx="820" cy="95" r="18" fill="#FFFFFF" fillOpacity="0.5" />
        <circle cx="960" cy="180" r="10" fill="#FFFFFF" fillOpacity="0.65" />
        <circle cx="1760" cy="110" r="28" fill="#FFFFFF" fillOpacity="0.35" />
        <circle cx="1820" cy="240" r="16" fill="#FFFFFF" fillOpacity="0.5" />

        {/* Binary matrix watermarks on right */}
        <g
          fill="#5A9CF8"
          fillOpacity="0.28"
          fontFamily="JetBrains Mono, monospace"
          fontSize="13"
          fontWeight="600"
        >
          <text x="1590" y="90">10110</text>
          <text x="1590" y="108">01001</text>
          <text x="1590" y="126">11010</text>
          <text x="1590" y="144">00111</text>
          <text x="1720" y="190">1010110</text>
          <text x="1720" y="208">0110101</text>
          <text x="1720" y="226">1100110</text>
        </g>

        {/* Right Side 3D Cyber Security Pedestal + Shield + Golden Lock */}
        <g transform="translate(1060, 40)">
          {/* Orbiting trajectory rings */}
          <ellipse
            cx="330"
            cy="265"
            rx="270"
            ry="95"
            stroke="#FFFFFF"
            strokeOpacity="0.75"
            strokeWidth="2"
            fill="none"
          />
          <ellipse
            cx="330"
            cy="265"
            rx="225"
            ry="76"
            stroke="#4B94FF"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            fill="none"
          />

          {/* 3D Cylindrical Tiered Pedestal Base */}
          {/* Bottom tier */}
          <ellipse cx="330" cy="390" rx="185" ry="54" fill="url(#pedestalSide)" opacity="0.65" />
          <ellipse cx="330" cy="376" rx="185" ry="54" fill="url(#pedestalTop)" stroke="#FFFFFF" strokeWidth="2" />
          {/* Middle tier */}
          <ellipse cx="330" cy="356" rx="142" ry="40" fill="url(#pedestalSide)" opacity="0.85" />
          <ellipse cx="330" cy="344" rx="142" ry="40" fill="url(#pedestalTop)" stroke="#FFFFFF" strokeWidth="2" />
          {/* Inner glowing core ring */}
          <ellipse
            cx="330"
            cy="336"
            rx="104"
            ry="28"
            fill="#539BFF"
            fillOpacity="0.35"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Floating 3D Cyber Shield */}
          <g transform="translate(215, 45)">
            {/* Back bevel layer */}
            <path
              d="M122 10 L224 52 V146 C224 222 178 272 122 298 C66 272 20 222 20 146 V52 L122 10 Z"
              fill="#8CC2FF"
              opacity="0.65"
            />
            {/* Outer Silver-White Rim */}
            <path
              d="M115 12 L215 54 V146 C215 220 170 268 115 294 C60 268 15 220 15 146 V54 L115 12 Z"
              fill="url(#shieldRim)"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            {/* Inner Royal Blue Glossy Shield */}
            <path
              d="M115 28 L198 63 V143 C198 206 160 247 115 270 C70 247 32 206 32 143 V63 L115 28 Z"
              fill="url(#shieldBody)"
            />
            {/* Shield glass reflection */}
            <path
              d="M115 28 L32 63 V143 C32 188 55 224 88 250 L155 45 L115 28 Z"
              fill="#FFFFFF"
              fillOpacity="0.16"
            />

            {/* Golden 3D Padlock in the center of the shield */}
            <g transform="translate(77, 88)">
              {/* Shackle */}
              <path
                d="M18 34 V20 C18 7 27 -2 38 -2 C49 -2 58 7 58 20 V34"
                stroke="url(#goldLock)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lock body */}
              <rect
                x="6"
                y="32"
                width="64"
                height="52"
                rx="12"
                fill="url(#goldLock)"
                stroke="#FFFBE6"
                strokeWidth="2"
              />
              {/* Keyhole */}
              <circle cx="38" cy="54" r="6" fill="#874D00" />
              <path d="M35 58 L33 70 H43 L41 58 Z" fill="#874D00" />
            </g>
          </g>

          {/* 4 Floating Holographic Security Bubbles around the shield */}
          {/* Top-left bubble: Globe */}
          <g transform="translate(80, 125)">
            <circle cx="36" cy="36" r="34" fill="url(#nodeBubble)" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="36" cy="36" r="16" stroke="#1664FF" strokeWidth="1.8" fill="none" />
            <ellipse cx="36" cy="36" rx="8" ry="16" stroke="#1664FF" strokeWidth="1.5" fill="none" />
            <line x1="20" y1="36" x2="52" y2="36" stroke="#1664FF" strokeWidth="1.5" />
          </g>

          {/* Bottom-left bubble: Firewall Shield */}
          <g transform="translate(30, 225)">
            <circle cx="32" cy="32" r="30" fill="url(#nodeBubble)" stroke="#FFFFFF" strokeWidth="2" />
            <path
              d="M32 16 L46 22 V32 C46 41 40 46 32 49 C24 46 18 41 18 32 V22 L32 16 Z"
              stroke="#1664FF"
              strokeWidth="2"
              fill="#E6F2FF"
            />
          </g>

          {/* Top-right bubble: Terminal / Code */}
          <g transform="translate(475, 105)">
            <circle cx="34" cy="34" r="32" fill="url(#nodeBubble)" stroke="#FFFFFF" strokeWidth="2" />
            <rect x="18" y="22" width="32" height="24" rx="4" stroke="#1664FF" strokeWidth="2" fill="#E6F2FF" />
            <path d="M24 31 L29 34 L24 37" stroke="#1664FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="33" y1="37" x2="42" y2="37" stroke="#1664FF" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Bottom-right bubble: Key / Auth */}
          <g transform="translate(535, 210)">
            <circle cx="34" cy="34" r="32" fill="url(#nodeBubble)" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="28" cy="34" r="7" stroke="#1664FF" strokeWidth="2" fill="#E6F2FF" />
            <path d="M35 34 H48 V40 M43 34 V39" stroke="#1664FF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export const TrackCoverIllustration: React.FC<{
  type: 'network' | 'data' | 'ai';
  status: string;
}> = ({ type }) => {
  if (type === 'network') {
    return (
      <div className="relative w-full h-full min-h-[116px] bg-gradient-to-br from-[#D8E5FF] via-[#EBF2FF] to-[#C5DCFF] flex items-center justify-center overflow-hidden p-3.5 rounded-lg border border-blue-100/80">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 180" fill="none">
          <path
            d="M-20 150 Q 90 60 200 130 T 340 70"
            stroke="#5C8DFF"
            strokeOpacity="0.35"
            strokeWidth="18"
            fill="none"
          />
          <circle cx="265" cy="45" r="36" fill="#7FA8FF" fillOpacity="0.25" />
          <circle cx="45" cy="35" r="18" fill="#FFFFFF" fillOpacity="0.6" />
        </svg>
        <div className="relative z-10 text-center">
          <div className="text-[10px] font-medium text-slate-500 tracking-wider mb-1">
            成果发布 · 实战演练 · 攻防对抗
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#1D39C4] tracking-tight leading-tight">
            下一代 <span className="px-1 py-0.5 rounded bg-[#1664FF] text-white text-xs">AI</span> 安全与攻防赛
          </div>
          <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full bg-white/80 border border-blue-200 text-[10px] font-bold text-[#1664FF] tracking-widest">
            盛 大 启 幕
          </div>
        </div>
      </div>
    );
  }

  if (type === 'data') {
    return (
      <div className="relative w-full h-full min-h-[116px] bg-gradient-to-br from-[#D2EBFF] via-[#E6F6FF] to-[#99CEFF] flex items-center justify-between overflow-hidden px-4 py-3 rounded-lg border border-sky-100/80">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 180" fill="none">
          <circle cx="250" cy="95" r="65" fill="#1664FF" fillOpacity="0.15" />
          <polygon points="235,35 295,68 295,132 235,165 175,132 175,68" fill="#1664FF" fillOpacity="0.18" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
        <div className="relative z-10 text-left">
          <div className="text-base font-black text-[#0958D9] italic tracking-tight">智聚未来</div>
          <div className="text-xs font-bold text-[#1664FF] mt-0.5">数据安全与AI共生</div>
          <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-[#1664FF] text-white text-[10px] font-semibold">
            探索下一代隐私计算
          </div>
        </div>
        <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-[#1664FF] to-[#36CFC9] text-white flex items-center justify-center shadow-md font-black text-xs">
          DATA
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[116px] bg-gradient-to-r from-[#5B9EFF] via-[#2F76EB] to-[#1046A8] flex items-center justify-between overflow-hidden px-4 py-3 rounded-lg border border-blue-200/60 text-white">
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 320 180" fill="none">
        <rect x="180" y="20" width="110" height="110" rx="18" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="235" cy="75" r="35" stroke="#BAE0FF" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
      <div className="relative z-10 text-left">
        <div className="text-[10px] text-blue-100 font-mono-num tracking-widest">LLM GUARDRAILS</div>
        <div className="text-xl font-black tracking-wider text-white mt-0.5">SNIC · AI</div>
        <div className="text-[11px] text-blue-100 font-medium mt-1">大模型与人工智能安全先导赛</div>
      </div>
      <div className="relative z-10 w-11 h-11 rounded-lg bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center font-bold text-xs">
        AI
      </div>
    </div>
  );
};

export const FeaturedNewsIllustration: React.FC = () => {
  return (
    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-r from-[#D6E9FF] via-[#E6F2FF] to-[#BAD9FF] flex items-center justify-between p-5 sm:p-7 border border-blue-100">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 360" fill="none">
        <defs>
          <linearGradient id="newsShield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4CA0FF" />
            <stop offset="100%" stopColor="#1664FF" />
          </linearGradient>
        </defs>
        <path
          d="M0 290 Q 220 210 420 290 T 640 240 L 640 360 L 0 360 Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />
        <circle cx="500" cy="175" r="115" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2" />
        <circle
          cx="500"
          cy="175"
          r="85"
          stroke="#4E95FF"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        {/* Right 3D shield graphic */}
        <g transform="translate(435, 75)">
          <ellipse cx="65" cy="175" rx="75" ry="22" fill="#7EB6FF" fillOpacity="0.45" />
          <ellipse cx="65" cy="168" rx="60" ry="16" fill="#FFFFFF" fillOpacity="0.85" />
          <path
            d="M65 10 L122 34 V88 C122 132 96 160 65 176 C34 160 8 132 8 88 V34 L65 10 Z"
            fill="url(#newsShield)"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <rect
            x="47"
            y="72"
            width="36"
            height="30"
            rx="6"
            fill="#FFC53D"
            stroke="#FFFBE6"
            strokeWidth="1.5"
          />
          <path
            d="M54 72 V63 C54 56 59 51 65 51 C71 51 76 56 76 63 V72"
            stroke="#FFC53D"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      <div className="relative z-10 max-w-[62%] space-y-2.5">
        <div className="text-2xl sm:text-3xl font-black text-[#0D265C] leading-tight tracking-tight">
          <div>XX杯</div>
          <div className="mt-0.5">网数智安全大赛</div>
        </div>
        <div className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-wide">
          以赛促学 &nbsp; 以赛促教 &nbsp; 以赛促建 &nbsp; 以赛促用
        </div>
        <div className="pt-2">
          <div className="text-[11px] font-bold text-slate-700 mb-1.5">报名倒计时</div>
          <div className="flex items-center gap-1.5 text-xs font-mono-num">
            <span className="w-7 h-7 rounded bg-[#1664FF] text-white font-bold flex items-center justify-center shadow-2xs">
              12
            </span>
            <span className="text-slate-600 text-[11px]">天</span>
            <span className="w-7 h-7 rounded bg-[#1664FF] text-white font-bold flex items-center justify-center shadow-2xs">
              08
            </span>
            <span className="text-slate-600 text-[11px]">时</span>
            <span className="w-7 h-7 rounded bg-[#1664FF] text-white font-bold flex items-center justify-center shadow-2xs">
              36
            </span>
            <span className="text-slate-600 text-[11px]">分</span>
            <span className="w-7 h-7 rounded bg-[#1664FF] text-white font-bold flex items-center justify-center shadow-2xs">
              24
            </span>
            <span className="text-slate-600 text-[11px]">秒</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MomentCardVisual: React.FC<{
  variant: 'arena' | 'expert' | 'team' | 'behind' | 'defense' | 'award' | 'interview' | 'hackathon';
  category: string;
}> = ({ variant, category }) => {
  const ribbonColor =
    category === '进展报道'
      ? 'bg-[#00B42A]'
      : category === '赛事花絮'
      ? 'bg-[#FF9A2E]'
      : category === '专家观点'
      ? 'bg-[#F53F3F]'
      : 'bg-[#1664FF]';

  const bgMap = {
    arena: 'from-[#D8E5FF] via-[#EDF3FF] to-[#C2D8FF]',
    expert: 'from-[#D0F0FF] via-[#E6F8FF] to-[#99DEFF]',
    team: 'from-[#E2DCFF] via-[#F0EEFF] to-[#C8BFFF]',
    behind: 'from-[#D2EBFF] via-[#E8F6FF] to-[#A6D4FF]',
    defense: 'from-[#CEFAEE] via-[#E6FCF5] to-[#99F0D9]',
    award: 'from-[#DCE8FF] via-[#EEF4FF] to-[#B8D2FF]',
    interview: 'from-[#D6EAFF] via-[#EBF5FF] to-[#B5D8FF]',
    hackathon: 'from-[#DDD8FF] via-[#F2F0FF] to-[#C0B6FF]',
  };

  const titleText =
    variant === 'arena'
      ? '下一代 AI 技术应用峰会'
      : variant === 'behind'
      ? '智聚未来 · AI安全共生'
      : variant === 'expert'
      ? '第三届全球互联网AI峰会'
      : variant === 'team'
      ? '全球AI创新与网安峰会'
      : '万物向新 · 智算安全峰会';

  return (
    <div
      className={`relative w-full aspect-[16/10] bg-gradient-to-br ${bgMap[variant]} overflow-hidden flex items-center justify-center p-4 rounded-lg border border-blue-100/80`}
    >
      <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 320 200" fill="none">
        <circle cx="265" cy="50" r="55" fill="#FFFFFF" fillOpacity="0.55" />
        <path
          d="M-20 165 Q 110 85 230 150 T 340 100"
          stroke="#4E8CFF"
          strokeOpacity="0.3"
          strokeWidth="14"
          fill="none"
        />
      </svg>

      {/* Top-right category ribbon badge matching the UI design */}
      <span
        className={`absolute top-2 right-2 z-20 px-2.5 py-0.5 rounded-sm ${ribbonColor} text-white text-[11px] font-bold shadow-2xs`}
      >
        {category}
      </span>

      <div className="relative z-10 text-center px-2">
        <div className="text-[10px] font-medium text-slate-500 tracking-wider mb-1">
          2026 长城杯 · 赛事直击
        </div>
        <div className="text-sm font-extrabold text-[#103478] tracking-tight leading-snug">
          {titleText}
        </div>
        <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-white/85 text-[#1664FF] text-[10px] font-bold border border-blue-200/70">
          盛 大 启 幕
        </div>
      </div>
    </div>
  );
};

export const CertificateTrophyIllustration: React.FC = () => {
  return (
    <div className="relative w-44 h-40 shrink-0 flex items-center justify-center select-none">
      <svg viewBox="0 0 220 200" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="certCardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DCEBFF" />
          </linearGradient>
          <linearGradient id="trophyCrystal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#85BFFF" />
            <stop offset="50%" stopColor="#2B7BFF" />
            <stop offset="100%" stopColor="#0E429E" />
          </linearGradient>
        </defs>
        {/* Isometric glowing base */}
        <polygon
          points="110,132 198,162 110,192 22,162"
          fill="#8EC2FF"
          fillOpacity="0.35"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <polygon
          points="110,124 184,150 110,176 36,150"
          fill="#DCEBFF"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Tilted Certificate Card */}
        <g transform="translate(38, 36) rotate(-8)">
          <rect
            x="0"
            y="0"
            width="102"
            height="112"
            rx="8"
            fill="url(#certCardGrad)"
            stroke="#69A7FF"
            strokeWidth="2"
          />
          <text
            x="51"
            y="28"
            textAnchor="middle"
            fill="#1664FF"
            fontSize="13"
            fontWeight="800"
            fontFamily="Noto Sans SC, sans-serif"
          >
            获奖证书
          </text>
          <line x1="20" y1="44" x2="82" y2="44" stroke="#94BFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="58" x2="82" y2="58" stroke="#B2D1FF" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="72" x2="66" y2="72" stroke="#B2D1FF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="74" cy="90" r="10" fill="#FF7875" fillOpacity="0.8" />
        </g>
        {/* 3D Crystal Star Trophy */}
        <g transform="translate(116, 48)">
          <polygon
            points="30,0 38,16 56,19 43,31 46,48 30,40 14,48 17,31 4,19 22,16"
            fill="url(#trophyCrystal)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <polygon points="22,44 38,44 44,96 16,96" fill="url(#trophyCrystal)" opacity="0.9" />
          <rect x="10" y="94" width="40" height="12" rx="3" fill="#0D3B8C" />
        </g>
      </svg>
    </div>
  );
};

export const UniversityCrest: React.FC<{ uni: UniversityPartner }> = ({ uni }) => {
  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-200">
        <defs>
          <path id={`topArc-${uni.id}`} d="M 16,50 A 34,34 0 1,1 84,50" />
          <path id={`botArc-${uni.id}`} d="M 84,50 A 34,34 0 1,1 16,50" />
        </defs>
        {/* Outer University Seal Ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="#FFFFFF"
          stroke={uni.primaryColor}
          strokeWidth="3.5"
        />
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke={uni.primaryColor}
          strokeWidth="1"
        />
        {/* Colored band for text */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={uni.primaryColor}
          strokeWidth="11"
          strokeOpacity="0.1"
        />
        {/* Inner Core Circle */}
        <circle
          cx="50"
          cy="50"
          r="26"
          fill={uni.primaryColor}
        />
        <circle
          cx="50"
          cy="50"
          r="23"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Curved University Name around Top */}
        <text
          fill={uni.primaryColor}
          fontSize="6.5"
          fontWeight="800"
          letterSpacing="1.2"
          fontFamily="Noto Sans SC, sans-serif"
        >
          <textPath href={`#topArc-${uni.id}`} startOffset="50%" textAnchor="middle">
            {uni.name}
          </textPath>
        </text>

        {/* Curved English / Founded around Bottom */}
        <text
          fill={uni.primaryColor}
          fontSize="5.5"
          fontWeight="700"
          letterSpacing="0.8"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          <textPath href={`#botArc-${uni.id}`} startOffset="50%" textAnchor="middle">
            ★ {uni.founded} ★
          </textPath>
        </text>

        {/* Center Emblem Character */}
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={uni.shortName.length > 2 ? '11' : '14'}
          fontWeight="900"
          fontFamily="Noto Sans SC, serif"
        >
          {uni.shortName}
        </text>
      </svg>
    </div>
  );
};

export const SimulatedVideoPlayer: React.FC<{
  title: string;
  duration: string;
  author: string;
  highlights?: string[];
}> = ({ title, duration, author, highlights = [] }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 450);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="bg-[#091929] rounded-xl overflow-hidden border border-slate-700/80 text-white">
      <div className="relative aspect-video bg-gradient-to-br from-[#061523] via-[#0B3B60] to-[#0284C7] flex flex-col justify-between p-6 overflow-hidden">
        {/* Animated Cyber Arena Visual Stage */}
        <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 800 450" fill="none">
          <circle
            cx="400"
            cy="225"
            r={110 + (progress % 25)}
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <circle cx="400" cy="225" r="75" stroke="#BAE6FD" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M80 360 L260 220 L420 270 L580 150 L720 190" stroke="#7DD3FC" strokeWidth="2.5" fill="none" />
          <circle cx="260" cy="220" r="6" fill="#E0F2FE" />
          <circle cx="420" cy="270" r="6" fill="#E0F2FE" />
          <circle cx="580" cy="150" r="6" fill="#38BDF8" />
        </svg>

        <div className="relative z-10 flex items-center justify-between text-xs text-sky-200">
          <span>“XX杯”官方高清赛事流 · {author}</span>
          <span className="font-mono-num">1080P 60FPS</span>
        </div>

        <div className="relative z-10 my-auto text-center max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center mx-auto mb-4 transition-transform duration-150 hover:scale-105 cursor-pointer"
            aria-label={isPlaying ? '暂停视频' : '播放视频'}
          >
            {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-0.5" />}
          </button>
          <p className="text-base font-semibold text-white/95 line-clamp-2">{title}</p>
          <p className="text-xs text-sky-200/90 mt-1.5">
            {isPlaying ? '正在播放赛事现场实况与技术解说字幕...' : '视频已暂停，点击中央按钮或下方进度条继续播放'}
          </p>
        </div>

        {/* Bottom Transport Bar */}
        <div className="relative z-10 bg-slate-950/75 backdrop-blur-md rounded-lg p-3 border border-white/10">
          <div
            className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer mb-2.5"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setProgress(Math.round((clickX / rect.width) * 100));
            }}
          >
            <div className="h-full bg-sky-400 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:text-sky-300 transition-colors cursor-pointer"
              >
                {isPlaying ? '暂停' : '播放'}
              </button>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? '已静音' : '开启声音'}</span>
              </button>
              <span className="font-mono-num text-slate-300">
                0{Math.floor((progress / 100) * 4)}:{String(Math.floor(((progress / 100) * 268) % 60)).padStart(2, '0')} / {duration}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>倍速 1.0x</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="text-xs font-medium text-sky-300 mb-2">视频章节看点（点击可跳转对应时间轴）：</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {highlights.map((hl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProgress((idx + 1) * 28);
                  setIsPlaying(true);
                }}
                className="text-left text-xs text-slate-300 hover:text-white bg-slate-800/70 hover:bg-sky-900/50 border border-slate-700/80 rounded-lg p-2.5 transition-colors cursor-pointer"
              >
                {hl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
