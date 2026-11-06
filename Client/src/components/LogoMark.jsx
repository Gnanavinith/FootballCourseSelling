export default function LogoMark({ className = "", spin = false }) {
  return (
    <svg viewBox="0 0 38 38" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b0f1a" />
        </linearGradient>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Outer professional shield crest */}
      <path
        d="M19 2C27 2 34 5 34 5C34 17 31 27 19 36C7 27 4 17 4 5C4 5 11 2 19 2Z"
        fill="url(#shield-grad)"
        stroke="url(#gold-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#gold-glow)"
      />
      {/* Inner crest accent lines */}
      <path
        d="M19 4.5C25.5 4.5 31.5 7 31.5 7C31.5 16 28.5 24.5 19 33C9.5 24.5 6.5 16 6.5 7C6.5 7 12.5 4.5 19 4.5Z"
        stroke="url(#gold-grad)"
        strokeWidth="0.75"
        strokeOpacity="0.5"
        fill="none"
      />
      {/* Centered professional football / soccer ball icon */}
      <g className={spin ? "logo-ball-spin" : undefined} style={{ transformOrigin: "19px 18.5px" }}>
        <circle cx="19" cy="18.5" r="7.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        {/* Central pentagon */}
        <polygon points="19,14.5 22.2,16.8 21,20.5 17,20.5 15.8,16.8" fill="#0f172a" />
        {/* Seam lines */}
        <path
          d="M19 14.5V11M22.2 16.8L25.5 15M21 20.5L23.5 23.5M17 20.5L14.5 23.5M15.8 16.8L12.5 15"
          stroke="#0f172a"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
