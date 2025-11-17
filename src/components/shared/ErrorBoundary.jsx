import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })

    // Log to console in development
    console.error('Error caught by boundary:', error, errorInfo)

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleClearData = () => {
    if (confirm('This will clear all app data and reload. Continue?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-attendance-danger/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-attendance-danger" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-content-primary mb-2">
                Something went wrong
              </h1>
              <p className="text-content-secondary">
                The app encountered an unexpected error. Don't worry, your data should be safe.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-dark-surface-raised rounded-xl border border-dark-border">
                <p className="text-xs font-mono text-attendance-danger mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-content-tertiary">
                    <summary className="cursor-pointer hover:text-content-secondary">
                      Stack trace
                    </summary>
                    <pre className="mt-2 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-br from-accent to-accent-hover text-dark-bg font-semibold px-6 py-4 rounded-xl transition-all hover:shadow-accent-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reload App
              </button>

              <button
                onClick={this.handleClearData}
                className="w-full bg-dark-surface-raised border border-dark-border hover:border-attendance-danger text-content-primary font-medium px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                Clear All Data & Reload
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-content-tertiary text-center mt-6">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
