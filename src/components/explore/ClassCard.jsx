import { useState, memo, useMemo } from 'react'
import { Plus, Check, Clock, MapPin, User, BookOpen, AlertTriangle, ChevronDown, ChevronUp, CheckCheck, CheckSquare, Square } from 'lucide-react'
import { vibrate } from '../../utils/uiHelpers'
import { getHighlightedText } from '../../hooks/useClassSearch'
import { formatTimeTo12Hour } from '../../utils/dateHelpers'

/**
 * Day color mapping for left border accent
 */
const DAY_COLORS = {
  Monday: '#3B82F6',    // Blue
  Tuesday: '#8B5CF6',   // Purple
  Wednesday: '#10B981', // Green
  Thursday: '#F59E0B',  // Orange
  Friday: '#EF4444',    // Red
  Saturday: '#6366F1',  // Indigo
  Sunday: '#EC4899'     // Pink
}

/**
 * HighlightedText Component - Shows text with highlighted search matches
 */
const HighlightedText = memo(function HighlightedText({ text, searchTerm }) {
  const parts = getHighlightedText(text, searchTerm)

  return (
    <span>
      {parts.map((part, index) => (
        part.highlight ? (
          <mark key={index} className="bg-accent/30 text-accent font-medium px-0.5 rounded">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </span>
  )
})

/**
 * ClassCard Component - Production-grade card design
 * Features: Visual hierarchy, day-based color coding, animated interactions, responsive
 * Memoized for performance optimization with large lists
 */
const ClassCard = memo(function ClassCard({
  classData,
  onAdd,
  isAdded,
  isExactMatch,
  enrolledCourse,
  isAdding,
  hasConflict,
  conflictMessage,
  searchTerm,
  multiSelectMode = false,
  isSelected = false,
  selectedDifferentSection = null,
  isExpanded = false,
  onToggleExpand
}) {
  const [showFullCourseName, setShowFullCourseName] = useState(false)
  const [showFullInstructor, setShowFullInstructor] = useState(false)

  const handleToggle = () => {
    vibrate(10)
    if (onToggleExpand) {
      onToggleExpand()
    }
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    // In multi-select mode, allow selecting (will be filtered out during bulk add)
    // In normal mode, prevent adding if already added or currently adding
    if (!multiSelectMode && (isAdded || isAdding)) return
    vibrate(15)
    onAdd(classData)
  }

  // Memoize primary day for border color
  const primaryDay = useMemo(() =>
    classData.days?.[0] || classData.day || 'Monday',
    [classData.days, classData.day]
  )
  const dayColor = DAY_COLORS[primaryDay] || DAY_COLORS.Monday

  // Format sessions by day (memoized to prevent recalculation)
  const { sessionsByDay, days } = useMemo(() => {
    const sessionsMap = classData.sessions?.reduce((acc, session) => {
      if (!acc[session.day]) {
        acc[session.day] = []
      }
      acc[session.day].push(session)
      return acc
    }, {}) || {}

    const sortedDays = Object.keys(sessionsMap).sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      return dayOrder.indexOf(a) - dayOrder.indexOf(b)
    })

    return { sessionsByDay: sessionsMap, days: sortedDays }
  }, [classData.sessions])

  return (
    <>
      <div
        className={`
          relative group
          bg-dark-surface rounded-xl overflow-hidden
          border-l-4 border-r border-t border-b
          transition-all duration-300 ease-out
          ${isAdded
            ? 'border-r-attendance-safe/30 border-t-attendance-safe/30 border-b-attendance-safe/30 bg-attendance-safe/5'
            : hasConflict
            ? 'border-r-attendance-warning/30 border-t-attendance-warning/30 border-b-attendance-warning/30'
            : 'border-r-dark-border border-t-dark-border border-b-dark-border hover:border-r-accent/30 hover:border-t-accent/30 hover:border-b-accent/30'
          }
          ${!isAdded && !hasConflict && 'hover:shadow-lg hover:shadow-accent/10'}
          hover:-translate-y-0.5
          active:translate-y-0
        `}
        style={{ borderLeftColor: isAdded ? '#10B981' : dayColor }}
      >
      {/* Compact View - Always Visible */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Course Info */}
          <div
            onClick={handleToggle}
            className="flex-1 min-w-0 text-left cursor-pointer focus:outline-none group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleToggle()
              }
            }}
          >
            {/* Course Code + Section - Primary */}
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-bold text-content-primary group-hover:text-accent transition-colors">
                <HighlightedText text={classData.courseCode || 'N/A'} searchTerm={searchTerm} />
              </h3>
              <span className="text-xs sm:text-sm font-semibold text-accent px-2 py-0.5 rounded-full bg-accent/10">
                <HighlightedText text={classData.section || 'N/A'} searchTerm={searchTerm} />
              </span>
            </div>

            {/* Course Name - Secondary with expand-on-tap */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                vibrate(5)
                setShowFullCourseName(!showFullCourseName)
              }}
              className={`text-sm sm:text-base text-content-secondary mb-2 group-hover:text-content-primary transition-colors text-left w-full break-words cursor-pointer ${
                showFullCourseName ? '' : 'line-clamp-2'
              }`}
              title="Tap to expand full name"
              role="button"
              tabIndex={0}
              aria-expanded={showFullCourseName}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  vibrate(5)
                  setShowFullCourseName(!showFullCourseName)
                }
              }}
            >
              <HighlightedText text={(classData.courseName || 'Unnamed Course').substring(0, 150)} searchTerm={searchTerm} />
            </div>

            {/* Quick Info Row - Tertiary */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-content-tertiary">
              {/* Instructor with expand-on-tap */}
              {classData.instructor && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    vibrate(5)
                    setShowFullInstructor(!showFullInstructor)
                  }}
                  className="flex items-center gap-1 hover:text-content-secondary transition-colors cursor-pointer"
                  title="Tap to expand full name"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      vibrate(5)
                      setShowFullInstructor(!showFullInstructor)
                    }
                  }}
                >
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className={showFullInstructor ? '' : 'truncate max-w-[150px]'}>
                    <HighlightedText text={classData.instructor} searchTerm={searchTerm} />
                  </span>
                </div>
              )}

              {/* Days */}
              {days.length > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{days.map(d => d.substring(0, 3)).join(', ')}</span>
                </div>
              )}

              {/* Credit Hours */}
              {classData.creditHours && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 flex-shrink-0" />
                  <span>{classData.creditHours} CH</span>
                </div>
              )}
            </div>

            {/* Conflict Warning */}
            {hasConflict && !isAdded && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-attendance-warning/10 border border-attendance-warning/30">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 text-attendance-warning" />
                <span className="text-xs text-attendance-warning font-medium">Scheduling Conflict</span>
              </div>
            )}

            {/* Section Conflict Warning (Multiselect) */}
            {multiSelectMode && selectedDifferentSection && !isSelected && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-400/30">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 text-orange-400" />
                <span className="text-xs text-orange-400 font-medium">
                  Section {selectedDifferentSection.section} selected
                </span>
              </div>
            )}

            {/* Expand Indicator - Larger touch target for mobile */}
            <div className="flex items-center gap-1 mt-2 -ml-1 -mb-1 px-1 py-1 text-xs text-content-tertiary group-hover:text-accent transition-colors">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                  <span>Less details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                  <span>View schedule</span>
                </>
              )}
            </div>
          </div>

          {/* Add/Select Button - Fixed right side */}
          <button
            onClick={handleAdd}
            disabled={(!multiSelectMode && (isAdded || isAdding))}
            className={`
              relative flex-shrink-0
              w-14 h-14 sm:w-14 sm:h-14 md:w-16 md:h-16
              flex items-center justify-center
              rounded-xl
              font-semibold text-sm
              transition-all duration-300
              ${multiSelectMode
                ? (isAdded
                  ? (isExactMatch
                    ? 'bg-attendance-safe/30 text-attendance-safe cursor-not-allowed border-2 border-attendance-safe/50'
                    : 'bg-blue-500/10 text-blue-400 cursor-not-allowed border-2 border-blue-400/30')
                  : selectedDifferentSection
                  ? 'bg-dark-surface border-2 border-orange-400/30 text-orange-400/50 cursor-not-allowed opacity-50'
                  : isSelected
                  ? 'bg-accent text-dark-bg border-2 border-accent shadow-lg shadow-accent/30'
                  : 'bg-dark-surface border-2 border-dark-border hover:border-accent/50 hover:scale-110 active:scale-95')
                : (isExactMatch
                  ? 'bg-attendance-safe/30 text-attendance-safe cursor-default border-2 border-attendance-safe/50 shadow-lg shadow-attendance-safe/20'
                  : isAdded
                  ? 'bg-blue-500/10 text-blue-400 cursor-not-allowed border border-blue-400/30'
                  : isAdding
                  ? 'bg-accent/30 text-accent cursor-wait'
                  : hasConflict
                  ? 'bg-attendance-warning/20 text-attendance-warning hover:bg-attendance-warning/30 hover:scale-110 active:scale-95'
                  : 'bg-accent/20 text-accent hover:bg-accent hover:text-dark-bg hover:scale-110 hover:shadow-lg hover:shadow-accent/30 active:scale-95')
              }
              disabled:cursor-not-allowed disabled:hover:scale-100
            `}
            title={
              multiSelectMode && selectedDifferentSection
                ? `Cannot select - ${classData.courseCode} Section ${selectedDifferentSection.section} already selected`
                : multiSelectMode && isAdded
                ? (isExactMatch
                  ? `✓ Already enrolled in this section`
                  : `Already enrolled in ${classData.courseCode} Section ${enrolledCourse?.section}`)
                : isExactMatch
                ? `✓ Enrolled in ${classData.courseCode} Section ${enrolledCourse?.section || classData.section}`
                : isAdded && enrolledCourse
                ? `Already enrolled in ${classData.courseCode} Section ${enrolledCourse.section}`
                : isAdded
                ? 'Already enrolled in this course (different section)'
                : isAdding
                ? 'Adding...'
                : hasConflict
                ? 'Has conflict'
                : multiSelectMode
                ? 'Select to add'
                : 'Add to My Courses'
            }
            aria-label={isAdded ? 'Already added to courses' : multiSelectMode ? 'Select course' : 'Add to my courses'}
          >
            <div className={`transition-transform duration-300 ${isAdding ? 'animate-spin' : (isAdded || isExactMatch || isSelected) ? 'scale-110' : ''}`}>
              {multiSelectMode ? (
                isAdded ? (
                  isExactMatch ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  ) : (
                    <CheckCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                  )
                ) : isSelected ? (
                  <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                ) : (
                  <Square className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={1.5} />
                )
              ) : (
                isExactMatch ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                ) : isAdded ? (
                  <CheckCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                ) : isAdding ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                )
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Expanded View - Inline Accordion */}
      {isExpanded && (
        <div className="border-t border-dark-border/50 bg-dark-bg/40 animate-slideDown overflow-hidden">
          <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3">
            {/* Session Schedule */}
            {days.length > 0 ? (
              <div className="space-y-2">
                {days.map(day => (
                  <div key={day} className="space-y-1.5">
                    {sessionsByDay[day].map((session, idx) => {
                      let formattedTime = 'TBA'
                      if (session.timeSlot) {
                        const [start, end] = session.timeSlot.split('-')
                        formattedTime = `${formatTimeTo12Hour(start)} - ${formatTimeTo12Hour(end)}`
                      }

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2 sm:gap-3 text-sm bg-dark-surface/50 rounded-lg p-2.5 sm:p-3 border border-dark-border/30"
                        >
                          <div
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: DAY_COLORS[day] }}
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-semibold text-content-primary text-xs sm:text-sm">
                                {day}
                              </span>
                              <span className="text-xs text-content-tertiary font-mono">
                                {formattedTime}
                              </span>
                            </div>
                            {session.room && (
                              <div className="flex items-center gap-1 text-xs text-content-secondary">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{session.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-content-tertiary">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs sm:text-sm">No schedule information</p>
              </div>
            )}

            {/* Conflict Warning */}
            {hasConflict && conflictMessage && !isAdded && (
              <div className="p-2.5 sm:p-3 bg-attendance-warning/10 border border-attendance-warning/30 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-attendance-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-attendance-warning mb-0.5">
                      Scheduling Conflict
                    </p>
                    <p className="text-xs text-content-secondary leading-relaxed">
                      {conflictMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!isExactMatch && !isAdded && (
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className={`
                  w-full flex items-center justify-center gap-2
                  px-4 py-2.5 sm:py-3 rounded-lg
                  font-semibold text-sm
                  transition-all duration-200
                  ${hasConflict
                    ? 'bg-attendance-warning text-dark-bg hover:bg-attendance-warning/90'
                    : 'bg-gradient-to-r from-accent to-accent-hover text-dark-bg'
                  }
                  hover:scale-[1.02] active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {hasConflict ? 'Add Anyway' : 'Add to My Courses'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  )
})

export default ClassCard
