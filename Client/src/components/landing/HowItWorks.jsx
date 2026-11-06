import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    n: '01',
    badge: 'Immediate Kickoff',
    title: 'Enrol & Unlock Week 1 Instantly',
    text: 'Get immediate access to your foundational drills. Set up your ball, step onto your local ground or terrace, and begin your transformation today.',
  },
  {
    n: '02',
    badge: 'Deliberate Practice',
    title: 'Drill the Mechanics in Tamil & English',
    text: 'Watch Coach Prasanth break down foot angles, body weight, and defender deception. Repeat each drill until instinct and muscle memory take over.',
  },
  {
    n: '03',
    badge: 'Compound Progress',
    title: 'Unlock Advanced Intensity Every 7 Days',
    text: 'Each week introduces sharper turns, faster decision-making, and game-realistic pressure drills to ensure you never plateau.',
  },
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    if (el) io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, shown]
}

function useScrollProgress(ref) {
  const [p, setP] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setP(1)
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const start = window.innerHeight * 0.65
      const v = (start - r.top) / r.height
      setP(Math.min(1, Math.max(0, v)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])

  return p
}

function TreeStep({ index, node, children }) {
  const [ref, shown] = useReveal()
  const isLeft = index % 2 === 0

  return (
    <li
      ref={ref}
      className="relative pl-12 lg:grid lg:grid-cols-2 lg:pl-0"
    >
      {/* Node pin */}
      <span
        aria-hidden="true"
        className={
          'absolute left-0 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 font-display text-sm font-black text-ink-950 ring-4 ring-slate-50 dark:ring-ink-950 transition duration-500 ease-out motion-reduce:transition-none lg:left-1/2 lg:-translate-x-1/2 ' +
          (shown ? 'scale-100 opacity-100 shadow-glow' : 'scale-0 opacity-0')
        }
      >
        {node}
      </span>

      <div
        className={
          'relative ' +
          (isLeft ? 'lg:col-start-1 lg:pr-14' : 'lg:col-start-2 lg:pl-14')
        }
      >
        {/* Horizontal connector branch on desktop */}
        <span
          aria-hidden="true"
          style={{ transitionDelay: '200ms' }}
          className={
            'absolute top-[2.75rem] hidden h-px w-14 bg-gradient-to-r from-gold-400/60 to-transparent transition-transform duration-500 ease-out motion-reduce:transition-none lg:block ' +
            (isLeft ? 'right-0 origin-right from-transparent to-gold-400/60' : 'left-0 origin-left') +
            (shown ? 'scale-x-100' : 'scale-x-0')
          }
        />

        {/* Card */}
        <div
          style={{ transitionDelay: '300ms' }}
          className={
            'transition duration-700 ease-out motion-reduce:transition-none ' +
            (shown
              ? 'translate-x-0 translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0 ' +
                (isLeft
                  ? 'lg:-translate-x-8 lg:translate-y-0'
                  : 'lg:translate-x-8 lg:translate-y-0'))
          }
        >
          {children}
        </div>
      </div>
    </li>
  )
}

export default function HowItWorks() {
  const listRef = useRef(null)
  const progress = useScrollProgress(listRef)

  return (
    <section className="relative overflow-hidden bg-page text-fg py-14 sm:py-20 border-b border-line">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-96 w-[45rem] rounded-full bg-pitch-500/[0.04] blur-[130px]"
      />

      <div className="container-page relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge badge-gold mb-3 inline-flex">
            Your Pathway
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl lg:text-5xl">
            How Your Game Transforms{" "}
            <span className="text-gold-600 dark:text-gold-400 block sm:inline">
              Step By Step
            </span>
          </h2>
          <p className="mt-3 text-sm text-fg-2 sm:text-base leading-relaxed">
            Becoming a dominant baller is not an overnight fluke. It is a proven, disciplined journey built repetition by repetition.
          </p>
        </div>

        {/* Timeline Tree */}
        <ol ref={listRef} className="relative mt-16 space-y-10 lg:space-y-8">
          {/* Trunk line */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-5 top-0 w-px bg-line lg:left-1/2 lg:-translate-x-1/2"
          />
          {/* Active growing line */}
          <span
            aria-hidden="true"
            style={{ transform: `scaleY(${progress})` }}
            className="absolute bottom-0 left-5 top-0 w-px origin-top bg-gradient-to-b from-gold-400 via-pitch-400 to-pitch-500 will-change-transform lg:left-1/2"
          />

          {steps.map((s, i) => (
            <TreeStep key={s.n} index={i} node={s.n}>
              <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-gold-500/50 hover:shadow-md">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gold-500 opacity-60 group-hover:opacity-100 transition-opacity"
                />

                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 dark:text-gold-400 border border-gold-500/30 dark:border-gold-400/30 rounded-full px-2.5 py-0.5 bg-gold-500/5 dark:bg-gold-400/5">
                  {s.badge}
                </span>

                <h3 className="mt-4 font-display text-xl font-bold text-fg group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-fg-2 leading-relaxed">
                  {s.text}
                </p>
              </div>
            </TreeStep>
          ))}

          {/* Weekly Unlock Philosophy */}
          <TreeStep
            index={steps.length}
            node={
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          >
            <div className="rounded-2xl border border-gold-500/30 bg-surface p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-950 font-bold text-xs mt-0.5 shadow-sm">
                  !
                </span>
                <div>
                  <h4 className="font-display font-bold text-fg text-sm sm:text-base">
                    The 7-Day Mastery Principle
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-fg-2 leading-relaxed">
                    Week 1 is available immediately after enrolment. Subsequent weeks unlock every 7 days so you don't skip reps. Real football prowess comes from deliberate habit, not rushed binge-watching.
                  </p>
                </div>
              </div>
            </div>
          </TreeStep>
        </ol>
      </div>
    </section>
  )
}
