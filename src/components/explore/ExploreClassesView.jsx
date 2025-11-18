import { useState, useEffect, useMemo } from 'react'
import { Search, Loader, AlertCircle, BookOpen, RefreshCw, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useClassSearch } from '../../hooks/useClassSearch'
import { detectConflicts, formatConflictMessage } from '../../utils/conflictDetection'
import { vibrate } from '../../utils/uiHelpers'
import { getTodayISO } from '../../utils/dateHelpers'
import ClassCard from './ClassCard'
import Toast from '../shared/Toast'
import ConfirmModal from '../shared/ConfirmModal'

/**
 * ExploreClassesView - Production-grade class explorer
 * Features: Fuzzy search, inline filters, conflict detection, animated interactions, responsive grid
 */
export default function ExploreClassesView() {
  const { addCourse, courses } = useApp()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [timetableData, setTimetableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [addingClassId, setAddingClassId] = useState(null)

  // Search placeholder rotation
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const placeholders = [
    'Search by course (DAA, DBS)...',
    'Search by teacher (Sameer, Nasir)...',
    'Search by room (E-2, A-3)...',
    'Search by time (08:00, Monday)...'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Fetch timetable data
  useEffect(() => {
    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/timetable/timetable.json')
      if (!response.ok) {
        throw new Error('Failed to fetch timetable data')
      }

      const data = await response.json()

      // Flatten timetable structure into array of classes
      const allClasses = []
      if (data.data) {
        Object.keys(data.data).forEach(sectionKey => {
          const sectionClasses = data.data[sectionKey]
          if (Array.isArray(sectionClasses)) {
            sectionClasses.forEach(classData => {
              allClasses.push({
                ...classData,
                id: `${classData.courseCode}-${classData.section}-${classData.instructor || 'unknown'}`,
                days: classData.sessions?.map(s => s.day) || [classData.day].filter(Boolean)
              })
            })
          }
        })
      }

      setTimetableData(allClasses)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching timetable:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  // Search and filter classes
  const filteredClasses = useClassSearch(timetableData, searchTerm, {})

  // Check which classes are already added
  const addedClassIds = useMemo(() => {
    return new Set(courses.map(c => c.courseCode || c.code))
  }, [courses])

  // Check conflicts for each class
  const getClassConflicts = (classData) => {
    const conflicts = detectConflicts(
      {
        courseCode: classData.courseCode,
        section: classData.section,
        days: classData.days || [],
        startTime: classData.sessions?.[0]?.timeSlot?.split('-')[0] || classData.timeSlot?.split('-')[0] || '',
        endTime: classData.sessions?.[0]?.timeSlot?.split('-')[1] || classData.timeSlot?.split('-')[1] || '',
        creditHours: classData.creditHours
      },
      courses
    )
    return conflicts
  }

  // Handle adding a class
  const handleAddClass = (classData) => {
    vibrate(15)
    setAddingClassId(classData.id)

    const conflicts = getClassConflicts(classData)

    // If exact duplicate, just show toast
    if (conflicts.type === 'exact_duplicate') {
      setToast({
        message: 'This class is already in your courses',
        type: 'info'
      })
      setAddingClassId(null)
      return
    }

    // If has conflicts, show confirmation dialog
    if (conflicts.hasConflict) {
      setAddingClassId(null)
      setConfirmDialog({
        title: 'Scheduling Conflict Detected',
        message: formatConflictMessage(conflicts),
        confirmText: 'Add Anyway',
        cancelText: 'Cancel',
        isDanger: conflicts.type === 'time_conflict',
        onConfirm: () => {
          setAddingClassId(classData.id)
          addClassToCourses(classData)
          setConfirmDialog(null)
        },
        onCancel: () => {
          setConfirmDialog(null)
        }
      })
      return
    }

    // No conflicts, add directly
    addClassToCourses(classData)
  }

  // Add class to courses
  const addClassToCourses = (classData) => {
    try {
      // Calculate start and end dates (current semester)
      const today = new Date()
      const startDate = getTodayISO()
      const endDate = new Date(today.getFullYear(), today.getMonth() + 4, today.getDate())
        .toISOString()
        .split('T')[0]

      // Prepare course data
      const courseData = {
        name: classData.courseName,
        code: classData.courseCode,
        section: classData.section,
        creditHours: classData.creditHours || 3,
        startDate,
        endDate,
        colorHex: '#3B82F6' // Will be auto-assigned by AppContext
      }

      addCourse(courseData)

      setToast({
        message: `${classData.courseName || classData.courseCode} added successfully`,
        type: 'success',
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            // Undo would be implemented here
            setToast(null)
          }
        }
      })

      setAddingClassId(null)
    } catch (err) {
      console.error('Error adding course:', err)
      setToast({
        message: err.message || 'Failed to add course',
        type: 'error'
      })
      setAddingClassId(null)
    }
  }

  // Clear search
  const clearSearch = () => {
    vibrate(10)
    setSearchTerm('')
  }

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {/* Header with Search */}
      <div className="flex-shrink-0 bg-dark-surface/95 backdrop-blur-xl border-b border-dark-border/50 sticky top-0 z-20">
        <div className="px-3 sm:px-4 md:px-6 py-3 space-y-3">
          {/* Title & Result Count */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg border border-accent/20">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-content-primary">
                  Explore Classes
                </h2>
                <p className="text-xs sm:text-sm text-content-tertiary">
                  {loading ? 'Loading...' : (
                    <>
                      <span className="font-semibold text-accent">{filteredClasses.length}</span>
                      {' '}
                      {filteredClasses.length === 1 ? 'class' : 'classes'}
                      {searchTerm && ` for "${searchTerm}"`}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Clear Search Button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-content-secondary hover:text-content-primary bg-dark-surface-raised hover:bg-dark-surface-hover border border-dark-border transition-all"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Search Tagline */}
          <p className="text-xs text-content-tertiary">
            Search by course name, teacher, room, or time
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder={placeholders[placeholderIndex]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-dark-bg border border-dark-border rounded-xl text-content-primary placeholder:text-content-tertiary text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content Area - Responsive Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-sm text-content-secondary">Loading classes...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-attendance-danger/10 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-attendance-danger" />
            </div>
            <p className="text-sm text-content-secondary mb-4 text-center">{error}</p>
            <button
              onClick={fetchTimetable}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredClasses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-accent/10 rounded-full mb-4">
              <Search className="w-10 h-10 text-accent" />
            </div>
            <p className="text-base font-semibold text-content-primary mb-2">No classes found</p>
            <p className="text-sm text-content-tertiary text-center mb-4">
              {searchTerm ? 'Try a different search term' : 'No classes available'}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 px-4 py-2 bg-dark-surface-raised hover:bg-dark-surface-hover border border-dark-border rounded-lg transition-all text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredClasses.length > 0 && (
          <div className="p-3 sm:p-4 md:p-6">
            {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredClasses.map((classData) => {
                const isAdded = addedClassIds.has(classData.courseCode)
                const isAdding = addingClassId === classData.id
                const conflicts = getClassConflicts(classData)

                // Check if this is the exact course added (same section)
                const addedCourse = courses.find(c => (c.courseCode || c.code) === classData.courseCode)
                const isExactMatch = addedCourse && addedCourse.section === classData.section

                return (
                  <ClassCard
                    key={classData.id}
                    classData={classData}
                    onAdd={handleAddClass}
                    isAdded={isAdded}
                    isExactMatch={isExactMatch}
                    isAdding={isAdding}
                    hasConflict={conflicts.hasConflict && conflicts.type !== 'exact_duplicate'}
                    conflictMessage={conflicts.hasConflict ? formatConflictMessage(conflicts) : null}
                    searchTerm={searchTerm}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          isDanger={confirmDialog.isDanger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  )
}
