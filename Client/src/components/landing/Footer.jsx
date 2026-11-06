import { Link } from 'react-router-dom'
import LogoMark from '../LogoMark.jsx'
import { MapPin, Mail, ShieldCheck } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_NUMBER = '919361405307'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Coach Prasanth, I have an enquiry about Vanakkam Soccer.')}`

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'All Courses' },
  { to: '/about', label: 'About Coach Prasanth' },
  { to: '/contact', label: 'Contact Support' },
  { to: '/login', label: 'Player Login' },
  { to: '/register', label: 'Create Account' },
]

const COURSES = [
  { to: '/courses', label: 'Beginner Ball Mastery' },
  { to: '/courses', label: 'Advanced Dribbling & 1v1' },
  { to: '/courses', label: 'Match Finishing & Shooting' },
  { to: '/courses', label: 'Tactical Game Vision' },
]

const LEGAL = [
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms and Conditions' },
  { href: '#', label: 'Refund Policy' },
]

const FOOTER_SKILLS = [
  'Grassroots to Glory',
  'Tamil & English Drills',
  'Weekly 7-Day Habit Unlock',
  '1v1 Ball Mastery',
  'Tactical Vision & Game IQ',
  'Train on Any Ground',
  '79.9K+ YouTube Community',
  'Coach Prasanth Mentorship',
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-page text-fg border-t border-line transition-colors duration-300">
      {/* Top Scrolling Values Ticker matching Hero */}
      <div
        className="relative overflow-hidden border-b border-line bg-surface py-3.5 motion-reduce:overflow-x-auto"
        aria-label="Academy Core Values"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface to-transparent motion-reduce:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface to-transparent motion-reduce:hidden"
        />

        <div className="flex w-max animate-marquee will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {FOOTER_SKILLS.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2.5 whitespace-nowrap pl-8 text-xs font-bold uppercase tracking-wider text-fg-body sm:pl-12"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="container-page py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 no-underline hover:no-underline group">
              <LogoMark className="h-10 w-9 transition-transform duration-300 group-hover:scale-105" />
              <span className="flex flex-col leading-none">
                <span className="font-display font-black text-2xl uppercase tracking-wider text-fg">
                  Vanakkam
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="h-[2px] w-4 rounded bg-gold-400" />
                  <span className="font-display font-extrabold text-[0.68rem] uppercase tracking-[0.45em] text-gold-600 dark:text-gold-400">
                    Soccer
                  </span>
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-2">
              Grassroots to glory football training engineered for passionate players across Tamil Nadu and India. Structured weekly video drills taught in Tamil and English.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://youtube.com/@vanakkamsoccer"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline inline-flex items-center gap-2 text-xs font-semibold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-red-500" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube</span>
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-primary inline-flex items-center gap-2 text-xs font-bold shadow-glow"
              >
                <FaWhatsapp className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer Navigation" className="md:col-span-3">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="inline-block text-sm text-fg-2 transition-colors duration-200 hover:text-gold-600 dark:hover:text-gold-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Programs */}
          <div className="md:col-span-3">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
              Featured Programs
            </p>
            <ul className="mt-4 space-y-2.5">
              {COURSES.map((c, i) => (
                <li key={i}>
                  <Link
                    to={c.to}
                    className="inline-block text-sm text-fg-2 transition-colors duration-200 hover:text-gold-600 dark:hover:text-gold-400"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust / Grassroots Location */}
          <div className="md:col-span-2">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
              Academy Base
            </p>
            <div className="mt-4 space-y-3 text-xs text-fg-2">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-pitch-600 dark:text-pitch-400 mt-0.5" />
                <span>Tamil Nadu, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
                <span>coach@vanakkamsoccer.com</span>
              </p>
              <div className="rounded-xl border border-line bg-surface p-2.5 text-[11px] text-fg-3 shadow-sm flex items-center gap-2 mt-3">
                <ShieldCheck className="h-4 w-4 text-pitch-600 dark:text-pitch-400 shrink-0" />
                <span>Official Razorpay Verified Merchant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-center sm:flex-row sm:text-left text-xs text-fg-3">
          <p>
            © {new Date().getFullYear()} Vanakkam Soccer Academy. Dedicated to grassroots football development.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
