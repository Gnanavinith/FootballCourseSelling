import { useInView } from '../../hooks/useInView.js'

export default function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView(0.15)
  return (
    <div
      ref={ref}
      className={`${inView ? 'animate-fade-up' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
