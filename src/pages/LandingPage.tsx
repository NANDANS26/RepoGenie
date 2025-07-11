import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Github, Zap, FileText, BarChart3, Sparkles } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/Button'

const LandingPage = () => {
  const navigate = useNavigate()
  const { setGithubUsername, setCurrentStep } = useAppStore()
  const [username, setUsername] = useState('')

  const handleStart = () => {
    if (username.trim()) {
      setGithubUsername(username.trim())
      setCurrentStep(1)
      navigate('/repos')
    }
  }

  const features = [
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Fetch repositories, analyze commits, and extract insights from your GitHub profile'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Analysis',
      description: 'Generate intelligent summaries, SWOT analysis, and recommendations using Gemini AI'
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'Beautiful charts and graphs showing repository statistics and trends'
    },
    {
      icon: FileText,
      title: 'Multiple Formats',
      description: 'Export professional documents in PDF, DOCX, and PPTX formats'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="relative"
              >
                <Zap className="h-16 w-16 text-primary-500" />
                <Github className="h-8 w-8 text-accent-400 absolute -bottom-2 -right-2" />
              </motion.div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">RepoGenie</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Transform your GitHub repositories into professional documents with AI-powered insights, 
              beautiful analytics, and multiple export formats.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
              <div className="relative flex-1 w-full">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Enter GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleStart}
                disabled={!username.trim()}
                size="lg"
                className="w-full sm:w-auto"
              >
                Get Started
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="card card-hover text-center"
              >
                <feature.icon className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass rounded-2xl p-8 max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-sm text-dark-300">Enter GitHub username</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-sm text-dark-300">Select repositories & customize</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-sm text-dark-300">Generate & export documents</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage