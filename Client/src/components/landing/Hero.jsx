import { useState } from "react";
import { Link } from "react-router-dom";
import { SITE, PROOF_STRIP } from "../../config/site.js";

const VIDEO_ID = "cZleqHf7v8Y";

const SKILLS = [
  "Ball control",
  "Match awareness",
  "First touch",
  "1v1 dribbling",
  "Passing weight",
  "Discipline and grit",
  "Tamil and English drills",
  "Train on any ground",
];

/* ------------------------------------------------------------------ */
/* Video: only loads YouTube after the visitor clicks play             */
/* ------------------------------------------------------------------ */

function VideoPlayer() {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(
    `https://i.ytimg.com/vi_webp/${VIDEO_ID}/maxresdefault.webp`
  );

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink-950 shadow-sm">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`}
          title="Vanakkam Soccer intro lesson"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play intro lesson"
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <img
            src={thumb}
            onError={() =>
              setThumb(`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`)
            }
            alt="Coach demonstrating a ball control drill"
            width="1280"
            height="720"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500 text-ink-950 shadow-md transition-transform duration-200 group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  return (
    <section className="bg-page pt-[calc(var(--nav-h)+1.5rem)]">
      <div className="container-page py-10 sm:py-14 lg:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div className="min-w-0">
            <h1 className="max-w-[16ch] text-fg">
              <span className="text-gold-600 dark:text-gold-400">Turn raw passion</span>{" "}
              into match mastery
            </h1>

            <p className="text-lead mt-5 max-w-[34rem]">
              Weekly video drills in Tamil and English that build your first
              touch, your dribbling and your decision-making, so you play with
              confidence on match day.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses" className="btn btn-lg btn-primary w-full sm:w-auto">
                Start Week 1 today
              </Link>
              <a
                href={SITE.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg btn-outline w-full sm:w-auto"
              >
                Watch a free lesson
              </a>
            </div>

            <p className="mt-4 text-sm text-fg-3">
              Week 1 unlocks instantly. Courses from Rs {SITE.lowestPrice}. Pay
              by UPI or card.
            </p>

            {PROOF_STRIP?.length > 0 && (
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6">
                {PROOF_STRIP.map((p) => (
                  <div key={p.label}>
                    <dt className="text-sm text-fg-3">{p.label}</dt>
                    <dd className="font-display text-lg font-bold text-fg">
                      {p.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Video */}
          <div className="min-w-0">
            <VideoPlayer />
          </div>
        </div>
      </div>

      {/* What you'll train: scrolling strip (transform-only animation) */}
      <div
        className="relative overflow-hidden border-y border-line bg-surface py-4 motion-reduce:overflow-x-auto"
        aria-label="What you will train"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface to-transparent motion-reduce:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface to-transparent motion-reduce:hidden"
        />

        <div className="flex w-max animate-marquee will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {SKILLS.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2.5 whitespace-nowrap pl-8 text-sm font-semibold text-fg-body sm:pl-12"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}