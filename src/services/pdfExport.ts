import jsPDF from 'jspdf'
import type { Repository, AIContent, DocumentFormat, AITone } from '../store/useAppStore'

interface ExportData {
  repositories: Repository[]
  aiContent: Record<string, AIContent>
  documentFormat: DocumentFormat
  aiTone: AITone
  githubUsername: string
}

export const generatePDF = async (data: ExportData): Promise<Blob> => {
  const { repositories, aiContent, documentFormat, aiTone, githubUsername } = data
  
  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    
    const lines = pdf.splitTextToSize(text, contentWidth)
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.35) > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
    
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * fontSize * 0.35 + 5
  }

  // Add title page
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Repository Analysis Report', pageWidth / 2, 50, { align: 'center' })
  
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generated for @${githubUsername}`, pageWidth / 2, 70, { align: 'center' })
  
  pdf.setFontSize(12)
  pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 85, { align: 'center' })

  // Add repository summary
  yPosition = 110
  addText('Repository Overview', 18, true)
  addText(`This report analyzes ${repositories.length} repositories with ${aiTone.style} tone and ${aiTone.template} template.`)

  // List repositories
  addText('Analyzed Repositories:', 14, true)
  repositories.forEach((repo, index) => {
    addText(`${index + 1}. ${repo.name}`)
    if (repo.description) {
      addText(`   ${repo.description}`, 10)
    }
    addText(`   ⭐ ${repo.stargazers_count} stars | 🍴 ${repo.forks_count} forks | 💻 ${repo.language || 'N/A'}`, 10)
  })

  // Add content sections for each repository
  repositories.forEach((repo) => {
    const content = aiContent[repo.id.toString()]
    if (!content) return

    // New page for each repository
    pdf.addPage()
    yPosition = margin

    addText(repo.name, 20, true)
    addText(repo.description || 'No description available', 12)

    if (documentFormat.sections.summary) {
      addText('Executive Summary', 16, true)
      addText(content.summary)
    }

    if (documentFormat.sections.features) {
      addText('Key Features', 16, true)
      content.features.forEach((feature) => {
        addText(`• ${feature}`)
      })
    }

    if (documentFormat.sections.swot) {
      addText('SWOT Analysis', 16, true)
      
      addText('Strengths:', 14, true)
      content.swotAnalysis.strengths.forEach(item => addText(`• ${item}`))
      
      addText('Weaknesses:', 14, true)
      content.swotAnalysis.weaknesses.forEach(item => addText(`• ${item}`))
      
      addText('Opportunities:', 14, true)
      content.swotAnalysis.opportunities.forEach(item => addText(`• ${item}`))
      
      addText('Threats:', 14, true)
      content.swotAnalysis.threats.forEach(item => addText(`• ${item}`))
    }

    if (documentFormat.sections.recommendations) {
      addText('Recommendations', 16, true)
      content.recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec}`)
      })
    }

    if (documentFormat.sections.technical) {
      addText('Technical Overview', 16, true)
      addText(content.technicalOverview)
    }
  })

  // Add analytics section if enabled
  if (documentFormat.sections.analytics) {
    pdf.addPage()
    yPosition = margin
    
    addText('Analytics Summary', 20, true)
    
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)
    const avgSize = repositories.reduce((sum, repo) => sum + repo.size, 0) / repositories.length
    
    addText(`Total Stars: ${totalStars}`, 14, true)
    addText(`Total Forks: ${totalForks}`, 14, true)
    addText(`Average Repository Size: ${(avgSize / 1024).toFixed(1)} MB`, 14, true)
    
    // Language distribution
    const languageCount: { [key: string]: number } = {}
    repositories.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
      }
    })
    
    addText('Language Distribution:', 14, true)
    Object.entries(languageCount).forEach(([lang, count]) => {
      addText(`• ${lang}: ${count} repositories`)
    })
  }

  // Convert to blob
  const pdfBlob = pdf.output('blob')
  return pdfBlob
}

// Helper function to create a chart canvas for PDF embedding
export const createChartCanvas = async (_chartData: any, chartType: string): Promise<HTMLCanvasElement> => {
  // This would integrate with Chart.js to create a canvas
  // For now, return a placeholder canvas
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${chartType} Chart`, canvas.width / 2, canvas.height / 2)
  }
  
  return canvas
}