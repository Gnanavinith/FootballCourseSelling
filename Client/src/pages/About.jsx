import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from '../hooks/useInView.js'
import {
  Calendar,
  Globe,
  Target,
  Video,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Flame,
} from 'lucide-react'

const STATS = [
  { value: 79.9, decimals: 1, suffix: 'K+', label: 'YouTube Community' },
  { value: 294, decimals: 0, suffix: '', label: 'Masterclass Videos' },
  { value: 2, decimals: 0, suffix: '', label: 'Bilingual (English & Tamil)' },
  { value: 7, decimals: 0, suffix: '', label: 'Day Weekly Drip System' },
]

const FLOW_PILLARS = [
  {
    step: '01',
    title: 'Structured Weekly Drip',
    text: 'One advanced professional module unlocks every 7 days to ensure flawless skill retention, discipline, and consistent athletic growth.',
    icon: <Calendar className="w-5 h-5 text-gold-400" />,
  },
  {
    step: '02',
    title: 'Bilingual Coaching',
    text: 'Crystal-clear technical instruction delivered fluently in both English and Tamil so you learn in your most natural language.',
    icon: <Globe className="w-5 h-5 text-gold-400" />,
  },
  {
    step: '03',
    title: 'Elite Training Drills',
    text: 'Actionable pitch drills designed by professional coaches that you can replicate independently on any pitch.',
    icon: <Target className="w-5 h-5 text-gold-400" />,
  },
  {
    step: '04',
    title: 'Anywhere Cinematic Access',
    text: 'Stream 1080p high-definition masterclass sessions on phone, tablet, or desktop whenever and wherever you train.',
    icon: <Video className="w-5 h-5 text-gold-400" />,
  },
]

const WORKFLOW = [
  { step: 'A', title: 'Select Masterclass', desc: 'Choose the professional training track tailored to your specific athletic goals and current skill level.' },
  { step: 'B', title: 'Secure Enrollment', desc: 'Complete your registration and secure payment instantly through our encrypted checkout.' },
  { step: 'C', title: 'Module 1 Unlocks', desc: 'Instantly access your first week of elite video drills, tactics, and playbook resources.' },
  { step: 'D', title: 'Progressive Drip', desc: 'Master each week as new professional masterclasses unlock automatically every 7 days.' },
]

/* Faint football-pitch line drawing used as background texture */
function PitchLines({ className = '' }) {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <rect x="40" y="40" width="720" height="520" />
      <line x1="400" y1="40" x2="400" y2="560" />
      <circle cx="400" cy="300" r="95" />
      <circle cx="400" cy="300" r="4" fill="currentColor" />
      <rect x="40" y="165" width="130" height="270" />
      <rect x="40" y="235" width="50" height="130" />
      <path d="M170 255a62 62 0 0 1 0 90" />
      <rect x="630" y="165" width="130" height="270" />
      <rect x="710" y="235" width="50" height="130" />
      <path d="M630 255a62 62 0 0 0 0 90" />
    </svg>
  )
}

const pitchMask = '[mask-image:linear-gradient(to_right,transparent,black_45%)]'

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

function Stat({ value, decimals, suffix, label }) {
  const [ref, inView] = useInView(0.4)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value)
      return
    }
    const start = performance.now()
    const duration = 1400
    let raf
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setN(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <div ref={ref} className="p-4 sm:p-5 text-center border-b sm:border-b-0 sm:border-r border-white/10 last:border-none">
      <p className="font-display text-2xl sm:text-3xl font-black tabular-nums text-gold-400">
        <span>
          {n.toFixed(decimals)}
          {suffix}
        </span>
      </p>
      <p className="text-[11px] sm:text-xs mt-1 font-semibold text-zinc-300">{label}</p>
    </div>
  )
}

