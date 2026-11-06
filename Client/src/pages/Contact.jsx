import { Link } from 'react-router-dom'
import EnquiryForm from '../components/forms/EnquiryForm.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

/* ------------------------------------------------------------------ */
/* Existing contact data (unchanged)                                   */
/* ------------------------------------------------------------------ */

const CONTACT = {
  phone: '',
  whatsapp: '919361405307',
  email: 'coach@vanakkamsoccer.com',
  youtube: 'https://www.youtube.com/@vanakkamsoccer',
}

const LOCATION = {
  address: 'Chennai, Tamil Nadu, India',
  mapQuery: 'Chennai, Tamil Nadu, India',
  embedUrl: '',
  hours: 'Mon to Sat, 6 AM to 8 PM',
}

const FAQS = [
  { q: 'How soon will I get a reply?', a: 'We reply to every message within one business day.' },
  { q: 'How do I create an account and buy a course?', a: 'Click Register, create your account, choose a course and pay securely with Razorpay.' },
  { q: 'Which payment methods can I use?', a: 'UPI, cards and net banking are accepted. On a computer, UPI shows a QR code you can scan with any UPI app.' },
  { q: 'When does Week 1 unlock?', a: 'Straight after your payment is confirmed.' },
  { q: 'How does the weekly access work?', a: 'A new week unlocks every 7 days. Each week stays open for seven days, then locks as the next one opens.' },
  { q: 'Are the lessons in Tamil or English?', a: 'Both. Each course shows its language on the course card, so you can pick the one you prefer.' },
  { q: 'I forgot my password.', a: 'Use the Forgot password link on the login page and we will email you a reset link.' },
  { q: 'I paid but I cannot see my course.', a: 'Check your dashboard first. If Week 1 is still not open after a few minutes, message us with your order ID from the Payments page.' },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Display only: "919361405307" -> "+91 93614 05307". Falls back to the raw number.
const formatWhatsapp = (n) =>
  /^91\d{10}$/.test(n) ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : `+${n}`

/*
  Restyles the EXISTING <EnquiryForm /> (fields, validation and API call stay untouched)
  into minimal underline inputs. Pure Tailwind variants, so it follows your gold token
  and light/dark theme automatically.
*/
const formSkin = [
  // inputs: underline only
  '[&_input]:!rounded-none [&_input]:!border-0 [&_input]:!border-b [&_input]:!border-line [&_input]:!bg-transparent [&_input]:!px-0 [&_input]:!shadow-none [&_input]:!ring-0 [&_input]:!outline-none [&_input]:text-sm sm:[&_input]:text-base [&_input]:transition-colors [&_input]:duration-300',
  '[&_textarea]:!rounded-none [&_textarea]:!border-0 [&_textarea]:!border-b [&_textarea]:!border-line [&_textarea]:!bg-transparent [&_textarea]:!px-0 [&_textarea]:!shadow-none [&_textarea]:!ring-0 [&_textarea]:!outline-none [&_textarea]:text-sm sm:[&_textarea]:text-base [&_textarea]:transition-colors [&_textarea]:duration-300',
  '[&_select]:!rounded-none [&_select]:!border-0 [&_select]:!border-b [&_select]:!border-line [&_select]:!bg-transparent [&_select]:!px-0 [&_select]:!shadow-none [&_select]:!ring-0 [&_select]:!outline-none [&_select]:text-sm sm:[&_select]:text-base [&_select]:transition-colors [&_select]:duration-300',
  // focus: underline turns gold
  '[&_input:focus]:!border-gold-400 [&_textarea:focus]:!border-gold-400 [&_select:focus]:!border-gold-400',
  // labels: quiet, small
  '[&_label]:text-xs [&_label]:font-medium [&_label]:text-fg-3 [&_label]:transition-colors [&_label]:duration-300',
  '[&_label:focus-within]:text-gold-600 dark:[&_label:focus-within]:text-gold-400',
  // submit: gold pill
  '[&_[type=submit]]:!rounded-full [&_[type=submit]]:!bg-gold-400 [&_[type=submit]]:!px-8 [&_[type=submit]]:!text-sm [&_[type=submit]]:!font-black [&_[type=submit]]:!text-ink-950 [&_[type=submit]]:!shadow-none [&_[type=submit]]:transition-colors [&_[type=submit]]:duration-200 hover:[&_[type=submit]]:!bg-gold-300',
].join(' ')

/* Faint football-pitch line drawing used as the background texture */
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

function InfoRow({ label, children }) {
  return (
    <div className="grid gap-1 border-t border-line py-5 sm:grid-cols-[7.5rem_1fr] sm:items-baseline sm:gap-6">
      <dt className="text-xs text-fg-3">{label}</dt>
      <dd className="break-words text-sm font-semibold leading-snug text-fg sm:text-base">{children}</dd>
    </div>
  )
}

function InfoLink({ href, external = false, children }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group inline-flex items-center gap-2 no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
    >
      <span className="bg-gradient-to-r from-gold-400 to-gold-400 bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px] motion-reduce:transition-none">
        {children}
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-500 motion-reduce:transition-none" aria-hidden="true" />
    </a>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Contact() {
  usePageMeta({ title: 'Contact Academy | Vanakkam Soccer' })

  const mapQuery = encodeURIComponent(LOCATION.mapQuery)
  const embedSrc = LOCATION.embedUrl || `https://www.google.com/maps?q=${mapQuery}&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const showMap = Boolean(LOCATION.embedUrl || LOCATION.mapQuery)

  return (
    <main className="min-h-screen overflow-hidden bg-page font-sans text-fg-body transition-colors duration-300">
      {/* 1. Hero matching Hero.jsx */}
      <section className="relative overflow-hidden border-b border-line bg-surface text-fg py-14 sm:py-20">
        <PitchLines className={`pointer-events-none absolute inset-y-0 right-0 h-full w-full text-fg/[0.04] sm:w-[75%] lg:w-[62%] ${pitchMask}`} />

        <div className="container-page relative z-10">
          <Reveal>
            <span className="badge badge-gold mb-3 inline-flex">
              Support &amp; Inquiries
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-fg">
              Let's talk{' '}
              <span className="text-gold-600 dark:text-gold-400">football.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-fg-2">
              Questions about a course, your account or training? Message Coach Prasanth and the technical team—we reply within one business day.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#enquiry" className="btn btn-lg btn-primary px-8 py-3.5 font-bold shadow-glow">Send a Message</a>
              {CONTACT.whatsapp && (
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg btn-outline inline-flex items-center gap-2 font-bold"
                >
                  <FaWhatsapp className="h-4 w-4 text-pitch-600 dark:text-pitch-400" />
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Contact: details + form */}
      <section className="container-page py-24 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-[5fr_7fr] lg:gap-24">
          <Reveal>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-fg sm:text-4xl">Reach the academy</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-2 sm:text-base">
                Message us on WhatsApp, send an email or use the form. We reply to every message within one business day.
              </p>

              <dl className="mt-10 border-b border-line">
                {CONTACT.phone && (
                  <InfoRow label="Phone">
                    <InfoLink href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</InfoLink>
                  </InfoRow>
                )}
                {CONTACT.whatsapp && (
                  <InfoRow label="WhatsApp">
                    <InfoLink href={`https://wa.me/${CONTACT.whatsapp}`} external>
                      {formatWhatsapp(CONTACT.whatsapp)}
                    </InfoLink>
                  </InfoRow>
                )}
                {CONTACT.email && (
                  <InfoRow label="Email">
                    <InfoLink href={`mailto:${CONTACT.email}`}>{CONTACT.email}</InfoLink>
                  </InfoRow>
                )}
                {LOCATION.address && <InfoRow label="Location">{LOCATION.address}</InfoRow>}
                {LOCATION.hours && <InfoRow label="Hours">{LOCATION.hours}</InfoRow>}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div id="enquiry" className="scroll-mt-24">
              <h2 className="text-2xl font-black tracking-tight text-fg sm:text-4xl">Send a message</h2>
              <div className={`mt-8 ${formSkin}`}>
                <EnquiryForm embedded />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Location */}
      {showMap && (
        <section className="border-t border-line py-24 sm:py-32" aria-labelledby="find-us">
          <div className="container-page grid items-stretch gap-12 lg:grid-cols-[4fr_8fr] lg:gap-16">
            <Reveal>
              <div className="flex h-full flex-col justify-between gap-10">
                <div>
                  <h2 id="find-us" className="text-2xl font-black tracking-tight text-fg sm:text-4xl">Where we train</h2>
                  <p className="mt-5 text-sm font-semibold leading-snug text-fg sm:text-base">{LOCATION.address}</p>
                  {LOCATION.hours && <p className="mt-1 text-xs text-fg-3">{LOCATION.hours}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-primary font-black">
                    Get Directions
                  </a>
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-fg no-underline hover:no-underline"
                  >
                    <span className="bg-gradient-to-r from-gold-400 to-gold-400 bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px] motion-reduce:transition-none">
                      Open in Maps
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-fg-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="h-full">
              <div className="aspect-[4/3] overflow-hidden border border-line bg-surface-2 sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[26rem]">
                <iframe
                  title="Map showing our location"
                  src={embedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="h-full w-full border-0 dark:[filter:invert(90%)_hue-rotate(180deg)_contrast(90%)]"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 4. FAQ */}
      <section className="border-t border-line py-24 sm:py-32" aria-labelledby="faq">
        <div className="container-page grid gap-12 lg:grid-cols-[4fr_8fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <h2 id="faq" className="text-2xl font-black tracking-tight text-fg sm:text-4xl">Frequently asked questions</h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-2 sm:text-base">
                Quick answers on courses, payments, weekly lessons, languages and access.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="border-t border-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-sm font-bold text-fg transition-colors duration-200 hover:text-gold-600 dark:hover:text-gold-400 sm:text-base [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-xl font-light leading-none text-gold-600 transition-transform duration-300 group-open:rotate-45 dark:text-gold-400 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-xl pb-6 text-sm leading-relaxed text-fg-2 sm:text-base">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#111418] text-white">
        <PitchLines className={`pointer-events-none absolute inset-y-0 right-0 h-full w-full text-white/[0.06] sm:w-[70%] ${pitchMask}`} />

        <div className="container-page relative z-10 py-24 sm:py-28">
          <Reveal>
            <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              <span className="block text-white">Ready to start your</span>
              <span className="block text-gold-400">football journey?</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8">
              <Link to="/courses" className="btn btn-lg btn-primary px-8 py-4 font-black">Explore Courses</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
