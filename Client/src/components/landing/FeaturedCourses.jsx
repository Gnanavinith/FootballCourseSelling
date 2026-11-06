import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '../../services/course.service.js'

const getMeta = (c) => ({
  id: c._id || c.id,
  title: c.title || c.name,
  weeks: c.totalWeeks || c.weeks,
  price: c.price,
  originalPrice: c.originalPrice,
  to: `/courses/${c.slug || c._id || c.id}`,
})

function Thumb({ c, title, className = '' }) {
  return c.thumbnail ? (
    <img
      src={c.thumbnail}
      alt={title}
      loading="lazy"
      width="640"
      height="400"
      className={`w-full object-cover transition duration-500 group-hover:scale-105 ${className}`}
    />
  ) : (
    <div className={`w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-ink-900 dark:to-ink-850 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 24 24" className="h-14 w-14 text-gold-500/50 dark:text-gold-400/40 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12,7.4 16.4,10.6 14.7,15.8 9.3,15.8 7.6,10.6" fill="currentColor" />
      </svg>
    </div>
  )
}

function Badges({ c, weeks }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {c.level && (
        <span className="rounded-full bg-pitch-500/15 px-3 py-1 text-[11px] font-bold text-pitch-700 dark:text-pitch-400 border border-pitch-500/30">
          {c.level}
        </span>
      )}
      <span className="rounded-full bg-slate-100 text-ink-700 border border-slate-200 dark:bg-white/10 dark:text-ink-300 dark:border-white/10 px-3 py-1 text-[11px] font-semibold">
        Tamil & English
      </span>
      {weeks && (
        <span className="rounded-full bg-gold-500/10 text-gold-700 border border-gold-500/20 dark:bg-gold-400/15 dark:text-gold-300 dark:border-gold-400/30 px-3 py-1 text-[11px] font-bold">
          {weeks} Weeks Mastery
        </span>
      )}
    </div>
  )
}

/* Single spotlight course card */
function SpotlightCard({ c }) {
  const { title, weeks, price, originalPrice, to } = getMeta(c)
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:shadow-card backdrop-blur-md transition-all duration-300 hover:border-gold-400/50 hover:shadow-xl dark:hover:border-gold-400/40 dark:hover:shadow-pop group">
      <div className="grid lg:grid-cols-12 items-stretch">
        <div className="relative overflow-hidden lg:col-span-6 aspect-[16/10] lg:aspect-auto min-h-[300px]">
          <Thumb c={c} title={title} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
          <div className="absolute top-4 left-4">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-400 backdrop-blur-md border border-white/15">
              ★ Flagship Program
            </span>
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-10 lg:col-span-6 justify-between">
          <div>
            <Badges c={c} weeks={weeks} />

            <h3 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-ink-950 group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300 transition-colors">
              {title}
            </h3>

            <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 leading-relaxed sm:text-base line-clamp-3">
              {c.description || "Comprehensive grassroots training curriculum to develop razor-sharp ball control, fast footwork, and pitch composure."}
            </p>

            <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-ink-700 dark:text-ink-200">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pitch-500/20 text-pitch-600 dark:text-pitch-400 font-bold">✓</span>
                <span>Week 1 drills unlock immediately on checkout</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pitch-500/20 text-pitch-600 dark:text-pitch-400 font-bold">✓</span>
                <span>High-definition angle breakdowns in Tamil and English</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pitch-500/20 text-pitch-600 dark:text-pitch-400 font-bold">✓</span>
                <span>Solo drills you can practice on any open pitch or ground</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {typeof price === 'number' && (
              <div>
                <span className="text-xs text-ink-500 dark:text-ink-400 block uppercase font-bold tracking-wider">One-Time Enrolment</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-ink-950 dark:text-white">₹{price}</span>
                  {Number(originalPrice) > Number(price) && (
                    <>
                      <span className="text-sm font-semibold text-ink-400 line-through">₹{originalPrice}</span>
                      <span className="text-xs font-bold text-pitch-600 dark:text-pitch-400">
                        {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs font-semibold text-pitch-600 dark:text-pitch-400">No recurring fees</span>
              </div>
            )}
            <Link
              to={to}
              className="btn btn-xl btn-primary group/btn justify-center shadow-glow w-full sm:w-auto"
            >
              <span>Enrol &amp; Start Week 1</span>
              <span aria-hidden="true" className="transition-transform group-hover/btn:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Multi-course cards */
function CourseCard({ c }) {
  const { title, weeks, price, originalPrice, to } = getMeta(c)
  return (
    <div className="snap-start shrink-0 basis-[85%] sm:basis-auto group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-md dark:shadow-card transition-all duration-300 hover:border-gold-400/50 hover:-translate-y-1 hover:shadow-xl dark:hover:border-gold-400/40 dark:hover:shadow-pop">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Thumb c={c} title={title} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6 justify-between">
        <div>
          <Badges c={c} weeks={weeks} />
          <h3 className="mt-3 font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-ink-950 group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-ink-600 dark:text-ink-300 line-clamp-2">
            {c.description}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            {typeof price === 'number' ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-extrabold text-ink-950 dark:text-white">₹{price}</span>
                {Number(originalPrice) > Number(price) && (
                  <span className="text-xs text-ink-400 line-through">₹{originalPrice}</span>
                )}
              </div>
            ) : <span />}
            {Number(originalPrice) > Number(price) ? (
              <span className="text-xs font-bold text-pitch-600 dark:text-pitch-400">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
              </span>
            ) : (
              <span className="text-xs text-pitch-600 dark:text-pitch-400 font-semibold">Weekly Unlock</span>
            )}
          </div>
          <Link to={to} className="btn btn-lg btn-primary w-full justify-center group-hover:shadow-glow">
            Start Week 1
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    courseService.list()
      .then((data) => {
        if (cancelled) return
        setCourses(Array.isArray(data) ? data : data?.courses || data?.data || [])
      })
      .catch(() => { if (!cancelled) setCourses([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const isSingle = courses.length === 1
  const isMulti = courses.length > 1

  return (
    <section className="relative overflow-hidden bg-white text-ink-950 py-16 sm:py-24 border-t border-slate-200 transition-colors duration-300 dark:bg-[#080d14] dark:border-white/5 dark:text-white" id="courses">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="badge badge-gold mb-3 inline-flex">
              Academy Modules
            </span>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink-950 dark:text-white sm:text-4xl lg:text-5xl">
              Choose Your Pathway
              <span className="text-gradient block font-black">
                To The Starting XI
              </span>
            </h2>
            <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 sm:text-base max-w-xl">
              Whether you are touching the ball for the first time or fighting for district selection, find the structured training program that takes you there.
            </p>
          </div>
          {isMulti && (
            <Link
              to="/courses"
              className="btn btn-lg border border-slate-300 bg-white text-ink-800 shadow-sm hover:bg-slate-100 dark:btn-outline-light shrink-0 hidden sm:inline-flex"
              data-cta="featured-see-all-top"
            >
              See All Programs →
            </Link>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-8 grid lg:grid-cols-12 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 animate-pulse gap-6 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="lg:col-span-6 h-64 rounded-2xl bg-slate-200 dark:bg-white/5" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-8 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-12 w-48 rounded bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        )}

        {/* Single course spotlight */}
        {!loading && isSingle && <SpotlightCard c={courses[0]} />}

        {/* Multiple courses grid */}
        {!loading && isMulti && (
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
            {courses.map((c) => <CourseCard key={c._id || c.id} c={c} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && courses.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-12 text-center">
            <p className="text-base text-ink-600 dark:text-ink-300">New training modules are being finalized on the pitch.</p>
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Check back shortly or message us on WhatsApp for early access.</p>
          </div>
        )}

        {/* Mobile View All */}
        {!loading && isMulti && (
          <div className="mt-6 sm:hidden text-center">
            <Link to="/courses" className="btn btn-lg btn-primary w-full justify-center">
              Explore All Courses →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
