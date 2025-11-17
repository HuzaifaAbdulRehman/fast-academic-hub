import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/shared/Header'
import AttendanceView from './components/attendance/AttendanceView'

function AppContent() {
  return (
    <div className="min-h-screen bg-dark-bg dark:bg-dark-bg light:bg-gray-50">
      <Header />

      <main className="container mx-auto px-3 md:px-4 py-3 md:py-4 max-w-7xl">
        <AttendanceView />
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
