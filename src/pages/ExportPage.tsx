import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, File, Presentation, CheckCircle, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { generatePDF } from '../services/pdfExport'
import { generateDOCX } from '../services/docxExport'
import { generatePPTX } from '../services/pptxExport'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const ExportPage = () => {
  const { 
    selectedRepositories, 
    documentFormat, 
    aiTone, 
    aiContent,
    githubUsername
  } = useAppStore()

  const [exportStatus, setExportStatus] = useState<{
    [key: string]: 'idle' | 'generating' | 'success' | 'error'
  }>({
    pdf: 'idle',
    docx: 'idle',
    pptx: 'idle'
  })

  const [downloadUrls, setDownloadUrls] = useState<{
    [key: string]: string
  }>({})

  const exportFormats = [
    {
      type: 'pdf',
      icon: FileText,
      title: 'PDF Document',
      description: 'Professional PDF with embedded charts and formatting',
      handler: generatePDF
    },
    {
      type: 'docx',
      icon: File,
      title: 'Word Document',
      description: 'Editable DOCX file compatible with Microsoft Word',
      handler: generateDOCX
    },
    {
      type: 'pptx',
      icon: Presentation,
      title: 'PowerPoint Presentation',
      description: 'Slide-based presentation with visual elements',
      handler: generatePPTX
    }
  ]

  const handleExport = async (type: string, handler: Function) => {
    setExportStatus(prev => ({ ...prev, [type]: 'generating' }))

    try {
      const blob = await handler({
        repositories: selectedRepositories,
        aiContent,
        documentFormat,
        aiTone,
        githubUsername
      })

      const url = URL.createObjectURL(blob)
      setDownloadUrls(prev => ({ ...prev, [type]: url }))
      setExportStatus(prev => ({ ...prev, [type]: 'success' }))

      // Auto-download
      const link = document.createElement('a')
      link.href = url
      link.download = `repogenie-${githubUsername}-${Date.now()}.${type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(`Export failed for ${type}:`, error)
      setExportStatus(prev => ({ ...prev, [type]: 'error' }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <LoadingSpinner size="sm" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Download className="h-5 w-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generating':
        return 'Generating...'
      case 'success':
        return 'Download Complete'
      case 'error':
        return 'Export Failed'
      default:
        return 'Generate & Download'
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            Export Your Document
          </h1>
          <p className="text-dark-300 text-lg">
            Generate and download your repository analysis in your preferred format
          </p>
        </motion.div>

        {/* Export Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Export Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">
                {selectedRepositories.length}
              </div>
              <p className="text-dark-400">Repositories</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">
                {Object.entries(documentFormat.sections).filter(([_, enabled]) => enabled).length}
              </div>
              <p className="text-dark-400">Sections</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2 capitalize">
                {aiTone.style}
              </div>
              <p className="text-dark-400">AI Style</p>
            </div>
          </div>
        </motion.div>

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {exportFormats.map((format, index) => (
            <motion.div
              key={format.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`card transition-all duration-200 ${
                documentFormat.type === format.type 
                  ? 'ring-2 ring-primary-500 bg-primary-900/10' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-600/20 rounded-lg">
                    <format.icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{format.title}</h3>
                    <p className="text-dark-400">{format.description}</p>
                    {documentFormat.type === format.type && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded-full">
                        Selected Format
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {exportStatus[format.type] === 'success' && downloadUrls[format.type] && (
                    <a
                      href={downloadUrls[format.type]}
                      download={`repogenie-${githubUsername}-${Date.now()}.${format.type}`}
                      className="text-primary-400 hover:text-primary-300 text-sm"
                    >
                      Download Again
                    </a>
                  )}
                  <Button
                    onClick={() => handleExport(format.type, format.handler)}
                    disabled={exportStatus[format.type] === 'generating'}
                    variant={documentFormat.type === format.type ? 'primary' : 'outline'}
                    className="min-w-[180px]"
                  >
                    {getStatusIcon(exportStatus[format.type])}
                    <span className="ml-2">{getStatusText(exportStatus[format.type])}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Export All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-8"
        >
          <Button
            onClick={() => {
              exportFormats.forEach(format => {
                if (exportStatus[format.type] !== 'generating') {
                  handleExport(format.type, format.handler)
                }
              })
            }}
            size="lg"
            disabled={Object.values(exportStatus).some(status => status === 'generating')}
          >
            <Download className="h-5 w-5 mr-2" />
            Export All Formats
          </Button>
        </motion.div>

        {/* Success Message */}
        {Object.values(exportStatus).some(status => status === 'success') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-green-900/20 border border-green-700 rounded-lg text-center"
          >
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">Export Successful!</h3>
            <p className="text-green-300">
              Your repository analysis documents have been generated and downloaded successfully.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ExportPage