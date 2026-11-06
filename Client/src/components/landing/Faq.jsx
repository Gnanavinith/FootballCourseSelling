import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../../config/site.js'

const faqs = [
  {
    q: 'Who can join these courses?',
    a: 'Any player with the hunger to improve. Whether you are an 11-year-old dreaming of school team selection, an 18-year-old preparing for club trials, or a weekend turf league player wanting sharper control. No previous academy background is required.',
  },
  {
    q: 'How does the weekly unlock schedule work?',
    a: 'The moment your enrolment is confirmed, Week 1 unlocks instantly so you can start drilling today. Each subsequent week unlocks exactly 7 days later. This structured pacing ensures you build muscle memory and true mastery without rushing.',
  },
  {
    q: 'What equipment or ground do I need to practice?',
    a: 'Just a football and a few markers (cones, water bottles, or shoes). The drills are specifically engineered for grassroots conditions: local dirt grounds, park turf, school fields, or even home terraces.',
  },
  {
    q: 'Are the drills taught in Tamil or English?',
    a: 'Both. Coach Prasanth explains every drill with bilingual commentary in natural Tamil and English. You get clear, friendly local explanations alongside standard international football terminology.',
  },
  {
    q: 'Can I watch the video lessons on my mobile phone?',
    a: 'Yes, 100%. The site works seamlessly on Android, iPhone, tablet, and laptop. You can easily take your phone to the ground, prop it up, review the drill angles, and practice immediately.',
  },
  {
    q: 'What payment methods are supported and is it secure?',
    a: 'We support all major payment modes including UPI (Google Pay, PhonePe, Paytm), all debit/credit cards, and net banking via Razorpay with 256-bit bank-grade encryption. Week 1 access is granted instantly.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

function FaqItem({ index, q, a, open, onToggle }) {
  const buttonId = `faq-button-${index}`
  const panelId = `faq-panel-${index}`

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        open
          ? 'border-gold-500/50 bg-amber-50/40 shadow-sm dark:border-gold-400/50 dark:bg-white/[0.05] dark:shadow-card'
          : 'border-slate-200/90 bg-slate-50/80 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20'
      }`}
    >
      <h3 className="text-base font-bold tracking-normal">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 p-5 text-left font-display text-ink-950 dark:text-white transition-colors cursor-pointer"
        >
          <span className="text-sm sm:text-base font-bold">{q}</span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
              open
                ? 'rotate-45 bg-gold-400 text-ink-950 shadow-glow'
                : 'bg-slate-200 text-ink-700 dark:bg-white/10 dark:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed border-t border-slate-200/80 dark:border-white/5 pt-3">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="relative overflow-hidden bg-white text-ink-950 py-16 sm:py-24 border-t border-slate-200 transition-colors duration-300 dark:bg-[#06090e] dark:border-white/5 dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 items-start">
          {/* Heading and Coach Help Card */}
          <div className="self-start lg:sticky lg:top-28">
            <span className="badge badge-gold mb-3 inline-flex">
              Clear Answers
            </span>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink-950 dark:text-white sm:text-4xl lg:text-5xl">
              Frequently Asked
              <span className="text-gradient block font-black">
                Questions
              </span>
            </h2>
            <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 sm:text-base leading-relaxed">
              Everything you need to know about the weekly unlocks, practice requirements, and training philosophy.
            </p>

            {/* Direct Coach Help Card */}
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 via-amber-50/50 to-white dark:border-gold-400/30 dark:bg-gradient-to-br dark:from-gold-400/10 dark:via-white/[0.02] dark:to-transparent p-6 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-3 w-3 rounded-full bg-pitch-500 animate-ping" />
                <p className="font-display text-base font-bold text-ink-950 dark:text-white">Need Personal Advice?</p>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Not sure which course matches your age or current skill level? Chat with Coach Prasanth directly on WhatsApp for personalized guidance.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-md btn-green text-xs font-bold justify-center"
                >
                  Chat on WhatsApp →
                </a>
                <Link to="/contact" className="btn btn-md border border-slate-300 bg-white text-ink-800 hover:bg-slate-100 dark:btn-outline-light text-xs font-bold justify-center">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {faqs.map((f, i) => (
              <FaqItem
                key={f.q}
                index={i}
                q={f.q}
                a={f.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
