import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import BaseModal from '../shared/BaseModal'
import { vibrate } from '../../utils/uiHelpers'

/**
 * FilterPanel Component
 * Bottom sheet modal for advanced class filtering
 * Mobile-optimized with collapsible sections
 */
export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  filterOptions
}) {
  const [expandedSections, setExpandedSections] = useState({
    section: true,
    teacher: false,
    room: false,
    days: false,
    creditHours: false
  })

  const toggleSection = (section) => {
    vibrate(10)
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSectionChange = (section) => {
    vibrate(10)
    onFilterChange({ ...filters, section })
  }

  const handleTeacherChange = (e) => {
    onFilterChange({ ...filters, teacher: e.target.value })
  }

  const handleRoomChange = (e) => {
    onFilterChange({ ...filters, room: e.target.value })
  }

  const handleCreditHoursChange = (e) => {
    onFilterChange({ ...filters, creditHours: e.target.value })
  }

  const toggleDay = (day) => {
    vibrate(10)
    const currentDays = filters.days || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    onFilterChange({ ...filters, days: newDays })
  }

  const clearAllFilters = () => {
    vibrate(15)
    onFilterChange({
      section: 'all',
      teacher: 'all',
      room: 'all',
      days: [],
      creditHours: 'all'
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.section && filters.section !== 'all') count++
    if (filters.teacher && filters.teacher !== 'all') count++
    if (filters.room && filters.room !== 'all') count++
    if (filters.days && filters.days.length > 0) count++
    if (filters.creditHours && filters.creditHours !== 'all') count++
    return count
  }

  const activeCount = getActiveFilterCount()

  const headerIcon = (
    <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl border border-accent/20">
      <Filter className="w-5 h-5 text-accent" />
    </div>
  )

  const titleContent = (
    <div>
      <h2 className="text-base sm:text-lg font-semibold text-content-primary">
        Filter Classes
      </h2>
      <p className="text-xs sm:text-sm text-content-tertiary mt-0.5">
        {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : 'No filters applied'}
      </p>
    </div>
  )

  const footer = (
    <div className="flex gap-2 sm:gap-3">
      <button
        onClick={clearAllFilters}
        disabled={activeCount === 0}
        className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-dark-bg/50 hover:bg-dark-surface-raised text-content-primary border border-dark-border/30 rounded-lg sm:rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Clear All
      </button>
      <button
        onClick={onClose}
        className="flex-1 bg-gradient-to-br from-accent to-accent-hover text-dark-bg font-medium px-3 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-200 shadow-accent hover:shadow-accent-lg hover:scale-[1.02] active:scale-95"
      >
        Apply Filters
      </button>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={titleContent}
      size="md"
      headerIcon={headerIcon}
      footer={footer}
      closeOnBackdrop={true}
      closeOnEscape={true}
    >
      <div className="space-y-3">
        {/* Section Filter (Primary - Always Expanded) */}
        <FilterSection
          title="Section"
          isExpanded={expandedSections.section}
          onToggle={() => toggleSection('section')}
          isPrimary
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSectionChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.section === 'all' || !filters.section
                  ? 'bg-accent text-dark-bg'
                  : 'bg-dark-surface-raised text-content-secondary hover:bg-dark-surface-hover'
              }`}
            >
              All Sections
            </button>
            {filterOptions.sections?.map(section => (
              <button
                key={section}
                onClick={() => handleSectionChange(section)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.section === section
                    ? 'bg-accent text-dark-bg'
                    : 'bg-dark-surface-raised text-content-secondary hover:bg-dark-surface-hover'
                }`}
              >
                Section {section}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Teacher Filter */}
        <FilterSection
          title="Teacher"
          isExpanded={expandedSections.teacher}
          onToggle={() => toggleSection('teacher')}
        >
          <select
            value={filters.teacher || 'all'}
            onChange={handleTeacherChange}
            className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          >
            <option value="all">All Teachers</option>
            {filterOptions.teachers?.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
        </FilterSection>

        {/* Room Filter */}
        <FilterSection
          title="Room"
          isExpanded={expandedSections.room}
          onToggle={() => toggleSection('room')}
        >
          <select
            value={filters.room || 'all'}
            onChange={handleRoomChange}
            className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          >
            <option value="all">All Rooms</option>
            {filterOptions.rooms?.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </FilterSection>

        {/* Days Filter */}
        <FilterSection
          title="Days"
          isExpanded={expandedSections.days}
          onToggle={() => toggleSection('days')}
        >
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
              const isSelected = filters.days?.includes(day)
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-accent text-dark-bg'
                      : 'bg-dark-surface-raised text-content-secondary hover:bg-dark-surface-hover'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              )
            })}
          </div>
          {filters.days?.length > 0 && (
            <p className="text-xs text-content-tertiary mt-2">
              {filters.days.length} day{filters.days.length > 1 ? 's' : ''} selected
            </p>
          )}
        </FilterSection>

        {/* Credit Hours Filter */}
        <FilterSection
          title="Credit Hours"
          isExpanded={expandedSections.creditHours}
          onToggle={() => toggleSection('creditHours')}
        >
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => handleCreditHoursChange({ target: { value: 'all' } })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.creditHours === 'all' || !filters.creditHours
                  ? 'bg-accent text-dark-bg'
                  : 'bg-dark-surface-raised text-content-secondary hover:bg-dark-surface-hover'
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4].map(hours => (
              <button
                key={hours}
                onClick={() => handleCreditHoursChange({ target: { value: hours.toString() } })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.creditHours === hours.toString()
                    ? 'bg-accent text-dark-bg'
                    : 'bg-dark-surface-raised text-content-secondary hover:bg-dark-surface-hover'
                }`}
              >
                {hours} CH
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </BaseModal>
  )
}

/**
 * Collapsible Filter Section Component
 */
function FilterSection({ title, isExpanded, onToggle, isPrimary, children }) {
  return (
    <div className={`border rounded-xl overflow-hidden ${
      isPrimary ? 'border-accent/30 bg-accent/5' : 'border-dark-border bg-dark-surface'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-dark-surface-raised/50 transition-colors"
      >
        <span className={`text-sm font-semibold ${
          isPrimary ? 'text-accent' : 'text-content-primary'
        }`}>
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-content-tertiary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-content-tertiary" />
        )}
      </button>
      {isExpanded && (
        <div className="p-3 pt-0">
          {children}
        </div>
      )}
    </div>
  )
}
