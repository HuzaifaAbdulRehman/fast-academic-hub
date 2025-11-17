import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/shared/Header'
import AttendanceView from './components/attendance/AttendanceView'
import InstallPrompt from './components/shared/InstallPrompt'
import NotificationPrompt from './components/shared/NotificationPrompt'
import ErrorBoundary from './components/shared/ErrorBoundary'

function AppContent() {
  return (
    <div className="min-h-screen bg-dark-bg dark:bg-dark-bg light:bg-gray-50">
      <Header />

      <main className="container mx-auto px-3 md:px-4 py-3 md:py-4 max-w-7xl">
        <AttendanceView />
      </main>

      {/* Install and notification prompts */}
      <InstallPrompt />
      <NotificationPrompt />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
