import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  File, 
  Presentation, 
  Check, 
  Plus, 
  Edit3, 
  Trash2, 
  GripVertical,
  Building,
  Zap,
  Shield,
  Package,
  BarChart3,
  Users,
  Target,
  Lightbulb,
  Settings,
  Save,
  Palette,
  Layout,
  BookOpen
} from 'lucide-react'
import { useAppStore, type CustomSection } from '../store/useAppStore'
import Button from '../components/Button'
import React from 'react'

const FormatControlPage = () => {
  const navigate = useNavigate()
  const { 
    documentFormat, 
    setDocumentFormat, 
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    setCurrentStep,
    savedTemplates,
    saveCurrentTemplate
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'format' | 'sections' | 'custom' | 'design'>('format')
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [, setEditingSection] = useState<string | null>(null)
  const [newSection, setNewSection] = useState<Partial<CustomSection>>({
    name: '',
    description: '',
    type: 'text',
    aiPrompt: '',
    icon: 'FileText'
  })
  const [templateName, setTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

  const formats = [
    {
      type: 'pdf' as const,
      icon: FileText,
      title: 'PDF Document',
      description: 'Professional PDF with charts and formatted text',
      features: ['Print-ready', 'Universal compatibility', 'Embedded charts', 'Professional layout']
    },
    {
      type: 'docx' as const,
      icon: File,
      title: 'Word Document',
      description: 'Editable DOCX file for Microsoft Word',
      features: ['Fully editable', 'Professional formatting', 'Table support', 'Collaborative editing']
    },
    {
      type: 'pptx' as const,
      icon: Presentation,
      title: 'PowerPoint',
      description: 'Presentation slides with visual elements',
      features: ['Slide-based', 'Visual charts', 'Presentation-ready', 'Interactive elements']
    }
  ]

  const defaultSections = [
    { 
      key: 'summary' as const, 
      label: 'Executive Summary', 
      description: 'AI-generated overview of selected repositories',
      icon: BookOpen,
      customizable: true
    },
    { 
      key: 'features' as const, 
      label: 'Key Features', 
      description: 'Highlighted features and capabilities',
      icon: Target,
      customizable: true
    },
    { 
      key: 'swot' as const, 
      label: 'SWOT Analysis', 
      description: 'Strengths, Weaknesses, Opportunities, Threats',
      icon: BarChart3,
      customizable: false
    },
    { 
      key: 'analytics' as const, 
      label: 'Visual Analytics', 
      description: 'Charts and graphs of repository data',
      icon: BarChart3,
      customizable: false
    },
    { 
      key: 'recommendations' as const, 
      label: 'Recommendations', 
      description: 'AI-powered suggestions for improvement',
      icon: Lightbulb,
      customizable: true
    },
    { 
      key: 'technical' as const, 
      label: 'Technical Overview', 
      description: 'Detailed technical documentation',
      icon: Settings,
      customizable: true
    }
  ]

  const sectionTypes = [
    { value: 'text', label: 'Text Content', description: 'Paragraph-based content' },
    { value: 'list', label: 'List Format', description: 'Bullet points or numbered lists' },
    { value: 'table', label: 'Table Data', description: 'Structured tabular information' },
    { value: 'chart', label: 'Chart/Graph', description: 'Visual data representation' },
    { value: 'swot', label: 'SWOT Matrix', description: 'Four-quadrant analysis' },
    { value: 'metrics', label: 'Metrics Dashboard', description: 'Key performance indicators' }
  ]

  

  const colorSchemes = [
    { value: 'blue', label: 'Professional Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Growth Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Creative Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Energy Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Bold Red', color: 'bg-red-500' }
  ]

  const layouts = [
    { value: 'standard', label: 'Standard', description: 'Traditional document layout' },
    { value: 'modern', label: 'Modern', description: 'Contemporary design with visual elements' },
    { value: 'minimal', label: 'Minimal', description: 'Clean and simple layout' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive with extensive sections' }
  ]

  const handleFormatChange = (type: typeof documentFormat.type) => {
    setDocumentFormat({ ...documentFormat, type })
  }

  const handleSectionToggle = (sectionKey: keyof typeof documentFormat.sections) => {
    setDocumentFormat({
      ...documentFormat,
      sections: {
        ...documentFormat.sections,
        [sectionKey]: !documentFormat.sections[sectionKey]
      }
    })
  }

  const handleAddCustomSection = () => {
    if (newSection.name && newSection.description) {
      const section: CustomSection = {
        id: Date.now().toString(),
        name: newSection.name,
        description: newSection.description || '',
        enabled: true,
        order: documentFormat.customSections.length + 1,
        type: newSection.type || 'text',
        aiPrompt: newSection.aiPrompt || `Generate content for ${newSection.name}`,
        icon: newSection.icon || 'FileText'
      }
      addCustomSection(section)
      setNewSection({ name: '', description: '', type: 'text', aiPrompt: '', icon: 'FileText' })
      setIsAddingSection(false)
    }
  }

  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      saveCurrentTemplate(templateName)
      setTemplateName('')
      setShowSaveTemplate(false)
    }
  }

  const handleContinue = () => {
    setCurrentStep(3)
    navigate('/ai-tone')
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      FileText, Building, Zap, Shield, Package, BarChart3, 
      Users, Target, Lightbulb, Settings
    }
    return icons[iconName] || FileText
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
            Customize Your Document
          </h1>
          <p className="text-dark-300 text-lg">
            Take full control of your document structure, content, and design
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-dark-800 rounded-lg p-1 flex">
            {[
              { id: 'format', label: 'Format', icon: FileText },
              { id: 'sections', label: 'Sections', icon: BookOpen },
              { id: 'custom', label: 'Custom', icon: Plus },
              { id: 'design', label: 'Design', icon: Palette }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Format Selection Tab */}
          {activeTab === 'format' && (
            <motion.div
              key="format"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-6">Document Format</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formats.map((format) => (
                    <motion.div
                      key={format.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`card cursor-pointer transition-all duration-200 ${
                        documentFormat.type === format.type
                          ? 'ring-2 ring-primary-500 bg-primary-900/20'
                          : 'hover:bg-dark-700'
                      }`}
                      onClick={() => handleFormatChange(format.type)}
                    >
                      <div className="text-center">
                        <format.icon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 flex items-center justify-center">
                          {format.title}
                          {documentFormat.type === format.type && (
                            <Check className="ml-2 h-5 w-5 text-primary-500" />
                          )}
                        </h3>
                        <p className="text-dark-400 text-sm mb-4">{format.description}</p>
                        <ul className="text-xs text-dark-500 space-y-1">
                          {format.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Document Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentFormat.documentTitle}
                      onChange={(e) => setDocumentFormat({
                        ...documentFormat,
                        documentTitle: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Document Subtitle
                    </label>
                    <input
                      type="text"
                      value={documentFormat.documentSubtitle}
                      onChange={(e) => setDocumentFormat({
                        ...documentFormat,
                        documentSubtitle: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={documentFormat.includeTableOfContents}
                      onChange={(e) => setDocumentFormat({
                        ...documentFormat,
                        includeTableOfContents: e.target.checked
                      })}
                      className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-dark-300">Include Table of Contents</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={documentFormat.includeExecutiveSummary}
                      onChange={(e) => setDocumentFormat({
                        ...documentFormat,
                        includeExecutiveSummary: e.target.checked
                      })}
                      className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-dark-300">Include Executive Summary</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Default Sections Tab */}
          {activeTab === 'sections' && (
            <motion.div
              key="sections"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold mb-6">Standard Sections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultSections.map((section) => (
                  <motion.div
                    key={section.key}
                    whileHover={{ scale: 1.01 }}
                    className={`card cursor-pointer transition-all duration-200 ${
                      documentFormat.sections[section.key]
                        ? 'ring-1 ring-primary-500 bg-primary-900/10'
                        : 'hover:bg-dark-700'
                    }`}
                    onClick={() => handleSectionToggle(section.key)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                        documentFormat.sections[section.key]
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-dark-500'
                      }`}>
                        {documentFormat.sections[section.key] && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <section.icon className="h-5 w-5 text-primary-500 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{section.label}</h3>
                        <p className="text-dark-400 text-sm">{section.description}</p>
                        {section.customizable && (
                          <span className="inline-block mt-2 px-2 py-1 bg-accent-600/20 text-accent-400 text-xs rounded-full">
                            Customizable
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Custom Sections Tab */}
          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Custom Sections</h2>
                <Button
                  onClick={() => setIsAddingSection(true)}
                  variant="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {/* Add New Section Modal */}
              <AnimatePresence>
                {isAddingSection && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card"
                  >
                    <h3 className="text-lg font-semibold mb-4">Create Custom Section</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">
                            Section Name
                          </label>
                          <input
                            type="text"
                            value={newSection.name}
                            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                            placeholder="e.g., Security Analysis"
                            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">
                            Section Type
                          </label>
                          <select
                            value={newSection.type}
                            onChange={(e) => setNewSection({ ...newSection, type: e.target.value as any })}
                            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {sectionTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newSection.description}
                          onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                          placeholder="Describe what this section will contain..."
                          rows={3}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          AI Prompt (How should AI generate this content?)
                        </label>
                        <textarea
                          value={newSection.aiPrompt}
                          onChange={(e) => setNewSection({ ...newSection, aiPrompt: e.target.value })}
                          placeholder="e.g., Analyze the security aspects of this repository including potential vulnerabilities..."
                          rows={3}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button onClick={handleAddCustomSection}>
                          Add Section
                        </Button>
                        <Button
                          onClick={() => setIsAddingSection(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Sections List */}
              <div className="space-y-4">
                {documentFormat.customSections.map((section) => (
                  <motion.div
                    key={section.id}
                    layout
                    className={`card ${section.enabled ? 'ring-1 ring-primary-500 bg-primary-900/10' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <GripVertical className="h-5 w-5 text-dark-500 mt-1 cursor-move" />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 cursor-pointer ${
                        section.enabled
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-dark-500'
                      }`}
                      onClick={() => updateCustomSection(section.id, { enabled: !section.enabled })}
                      >
                        {section.enabled && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {React.createElement(getIconComponent(section.icon), { 
                            className: "h-4 w-4 text-primary-500" 
                          })}
                          <h3 className="font-semibold">{section.name}</h3>
                          <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                            {sectionTypes.find(t => t.value === section.type)?.label}
                          </span>
                        </div>
                        <p className="text-dark-400 text-sm mb-2">{section.description}</p>
                        <p className="text-dark-500 text-xs italic">
                          AI Prompt: {section.aiPrompt}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setEditingSection(section.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => removeCustomSection(section.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {documentFormat.customSections.length === 0 && (
                <div className="text-center py-12">
                  <Plus className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400">No custom sections yet. Add your first custom section!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Design Tab */}
          {activeTab === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-semibold mb-6">Design & Layout</h2>
              
              {/* Color Scheme */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {colorSchemes.map((scheme) => (
                    <motion.div
                      key={scheme.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`card cursor-pointer text-center ${
                        documentFormat.colorScheme === scheme.value
                          ? 'ring-2 ring-primary-500'
                          : ''
                      }`}
                      onClick={() => setDocumentFormat({
                        ...documentFormat,
                        colorScheme: scheme.value as any
                      })}
                    >
                      <div className={`w-12 h-12 ${scheme.color} rounded-full mx-auto mb-2`} />
                      <p className="text-sm font-medium">{scheme.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Layout Style */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Layout Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {layouts.map((layout) => (
                    <motion.div
                      key={layout.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`card cursor-pointer ${
                        documentFormat.layout === layout.value
                          ? 'ring-2 ring-primary-500 bg-primary-900/20'
                          : 'hover:bg-dark-700'
                      }`}
                      onClick={() => setDocumentFormat({
                        ...documentFormat,
                        layout: layout.value as any
                      })}
                    >
                      <Layout className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">{layout.label}</h4>
                      <p className="text-dark-400 text-sm">{layout.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Template Management */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Template Management</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <Button
                    onClick={() => setShowSaveTemplate(true)}
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Template
                  </Button>
                </div>

                {showSaveTemplate && (
                  <div className="flex items-center space-x-4 mb-4">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button onClick={handleSaveTemplate} size="sm">
                      Save
                    </Button>
                    <Button
                      onClick={() => setShowSaveTemplate(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {savedTemplates.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Saved Templates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {savedTemplates.map((template, index) => (
                        <div
                          key={index}
                          className="p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors"
                          onClick={() => setDocumentFormat(template)}
                        >
                          <p className="font-medium">{template.documentTitle}</p>
                          <p className="text-dark-400 text-sm">
                            {Object.values(template.sections).filter(Boolean).length + template.customSections.filter(s => s.enabled).length} sections
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <Button onClick={handleContinue} size="lg">
            Continue to AI Settings
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default FormatControlPage