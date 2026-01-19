import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Check if user has already dismissed or installed
    const hasSeenPrompt = localStorage.getItem('install-prompt-dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (hasSeenPrompt || isStandalone) {
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS Safari or if beforeinstallprompt doesn't fire, show manual prompt
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.navigator.standalone

    if (isIOS && !isInStandaloneMode && !hasSeenPrompt) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        if (process.env.NODE_ENV === 'development') {
          console.log('User accepted the install prompt')
        }
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
      localStorage.setItem('install-prompt-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (!showPrompt) return null

  // Check if it's iOS
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-dark-surface-raised border border-accent/30 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
            <Download className="w-5 h-5 text-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-content-primary mb-1">
              Install Absence Tracker
            </h3>
            <p className="text-xs text-content-secondary mb-3">
              {isIOS
                ? 'Tap the Share button, then "Add to Home Screen" to install this app.'
                : 'Install this app for quick access and offline use.'}
            </p>

            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-br from-accent to-accent-hover text-dark-bg font-semibold rounded-lg px-4 py-2 text-sm transition-all shadow-accent hover:shadow-accent-lg hover:scale-[1.02] active:scale-95 mb-2"
              >
                Install Now
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full text-content-tertiary text-xs hover:text-content-secondary transition-colors"
            >
              Maybe later
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-dark-surface transition-colors text-content-secondary hover:text-content-primary flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
