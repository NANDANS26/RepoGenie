import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Eye, 
  Edit3, 
  FileText, 
  Download, 
  Settings, 
  BookOpen,
  BarChart3,
  Target,
  Lightbulb,
  Shield,
  Zap,
  Package,
  Users,
  Calendar,
  Star,
  GitFork,
  Code,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/Button'

const FinalPreviewPage = () => {
  const navigate = useNavigate()
  const { 
    selectedRepositories, 
    documentFormat, 
    aiTone, 
    aiContent,
    aiInsights,
    setCurrentStep 
  } = useAppStore()

  const [previewMode, setPreviewMode] = useState<'document' | 'sections' | 'analytics'>('document')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)

  const handleContinue = () => {
    setCurrentStep(7)
    navigate('/export')
  }

  const formatTypeLabels = {
    pdf: 'PDF Document',
    docx: 'Word Document',
    pptx: 'PowerPoint Presentation'
  }

  const sectionLabels = {
    summary: 'Executive Summary',
    features: 'Key Features',
    swot: 'SWOT Analysis',
    analytics: 'Visual Analytics',
    recommendations: 'Recommendations',
    technical: 'Technical Overview'
  }

  const enabledSections = Object.entries(documentFormat.sections)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key as keyof typeof documentFormat.sections)

  const enabledCustomSections = documentFormat.customSections.filter(section => section.enabled)

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      FileText, BookOpen, BarChart3, Target, Lightbulb, Settings, Shield, Zap, Package, Users
    }
    return icons[iconName] || FileText
  }

  const getCompletionStatus = () => {
    const totalRepos = selectedRepositories.length
    const completedRepos = selectedRepositories.filter(repo => aiContent[repo.id.toString()]).length
    const hasInsights = !!aiInsights
    
    return {
      repos: { completed: completedRepos, total: totalRepos },
      insights: hasInsights,
      overall: (completedRepos / totalRepos) * 100
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            Final Document Preview
          </h1>
          <p className="text-dark-300 text-lg">
            Review your complete document before generating the final export
          </p>
        </motion.div>

        {/* Completion Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Document Completion Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                status.repos.completed === status.repos.total ? 'bg-green-600' : 'bg-orange-600'
              }`}>
                {status.repos.completed === status.repos.total ? 
                  <CheckCircle className="h-5 w-5 text-white" /> :
                  <AlertCircle className="h-5 w-5 text-white" />
                }
              </div>
              <div>
                <p className="font-medium">Repository Content</p>
                <p className="text-sm text-dark-400">
                  {status.repos.completed}/{status.repos.total} repositories analyzed
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                status.insights ? 'bg-green-600' : 'bg-orange-600'
              }`}>
                {status.insights ? 
                  <CheckCircle className="h-5 w-5 text-white" /> :
                  <AlertCircle className="h-5 w-5 text-white" />
                }
              </div>
              <div>
                <p className="font-medium">AI Insights</p>
                <p className="text-sm text-dark-400">
                  {status.insights ? 'Generated' : 'Not generated'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-600">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Overall Progress</p>
                <p className="text-sm text-dark-400">
                  {Math.round(status.overall)}% complete
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${status.overall}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Document Configuration Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6">Document Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="font-medium text-primary-400 mb-2">Format & Layout</h3>
              <p className="text-dark-300">{formatTypeLabels[documentFormat.type]}</p>
              <p className="text-dark-500 text-sm capitalize">{documentFormat.layout} layout</p>
            </div>
            <div>
              <h3 className="font-medium text-primary-400 mb-2">AI Configuration</h3>
              <p className="text-dark-300 capitalize">{aiTone.style} style</p>
              <p className="text-dark-500 text-sm capitalize">{aiTone.template} template</p>
            </div>
            <div>
              <h3 className="font-medium text-primary-400 mb-2">Target Audience</h3>
              <p className="text-dark-300 capitalize">{aiTone.audience}</p>
              <p className="text-dark-500 text-sm">Detail: {aiTone.detailLevel}/5</p>
            </div>
            <div>
              <h3 className="font-medium text-primary-400 mb-2">Content Sections</h3>
              <p className="text-dark-300">
                {enabledSections.length + enabledCustomSections.length} sections
              </p>
              <p className="text-dark-500 text-sm">
                {enabledCustomSections.length} custom sections
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-dark-700">
            <h3 className="font-medium text-primary-400 mb-3">Document Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-400">Title</p>
                <p className="text-dark-300">{documentFormat.documentTitle}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Subtitle</p>
                <p className="text-dark-300">{documentFormat.documentSubtitle}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {documentFormat.includeTableOfContents && (
                <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs">
                  Table of Contents
                </span>
              )}
              {documentFormat.includeExecutiveSummary && (
                <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs">
                  Executive Summary
                </span>
              )}
              <span className="px-2 py-1 bg-accent-600/20 text-accent-400 rounded-full text-xs capitalize">
                {documentFormat.colorScheme} Theme
              </span>
            </div>
          </div>
        </motion.div>

        {/* Preview Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-dark-800 rounded-lg p-1 flex">
            {[
              { id: 'document', label: 'Document', icon: Eye },
              { id: 'sections', label: 'Content', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPreviewMode(mode.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  previewMode === mode.id
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <mode.icon className="h-4 w-4" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Document Preview */}
          {previewMode === 'document' && (
            <motion.div
              key="document"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-xl p-8 mb-8"
            >
              <div className="max-w-4xl mx-auto">
                {/* Document Header */}
                <div className="text-center mb-8 pb-6 border-b border-dark-700">
                  <h1 className="text-3xl font-bold mb-2">{documentFormat.documentTitle}</h1>
                  <p className="text-dark-400 text-lg">{documentFormat.documentSubtitle}</p>
                  <p className="text-dark-500 text-sm mt-2">
                    Generated for {selectedRepositories.length} repositories • {' '}
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Table of Contents */}
                {documentFormat.includeTableOfContents && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <ol className="space-y-2">
                        {documentFormat.includeExecutiveSummary && (
                          <li className="flex justify-between">
                            <span>Executive Summary</span>
                            <span className="text-dark-500">1</span>
                          </li>
                        )}
                        <li className="flex justify-between">
                          <span>Repository Overview</span>
                          <span className="text-dark-500">2</span>
                        </li>
                        {enabledSections.map((section, index) => (
                          <li key={section} className="flex justify-between">
                            <span>{sectionLabels[section]}</span>
                            <span className="text-dark-500">{index + 3}</span>
                          </li>
                        ))}
                        {enabledCustomSections.map((section, index) => (
                          <li key={section.id} className="flex justify-between">
                            <span>{section.name}</span>
                            <span className="text-dark-500">{enabledSections.length + index + 3}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Repository Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Repository Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRepositories.map(repo => (
                      <div key={repo.id} className="bg-dark-900 rounded-lg p-4">
                        <h3 className="font-semibold text-primary-400 mb-2">{repo.name}</h3>
                        <p className="text-dark-400 text-sm mb-3">{repo.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-dark-500">
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center">
                            <GitFork className="h-3 w-3 mr-1" />
                            {repo.forks_count}
                          </span>
                          {repo.language && (
                            <span className="flex items-center">
                              <Code className="h-3 w-3 mr-1" />
                              {repo.language}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Previews */}
                {enabledSections.includes('summary') && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-dark-300">
                        This comprehensive analysis covers {selectedRepositories.length} repositories 
                        with detailed AI-generated insights, technical assessments, and strategic recommendations. 
                        The analysis follows a {aiTone.style} approach tailored for {aiTone.audience} audience.
                      </p>
                    </div>
                  </div>
                )}

                {enabledSections.includes('analytics') && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Visual Analytics</h2>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-dark-300">
                        Interactive charts and graphs showing repository statistics, language distribution, 
                        and engagement metrics will be embedded in this section.
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Sections Preview */}
                {enabledCustomSections.map(section => {
                  const IconComponent = getIconComponent(section.icon)
                  return (
                    <div key={section.id} className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <IconComponent className="h-5 w-5 mr-2 text-primary-500" />
                        {section.name}
                      </h2>
                      <div className="bg-dark-900 rounded-lg p-4">
                        <p className="text-dark-300">{section.description}</p>
                        <p className="text-dark-500 text-sm mt-2 italic">
                          Content will be generated based on: "{section.aiPrompt}"
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Content Sections */}
          {previewMode === 'sections' && (
            <motion.div
              key="sections"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 mb-8"
            >
              {/* Repository Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedRepo(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedRepo === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  All Repositories
                </button>
                {selectedRepositories.map(repo => (
                  <button
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo.id.toString())}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedRepo === repo.id.toString()
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {repo.name}
                  </button>
                ))}
              </div>

              {selectedRepositories
                .filter(repo => selectedRepo === null || repo.id.toString() === selectedRepo)
                .map(repo => {
                  const content = aiContent[repo.id.toString()]
                  
                  return (
                    <div key={repo.id} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">{repo.name}</h2>
                        <div className="flex items-center space-x-2">
                          {content ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                          )}
                          <span className="text-sm text-dark-400">
                            {content ? 'Content Ready' : 'Content Missing'}
                          </span>
                        </div>
                      </div>
                      
                      {content ? (
                        <div className="space-y-6">
                          {enabledSections.includes('summary') && (
                            <div>
                              <h3 className="text-lg font-semibold text-primary-400 mb-2">Summary</h3>
                              <p className="text-dark-300">{content.summary}</p>
                            </div>
                          )}

                          {enabledSections.includes('features') && (
                            <div>
                              <h3 className="text-lg font-semibold text-primary-400 mb-2">Key Features</h3>
                              <ul className="space-y-1">
                                {content.features.slice(0, 5).map((feature, idx) => (
                                  <li key={idx} className="text-dark-300">• {feature}</li>
                                ))}
                                {content.features.length > 5 && (
                                  <li className="text-dark-500 text-sm">
                                    ... and {content.features.length - 5} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {enabledSections.includes('recommendations') && (
                            <div>
                              <h3 className="text-lg font-semibold text-primary-400 mb-2">Recommendations</h3>
                              <ol className="space-y-1">
                                {content.recommendations.slice(0, 3).map((rec, idx) => (
                                  <li key={idx} className="text-dark-300">{idx + 1}. {rec}</li>
                                ))}
                                {content.recommendations.length > 3 && (
                                  <li className="text-dark-500 text-sm">
                                    ... and {content.recommendations.length - 3} more recommendations
                                  </li>
                                )}
                              </ol>
                            </div>
                          )}

                          {/* Custom Sections */}
                          {content.customSections && enabledCustomSections.map(section => {
                            if (!content.customSections![section.id]) return null
                            const IconComponent = getIconComponent(section.icon)
                            return (
                              <div key={section.id}>
                                <h3 className="text-lg font-semibold text-primary-400 mb-2 flex items-center">
                                  <IconComponent className="h-4 w-4 mr-2" />
                                  {section.name}
                                </h3>
                                <p className="text-dark-300">
                                  {content.customSections![section.id].substring(0, 200)}
                                  {content.customSections![section.id].length > 200 && '...'}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-dark-400">No AI content generated for this repository.</p>
                      )}
                    </div>
                  )
                })}
            </motion.div>
          )}

          {/* Analytics Preview */}
          {previewMode === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 mb-8"
            >
              <div className="card">
                <h2 className="text-2xl font-semibold mb-4">Analytics Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {selectedRepositories.reduce((sum, repo) => sum + repo.stargazers_count, 0).toLocaleString()}
                    </div>
                    <p className="text-dark-400">Total Stars</p>
                  </div>
                  <div className="text-center">
                    <GitFork className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {selectedRepositories.reduce((sum, repo) => sum + repo.forks_count, 0).toLocaleString()}
                    </div>
                    <p className="text-dark-400">Total Forks</p>
                  </div>
                  <div className="text-center">
                    <Code className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {[...new Set(selectedRepositories.map(repo => repo.language).filter(Boolean))].length}
                    </div>
                    <p className="text-dark-400">Languages</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {Math.round(
                        selectedRepositories.reduce((sum, repo) => {
                          const age = (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
                          return sum + age
                        }, 0) / selectedRepositories.length
                      )}
                    </div>
                    <p className="text-dark-400">Avg Age (months)</p>
                  </div>
                </div>
              </div>

              {aiInsights && (
                <div className="card">
                  
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Button
            onClick={() => navigate('/ai-preview')}
            variant="outline"
            size="lg"
          >
            <Edit3 className="h-5 w-5 mr-2" />
            Edit Content
          </Button>
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={status.overall < 100}
          >
            <Download className="h-5 w-5 mr-2" />
            Generate Document
          </Button>
        </motion.div>

        {status.overall < 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <p className="text-orange-400 text-sm">
              Complete all repository analysis and AI insights before generating the document
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default FinalPreviewPage