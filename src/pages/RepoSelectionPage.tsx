import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Star, GitFork, Calendar, Code, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { useAppStore, type Repository } from '../store/useAppStore'
import { fetchUserRepositories } from '../services/githubApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const RepoSelectionPage = () => {
  const navigate = useNavigate()
  const {
    githubUsername,
    setRepositories,
    selectedRepositories,
    setSelectedRepositories,
    isLoadingRepos,
    setIsLoadingRepos,
    setCurrentStep
  } = useAppStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [repositories, setLocalRepositories] = useState<Repository[]>([])

  useEffect(() => {
    if (!githubUsername) {
      navigate('/')
      return
    }

    // Reset selections when component mounts
    setSelectedRepositories([])

    const loadRepositories = async () => {
      setIsLoadingRepos(true)
      setError('')
      
      try {
        const repos = await fetchUserRepositories(githubUsername)
        setLocalRepositories(repos)
        setRepositories(repos) // Still store in global state if needed elsewhere
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
      } finally {
        setIsLoadingRepos(false)
      }
    }

    loadRepositories()
  }, [githubUsername, navigate, setRepositories, setSelectedRepositories, setIsLoadingRepos])

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const toggleRepoSelection = (repo: Repository) => {
  const isSelected = selectedRepositories.some(r => r.id === repo.id)
  const updated = isSelected
    ? selectedRepositories.filter(r => r.id !== repo.id)
    : [...selectedRepositories, repo]

  setSelectedRepositories(updated)
}

  const handleContinue = () => {
    if (selectedRepositories.length > 0) {
      setCurrentStep(2)
      navigate('/format')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!githubUsername) {
    return null
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-dark-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-4xl font-bold mb-4 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Select Repositories
          </motion.h1>
          <motion.p
            className="text-dark-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Choose the repositories you want to include in your document for{' '}
            <span className="text-primary-400 font-semibold">@{githubUsername}</span>
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-3"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoadingRepos ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-20"
          >
            <LoadingSpinner size="lg" text="Fetching repositories..." />
          </motion.div>
        ) : (
          <>
            {/* Search and Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <motion.div 
                  className="relative flex-1 max-w-md"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  />
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-4 text-sm text-dark-400"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>{filteredRepos.length} repositories</span>
                  <span>•</span>
                  <span>{selectedRepositories.length} selected</span>
                </motion.div>
              </div>

              <AnimatePresence>
                {selectedRepositories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-center"
                  >
                    <Button 
                      onClick={handleContinue} 
                      size="lg"
                      className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-shadow"
                    >
                      Continue with {selectedRepositories.length} {selectedRepositories.length === 1 ? 'Repository' : 'repositories'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Repository Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredRepos.map((repo) => {
                  const isSelected = selectedRepositories.some(r => r.id === repo.id)
                  
                  return (
                    <motion.div
                      key={repo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`card cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'ring-2 ring-primary-500 bg-primary-900/20 shadow-lg shadow-primary-500/10' 
                          : 'hover:bg-dark-700 hover:shadow-lg'
                      }`}
                      onClick={() => toggleRepoSelection(repo)}
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                            {repo.name}
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-2"
                              >
                                <CheckCircle className="h-5 w-5 text-primary-500" />
                              </motion.span>
                            )}
                          </h3>
                          <p className="text-dark-300 text-sm line-clamp-2">
                            {repo.description || 'No description available'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-dark-400 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{repo.stargazers_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GitFork className="h-4 w-4" />
                            <span>{repo.forks_count.toLocaleString()}</span>
                          </div>
                        </div>
                        {repo.language && (
                          <div className="flex items-center space-x-1">
                            <Code className="h-4 w-4" />
                            <span>{repo.language}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-dark-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated {formatDate(repo.updated_at)}</span>
                        </div>
                        <span>{(repo.size / 1024).toFixed(1)} MB</span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {filteredRepos.length === 0 && !isLoadingRepos && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-dark-400 text-lg">No repositories found matching your search</p>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                  >
                    Clear search
                  </Button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RepoSelectionPage