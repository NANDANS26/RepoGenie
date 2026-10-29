import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  Edit3, 
  RefreshCw, 
  CheckCircle, 
  Save, 
  Wand2, 
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  Users,
  Zap,
  Building,
  AlertCircle,
  Star,
  Award,
  Gauge,
  Globe,
  Code,
  FileText,
  Activity
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { generateAIContent, generateBatchAIContent } from '../services/ollamaApi'
import { fetchEnhancedRepositoryData } from '../services/githubApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const AIPreviewPage = () => {
  const navigate = useNavigate()
  const {
    selectedRepositories,
    aiTone,
    aiContent,
    setAIContent,
    isGeneratingAI,
    setIsGeneratingAI,
    setCurrentStep,
    documentFormat,
    enhancedRepositoryData,
    setEnhancedRepositoryData
  } = useAppStore()

  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set())
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const [analysisPhase, setAnalysisPhase] = useState<string>('')
  const [enhancedDataProgress, setEnhancedDataProgress] = useState(0)

  useEffect(() => {
    if (selectedRepositories.length > 0) {
      generateContentForRepos()
    }
  }, [])

  const generateContentForRepos = async () => {
    setIsGeneratingAI(true)
    setGenerationProgress(0)
    setAnalysisPhase('Fetching comprehensive repository data...')
    
    try {
      // First, fetch enhanced data for all repositories
      const enhancedRepos = []
      for (let i = 0; i < selectedRepositories.length; i++) {
        const repo = selectedRepositories[i]
        setAnalysisPhase(`Analyzing repository structure: ${repo.name}`)
        setEnhancedDataProgress(((i + 1) / selectedRepositories.length) * 50)
        
        try {
          const enhancedData = await fetchEnhancedRepositoryData(repo)
          setEnhancedRepositoryData(repo.id.toString(), enhancedData)
          enhancedRepos.push(enhancedData)
        } catch (error) {
          console.error(`Failed to fetch enhanced data for ${repo.name}:`, error)
          enhancedRepos.push(repo)
        }
      }

      setAnalysisPhase('Generating comprehensive AI analysis...')
      
      // Generate AI content with enhanced data
      const results = await generateBatchAIContent(
        enhancedRepos,
        aiTone,
        documentFormat.customSections,
        (completed, total) => {
          const progress = 50 + ((completed / total) * 50)
          setGenerationProgress(progress)
          setAnalysisPhase(`Generating AI analysis: ${completed}/${total} repositories`)
        }
      )
      
      Object.entries(results).forEach(([repoId, content]) => {
        setAIContent(repoId, content)
      })

      setAnalysisPhase('Analysis complete!')
    } catch (error) {
      console.error('Failed to generate AI content:', error)
      setAnalysisPhase(`Ollama analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingAI(false)
      setGenerationProgress(100)
      setEnhancedDataProgress(100)
    }
  }

  const handleEditSection = (repoId: string, section: string, content: string) => {
    setEditingSection(`${repoId}-${section}`)
    setEditContent(content)
  }

  const handleSaveEdit = (repoId: string, section: string) => {
    const currentContent = aiContent[repoId]
    if (currentContent) {
      const updatedContent = { ...currentContent }
      
      if (section === 'summary') {
        updatedContent.summary = editContent
      } else if (section === 'technical') {
        updatedContent.technicalOverview = editContent
      } else if (section === 'businessValue') {
        updatedContent.businessValue = editContent
      } else if (section === 'socialImpact') {
        updatedContent.socialImpact = editContent
      } else if (section === 'features') {
        updatedContent.features = editContent.split('\n').filter(f => f.trim())
      } else if (section === 'recommendations') {
        updatedContent.recommendations = editContent.split('\n').filter(r => r.trim())
      } else if (section.startsWith('custom-')) {
        const customSectionId = section.replace('custom-', '')
        if (!updatedContent.customSections) {
          updatedContent.customSections = {}
        }
        updatedContent.customSections[customSectionId] = editContent
      }
      
      setAIContent(repoId, updatedContent)
    }
    
    setEditingSection(null)
    setEditContent('')
  }

  const handleRegenerateContent = async (repoId: string) => {
    const repo = selectedRepositories.find(r => r.id.toString() === repoId)
    if (repo) {
      setIsGeneratingAI(true)
      setAnalysisPhase(`Regenerating analysis for ${repo.name}...`)
      let failureMessage = ''
      try {
        const enhancedData = enhancedRepositoryData[repoId] || repo
        const content = await generateAIContent(enhancedData, aiTone, documentFormat.customSections)
        setAIContent(repoId, content)
      } catch (error) {
        console.error(`Failed to regenerate content for ${repo.name}:`, error)
        failureMessage = error instanceof Error ? error.message : 'Unknown error'
      }
      setIsGeneratingAI(false)
      setAnalysisPhase(failureMessage ? `Ollama generation failed: ${failureMessage}` : '')
    }
  }

  const handleBatchRegenerate = async () => {
    const reposToRegenerate = selectedRepositories.filter(repo => 
      selectedRepos.has(repo.id.toString())
    )
    
    if (reposToRegenerate.length === 0) return

    setIsGeneratingAI(true)
    setGenerationProgress(0)
    setAnalysisPhase('Regenerating selected repositories...')
    let failureMessage = ''

    try {
      const enhancedRepos = reposToRegenerate.map(repo => 
        enhancedRepositoryData[repo.id.toString()] || repo
      )
      
      const results = await generateBatchAIContent(
        enhancedRepos,
        aiTone,
        documentFormat.customSections,
        (completed, total) => {
          setGenerationProgress((completed / total) * 100)
          setAnalysisPhase(`Regenerating: ${completed}/${total} repositories`)
        }
      )
      
      Object.entries(results).forEach(([repoId, content]) => {
        setAIContent(repoId, content)
      })
    } catch (error) {
      console.error('Failed to regenerate batch content:', error)
      failureMessage = error instanceof Error ? error.message : 'Unknown error'
    } finally {
      setIsGeneratingAI(false)
      setSelectedRepos(new Set())
      setAnalysisPhase(failureMessage ? `Ollama generation failed: ${failureMessage}` : '')
    }
  }

  const toggleRepoExpansion = (repoId: string) => {
    const newExpanded = new Set(expandedRepos)
    if (newExpanded.has(repoId)) {
      newExpanded.delete(repoId)
    } else {
      newExpanded.add(repoId)
    }
    setExpandedRepos(newExpanded)
  }

  const toggleRepoSelection = (repoId: string) => {
    const newSelected = new Set(selectedRepos)
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId)
    } else {
      newSelected.add(repoId)
    }
    setSelectedRepos(newSelected)
  }

  const handleContinue = () => {
    setCurrentStep(5)
    navigate('/analytics')
  }

  const allContentGenerated = selectedRepositories.every(repo => 
    aiContent[repo.id.toString()]
  )

  const getCustomSectionIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Shield, Settings, Target, TrendingUp, Lightbulb, Building, Users, Zap, BarChart3
    }
    return icons[iconName] || Settings
  }

  const getQualityScore = (content: any) => {
    if (!content) return 0
    let score = 0
    if (content.summary && content.summary.length > 200) score += 2
    if (content.features && content.features.length >= 5) score += 2
    if (content.technicalOverview && content.technicalOverview.length > 300) score += 2
    if (content.businessValue && content.businessValue.length > 200) score += 2
    if (content.innovationScore && content.innovationScore > 7) score += 2
    return Math.min(10, score)
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Repository Analysis
          </h1>
          <p className="text-dark-300 text-lg">
            Comprehensive technical and strategic analysis of your {selectedRepositories.length} selected repositories
          </p>
        </motion.div>

        {/* Enhanced Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-primary-400">AI Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Style:</span>
                  <span className="text-primary-400 capitalize">{aiTone.style}</span>
                </div>
                <div className="flex justify-between">
                  <span>Audience:</span>
                  <span className="text-accent-400 capitalize">{aiTone.audience}</span>
                </div>
                <div className="flex justify-between">
                  <span>Detail Level:</span>
                  <span className="text-green-400">{aiTone.detailLevel}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical Depth:</span>
                  <span className="text-blue-400">{aiTone.technicalDepth}/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-primary-400">Analysis Scope</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Repositories:</span>
                  <span className="text-white font-medium">{selectedRepositories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Sections:</span>
                  <span className="text-green-400">
                    {Object.values(documentFormat.sections).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Sections:</span>
                  <span className="text-blue-400">
                    {documentFormat.customSections.filter(s => s.enabled).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Focus Areas:</span>
                  <span className="text-purple-400">{aiTone.focusAreas.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-primary-400">Progress Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Data Collection:</span>
                  <span className="text-green-400">{enhancedDataProgress.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Analysis:</span>
                  <span className="text-blue-400">{generationProgress.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="text-white font-medium">
                    {Object.keys(aiContent).length}/{selectedRepositories.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              {analysisPhase && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  <span className="text-sm text-primary-400">{analysisPhase}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedRepos.size > 0 && (
                <Button
                  onClick={handleBatchRegenerate}
                  disabled={isGeneratingAI}
                  variant="outline"
                  size="sm"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Regenerate Selected ({selectedRepos.size})
                </Button>
              )}
              
              <Button
                onClick={generateContentForRepos}
                disabled={isGeneratingAI}
                variant="primary"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate All
              </Button>
            </div>
          </div>

          {isGeneratingAI && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">
                  {analysisPhase || 'Generating comprehensive AI analysis...'}
                </span>
                <span className="text-sm text-primary-400">{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-accent-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {isGeneratingAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <LoadingSpinner size="lg" />
            <div className="mt-6 text-center max-w-md">
              <h3 className="text-xl font-semibold mb-2">Advanced AI Analysis in Progress</h3>
              <p className="text-dark-400 text-sm">
                Our AI is performing comprehensive analysis including code structure, 
                innovation assessment, business value evaluation, and strategic insights.
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          {selectedRepositories.map((repo, index) => {
            const content = aiContent[repo.id.toString()]
            const enhancedData = enhancedRepositoryData[repo.id.toString()]
            const isExpanded = expandedRepos.has(repo.id.toString())
            const isSelected = selectedRepos.has(repo.id.toString())
            const qualityScore = getQualityScore(content)
            
            return (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary-500 bg-primary-900/10' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRepoSelection(repo.id.toString())}
                      className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{repo.name}</h2>
                        {content && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-500 font-medium">
                                {qualityScore}/10
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-dark-400 mb-3">{repo.description}</p>
                      
                      {/* Enhanced Repository Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Code className="h-4 w-4 text-blue-400" />
                          <span className="text-dark-400">{repo.language || 'Multi-lang'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-400" />
                          <span className="text-dark-400">{(repo.size / 1024).toFixed(1)} MB</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-purple-400" />
                          <span className="text-dark-400">
                            {Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))}mo old
                          </span>
                        </div>
                        {enhancedData?.codeMetrics && (
                          <div className="flex items-center space-x-2">
                            <Gauge className="h-4 w-4 text-orange-400" />
                            <span className="text-dark-400">
                              {enhancedData.codeMetrics.maintainabilityIndex}/100
                            </span>
                          </div>
                        )}
                        {content?.innovationScore && (
                          <div className="flex items-center space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                            <span className="text-dark-400">
                              {content.innovationScore.toFixed(1)}/10
                            </span>
                          </div>
                        )}
                        {enhancedData?.communityMetrics && (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-cyan-400" />
                            <span className="text-dark-400">
                              {enhancedData.communityMetrics.communityHealth}/100
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => toggleRepoExpansion(repo.id.toString())}
                      variant="ghost"
                      size="sm"
                    >
                      {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => handleRegenerateContent(repo.id.toString())}
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingAI}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && content && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      {/* Enhanced Metrics Dashboard */}
                      {(content.innovationScore || content.marketPotential || content.technicalComplexity) && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-primary-400 mb-4 flex items-center">
                            <Award className="h-5 w-5 mr-2" />
                            AI Assessment Scores
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {content.innovationScore && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400 mb-1">
                                  {content.innovationScore.toFixed(1)}/10
                                </div>
                                <p className="text-sm text-dark-400">Innovation Score</p>
                              </div>
                            )}
                            {content.marketPotential && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-400 mb-1">
                                  {content.marketPotential.split(' - ')[0]}
                                </div>
                                <p className="text-sm text-dark-400">Market Potential</p>
                              </div>
                            )}
                            {content.adoptionReadiness && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-400 mb-1">
                                  {content.adoptionReadiness.split(' - ')[0]}
                                </div>
                                <p className="text-sm text-dark-400">Adoption Readiness</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Executive Summary */}
                      {documentFormat.sections.summary && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                              <FileText className="h-5 w-5 mr-2" />
                              Executive Summary
                            </h3>
                            <Button
                              onClick={() => handleEditSection(repo.id.toString(), 'summary', content.summary)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingSection === `${repo.id}-summary` ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-32 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSaveEdit(repo.id.toString(), 'summary')}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingSection(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-dark-300 leading-relaxed">{content.summary}</p>
                          )}
                        </div>
                      )}

                      {/* Key Features */}
                      {documentFormat.sections.features && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                              <Target className="h-5 w-5 mr-2" />
                              Key Features & Capabilities
                            </h3>
                            <Button
                              onClick={() => handleEditSection(repo.id.toString(), 'features', content.features.join('\n'))}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingSection === `${repo.id}-features` ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Enter each feature on a new line"
                                className="w-full h-32 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() =>  handleSaveEdit(repo.id.toString(), 'features')}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingSection(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {content.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 bg-dark-800 rounded-lg">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-dark-300 text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Technical Overview */}
                      {documentFormat.sections.technical && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                              <Code className="h-5 w-5 mr-2" />
                              Technical Deep Dive
                            </h3>
                            <Button
                              onClick={() => handleEditSection(repo.id.toString(), 'technical', content.technicalOverview)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingSection === `${repo.id}-technical` ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-32 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSaveEdit(repo.id.toString(), 'technical')}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingSection(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-dark-300 leading-relaxed">{content.technicalOverview}</p>
                          )}
                        </div>
                      )}

                      {/* Business Value */}
                      {content.businessValue && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                              <TrendingUp className="h-5 w-5 mr-2" />
                              Business Value & Market Impact
                            </h3>
                            <Button
                              onClick={() => handleEditSection(repo.id.toString(), 'businessValue', content.businessValue || '')}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingSection === `${repo.id}-businessValue` ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-24 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSaveEdit(repo.id.toString(), 'businessValue')}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingSection(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-dark-300 leading-relaxed">{content.businessValue}</p>
                          )}
                        </div>
                      )}

                      {/* Social Impact */}
                      {content.socialImpact && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                              <Globe className="h-5 w-5 mr-2" />
                              Social Impact & Innovation
                            </h3>
                            <Button
                              onClick={() => handleEditSection(repo.id.toString(), 'socialImpact', content.socialImpact || '')}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingSection === `${repo.id}-socialImpact` ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-24 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSaveEdit(repo.id.toString(), 'socialImpact')}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingSection(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-dark-300 leading-relaxed">{content.socialImpact}</p>
                          )}
                        </div>
                      )}

                      {/* SWOT Analysis */}
                      {documentFormat.sections.swot && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-primary-400 mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            SWOT Analysis
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                              <h4 className="font-medium text-green-400 mb-3 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Strengths
                              </h4>
                              <ul className="space-y-2">
                                {content.swotAnalysis.strengths.map((item, idx) => (
                                  <li key={idx} className="text-dark-300 text-sm flex items-start">
                                    <span className="text-green-400 mr-2 mt-1">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                              <h4 className="font-medium text-blue-400 mb-3 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Opportunities
                              </h4>
                              <ul className="space-y-2">
                                {content.swotAnalysis.opportunities.map((item, idx) => (
                                  <li key={idx} className="text-dark-300 text-sm flex items-start">
                                    <span className="text-blue-400 mr-2 mt-1">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                              <h4 className="font-medium text-yellow-400 mb-3 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Weaknesses
                              </h4>
                              <ul className="space-y-2">
                                {content.swotAnalysis.weaknesses.map((item, idx) => (
                                  <li key={idx} className="text-dark-300 text-sm flex items-start">
                                    <span className="text-yellow-400 mr-2 mt-1">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                              <h4 className="font-medium text-red-400 mb-3 flex items-center">
                                <Shield className="h-4 w-4 mr-2" />
                                Threats
                              </h4>
                              <ul className="space-y-2">
                                {content.swotAnalysis.threats.map((item, idx) => (
                                  <li key={idx} className="text-dark-300 text-sm flex items-start">
                                    <span className="text-red-400 mr-2 mt-1">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom Sections */}
                      {content.customSections && documentFormat.customSections
                        .filter(section => section.enabled && content.customSections![section.id])
                        .map((section) => {
                          const IconComponent = getCustomSectionIcon(section.icon)
                          return (
                            <div key={section.id} className="bg-dark-900 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                                  <IconComponent className="h-5 w-5 mr-2" />
                                  {section.name}
                                </h3>
                                <Button
                                  onClick={() => handleEditSection(
                                    repo.id.toString(), 
                                    `custom-${section.id}`, 
                                    content.customSections![section.id]
                                  )}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </div>
                              {editingSection === `${repo.id}-custom-${section.id}` ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full h-32 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => handleSaveEdit(repo.id.toString(), `custom-${section.id}`)}
                                      size="sm"
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      Save
                                    </Button>
                                    <Button
                                      onClick={() => setEditingSection(null)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-dark-300 leading-relaxed">{content.customSections![section.id]}</p>
                              )}
                            </div>
                          )
                        })}

                      {/* Recommendations */}
                      {documentFormat.sections.recommendations && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                              <Lightbulb className="h-5 w-5 mr-2" />
                              Strategic Recommendations
                            </h3>
                            <Button
                              onClick={() => handleEditSection(repo.id.toString(), 'recommendations', content.recommendations.join('\n'))}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingSection === `${repo.id}-recommendations` ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Enter each recommendation on a new line"
                                className="w-full h-32 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSaveEdit(repo.id.toString(), 'recommendations')}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingSection(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {content.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 bg-dark-800 rounded-lg">
                                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <span className="text-dark-300 text-sm">{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Future Roadmap */}
                      {content.futureRoadmap && (
                        <div className="bg-dark-900 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                            <Target className="h-5 w-5 mr-2" />
                            Future Roadmap & Potential
                          </h3>
                          <p className="text-dark-300 leading-relaxed">{content.futureRoadmap}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!content && !isGeneratingAI && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-primary-500 mx-auto mb-4 animate-pulse" />
                      <p className="text-dark-400">Comprehensive AI analysis will be generated...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {allContentGenerated && !isGeneratingAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-8"
          >
            <Button onClick={handleContinue} size="lg">
              <BarChart3 className="h-5 w-5 mr-2" />
              Continue to Advanced Analytics
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AIPreviewPage