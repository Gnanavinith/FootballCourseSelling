const focusAreas = [
  {
    title: 'First-Touch Composure',
    text: 'A clean first touch buys you two full seconds of decision time. Kill high balls and cushioned passes instantly under pressure.',
  },
  {
    title: 'Fearless 1v1 Feints',
    text: 'Drop your shoulder, shift body weight, and burst past defenders with balance, deception, and razor-sharp agility.',
  },
  {
    title: 'Pinpoint Passing Weight',
    text: 'Deliver passes that eliminate entire defensive lines. Master ground weight, timing, and split-second vision.',
  },
  {
    title: 'Mental Grit & Match IQ',
    text: 'Stay ice-cold when defenders press you hard. Read the space ahead of you and make the winning play every single time.',
  },
]

export default function CoachIntro() {
  return (
    <section className="relative overflow-hidden bg-white text-ink-950 py-16 sm:py-24 border-t border-slate-200 transition-colors duration-300 dark:bg-[#06090e] dark:border-white/5 dark:text-white">
      {/* Stadium ambiance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gold-400/[0.04] blur-[120px]"
      />

      <div className="container-page relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Video Reel Portrait */}
          <div className="relative mx-auto w-full max-w-xs lg:col-span-5">
            {/* Glowing aura */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rounded-[2.5rem] opacity-70 blur-2xl transition duration-500 hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at 20% 10%, rgba(245, 158, 11, 0.35), transparent 60%), radial-gradient(circle at 90% 100%, rgba(16, 185, 129, 0.25), transparent 60%)',
              }}
            />

            {/* Video frame with subtle stadium border */}
            <div
              className="video-frame overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl ring-1 ring-slate-200/50 dark:border-white/15 dark:bg-ink-900 dark:shadow-pop dark:ring-white/10"
              style={{ aspectRatio: '9 / 16' }}
            >
              <iframe
                src="https://www.youtube.com/embed/QAx8EQRtwuU?autoplay=1&mute=1&playsinline=1&rel=0"
                title="Coach Prasanth introduction"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating Credential Tag */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold-500/40 bg-white/95 px-4 py-1.5 text-xs font-bold text-gold-700 shadow-md backdrop-blur-md dark:border-gold-400/40 dark:bg-ink-950/90 dark:text-gold-300">
              ⚽ Coach Prasanth • 79.9K+ Ballers Mentored
            </div>
          </div>

          {/* Right: Emotional Story & Philosophy */}
          <div className="lg:col-span-7">
            <span className="badge badge-gold mb-3 inline-flex">
              Your Head Trainer
            </span>

            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink-950 dark:text-white sm:text-4xl lg:text-5xl">
              "Your Background Doesn't Define You.
              <span className="text-gradient block font-black">
                Your Training Does."
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-ink-700 dark:text-ink-200 leading-relaxed font-medium">
              Growing up, I saw talented players drop out of football simply because professional coaching was locked behind unaffordable academy fees or spoken in languages that felt disconnected.
            </p>

            <p className="mt-3 text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
              I created Vanakkam Soccer to bring elite, modern European and Indian match techniques straight to your local ground, terrace, or school field—taught warmly in Tamil and English with zero fluff. If you bring the hunger, I will give you the roadmap to become unstoppable.
            </p>

            {/* Focus Areas 2x2 Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {focusAreas.map((item, i) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-slate-200/90 bg-slate-50 p-5 shadow-sm transition-all duration-300 hover:border-gold-400/50 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-md dark:hover:border-gold-400/40 dark:hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-gold-500 to-gold-300 font-display text-xs font-black text-ink-950 shadow-sm">
                      0{i + 1}
                    </span>
                    <h3 className="font-display text-sm font-bold text-ink-950 group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Coach Quote Signature */}
            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-700 dark:bg-gold-400/10 dark:border-gold-400/30 dark:text-gold-400 font-display font-extrabold text-lg">
                P
              </div>
              <div>
                <p className="font-display font-bold text-ink-950 dark:text-white text-sm">Coach Prasanth</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">Founder & Head Coach, Vanakkam Soccer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
