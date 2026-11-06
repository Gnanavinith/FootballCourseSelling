import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WA = 'https://wa.me/919361405307'
const TEL = 'tel:+919361405307'

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

export default function FloatingContact() {
  const [showBar, setShowBar] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className={`floating-contact fixed right-3.5 sm:right-6 z-40 flex flex-col gap-2.5 sm:gap-3 transition-all ${showBar ? "bottom-24" : "bottom-5 sm:bottom-6"}`}>
      <a href={TEL} aria-label="Call us" className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-lg transition hover:bg-gold-300">
        <PhoneIcon />
      </a>
      <a href={WA} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-pitch-600 text-white shadow-lg transition hover:bg-pitch-700">
        <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" />
      </a>
    </div>
  )
}
