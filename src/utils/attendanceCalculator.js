import { calculateTotalClasses } from './dateHelpers'
import { ATTENDANCE_THRESHOLDS, ATTENDANCE_STATUS, SESSION_STATUS } from './constants'

/**
 * Calculate attendance statistics for a course
 * @param {Object} course - Course object
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Attendance stats
 */
export function calculateAttendanceStats(course, attendanceRecords) {
  const totalClasses = calculateTotalClasses(course)

  // Filter records for this course
  const courseRecords = attendanceRecords.filter(
    record => record.courseId === course.id
  )

  // Count absences (only actual absences, not cancelled or proxy)
  const trackedAbsences = courseRecords.filter(
    record => record.status === SESSION_STATUS.ABSENT
  ).length

  // Total absences = initial absences + tracked absences
  const totalAbsences = (course.initialAbsences || 0) + trackedAbsences

  // Count cancelled classes (these don't count against attendance)
  const cancelled = courseRecords.filter(
    record => record.status === SESSION_STATUS.CANCELLED
  ).length

  // Adjusted total (exclude cancelled classes)
  const adjustedTotal = totalClasses - cancelled

  // Classes attended
  const attended = adjustedTotal - totalAbsences

  // Attendance percentage
  const percentage = adjustedTotal > 0 ? (attended / adjustedTotal) * 100 : 100

  // Remaining allowed absences
  const remainingAbsences = Math.max(0, course.allowedAbsences - totalAbsences)

  // Attendance status
  const status = getAttendanceStatus(percentage)

  return {
    totalClasses,
    adjustedTotal,
    attended,
    absences: totalAbsences,
    cancelled,
    percentage: Math.round(percentage * 100) / 100, // 2 decimal places
    remainingAbsences,
    status,
    isAtRisk: percentage < ATTENDANCE_THRESHOLDS.WARNING,
    isSafe: percentage >= ATTENDANCE_THRESHOLDS.SAFE,
  }
}

/**
 * Get attendance status based on percentage
 * @param {number} percentage - Attendance percentage
 * @returns {string} Status: 'safe', 'warning', or 'danger'
 */
export function getAttendanceStatus(percentage) {
  if (percentage >= ATTENDANCE_THRESHOLDS.SAFE) {
    return ATTENDANCE_STATUS.SAFE
  } else if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) {
    return ATTENDANCE_STATUS.WARNING
  } else {
    return ATTENDANCE_STATUS.DANGER
  }
}

/**
 * Simulate attendance with planned absences
 * @param {Object} course - Course object
 * @param {Array} attendanceRecords - Current attendance records
 * @param {Array} plannedAbsences - Array of planned absence dates
 * @returns {Object} Simulated attendance stats
 */
export function simulateAttendance(course, attendanceRecords, plannedAbsences) {
  // Create temporary records with planned absences
  const simulatedRecords = [
    ...attendanceRecords,
    ...plannedAbsences.map(date => ({
      courseId: course.id,
      date,
      status: SESSION_STATUS.ABSENT,
      isPlanned: true,
    }))
  ]

  return calculateAttendanceStats(course, simulatedRecords)
}

/**
 * Get attendance statistics for all courses
 * @param {Array} courses - Array of course objects
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Array} Array of course stats
 */
export function calculateAllCoursesStats(courses, attendanceRecords) {
  return courses.map(course => ({
    course,
    stats: calculateAttendanceStats(course, attendanceRecords)
  }))
}

/**
 * Calculate summary statistics
 * @param {Array} courses - Array of courses
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Summary stats
 */
export function calculateSummaryStats(courses, attendanceRecords) {
  if (courses.length === 0) {
    return {
      totalCourses: 0,
      avgAttendance: 0,
      safeCourses: 0,
      atRiskCourses: 0,
      totalAbsences: 0,
    }
  }

  const allStats = calculateAllCoursesStats(courses, attendanceRecords)

  const totalAttendance = allStats.reduce((sum, { stats }) => sum + stats.percentage, 0)
  const avgAttendance = totalAttendance / courses.length

  const safeCourses = allStats.filter(({ stats }) => stats.isSafe).length
  const atRiskCourses = allStats.filter(({ stats }) => stats.isAtRisk).length
  const totalAbsences = allStats.reduce((sum, { stats }) => sum + stats.absences, 0)

  return {
    totalCourses: courses.length,
    avgAttendance: Math.round(avgAttendance * 100) / 100,
    safeCourses,
    atRiskCourses,
    totalAbsences,
  }
}

/**
 * Get the session status for a specific course on a specific date
 * @param {string} courseId - Course ID
 * @param {string} date - ISO date string
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {string|null} Session status or null if no record
 */
export function getSessionStatus(courseId, date, attendanceRecords) {
  const record = attendanceRecords.find(
    r => r.courseId === courseId && r.date === date
  )
  return record ? record.status : null
}

/**
 * Check if a day is marked as absent (all classes)
 * @param {string} date - ISO date string
 * @param {Array} courses - Array of courses
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {boolean|string} true = all absent, false = all present, 'mixed' = some absent
 */
export function getDayStatus(date, courses, attendanceRecords) {
  // Get courses that have classes on this date
  const coursesOnDate = courses.filter(course =>
    course.weekdays.includes(new Date(date).getDay())
  )

  if (coursesOnDate.length === 0) return null

  const statuses = coursesOnDate.map(course =>
    getSessionStatus(course.id, date, attendanceRecords)
  )

  const absentCount = statuses.filter(s => s === SESSION_STATUS.ABSENT).length
  const presentCount = statuses.filter(s => s === null || s === SESSION_STATUS.PRESENT).length

  if (absentCount === coursesOnDate.length) return 'absent'
  if (presentCount === coursesOnDate.length) return 'present'
  return 'mixed'
}
