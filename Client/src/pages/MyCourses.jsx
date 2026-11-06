import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
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
            className={`h-1.5 flex-1 rounded-full transition-colors ${isNow ? 'animate-pulse bg-gold-400' : past ? 'bg-pitch-500' : 'bg-surface-2'}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="docs-title">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 id="docs-title" className="font-display text-lg font-bold text-fg">{course.title}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-3 transition hover:bg-surface-2 hover:text-fg" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p className="mt-1 text-sm text-fg-3">Course resources and official documents</p>

        <ul className="mt-5 space-y-2">
          {hasSyllabus && (
            <li>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenSyllabus?.()
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-pitch-200 bg-tint-green px-4 py-3 text-sm font-semibold text-on-tint-green transition hover:brightness-95 cursor-pointer text-left"
              >
                <FileText className="h-5 w-5 shrink-0" />
                <span>Official Course Syllabus</span>
                <span className="ml-auto text-xs font-bold bg-gold-400 text-ink-950 px-2 py-0.5 rounded-md">View</span>
              </button>
            </li>
          )}
          {course.syllabusUrl && (
            <li>
              <a
                href={`/api/courses/${course._id}/syllabus/file`}
                download={`${course.slug || 'course'}-syllabus.pdf`}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-fg-body no-underline transition hover:border-line-strong hover:bg-surface hover:text-fg"
              >
                <FileText className="h-5 w-5 shrink-0 text-fg-3" />
                Download Syllabus PDF
                <Download className="ml-auto h-4 w-4 shrink-0 text-fg-3" />
              </a>
            </li>
          )}
          {(course.documents || []).map((doc, i) => (
            <li key={i}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-fg-body no-underline transition hover:border-line-strong hover:bg-surface hover:text-fg"
              >
                <svg className="h-5 w-5 shrink-0 text-fg-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                {doc.label || doc.name || `Document ${i + 1}`}
                <svg className="ml-auto h-4 w-4 shrink-0 text-fg-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </li>
          ))}
          {!hasSyllabus && !hasDocs && (
            <li className="p-4 text-center text-sm text-fg-3">No documents or syllabus available yet.</li>
          )}
        </ul>

        <button type="button" onClick={onClose} className="btn btn-md btn-dark btn-block mt-5">
          Close
        </button>
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
      <div className="card card-hover overflow-hidden flex flex-col">
        <div className="relative aspect-video w-full bg-surface-2 overflow-hidden">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.thumbAlt || course.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-900 to-ink-800">
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12,7.4 16.4,10.6 14.7,15.8 9.3,15.8 7.6,10.6" fill="currentColor" />
              </svg>
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-1.5">
            {p.finished && <span className="badge badge-gold">Completed</span>}
            {!p.finished && <span className="badge badge-green">Active</span>}
            {course.level && <span className="badge badge-dark">{course.level}</span>}
          </div>
        </div>

        <div className="card-body flex flex-1 flex-col">
          <h3 className="line-clamp-2 text-base font-bold text-fg" lang={course.language === 'Tamil' ? 'ta' : undefined}>
            {course.title}
          </h3>
          {course.shortDesc && (
            <p className="mt-1 line-clamp-2 text-sm text-fg-3">{course.shortDesc}</p>
          )}

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-fg-3">
              <span>Week {p.current} of {p.total}</span>
              <span className="font-semibold text-fg-body">{p.percent}%</span>
            </div>
            <WeekBars total={p.total} current={p.current} finished={p.finished} />
          </div>

          {!p.finished && p.eventAt && (
            <p className="mt-2 text-xs text-fg-3">
              Next unlock: <span className="font-semibold text-fg-body">{formatCountdown(p.eventAt - now)}</span>
            </p>
          )}

          <div className="mt-auto flex items-center gap-2 pt-4">
            <Link to={`/watch/${course._id}`} className="btn btn-sm btn-primary flex-1 justify-center">
              {p.finished ? 'Review videos' : 'Continue'}
            </Link>
            {hasResources && (
              <button
                type="button"
                onClick={() => setDocsOpen(true)}
                className="btn btn-sm btn-outline gap-1.5"
                title="Course documents"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                Docs
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

function Skeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton skeleton-thumb" />
      <div className="card-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text w-4/5" />
        <div className="skeleton mt-4 h-1.5 w-full" />
        <div className="mt-5 flex gap-2">
          <div className="skeleton skeleton-btn flex-1" />
          <div className="skeleton h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function MyCourses() {
  usePageMeta({ title: 'My Courses | Vanakkam Soccer', noindex: true })

  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('all')
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

  const filtered = enrollments.filter((e) => {
    if (filter === 'all') return true
    const p = getProgress(e, now)
    if (filter === 'active') return !p.finished
    if (filter === 'completed') return p.finished
    return true
  })

  const activeCount = enrollments.filter((e) => !getProgress(e, now).finished).length
  const completedCount = enrollments.length - activeCount

  const FILTERS = [
    { key: 'all', label: 'All', count: enrollments.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ]

  return (
    <main>
      <section className="section-dark hero-bg">
        <div className="container-page pb-20 pt-8 md:pb-28 md:pt-14">
          <div className="flex items-center justify-between gap-3 mb-4 animate-fade-up">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-white no-underline hover:no-underline">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Dashboard
            </Link>
            <ThemeToggle compact />
          </div>
          <p className="text-small animate-fade-up font-semibold uppercase tracking-widest text-gold-400">Student portal</p>
          <h1 className="mt-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
            My <span className="text-gradient">Courses</span>
          </h1>
          <p className="text-lead mt-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            All your enrolled courses, progress, and resources in one place.
          </p>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-12 pb-16 md:-mt-16">
        {!loading && !error && enrollments.length > 0 && (
          <Reveal className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  filter === f.key
                    ? 'border-fg bg-fg text-page'
                    : 'border-line-strong bg-surface text-fg-body hover:border-line'
                }`}
              >
                {f.label} <span className={filter === f.key ? 'text-gold-400' : 'text-fg-3'}>{f.count}</span>
              </button>
            ))}
          </Reveal>
        )}

        {loading && (
          <div className="grid-courses" aria-busy="true" aria-label="Loading courses">
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        )}

        {!loading && error && (
          <div className="card card-body mx-auto max-w-lg text-center" role="alert">
            <p className="font-display text-lg font-bold text-fg">Could not load your courses</p>
            <p className="form-error">{error}</p>
            <button type="button" className="btn btn-md btn-dark mx-auto mt-4" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && enrollments.length === 0 && (
          <div className="card card-body mx-auto max-w-lg text-center">
            <svg viewBox="0 0 24 24" className="mx-auto h-14 w-14 text-fg-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <h2 className="mt-3 text-2xl">No courses yet</h2>
            <p className="mt-2 text-fg-3">Choose a course and Week 1 unlocks straight after payment.</p>
            <Link to="/courses" className="btn btn-lg btn-primary btn-block-mobile mx-auto mt-5">Explore Courses</Link>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && enrollments.length > 0 && (
          <div className="card card-body mx-auto max-w-lg text-center">
            <h2 className="text-xl">No {filter} courses</h2>
            <button type="button" className="btn btn-sm btn-ghost mt-3" onClick={() => setFilter('all')}>View all courses</button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid-courses">
            {filtered.map((e, i) => (
              <Reveal key={e._id} delay={i * 60}>
                <CourseCard enrollment={e} now={now} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
