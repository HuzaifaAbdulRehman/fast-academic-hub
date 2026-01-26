import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Download } from 'lucide-react'
import { formatTimeTo12Hour } from '../../utils/dateHelpers'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00', 
  '12:45', '13:30', '14:15', '15:00', '15:45'
]

export default function TimetableExport({ scheduleByDay, courses, onExportSuccess }) {
  const exportRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)

  // Convert time to minutes for comparison
  const timeToMinutes = (time) => {
    if (!time) return 0
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + (minutes || 0)
  }

  // Convert 12-hour to 24-hour
  const convertTo24Hour = (time12) => {
    if (!time12) return '09:00'
    const [time, period] = time12.split(/\s*(AM|PM)/i)
    const [hours, minutes] = time.split(':').map(Number)
    let hour24 = hours
    if (period?.toUpperCase() === 'PM' && hours !== 12) hour24 += 12
    if (period?.toUpperCase() === 'AM' && hours === 12) hour24 = 0
    return `${String(hour24).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}`
  }

  // Get all unique time slots from schedule
  const getAllTimeSlots = () => {
    const slots = new Set()
    DAYS.forEach(day => {
      scheduleByDay[day]?.forEach(classInfo => {
        if (classInfo.startTime) {
          const time24 = classInfo.startTime.includes('AM') || classInfo.startTime.includes('PM')
            ? convertTo24Hour(classInfo.startTime)
            : classInfo.startTime
          slots.add(time24)
        }
      })
    })
    // If no slots found, use default time slots
    if (slots.size === 0) {
      return TIME_SLOTS
    }
    return Array.from(slots).sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
  }

  // Find class at specific day and time
  const getClassAtTime = (day, time) => {
    return scheduleByDay[day]?.find(classInfo => {
      const classStart = classInfo.startTime.includes('AM') || classInfo.startTime.includes('PM')
        ? convertTo24Hour(classInfo.startTime)
        : classInfo.startTime
      return classStart === time
    })
  }

  const handleExport = async () => {
    if (!exportRef.current) return
    
    setIsExporting(true)
    try {
      // High quality export with 3x scale for crisp mobile viewing
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#1a1a1e',
        scale: 3, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: exportRef.current.scrollWidth,
        height: exportRef.current.scrollHeight,
        windowWidth: exportRef.current.scrollWidth,
        windowHeight: exportRef.current.scrollHeight,
      })

      // Create download link with high quality PNG
      const link = document.createElement('a')
      link.download = `timetable-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png', 1.0) // Maximum quality
      link.click()
      
      setIsExporting(false)
      if (onExportSuccess) {
        onExportSuccess()
      }
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
    }
  }

  const timeSlots = getAllTimeSlots()

  return (
    <>
      <button
        onClick={handleExport}
        disabled={isExporting || courses.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-hover text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export as Image'}
      </button>

      {/* Hidden export template - Vertical Layout */}
      <div ref={exportRef} className="fixed -left-[9999px] top-0">
        <div style={{
          width: '1080px', // Standard mobile width (1080px for high-res displays)
          maxWidth: '1080px',
          backgroundColor: '#1a1a1e',
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
          padding: '40px',
          boxSizing: 'border-box',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: '#6366f1', letterSpacing: '-0.5px' }}>
              Weekly Timetable
            </h1>
            <p style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Vertical Timetable - Days as columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {DAYS.map(day => {
              const dayClasses = scheduleByDay[day] || []
              if (dayClasses.length === 0) return null

              return (
                <div key={day} style={{
                  backgroundColor: '#2d2d35',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #3d3d47',
                  marginBottom: '20px',
                }}>
                  {/* Day Header */}
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#6366f1',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #6366f1',
                    letterSpacing: '0.5px',
                  }}>
                    {day.toUpperCase()}
                  </div>

                  {/* Classes for this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dayClasses.map((classInfo, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#6366f1',
                        borderRadius: '12px',
                        padding: '18px',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '6px',
                          letterSpacing: '0.3px',
                        }}>
                          {classInfo.courseCode || classInfo.courseName}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          opacity: 0.95,
                          marginBottom: '10px',
                          fontWeight: '500',
                        }}>
                          {classInfo.courseName}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          opacity: 0.9,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          marginTop: '10px',
                          paddingTop: '10px',
                          borderTop: '1px solid rgba(255,255,255,0.3)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                            <span style={{ fontSize: '14px' }}>🕐</span>
                            <span>{classInfo.startTime} - {classInfo.endTime}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                            <span style={{ fontSize: '14px' }}>📍</span>
                            <span>{classInfo.room || 'TBA'}</span>
                          </div>
                          {classInfo.instructor && classInfo.instructor !== 'TBA' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                              <span style={{ fontSize: '14px' }}>👤</span>
                              <span>{classInfo.instructor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500',
            paddingTop: '20px',
            borderTop: '1px solid #3d3d47',
          }}>
            Generated by Fast Academic Hub
          </div>
        </div>
      </div>
    </>
  )
}

