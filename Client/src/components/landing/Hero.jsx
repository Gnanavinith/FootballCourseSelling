
import { useState } from "react";
import { Link } from "react-router-dom";
import { SITE, PROOF_STRIP } from "../../config/site.js";

const VIDEO_ID = "cZleqHf7v8Y";

const TICKER = [
  "Ball Control Mastery",
  "Tactical Match Awareness",
  "First-Touch Confidence",
  "Explosive 1v1 Dribbling",
  "Accurate Passing Weight",
  "Discipline and Grit",
  "Tamil & English Drills",
  "Train on Any Ground",
];

function VideoFacade() {
  const [playing, setPlaying] = useState(true);
  const [thumb, setThumb] = useState(
    `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`
  );

  return (
    <div className="relative mx-auto w-full max-w-[640px] aspect-video group">
      {/* Ambient Stadium Glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-5 -z-10 rounded-[2rem] opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-75"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.22), transparent 60%), radial-gradient(circle at 85% 85%, rgba(16,185,129,0.16), transparent 60%)",
        }}
      />

      {/* Floating Information */}
      <div className="hero-chip hero-chip-a z-20 hidden sm:flex border border-slate-200/80 bg-white/95 text-ink-900 shadow-sm dark:border-white/10 dark:bg-ink-900/95 dark:text-white">
        <span className="h-2 w-2 rounded-full bg-pitch-500" />
        <span className="font-semibold text-xs">
          10,000+ Touches / Month
        </span>
      </div>

      <div className="hero-chip hero-chip-b z-20 hidden sm:flex border border-slate-200/80 bg-white/95 text-ink-900 shadow-sm dark:border-white/10 dark:bg-ink-900/95 dark:text-white">
        <span className="text-gold-500">★</span>
        <span className="font-semibold text-xs">
          Match-Ready Confidence
        </span>
      </div>

      {/* Video Player */}
      <div className="video-frame relative isolate aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-xl sm:rounded-2xl dark:border-white/10 dark:shadow-pop">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&rel=0&playsinline=1`}
            title="Vanakkam Soccer intro video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full cursor-pointer"
            aria-label="Play intro video"
          >
            <img
              src={thumb}
              onError={() =>
                setThumb(
                  `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`
                )
              }
              alt="Football training preview"
              width="1280"
              height="720"
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-20 sm:w-20">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/30 motion-reduce:animate-none" />

              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 text-ink-950 shadow-glow transition-transform duration-300 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1 h-7 w-7 sm:h-8 sm:w-8"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Ticker() {
  return (
    <div
      className="relative overflow-hidden border-y border-slate-200/70 bg-slate-100/50 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.02]"
      aria-label="Core football training skills"
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {TICKER.map((item) => (
              <li
                key={item}
                className="flex items-center whitespace-nowrap pl-6 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 sm:pl-10 sm:text-xs"
              >
                <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-gold-500 opacity-90 dark:bg-gold-400" />
                {item}
                <span
                  className="ml-6 text-ink-300 dark:text-white/20 sm:ml-10"
                  aria-hidden="true"
                >
                  /
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const delay = (i) => ({
    animationDelay: `${i * 100}ms`,
  });

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50 text-ink-950 transition-colors duration-300 dark:from-ink-950 dark:via-[#0a0f17] dark:to-ink-950 dark:text-white pt-[calc(var(--nav-h)+1.5rem)]">

      {/* Subtle Background Grid */}
      <div
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.12]"
      />

      {/* Ambient Background Lighting */}
      <div
        aria-hidden="true"
        className="hero-orb hero-orb-1 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hero-orb hero-orb-2 pointer-events-none"
      />

      {/* Main Hero Content */}
      <div className="container-page relative z-10 py-10 sm:py-14 lg:py-16 xl:py-20">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16 xl:gap-20">

          {/* LEFT: Content */}
          <div className="min-w-0 text-center md:text-left">

            {/* Label */}
            <span
              className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-gold-700 shadow-sm dark:border-gold-400/25 dark:bg-gold-400/10 dark:text-gold-300 sm:text-xs"
              style={delay(0)}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
              </span>

              Grassroots to Glory • Tamil & English Coaching
            </span>

            {/* Main Heading */}
            <h1
              className="mt-5 animate-fade-up font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-ink-950 dark:text-white sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
              style={delay(1)}
            >
              Turn Raw Passion

              <span className="text-gradient block font-black">
                Into Match Mastery
              </span>
            </h1>

            {/* Description */}
            <p
              className="text-lead mx-auto mt-5 max-w-md animate-fade-up text-sm leading-7 text-ink-600 dark:text-ink-300 sm:text-base md:mx-0 lg:max-w-lg lg:text-lg"
              style={delay(2)}
            >
              Step onto the pitch with unshakeable confidence.
              Structured weekly video drills to build flawless first
              touch, explosive dribbling, and calm match intelligence.
            </p>

            {/* CTA Buttons */}
            <div
              className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:justify-center md:justify-start"
              style={delay(3)}
            >
              <Link
                to="/courses"
                className="btn btn-xl btn-primary group relative w-full overflow-hidden shadow-glow sm:w-auto"
                data-cta="hero-primary"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />

                <span className="relative">
                  Start Week 1 Today
                </span>

                <span
                  aria-hidden="true"
                  className="relative transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>

              <a
                href={SITE.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xl w-full border border-slate-300 bg-white/80 text-ink-900 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10 sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current text-red-500"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>

                Watch Free Lesson
              </a>
            </div>

            {/* Quick Benefits */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-ink-500 dark:text-ink-400 md:justify-start sm:text-xs">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pitch-500" />
                Instant Week 1 Access
              </span>

              <span className="text-ink-300 dark:text-white/20">
                •
              </span>

              <span>From Rs {SITE.lowestPrice}</span>

              <span className="text-ink-300 dark:text-white/20">
                •
              </span>

              <span>UPI & Card Accepted</span>
            </div>

            {/* Proof Statistics */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-slate-200/80 pt-5 text-xs text-ink-600 dark:border-white/10 dark:text-ink-300 md:justify-start lg:gap-x-8">
              {PROOF_STRIP.map((p) => (
                <div
                  key={p.label}
                  className="inline-flex items-center gap-1.5"
                >
                  <span className="font-display text-sm font-extrabold text-ink-950 dark:text-white">
                    {p.value}
                  </span>

                  <span className="text-ink-500 dark:text-ink-400">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Video */}
          <div
            className="w-full min-w-0 animate-fade-up md:translate-y-0"
            style={delay(3)}
          >
            <VideoFacade />
          </div>

        </div>
      </div>

      {/* Skills Ticker */}
      <Ticker />
    </section>
  );
}
