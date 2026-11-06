import { useId } from "react";
import { Link } from "react-router-dom";

export default function LogoMark({ className = "", spin = false }) {
  const rawId = useId();
  // Sanitize id for SVG url references (remove colons from React useId)
  const safeId = rawId.replace(/[:]/g, "_");
  const shieldId = `shield-grad${safeId}`;
  const goldId = `gold-grad${safeId}`;
  const glowId = `gold-glow${safeId}`;

  return (
    <svg viewBox="0 0 38 38" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={shieldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b0f1a" />
        </linearGradient>
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e089" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#aa820a" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#d4af37" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Outer professional shield crest */}
      <path
        d="M19 2C27 2 34 5 34 5C34 17 31 27 19 36C7 27 4 17 4 5C4 5 11 2 19 2Z"
        fill={`url(#${shieldId})`}
        stroke={`url(#${goldId})`}
        strokeWidth="2"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />
      {/* Inner crest accent lines */}
      <path
        d="M19 4.5C25.5 4.5 31.5 7 31.5 7C31.5 16 28.5 24.5 19 33C9.5 24.5 6.5 16 6.5 7C6.5 7 12.5 4.5 19 4.5Z"
        stroke={`url(#${goldId})`}
        strokeWidth="0.75"
        strokeOpacity="0.55"
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

export { LogoMark };

/**
 * Standard brand logo component with mark + wordmark typography.
 * Ensures 100% visual consistency across Navbar, Footer, Admin, and Auth.
 */
export function BrandLogo({
  className = "",
  markClassName,
  textColor,
  title = "Vanakkam",
  subtitle = "Soccer",
  subtitleColor,
  showSubtitle = true,
  size = "md", // "sm" | "md" | "lg"
  to,
  onClick,
}) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const defaultMarkClass =
    markClassName ||
    (isSm
      ? "h-7 w-6"
      : isLg
        ? "h-10 w-9 sm:h-11 sm:w-10"
        : "h-8 w-7 sm:h-9 sm:w-8");

  const titleClass = isSm
    ? "text-[1.05rem]"
    : isLg
      ? "text-2xl sm:text-[1.7rem]"
      : "text-[1.15rem] sm:text-[1.28rem]";

  const subTextClass = isSm
    ? "text-[0.55rem] tracking-[0.35em]"
    : isLg
      ? "text-[0.68rem] tracking-[0.45em]"
      : "text-[0.62rem] tracking-[0.4em]";

  const barClass = isSm ? "w-2.5 h-[2px]" : isLg ? "w-4 h-[2px]" : "w-3 h-[2px]";

  const content = (
    <div
      className={`group inline-flex items-center gap-2.5 leading-none transition-transform duration-200 motion-reduce:transition-none ${className}`}
    >
      <LogoMark
        className={`${defaultMarkClass} shrink-0 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none`}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-black uppercase tracking-wider transition-colors duration-200 ${titleClass} ${
            textColor || "text-fg"
          }`}
        >
          {title}
        </span>
        {showSubtitle && (
          <span className="mt-1 flex items-center gap-1.5">
            <span className={`${barClass} rounded bg-gold-400 shrink-0`} />
            <span
              className={`font-display font-extrabold uppercase ${subTextClass} ${
                subtitleColor || "text-gold-500 dark:text-gold-400"
              }`}
            >
              {subtitle}
            </span>
          </span>
        )}
      </span>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
      >
        {content}
      </Link>
    );
  }

  return content;
}
