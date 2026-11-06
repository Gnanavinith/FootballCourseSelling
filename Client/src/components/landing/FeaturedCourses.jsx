import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp, FaFutbol, FaBolt, FaBullseye, FaBrain } from 'react-icons/fa'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { courseService } from '../../services/course.service.js'

const WHATSAPP_NUMBER = '919361405307'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Coach Prasanth, I want early access to the new Vanakkam Soccer academy training modules.')}`

const UPCOMING_MODULES = [
  {
    icon: <FaFutbol className="h-5 w-5 text-gold-500" />,
    badge: "Module 01 • Ball Mastery",
    title: "1v1 Dribbling & Sole Control",
    desc: "Fast footwork, change of direction, and body feints to beat aggressive defenders 1-on-1 with complete composure.",
    level: "All Levels",
  },
  {
    icon: <FaBrain className="h-5 w-5 text-pitch-500" />,
    badge: "Module 02 • Field Vision",
    title: "Tactical IQ & Spatial Scanning",
    desc: "Pre-orientation habits, creating passing lanes, and reading the game 2 steps ahead before the ball arrives.",
    level: "Intermediate",
  },
  {
    icon: <FaBolt className="h-5 w-5 text-amber-500" />,
    badge: "Module 03 • Athletic Edge",
    title: "Match Speed & Explosive Agility",
    desc: "Sprint mechanics, rapid deceleration, core stability, and pitch conditioning tailored for 90-minute intensity.",
    level: "Pro Conditioning",
  },
  {
    icon: <FaBullseye className="h-5 w-5 text-red-500" />,
    badge: "Module 04 • The Finisher",
    title: "Striking Precision & Finishing",
    desc: "Driven low strikes, curling near/far post, weak foot confidence, and composure inside the 18-yard penalty box.",
    level: "Attacking",
  },
]

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

function UpcomingCurriculumShowcase() {
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50 dark:from-[#0c121d] dark:via-[#090e17] dark:to-[#05080e] p-6 sm:p-10 lg:p-12 shadow-xl dark:shadow-card relative">
      {/* Stadium ambient light glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-pitch-500/15 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-400/15 blur-[90px]"
      />

      {/* Top Banner Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pitch-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pitch-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-pitch-700 dark:text-pitch-400">
            On-Pitch Filming &amp; Curriculum Curation
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 px-3 py-1 text-[11px] font-bold text-gold-700 dark:text-gold-300">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" />
          <span>Priority VIP Early Access</span>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="relative z-10 mt-6 max-w-3xl">
        <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-ink-950 dark:text-white">
          New Training Modules Are Being Finalized on the Pitch
        </h3>
        <p className="mt-3 text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed">
          Coach Prasanth and our coaching staff are filming elite ball-control routines, solo matchday conditioning, and game-IQ breakdowns in Tamil &amp; English. Check back shortly or message us on WhatsApp for early access, previews, and priority batch entry.
        </p>
      </div>

      {/* Grid of 4 Upcoming Module Teasers */}
      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {UPCOMING_MODULES.map((m, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:border-gold-500/40 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-glow/10"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
                  {m.icon}
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-ink-600 dark:text-ink-300 uppercase tracking-wider">
                  {m.level}
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block mb-1">
                {m.badge}
              </span>
              <h4 className="font-display text-base font-bold text-ink-950 dark:text-white tracking-tight">
                {m.title}
              </h4>
              <p className="mt-2 text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                {m.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-pitch-600 dark:text-pitch-400">
              <span>Weekly Progressive Drills</span>
              <span>Tamil &amp; Eng</span>
            </div>
          </div>
        ))}
      </div>

      {/* High-Converting CTA Box */}
      <div className="relative z-10 mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-ink-950 dark:text-white flex items-center gap-2">
            <span>Want early access before public release?</span>
            <span className="badge badge-gold text-[10px]">VIP Cohort</span>
          </h4>
          <p className="mt-1 text-xs sm:text-sm text-ink-600 dark:text-ink-300">
            Check back shortly or message Coach Prasanth directly on WhatsApp to claim your priority early-bird slot.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-ink-600 dark:text-ink-300">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-pitch-500" /> Direct Coach Reply</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-pitch-500" /> First 50 Batch Discount</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-pitch-500" /> Grassroots Friendly</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="btn btn-lg btn-primary inline-flex items-center justify-center gap-2.5 font-black shadow-glow"
          >
            <FaWhatsapp className="h-5 w-5" />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href="#book"
            className="btn btn-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-ink-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 inline-flex items-center justify-center gap-2 font-bold"
          >
            <span>Book 1-on-1 Call</span>
            <ArrowRight className="h-4 w-4" />
          </a>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-pulse" />
              Academy Modules
            </div>
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

        {/* Empty state / Early Access Showcase */}
        {!loading && courses.length === 0 && <UpcomingCurriculumShowcase />}

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
