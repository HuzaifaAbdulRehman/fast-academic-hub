// Attendance status thresholds
export const ATTENDANCE_THRESHOLDS = {
  SAFE: 85,      // Above 85% = safe (green)
  WARNING: 80,   // 80-85% = warning (yellow)
  DANGER: 80,    // Below 80% = danger (red)
}

// Attendance status types
export const ATTENDANCE_STATUS = {
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
}

// Session status types
export const SESSION_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  CANCELLED: 'cancelled',
  PROXY: 'proxy',
}

// Weekday constants (0 = Sunday, 6 = Saturday)
export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Default allowed absences percentage
export const DEFAULT_ALLOWED_ABSENCE_PERCENTAGE = 0.2 // 20%

// Default weeks to show in calendar view
export const DEFAULT_WEEKS_TO_SHOW = 4

// LocalStorage keys
export const STORAGE_KEYS = {
  COURSES: 'absence-tracker-courses',
  ATTENDANCE: 'absence-tracker-attendance',
  SETTINGS: 'absence-tracker-settings',
  SEMESTERS: 'absence-tracker-semesters',
  ACTIVE_SEMESTER: 'absence-tracker-active-semester',
}

// Course color palette (auto-assigned) - Minimal professional blue shades
export const COURSE_COLORS = [
  { name: 'blue-1', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', hex: '#3b82f6' },
  { name: 'blue-2', bg: 'bg-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-300', hex: '#60a5fa' },
  { name: 'blue-3', bg: 'bg-blue-600/10', border: 'border-blue-600/30', text: 'text-blue-500', hex: '#2563eb' },
  { name: 'blue-4', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', hex: '#0ea5e9' },
  { name: 'blue-5', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', hex: '#06b6d4' },
  { name: 'blue-6', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', hex: '#6366f1' },
  { name: 'blue-7', bg: 'bg-blue-700/10', border: 'border-blue-700/30', text: 'text-blue-600', hex: '#1d4ed8' },
  { name: 'blue-8', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', hex: '#64748b' },
]
