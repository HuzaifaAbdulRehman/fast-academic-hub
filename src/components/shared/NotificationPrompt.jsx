import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if user has already been asked
    const hasSeenPrompt = localStorage.getItem('notification-prompt-shown')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Only show if:
    // 1. User hasn't seen prompt before
    // 2. Notifications are supported
    // 3. Permission hasn't been granted or denied yet
    if (
      !hasSeenPrompt &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      // Show after 10 seconds to not overwhelm user
      setTimeout(() => {
        setShowPrompt(true)
      }, 10000)
    }
  }, [])

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        // Show a test notification
        new Notification('Absence Tracker', {
          body: 'Daily reminders enabled! You\'ll get notified about your attendance.',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        })
      }

      setShowPrompt(false)
      localStorage.setItem('notification-prompt-shown', 'true')
    } catch (error) {
      setShowPrompt(false)
      localStorage.setItem('notification-prompt-shown', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('notification-prompt-shown', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-dark-surface-raised border border-accent/30 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
            <Bell className="w-5 h-5 text-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-content-primary mb-1">
              Enable Daily Reminders
            </h3>
            <p className="text-xs text-content-secondary mb-3">
              Get notified daily to mark your attendance and stay on track.
            </p>

            <button
              onClick={handleEnable}
              className="w-full bg-gradient-to-br from-accent to-accent-hover text-dark-bg font-semibold rounded-lg px-4 py-2 text-sm transition-all shadow-accent hover:shadow-accent-lg hover:scale-[1.02] active:scale-95 mb-2"
            >
              Enable Notifications
            </button>

            <button
              onClick={handleDismiss}
              className="w-full text-content-tertiary text-xs hover:text-content-secondary transition-colors"
            >
              Not now
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
