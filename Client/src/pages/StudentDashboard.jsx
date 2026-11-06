import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { api } from '../lib/api.js'
import { ThemeToggle } from '../components/layout/Navbar.jsx'
import SyllabusModal from '../components/course/SyllabusModal.jsx'
import {
  BookOpen, CreditCard, User, ArrowRight, Play, CheckCircle2, FileText, Download,
  Layers, ExternalLink, Trophy, Lock, ChevronDown, Search, CalendarDays, Languages,
  BarChart3, Clock, RotateCcw, Hourglass, ChevronsUpDown,
} from 'lucide-react'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/* ───────────────────────── helpers ───────────────────────── */

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

const greetingFor = (date = new Date()) => {
  const h = date.getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const fmtDate = (ms) =>
  new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const fmtDuration = (sec = 0) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const fmtTotal = (sec = 0) => {
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function getProgress(enrollment, now) {
  let start = new Date(enrollment.startsAt).getTime()
  if (Number.isNaN(start)) start = now
  const total = Math.max(1, Number(enrollment.course.totalWeeks || enrollment.course.weeks) || 1)
  const week = Math.max(1, Math.floor((now - start) / WEEK_MS) + 1)
  const finished = week > total
  const current = Math.min(week, total)
  const isLastWeek = !finished && current === total
  const completedWeeks = finished ? total : current - 1
  return {
    start,
    end: start + total * WEEK_MS,
    total,
    current,
    finished,
    isLastWeek,
    completedWeeks,
    eventAt: finished ? null : start + current * WEEK_MS,
    eventLabel: isLastWeek ? 'Final module ends in' : 'Next module unlocks in',
    lessonTitle: enrollment.weekTitles?.[current - 1] || null,
    percent: finished ? 100 : Math.round((completedWeeks / total) * 100),
  }
}

function countdownParts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

const QUICK = [
  { to: '/my-courses', title: 'Training library', text: 'All enrolled masterclasses', Icon: BookOpen },
  { to: '/payments', title: 'Billing & receipts', text: 'Invoices and payment history', Icon: CreditCard },
  { to: '/profile', title: 'Profile', text: 'Account and preferences', Icon: User },
]

/* ───────────────────────── small components ───────────────────────── */

const card = 'bg-surface border border-line rounded-2xl shadow-sm'

function Ring({ percent, size = 76, stroke = 7 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${percent}% complete`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-line" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100}
          className="stroke-gold-500 dark:stroke-gold-400 transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-black text-fg">
        {percent}%
      </span>
    </div>
  )
}

function WeekBars({ total, current, finished }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const isNow = !finished && n === current
        const past = finished || n < current
        return (
          <span
            key={n}
            title={`Module ${n}`}
            className={`h-1.5 flex-1 rounded-full ${
              isNow ? 'bg-gold-500 dark:bg-gold-400' : past ? 'bg-emerald-500' : 'bg-line'
            }`}
          />
        )
      })}
    </div>
  )
}

function Countdown({ ms }) {
  const p = countdownParts(ms)
  const cells = p.d > 0
    ? [['d', p.d], ['h', p.h], ['m', p.m]]
    : [['h', p.h], ['m', p.m], ['s', p.s]]
  return (
    <div className="flex items-center gap-2 tabular-nums" role="timer">
      {cells.map(([label, v]) => (
        <div key={label} className="min-w-[3.25rem] rounded-xl border border-line bg-surface-2/80 px-2.5 py-1.5 text-center">
          <span className="block font-display text-lg font-black leading-none text-fg">
            {String(v).padStart(2, '0')}
          </span>
          <span className="mt-1 block text-[10px] font-medium text-fg-3">{label}</span>
        </div>
      ))}
    </div>
  )
}

function Badge({ tone = 'neutral', children, icon }) {
  const tones = {
    neutral: 'bg-surface-2 text-fg-2 border-line',
    green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    gold: 'bg-gold-400 text-black border-gold-400 font-bold',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {icon}{children}
    </span>
  )
}

function Stat({ label, value, tone = '' }) {
  return (
    <div className="px-4 first:pl-0 last:pr-0 [&:not(:first-child)]:border-l border-line">
      <p className="text-[11px] font-medium text-fg-3">{label}</p>
      <p className={`font-display text-2xl font-black tabular-nums ${tone || 'text-fg'}`}>{value}</p>
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-surface-2 ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your academy">
      <Skeleton className="h-56" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

/* ───────────────────────── page ───────────────────────── */

export default function Dashboard() {
  usePageMeta({ title: 'Masterclass Academy | Vanakkam Soccer', noindex: true })

  const [user] = useState(readUser)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [courseWeeks, setCourseWeeks] = useState([])
  const [loadingWeeks, setLoadingWeeks] = useState(false)

  const [tab, setTab] = useState('curriculum')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState({})
  const [syllabusOpen, setSyllabusOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api('/me/courses')
      .then((r) => {
        const data = (r.data || [])
          .filter((x) => x.course)
          .map((x) => ({
            _id: x.course._id,
            startsAt: x.startsAt,
            course: x.course,
            source: x.source || 'Paid',
            status: x.status || 'Active',
            weekTitles: x.weekTitles || x.course.weekTitles || [],
          }))
        if (cancelled) return
        setEnrollments(data)
        setSelectedCourseId((id) => id || data[0]?.course._id || null)
      })
      .catch((e) => !cancelled && setError(e.message || 'Could not load your masterclasses'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [attempt])

  useEffect(() => {
    if (!selectedCourseId) return
    let cancelled = false
    setLoadingWeeks(true)
    setQuery('')
    setFilter('all')
    setOpen({})
    api(`/me/courses/${selectedCourseId}/weeks`)
      .then((r) => !cancelled && setCourseWeeks(r.data?.weeks || []))
      .catch(() => !cancelled && setCourseWeeks([]))
      .finally(() => !cancelled && setLoadingWeeks(false))
    return () => { cancelled = true }
  }, [selectedCourseId])

  const progressList = useMemo(
    () => enrollments.map((e) => ({ e, p: getProgress(e, now) })),
    [enrollments, now]
  )
  const active = progressList.filter((x) => !x.p.finished).sort((a, b) => a.p.eventAt - b.p.eventAt)
  const completedCount = progressList.length - active.length
  const upNext = active[0] || null

  const currentEnrollment = enrollments.find((e) => e.course._id === selectedCourseId) || enrollments[0]
  const currentProgress = currentEnrollment ? getProgress(currentEnrollment, now) : null
  const course = currentEnrollment?.course
  const hasSyllabus = Boolean(course?.syllabus || course?.syllabusUrl)

  const rawName = (user?.name || 'Athlete').trim().split(/\s+/)[0]
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
  const isPaid = currentEnrollment && String(currentEnrollment.source).toLowerCase() === 'paid'

  const totals = useMemo(() => {
    const videos = courseWeeks.reduce((n, w) => n + (w.videos || []).length, 0)
    const seconds = courseWeeks.reduce(
      (n, w) => n + (w.videos || []).reduce((a, v) => a + (v.durationSeconds || 0), 0), 0)
    return { videos, seconds }
  }, [courseWeeks])

  const visibleWeeks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courseWeeks.filter((w) => {
      const unlocked = w.status !== 'Locked'
      if (filter === 'unlocked' && !unlocked) return false
      if (filter === 'locked' && unlocked) return false
      if (!q) return true
      return (
        (w.title || '').toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.videos || []).some((v) => (v.title || '').toLowerCase().includes(q))
      )
    })
  }, [courseWeeks, query, filter])

  const allOpen = visibleWeeks.length > 0 && visibleWeeks.every((w) => open[w.weekNumber])
  const toggleAll = () =>
    setOpen(allOpen ? {} : Object.fromEntries(visibleWeeks.map((w) => [w.weekNumber, true])))

  const tabs = [
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'resources', label: 'Resources' },
    { id: 'details', label: 'Course details' },
  ]

  return (
    <div className="min-h-screen bg-page text-fg font-sans flex flex-col selection:bg-gold-400 selection:text-black">
      {/* ───────── Header ───────── */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:py-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5" />
              <span>Masterclass Academy</span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-fg lg:text-4xl">
              {greetingFor()}, <span className="text-gold-600 dark:text-gold-400">{firstName}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-fg-3 leading-relaxed">
              {loading
                ? 'Loading your training…'
                : active.length > 0
                ? `You have ${active.length} active ${active.length === 1 ? 'masterclass' : 'masterclasses'}. Pick up where you left off.`
                : 'Your training dashboard. Browse masterclasses to start your next track.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-2xl border border-line bg-surface-2/60 px-5 py-3">
              <Stat label="Enrolled" value={loading ? '–' : enrollments.length} />
              <Stat label="Active" value={loading ? '–' : active.length} tone="text-gold-600 dark:text-gold-400" />
              <Stat label="Completed" value={loading ? '–' : completedCount} tone="text-emerald-600 dark:text-emerald-400" />
            </div>
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8">
        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <div className={`${card} mx-auto max-w-lg p-10 text-center`} role="alert">
            <h2 className="mb-2 font-display text-lg font-bold text-fg">We couldn’t load your academy</h2>
            <p className="mb-6 text-sm text-danger-500">{error}</p>
            <button type="button" className="btn btn-md btn-primary mx-auto" onClick={() => setAttempt((n) => n + 1)}>
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </div>
        )}

        {!loading && !error && enrollments.length === 0 && (
          <div className={`${card} mx-auto max-w-xl p-14 text-center`}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-500 dark:text-gold-400">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold text-fg">No masterclasses yet</h2>
            <p className="mb-8 text-sm text-fg-3">
              Choose a professional training track and your modules will appear here.
            </p>
            <Link to="/courses" className="btn btn-lg btn-primary mx-auto">Explore masterclasses</Link>
          </div>
        )}

        {!loading && !error && enrollments.length > 0 && currentEnrollment && currentProgress && (
          <>
            {/* Course switcher */}
            {enrollments.length > 1 && (
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Your masterclasses">
                {progressList.map(({ e, p }) => {
                  const sel = e.course._id === selectedCourseId
                  return (
                    <button
                      key={e.course._id}
                      role="tab"
                      aria-selected={sel}
                      onClick={() => setSelectedCourseId(e.course._id)}
                      className={`flex min-w-[13rem] cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                        sel
                          ? 'border-gold-400 bg-gold-400/10'
                          : 'border-line bg-surface hover:border-line-strong'
                      }`}
                    >
                      <span className="truncate text-xs font-bold text-fg">{e.course.title}</span>
                      <span className="flex items-center gap-2">
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                          <span className="block h-full rounded-full bg-gold-400" style={{ width: `${p.percent}%` }} />
                        </span>
                        <span className="text-[11px] font-semibold tabular-nums text-fg-3">{p.percent}%</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ───────── Featured course ───────── */}
            <section className={`${card} grid overflow-hidden lg:grid-cols-[22rem_1fr]`}>
              <div className="relative flex h-56 items-center justify-center overflow-hidden bg-surface-2 lg:h-auto">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-14 w-14 text-gold-400" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <Link
                  to={`/watch/${course._id}`}
                  aria-label={`Play ${course.title}`}
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-400 text-black shadow-glow transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Play className="h-5 w-5 fill-current" />
                </Link>
              </div>

              <div className="flex flex-col gap-6 p-6 lg:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {!currentProgress.finished && <Badge tone="green">Module {currentProgress.current} active</Badge>}
                      {currentProgress.finished && <Badge tone="green" icon={<CheckCircle2 className="h-3 w-3" />}>Completed</Badge>}
                      {course.level && <Badge>{course.level}</Badge>}
                      <Badge
                        tone={isPaid ? 'green' : 'amber'}
                        icon={isPaid ? <CheckCircle2 className="h-3 w-3" /> : null}
                      >
                        {isPaid ? 'Enrolled & paid' : 'Payment pending'}
                      </Badge>
                    </div>
                    <h2
                      className="font-display text-2xl font-black tracking-tight text-fg lg:text-3xl"
                      lang={course.language === 'Tamil' ? 'ta' : undefined}
                    >
                      {course.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-3">
                      {course.subtitle || course.description || 'Professional soccer masterclass taught by top coaches.'}
                    </p>
                  </div>
                  <Ring percent={currentProgress.percent} />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-fg-2">
                    <span>
                      {currentProgress.finished
                        ? `All ${currentProgress.total} modules complete`
                        : `Module ${currentProgress.current} of ${currentProgress.total}${currentProgress.lessonTitle ? ` · ${currentProgress.lessonTitle}` : ''}`}
                    </span>
                    <span className="text-fg-3">
                      {currentProgress.completedWeeks}/{currentProgress.total} done
                    </span>
                  </div>
                  <WeekBars total={currentProgress.total} current={currentProgress.current} finished={currentProgress.finished} />
                </div>

                <div className="mt-auto flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  {currentProgress.finished ? (
                    <p className="text-sm text-fg-3">
                      Finished on {fmtDate(currentProgress.end)}. Your access stays open for review.
                    </p>
                  ) : (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-fg-3">{currentProgress.eventLabel}</p>
                      <Countdown ms={currentProgress.eventAt - now} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {hasSyllabus && (
                      <button
                        type="button"
                        onClick={() => setSyllabusOpen(true)}
                        className="btn btn-lg inline-flex items-center gap-2 border border-line text-sm font-semibold hover:bg-surface-2 transition cursor-pointer text-fg"
                      >
                        <FileText className="h-4 w-4 text-gold-500" /> Syllabus
                      </button>
                    )}
                    <Link to={`/watch/${course._id}`} className="btn btn-lg btn-primary inline-flex items-center gap-2 text-sm font-bold">
                      <Play className="h-4 w-4 fill-current" />
                      {currentProgress.finished ? 'Rewatch masterclass' : `Continue module ${currentProgress.current}`}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ───────── Workspace ───────── */}
            <div className="grid gap-6 lg:grid-cols-3">
              <section className={`${card} lg:col-span-2`}>
                {/* Tabs */}
                <div className="flex items-center justify-between gap-4 border-b border-line px-6">
                  <div className="flex gap-6" role="tablist">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => setTab(t.id)}
                        className={`-mb-px cursor-pointer border-b-2 py-4 text-sm font-semibold transition focus:outline-none focus-visible:text-gold-500 ${
                          tab === t.id
                            ? 'border-gold-500 text-fg'
                            : 'border-transparent text-fg-3 hover:text-fg'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {tab === 'curriculum' && (
                    <span className="hidden text-xs text-fg-3 sm:block">
                      {courseWeeks.length} modules · {totals.videos} videos · {fmtTotal(totals.seconds)}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {/* Curriculum */}
                  {tab === 'curriculum' && (
                    <div className="space-y-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="relative flex-1">
                          <span className="sr-only">Search modules and videos</span>
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
                          <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search modules or videos"
                            className="w-full rounded-xl border border-line bg-surface-2/60 py-2.5 pl-9 pr-3 text-sm text-fg placeholder:text-fg-3 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex rounded-xl border border-line p-0.5 bg-surface-2/40" role="group" aria-label="Filter modules">
                            {[['all', 'All'], ['unlocked', 'Unlocked'], ['locked', 'Locked']].map(([id, label]) => (
                              <button
                                key={id}
                                onClick={() => setFilter(id)}
                                aria-pressed={filter === id}
                                className={`cursor-pointer rounded-[10px] px-3 py-1.5 text-xs font-semibold transition ${
                                  filter === id
                                    ? 'bg-gold-400 text-black font-bold'
                                    : 'text-fg-3 hover:text-fg'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={toggleAll}
                            title={allOpen ? 'Collapse all' : 'Expand all'}
                            aria-label={allOpen ? 'Collapse all modules' : 'Expand all modules'}
                            className="cursor-pointer rounded-xl border border-line p-2.5 text-fg-3 transition hover:text-fg hover:bg-surface-2"
                          >
                            <ChevronsUpDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {loadingWeeks ? (
                        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
                      ) : courseWeeks.length === 0 ? (
                        <p className="py-12 text-center text-sm text-fg-3">
                          Modules for this masterclass haven’t been published yet.
                        </p>
                      ) : visibleWeeks.length === 0 ? (
                        <p className="py-12 text-center text-sm text-fg-3">
                          No modules match your search.{' '}
                          <button className="font-semibold text-gold-600 underline dark:text-gold-400" onClick={() => { setQuery(''); setFilter('all') }}>
                            Clear filters
                          </button>
                        </p>
                      ) : (
                        <ol className="space-y-3">
                          {visibleWeeks.map((week) => {
                            const unlocked = week.status !== 'Locked'
                            const isCurrent = week.weekNumber === currentProgress.current && !currentProgress.finished
                            const isDone = unlocked && (currentProgress.finished || week.weekNumber < currentProgress.current)
                            const videos = week.videos || []
                            const secs = videos.reduce((n, v) => n + (v.durationSeconds || 0), 0)
                            const isOpen = !!open[week.weekNumber] || (query && videos.some((v) => (v.title || '').toLowerCase().includes(query.toLowerCase())))
                            const unlockAt = currentProgress.start + (week.weekNumber - 1) * WEEK_MS
                            return (
                              <li
                                key={week.weekNumber}
                                className={`overflow-hidden rounded-xl border transition ${
                                  isCurrent
                                    ? 'border-gold-400/60 bg-gold-400/5'
                                    : unlocked
                                    ? 'border-line bg-surface'
                                    : 'border-line/70 bg-surface-2/40'
                                }`}
                              >
                                <button
                                  onClick={() => unlocked && setOpen((o) => ({ ...o, [week.weekNumber]: !o[week.weekNumber] }))}
                                  disabled={!unlocked}
                                  aria-expanded={!!isOpen}
                                  className={`flex w-full items-center gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                >
                                  <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                                      isCurrent
                                        ? 'bg-gold-400 text-black'
                                        : isDone
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : unlocked
                                        ? 'bg-surface-2 text-fg'
                                        : 'bg-surface-2/60 text-fg-3'
                                    }`}
                                  >
                                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : !unlocked ? <Lock className="h-4 w-4" /> : `W${week.weekNumber}`}
                                  </span>

                                  <span className="min-w-0 flex-1">
                                    <span className={`block truncate text-sm font-bold ${unlocked ? 'text-fg' : 'text-fg-3'}`}>
                                      {week.title || `Training module ${week.weekNumber}`}
                                    </span>
                                    <span className="mt-0.5 flex items-center gap-3 text-xs text-fg-3">
                                      <span className="inline-flex items-center gap-1"><Play className="h-3 w-3" />{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
                                      {secs > 0 && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmtTotal(secs)}</span>}
                                      {!unlocked && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />Opens {fmtDate(unlockAt)}</span>}
                                    </span>
                                  </span>

                                  <span className="hidden sm:block">
                                    {isCurrent ? <Badge tone="gold">Current</Badge>
                                      : isDone ? <Badge tone="green">Completed</Badge>
                                      : unlocked ? <Badge tone="green">Unlocked</Badge>
                                      : <Badge>Locked</Badge>}
                                  </span>
                                  {unlocked && (
                                    <ChevronDown className={`h-4 w-4 shrink-0 text-fg-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                  )}
                                </button>

                                {isOpen && unlocked && (
                                  <div className="border-t border-line px-4 pb-4 pt-3">
                                    {week.description && (
                                      <p className="mb-3 text-xs leading-relaxed text-fg-2">{week.description}</p>
                                    )}
                                    {videos.length === 0 ? (
                                      <p className="text-xs text-fg-3">No videos in this module yet.</p>
                                    ) : (
                                      <ul className="divide-y divide-line">
                                        {videos.map((vid, i) => (
                                          <li key={vid._id || i}>
                                            <Link
                                              to={`/watch/${course._id}`}
                                              className="group flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs font-medium text-fg-body transition hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                                            >
                                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500 transition group-hover:bg-gold-400 group-hover:text-black dark:text-gold-400">
                                                <Play className="h-3 w-3 fill-current" />
                                              </span>
                                              <span className="flex-1 truncate">{vid.title}</span>
                                              <span className="tabular-nums text-[11px] text-fg-3">{fmtDuration(vid.durationSeconds)}</span>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ol>
                      )}
                    </div>
                  )}

                  {/* Resources */}
                  {tab === 'resources' && (
                    <ul className="space-y-3">
                      {hasSyllabus && (
                        <li>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-line bg-surface hover:border-gold-400/50 transition shadow-xs">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gold-400 text-ink-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-fg truncate">Official Course Syllabus</h4>
                                  {course.syllabusUrl && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-600 dark:text-gold-400 border border-gold-400/30 shrink-0">PDF</span>
                                  )}
                                </div>
                                <p className="text-xs text-fg-3 mt-0.5 truncate">
                                  {course.syllabusUrl ? 'Curriculum guide & printable training schedule.' : 'Training schedule & curriculum outline.'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setSyllabusOpen(true)}
                                className="btn btn-sm btn-primary font-bold cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>View Syllabus</span>
                              </button>
                              {course.syllabusUrl && (
                                <a
                                  href={`/api/courses/${course._id}/syllabus/file`}
                                  download={`${course.slug || 'course'}-syllabus.pdf`}
                                  className="btn btn-sm border border-line font-semibold inline-flex items-center gap-1.5 text-fg hover:bg-surface-2 transition"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </li>
                      )}
                      {(course.documents || []).map((doc, i) => (
                        <li key={i}>
                          <ResourceLink href={doc.url || doc} icon={<BookOpen className="h-4 w-4" />} title={doc.name || `Training document ${i + 1}`} meta="Document" action={<ExternalLink className="h-4 w-4" />} />
                        </li>
                      ))}
                      {!hasSyllabus && !(course.documents && course.documents.length) && (
                        <li className="p-8 text-center text-sm text-fg-3 border border-dashed border-line rounded-2xl">
                          No downloadable resources available for this course yet.
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Details */}
                  {tab === 'details' && (
                    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                      <Detail icon={<CalendarDays className="h-4 w-4" />} label="Started" value={fmtDate(currentProgress.start)} />
                      <Detail icon={<CalendarDays className="h-4 w-4" />} label={currentProgress.finished ? 'Finished' : 'Ends'} value={fmtDate(currentProgress.end)} />
                      <Detail icon={<Layers className="h-4 w-4" />} label="Duration" value={`${currentProgress.total} weeks`} />
                      <Detail icon={<BarChart3 className="h-4 w-4" />} label="Level" value={course.level || 'All levels'} />
                      <Detail icon={<Languages className="h-4 w-4" />} label="Language" value={course.language || 'English'} />
                      <Detail icon={<Clock className="h-4 w-4" />} label="Total video time" value={totals.seconds ? fmtTotal(totals.seconds) : '—'} />
                    </dl>
                  )}
                </div>
              </section>

              {/* ───────── Sidebar ───────── */}
              <aside className="space-y-6">
                {upNext && (
                  <div className={`${card} p-5`}>
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-fg">
                      <Hourglass className="h-4 w-4 text-gold-500 dark:text-gold-400" /> Up next
                    </div>
                    <p className="truncate text-sm font-semibold text-fg">{upNext.e.course.title}</p>
                    <p className="mt-0.5 text-xs text-fg-3">
                      {upNext.p.isLastWeek ? 'Final module ends' : `Module ${upNext.p.current + 1} opens`} {fmtDate(upNext.p.eventAt)}
                    </p>
                    <div className="mt-3"><Countdown ms={upNext.p.eventAt - now} /></div>
                  </div>
                )}

                <div className={`${card} p-5`}>
                  <h3 className="mb-3 font-display text-sm font-bold text-fg">Quick links</h3>
                  <ul className="space-y-1.5">
                    {QUICK.map(({ to, title, text, Icon }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 dark:text-gold-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-fg">{title}</span>
                            <span className="block truncate text-[11px] text-fg-3">{text}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-fg-3 transition group-hover:translate-x-0.5 group-hover:text-gold-500" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
        {/* Syllabus Modal */}
        <SyllabusModal
          course={course}
          open={syllabusOpen}
          onClose={() => setSyllabusOpen(false)}
        />
      </main>
    </div>
  )
}

/* ───────────────────────── tiny presentational helpers ───────────────────────── */

function ResourceLink({ href, icon, title, meta, action }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3.5 transition hover:border-gold-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 dark:text-gold-400">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-fg">{title}</span>
        <span className="block text-[11px] text-fg-3">{meta}</span>
      </span>
      <span className="text-fg-3 transition group-hover:text-gold-500">{action}</span>
    </a>
  )
}

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-3">{icon}</span>
      <div>
        <dt className="text-xs text-fg-3">{label}</dt>
        <dd className="text-sm font-semibold text-fg">{value}</dd>
      </div>
    </div>
  )
}