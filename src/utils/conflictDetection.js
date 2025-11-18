/**
 * Conflict Detection Utilities for Class Scheduling
 * Detects time conflicts, duplicate courses, and section overlaps
 */

/**
 * Check if a new class conflicts with existing enrolled courses
 * @param {Object} newClass - Class to add {courseCode, section, days, startTime, endTime}
 * @param {Array} enrolledCourses - Array of currently enrolled courses
 * @returns {Object} - {hasConflict: boolean, conflicts: Array, type: string}
 */
export function detectConflicts(newClass, enrolledCourses) {
  const conflicts = {
    hasConflict: false,
    type: null,
    conflicts: [],
    warnings: []
  }

  if (!newClass || !enrolledCourses || enrolledCourses.length === 0) {
    return conflicts
  }

  enrolledCourses.forEach(course => {
    // 1. Check for duplicate course (same code, different section)
    if (course.code === newClass.courseCode) {
      if (course.section !== newClass.section) {
        conflicts.hasConflict = true
        conflicts.type = 'duplicate'
        conflicts.conflicts.push({
          course,
          message: `You're already enrolled in ${newClass.courseCode} Section ${course.section}. Adding Section ${newClass.section} will create a duplicate.`
        })
      } else {
        // Same course, same section - exact duplicate
        conflicts.hasConflict = true
        conflicts.type = 'exact_duplicate'
        conflicts.conflicts.push({
          course,
          message: `You're already enrolled in ${newClass.courseCode} Section ${newClass.section}.`
        })
      }
    }

    // 2. Check for time conflicts (overlapping class times)
    if (hasTimeOverlap(newClass, course)) {
      conflicts.hasConflict = true
      conflicts.type = 'time_conflict'
      conflicts.conflicts.push({
        course,
        message: `Time conflict with ${course.name} (${course.code}) on ${getOverlappingDays(newClass, course).join(', ')}`
      })
    }
  })

  return conflicts
}

/**
 * Check if two classes have overlapping time slots
 * @param {Object} class1 - First class {days, startTime, endTime}
 * @param {Object} class2 - Second class {days, startTime, endTime}
 * @returns {boolean} - True if classes overlap
 */
function hasTimeOverlap(class1, class2) {
  if (!class1.days || !class2.days) return false

  // Check if any days overlap
  const overlappingDays = class1.days.filter(day =>
    class2.days && class2.days.includes(day)
  )

  if (overlappingDays.length === 0) return false

  // Check if time ranges overlap
  const start1 = parseTime(class1.startTime)
  const end1 = parseTime(class1.endTime)
  const start2 = parseTime(class2.startTime)
  const end2 = parseTime(class2.endTime)

  // Classes overlap if: start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1
}

/**
 * Get list of days where two classes overlap
 * @param {Object} class1
 * @param {Object} class2
 * @returns {Array} - Array of overlapping day names
 */
function getOverlappingDays(class1, class2) {
  if (!class1.days || !class2.days) return []
  return class1.days.filter(day => class2.days.includes(day))
}

/**
 * Parse time string to minutes since midnight for comparison
 * @param {string} timeStr - Time in format "9:00" or "09:00 AM"
 * @returns {number} - Minutes since midnight
 */
function parseTime(timeStr) {
  if (!timeStr) return 0

  // Handle different time formats
  let hours = 0
  let minutes = 0

  // Format: "9:00" or "09:00"
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':')
    hours = parseInt(h)
    minutes = parseInt(m)

    // Handle AM/PM if present
    if (timeStr.toLowerCase().includes('pm') && hours < 12) {
      hours += 12
    } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
      hours = 0
    }
  }

  return hours * 60 + minutes
}

/**
 * Format conflict warnings for user display
 * @param {Object} conflictResult - Result from detectConflicts
 * @returns {string} - Formatted message
 */
export function formatConflictMessage(conflictResult) {
  if (!conflictResult.hasConflict) return ''

  if (conflictResult.type === 'exact_duplicate') {
    return 'This class is already in your courses.'
  }

  if (conflictResult.type === 'duplicate') {
    const conflict = conflictResult.conflicts[0]
    return `You're already enrolled in ${conflict.course.code} Section ${conflict.course.section}. Do you want to switch sections?`
  }

  if (conflictResult.type === 'time_conflict') {
    const conflictCourses = conflictResult.conflicts.map(c => c.course.name).join(', ')
    return `This class conflicts with: ${conflictCourses}. Do you still want to add it?`
  }

  return 'Conflict detected. Do you want to proceed?'
}

/**
 * Check if user should be warned (soft warning, not blocking)
 * @param {Object} newClass
 * @param {Array} enrolledCourses
 * @returns {Object} - {hasWarning: boolean, message: string}
 */
export function checkWarnings(newClass, enrolledCourses) {
  const warnings = {
    hasWarning: false,
    messages: []
  }

  // Warning 1: Total credit hours exceeding typical load
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.creditHours || 0), 0)
  const newTotal = totalCredits + (newClass.creditHours || 0)

  if (newTotal > 20) {
    warnings.hasWarning = true
    warnings.messages.push(`Adding this course will bring your total to ${newTotal} credit hours. That's a heavy load!`)
  }

  // Warning 2: Back-to-back classes on same day (less than 30 min gap)
  enrolledCourses.forEach(course => {
    if (hasBackToBackClasses(newClass, course)) {
      warnings.hasWarning = true
      warnings.messages.push(`Back-to-back class with ${course.name}. You'll have minimal break time.`)
    }
  })

  return warnings
}

/**
 * Check if two classes are back-to-back (end time of one = start time of other)
 * @param {Object} class1
 * @param {Object} class2
 * @returns {boolean}
 */
function hasBackToBackClasses(class1, class2) {
  if (!class1.days || !class2.days) return false

  const overlappingDays = class1.days.filter(day => class2.days.includes(day))
  if (overlappingDays.length === 0) return false

  const end1 = parseTime(class1.endTime)
  const start2 = parseTime(class2.startTime)
  const end2 = parseTime(class2.endTime)
  const start1 = parseTime(class1.startTime)

  // Check if gap is less than 30 minutes
  const gap1 = Math.abs(end1 - start2)
  const gap2 = Math.abs(end2 - start1)

  return gap1 < 30 || gap2 < 30
}
