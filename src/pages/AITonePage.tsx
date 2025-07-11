import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  Coffee, 
  Code, 
  TrendingUp, 
  GraduationCap,
  Layout, 
  Minimize, 
  FileText, 
  Layers,
  Sparkles,
  Users,
  Target,
  Brain,
  Lightbulb,
  Settings
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/Button'

const AITonePage = () => {
  const navigate = useNavigate()
  const { aiTone, setAITone, setCurrentStep, selectedRepositories } = useAppStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const styles = [
    {
      value: 'professional' as const,
      icon: Briefcase,
      title: 'Professional',
      description: 'Formal business language, suitable for corporate presentations',
      example: 'This repository demonstrates exceptional architectural patterns and enterprise-grade scalability...',
      audience: 'Business stakeholders, executives, formal presentations'
    },
    {
      value: 'casual' as const,
      icon: Coffee,
      title: 'Casual',
      description: 'Friendly and approachable tone, perfect for team discussions',
      example: 'This project is pretty cool and shows some neat features that developers will love...',
      audience: 'Team members, informal reviews, community discussions'
    },
    {
      value: 'technical' as const,
      icon: Code,
      title: 'Technical',
      description: 'Developer-focused with technical details and specifications',
      example: 'Implementation leverages modern design patterns including dependency injection and SOLID principles...',
      audience: 'Developers, technical teams, code reviews'
    },
    {
      value: 'executive' as const,
      icon: TrendingUp,
      title: 'Executive',
      description: 'High-level overview focused on business value and ROI',
      example: 'This solution delivers significant value through reduced operational costs and improved efficiency...',
      audience: 'C-level executives, investors, strategic planning'
    },
    {
      value: 'academic' as const,
      icon: GraduationCap,
      title: 'Academic',
      description: 'Scholarly approach with research-backed insights',
      example: 'This implementation follows established software engineering principles as documented in peer-reviewed literature...',
      audience: 'Researchers, academic institutions, scholarly publications'
    }
  ]

  const templates = [
    {
      value: 'modern' as const,
      icon: Layout,
      title: 'Modern',
      description: 'Clean, contemporary design with bold headings and visual elements',
      features: ['Bold typography', 'Color accents', 'Visual hierarchy', 'Interactive elements']
    },
    {
      value: 'classic' as const,
      icon: FileText,
      title: 'Classic',
      description: 'Traditional document layout with professional formatting',
      features: ['Traditional layout', 'Conservative styling', 'Text-focused', 'Formal structure']
    },
    {
      value: 'minimal' as const,
      icon: Minimize,
      title: 'Minimal',
      description: 'Simple, clean design with plenty of white space',
      features: ['Lots of whitespace', 'Simple typography', 'Clean lines', 'Focused content']
    },
    {
      value: 'detailed' as const,
      icon: Layers,
      title: 'Detailed',
      description: 'Comprehensive layout with extensive information sections',
      features: ['Rich content', 'Multiple sections', 'Detailed analysis', 'Comprehensive coverage']
    },
    {
      value: 'creative' as const,
      icon: Sparkles,
      title: 'Creative',
      description: 'Innovative design with storytelling elements',
      features: ['Narrative flow', 'Creative layouts', 'Engaging visuals', 'Story-driven']
    }
  ]

  const audiences = [
    { value: 'developers', label: 'Developers', icon: Code, description: 'Technical teams and software engineers' },
    { value: 'managers', label: 'Managers', icon: Users, description: 'Project managers and team leads' },
    { value: 'executives', label: 'Executives', icon: TrendingUp, description: 'C-level executives and decision makers' },
    { value: 'investors', label: 'Investors', icon: Target, description: 'Investors and funding stakeholders' },
    { value: 'general', label: 'General', icon: Users, description: 'General audience and stakeholders' }
  ]

  const focusAreas = [
    'Architecture & Design',
    'Performance & Scalability',
    'Security & Compliance',
    'Code Quality & Maintainability',
    'Business Value & ROI',
    'Innovation & Technology',
    'Team Collaboration',
    'Market Positioning',
    'Risk Assessment',
    'Future Roadmap'
  ]

  const handleStyleChange = (style: typeof aiTone.style) => {
    setAITone({ ...aiTone, style })
  }

  const handleTemplateChange = (template: typeof aiTone.template) => {
    setAITone({ ...aiTone, template })
  }

  const handleFocusAreaToggle = (area: string) => {
    const updatedAreas = aiTone.focusAreas.includes(area)
      ? aiTone.focusAreas.filter(a => a !== area)
      : [...aiTone.focusAreas, area]
    setAITone({ ...aiTone, focusAreas: updatedAreas })
  }

  const handleContinue = () => {
    setCurrentStep(4)
    navigate('/ai-preview')
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            AI Configuration & Style
          </h1>
          <p className="text-dark-300 text-lg">
            Configure how AI generates content for your {selectedRepositories.length} selected repositories
          </p>
        </motion.div>

        {/* Writing Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Writing Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style) => (
              <motion.div
                key={style.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`card cursor-pointer transition-all duration-200 ${
                  aiTone.style === style.value
                    ? 'ring-2 ring-primary-500 bg-primary-900/20'
                    : 'hover:bg-dark-700'
                }`}
                onClick={() => handleStyleChange(style.value)}
              >
                <div className="text-center">
                  <style.icon className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{style.title}</h3>
                  <p className="text-dark-400 text-sm mb-4">{style.description}</p>
                  <div className="bg-dark-900 rounded-lg p-3 text-xs text-dark-300 italic mb-3">
                    "{style.example}"
                  </div>
                  <p className="text-dark-500 text-xs">
                    Best for: {style.audience}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Document Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`card cursor-pointer transition-all duration-200 ${
                  aiTone.template === template.value
                    ? 'ring-2 ring-primary-500 bg-primary-900/20'
                    : 'hover:bg-dark-700'
                }`}
                onClick={() => handleTemplateChange(template.value)}
              >
                <div className="text-center">
                  <template.icon className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                  <p className="text-dark-400 text-sm mb-4">{template.description}</p>
                  <ul className="text-xs text-dark-500 space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        

        {/* Advanced Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Advanced Configuration</h2>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Detail Level and Technical Depth */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Content Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Detail Level: {aiTone.detailLevel}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={aiTone.detailLevel}
                      onChange={(e) => setAITone({ ...aiTone, detailLevel: parseInt(e.target.value) })}
                      className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-dark-500 mt-1">
                      <span>Brief</span>
                      <span>Comprehensive</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Technical Depth: {aiTone.technicalDepth}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={aiTone.technicalDepth}
                      onChange={(e) => setAITone({ ...aiTone, technicalDepth: parseInt(e.target.value) })}
                      className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-dark-500 mt-1">
                      <span>High-level</span>
                      <span>Deep technical</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
                <p className="text-dark-400 text-sm mb-4">
                  Select areas you want AI to emphasize in the analysis
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {focusAreas.map((area) => (
                    <motion.div
                      key={area}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg cursor-pointer text-center text-sm transition-all duration-200 ${
                        aiTone.focusAreas.includes(area)
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      }`}
                      onClick={() => handleFocusAreaToggle(area)}
                    >
                      {area}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Custom Instructions</h3>
                <p className="text-dark-400 text-sm mb-4">
                  Provide specific instructions for how AI should analyze your repositories
                </p>
                <textarea
                  value={aiTone.customInstructions}
                  onChange={(e) => setAITone({ ...aiTone, customInstructions: e.target.value })}
                  placeholder="e.g., Focus on scalability aspects, emphasize security considerations, compare with industry standards..."
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Brain className="h-5 w-5 text-primary-500 mr-2" />
              AI Configuration Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-primary-400 mb-2">Writing Style</h4>
                <p className="text-dark-300">{styles.find(s => s.value === aiTone.style)?.title}</p>
                <p className="text-dark-500 text-sm mt-1">
                  {styles.find(s => s.value === aiTone.style)?.description}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-400 mb-2">Template</h4>
                <p className="text-dark-300">{templates.find(t => t.value === aiTone.template)?.title}</p>
                <p className="text-dark-500 text-sm mt-1">
                  {templates.find(t => t.value === aiTone.template)?.description}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-400 mb-2">Target Audience</h4>
                <p className="text-dark-300">{audiences.find(a => a.value === aiTone.audience)?.label}</p>
                <p className="text-dark-500 text-sm mt-1">
                  Detail: {aiTone.detailLevel}/5, Technical: {aiTone.technicalDepth}/5
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-400 mb-2">Focus Areas</h4>
                <p className="text-dark-300">
                  {aiTone.focusAreas.length > 0 ? `${aiTone.focusAreas.length} selected` : 'All areas'}
                </p>
                <p className="text-dark-500 text-sm mt-1">
                  {aiTone.customInstructions ? 'Custom instructions provided' : 'Standard analysis'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Button onClick={handleContinue} size="lg">
            <Lightbulb className="h-5 w-5 mr-2" />
            Generate AI Content
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default AITonePage
