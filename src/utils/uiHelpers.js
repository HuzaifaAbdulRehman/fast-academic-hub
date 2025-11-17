// UI Helper utilities used across components

/**
 * Trigger haptic feedback on supported devices
 * @param {number|number[]} pattern - Vibration pattern in milliseconds
 */
export function vibrate(pattern = [10]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/**
 * Check if device is mobile based on screen width
 * @param {number} breakpoint - Width breakpoint in pixels (default: 768)
 * @returns {boolean} True if device is mobile
 */
export function isMobile(breakpoint = 768) {
  return window.innerWidth < breakpoint
}

/**
 * Check if device is touch-enabled
 * @returns {boolean} True if device supports touch
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Prevent default touch behavior (useful for custom gestures)
 * @param {TouchEvent} e - Touch event
 */
export function preventDefaultTouch(e) {
  if (e.cancelable) {
    e.preventDefault()
  }
}

/**
 * Get scroll position of element or window
 * @param {HTMLElement} element - Element to get scroll position (default: window)
 * @returns {{x: number, y: number}} Scroll position
 */
export function getScrollPosition(element = null) {
  if (element) {
    return {
      x: element.scrollLeft,
      y: element.scrollTop
    }
  }

  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  }
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} target - Element or selector to scroll to
 * @param {Object} options - Scroll options
 */
export function smoothScrollTo(target, options = {}) {
  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target

  if (!element) return

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options
  })
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
