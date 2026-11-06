const POINTS = [
  'Week 1 unlocks as soon as you enrol',
  'A new lesson every 7 days',
  'English and Tamil coaching',
  'Watch on phone, tablet or computer',
]

/* Shared layout for Login and Register: brand panel on the left (large screens), form on the right */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="grid min-h-[calc(100dvh-var(--nav-h,64px))] lg:grid-cols-[1fr_1.1fr] bg-page text-fg-body transition-colors duration-300">
      {/* Brand panel (hidden on mobile, visible on desktop) */}
      <aside className="section-dark hero-bg hidden flex-col justify-between p-12 lg:flex xl:p-16 min-h-full border-r border-white/10">
        <div className="flex flex-col justify-between min-h-full pt-12">
          <div>
            <h2 className="max-w-md font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Your weekly football plan <span className="text-gradient">starts here</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map((p, i) => (
                <li
                  key={p}
                  className="flex animate-fade-up items-center gap-3 text-ink-200 text-sm font-medium"
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-950 font-black">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-400 mt-auto pt-8">Structured football training in English and Tamil.</p>
        </div>
      </aside>

      {/* Form side (responsive for all screens, full scrolling support on mobile) */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-md animate-fade-up my-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-fg">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-fg-3 leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="mt-6 sm:mt-8">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-xs sm:text-sm text-fg-3">
              {footer}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
