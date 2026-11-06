import { useState } from 'react'
import { Link } from 'react-router-dom'

const clips = [
  { id: 'zcDcHRUClX4', title: 'Ball Control Masterclass', tag: 'Close Touch', subtitle: '5 min • First-touch composure under defender press' },
  { id: 'm83l8PICmyc', title: 'Advanced Dribbling', tag: '1v1 Combat', subtitle: '8 min • Feints and explosive changes of pace' },
  { id: 'aPQlhbCOYEU', title: 'Precision Passing', tag: 'Game Vision', subtitle: '6 min • Ground weight and defense-splitting vision' },
  { id: 'RRhfevqDGAA', title: 'Match-Pace Drills', tag: 'Agility & Grit', subtitle: '7 min • High-intensity footwork for 90-minute stamina' },
]

export default function TrainingClips() {
  const [active, setActive] = useState(null)

  return (
    <section className="relative overflow-hidden bg-surface text-fg py-14 sm:py-20 border-b border-line">
      {/* Subtle pitch lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-pitch-500/10 blur-[120px]"
      />

      <div className="container-page">
        {/* Heading + Value Proposition */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="badge badge-gold mb-3 inline-flex">
              Field Instincts
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl lg:text-5xl">
              Master The Ball.{" "}
              <span className="text-gold-600 dark:text-gold-400 block sm:inline">
                Command The Pitch.
              </span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm leading-relaxed text-fg-2 sm:text-base">
              Raw talent gets noticed, but relentless technique wins matches. Watch these focused drills to build the confidence that scouts and coaches look for every weekend.
            </p>

            <Link
              to="/courses"
              className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
            >
              <span>Explore full syllabus and weekly roadmap</span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl border border-line bg-ink-950 shadow-sm transition-all duration-300 hover:border-gold-500/50 hover:-translate-y-1 hover:shadow-md"
            >
              {active === clip.id ? (
                <div className="absolute inset-0 z-20 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${clip.id}?autoplay=1&rel=0`}
                    title={clip.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />

                  <button
                    onClick={() => setActive(null)}
                    className="absolute right-2 top-2 sm:right-3 sm:top-3 z-30 rounded-full bg-black/80 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md transition hover:bg-gold-400 hover:text-ink-950"
                  >
                    Close ✕
                  </button>
                </div>
              ) : (
                <>
                  {/* Thumbnail Image */}
                  <img
                    src={`https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg`}
                    alt={clip.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Shadow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />

                  {/* Top Tag */}
                  <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 z-10">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-md border border-white/10">
                      {clip.tag}
                    </span>
                  </div>

                  {/* Play Button */}
                  <button
                    type="button"
                    onClick={() => setActive(clip.id)}
                    aria-label={`Play ${clip.title}`}
                    className="absolute inset-0 z-[1] flex items-center justify-center cursor-pointer"
                  >
                    <span className="relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-glow transition-all duration-300 group-hover:scale-110">
                      <span className="absolute inset-0 rounded-full bg-gold-400/40 animate-ping opacity-0 group-hover:opacity-75 transition-opacity" />
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-0.5 sm:ml-1 h-5 w-5 sm:h-6 sm:w-6 relative z-10"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                      </svg>
                    </span>
                  </button>

                  {/* Video Meta Info */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] p-2.5 sm:p-4">
                    <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1 sm:line-clamp-none">
                      {clip.title}
                    </h3>
                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-ink-300 line-clamp-1 sm:line-clamp-2">
                      {clip.subtitle}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Call to Action */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/courses"
            className="btn btn-lg btn-primary w-full justify-center"
          >
            Explore All Video Drills →
          </Link>
        </div>
      </div>
    </section>
  )
}
