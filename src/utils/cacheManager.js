/**
 * Cache Manager Utility
 * Unified cache management for timetable data and localStorage
 */

/**
 * Clear timetable cache
 * Removes cached timetable JSON data
 */
export function clearTimetableCache() {
  try {
    localStorage.removeItem('timetable')
    console.log('✅ Timetable cache cleared')
    return true
  } catch (error) {
    console.error('❌ Failed to clear timetable cache:', error)
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
    console.log('✅ All caches cleared')
    return true
  } catch (error) {
    console.error('❌ Failed to clear caches:', error)
    return false
  }
}

/**
 * Get cache status
 * Returns information about current cache state
 */
export function getCacheStatus() {
  const timetableCache = localStorage.getItem('timetable')

  return {
    hasTimetableCache: !!timetableCache,
    timetableCacheSize: timetableCache ? Math.round(timetableCache.length / 1024) : 0, // Size in KB
  }
}

/**
 * Check if timetable cache is stale
 * Returns true if cache is older than 24 hours
 */
export function isTimetableCacheStale() {
  try {
    const timetableStr = localStorage.getItem('timetable')
    if (!timetableStr) return true

    const timetable = JSON.parse(timetableStr)
    const lastUpdated = timetable.lastUpdated

    if (!lastUpdated) return true

    const now = Date.now()
    const cacheAge = now - new Date(lastUpdated).getTime()
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

    return cacheAge > TWENTY_FOUR_HOURS
  } catch (error) {
    console.error('Error checking cache staleness:', error)
    return true
  }
}
