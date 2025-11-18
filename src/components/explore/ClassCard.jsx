import { useState } from 'react'
import { Plus, Check, Clock, MapPin, User, BookOpen, AlertTriangle, ChevronDown, ChevronUp, Ban } from 'lucide-react'
import { vibrate } from '../../utils/uiHelpers'
import { getHighlightedText } from '../../hooks/useClassSearch'

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
function HighlightedText({ text, searchTerm }) {
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
}

/**
 * ClassCard Component - Production-grade card design
 * Features: Visual hierarchy, day-based color coding, animated interactions, responsive
 */
export default function ClassCard({
  classData,
  onAdd,
  isAdded,
  isExactMatch,
  isAdding,
  hasConflict,
  conflictMessage,
  searchTerm
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    vibrate(10)
    setIsExpanded(!isExpanded)
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (isAdded || isAdding) return
    vibrate(15)
    onAdd(classData)
  }

  // Get primary day for border color
  const primaryDay = classData.days?.[0] || classData.day || 'Monday'
  const dayColor = DAY_COLORS[primaryDay] || DAY_COLORS.Monday

  // Format sessions by day
  const sessionsByDay = classData.sessions?.reduce((acc, session) => {
    if (!acc[session.day]) {
      acc[session.day] = []
    }
    acc[session.day].push(session)
    return acc
  }, {}) || {}

  const days = Object.keys(sessionsByDay).sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    return dayOrder.indexOf(a) - dayOrder.indexOf(b)
  })

  return (
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
          <button
            onClick={handleToggle}
            className="flex-1 min-w-0 text-left focus:outline-none group"
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

            {/* Course Name - Secondary */}
            <p className="text-sm sm:text-base text-content-secondary mb-2 line-clamp-1 group-hover:text-content-primary transition-colors">
              <HighlightedText text={classData.courseName || 'Unnamed Course'} searchTerm={searchTerm} />
            </p>

            {/* Quick Info Row - Tertiary */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-content-tertiary">
              {/* Instructor */}
              {classData.instructor && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">
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

            {/* Expand Indicator */}
            <div className="flex items-center gap-1 mt-2 text-xs text-content-tertiary group-hover:text-accent transition-colors">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  <span>Less details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>More details</span>
                </>
              )}
            </div>
          </button>

          {/* Add Button - Fixed right side */}
          <button
            onClick={handleAdd}
            disabled={isAdded || isAdding}
            className={`
              relative flex-shrink-0
              w-12 h-12 sm:w-14 sm:h-14
              flex items-center justify-center
              rounded-xl
              font-semibold text-sm
              transition-all duration-300
              ${isExactMatch
                ? 'bg-attendance-safe/20 text-attendance-safe cursor-default'
                : isAdded
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                : isAdding
                ? 'bg-accent/30 text-accent cursor-wait'
                : hasConflict
                ? 'bg-attendance-warning/20 text-attendance-warning hover:bg-attendance-warning/30 hover:scale-110 active:scale-95'
                : 'bg-accent/20 text-accent hover:bg-accent hover:text-dark-bg hover:scale-110 hover:shadow-lg hover:shadow-accent/30 active:scale-95'
              }
              disabled:cursor-not-allowed disabled:hover:scale-100
            `}
            title={
              isExactMatch
                ? 'This exact section is in your courses'
                : isAdded
                ? 'Already taking this course (different section)'
                : isAdding
                ? 'Adding...'
                : hasConflict
                ? 'Has conflict'
                : 'Add to My Courses'
            }
            aria-label={isAdded ? 'Already added to courses' : 'Add to my courses'}
          >
            <div className={`transition-transform duration-300 ${isAdding ? 'animate-spin' : (isAdded || isExactMatch) ? 'scale-110' : ''}`}>
              {isExactMatch ? (
                <Check className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
              ) : isAdded ? (
                <Ban className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
              ) : isAdding ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 border-t border-dark-border/50 bg-dark-bg/30">
          {/* Session Schedule */}
          {days.length > 0 && (
            <div className="space-y-2 pt-3">
              <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Class Schedule
              </h4>
              <div className="space-y-1.5">
                {days.map(day => (
                  <div key={day} className="space-y-1">
                    {sessionsByDay[day].map((session, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm bg-dark-surface rounded-lg p-2.5 border border-dark-border/30"
                      >
                        {/* Day dot */}
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: DAY_COLORS[day] }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-content-primary">
                              {day}
                            </span>
                            <span className="text-xs text-content-tertiary font-mono">
                              <HighlightedText text={session.timeSlot || 'TBA'} searchTerm={searchTerm} />
                            </span>
                          </div>
                          {session.room && (
                            <div className="flex items-center gap-1 text-xs text-content-secondary">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                <HighlightedText text={session.room} searchTerm={searchTerm} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflict Message */}
          {hasConflict && conflictMessage && !isAdded && (
            <div className="p-3 bg-attendance-warning/10 border border-attendance-warning/30 rounded-lg">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-attendance-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-attendance-warning mb-1">
                    Scheduling Conflict Detected
                  </p>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    {conflictMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Add Button / Status */}
          {isExactMatch ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-attendance-safe/20 text-attendance-safe border border-attendance-safe/30 text-sm font-semibold">
              <Check className="w-4 h-4" />
              This Section Added to My Courses
            </div>
          ) : isAdded ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30 text-sm font-semibold">
              <Ban className="w-4 h-4" />
              Already Taking This Course (Different Section)
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className={`
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-lg
                font-semibold text-sm
                transition-all duration-200
                ${hasConflict
                  ? 'bg-attendance-warning text-dark-bg hover:bg-attendance-warning/90'
                  : 'bg-gradient-to-r from-accent to-accent-hover text-dark-bg'
                }
                shadow-lg hover:shadow-xl
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
      )}
    </div>
  )
}
