import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PersonPage } from './pages/PersonPage'
import { PersonFormPage } from './pages/PersonFormPage'
import { SettingsPage } from './pages/SettingsPage'
import { ItineraryFab } from './components/itinerary/ItineraryFab'
import { AppProvider } from './store'
import { fireNotifications } from './notify'

// HashRouter:GitHub Pages 靜態站不支援 SPA fallback,用 hash 避免重新整理時 404
export default function App() {
  useEffect(() => {
    fireNotifications()
  }, [])

  return (
    <HashRouter>
      <AppProvider>
        <div className="mx-auto min-h-dvh max-w-md px-4 pb-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/person/new" element={<PersonFormPage />} />
            <Route path="/person/:id" element={<PersonPage />} />
            <Route path="/person/:id/edit" element={<PersonFormPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
        <ItineraryFab />
      </AppProvider>
    </HashRouter>
  )
}
