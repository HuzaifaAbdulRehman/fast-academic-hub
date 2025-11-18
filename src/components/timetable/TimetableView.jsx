import { useMemo, useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react'
import SemesterSelector from '../shared/SemesterSelector'
import CacheReminderBanner from '../shared/CacheReminderBanner'
import Toast from '../shared/Toast'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { clearTimetableCache } from '../../utils/cacheManager'
import { formatTimeTo12Hour } from '../../utils/dateHelpers'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const DAYS_SHORT = {
  'Monday': 'MON',
  'Tuesday': 'TUE',
  'Wednesday': 'WED',
  'Thursday': 'THU',
  'Friday': 'FRI'
}

export default function TimetableView() {
  const { courses } = useApp()
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)
  const [showCacheReminder, setShowCacheReminder] = useState(false)

  // Create a stable dependency for useMemo by tracking course IDs and sections
  // This ensures re-sorting happens when courses change (add/remove/section change)
  const coursesKey = courses.map(c => `${c.id}-${c.section}`).join(',')

  // Organize courses by day and time
  const scheduleByDay = useMemo(() => {
    const schedule = {}

    DAYS.forEach(day => {
      schedule[day] = []
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('TimetableView - Total courses:', courses.length)
      console.log('TimetableView - Courses key:', coursesKey)
    }
    
    courses.forEach((course, index) => {
      // Build schedule from timetable data if available, otherwise from weekdays
      let courseSchedule = []
      
      if (course.schedule && Array.isArray(course.schedule) && course.schedule.length > 0) {
        // Use existing schedule from timetable
        courseSchedule = course.schedule
      } else if (course.weekdays && Array.isArray(course.weekdays) && course.weekdays.length > 0) {
        // Build basic schedule from weekdays (for manually added courses)
        const weekdayToDayName = {
          0: 'Sunday',
          1: 'Monday',
          2: 'Tuesday',
          3: 'Wednesday',
          4: 'Thursday',
          5: 'Friday',
          6: 'Saturday'
        }
        
        courseSchedule = course.weekdays
          .filter(day => weekdayToDayName[day] && DAYS.includes(weekdayToDayName[day]))
          .map(day => {
            let startTime = '9:00 AM'
            let endTime = '10:00 AM'
            
            if (course.timeSlot) {
              const [start, end] = course.timeSlot.split('-')
              // Convert 24-hour to 12-hour if needed
              startTime = start.includes('AM') || start.includes('PM') 
                ? start.trim() 
                : formatTimeTo12Hour(start.trim())
              endTime = end && (end.includes('AM') || end.includes('PM'))
                ? end.trim()
                : formatTimeTo12Hour(end?.trim() || '10:00')
            }
            
            return {
              day: weekdayToDayName[day],
              startTime,
              endTime
            }
          })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Course "${course.name}" - Built schedule from weekdays:`, courseSchedule)
        }
      }
      
      if (courseSchedule.length > 0) {
        courseSchedule.forEach(slot => {
          const day = slot.day
          if (schedule[day]) {
            schedule[day].push({
              courseName: course.name,
              courseCode: course.courseCode || course.shortName,
              section: course.section || 'N/A',
              // Use per-session instructor/room if available, otherwise fall back to course-level
              instructor: slot.instructor || course.instructor || 'TBA',
              room: slot.room || course.room || course.roomNumber || 'TBA',
              building: course.building || 'Academic Block',
              timeSlot: course.timeSlot || `${slot.startTime}-${slot.endTime}`,
              startTime: slot.startTime,
              endTime: slot.endTime,
              day: slot.day
            })
          }
        })
      } else {
        console.warn(`Course "${course.name}" has no schedule or weekdays`)
      }
    })
    
    console.log('Final scheduleByDay:', schedule)

    // Sort each day's classes by start time (chronological order)
    // Secondary sort by course name for stability
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => {
        const timeA = convertTo24Hour(a.startTime)
        const timeB = convertTo24Hour(b.startTime)

        // Primary sort: by time
        if (timeA !== timeB) {
          return timeA - timeB
        }

        // Secondary sort: by course name (for stable sorting when times are equal)
        return (a.courseName || '').localeCompare(b.courseName || '')
      })

      if (process.env.NODE_ENV === 'development' && schedule[day].length > 0) {
        console.log(`${day} schedule (sorted):`, schedule[day].map(c => `${c.startTime} - ${c.courseName}`))
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Sorting applied successfully to all days')
    }

    return schedule
  }, [courses, coursesKey])

  // Convert 12-hour time to 24-hour for sorting (returns minutes since midnight)
  function convertTo24Hour(time) {
    if (!time) return 0

    // Remove any extra whitespace
    const cleanTime = time.trim()

    // Handle both "9:00 AM" and "09:00-10:00" formats
    if (cleanTime.includes(' ')) {
      const parts = cleanTime.split(' ')
      const timePart = parts[0]
      const period = parts[1]?.toUpperCase() || 'AM'

      const timeSplit = timePart.split(':')
      let hours = parseInt(timeSplit[0]) || 0
      let minutes = parseInt(timeSplit[1]) || 0

      if (period === 'PM' && hours !== 12) {
        hours += 12
      } else if (period === 'AM' && hours === 12) {
        hours = 0
      }

      return hours * 60 + minutes
    } else {
      // Handle 24-hour format "09:00"
      const timeSplit = cleanTime.split(':')
      const hours = parseInt(timeSplit[0]) || 0
      const minutes = parseInt(timeSplit[1]) || 0
      return hours * 60 + minutes
    }
  }

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true)
    // Clear timetable cache and refresh
    clearTimetableCache()
    await new Promise(resolve => setTimeout(resolve, 500))
    setRefreshing(false)
    setToast({
      message: 'Timetable refreshed successfully',
      type: 'success',
      duration: 2000
    })
  }

  // Handle manual cache clear from banner
  const handleCacheClear = () => {
    clearTimetableCache()
    setToast({
      message: 'Timetable cache cleared successfully',
      type: 'success',
      duration: 2000
    })
    setShowCacheReminder(false) // Hide banner after clearing cache
    // Reload page after a short delay to fetch fresh data
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  // Check if we should show cache reminder
  // Show only when there are missing schedule entries or incomplete data
  useEffect(() => {
    if (courses.length === 0) {
      setShowCacheReminder(false)
      return
    }

    // Check if any course has missing or incomplete schedule data
    const hasMissingData = courses.some(course => {
      // Check if course lacks schedule data
      if (!course.schedule || course.schedule.length === 0) {
        return true
      }

      // Check if any schedule entry has missing fields
      return course.schedule.some(slot =>
        !slot.day || !slot.startTime || !slot.endTime
      )
    })

    setShowCacheReminder(hasMissingData)
  }, [courses])

  if (courses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-content-tertiary" />
          </div>
          <h3 className="text-xl font-semibold text-content-primary mb-2">
            No Timetable Yet
          </h3>
          <p className="text-content-secondary mb-6">
            Select courses first to see your complete weekly schedule here.
            Go to the <span className="font-medium text-accent">Courses</span> tab to get started.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Go to Courses tab to add courses</span>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      {/* Semester Selector */}
      <div className="mb-4">
        <SemesterSelector compact={true} />
      </div>

      {/* Cache Reminder Banner - Only show when data issues detected */}
      {showCacheReminder && (
        <CacheReminderBanner
          message="Some timetable data may be missing. Refresh to reload."
          onRefresh={handleCacheClear}
          dismissible={true}
          show={showCacheReminder}
          autoDismissAfter={10000}
        />
      )}

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            Your Weekly Schedule
          </h2>
          <p className="text-content-secondary text-sm">
            Complete timetable with rooms, timings, and instructors
          </p>
        </div>

        {/* Days Schedule */}
        {DAYS.map(day => {
          const dayClasses = scheduleByDay[day]
          const hasClasses = dayClasses && dayClasses.length > 0

          return (
            <div key={day} className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-3 border-b border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-content-primary">
                        {day}
                      </h3>
                      <p className="text-xs text-content-tertiary">
                        {hasClasses ? `${dayClasses.length} ${dayClasses.length === 1 ? 'class' : 'classes'}` : 'No classes'}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-dark-bg rounded-lg">
                    <span className="text-xs font-bold text-accent">
                      {DAYS_SHORT[day]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Classes */}
              {hasClasses ? (
                <div className="p-3 space-y-2">
                  {dayClasses.map((classInfo, index) => (
                    <div
                      key={index}
                      className="bg-dark-bg rounded-xl p-2.5 sm:p-3 md:p-4 border border-dark-border hover:border-accent/30 transition-all"
                    >
                      {/* Course Name & Code */}
                      <div className="flex items-start justify-between mb-2 sm:mb-2.5 md:mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-content-primary mb-1">
                            {classInfo.courseName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {classInfo.courseCode && (
                              <p className="text-[10px] sm:text-xs text-content-tertiary font-mono">
                                {classInfo.courseCode}
                              </p>
                            )}
                            {classInfo.section && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] sm:text-[10px] font-medium rounded">
                                {classInfo.section}
                              </span>
                            )}
                          </div>
                        </div>
                        {classInfo.timeSlot && (
                          <div className="px-2 py-1 bg-accent/10 rounded-lg ml-2 flex-shrink-0">
                            <p className="text-[10px] sm:text-xs font-medium text-accent whitespace-nowrap">
                              {(() => {
                                // Convert timeSlot from 24-hour to 12-hour format
                                const [start, end] = classInfo.timeSlot.split('-')
                                if (!start || !end) return classInfo.timeSlot

                                const start12 = start.includes('AM') || start.includes('PM')
                                  ? start.trim()
                                  : formatTimeTo12Hour(start.trim())
                                const end12 = end.includes('AM') || end.includes('PM')
                                  ? end.trim()
                                  : formatTimeTo12Hour(end.trim())

                                return `${start12} - ${end12}`
                              })()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Class Details - Vertical stack on all screens */}
                      <div className="space-y-2 sm:space-y-2.5">
                        {/* Instructor - Prioritized */}
                        {classInfo.instructor && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-sm">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] sm:text-xs text-content-tertiary">Instructor</p>
                              <p className="text-xs sm:text-sm font-medium text-content-primary truncate">
                                {classInfo.instructor}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Time and Location - Simple vertical stack, always left-aligned */}
                        <div className="space-y-2">
                          {/* Time */}
                          {classInfo.startTime && classInfo.endTime && (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-sm">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-content-tertiary">Time</p>
                                <p className="text-xs sm:text-sm font-medium text-content-primary">
                                  {classInfo.startTime} - {classInfo.endTime}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          {(classInfo.room || classInfo.building) && (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-sm">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-content-tertiary">Location</p>
                                <p className="text-xs sm:text-sm font-medium text-content-primary truncate">
                                  {classInfo.room}
                                  {classInfo.building && `, ${classInfo.building}`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-content-tertiary" />
                  </div>
                  <p className="text-sm text-content-tertiary">
                    No classes scheduled
                  </p>
                  <p className="text-xs text-content-tertiary/60 mt-1">
                    Enjoy your day off!
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {/* Footer Message */}
        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <p className="text-sm text-content-secondary text-center font-medium">
            Plan Smart. Take Leaves. Chill at Home. Still Hit 80%.
          </p>
        </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          key={`${toast.message}-${Date.now()}`}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent=""
      refreshingContent={<div className="text-center py-4 text-accent text-sm">Refreshing...</div>}
      isPullable={true}
      resistance={2}
    >
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </PullToRefresh>
  )
}
