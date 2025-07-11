import type { ReactNode } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Repository {
  has_wiki: any
  archived: any
  pushed_at: string | number | Date
  watchers_count: any
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  created_at: string
  updated_at: string
  size: number
  open_issues_count: number
  topics: string[]
  license: {
    name: string
    spdx_id: string
  } | null
  default_branch: string
}

export interface AIContent {
  summary: string
  features: string[]
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  recommendations: string[]
  technicalOverview: string
  businessValue?: string
  socialImpact?: string
  communityMetrics?: string
  futureRoadmap?: string
  innovationScore?: number
  marketPotential?: string
  technicalComplexity?: string
  adoptionReadiness?: string
  customSections?: Record<string, any>
}

export interface CustomSection {
  id: string
  name: string
  description: string
  enabled: boolean
  order: number
  type: 'text' | 'list' | 'table' | 'chart' | 'swot' | 'metrics'
  aiPrompt: string
  icon: string
}

export interface DocumentFormat {
  type: 'pdf' | 'docx' | 'pptx'
  sections: {
    summary: boolean
    features: boolean
    swot: boolean
    analytics: boolean
    recommendations: boolean
    technical: boolean
  }
  customSections: CustomSection[]
  documentTitle: string
  documentSubtitle: string
  includeTableOfContents: boolean
  includeExecutiveSummary: boolean
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  layout: 'standard' | 'modern' | 'minimal' | 'detailed'
}

export interface AITone {
  style: 'professional' | 'casual' | 'technical' | 'executive' | 'academic'
  template: 'modern' | 'classic' | 'minimal' | 'detailed' | 'creative'
  detailLevel: number
  technicalDepth: number
  audience: "developers" | "managers" | "executives" | "investors" | "general" 
  focusAreas: string[]
  customInstructions: string
}

export interface AIInsights {
  repositoryComparison: ReactNode
  trendAnalysis: ReactNode
  competitiveAnalysis: ReactNode
  futureRecommendations: ReactNode
  riskAssessment: ReactNode
  marketOpportunities: ReactNode
  portfolioOverview: string
  technicalExcellence: string
  marketPositioning: string
  innovationAssessment: string
  businessValue: string
  riskAnalysis: string
  growthOpportunities: string
  competitiveAdvantage: string
  technologyTrends: string
  recommendedActions: string
  portfolioScore: number
  marketReadiness: string
  strategicPriorities: string[]
}

interface AppState {
  // User data
  githubUsername: string
  setGithubUsername: (username: string) => void

  // Repository data
  repositories: Repository[]
  setRepositories: (repos: Repository[]) => void
  selectedRepositories: Repository[]
  setSelectedRepositories: (repos: Repository[]) => void

  // Document format
  documentFormat: DocumentFormat
  setDocumentFormat: (format: DocumentFormat) => void
  addCustomSection: (section: CustomSection) => void
  updateCustomSection: (id: string, section: Partial<CustomSection>) => void
  removeCustomSection: (id: string) => void
  reorderCustomSections: (sections: CustomSection[]) => void

  // AI settings
  aiTone: AITone
  setAITone: (tone: AITone) => void

  // AI generated content
  aiContent: Record<string, AIContent>
  setAIContent: (repoId: string, content: AIContent) => void
  
  // AI insights
  aiInsights: AIInsights | null
  setAIInsights: (insights: AIInsights) => void

  // Loading states
  isLoadingRepos: boolean
  setIsLoadingRepos: (loading: boolean) => void
  isGeneratingAI: boolean
  setIsGeneratingAI: (loading: boolean) => void
  isGeneratingInsights: boolean
  setIsGeneratingInsights: (loading: boolean) => void

  // Navigation
  currentStep: number
  setCurrentStep: (step: number) => void

  isGeneratingExport: boolean
  setIsGeneratingExport: (loading: boolean) => void

  // Advanced features
  savedTemplates: DocumentFormat[]
  setSavedTemplates: (templates: DocumentFormat[]) => void
  saveCurrentTemplate: (name: string) => void

  // Enhanced repository data
  enhancedRepositoryData: Record<string, any>
  setEnhancedRepositoryData: (repoId: string, data: any) => void

  // Reset store
  reset: () => void
}

const defaultCustomSections: CustomSection[] = [
  {
    id: 'architecture',
    name: 'Architecture Analysis',
    description: 'Comprehensive analysis of system architecture, design patterns, and technical decisions',
    enabled: false,
    order: 1,
    type: 'text',
    aiPrompt: 'Analyze the system architecture, design patterns, code organization, and technical decisions. Focus on scalability, maintainability, and architectural quality.',
    icon: 'Building'
  },
  {
    id: 'innovation',
    name: 'Innovation Assessment',
    description: 'Evaluation of technological innovation, creative solutions, and advancement contributions',
    enabled: false,
    order: 2,
    type: 'text',
    aiPrompt: 'Assess the innovation level, technological advancement, creative problem-solving approaches, and contribution to the field. Evaluate uniqueness and forward-thinking aspects.',
    icon: 'Lightbulb'
  },
  {
    id: 'performance',
    name: 'Performance Analysis',
    description: 'Performance metrics, optimization strategies, and scalability assessment',
    enabled: false,
    order: 3,
    type: 'metrics',
    aiPrompt: 'Analyze performance characteristics, optimization strategies, scalability potential, and efficiency metrics. Include benchmarking and performance best practices.',
    icon: 'Zap'
  },
  {
    id: 'security',
    name: 'Security Assessment',
    description: 'Security implementation, vulnerability analysis, and best practices evaluation',
    enabled: false,
    order: 4,
    type: 'list',
    aiPrompt: 'Evaluate security implementation, identify potential vulnerabilities, assess security best practices, and provide security recommendations.',
    icon: 'Shield'
  },
  {
    id: 'sustainability',
    name: 'Sustainability Analysis',
    description: 'Long-term viability, maintenance considerations, and project sustainability',
    enabled: false,
    order: 5,
    type: 'text',
    aiPrompt: 'Analyze project sustainability, long-term viability, maintenance requirements, community health, and factors affecting project longevity.',
    icon: 'Target'
  },
  {
    id: 'impact',
    name: 'Social Impact Assessment',
    description: 'Analysis of societal benefits, community impact, and broader implications',
    enabled: false,
    order: 6,
    type: 'text',
    aiPrompt: 'Assess the social impact, community benefits, accessibility considerations, and broader implications for society and the technology ecosystem.',
    icon: 'Users'
  }
]

