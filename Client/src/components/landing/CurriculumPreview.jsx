import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView.js'

const Icon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const weeks = [
  {
    state: 'week-active',
    title: 'Week 1',
    note: 'Available after enrolment',
    badge: { cls: 'badge-green', label: 'Start here' },
    iconWrap: 'bg-pitch-500 text-white',
    icon: <Icon><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>,
  },
  {
    state: 'week-soon',
    title: 'Week 2',
    note: 'Unlocks 7 days later',
    badge: { cls: 'badge-gold', label: 'Next' },
    iconWrap: 'bg-gold-100 text-gold-700',
    icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  },
  {
    state: 'week-locked',
    title: 'Later weeks',
    note: 'Locked until scheduled unlock',
    badge: { cls: 'badge-gray', label: 'Locked' },
    iconWrap: 'bg-ink-200 text-ink-500',
    icon: <Icon><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>,
  },
]

export default function CurriculumPreview() {
  // Shared hook: shows straight away if the section is already on screen, otherwise on scroll
  const [ref, inView] = useInView(0.2)
  const delay = (ms) => ({ animationDelay: `${ms}ms` })
  // Hidden until the section is seen, then fades up (no flash, because it is hidden from the start)
  const reveal = (extra = '') => `${inView ? 'animate-fade-up' : 'opacity-0'} ${extra}`

  return (
    <section ref={ref} className="container-page section">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        {/* Intro */}
        <div>
          <span className={`badge badge-gold ${reveal()}`} style={delay(0)}>
            Weekly schedule
          </span>
          <h2 className={`mt-4 ${reveal()}`} style={delay(100)}>
            A Clear Path to Better Football
          </h2>
          <p className={`text-lead mt-4 ${reveal()}`} style={delay(200)}>
            Each course follows a structured weekly schedule. Week 1 is available
            after enrolment and later weeks unlock every seven days.
          </p>
          <div className={`mt-8 ${reveal()}`} style={delay(300)}>
            <Link to="/courses" className="group btn btn-lg btn-primary btn-block-mobile">
              Explore Courses
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className={`card card-body ${reveal()}`} style={delay(150)}>
          <ul
            className={`relative space-y-3 before:absolute before:bottom-6 before:left-[2.2rem] before:top-6 before:w-px before:origin-top before:bg-ink-200 before:transition-transform before:duration-[1200ms] before:ease-out before:delay-300 ${
              inView ? 'before:scale-y-100' : 'before:scale-y-0'
            }`}
          >
            {weeks.map((w, i) => (
              <li
                key={w.title}
                className={`week-item relative ${w.state} ${inView ? 'animate-slide-in' : 'opacity-0'}`}
                style={delay(350 + i * 200)}
              >
                {/* Icon pops in after its row slides in; ping ring on the open week,
                    lock wiggles now and then */}
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${w.iconWrap} ${
                    inView ? 'animate-pop' : 'scale-0'
                  }`}
                  style={delay(550 + i * 200)}
                >
                  {w.state === 'week-active' && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-pitch-500/40" />
                  )}
                  <span className={`relative ${w.state === 'week-locked' ? 'animate-wiggle' : ''}`}>
                    {w.icon}
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold leading-tight text-ink-950">{w.title}</p>
                  <p className="text-small mt-0.5 text-ink-500">{w.note}</p>
                </div>
                <span className={`badge ${w.badge.cls} shrink-0`}>{w.badge.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}