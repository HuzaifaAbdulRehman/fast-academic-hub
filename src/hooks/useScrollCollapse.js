import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for scroll-based header collapse behavior
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Scroll distance before triggering collapse (default: 50px)
 * @param {boolean} options.enabled - Whether scroll behavior is enabled (default: true)
 * @returns {Object} - { isVisible, isAtTop, scrollDirection }
 */
export function useScrollCollapse({ threshold = 50, enabled = true } = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const [scrollDirection, setScrollDirection] = useState('up')
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const handleScroll = useCallback(() => {
    if (!enabled) return

    const currentScrollY = window.scrollY

    // Check if we're at the top
    setIsAtTop(currentScrollY < 10)

    // Determine scroll direction
    if (currentScrollY > lastScrollY.current) {
      setScrollDirection('down')
    } else if (currentScrollY < lastScrollY.current) {
      setScrollDirection('up')
    }

    // Update visibility based on scroll position and direction
    if (currentScrollY < 10) {
      // Always show when at top
      setIsVisible(true)
    } else if (currentScrollY > threshold) {
      // Show/hide based on scroll direction after threshold
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide
        setIsVisible(false)
      } else {
        // Scrolling up - show
        setIsVisible(true)
      }
    }

    lastScrollY.current = currentScrollY
    ticking.current = false
  }, [enabled, threshold])

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true)
      return
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          handleScroll()
        })
        ticking.current = true
      }
    }

    // Listen to both window and document scroll events
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { passive: true })

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll)
    }
  }, [handleScroll, enabled])

  return {
    isVisible,
    isAtTop,
    scrollDirection
  }
}
