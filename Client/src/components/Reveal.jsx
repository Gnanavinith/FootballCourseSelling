import { useInView } from '../hooks/useInView.js'

/* Wraps content so it fades up when it scrolls into view.
   <Reveal delay={100}>...</Reveal>   (delay in milliseconds, for staggering) */
export default function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView(0.15)
  return (
    <div
      ref={ref}
      className={`${inView ? 'animate-fade-up' : 'opacity-0'} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
