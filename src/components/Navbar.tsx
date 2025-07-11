import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Github, Zap } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const Navbar = () => {
  const location = useLocation()
  const { currentStep } = useAppStore()

  const steps = [
    { path: '/', label: 'Start', step: 0 },
    { path: '/repos', label: 'Repos', step: 1 },
    { path: '/format', label: 'Format', step: 2 },
    { path: '/ai-tone', label: 'AI Tone', step: 3 },
    { path: '/ai-preview', label: 'AI Preview', step: 4 },
    { path: '/analytics', label: 'Analytics', step: 5 },
    { path: '/preview', label: 'Preview', step: 6 },
    { path: '/export', label: 'Export', step: 7 },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass border-b border-dark-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary-500" />
              <Github className="h-4 w-4 text-accent-400 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-xl font-bold gradient-text">RepoGenie</span>
          </Link>

          {/* Progress Steps */}
          {location.pathname !== '/' && (
            <div className="hidden md:flex items-center space-x-1">
              {steps.slice(1).map((step, index) => (
                <div key={step.path} className="flex items-center">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      currentStep >= step.step
                        ? 'bg-primary-600 text-white'
                        : currentStep === step.step - 1
                        ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                        : 'bg-dark-700 text-dark-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  {index < steps.length - 2 && (
                    <div
                      className={`w-8 h-0.5 mx-1 transition-all duration-200 ${
                        currentStep > step.step ? 'bg-primary-600' : 'bg-dark-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors duration-200"
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar