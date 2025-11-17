import { useState, useEffect } from 'react'

/**
 * Validate data structure based on key
 * @param {string} key - LocalStorage key
 * @param {*} data - Parsed data to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateData(key, data) {
  if (data === null || data === undefined) {
    return false
  }

  switch (key) {
    case 'attendance-tracker-courses':
    case 'attendance-tracker-attendance':
    case 'attendance-tracker-semesters':
      // Must be an array
      return Array.isArray(data)

    case 'attendance-tracker-active-semester':
      // Can be null or string
      return data === null || typeof data === 'string'

    case 'attendance-tracker-theme':
      // Must be 'dark' or 'light'
      return data === 'dark' || data === 'light'

    default:
      // For unknown keys, accept any non-null value
      return true
  }
}

/**
 * Create a backup of localStorage data
 * @param {string} key - LocalStorage key
 * @param {*} data - Data to backup
 */
function createBackup(key, data) {
  try {
    const backupKey = `${key}_backup_${Date.now()}`
    const backups = JSON.parse(window.localStorage.getItem(`${key}_backups`) || '[]')

    // Keep only last 3 backups
    const recentBackups = backups.slice(-2)
    recentBackups.push(backupKey)

    // Save backup
    window.localStorage.setItem(backupKey, JSON.stringify(data))
    window.localStorage.setItem(`${key}_backups`, JSON.stringify(recentBackups))

    // Clean up old backups
    backups.forEach(oldKey => {
      if (!recentBackups.includes(oldKey)) {
        window.localStorage.removeItem(oldKey)
      }
    })
  } catch (error) {
    console.warn(`Failed to create backup for ${key}:`, error)
  }
}

/**
 * Try to restore from backup if available
 * @param {string} key - LocalStorage key
 * @returns {*} Restored data or null
 */
function tryRestoreFromBackup(key) {
  try {
    const backups = JSON.parse(window.localStorage.getItem(`${key}_backups`) || '[]')

    // Try backups from newest to oldest
    for (let i = backups.length - 1; i >= 0; i--) {
      const backupKey = backups[i]
      const backupData = window.localStorage.getItem(backupKey)

      if (backupData) {
        const parsed = JSON.parse(backupData)
        if (validateData(key, parsed)) {
          console.log(`Restored ${key} from backup ${backupKey}`)
          return parsed
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to restore from backup for ${key}:`, error)
  }

  return null
}

/**
 * Custom hook for localStorage with JSON serialization
 * @param {string} key - LocalStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {[*, Function]} Current value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)

      if (!item) {
        return initialValue
      }

      // Parse stored json
      const parsed = JSON.parse(item)

      // Validate the data structure
      if (!validateData(key, parsed)) {
        console.error(`Invalid data structure for ${key}, attempting backup restore`)

        // Try to restore from backup
        const restored = tryRestoreFromBackup(key)
        if (restored !== null) {
          // Save restored data
          window.localStorage.setItem(key, JSON.stringify(restored))
          return restored
        }

        // Fall back to initial value
        console.warn(`No valid backup found for ${key}, using initial value`)
        return initialValue
      }

      return parsed
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)

      // Try to restore from backup
      const restored = tryRestoreFromBackup(key)
      if (restored !== null) {
        return restored
      }

      // Clear corrupted data
      try {
        window.localStorage.removeItem(key)
      } catch (clearError) {
        console.error(`Failed to clear corrupted ${key}:`, clearError)
      }

      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Validate before saving
      if (!validateData(key, valueToStore)) {
        console.error(`Attempted to save invalid data structure for ${key}`)
        return
      }

      // Create backup before updating (for critical keys)
      if (key.includes('courses') || key.includes('attendance') || key.includes('semesters')) {
        createBackup(key, storedValue)
      }

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)

      // If save failed due to quota, try clearing old backups
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old backups...')
        try {
          const backups = JSON.parse(window.localStorage.getItem(`${key}_backups`) || '[]')
          backups.forEach(backupKey => {
            window.localStorage.removeItem(backupKey)
          })
          window.localStorage.removeItem(`${key}_backups`)

          // Retry save
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          setStoredValue(valueToStore)
        } catch (retryError) {
          console.error(`Failed to save ${key} even after clearing backups:`, retryError)
        }
      }
    }
  }

  return [storedValue, setValue]
}

/**
 * Hook to sync localStorage across tabs
 */
export function useSyncedLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue)

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error syncing localStorage:', error)
        }
      }
    }

    // Listen for storage events (changes in other tabs)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, setStoredValue])

  return [storedValue, setStoredValue]
}
