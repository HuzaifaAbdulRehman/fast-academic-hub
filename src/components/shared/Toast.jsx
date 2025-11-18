import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, action = null, duration = 3000 }) {
  useEffect(() => {
    // Don't auto-close if there's an action button (permanent until manually dismissed)
    if (action) {
      return // No auto-close timer for undo toasts
    }

    const timer = setTimeout(() => {
      onClose()
    }, duration)

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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div
        className={`
          ${bgColors[type]}
          backdrop-blur-xl rounded-xl border px-4 py-3
          shadow-glass-lg flex items-center gap-3 min-w-[280px] max-w-md
        `}
      >
        {icons[type]}
        <span className="text-sm font-medium text-content-primary flex-1">
          {message}
        </span>

        {/* Action Button (e.g., UNDO) */}
        {action && (
          <button
            onClick={() => {
              action.onClick()
              onClose()
            }}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-dark-bg font-medium text-xs rounded-lg transition-all uppercase tracking-wider"
          >
            {action.label}
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1 hover:bg-dark-surface-raised rounded transition-colors ml-1"
        >
          <X className="w-4 h-4 text-content-secondary" />
        </button>
      </div>
    </div>
  )
}
