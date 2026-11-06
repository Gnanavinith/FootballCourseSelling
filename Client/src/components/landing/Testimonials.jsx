const reviews = [
  {
    name: "Vignesh S.",
    role: "Winger, 16 yrs • Chennai",
    tag: "District Squad Selection",
    body: "Before Coach Prasanth's drills, I used to panic whenever defenders pressed me. The Week 2 and Week 3 first-touch drills gave me immense composure. Last month, I was selected for my district team squad!",
    stars: 5,
  },
  {
    name: "Kavitha & Ramesh",
    role: "Parents of Aarav (12 yrs) • Coimbatore",
    tag: "Parent Story",
    body: "Our son used to stay glued to phone screens. After joining Vanakkam Soccer, he is on the ground every evening practicing his touches. His stamina, confidence, and discipline have transformed completely.",
    stars: 5,
  },
  {
    name: "Mohammed Faizal",
    role: "Midfielder, 19 yrs • Madurai",
    tag: "Turf League MVP",
    body: "Finding world-class football training explained in Tamil was impossible until Coach Karthik started this. He breaks down the exact body mechanics so simply. My passing vision has reached another level.",
    stars: 5,
  },
  {
    name: "Sanjay Kumar",
    role: "Captain, School Team • Salem",
    tag: "School Champions",
    body: "The 7-day unlock system forced me to be disciplined. Instead of watching random short clips and forgetting them, I drilled one skill every week until it became pure muscle memory.",
    stars: 5,
  },
  {
    name: "Dinesh R.",
    role: "Forward, 21 yrs • Bengaluru",
    tag: "6 Goals in 4 Games",
    body: "Coach Karthik's finishing drills on balance, hip positioning, and picking the far corner changed my game. Scored six goals in four league matches. Best football investment I have ever made.",
    stars: 5,
  },
  {
    name: "Preethi S.",
    role: "Attacking Midfielder, 17 yrs • Tirunelveli",
    tag: "Fearless 1v1",
    body: "The 1v1 feints and tight-space control drills are pure gold. Even when playing against older, physically stronger players, I now protect the ball with complete calm.",
    stars: 5,
  },
];

const firstRow = reviews.slice(0, 3);
const secondRow = reviews.slice(3, 6);

function ReviewCard({ name, role, tag, body }) {
  return (
    <div className="relative h-full w-80 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all duration-300 hover:border-gold-500/50 hover:-translate-y-1 hover:shadow-md">
      {/* Star rating */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex text-gold-500 dark:text-gold-400 text-xs tracking-wider" aria-label="5 out of 5 stars">
          ★★★★★
        </div>
        <span className="rounded-full bg-pitch-500/15 px-2.5 py-0.5 text-[10px] font-bold text-pitch-700 dark:text-pitch-400 border border-pitch-500/20">
          {tag}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-fg-body leading-relaxed line-clamp-4 italic">
        "{body}"
      </p>

      <div className="mt-4 pt-3 border-t border-line flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 text-ink-950 font-display font-bold text-xs shadow-sm">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-fg">{name}</p>
          <p className="truncate text-[11px] text-fg-3">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-page text-fg py-14 sm:py-20 border-b border-line">
      <div className="container-page">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge badge-gold mb-3 inline-flex">
            Grassroots Stories
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl lg:text-5xl">
            From The Local Ground{" "}
            <span className="text-gold-600 dark:text-gold-400 block sm:inline">
              To The Scoreboard
            </span>
          </h2>
          <p className="mt-3 text-sm text-fg-2 sm:text-base leading-relaxed">
            Real players. Dedicated parents. Real breakthroughs on match day.
          </p>
        </div>

        {/* Marquee Tracks */}
        <div className="relative mt-12 flex w-full flex-col items-center justify-center overflow-hidden">
          {/* Row 1 */}
          <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused] motion-reduce:animate-none py-1">
            {[...firstRow, ...firstRow, ...firstRow].map((r, i) => (
              <ReviewCard key={`r1-${i}`} {...r} />
            ))}
          </div>

          {/* Row 2 (reverses) */}
          <div
            className="mt-5 flex w-max gap-5 hover:[animation-play-state:paused] motion-reduce:animate-none py-1"
            style={{ animation: "marquee 32s linear infinite reverse" }}
          >
            {[...secondRow, ...secondRow, ...secondRow].map((r, i) => (
              <ReviewCard key={`r2-${i}`} {...r} />
            ))}
          </div>

          {/* Side Fade Gradients for Seamless Look */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-page to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-page to-transparent z-10" />
        </div>
      </div>
    </section>
  );
}
