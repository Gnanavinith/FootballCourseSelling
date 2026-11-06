import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView.js'
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_NUMBER = '919361405307'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Coach Prasanth, I want to join Vanakkam Soccer. Please guide me.')}`

const TRUST_POINTS = [
  { icon: Zap, text: 'Instant Week 1 Lesson Access' },
  { icon: Globe, text: 'Bilingual Tamil & English Audio' },
  { icon: ShieldCheck, text: 'Safe & Encrypted UPI / Card Checkout' },
  { icon: Sparkles, text: 'Built For Mud Grounds, Turf & Parks' },
]

export default function FinalCta() {
  const [ref, inView] = useInView(0.2)
  const fade = inView ? 'animate-fade-up' : 'opacity-0'

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-ink-950 py-20 sm:py-32 border-t border-slate-200 transition-colors duration-300 dark:bg-gradient-to-b dark:from-[#06090e] dark:via-[#0a0f17] dark:to-[#06090e] dark:border-white/5 dark:text-white"
    >
      {/* Stadium illumination glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[900px] rounded-full bg-gradient-to-b from-gold-400/[0.18] via-pitch-500/[0.08] to-transparent blur-[140px] dark:from-gold-400/[0.12] dark:via-pitch-500/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-[350px] w-[600px] rounded-full bg-pitch-500/[0.12] blur-[120px] dark:bg-pitch-500/[0.08]"
      />

      {/* Subtle pitch grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]"
      />

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Top Eyebrow Badge */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-700 dark:border-gold-400/30 dark:bg-gold-400/10 dark:text-gold-400 backdrop-blur-md shadow-glow ${fade}`}
              style={{ animationDelay: '0ms' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
              </span>
              The Ground Is Calling You
            </span>
          </div>

          {/* Main Headline with emotional weight */}
          <h2
            className={`mt-6 font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-ink-950 dark:text-white leading-[1.08] ${fade}`}
            style={{ animationDelay: '100ms' }}
          >
            One Month From Now,
            <span className="text-gradient block font-black">
              You'll Wish You Started Today.
            </span>
          </h2>

          {/* Emotional Subhead */}
          <p
            className={`mx-auto mt-5 max-w-2xl text-base sm:text-lg text-ink-600 dark:text-ink-300 leading-relaxed ${fade}`}
            style={{ animationDelay: '200ms' }}
          >
            Stop scrolling through disconnected social clips that fade from memory. Join dedicated grassroots ballers across Tamil Nadu and India drilling structured, bilingual mechanics that build unmistakable match confidence.
          </p>

          {/* High-Impact CTA Row */}
          <div
            className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row ${fade}`}
            style={{ animationDelay: '300ms' }}
          >
            <Link
              to="/courses"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 px-9 py-4 font-display text-base font-black uppercase tracking-wide text-ink-950 shadow-glow transition-all duration-300 hover:scale-[1.03] hover:shadow-gold-glow active:scale-[0.98]"
            >
              {/* Shimmer light sweep */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">Unlock Week 1 Lessons</span>
              <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-slate-300 bg-white px-7 py-4 font-display text-sm font-bold text-ink-800 shadow-sm transition-all duration-300 hover:border-pitch-500 hover:bg-pitch-50 hover:text-pitch-700 active:scale-[0.98] dark:border-white/20 dark:bg-white/[0.03] dark:text-white dark:hover:border-pitch-400/60 dark:hover:bg-pitch-500/10 dark:hover:text-pitch-300"
            >
              <FaWhatsapp className="h-5 w-5 text-pitch-600 dark:text-pitch-400" aria-hidden="true" />
              Ask Coach on WhatsApp
            </a>
          </div>

          {/* Trust reassurance cards / pills */}
          <div
            className={`mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-slate-200 dark:border-white/10 pt-8 text-left ${fade}`}
            style={{ animationDelay: '400ms' }}
          >
            {TRUST_POINTS.map((tp) => {
              const Icon = tp.icon
              return (
                <div
                  key={tp.text}
                  className="flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white/90 p-3 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-600 dark:bg-gold-400/10 dark:text-gold-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-ink-800 dark:text-ink-200 leading-tight">
                    {tp.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Micro reassuring footer note */}
          <p
            className={`mt-6 text-xs text-ink-500 dark:text-ink-400 ${fade}`}
            style={{ animationDelay: '500ms' }}
          >
            One-time transparent pricing. Lifetime access to your unlocked weeks. No recurring surprises.
          </p>
        </div>
      </div>
    </section>
  )
}