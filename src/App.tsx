import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Pages
import LandingPage from './pages/LandingPage'
import RepoSelectionPage from './pages/RepoSelectionPage'
import FormatControlPage from './pages/FormatControlPage'
import AITonePage from './pages/AITonePage'
import AIPreviewPage from './pages/AIPreviewPage'
import AnalyticsPage from './pages/AnalyticsPage'
import FinalPreviewPage from './pages/FinalPreviewPage'
import ExportPage from './pages/ExportPage'
import ScrollToTop from "./components/scrolltotop";

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white">
      <Navbar />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        ><ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/repos" element={<RepoSelectionPage />} />
            <Route path="/format" element={<FormatControlPage />} />
            <Route path="/ai-tone" element={<AITonePage />} />
            <Route path="/ai-preview" element={<AIPreviewPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/preview" element={<FinalPreviewPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default App