export default function About() {
  useEffect(() => {
    document.title = 'About Academy | Vanakkam Soccer'
  }, [])

  return (
    <main className="bg-page text-fg-body font-sans transition-colors duration-300 overflow-hidden">
      {/* Hero Section with Football Pitch Court Background */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#111418] text-white min-h-[calc(100vh-var(--nav-h))] flex items-center py-16 lg:py-20">
        <PitchLines
          className={`pointer-events-none absolute inset-y-0 right-0 h-full w-full text-white/[0.07] sm:w-[75%] lg:w-[62%] ${pitchMask}`}
        />

        <div className="container-page relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* Left Column: Content */}
            <div className="space-y-6 text-left animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-bold tracking-widest uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vanakkam Soccer Academy</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                The Vanakkam <span className="text-gradient">Soccer Methodology</span>
              </h1>
              <p className="text-lead text-ink-300 text-sm sm:text-base leading-relaxed max-w-xl">
                We discarded traditional rigid card layouts to create a seamless, continuous flow of professional football mastery, expert tactical drills, and bilingual coaching.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/courses" className="btn btn-lg btn-primary px-8 py-3.5 font-black shadow-glow">
                  Explore Masterclasses <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link to="/contact" className="btn btn-lg btn-outline-light px-6 py-3.5 font-bold">
                  Contact Coaches
                </Link>
              </div>
            </div>

            {/* Right Column: Elite Academy Badge Grid */}
            <div className="space-y-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl space-y-6">
                {/* Subtle court lines in card background for tactical authenticity */}
                <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
                  <PitchLines className="w-full h-full text-white" />
                </div>

                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gold-400/20 border border-gold-400/30 flex items-center justify-center text-gold-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Elite Coaching Standard</h3>
                      <p className="text-[11px] text-zinc-400">Verified professional curriculum</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 transition-colors hover:border-gold-400/30">
                    <Activity className="w-4 h-4 text-gold-400 mb-2" />
                    <h4 className="text-xs font-bold text-white">Tactical IQ</h4>
                    <p className="text-[11px] text-zinc-400">Positioning & vision drills</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 transition-colors hover:border-gold-400/30">
                    <Flame className="w-4 h-4 text-gold-400 mb-2" />
                    <h4 className="text-xs font-bold text-white">Pro Match Ready</h4>
                    <p className="text-[11px] text-zinc-400">High-intensity conditioning</p>
                  </div>
                </div>

                <div className="relative z-10 pt-2 text-center">
                  <span className="text-xs font-semibold text-gold-400 tracking-wide uppercase">
                    Trusted by 79,900+ Footballers Worldwide
                  </span>
                </div>
              </div>

              {/* Integrated Statistics Container */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/15 bg-white/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
                {STATS.map((s) => (
                  <Stat key={s.label} {...s} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Flow Animated Pillars Section */}
      <section className="relative py-24 sm:py-32 bg-page">
        <div className="container-page max-w-4xl mx-auto space-y-20">
          <Reveal className="text-center space-y-3">
            <span className="badge badge-gold">Core Principles</span>
            <h2 className="text-2xl sm:text-4xl font-black text-fg">Continuous Learning Flow</h2>
            <p className="text-small text-fg-3 max-w-xl mx-auto">Designed for intuitive progression from fundamental footwork to advanced match tactics.</p>
          </Reveal>

          <div className="relative border-l-2 border-gold-400/40 ml-4 sm:ml-8 space-y-16 pl-6 sm:pl-10">
            {FLOW_PILLARS.map((p, i) => (
              <Reveal key={p.step} delay={i * 120} className="relative group">
                {/* Glowing step node */}
                <div className="absolute -left-[35px] sm:-left-[51px] top-0 w-8 h-8 rounded-full bg-surface border-2 border-gold-400 flex items-center justify-center text-xs font-black text-gold-500 shadow-glow group-hover:bg-gold-400 group-hover:text-black transition-all">
                  {p.step}
                </div>

                <div className="space-y-3 transition-transform duration-300 group-hover:translate-x-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-2 border border-line text-fg text-xs font-bold">
                    {p.icon}
                    <span>Pillar {p.step}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-fg tracking-tight">{p.title}</h3>
                  <p className="text-sm sm:text-base text-fg-2 leading-relaxed max-w-2xl">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Horizontal Workflow Timeline */}
      <section className="relative py-24 sm:py-32 bg-surface-2 border-t border-line">
        <div className="container-page max-w-6xl mx-auto space-y-16">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <span className="badge badge-green">Athlete Journey</span>
            <h2 className="text-2xl sm:text-4xl font-black text-fg">From Enrollment to Execution</h2>
            <p className="text-small text-fg-3">The seamless progression pipeline of every Vanakkam Soccer athlete.</p>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            {WORKFLOW.map((w, i) => (
              <Reveal key={w.step} delay={i * 100} className="relative">
                <div className="space-y-4 p-6 rounded-3xl bg-surface border border-line h-full flex flex-col justify-between transition-all duration-300 hover:border-gold-400 hover:-translate-y-1">
                  <div className="space-y-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-tint-gold text-on-tint-gold font-display font-black text-sm">
                      {w.step}
                    </span>
                    <h3 className="text-base font-bold text-fg">{w.title}</h3>
                    <p className="text-xs text-fg-2 leading-relaxed">{w.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-line flex items-center gap-1.5 text-[11px] font-bold text-pitch-600 dark:text-pitch-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Stage {w.step} verified
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Flow CTA Banner with Subtle Pitch Lines */}
      <section className="relative overflow-hidden section-dark hero-bg py-24">
        <PitchLines className="pointer-events-none absolute inset-0 m-auto h-full w-full text-white/[0.05] [mask-image:radial-gradient(circle,black_45%,transparent_80%)]" />

        <div className="container-page relative z-10 text-center space-y-6">
          <Reveal className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-400/20">
              <Sparkles className="w-3.5 h-3.5" /> Start Training Today
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Ready to join the academy flow?</h2>
            <p className="text-lead text-ink-300 max-w-xl mx-auto text-sm sm:text-base">
              Choose your professional masterclass track and start your first weekly training module immediately.
            </p>
            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <Link to="/courses" className="btn btn-lg btn-primary px-8 py-4 font-black shadow-glow">
                Explore Masterclasses <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/register" className="btn btn-lg btn-outline-light px-8 py-4 font-bold">
                Create Athlete Account
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
