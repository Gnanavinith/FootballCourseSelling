import { Link } from 'react-router-dom'
import LogoMark, { BrandLogo } from '../LogoMark.jsx'
import { MapPin, Mail, ShieldCheck } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_NUMBER = '919361405307'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Coach Prasanth, I have an enquiry about Vanakkam Soccer.')}`

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'All courses' },
  { to: '/about', label: 'About Coach Prasanth' },
  { to: '/contact', label: 'Contact support' },
  { to: '/login', label: 'Player login' },
  { to: '/register', label: 'Create account' },
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

const linkClass =
  'text-sm text-fg-2 no-underline transition-colors duration-200 hover:text-fg hover:no-underline'

const headingClass = 'mb-4 font-display text-sm font-bold text-fg'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface text-fg">
      <div className="container-page py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <BrandLogo
              to="/"
              size="lg"
              textColor="text-fg"
              subtitleColor="text-gold-600 dark:text-gold-400"
            />

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-2">
              Football training for passionate players across Tamil Nadu and India.
              Structured weekly video drills taught in Tamil and English.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://youtube.com/@vanakkamsoccer"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-red-500" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
              >
                <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation" className="col-span-1 lg:col-span-2">
            <h4 className={headingClass}>Explore</h4>
            <ul className="space-y-3">
              {NAV.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Programs */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className={headingClass}>Featured programs</h4>
            <ul className="space-y-3">
              {COURSES.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} className={linkClass}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-3">
            <h4 className={headingClass}>Contact</h4>
            <ul className="space-y-3 text-sm text-fg-2">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                <span>Tamil Nadu, India</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                <a href="mailto:coach@vanakkamsoccer.com" className={linkClass}>
                  coach@vanakkamsoccer.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                <span>Razorpay verified merchant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vanakkam Soccer Academy. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="no-underline transition-colors hover:text-fg hover:no-underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}