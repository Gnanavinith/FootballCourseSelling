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

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-100 text-ink-900 border-t border-slate-200 transition-colors duration-300 dark:bg-[#05070b] dark:border-white/10 dark:text-white">
      {/* Subtle top stadium glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-32 w-full max-w-4xl bg-gold-400/[0.08] dark:bg-gold-400/[0.03] blur-[100px]"
      />

      <div className="container-page py-14 sm:py-18 relative z-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 no-underline hover:no-underline group">
              <LogoMark className="h-10 w-9 transition-transform duration-300 group-hover:scale-105" />
              <span className="flex flex-col leading-none">
                <span className="font-display font-black text-2xl uppercase tracking-wider text-ink-950 dark:text-white">
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

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              Grassroots to glory football training engineered for passionate players across Tamil Nadu and India. Structured weekly video drills taught in Tamil and English.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://youtube.com/@vanakkamsoccer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-800 shadow-sm transition-all hover:border-gold-500 hover:text-gold-700 dark:border-white/15 dark:bg-white/[0.03] dark:text-white dark:hover:border-gold-400 dark:hover:bg-gold-400/10 dark:hover:text-gold-300"
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
                className="inline-flex items-center gap-2 rounded-full border border-pitch-500/30 bg-pitch-500/10 px-3.5 py-1.5 text-xs font-semibold text-pitch-700 transition-all hover:bg-pitch-500/20 dark:text-pitch-300"
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
                    className="inline-block text-sm text-ink-600 transition-colors duration-200 hover:text-ink-950 dark:text-ink-300 dark:hover:text-white"
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
                    className="inline-block text-sm text-ink-600 transition-colors duration-200 hover:text-gold-600 dark:text-ink-300 dark:hover:text-gold-400"
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
            <div className="mt-4 space-y-3 text-xs text-ink-600 dark:text-ink-300">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-pitch-600 dark:text-pitch-400 mt-0.5" />
                <span>Tamil Nadu, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
                <span>coach@vanakkamsoccer.com</span>
              </p>
              <div className="rounded-xl border border-slate-300/80 bg-white p-2.5 text-[11px] text-ink-600 shadow-sm flex items-center gap-2 mt-3 dark:border-white/10 dark:bg-white/[0.02] dark:text-ink-400">
                <ShieldCheck className="h-4 w-4 text-pitch-600 dark:text-pitch-400 shrink-0" />
                <span>Official Razorpay Verified Merchant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-center sm:flex-row sm:text-left text-xs text-ink-500 dark:border-white/10 dark:text-ink-400">
          <p>
            © {new Date().getFullYear()} Vanakkam Soccer Academy. Dedicated to grassroots football development.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-ink-950 dark:hover:text-white transition-colors"
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
