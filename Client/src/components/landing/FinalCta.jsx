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
      className="relative isolate overflow-hidden bg-page text-fg py-16 sm:py-24 border-t border-line"
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

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Top Eyebrow Badge */}
          <div className="flex justify-center">
            <span
              className={`badge badge-gold ${fade}`}
              style={{ animationDelay: '0ms' }}
            >
              The Ground Is Calling You
            </span>
          </div>

          {/* Main Headline with emotional weight */}
          <h2
            className={`mt-6 font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-fg leading-[1.08] ${fade}`}
            style={{ animationDelay: '100ms' }}
          >
            One Month From Now,{" "}
            <span className="text-gold-600 dark:text-gold-400 block sm:inline">
              You'll Wish You Started Today.
            </span>
          </h2>

          {/* Emotional Subhead */}
          <p
            className={`mx-auto mt-5 max-w-2xl text-base sm:text-lg text-fg-2 leading-relaxed ${fade}`}
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
              className="btn btn-xl btn-primary w-full sm:w-auto justify-center shadow-glow gap-3"
            >
              <span>Unlock Week 1 Lessons</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn btn-xl btn-outline w-full sm:w-auto justify-center gap-2.5"
            >
              <FaWhatsapp className="h-5 w-5 text-pitch-600 dark:text-pitch-400" aria-hidden="true" />
              <span>Ask Coach on WhatsApp</span>
            </a>
          </div>

          {/* Trust reassurance cards / pills */}
          <div
            className={`mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-line pt-8 text-left ${fade}`}
            style={{ animationDelay: '400ms' }}
          >
            {TRUST_POINTS.map((tp) => {
              const Icon = tp.icon
              return (
                <div
                  key={tp.text}
                  className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-600 dark:bg-gold-400/10 dark:text-gold-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-fg-body leading-tight">
                    {tp.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Micro reassuring footer note */}
          <p
            className={`mt-6 text-xs text-fg-3 ${fade}`}
            style={{ animationDelay: '500ms' }}
          >
            One-time transparent pricing. Lifetime access to your unlocked weeks. No recurring surprises.
          </p>
        </div>
      </div>
    </section>
  )
}