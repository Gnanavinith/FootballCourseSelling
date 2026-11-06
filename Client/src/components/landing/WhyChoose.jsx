const icon = {
  viewBox: '0 0 24 24',
  className: 'h-5 w-5',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const left = [
  {
    title: 'Structured learning',
    text: 'Structured weekly learning with a clear schedule.',
    icon: <path d="M4 5h16M4 12h16M4 19h10" />,
  },
  {
    title: 'Video demonstrations',
    text: 'Video-based demonstrations for each lesson.',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9.5 5 2.5-5 2.5z" />
      </>
    ),
  },
]

const right = [
  {
    title: 'Flexible access',
    text: 'Flexible access on supported devices.',
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  {
    title: 'Your student account',
    text: 'Access to purchased courses through your student account.',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
      </>
    ),
  },
]

function Feature({ title, text, children }) {
  return (
    <li className="card card-dark card-hover flex flex-col items-center gap-3 p-5 text-center">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pitch-500/20 text-pitch-300 ring-1 ring-pitch-400/40">
        <svg {...icon}>{children}</svg>
      </span>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm opacity-80">{text}</p>
    </li>
  )
}

export default function WhyChoose({
  image = '/images/programme.jpg', // replace with your image
  imageAlt = 'Students learning on the programme',
}) {
  return (
    <section className="section-dark hero-bg section">
      <div className="container-page">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge badge-gold">The programme</span>
          <h2 className="mt-4 !text-white">Why choose this programme</h2>
          <p className="text-lead mt-4">
            Everything you need to learn, practise and improve, in one place.
          </p>
        </div>

        {/* Features + image */}
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          <ul className="grid gap-4">
            {left.map((f) => (
              <Feature key={f.title} title={f.title} text={f.text}>
                {f.icon}
              </Feature>
            ))}
          </ul>

          {/* Center image with offset block */}
          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:w-80">
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl bg-pitch-500/30"
              aria-hidden="true"
            />
            <img
              src={image}
              alt={imageAlt}
              className="relative aspect-[4/5] w-full rounded-xl object-cover"
            />
          </div>

          <ul className="grid gap-4">
            {right.map((f) => (
              <Feature key={f.title} title={f.title} text={f.text}>
                {f.icon}
              </Feature>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <a href="/courses" className="btn btn-gold">
            View courses
          </a>
        </div>
      </div>
    </section>
  )
}