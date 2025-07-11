import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, RadialLinearScale } from 'chart.js'
import { Bar, Doughnut, Line, Radar, Scatter } from 'react-chartjs-2'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Star, 
  GitFork, 
  Code, 
  Activity,
  Zap,
  Shield,
  Target,
  Brain,
  Download,
  RefreshCw,
  Eye} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { generateRepositoryInsights } from '../services/geminiApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale
)

const AnalyticsPage = () => {
  const navigate = useNavigate()
  const { 
    selectedRepositories, 
    setCurrentStep, 
    aiTone,
    aiInsights,
    setAIInsights,
    isGeneratingInsights,
    setIsGeneratingInsights
  } = useAppStore()
  
  const chartRefs = useRef<{ [key: string]: any }>({})
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'insights'>('overview')
  const [] = useState<string>('stars')
  const [] = useState<'all' | '1y' | '6m' | '3m'>('all')

  useEffect(() => {
    generateInsights()
    
    // Cleanup charts on unmount
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
          chart.destroy()
        }
      })
    }
  }, [])

  const generateInsights = async () => {
    if (selectedRepositories.length === 0) return
    
    setIsGeneratingInsights(true)
    try {
      const insights = await generateRepositoryInsights(selectedRepositories, aiTone)
      setAIInsights(insights)
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const handleContinue = () => {
    setCurrentStep(6)
    navigate('/preview')
  }

  // Prepare data for charts
  const repoNames = selectedRepositories.map(repo => repo.name)
  const starCounts = selectedRepositories.map(repo => repo.stargazers_count)
  const forkCounts = selectedRepositories.map(repo => repo.forks_count)
  const sizes = selectedRepositories.map(repo => repo.size)
  const issues = selectedRepositories.map(repo => repo.open_issues_count)

  // Language distribution
  const languageCount: { [key: string]: number } = {}
  const languageStars: { [key: string]: number } = {}
  selectedRepositories.forEach(repo => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
      languageStars[repo.language] = (languageStars[repo.language] || 0) + repo.stargazers_count
    }
  })

  // Topic analysis
  const topicCount: { [key: string]: number } = {}
  selectedRepositories.forEach(repo => {
    repo.topics.forEach(topic => {
      topicCount[topic] = (topicCount[topic] || 0) + 1
    })
  })

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: '#334155'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: '#334155'
        }
      }
    }
  }

  const starsData = {
    labels: repoNames,
    datasets: [
      {
        label: 'Stars',
        data: starCounts,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const forksData = {
    labels: repoNames,
    datasets: [
      {
        label: 'Forks',
        data: forkCounts,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const languageData = {
    labels: Object.keys(languageCount),
    datasets: [
      {
        data: Object.values(languageCount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const sizeData = {
    labels: repoNames,
    datasets: [
      {
        label: 'Repository Size (KB)',
        data: sizes,
        borderColor: 'rgba(14, 165, 233, 1)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(14, 165, 233, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  }

  // Advanced analytics
  const performanceRadarData = {
    labels: ['Stars', 'Forks', 'Size', 'Activity', 'Community', 'Quality'],
    datasets: [
      {
        label: 'Portfolio Performance',
        data: [
          Math.min(100, (starCounts.reduce((a, b) => a + b, 0) / selectedRepositories.length) / 10),
          Math.min(100, (forkCounts.reduce((a, b) => a + b, 0) / selectedRepositories.length) / 5),
          Math.min(100, (sizes.reduce((a, b) => a + b, 0) / selectedRepositories.length) / 1000),
          Math.min(100, 100 - (issues.reduce((a, b) => a + b, 0) / selectedRepositories.length)),
          Math.min(100, Object.keys(topicCount).length * 10),
          Math.min(100, Object.keys(languageCount).length * 15)
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  }

  const scatterData = {
    datasets: [
      {
        label: 'Stars vs Forks',
        data: selectedRepositories.map(repo => ({
          x: repo.stargazers_count,
          y: repo.forks_count,
          label: repo.name
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 12,
      },
    ],
  }

  // Calculate summary statistics
  const totalStars = starCounts.reduce((sum, stars) => sum + stars, 0)
  const totalForks = forkCounts.reduce((sum, forks) => sum + forks, 0)
  const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length
  const totalIssues = issues.reduce((sum, issue) => sum + issue, 0)
  const mostPopularLanguage = Object.entries(languageCount).sort(([,a], [,b]) => b - a)[0]
  const mostStarredRepo = selectedRepositories.reduce((prev, current) => 
    prev.stargazers_count > current.stargazers_count ? prev : current
  )

  const metrics = [
    { 
      label: 'Total Stars', 
      value: totalStars.toLocaleString(), 
      icon: Star, 
      color: 'text-yellow-500',
      change: '+12%',
      trend: 'up'
    },
    { 
      label: 'Total Forks', 
      value: totalForks.toLocaleString(), 
      icon: GitFork, 
      color: 'text-green-500',
      change: '+8%',
      trend: 'up'
    },
    { 
      label: 'Avg Size', 
      value: `${(avgSize / 1024).toFixed(1)} MB`, 
      icon: BarChart3, 
      color: 'text-blue-500',
      change: '-3%',
      trend: 'down'
    },
    { 
      label: 'Open Issues', 
      value: totalIssues.toString(), 
      icon: Activity, 
      color: 'text-orange-500',
      change: '-15%',
      trend: 'down'
    },
    { 
      label: 'Languages', 
      value: Object.keys(languageCount).length.toString(), 
      icon: Code, 
      color: 'text-purple-500',
      change: '+2',
      trend: 'up'
    },
    { 
      label: 'Top Language', 
      value: mostPopularLanguage?.[0] || 'N/A', 
      icon: Target, 
      color: 'text-cyan-500',
      change: `${mostPopularLanguage?.[1] || 0} repos`,
      trend: 'neutral'
    }
  ]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            Advanced Analytics & Insights
          </h1>
          <p className="text-dark-300 text-lg">
            Comprehensive analysis of your {selectedRepositories.length} selected repositories with AI-powered insights
          </p>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-dark-800 rounded-lg p-1 flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed', icon: Activity },
              { id: 'insights', label: 'AI Insights', icon: Brain }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeView === view.id
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <view.icon className="h-4 w-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card text-center hover:bg-dark-700 transition-colors duration-200"
                  >
                    <metric.icon className={`h-8 w-8 ${metric.color} mx-auto mb-2`} />
                    <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                    <p className="text-dark-400 text-sm">{metric.label}</p>
                    <div className={`text-xs mt-1 ${
                      metric.trend === 'up' ? 'text-green-400' : 
                      metric.trend === 'down' ? 'text-red-400' : 'text-dark-500'
                    }`}>
                      {metric.change}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stars Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-6 w-6 text-yellow-500 mr-2" />
                      <h3 className="text-xl font-semibold">Repository Stars</h3>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-64">
                    <Bar 
                      data={starsData} 
                      options={chartOptions}
                      ref={(ref) => chartRefs.current.stars = ref}
                    />
                  </div>
                </motion.div>

                {/* Language Distribution */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <PieChart className="h-6 w-6 text-purple-500 mr-2" />
                      <h3 className="text-xl font-semibold">Language Distribution</h3>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-64">
                    <Doughnut 
                      data={languageData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: '#94a3b8',
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            titleColor: '#f1f5f9',
                            bodyColor: '#cbd5e1',
                            borderColor: '#475569',
                            borderWidth: 1
                          }
                        }
                      }}
                      ref={(ref) => chartRefs.current.languages = ref}
                    />
                  </div>
                </motion.div>

                {/* Performance Radar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="card"
                >
                  <div className="flex items-center mb-4">
                    <Zap className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="text-xl font-semibold">Performance Radar</h3>
                  </div>
                  <div className="h-64">
                    <Radar 
                      data={performanceRadarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: '#94a3b8'
                            }
                          }
                        },
                        scales: {
                          r: {
                            angleLines: {
                              color: '#334155'
                            },
                            grid: {
                              color: '#334155'
                            },
                            pointLabels: {
                              color: '#94a3b8'
                            },
                            ticks: {
                              color: '#94a3b8',
                              backdropColor: 'transparent'
                            }
                          }
                        }
                      }}
                      ref={(ref) => chartRefs.current.radar = ref}
                    />
                  </div>
                </motion.div>

                {/* Stars vs Forks Scatter */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="card"
                >
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                    <h3 className="text-xl font-semibold">Stars vs Forks</h3>
                  </div>
                  <div className="h-64">
                    <Scatter 
                      data={scatterData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              title: function(context: any) {
                                return context[0].raw.label
                              },
                              label: function(context: any) {
                                return `Stars: ${context.parsed.x}, Forks: ${context.parsed.y}`
                              }
                            }
                          }
                        }
                      }}
                      ref={(ref) => chartRefs.current.scatter = ref}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Detailed Tab */}
          {activeView === 'detailed' && (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Repository Comparison Table */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Repository Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-700">
                        <th className="text-left py-3 px-4">Repository</th>
                        <th className="text-left py-3 px-4">Language</th>
                        <th className="text-right py-3 px-4">Stars</th>
                        <th className="text-right py-3 px-4">Forks</th>
                        <th className="text-right py-3 px-4">Issues</th>
                        <th className="text-right py-3 px-4">Size</th>
                        <th className="text-left py-3 px-4">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRepositories.map((repo, index) => (
                        <motion.tr
                          key={repo.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-dark-800 hover:bg-dark-800 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-white">{repo.name}</div>
                              <div className="text-dark-400 text-xs truncate max-w-xs">
                                {repo.description}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-dark-700 rounded text-xs">
                              {repo.language || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-yellow-400">
                            {repo.stargazers_count.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-green-400">
                            {repo.forks_count.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-orange-400">
                            {repo.open_issues_count}
                          </td>
                          <td className="py-3 px-4 text-right text-blue-400">
                            {(repo.size / 1024).toFixed(1)} MB
                          </td>
                          <td className="py-3 px-4 text-dark-400">
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advanced Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <GitFork className="h-6 w-6 text-green-500 mr-2" />
                    <h3 className="text-xl font-semibold">Repository Forks</h3>
                  </div>
                  <div className="h-64">
                    <Bar 
                      data={forksData} 
                      options={chartOptions}
                      ref={(ref) => chartRefs.current.forks = ref}
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="text-xl font-semibold">Repository Sizes</h3>
                  </div>
                  <div className="h-64">
                    <Line 
                      data={sizeData} 
                      options={chartOptions}
                      ref={(ref) => chartRefs.current.sizes = ref}
                    />
                  </div>
                </div>
              </div>

              {/* Topic Analysis */}
              {Object.keys(topicCount).length > 0 && (
                <div className="card">
                  <h3 className="text-xl font-semibold mb-4">Topic Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(topicCount)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 12)
                      .map(([topic, count]) => (
                        <div key={topic} className="bg-dark-800 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-primary-400">{count}</div>
                          <div className="text-xs text-dark-400 truncate">{topic}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* AI Insights Tab */}
          {activeView === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">AI-Powered Insights</h2>
                <Button
                  onClick={generateInsights}
                  disabled={isGeneratingInsights}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Insights
                </Button>
              </div>

              {isGeneratingInsights ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" text="Generating AI insights..." />
                </div>
              ) : aiInsights ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Repository Comparison
                    </h3>
                    <p className="text-dark-300">{aiInsights.repositoryComparison}</p>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Trend Analysis
                    </h3>
                    <p className="text-dark-300">{aiInsights.trendAnalysis}</p>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Competitive Analysis
                    </h3>
                    <p className="text-dark-300">{aiInsights.competitiveAnalysis}</p>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Future Recommendations
                    </h3>
                    <p className="text-dark-300">{aiInsights.futureRecommendations}</p>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Risk Assessment
                    </h3>
                    <p className="text-dark-300">{aiInsights.riskAssessment}</p>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Market Opportunities
                    </h3>
                    <p className="text-dark-300">{aiInsights.marketOpportunities}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400">No AI insights generated yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Insights Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">Key Insights Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-primary-400 mb-2">Most Starred Repository</h4>
              <p className="text-dark-300">
                {mostStarredRepo.name} ({Math.max(...starCounts).toLocaleString()} stars)
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-400 mb-2">Most Forked Repository</h4>
              <p className="text-dark-300">
                {selectedRepositories.reduce((prev, current) => 
                  prev.forks_count > current.forks_count ? prev : current
                ).name} ({Math.max(...forkCounts).toLocaleString()} forks)
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-400 mb-2">Language Diversity</h4>
              <p className="text-dark-300">
                {Object.keys(languageCount).length} different programming languages
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-400 mb-2">Total Engagement</h4>
              <p className="text-dark-300">
                {(totalStars + totalForks).toLocaleString()} combined stars and forks
              </p>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center"
        >
          <Button onClick={handleContinue} size="lg">
            <Eye className="h-5 w-5 mr-2" />
            Continue to Preview
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage