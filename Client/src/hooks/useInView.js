import { useEffect, useRef, useState } from 'react'

/* Returns [ref, inView]. inView becomes true once, the first time the element is on screen.
   Used to start fade-in animations only when the visitor can see them.

   Safer than before:
   - if the element is already on screen when the page loads (or after a refresh that keeps the
     scroll position), it shows straight away instead of waiting for an observer event
   - the threshold is lowered for very tall elements, so they can never get stuck invisible
   - without IntersectionObserver support the element simply shows */
export function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true)
      return
    }
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }

    // never ask for more visible area than about 40% of the screen
    const t = Math.min(threshold, (window.innerHeight * 0.4) / Math.max(rect.height, 1))

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: t }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return [ref, inView]
}
