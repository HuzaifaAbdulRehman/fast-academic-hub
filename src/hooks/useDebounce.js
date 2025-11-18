import { useState, useEffect } from 'react'

/**
 * Debounces a value to prevent excessive updates
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {any} - Debounced value
 */
export function useDebounce(value, delay = 150) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up timer on value change or unmount
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
