import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  PageBreak,
  ShadingType,
  WidthType,
  AlignmentType,
  BorderStyle,
  Footer,
  TableLayoutType,
  ImageRun,
} from 'docx'
import { saveAs } from 'file-saver'

import type { BrandReport } from '@/lib/schemas/report.schema'
import type { PlatformEntry } from '@/lib/schemas/platform.schema'
import { PLATFORMS } from '@/lib/platforms/registry'
import type { PlatformId } from '@/lib/schemas/platform.schema'

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------

const COLORS = {
  // Score thresholds
  scoreGreen: '22c55e',
  scoreYellow: 'eab308',
  scoreRed: 'ef4444',

  // Severity text
  severityHigh: 'dc2626',
  severityMedium: 'ea580c',
  severityLow: '6b7280',

  // Table header
  headerBg: '1f2937', // gray-800
  headerText: 'ffffff',

  // Alternating rows
  rowEven: 'f9fafb', // gray-50
  rowOdd: 'ffffff',

  // Branding
  brand: '111827', // gray-900
  muted: '6b7280', // gray-500

  // Borders
  border: 'd1d5db', // gray-300
} as const

// ---------------------------------------------------------------------------
// Helper: score-based background color
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 80) return COLORS.scoreGreen
  if (score >= 50) return COLORS.scoreYellow
  return COLORS.scoreRed
}

// ---------------------------------------------------------------------------
// Helper: severity text color
// ---------------------------------------------------------------------------

function severityColor(severity: string): string {
  const s = severity.toLowerCase()
  if (s === 'high') return COLORS.severityHigh
  if (s === 'medium') return COLORS.severityMedium
  return COLORS.severityLow
}

// ---------------------------------------------------------------------------
// Helper: capitalize first letter
// ---------------------------------------------------------------------------

function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ---------------------------------------------------------------------------
// Helper: friendly severity label (tone softening)
// ---------------------------------------------------------------------------

function friendlySeverity(severity: string): string {
  const labels: Record<string, string> = {
    high: 'High Priority',
    medium: 'Worth Addressing',
    low: 'Nice to Have',
  }
  return labels[severity.toLowerCase()] || capitalize(severity)
}

// ---------------------------------------------------------------------------
// Helper: human-readable platform name
// ---------------------------------------------------------------------------

function platformName(id: string): string {
  const config = PLATFORMS[id as PlatformId]
  return config?.name ?? capitalize(id)
}

// ---------------------------------------------------------------------------
// Helper: format category name from camelCase to Title Case
// ---------------------------------------------------------------------------

function formatCategoryName(cat: string): string {
  // Insert space before uppercase letters (camelCase -> spaced)
  const spaced = cat.replace(/([A-Z])/g, ' $1').trim()
  // Capitalize first letter of each word
  return spaced
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Helper: format date as YYYY-MM-DD
// ---------------------------------------------------------------------------

function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Helper: standard table cell borders
// ---------------------------------------------------------------------------

function cellBorders() {
  const border = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: COLORS.border,
  }
  return { top: border, bottom: border, left: border, right: border }
}

// ---------------------------------------------------------------------------
// Helper: create a header cell (dark bg, white bold text)
// ---------------------------------------------------------------------------

function headerCell(text: string, widthPercent?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: COLORS.headerText,
            size: 20, // 10pt
            font: 'Calibri',
          }),
        ],
        spacing: { before: 40, after: 40 },
      }),
    ],
    shading: {
      fill: COLORS.headerBg,
      type: ShadingType.CLEAR,
      color: 'auto',
    },
    borders: cellBorders(),
    ...(widthPercent !== undefined
      ? { width: { size: widthPercent, type: WidthType.PERCENTAGE } }
      : {}),
  })
}

// ---------------------------------------------------------------------------
// Helper: create a data cell with optional shading and text color
// ---------------------------------------------------------------------------

function dataCell(
  text: string,
  options?: {
    bgColor?: string
    textColor?: string
    bold?: boolean
    widthPercent?: number
  }
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '-',
            bold: options?.bold ?? false,
            color: options?.textColor ?? COLORS.brand,
            size: 20, // 10pt
            font: 'Calibri',
          }),
        ],
        spacing: { before: 40, after: 40 },
      }),
    ],
    shading: options?.bgColor
      ? { fill: options.bgColor, type: ShadingType.CLEAR, color: 'auto' }
      : undefined,
    borders: cellBorders(),
    ...(options?.widthPercent !== undefined
      ? { width: { size: options.widthPercent, type: WidthType.PERCENTAGE } }
      : {}),
  })
}

