import { useState, useEffect } from 'react'
import { X, Settings, Download, Trash2, AlertTriangle } from 'lucide-react'
import Toast from './Toast'

export default function NotificationSettings({ onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [toast, setToast] = useState(null)

  // Mobile detection
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isIOSStandalone = window.navigator.standalone

    // Don't show install button if already installed
    if (isStandalone || isIOSStandalone) {
      setCanInstall(false)
      return
    }

    // Show install button immediately for all platforms (not installed)
    setCanInstall(true)

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

    // iOS installation instructions
    if (isIOS) {
      setToast({
        message: '📱 To install FAST Academic Hub: Tap Share (⬆️) → "Add to Home Screen" → "Add"',
        type: 'info',
        duration: 8000
      })
      return
    }

    // For Android/Chrome
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          setCanInstall(false)
          setToast({
            message: 'FAST Academic Hub installed successfully! Check your home screen.',
            type: 'success'
          })
        }

        setDeferredPrompt(null)
      } catch (error) {
        setToast({
          message: '📱 To install FAST Academic Hub: Tap menu (⋮) → "Install app" or "Add to Home Screen"',
          type: 'info',
          duration: 8000
        })
      }
    } else {
      // Fallback: Browser doesn't support automatic prompt
      setToast({
        message: '📱 To install FAST Academic Hub: Tap menu (⋮) → "Install app" or "Add to Home Screen". Make sure you\'re using Chrome or Edge.',
        type: 'info',
        duration: 8000
      })
    }
  }

  // Haptic feedback
  const vibrate = (pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Handle data reset - Show modal
  const handleResetData = () => {
    setShowResetModal(true)
  }

  // Confirm and execute reset
  const confirmResetData = async () => {
    if (deleteConfirmation === 'DELETE') {
      try {
        // 1. Clear localStorage
        localStorage.clear()

        // 2. Clear sessionStorage
        sessionStorage.clear()

        // 3. Clear ServiceWorker caches (PWA)
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        }

        // 4. Unregister ServiceWorkers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(
            registrations.map(registration => registration.unregister())
          )
        }

        // 5. Force hard reload to start completely fresh
        window.location.href = window.location.href + '?reset=true&t=' + Date.now()
      } catch (error) {
        // Fallback: at minimum clear localStorage and reload
        localStorage.clear()
        window.location.reload()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-dark-surface-raised rounded-2xl shadow-2xl border border-dark-border max-w-md w-full ${
          isMobile ? 'animate-slide-up' : 'animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent/10 rounded-lg">
              <Settings className="w-4 h-4 text-accent" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-content-primary">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-surface transition-colors text-content-secondary hover:text-content-primary"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 space-y-5">
          {/* Install App */}
          {canInstall && (
            <div>
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium text-content-primary">Install App</p>
                </div>
                <p className="text-xs text-content-tertiary">
                  Install FAST Academic Hub for quick access and offline use
                </p>
                <button
                  onClick={() => {
                    vibrate(15)
                    handleInstall()
                  }}
                  className="w-full bg-gradient-to-br from-accent to-accent-hover text-dark-bg font-semibold rounded-lg px-4 py-2.5 transition-all shadow-accent hover:shadow-accent-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
              </div>
            </div>
          )}

          {/* Reset All Data - Danger Zone */}
          <div className="pt-2 border-t border-attendance-danger/30">
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-attendance-danger" />
                <p className="text-sm font-medium text-attendance-danger">Danger Zone</p>
              </div>
              <p className="text-xs text-content-tertiary">
                Permanently erase all data and start fresh. This cannot be undone!
              </p>
              <button
                onClick={() => {
                  vibrate([10, 50, 10])
                  handleResetData()
                }}
                className="w-full bg-attendance-danger/10 border border-attendance-danger/30 text-attendance-danger font-semibold rounded-lg px-4 py-2.5 transition-all hover:bg-attendance-danger/20 hover:border-attendance-danger/50 active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Erase All Data
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-dark-border">
          <button
            onClick={onClose}
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2.5 text-content-primary font-medium hover:bg-dark-surface-raised transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowResetModal(false)
            setDeleteConfirmation('')
          }}
        >
          <div
            className={`bg-dark-surface-raised rounded-2xl shadow-2xl border border-attendance-danger/50 max-w-md w-full ${
              isMobile ? 'animate-slide-up' : 'animate-scale-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-attendance-danger/30 bg-attendance-danger/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-attendance-danger/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-attendance-danger animate-pulse" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-attendance-danger">
                  Confirm Data Deletion
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setDeleteConfirmation('')
                }}
                className="p-1.5 rounded-lg hover:bg-dark-surface transition-colors text-content-secondary hover:text-content-primary"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-5 space-y-4">
              <div className="bg-attendance-danger/10 border border-attendance-danger/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-attendance-danger mb-2">
                  WARNING: This action cannot be undone!
                </p>
                <p className="text-xs text-content-secondary leading-relaxed">
                  This will permanently delete:
                </p>
                <ul className="text-xs text-content-secondary mt-2 space-y-1 list-disc list-inside">
                  <li>All courses and their details</li>
                  <li>All attendance records</li>
                  <li>All semesters</li>
                  <li>All settings and preferences</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-content-primary">
                  Type <span className="font-mono font-bold text-attendance-danger">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full bg-dark-surface border-2 border-dark-border rounded-lg px-4 py-3 text-content-primary font-mono focus:outline-none focus:ring-2 focus:ring-attendance-danger/30 focus:border-attendance-danger/50 transition-all placeholder:text-content-tertiary placeholder:font-sans"
                  autoFocus
                />
                {deleteConfirmation && deleteConfirmation !== 'DELETE' && (
                  <p className="text-xs text-attendance-warning">
                    Please type exactly "DELETE" in all caps
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 md:p-5 border-t border-dark-border">
              <button
                onClick={() => {
                  vibrate([10])
                  setShowResetModal(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-4 py-2.5 text-content-primary font-medium hover:bg-dark-surface-raised transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  vibrate([10, 100, 10])
                  confirmResetData()
                }}
                disabled={deleteConfirmation !== 'DELETE'}
                className="flex-1 bg-gradient-to-br from-attendance-danger to-red-700 text-white font-bold rounded-lg px-4 py-2.5 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Erase All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.duration || 3000}
        />
      )}
    </div>
  )
}
