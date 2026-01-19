import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: Show prompt to user about app update
    if (process.env.NODE_ENV === 'development') {
      console.log('New content available, please refresh.')
    }
  },
  onOfflineReady() {
    if (process.env.NODE_ENV === 'development') {
      console.log('App ready to work offline')
    }
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
