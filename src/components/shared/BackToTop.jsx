import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import { vibrate } from '../../utils/uiHelpers'

/**
 * Professional Back to Top button (Instagram-style)
 * - Smooth slide-in/slide-out animations
 * - Appears when scrolling down past threshold
 * - Hides when scrolling up or near top
 * - Debounced scroll detection for smoothness
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef(null)
  const scrollThreshold = 150 // Minimum scroll before showing
  const scrollDelta = 10 // Minimum scroll difference to trigger change

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop
          const scrollDiff = currentScrollY - lastScrollY.current

          // Clear any pending timeout
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current)
          }

          // Only react to significant scroll changes (reduces jitter)
          if (Math.abs(scrollDiff) > scrollDelta) {
            if (currentScrollY < scrollThreshold) {
              // Near top - hide
              setIsVisible(false)
            } else if (scrollDiff > 0) {
              // Scrolling DOWN - show with slight delay for smoothness
              scrollTimeout.current = setTimeout(() => {
                setIsVisible(true)
              }, 50)
            } else {
              // Scrolling UP - hide immediately for responsiveness
              setIsVisible(false)
            }

            lastScrollY.current = currentScrollY
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  // Handle mount/unmount animation
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    } else {
      // Delay unmount to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const scrollToTop = useCallback(() => {
    vibrate(10)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  if (!shouldRender) return null

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-50
        top-[4.5rem] left-1/2
        flex items-center gap-1.5
        px-3 py-1.5
        bg-dark-surface/95 hover:bg-dark-surface-raised
        backdrop-blur-md
        border border-dark-border/50 hover:border-accent/50
        rounded-full
        text-content-secondary hover:text-accent
        shadow-xl shadow-black/25
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:shadow-accent/20
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-dark-bg
        ${isVisible
          ? 'opacity-100 -translate-x-1/2 translate-y-0'
          : 'opacity-0 -translate-x-1/2 -translate-y-4 pointer-events-none'
        }
      `}
      aria-label="Back to top"
      title="Scroll to top"
    >
      <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="text-xs font-medium">Top</span>
    </button>
  )
}