// ---------------------------------------------------------------------------
// Helper: create a score cell with color-coded background
// ---------------------------------------------------------------------------

function scoreCell(score: number, widthPercent?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `${score}/100`,
            bold: true,
            color: COLORS.headerText,
            size: 20,
            font: 'Calibri',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
      }),
    ],
    shading: {
      fill: scoreColor(score),
      type: ShadingType.CLEAR,
      color: 'auto',
    },
    borders: cellBorders(),
    ...(widthPercent !== undefined
      ? { width: { size: widthPercent, type: WidthType.PERCENTAGE } }
      : {}),
  })
}

// ---------------------------------------------------------------------------
// Helper: section heading paragraph
// ---------------------------------------------------------------------------

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  })
}

// ---------------------------------------------------------------------------
// Helper: subsection heading paragraph
// ---------------------------------------------------------------------------

function subsectionHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  })
}

// ---------------------------------------------------------------------------
// Helper: body text paragraph
// ---------------------------------------------------------------------------

function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text || '',
        size: 22, // 11pt
        font: 'Calibri',
        color: COLORS.brand,
      }),
    ],
    spacing: { before: 100, after: 100 },
  })
}

// ---------------------------------------------------------------------------
// Helper: row shading for alternating rows
// ---------------------------------------------------------------------------

function rowBgColor(index: number): string {
  return index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd
}

// ---------------------------------------------------------------------------
// Section: Title block
// ---------------------------------------------------------------------------

function buildTitleSection(): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'TECHNOLOGY FOR ARTISTS',
          bold: true,
          size: 36, // 18pt
          font: 'Calibri',
          color: COLORS.brand,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'BRAND HEALTH REPORT',
          bold: true,
          size: 48, // 24pt
          font: 'Calibri',
          color: COLORS.brand,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated on ${formatDate()}`,
          size: 20,
          font: 'Calibri',
          color: COLORS.muted,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
    }),
  ]
}

// ---------------------------------------------------------------------------
// Section: Executive Summary
// ---------------------------------------------------------------------------

function buildSummarySection(report: BrandReport): Paragraph[] {
  const elements: Paragraph[] = [
    sectionHeading('Executive Summary'),
    bodyText(report.summary),
  ]

  const es = report.executiveSummary
  if (es && (es.strengths.length > 0 || es.quickWins.length > 0)) {
    if (es.strengths.length > 0) {
      elements.push(subsectionHeading('What You\u2019re Doing Well'))
      es.strengths.forEach((strength) => {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `\u2022 ${strength}`,
                size: 22,
                font: 'Calibri',
                color: COLORS.brand,
              }),
            ],
            spacing: { before: 60, after: 60 },
          })
        )
      })
    }

    if (es.quickWins.length > 0) {
      elements.push(subsectionHeading('Your Quick Wins'))
      es.quickWins.forEach((quickWin, i) => {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}. ${quickWin}`,
                size: 22,
                font: 'Calibri',
                color: COLORS.brand,
              }),
            ],
            spacing: { before: 60, after: 60 },
          })
        )
      })
    }
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }))
  return elements
}

// ---------------------------------------------------------------------------
// Section: Scores overview table (side-by-side)
// ---------------------------------------------------------------------------

