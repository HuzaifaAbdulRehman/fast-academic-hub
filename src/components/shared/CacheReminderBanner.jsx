import { RefreshCw, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { vibrate } from '../../utils/uiHelpers'

/**
 * Cache Reminder Banner Component
 * Shows a friendly reminder to refresh when data might be outdated
 */
export default function CacheReminderBanner({
  message,
  onRefresh,
  dismissible = true,
  show = true,
  autoDismissAfter = null
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(show)

  // Auto-dismiss after specified time
  useEffect(() => {
    if (autoDismissAfter && isVisible && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true)
      }, autoDismissAfter)

      return () => clearTimeout(timer)
    }
  }, [autoDismissAfter, isVisible, isDismissed])

  // Update visibility when show prop changes
  useEffect(() => {
    setIsVisible(show)
    if (show) {
      setIsDismissed(false) // Reset dismissal when showing again
    }
  }, [show])

  if (isDismissed || !isVisible) return null

  const handleDismiss = () => {
    vibrate([10])
    setIsDismissed(true)
  }

  const handleRefresh = () => {
    vibrate([10, 50, 10])
    onRefresh?.()
  }

  return (
    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-accent/5 border border-accent/20 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 animate-fade-in">
      {/* Icon */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-content-secondary leading-relaxed">
          {message || "If your data looks outdated, try refreshing the page."}
        </p>

        {/* Refresh Button - Mobile optimized */}
        {onRefresh && (
          <button
            onClick={handleRefresh}
            className="mt-2 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-accent hover:bg-accent-hover active:bg-accent text-dark-bg text-[10px] sm:text-xs font-medium rounded-md transition-all flex items-center gap-1 sm:gap-1.5"
          >
            <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Refresh Now</span>
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-accent/10 rounded transition-colors flex-shrink-0"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-tertiary" />
        </button>
      )}
    </div>
  )
}
