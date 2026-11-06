import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Play, Download, ExternalLink, BookOpen, CheckCircle2,
  Clock, ArrowLeft, Trophy, Search, AlertCircle, X
} from 'lucide-react'
import Reveal from '../components/common/Reveal.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { api } from '../lib/api.js'
import { ThemeToggle } from '../components/layout/Navbar.jsx'
import SyllabusModal from '../components/course/SyllabusModal.jsx'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function getProgress(enrollment, now) {
  let start = new Date(enrollment.startsAt).getTime()
  if (Number.isNaN(start)) start = now
  const total = Math.max(1, Number(enrollment.course.totalWeeks || enrollment.course.weeks) || 1)
  const week = Math.max(1, Math.floor((now - start) / WEEK_MS) + 1)
  const finished = week > total
  const current = Math.min(week, total)
  const eventAt = finished ? null : start + current * WEEK_MS
  return {
    total,
    current,
    finished,
    percent: finished ? 100 : Math.round(((current - 1) / total) * 100),
    eventAt,
  }
}

function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  return `${h}h ${m}m`
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
            title={`Week ${n}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${isNow ? 'animate-pulse bg-gold-400' : past ? 'bg-emerald-500' : 'bg-line'}`}
          />
        )
      })}
    </div>
  )
}

function DocumentsModal({ course, onOpenSyllabus, onClose }) {
  const hasSyllabus = Boolean(course.syllabus || course.syllabusUrl)
  const hasDocs = Boolean(course.documents && course.documents.length)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="docs-title">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400 font-black text-ink-950 shadow-xs">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 id="docs-title" className="font-display text-base font-bold text-fg truncate">{course.title}</h2>
              <p className="text-xs text-fg-3">Curriculum documents & playbook</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-fg-3 transition hover:bg-surface-2 hover:text-fg" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-2.5 pt-2">
          {hasSyllabus && (
            <li>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenSyllabus?.()
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm font-semibold text-fg transition hover:bg-gold-400/20 cursor-pointer text-left"
              >
                <FileText className="h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400" />
                <span className="flex-1 font-bold">Official Course Syllabus</span>
                <span className="text-xs font-black bg-gold-400 text-ink-950 px-2 py-0.5 rounded-lg shadow-xs">View</span>
              </button>
            </li>
          )}
          {course.syllabusUrl && (
            <li>
              <a
                href={`/api/courses/${course._id}/syllabus/file`}
                download={`${course.slug || 'course'}-syllabus.pdf`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-fg-body no-underline transition hover:border-gold-400/50 hover:bg-surface hover:text-fg"
              >
                <Download className="h-4 w-4 shrink-0 text-gold-500" />
                <span className="flex-1 text-xs font-bold text-fg">Download Syllabus PDF</span>
                <span className="text-[11px] font-semibold text-fg-3">PDF</span>
              </a>
            </li>
          )}
          {(course.documents || []).map((doc, i) => (
            <li key={i}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-fg-body no-underline transition hover:border-gold-400/50 hover:bg-surface hover:text-fg"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-gold-500" />
                <span className="flex-1 text-xs font-bold text-fg truncate">{doc.label || doc.name || `Training Document ${i + 1}`}</span>
                <ExternalLink className="h-4 w-4 shrink-0 text-fg-3" />
              </a>
            </li>
          ))}
          {!hasSyllabus && !hasDocs && (
            <li className="p-6 text-center text-xs text-fg-3 border border-dashed border-line rounded-2xl">
              No supplementary documents available for this course yet.
            </li>
          )}
        </ul>

        <div className="pt-2">
          <button type="button" onClick={onClose} className="btn btn-md btn-outline w-full justify-center">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ enrollment, now }) {
  const p = getProgress(enrollment, now)
  const { course } = enrollment
  const [docsOpen, setDocsOpen] = useState(false)
  const [syllabusOpen, setSyllabusOpen] = useState(false)
  const hasResources = Boolean(course.syllabus || course.syllabusUrl || (course.documents && course.documents.length))

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-all duration-300 hover:border-gold-400/50 hover:-translate-y-1 hover:shadow-md">
        <div className="relative aspect-video w-full bg-surface-2 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.thumbAlt || course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-2 text-gold-400">
              <BookOpen className="h-12 w-12 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {p.finished ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-0.5 text-[11px] font-black text-ink-950 shadow-xs">
                Week {p.current} Active
              </span>
            )}
            {course.level && (
              <span className="rounded-full bg-black/70 backdrop-blur-md border border-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {course.level}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 flex flex-1 flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display line-clamp-1 text-base sm:text-lg font-bold text-fg group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors" lang={course.language === 'Tamil' ? 'ta' : undefined}>
              {course.title}
            </h3>
            {course.shortDesc && (
              <p className="mt-1 line-clamp-2 text-xs text-fg-3 leading-relaxed">{course.shortDesc}</p>
            )}

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-fg-3">
                <span className="font-medium">Module {p.current} of {p.total}</span>
                <span className="font-bold text-fg tabular-nums">{p.percent}%</span>
              </div>
              <WeekBars total={p.total} current={p.current} finished={p.finished} />
            </div>

            {!p.finished && p.eventAt && (
              <p className="mt-2 text-[11px] text-fg-3 flex items-center gap-1">
                <Clock className="h-3 w-3 text-gold-500" />
                <span>Next unlock:</span>
                <span className="font-bold text-fg">{formatCountdown(p.eventAt - now)}</span>
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-line flex items-center gap-2">
            <Link to={`/watch/${course._id}`} className="btn btn-sm btn-primary flex-1 justify-center gap-1.5 font-bold">
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{p.finished ? 'Review Videos' : 'Continue Learning'}</span>
            </Link>
            {hasResources && (
              <button
                type="button"
                onClick={() => setDocsOpen(true)}
                className="btn btn-sm btn-outline gap-1.5 cursor-pointer font-semibold text-fg hover:bg-surface-2"
                title="Course resources & syllabus"
              >
                <FileText className="h-3.5 w-3.5 text-gold-500" />
                <span>Docs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {docsOpen && (
        <DocumentsModal
          course={course}
          onOpenSyllabus={() => setSyllabusOpen(true)}
          onClose={() => setDocsOpen(false)}
        />
      )}
      <SyllabusModal
        course={course}
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
      />
    </>
  )
}

function CourseSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm animate-pulse flex flex-col" aria-hidden="true">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video w-full bg-surface-2 relative">
        <div className="absolute right-3 top-3 flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-surface-3/40" />
          <div className="h-5 w-14 rounded-full bg-surface-3/40" />
        </div>
      </div>
      {/* Body Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="h-5 w-4/5 rounded-lg bg-surface-2 mb-2" />
          <div className="h-3.5 w-3/5 rounded bg-surface-2/70" />
          
          <div className="mt-5 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-surface-2/70" />
              <div className="h-3 w-8 rounded bg-surface-2/70" />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-surface-2" />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-line/60 flex items-center gap-2">
          <div className="h-9 flex-1 rounded-xl bg-surface-2" />
          <div className="h-9 w-20 rounded-xl bg-surface-2" />
        </div>
      </div>
    </div>
  )
}

export default function MyCourses() {
  usePageMeta({ title: 'My Masterclasses | Vanakkam Soccer', noindex: true })

  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api('/me/courses')
      .then((r) =>
        (r.data || [])
          .filter((x) => x.course)
          .map((x) => ({
            _id: x.course._id,
            startsAt: x.startsAt,
            course: x.course,
            weekTitles: x.weekTitles || x.course.weekTitles || [],
          }))
      )
      .then((data) => !cancelled && setEnrollments(data))
      .catch((e) => !cancelled && setError(e.message || 'Could not load your courses'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [attempt])

  const activeCount = useMemo(
    () => enrollments.filter((e) => !getProgress(e, now).finished).length,
    [enrollments, now]
  )
  const completedCount = enrollments.length - activeCount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enrollments.filter((e) => {
      const p = getProgress(e, now)
      if (filter === 'active' && p.finished) return false
      if (filter === 'completed' && !p.finished) return false
      if (!q) return true
      return (
        (e.course.title || '').toLowerCase().includes(q) ||
        (e.course.shortDesc || '').toLowerCase().includes(q) ||
        (e.course.level || '').toLowerCase().includes(q)
      )
    })
  }, [enrollments, filter, query, now])

  const FILTERS = [
    { key: 'all', label: 'All Tracks', count: enrollments.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ]

  return (
    <main className="min-h-screen bg-page text-fg-body font-sans">
      {/* Header section with Stats */}
      <section className="relative overflow-hidden bg-surface py-10 sm:py-14 border-b border-line">
        <div className="container-page">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-2 hover:text-fg bg-surface-2 hover:bg-surface px-3 py-1.5 rounded-xl border border-line transition no-underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Academy Hub</span>
                </Link>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Student Library</span>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fg">
                My <span className="text-gold-600 dark:text-gold-400">Masterclasses</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-fg-3 leading-relaxed">
                All your enrolled training tracks, active weekly drills, and certified playbook resources in one place.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-2xl border border-line bg-surface-2/60 px-5 py-3">
                <div className="px-4 first:pl-0 last:pr-0 border-r border-line">
                  <p className="text-[11px] font-medium text-fg-3">Enrolled</p>
                  <p className="font-display text-2xl font-black text-fg">{loading ? '–' : enrollments.length}</p>
                </div>
                <div className="px-4 border-r border-line">
                  <p className="text-[11px] font-medium text-fg-3">Active</p>
                  <p className="font-display text-2xl font-black text-gold-600 dark:text-gold-400">{loading ? '–' : activeCount}</p>
                </div>
                <div className="px-4 last:pr-0">
                  <p className="text-[11px] font-medium text-fg-3">Completed</p>
                  <p className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">{loading ? '–' : completedCount}</p>
                </div>
              </div>
              <ThemeToggle compact />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 sm:py-12 space-y-6">
        {/* Controls: Filter Pills + Search */}
        {!loading && !error && enrollments.length > 0 && (
          <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter masterclasses">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    filter === f.key
                      ? 'border-gold-500 bg-gold-400 text-black font-bold shadow-xs'
                      : 'border-line bg-surface text-fg-body hover:border-gold-400/50'
                  }`}
                >
                  {f.label} <span className={filter === f.key ? 'text-black/80' : 'text-fg-3'}>{f.count}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <span className="sr-only">Search your enrolled tracks</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your masterclasses..."
                className="w-full rounded-2xl border border-line bg-surface py-2.5 pl-10 pr-4 text-xs sm:text-sm text-fg placeholder:text-fg-3 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </div>
          </Reveal>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading your masterclasses">
            <CourseSkeleton />
            <CourseSkeleton />
            <CourseSkeleton />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="card card-body mx-auto max-w-lg text-center p-8 sm:p-10 rounded-3xl border border-line bg-surface shadow-sm" role="alert">
            <div className="w-12 h-12 rounded-2xl bg-danger-500/10 text-danger-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-display text-lg font-bold text-fg">Could not load your masterclasses</h2>
            <p className="text-sm text-danger-500 mt-2 mb-6">{error}</p>
            <button type="button" className="btn btn-primary mx-auto" onClick={() => setAttempt((n) => n + 1)}>
              Try Again
            </button>
          </div>
        )}

        {/* No Enrolled Courses State */}
        {!loading && !error && enrollments.length === 0 && (
          <div className="card card-body mx-auto max-w-lg text-center p-10 sm:p-14 rounded-3xl border border-line bg-surface shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-gold-400/10 text-gold-500 dark:text-gold-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-black text-fg">No masterclasses yet</h2>
            <p className="mt-2 text-sm text-fg-3 leading-relaxed">
              Choose an elite football training track and Week 1 drills will unlock straight away.
            </p>
            <Link to="/courses" className="btn btn-lg btn-primary mx-auto mt-6">
              Explore Masterclasses
            </Link>
          </div>
        )}

        {/* Filter / Search yielded no results */}
        {!loading && !error && filtered.length === 0 && enrollments.length > 0 && (
          <div className="card card-body mx-auto max-w-md text-center p-8 rounded-3xl border border-line bg-surface shadow-sm">
            <h2 className="font-display text-lg font-bold text-fg">No matching masterclasses found</h2>
            <p className="mt-1 text-xs text-fg-3">Try adjusting your search terms or filter selection.</p>
            <button
              type="button"
              className="btn btn-sm btn-outline mt-4 mx-auto"
              onClick={() => { setFilter('all'); setQuery('') }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Course Cards Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e, i) => (
              <Reveal key={e._id} delay={i * 50}>
                <CourseCard enrollment={e} now={now} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
