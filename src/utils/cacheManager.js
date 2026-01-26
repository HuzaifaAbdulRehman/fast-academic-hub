/**
 * Cache Manager Utility
 * Unified cache management for timetable data and localStorage
 */

const TIMETABLE_VERSION_KEY = 'timetable_version'
const TIMETABLE_DATA_KEY = 'timetable'

/**
 * Clear timetable cache
 * Removes cached timetable JSON data and version
 */
export function clearTimetableCache() {
  try {
    localStorage.removeItem(TIMETABLE_DATA_KEY)
    localStorage.removeItem(TIMETABLE_VERSION_KEY)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get stored timetable version (lastUpdated timestamp)
 */
export function getTimetableVersion() {
  try {
    return localStorage.getItem(TIMETABLE_VERSION_KEY)
  } catch (error) {
    return null
  }
}

/**
 * Store timetable version (lastUpdated timestamp)
 */
export function setTimetableVersion(version) {
  try {
    localStorage.setItem(TIMETABLE_VERSION_KEY, version)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Check if timetable has been updated (new version available)
 * @param {string} newVersion - The lastUpdated timestamp from fetched timetable.json
 * @returns {boolean} - True if new version detected
 */
export function isTimetableUpdated(newVersion) {
  if (!newVersion) return true // No version means treat as new
  
  const storedVersion = getTimetableVersion()
  if (!storedVersion) return true // No stored version means treat as new
  
  // Compare timestamps - if new version is different/newer, it's updated
  return newVersion !== storedVersion
}

/**
 * Clear service worker cache for timetable.json
 */
export async function clearServiceWorkerCache() {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName)
          const keys = await cache.keys()
          // Delete timetable.json from all caches
          await Promise.all(
            keys
              .filter(request => request.url.includes('/timetable/timetable.json'))
              .map(request => cache.delete(request))
          )
        })
      )
    }
    return true
  } catch (error) {
    console.warn('Failed to clear service worker cache:', error)
    return false
  }
}

/**
 * Clear all app caches
 * Removes timetable cache (keeps user data like courses and attendance)
 */
export function clearAllCaches() {
  try {
    clearTimetableCache()
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get cache status
 * Returns information about current cache state
 */
export function getCacheStatus() {
  const timetableCache = localStorage.getItem(TIMETABLE_DATA_KEY)
  const timetableVersion = getTimetableVersion()

  return {
    hasTimetableCache: !!timetableCache,
    timetableCacheSize: timetableCache ? Math.round(timetableCache.length / 1024) : 0, // Size in KB
    timetableVersion: timetableVersion,
  }
}

/**
 * Check if timetable cache is stale
 * Returns true if cache is older than 24 hours
 */
export function isTimetableCacheStale() {
  try {
    const timetableStr = localStorage.getItem(TIMETABLE_DATA_KEY)
    if (!timetableStr) return true

    const timetable = JSON.parse(timetableStr)
    const lastUpdated = timetable.lastUpdated

    if (!lastUpdated) return true

    const now = Date.now()
    const cacheAge = now - new Date(lastUpdated).getTime()
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

    return cacheAge > TWENTY_FOUR_HOURS
  } catch (error) {
    return true
  }
}

/**
 * Get timetable from cache
 * Returns parsed timetable data or null if not available
 */
export function getTimetableFromCache() {
  try {
    const stored = localStorage.getItem(TIMETABLE_DATA_KEY)
    if (!stored) return null

    const data = JSON.parse(stored)

    // Handle array format (direct array of courses)
    if (Array.isArray(data)) {
      return data.length > 0 ? data : null
    }

    // Handle object format with department keys (e.g., { BCS: [...], BSSE: [...] })
    if (data && typeof data === 'object') {
      // Extract all sections from all departments
      const allSections = []
      for (const dept in data) {
        if (Array.isArray(data[dept])) {
          allSections.push(...data[dept])
        }
      }
      return allSections.length > 0 ? allSections : null
    }

    return null
  } catch (error) {
    return null
  }
}
