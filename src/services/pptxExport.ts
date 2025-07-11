import PptxGenJS from 'pptxgenjs'
import type { Repository, AIContent, DocumentFormat, AITone } from '../store/useAppStore'

interface ExportData {
  repositories: Repository[]
  aiContent: Record<string, AIContent>
  documentFormat: DocumentFormat
  aiTone: AITone
  githubUsername: string
}

export const generatePPTX = async (data: ExportData): Promise<Blob> => {
  const { repositories, aiContent, documentFormat, githubUsername } = data

  // Create new presentation
  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'RepoGenie'
  pptx.company = 'RepoGenie'
  pptx.title = `Repository Analysis - ${githubUsername}`
  pptx.subject = 'GitHub Repository Analysis Report'

  // Define color scheme
  const colors = {
    primary: '3B82F6',
    secondary: '1E293B',
    accent: '06B6D4',
    text: 'FFFFFF',
    background: '0F172A'
  }

  // Title slide
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: colors.background }

  titleSlide.addText('Repository Analysis Report', {
    x: 1,
    y: 2,
    w: 8,
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: colors.text,
    align: 'center'
  })

  titleSlide.addText(`Generated for @${githubUsername}`, {
    x: 1,
    y: 3.5,
    w: 8,
    h: 0.8,
    fontSize: 24,
    color: colors.accent,
    align: 'center'
  })

  titleSlide.addText(new Date().toLocaleDateString(), {
    x: 1,
    y: 4.5,
    w: 8,
    h: 0.5,
    fontSize: 16,
    color: colors.text,
    align: 'center'
  })

  titleSlide.addText(`${repositories.length} Repositories Analyzed`, {
    x: 1,
    y: 5.5,
    w: 8,
    h: 0.5,
    fontSize: 18,
    color: colors.primary,
    align: 'center'
  })

  // Overview slide
  const overviewSlide = pptx.addSlide()
  overviewSlide.background = { color: colors.background }

  overviewSlide.addText('Repository Overview', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: colors.text
  })

  // Create repository list
  const repoListData = repositories.map((repo, index) => [
  { text: (index + 1).toString() },
  { text: repo.name },
  { text: repo.language || 'N/A' },
  { text: repo.stargazers_count.toString() },
  { text: repo.forks_count.toString() }
])

  overviewSlide.addTable([
    [
    { text: '#' },
    { text: 'Repository' },
    { text: 'Language' },
    { text: 'Stars' },
    { text: 'Forks' }
  ],
  ...repoListData
  ], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    fontSize: 12,
    color: colors.text,
    fill: { color: colors.secondary },
    border: { pt: 1, color: colors.primary }
  })

  // Analytics slide (if enabled)
  if (documentFormat.sections.analytics) {
    const analyticsSlide = pptx.addSlide()
    analyticsSlide.background = { color: colors.background }

    analyticsSlide.addText('Repository Analytics', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: colors.text
    })

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)
    const avgSize = repositories.reduce((sum, repo) => sum + repo.size, 0) / repositories.length

    // Stats boxes
    analyticsSlide.addShape(pptx.ShapeType.rect, {
      x: 1,
      y: 2,
      w: 2,
      h: 1.5,
      fill: { color: colors.primary },
      line: { color: colors.primary, width: 2 }
    })

    analyticsSlide.addText(`${totalStars}\nTotal Stars`, {
      x: 1,
      y: 2,
      w: 2,
      h: 1.5,
      fontSize: 18,
      bold: true,
      color: colors.text,
      align: 'center',
      valign: 'middle'
    })

    analyticsSlide.addShape(pptx.ShapeType.rect, {
      x: 4,
      y: 2,
      w: 2,
      h: 1.5,
      fill: { color: colors.accent },
      line: { color: colors.accent, width: 2 }
    })

    analyticsSlide.addText(`${totalForks}\nTotal Forks`, {
      x: 4,
      y: 2,
      w: 2,
      h: 1.5,
      fontSize: 18,
      bold: true,
      color: colors.text,
      align: 'center',
      valign: 'middle'
    })

    analyticsSlide.addShape(pptx.ShapeType.rect, {
      x: 7,
      y: 2,
      w: 2,
      h: 1.5,
      fill: { color: colors.secondary },
      line: { color: colors.primary, width: 2 }
    })

    analyticsSlide.addText(`${(avgSize / 1024).toFixed(1)} MB\nAvg Size`, {
      x: 7,
      y: 2,
      w: 2,
      h: 1.5,
      fontSize: 18,
      bold: true,
      color: colors.text,
      align: 'center',
      valign: 'middle'
    })

    // Language distribution
    const languageCount: { [key: string]: number } = {}
    repositories.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
      }
    })

    const langData = Object.entries(languageCount).map(([lang, count]) => [
  { text: lang },
  { text: count.toString() }
])

    if (langData.length > 0) {
      analyticsSlide.addText('Language Distribution', {
        x: 1,
        y: 4,
        w: 8,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: colors.text
      })

      analyticsSlide.addTable([
         [{ text: 'Language' }, { text: 'Count' }],
  ...langData
      ], {
        x: 1,
        y: 4.5,
        w: 4,
        h: 2,
        fontSize: 12,
        color: colors.text,
        fill: { color: colors.secondary },
        border: { pt: 1, color: colors.primary }
      })
    }
  }

  // Individual repository slides
  repositories.forEach((repo) => {
    const content = aiContent[repo.id.toString()]
    if (!content) return

    // Repository title slide
    const repoSlide = pptx.addSlide()
    repoSlide.background = { color: colors.background }

    repoSlide.addText(repo.name, {
      x: 0.5,
      y: 1,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: colors.text
    })

    if (repo.description) {
      repoSlide.addText(repo.description, {
        x: 0.5,
        y: 2.2,
        w: 9,
        h: 0.8,
        fontSize: 16,
        color: colors.accent,
        italic: true
      })
    }

    repoSlide.addText(`⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 💻 ${repo.language || 'N/A'}`, {
      x: 0.5,
      y: 3.2,
      w: 9,
      h: 0.5,
      fontSize: 14,
      color: colors.text
    })

    // Summary section
    if (documentFormat.sections.summary) {
      repoSlide.addText('Executive Summary', {
        x: 0.5,
        y: 4,
        w: 9,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: colors.primary
      })

      repoSlide.addText(content.summary.substring(0, 300) + (content.summary.length > 300 ? '...' : ''), {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 2,
        fontSize: 12,
        color: colors.text,
        wrap: true
      })
    }

    // Features slide
    if (documentFormat.sections.features && content.features.length > 0) {
      const featuresSlide = pptx.addSlide()
      featuresSlide.background = { color: colors.background }

      featuresSlide.addText(`${repo.name} - Key Features`, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: colors.text
      })

      content.features.slice(0, 8).forEach((feature, index) => {
        featuresSlide.addText(`• ${feature}`, {
          x: 1,
          y: 1.5 + (index * 0.6),
          w: 8,
          h: 0.5,
          fontSize: 14,
          color: colors.text
        })
      })
    }

    // SWOT slide
    if (documentFormat.sections.swot) {
      const swotSlide = pptx.addSlide()
      swotSlide.background = { color: colors.background }

      swotSlide.addText(`${repo.name} - SWOT Analysis`, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: colors.text
      })

      // Strengths quadrant
      swotSlide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.5,
        w: 4.25,
        h: 2.5,
        fill: { color: '10B981' },
        line: { color: '10B981', width: 2 }
      })

      swotSlide.addText('Strengths', {
        x: 0.5,
        y: 1.5,
        w: 4.25,
        h: 0.5,
        fontSize: 16,
        bold: true,
        color: colors.text,
        align: 'center'
      })

      content.swotAnalysis.strengths.slice(0, 3).forEach((item, index) => {
        swotSlide.addText(`• ${item}`, {
          x: 0.7,
          y: 2.1 + (index * 0.4),
          w: 3.85,
          h: 0.3,
          fontSize: 10,
          color: colors.text
        })
      })

      // Weaknesses quadrant
      swotSlide.addShape(pptx.ShapeType.rect, {
        x: 5.25,
        y: 1.5,
        w: 4.25,
        h: 2.5,
        fill: { color: 'EF4444' },
        line: { color: 'EF4444', width: 2 }
      })

      swotSlide.addText('Weaknesses', {
        x: 5.25,
        y: 1.5,
        w: 4.25,
        h: 0.5,
        fontSize: 16,
        bold: true,
        color: colors.text,
        align: 'center'
      })

      content.swotAnalysis.weaknesses.slice(0, 3).forEach((item, index) => {
        swotSlide.addText(`• ${item}`, {
          x: 5.45,
          y: 2.1 + (index * 0.4),
          w: 3.85,
          h: 0.3,
          fontSize: 10,
          color: colors.text
        })
      })

      // Opportunities quadrant
      swotSlide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 4.5,
        w: 4.25,
        h: 2.5,
        fill: { color: colors.primary },
        line: { color: colors.primary, width: 2 }
      })

      swotSlide.addText('Opportunities', {
        x: 0.5,
        y: 4.5,
        w: 4.25,
        h: 0.5,
        fontSize: 16,
        bold: true,
        color: colors.text,
        align: 'center'
      })

      content.swotAnalysis.opportunities.slice(0, 3).forEach((item, index) => {
        swotSlide.addText(`• ${item}`, {
          x: 0.7,
          y: 5.1 + (index * 0.4),
          w: 3.85,
          h: 0.3,
          fontSize: 10,
          color: colors.text
        })
      })

      // Threats quadrant
      swotSlide.addShape(pptx.ShapeType.rect, {
        x: 5.25,
        y: 4.5,
        w: 4.25,
        h: 2.5,
        fill: { color: 'F59E0B' },
        line: { color: 'F59E0B', width: 2 }
      })

      swotSlide.addText('Threats', {
        x: 5.25,
        y: 4.5,
        w: 4.25,
        h: 0.5,
        fontSize: 16,
        bold: true,
        color: colors.text,
        align: 'center'
      })

      content.swotAnalysis.threats.slice(0, 3).forEach((item, index) => {
        swotSlide.addText(`• ${item}`, {
          x: 5.45,
          y: 5.1 + (index * 0.4),
          w: 3.85,
          h: 0.3,
          fontSize: 10,
          color: colors.text
        })
      })
    }

    // Recommendations slide
    if (documentFormat.sections.recommendations && content.recommendations.length > 0) {
      const recSlide = pptx.addSlide()
      recSlide.background = { color: colors.background }

      recSlide.addText(`${repo.name} - Recommendations`, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: colors.text
      })

      content.recommendations.slice(0, 6).forEach((rec, index) => {
        recSlide.addText(`${index + 1}. ${rec}`, {
          x: 1,
          y: 1.5 + (index * 0.8),
          w: 8,
          h: 0.7,
          fontSize: 14,
          color: colors.text,
          wrap: true
        })
      })
    }
  })

  // Generate and return blob
  const pptxBlob = await pptx.write({ outputType: 'blob' })
  return pptxBlob as Blob
}