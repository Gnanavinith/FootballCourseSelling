import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '../services/course.service.js'
import { dummyCourses } from '../data/dummyCourses.js'
import { Trophy, ArrowRight, BookOpen, Search, SearchX, Home } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useInView } from '../hooks/useInView.js'

const USE_DUMMY_DATA = false
const fakeFetch = () => new Promise((resolve) => setTimeout(() => resolve(dummyCourses), 700))

const WHATSAPP_LINK = `https://wa.me/919361405307?text=${encodeURIComponent('Hi Coach Karthik, please let me know when new masterclasses are available.')}`

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView(0.15)
  return (
    <div
      ref={ref}
      className={`${inView ? 'animate-fade-up' : 'opacity-0'} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* Shared empty-state card (gold glass look, mobile friendly) */
function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div
      role="status"
      className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-gold-500/25 bg-gradient-to-b from-gold-400/10 via-surface to-surface px-6 py-10 text-center shadow-card sm:px-10 sm:py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold-400/25 blur-3xl"
      />
      <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/30 bg-gold-400/15 text-gold-600 ring-8 ring-gold-400/5 dark:text-gold-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="relative mt-5 font-display text-lg font-black tracking-tight text-fg sm:text-xl">
        {title}
      </h2>
      <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-fg-3">{text}</p>
      {children && (
        <div className="relative mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {children}
        </div>
      )}
    </div>
  )
}

function EditorialCourseRow({ course, index }) {
  const title = course.title || course.name
  const to = `/courses/${course.slug || course._id || course.id}`
  const weeks = course.totalWeeks || course.weeks
  const hasPrice = typeof course.price === 'number'

  return (
    <Reveal delay={index * 90}>
      <article className="group relative py-8 sm:py-10 border-b border-line first:border-t transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* Thumbnail / Visual preview */}
          <div className="w-full lg:w-72 shrink-0 overflow-hidden rounded-2xl aspect-video relative bg-surface-2 border border-line">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.thumbnailAlt || title}
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-ink-900 to-ink-800 text-gold-400">
                <BookOpen className="w-10 h-10" />
              </div>
            )}
            {weeks && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                {weeks} Weeks
              </span>
            )}
          </div>

          {/* Editorial info */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {course.level && (
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  {course.level}
                </span>
              )}
              {course.level && course.language && <span className="text-fg-3">•</span>}
              {course.language && (
                <span className="text-xs font-semibold text-fg-3">
                  {course.language}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-fg tracking-tight group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
              <Link to={to} className="no-underline hover:no-underline text-fg">
                {title}
              </Link>
            </h3>

            {course.description && (
              <p className="text-xs sm:text-sm text-fg-2 max-w-2xl line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-line">
            {hasPrice && (
              <div className="text-left lg:text-right">
                {Number(course.originalPrice) > Number(course.price) && (
                  <div className="flex items-center lg:justify-end gap-1.5 mb-0.5">
                    <span className="text-xs sm:text-sm text-fg-3 line-through font-medium">
                      {inr.format(course.originalPrice)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-pitch-100 text-pitch-700 dark:bg-pitch-950 dark:text-pitch-400">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
                <span className="font-display text-2xl sm:text-3xl font-black text-fg">
                  {course.price === 0 ? 'Free' : inr.format(course.price)}
                </span>
              </div>
            )}

            <Link
              to={to}
              className="btn btn-sm btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black shadow-glow"
            >
              <span>Explore Masterclass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </article>
    </Reveal>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    document.title = 'Masterclass Catalog | Vanakkam Soccer'
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const request = USE_DUMMY_DATA ? fakeFetch() : courseService.list()
    request
      .then((data) => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : data?.data || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load courses')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) =>
      `${c.title || c.name || ''} ${c.description || ''}`.toLowerCase().includes(q)
    )
  }, [courses, query])

  const shortQuery = query.trim().length > 28 ? `${query.trim().slice(0, 28)}…` : query.trim()

  return (
    <main className="min-h-screen bg-page text-fg-body font-sans transition-colors duration-300">
      {/* Optimized Hero Section with zero gap below navbar */}
      <section className="section-dark hero-bg pt-8 pb-10 lg:pt-12 lg:pb-14">
        <div className="container-page relative z-10 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-bold tracking-widest uppercase">
            <Trophy className="w-3.5 h-3.5" />
            <span>Editorial Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Professional <span className="text-gradient">Masterclasses</span>
          </h1>
          <p className="text-ink-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Structured football training programmes designed by elite coaches for serious athletes.
          </p>

          {!error && (
            <div className="pt-2 max-w-sm mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="search"
                aria-label="Search masterclasses"
                className="input bg-surface text-fg border-line pl-10 h-11 text-xs"
                placeholder="Search masterclasses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Editorial Course Listing */}
      <section className="relative overflow-hidden py-10 sm:py-16 bg-page">
        <div className="container-page max-w-4xl mx-auto">
          {loading && (
            <div className="space-y-6" aria-busy="true" aria-label="Loading courses">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-8 border-b border-line animate-pulse flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="w-full lg:w-72 aspect-video bg-surface-2 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 bg-surface-2 rounded" />
                    <div className="h-6 w-3/4 bg-surface-2 rounded" />
                    <div className="h-4 w-full bg-surface-2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="card card-body p-8 mx-auto max-w-md text-center shadow-card" role="alert">
              <p className="font-display text-sm font-bold text-fg mb-1">Could not load masterclasses</p>
              <p className="text-xs text-danger-600 mb-4">{error}</p>
              <button type="button" className="btn btn-sm btn-primary mx-auto" onClick={() => setAttempt((n) => n + 1)}>
                Try Again
              </button>
            </div>
          )}

          {/* Empty state 1: the academy has no courses yet */}
          {!loading && !error && courses.length === 0 && (
            <EmptyState
              icon={Trophy}
              title="New Masterclasses Are on the Way"
              text="Our coaches are preparing fresh training programmes. Message us and we will let you know as soon as they launch."
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="btn btn-md btn-primary inline-flex items-center justify-center gap-2 font-extrabold shadow-glow"
              >
                <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                Notify Me on WhatsApp
              </a>
              <Link to="/" className="btn btn-md btn-outline inline-flex items-center justify-center gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                Back to Home
              </Link>
            </EmptyState>
          )}

          {/* Empty state 2: courses exist, but the search matched nothing */}
          {!loading && !error && courses.length > 0 && filtered.length === 0 && (
            <EmptyState
              icon={SearchX}
              title={shortQuery ? `No results for "${shortQuery}"` : 'No matching masterclasses'}
              text="Check the spelling or try a shorter keyword. You can also clear the search to see every masterclass."
            >
              <button
                type="button"
                className="btn btn-md btn-primary inline-flex items-center justify-center font-extrabold shadow-glow"
                onClick={() => setQuery('')}
              >
                Clear Search
              </button>
            </EmptyState>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-fg-3 mb-2 px-1" aria-live="polite">
                Showing {filtered.length} {filtered.length === 1 ? 'masterclass' : 'masterclasses'}
              </p>
              <div>
                {filtered.map((c, i) => (
                  <EditorialCourseRow key={c._id || c.slug || c.id} course={c} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}