function buildScoresOverview(report: BrandReport): (Paragraph | Table)[] {
  const hasResilience = report.resilience && report.resilience.overallScore > 0
  const colWidth = hasResilience ? 33 : 50

  const headerCells = [
    headerCell('Consistency Score', colWidth),
    headerCell('Completeness Score', colWidth),
  ]
  const scoreCells = [
    scoreCell(report.consistency.overallScore, colWidth),
    scoreCell(report.completeness.overallScore, colWidth),
  ]

  if (hasResilience) {
    headerCells.push(headerCell('Resilience Score', colWidth))
    scoreCells.push(scoreCell(report.resilience!.overallScore, colWidth))
  }

  const table = new Table({
    rows: [
      new TableRow({
        children: headerCells,
        tableHeader: true,
      }),
      new TableRow({
        children: scoreCells,
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  })

  return [
    subsectionHeading('Overall Scores'),
    table,
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ]
}

// ---------------------------------------------------------------------------
// Section: Brand Consistency
// ---------------------------------------------------------------------------

function buildConsistencySection(report: BrandReport): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  elements.push(sectionHeading('Part 1: Brand Consistency'))
  elements.push(
    bodyText(
      `Overall Consistency Score: ${report.consistency.overallScore}/100`
    )
  )

  // Category scores table
  if (report.consistency.categories.length > 0) {
    elements.push(subsectionHeading('Category Scores'))

    const headerRow = new TableRow({
      children: [
        headerCell('Category', 30),
        headerCell('Score', 15),
        headerCell('Summary', 35),
        headerCell('Platforms', 20),
      ],
      tableHeader: true,
    })

    const dataRows = report.consistency.categories.map((cat, i) =>
      new TableRow({
        children: [
          dataCell(formatCategoryName(cat.category), {
            bgColor: rowBgColor(i),
            bold: true,
          }),
          scoreCell(cat.score),
          dataCell(cat.summary, { bgColor: rowBgColor(i) }),
          dataCell(cat.platforms.map(platformName).join(', '), {
            bgColor: rowBgColor(i),
          }),
        ],
      })
    )

    elements.push(
      new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    )
  }

  // Mismatches
  if (report.consistency.mismatches.length > 0) {
    elements.push(subsectionHeading('Findings & Opportunities'))

    report.consistency.mismatches.forEach((m) => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${friendlySeverity(m.severity)}] `,
              bold: true,
              color: severityColor(m.severity),
              size: 22,
              font: 'Calibri',
            }),
            new TextRun({
              text: m.type ? `${formatCategoryName(m.type)}: ` : '',
              bold: true,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
            new TextRun({
              text: m.description,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      )

      if (m.platforms.length > 0) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Platforms: ',
                bold: true,
                size: 20,
                font: 'Calibri',
                color: COLORS.muted,
              }),
              new TextRun({
                text: m.platforms.map(platformName).join(', '),
                size: 20,
                font: 'Calibri',
                color: COLORS.muted,
              }),
            ],
            spacing: { before: 0, after: 20 },
          })
        )
      }

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recommendation: ',
              bold: true,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: COLORS.muted,
            }),
            new TextRun({
              text: m.recommendation,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: COLORS.muted,
            }),
          ],
          spacing: { before: 0, after: 120 },
        })
      )
    })
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }))
  return elements
}

// ---------------------------------------------------------------------------
// Section: Brand Completeness
// ---------------------------------------------------------------------------

function buildCompletenessSection(
  report: BrandReport
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  elements.push(sectionHeading('Part 2: Brand Completeness'))
  elements.push(
    bodyText(
      `Overall Completeness Score: ${report.completeness.overallScore}/100`
    )
  )

  // Category scores table
  if (report.completeness.categories.length > 0) {
    elements.push(subsectionHeading('Category Scores'))

    const headerRow = new TableRow({
      children: [
        headerCell('Category', 25),
        headerCell('Score', 12),
        headerCell('Summary', 30),
        headerCell('Details', 33),
      ],
      tableHeader: true,
    })

    const dataRows = report.completeness.categories.map((cat, i) =>
      new TableRow({
        children: [
          dataCell(formatCategoryName(cat.category), {
            bgColor: rowBgColor(i),
            bold: true,
          }),
          scoreCell(cat.score),
          dataCell(cat.summary, { bgColor: rowBgColor(i) }),
          dataCell(cat.details, { bgColor: rowBgColor(i) }),
        ],
      })
    )

    elements.push(
      new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    )
  }

  // Gaps
  if (report.completeness.gaps.length > 0) {
    elements.push(subsectionHeading('Gaps & Opportunities'))

    report.completeness.gaps.forEach((gap) => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${friendlySeverity(gap.severity)}] `,
              bold: true,
              color: severityColor(gap.severity),
              size: 22,
              font: 'Calibri',
            }),
            new TextRun({
              text: gap.category
                ? `${formatCategoryName(gap.category)}: `
                : '',
              bold: true,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
            new TextRun({
              text: gap.description,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      )

      if (gap.platforms.length > 0) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Platforms: ',
                bold: true,
                size: 20,
                font: 'Calibri',
                color: COLORS.muted,
              }),
              new TextRun({
                text: gap.platforms.map(platformName).join(', '),
                size: 20,
                font: 'Calibri',
                color: COLORS.muted,
              }),
            ],
            spacing: { before: 0, after: 20 },
          })
        )
      }

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recommendation: ',
              bold: true,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: COLORS.muted,
            }),
            new TextRun({
              text: gap.recommendation,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: COLORS.muted,
            }),
          ],
          spacing: { before: 0, after: 20 },
        })
      )

      // Examples (optional)
      if (gap.examples && gap.examples.length > 0) {
        gap.examples.forEach((example) => {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `  \u2022 ${example}`,
                  size: 20,
                  font: 'Calibri',
                  color: COLORS.muted,
                }),
              ],
              spacing: { before: 0, after: 20 },
            })
          )
        })
      }

      // Extra spacing after each gap
      elements.push(new Paragraph({ spacing: { after: 80 }, children: [] }))
    })
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }))
  return elements
}

