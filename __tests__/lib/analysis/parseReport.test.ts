import { parseReport } from '@/lib/analysis/parseReport'

// A valid report JSON for testing
const validReport = {
  summary: 'Your brand presence is moderately consistent but has gaps.',
  consistency: {
    overallScore: 72,
    categories: [
      {
        category: 'name',
        score: 90,
        summary: 'Name is consistent across platforms',
        platforms: ['instagram', 'twitter', 'website'],
      },
    ],
    mismatches: [
      {
        type: 'text',
        severity: 'medium',
        description: 'Bio on LinkedIn is outdated',
        platforms: ['linkedin'],
        recommendation: 'Update LinkedIn bio to match your website',
      },
    ],
  },
  completeness: {
    overallScore: 60,
    categories: [
      {
        category: 'platformCoverage',
        score: 70,
        summary: 'Good coverage but missing Behance',
        details: 'Artist is not present on Behance.',
      },
    ],
    gaps: [
      {
        category: 'purchasePath',
        severity: 'high',
        description: 'No direct purchase link available',
        platforms: ['website', 'instagram'],
        recommendation: 'Add a shop or commission page',
      },
    ],
  },
  actionItems: [
    {
      priority: 1,
      source: 'completeness',
      action: 'Add a purchase link to your website',
      platform: 'website',
      impact: 'high',
      effort: 'moderate',
    },
  ],
}

describe('parseReport', () => {
  it('parses valid JSON into BrandReport', () => {
    const json = JSON.stringify(validReport)
    const result = parseReport(json)

    expect(result.summary).toBe(validReport.summary)
    expect(result.consistency.overallScore).toBe(72)
    expect(result.consistency.categories).toHaveLength(1)
    expect(result.consistency.mismatches).toHaveLength(1)
    expect(result.completeness.overallScore).toBe(60)
    expect(result.completeness.categories).toHaveLength(1)
    expect(result.completeness.gaps).toHaveLength(1)
    expect(result.actionItems).toHaveLength(1)
    expect(result.actionItems[0].priority).toBe(1)
  })

  it('parses JSON wrapped in ```json code blocks', () => {
    const json = '```json\n' + JSON.stringify(validReport) + '\n```'
    const result = parseReport(json)

    expect(result.summary).toBe(validReport.summary)
    expect(result.consistency.overallScore).toBe(72)
  })

  it('parses JSON wrapped in plain ``` code blocks', () => {
    const json = '```\n' + JSON.stringify(validReport) + '\n```'
    const result = parseReport(json)

    expect(result.summary).toBe(validReport.summary)
  })

  it('extracts JSON from mixed text content', () => {
    const text =
      'Here is the analysis:\n\n' +
      JSON.stringify(validReport) +
      '\n\nI hope this helps!'
    const result = parseReport(text)

    expect(result.summary).toBe(validReport.summary)
    expect(result.consistency.overallScore).toBe(72)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseReport('this is not json at all')).toThrow(
      "Failed to parse Claude's response as JSON"
    )
  })

  it('throws on empty string', () => {
    expect(() => parseReport('')).toThrow(
      "Failed to parse Claude's response as JSON"
    )
  })

  it('throws on valid JSON that does not match schema (missing summary)', () => {
    const noSummary = { ...validReport }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (noSummary as any).summary

    expect(() => parseReport(JSON.stringify(noSummary))).toThrow(
      "Claude's response did not match expected schema"
    )
  })

  it('throws on valid JSON that does not match schema (missing consistency)', () => {
    const noConsistency = { ...validReport }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (noConsistency as any).consistency

    expect(() => parseReport(JSON.stringify(noConsistency))).toThrow(
      "Claude's response did not match expected schema"
    )
  })

  it('handles report with empty arrays (edge case)', () => {
    const minimalReport = {
      summary: 'Great brand!',
      consistency: {
        overallScore: 95,
        categories: [],
        mismatches: [],
      },
      completeness: {
        overallScore: 90,
        categories: [],
        gaps: [],
      },
      actionItems: [],
    }

    const result = parseReport(JSON.stringify(minimalReport))
    expect(result.summary).toBe('Great brand!')
    expect(result.consistency.categories).toEqual([])
    expect(result.consistency.mismatches).toEqual([])
    expect(result.completeness.categories).toEqual([])
    expect(result.completeness.gaps).toEqual([])
    expect(result.actionItems).toEqual([])
  })

  it('handles JSON with whitespace and newlines', () => {
    const prettyJson = JSON.stringify(validReport, null, 2)
    const result = parseReport(prettyJson)

    expect(result.summary).toBe(validReport.summary)
  })

  it('throws on JSON that is an array, not an object', () => {
    expect(() => parseReport('[1, 2, 3]')).toThrow(
      "Claude's response did not match expected schema"
    )
  })

  it('handles report with optional examples field in gaps', () => {
    const reportWithExamples = {
      ...validReport,
      completeness: {
        ...validReport.completeness,
        gaps: [
          {
            category: 'purchasePath',
            severity: 'high',
            description: 'No purchase path',
            platforms: ['website'],
            recommendation: 'Add a shop',
            examples: ['Etsy shop link', 'Commission pricing page'],
          },
        ],
      },
    }

    const result = parseReport(JSON.stringify(reportWithExamples))
    expect(result.completeness.gaps[0].examples).toEqual([
      'Etsy shop link',
      'Commission pricing page',
    ])
  })
})
