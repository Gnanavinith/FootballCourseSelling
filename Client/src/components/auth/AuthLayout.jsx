import { BrandLogo } from '../LogoMark.jsx'

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
      <aside className="hidden flex-col justify-between p-12 lg:flex xl:p-16 min-h-full border-r border-line bg-surface text-fg">
        <div className="flex flex-col justify-between min-h-full pt-8">
          <div>
            <div className="mb-6">
              <BrandLogo to="/" size="lg" />
            </div>
            <h2 className="max-w-md font-display font-black text-3xl sm:text-4xl text-fg tracking-tight leading-tight">
              Your weekly football plan{' '}
              <span className="text-gold-600 dark:text-gold-400">starts here</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map((p, i) => (
                <li
                  key={p}
                  className="flex animate-fade-up items-center gap-3 text-fg-body text-sm font-medium"
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-950 font-black">
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

          <p className="text-xs text-fg-3 mt-auto pt-8">Structured football training in English and Tamil.</p>
        </div>
      </aside>

      {/* Form side (responsive for all screens, full scrolling support on mobile) */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-md animate-fade-up my-auto rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandLogo to="/" size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-fg">
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
