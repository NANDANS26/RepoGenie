import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx'
import type { Repository, AIContent, DocumentFormat, AITone } from '../store/useAppStore'

interface ExportData {
  repositories: Repository[]
  aiContent: Record<string, AIContent>
  documentFormat: DocumentFormat
  aiTone: AITone
  githubUsername: string
}

export const generateDOCX = async (data: ExportData): Promise<Blob> => {
  const { repositories, aiContent, documentFormat, aiTone, githubUsername } = data

  // Create document sections

  // Title page
  const titleSection = {
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'Repository Analysis Report',
            bold: true,
            size: 48,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated for @${githubUsername}`,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: new Date().toLocaleDateString(),
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Document Configuration',
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Format: ${documentFormat.type.toUpperCase()}`,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `AI Style: ${aiTone.style}`,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Template: ${aiTone.template}`,
          }),
        ],
        spacing: { after: 200 },
      }),
    ],
  }

  // Repository overview
  const overviewChildren: (Paragraph | Table)[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Repository Overview',
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `This report analyzes ${repositories.length} repositories with detailed insights and recommendations.`,
        }),
      ],
      spacing: { after: 200 },
    }),
  ]

  // Create repository table
  const repoTableRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Repository', bold: true })] })],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Language', bold: true })] })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Stars', bold: true })] })],
          width: { size: 12.5, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Forks', bold: true })] })],
          width: { size: 12.5, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ]

  repositories.forEach(repo => {
    repoTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: repo.name })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: repo.description || 'No description' })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: repo.language || 'N/A' })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: repo.stargazers_count.toString() })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: repo.forks_count.toString() })] })],
          }),
        ],
      })
    )
  })

  overviewChildren.push(
    new Table({
      rows: repoTableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  )

  // Add detailed analysis for each repository
  const detailChildren: (Paragraph | Table)[] = []

  repositories.forEach((repo) => {
    const content = aiContent[repo.id.toString()]
    if (!content) return

    detailChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: repo.name,
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true,
      })
    )

    if (repo.description) {
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: repo.description,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        })
      )
    }

    // Repository stats
    detailChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `⭐ ${repo.stargazers_count} stars | 🍴 ${repo.forks_count} forks | 💻 ${repo.language || 'N/A'} | 📦 ${(repo.size / 1024).toFixed(1)} MB`,
          }),
        ],
        spacing: { after: 300 },
      })
    )

    if (documentFormat.sections.summary) {
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Executive Summary',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: content.summary,
            }),
          ],
          spacing: { after: 300 },
        })
      )
    }

    if (documentFormat.sections.features) {
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Key Features',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      )

      content.features.forEach(feature => {
        detailChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${feature}`,
              }),
            ],
            spacing: { after: 100 },
          })
        )
      })
    }

    if (documentFormat.sections.swot) {
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SWOT Analysis',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      )

      // Strengths
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Strengths',
              bold: true,
              size: 20,
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      )

      content.swotAnalysis.strengths.forEach(item => {
        detailChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item}`,
              }),
            ],
            spacing: { after: 50 },
          })
        )
      })

      // Weaknesses
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Weaknesses',
              bold: true,
              size: 20,
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      )

      content.swotAnalysis.weaknesses.forEach(item => {
        detailChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item}`,
              }),
            ],
            spacing: { after: 50 },
          })
        )
      })

      // Opportunities
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Opportunities',
              bold: true,
              size: 20,
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      )

      content.swotAnalysis.opportunities.forEach(item => {
        detailChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item}`,
              }),
            ],
            spacing: { after: 50 },
          })
        )
      })

      // Threats
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Threats',
              bold: true,
              size: 20,
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      )

      content.swotAnalysis.threats.forEach(item => {
        detailChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item}`,
              }),
            ],
            spacing: { after: 50 },
          })
        )
      })
    }

    if (documentFormat.sections.recommendations) {
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recommendations',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      )

      content.recommendations.forEach((rec, index) => {
        detailChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${rec}`,
              }),
            ],
            spacing: { after: 100 },
          })
        )
      })
    }

    if (documentFormat.sections.technical) {
      detailChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Technical Overview',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: content.technicalOverview,
            }),
          ],
          spacing: { after: 300 },
        })
      )
    }
  })

  // Create the document
  const doc = new Document({
    sections: [
      {
        children: [...titleSection.children, ...overviewChildren, ...detailChildren],
      },
    ],
  })

  // Generate and return blob
  const buffer = await Packer.toBuffer(doc)
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}