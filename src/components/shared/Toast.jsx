import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, action = null, duration = 3000 }) {
  useEffect(() => {
    // Undo toasts have longer duration (8 seconds) but still auto-dismiss
    const autoDismissDuration = action ? 8000 : duration

    const timer = setTimeout(() => {
      onClose()
    }, autoDismissDuration)

    return () => clearTimeout(timer)
  }, [duration, onClose, action])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-attendance-safe" />,
    error: <AlertCircle className="w-5 h-5 text-attendance-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-accent" />
  }

  const bgColors = {
    success: 'bg-attendance-safe/10 border-attendance-safe/30',
    error: 'bg-attendance-danger/10 border-attendance-danger/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-accent/10 border-accent/30'
  }

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up px-4 w-full max-w-md">
      <div
        className={`
          ${bgColors[type]}
          backdrop-blur-xl rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3
          shadow-glass-lg flex items-center gap-2 sm:gap-3 w-full
        `}
      >
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <span className="text-xs sm:text-sm font-medium text-content-primary flex-1 min-w-0 line-clamp-2">
          {message}
        </span>

        {/* Action Button (e.g., UNDO) */}
        {action && (
          <button
            onClick={() => {
              action.onClick()
              onClose()
            }}
            className="px-2.5 sm:px-3 py-1.5 bg-accent hover:bg-accent-hover active:bg-accent-hover text-dark-bg font-semibold text-[10px] sm:text-xs rounded-lg transition-all uppercase tracking-wider flex-shrink-0"
          >
            {action.label}
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1 hover:bg-dark-surface-raised rounded transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-secondary" />
        </button>
      </div>
    </div>
  )
}