// ---------------------------------------------------------------------------
// Section: Ownership & Resilience
// ---------------------------------------------------------------------------

function buildResilienceSection(report: BrandReport): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  elements.push(sectionHeading('Part 3: Ownership & Resilience'))
  elements.push(
    bodyText(
      `Overall Resilience Score: ${report.resilience!.overallScore}/100`
    )
  )

  // Category scores table
  if (report.resilience!.categories.length > 0) {
    elements.push(subsectionHeading('Category Scores'))

    const headerRow = new TableRow({
      children: [
        headerCell('Category', 25),
        headerCell('Score', 12),
        headerCell('Summary', 30),
        headerCell('Details', 33),
      ],
      tableHeader: true,
    })

    const dataRows = report.resilience!.categories.map((cat, i) =>
      new TableRow({
        children: [
          dataCell(formatCategoryName(cat.category), {
            bgColor: rowBgColor(i),
            bold: true,
          }),
          scoreCell(cat.score),
          dataCell(cat.summary, { bgColor: rowBgColor(i) }),
          dataCell(cat.details, { bgColor: rowBgColor(i) }),
        ],
      })
    )

    elements.push(
      new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    )
  }

  // Risks
  if (report.resilience!.risks.length > 0) {
    elements.push(subsectionHeading('Risks & Opportunities'))

    report.resilience!.risks.forEach((risk) => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${friendlySeverity(risk.severity)}] `,
              bold: true,
              color: severityColor(risk.severity),
              size: 22,
              font: 'Calibri',
            }),
            new TextRun({
              text: risk.category
                ? `${formatCategoryName(risk.category)}: `
                : '',
              bold: true,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
            new TextRun({
              text: risk.description,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      )

      if (risk.platforms.length > 0) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Platforms: ',
                bold: true,
                size: 20,
                font: 'Calibri',
                color: COLORS.muted,
              }),
              new TextRun({
                text: risk.platforms.map(platformName).join(', '),
                size: 20,
                font: 'Calibri',
                color: COLORS.muted,
              }),
            ],
            spacing: { before: 0, after: 20 },
          })
        )
      }

      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recommendation: ',
              bold: true,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: COLORS.muted,
            }),
            new TextRun({
              text: risk.recommendation,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: COLORS.muted,
            }),
          ],
          spacing: { before: 0, after: 120 },
        })
      )
    })
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }))
  return elements
}

// ---------------------------------------------------------------------------
// Section: Action Items
// ---------------------------------------------------------------------------

function buildActionItemsSection(report: BrandReport): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  elements.push(sectionHeading('Prioritized Action Items'))

  if (report.actionItems.length === 0) {
    elements.push(bodyText('No action items identified.'))
    return elements
  }

  const headerRow = new TableRow({
    children: [
      headerCell('#', 6),
      headerCell('Platform', 14),
      headerCell('Action', 34),
      headerCell('Impact', 10),
      headerCell('Effort', 12),
      headerCell('Source', 14),
    ],
    tableHeader: true,
  })

  const dataRows = report.actionItems.map((item, i) => {
    const bg = rowBgColor(i)
    return new TableRow({
      children: [
        dataCell(String(item.priority), { bgColor: bg, bold: true }),
        dataCell(platformName(item.platform), { bgColor: bg }),
        dataCell(item.action, { bgColor: bg }),
        dataCell(capitalize(item.impact), {
          bgColor: bg,
          textColor: severityColor(item.impact),
          bold: true,
        }),
        dataCell(capitalize(item.effort), { bgColor: bg }),
        dataCell(capitalize(item.source), { bgColor: bg }),
      ],
    })
  })

  elements.push(
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    })
  )

  elements.push(new Paragraph({ children: [new PageBreak()] }))
  return elements
}

// ---------------------------------------------------------------------------
// Section: Sources Analyzed
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helper: decode base64 data URI to Uint8Array for ImageRun
// ---------------------------------------------------------------------------

function base64ToUint8Array(base64Data: string): Uint8Array {
  // Strip data URI prefix if present (e.g. "data:image/png;base64,")
  const raw = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
  const binaryString = atob(raw)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// ---------------------------------------------------------------------------
// Helper: compute thumbnail dimensions (max 200px wide, maintain aspect ratio)
// ---------------------------------------------------------------------------

const THUMBNAIL_MAX_WIDTH = 200
const THUMBNAIL_MAX_HEIGHT = 150

function thumbnailDimensions(
  width?: number,
  height?: number
): { width: number; height: number } {
  if (!width || !height) return { width: THUMBNAIL_MAX_WIDTH, height: THUMBNAIL_MAX_HEIGHT }

  const scale = Math.min(
    THUMBNAIL_MAX_WIDTH / width,
    THUMBNAIL_MAX_HEIGHT / height,
    1 // don't upscale
  )
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

function buildSourcesSection(platforms: PlatformEntry[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  elements.push(sectionHeading('Sources Analyzed'))

  if (platforms.length === 0) {
    elements.push(bodyText('No platforms were analyzed.'))
    return elements
  }

  const headerRow = new TableRow({
    children: [
      headerCell('Platform', 20),
      headerCell('URL', 45),
      headerCell('Method', 15),
      headerCell('Screenshots', 20),
    ],
    tableHeader: true,
  })

  const dataRows = platforms.map((p, i) => {
    const bg = rowBgColor(i)
    const method = p.fetchable ? 'Auto-fetched' : 'Screenshot'
    const screenshotCount = p.screenshots?.length ?? 0
    const screenshotText =
      screenshotCount > 0 ? `${screenshotCount} screenshot(s)` : '-'

    return new TableRow({
      children: [
        dataCell(platformName(p.platform), { bgColor: bg, bold: true }),
        dataCell(p.url, { bgColor: bg }),
        dataCell(method, { bgColor: bg }),
        dataCell(screenshotText, { bgColor: bg }),
      ],
    })
  })

  elements.push(
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    })
  )

  // Embed screenshot thumbnails grouped by platform
  const platformsWithScreenshots = platforms.filter(
    (p) => p.screenshots && p.screenshots.length > 0
  )

  if (platformsWithScreenshots.length > 0) {
    elements.push(new Paragraph({ spacing: { before: 300 }, children: [] }))
    elements.push(subsectionHeading('Screenshots'))

    for (const platform of platformsWithScreenshots) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: platformName(platform.platform),
              bold: true,
              size: 22,
              font: 'Calibri',
              color: COLORS.brand,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      )

      for (const screenshot of platform.screenshots) {
        try {
          const imageData = base64ToUint8Array(screenshot.data)
          const dims = thumbnailDimensions(screenshot.width, screenshot.height)

          elements.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: dims,
                  type: 'png',
                }),
              ],
              spacing: { before: 60, after: 60 },
            })
          )
        } catch {
          // If image can't be decoded, show a text fallback
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[Screenshot: ${screenshot.fileName}]`,
                  italics: true,
                  size: 18,
                  font: 'Calibri',
                  color: COLORS.muted,
                }),
              ],
              spacing: { before: 40, after: 40 },
            })
          )
        }
      }
    }
  }

  return elements
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function buildFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated by Technology for Artists \u2014 Brand Health Analyzer v0.8 \u2022 ${formatDate()}`,
            size: 16, // 8pt
            font: 'Calibri',
            color: COLORS.muted,
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  })
}

// ---------------------------------------------------------------------------
// Main: generateDocx
// ---------------------------------------------------------------------------

/**
 * Generate a .docx Blob containing the full Brand Health Report.
 *
 * @param report  - The analyzed brand report data
 * @param platforms - The platform entries that were analyzed
 * @returns A Blob containing the .docx file
 */
export async function generateDocx(
  report: BrandReport,
  platforms: PlatformEntry[]
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [
    ...buildTitleSection(),
    ...buildSummarySection(report),
    ...buildScoresOverview(report),
    ...buildConsistencySection(report),
    ...buildCompletenessSection(report),
    ...(report.resilience && report.resilience.categories.length > 0
      ? buildResilienceSection(report)
      : []),
    ...buildActionItemsSection(report),
    ...buildSourcesSection(platforms),
  ]

  const doc = new Document({
    title: 'Brand Health Report',
    creator: 'Technology for Artists',
    description: 'AI-powered brand health analysis report',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        footers: {
          default: buildFooter(),
        },
        children,
      },
    ],
  })

  return Packer.toBlob(doc)
}

// ---------------------------------------------------------------------------
// Convenience: downloadDocx
// ---------------------------------------------------------------------------

/**
 * Generate the Brand Health Report as .docx and trigger a browser download.
 *
 * @param report  - The analyzed brand report data
 * @param platforms - The platform entries that were analyzed
 */
export async function downloadDocx(
  report: BrandReport,
  platforms: PlatformEntry[]
): Promise<void> {
  const blob = await generateDocx(report, platforms)
  const filename = `brand-health-report-${formatDate()}.docx`
  saveAs(blob, filename)
}
