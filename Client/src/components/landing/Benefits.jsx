import { FaRoute, FaLanguage, FaFutbol, FaUnlockAlt } from 'react-icons/fa'

const benefits = [
  {
    icon: <FaRoute className="h-6 w-6" aria-hidden="true" />,
    badge: "Structured Roadmap",
    title: "Weekly Progressive Drills",
    text: "No more wandering on the ground wondering what to practice. Follow an elite step-by-step roadmap that builds technical muscle memory week by week.",
  },
  {
    icon: <FaLanguage className="h-7 w-7" aria-hidden="true" />,
    badge: "Language of the Heart",
    title: "Coached in Tamil & English",
    text: "Football concepts broken down in relatable, everyday language. Understand the exact biomechanics and tactical reasons behind every drill.",
  },
  {
    icon: <FaFutbol className="h-6 w-6" aria-hidden="true" />,
    badge: "Grassroots Friendly",
    title: "Train on Any Ground, Anytime",
    text: "No expensive academy fees or luxury turf needed. Grab your ball, find 30 minutes on your local ground or terrace, and improve every day.",
  },
  {
    icon: <FaUnlockAlt className="h-6 w-6" aria-hidden="true" />,
    badge: "Discipline Builder",
    title: "The 7-Day Habit Unlock",
    text: "New modules unlock only every 7 days so you don't rush or skip fundamentals. We don't sell shortcuts; we build genuine champions.",
  },
]

export default function Benefits() {
  return (
    <section className="relative overflow-hidden bg-page text-fg py-14 sm:py-20 border-b border-line">
      {/* Background ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[50rem] rounded-full bg-gold-400/[0.04] blur-[140px]"
      />

      <div className="container-page relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge badge-gold mb-3 inline-flex">
            The Vanakkam Advantage
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl lg:text-5xl">
            Why Dedicated Ballers{" "}
            <span className="text-gold-600 dark:text-gold-400 block sm:inline">
              Train With Us
            </span>
          </h2>
          <p className="mt-4 text-sm text-fg-2 sm:text-base leading-relaxed">
            Most young players plateau because they practice aimlessly without feedback. Our system provides the exact disciplined structure used by professional academies.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all duration-300 hover:border-gold-500/50 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
            >
              {/* Gold Top Accent Line */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gold-500 transition-transform duration-500 group-hover:scale-x-100"
              />

              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                    {b.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 dark:text-gold-400 border border-gold-500/30 dark:border-gold-400/30 rounded-full px-2.5 py-0.5 bg-gold-500/5 dark:bg-gold-400/5">
                    {b.badge}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-fg group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {b.title}
                </h3>
                <p className="mt-2.5 text-xs text-fg-2 leading-relaxed sm:text-sm">
                  {b.text}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center gap-1.5 text-xs font-semibold text-pitch-600 dark:text-pitch-400">
                <span className="h-1.5 w-1.5 rounded-full bg-pitch-500 animate-pulse" />
                <span>Field-tested curriculum</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}