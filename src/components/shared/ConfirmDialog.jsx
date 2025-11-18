import { AlertTriangle, X } from 'lucide-react'

/**
 * Reusable confirmation dialog component
 * Professional, accessible, mobile-friendly
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  children
}) {
  if (!isOpen) return null

  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
      confirmText: 'text-dark-bg'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      confirmText: 'text-white'
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10',
      confirmBg: 'bg-accent hover:bg-accent-hover',
      confirmText: 'text-dark-bg'
    }
  }

  const style = typeStyles[type] || typeStyles.warning
  const Icon = style.icon

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl max-w-md w-full animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-5 border-b border-dark-border">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-10 h-10 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${style.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-content-primary">
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-surface-raised rounded-lg transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-5 h-5 text-content-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            {message && (
              <p className="text-sm text-content-secondary leading-relaxed mb-4">
                {message}
              </p>
            )}
            {children}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-dark-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-content-secondary hover:text-content-primary bg-dark-surface hover:bg-dark-surface-raised rounded-lg transition-all border border-dark-border"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium ${style.confirmText} ${style.confirmBg} rounded-lg transition-all`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