const initialState = {
  githubUsername: '',
  repositories: [],
  selectedRepositories: [],
  documentFormat: {
    type: 'pdf' as const,
    sections: {
      summary: true,
      features: true,
      swot: true,
      analytics: true,
      recommendations: true,
      technical: true,
    },
    customSections: defaultCustomSections,
    documentTitle: 'Comprehensive Repository Analysis',
    documentSubtitle: 'AI-Powered Technical and Strategic Assessment',
    includeTableOfContents: true,
    includeExecutiveSummary: true,
    colorScheme: 'blue' as const,
    layout: 'standard' as const
  },
  aiTone: {
    style: 'professional' as const,
    template: 'modern' as const,
    detailLevel: 4,
    technicalDepth: 4,
    audience: 'developers' as const,
    focusAreas: [
      'Technical Excellence',
      'Innovation Assessment',
      'Business Value',
      'Social Impact'
    ],
    customInstructions: 'Focus on comprehensive analysis that goes beyond basic metrics to provide deep insights into technical merit, innovation, and real-world impact.'
  },
  aiContent: {},
  aiInsights: null,
  isLoadingRepos: false,
  isGeneratingAI: false,
  isGeneratingInsights: false,
  currentStep: 0,
  isGeneratingExport: false,
  savedTemplates: [],
  enhancedRepositoryData: {},
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      ...initialState,

      setGithubUsername: (username) => set({ githubUsername: username }),

      setRepositories: (repos) => set({ repositories: repos }),

      setSelectedRepositories: (repos) => set({ selectedRepositories: repos }),

      setDocumentFormat: (format) => {
        console.log('Setting document format:', format)
        set({ documentFormat: format })
      },

      addCustomSection: (section) => set((state) => ({
        documentFormat: {
          ...state.documentFormat,
          customSections: [...state.documentFormat.customSections, section]
        }
      })),

      updateCustomSection: (id, updates) => set((state) => ({
        documentFormat: {
          ...state.documentFormat,
          customSections: state.documentFormat.customSections.map(section =>
            section.id === id ? { ...section, ...updates } : section
          )
        }
      })),

      removeCustomSection: (id) => set((state) => ({
        documentFormat: {
          ...state.documentFormat,
          customSections: state.documentFormat.customSections.filter(section => section.id !== id)
        }
      })),

      reorderCustomSections: (sections) => set((state) => ({
        documentFormat: {
          ...state.documentFormat,
          customSections: sections
        }
      })),

      setAITone: (tone) => {
        console.log('Setting AI tone:', tone)
        set({ aiTone: tone })
      },

      setAIContent: (repoId, content) => set((state) => ({
        aiContent: { ...state.aiContent, [repoId]: content }
      })),

      setAIInsights: (insights) => set({ aiInsights: insights }),

      setIsLoadingRepos: (loading) => set({ isLoadingRepos: loading }),

      setIsGeneratingAI: (loading) => set({ isGeneratingAI: loading }),

      setIsGeneratingInsights: (loading) => set({ isGeneratingInsights: loading }),

      setCurrentStep: (step) => {
        console.log('Setting current step:', step)
        set({ currentStep: step })
      },
      
      setIsGeneratingExport: (loading) => set({ isGeneratingExport: loading }),

      setSavedTemplates: (templates) => set({ savedTemplates: templates }),

      saveCurrentTemplate: (name) => set((state) => ({
        savedTemplates: [
          ...state.savedTemplates,
          { ...state.documentFormat, documentTitle: name }
        ]
      })),

      setEnhancedRepositoryData: (repoId, data) => set((state) => ({
        enhancedRepositoryData: { ...state.enhancedRepositoryData, [repoId]: data }
      })),

      reset: () => set(initialState),
    }),
    {
      name: 'repogenie-storage',
      partialize: (state) => ({
        githubUsername: state.githubUsername,
        selectedRepositories: state.selectedRepositories,
        documentFormat: state.documentFormat,
        aiTone: state.aiTone,
        aiContent: state.aiContent,
        aiInsights: state.aiInsights,
        currentStep: state.currentStep,
        savedTemplates: state.savedTemplates,
        enhancedRepositoryData: state.enhancedRepositoryData,
      }),
    }
  )
)