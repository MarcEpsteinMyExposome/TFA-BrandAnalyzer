import {
  consistencyCategorySchema,
  consistencyScoreSchema,
  mismatchSchema,
  completenessCategorySchema,
  completenessScoreSchema,
  completenessGapSchema,
  actionItemSchema,
  brandReportSchema,
} from '@/lib/schemas/report.schema'

describe('consistencyCategorySchema', () => {
  it.each(['name', 'bio', 'visual', 'contact', 'crossLinks', 'tone'])(
    'accepts valid category: %s',
    (category) => {
      const result = consistencyCategorySchema.safeParse(category)
      expect(result.success).toBe(true)
    }
  )

  it('rejects an invalid category', () => {
    const result = consistencyCategorySchema.safeParse('branding')
    expect(result.success).toBe(false)
  })
})

describe('consistencyScoreSchema', () => {
  const validScore = {
    category: 'name',
    score: 85,
    summary: 'Name is consistent across most platforms',
    platforms: ['instagram', 'twitter', 'website'],
  }

  it('accepts a valid consistency score', () => {
    const result = consistencyScoreSchema.safeParse(validScore)
    expect(result.success).toBe(true)
  })

  it('accepts score of 0', () => {
    const result = consistencyScoreSchema.safeParse({ ...validScore, score: 0 })
    expect(result.success).toBe(true)
  })

  it('accepts score of 100', () => {
    const result = consistencyScoreSchema.safeParse({ ...validScore, score: 100 })
    expect(result.success).toBe(true)
  })

  it('rejects score below 0', () => {
    const result = consistencyScoreSchema.safeParse({ ...validScore, score: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects score above 100', () => {
    const result = consistencyScoreSchema.safeParse({ ...validScore, score: 101 })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid category', () => {
    const result = consistencyScoreSchema.safeParse({ ...validScore, category: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('accepts an empty platforms array', () => {
    const result = consistencyScoreSchema.safeParse({ ...validScore, platforms: [] })
    expect(result.success).toBe(true)
  })

  it('rejects missing summary', () => {
    const { summary, ...noSummary } = validScore
    const result = consistencyScoreSchema.safeParse(noSummary)
    expect(result.success).toBe(false)
  })
})

describe('mismatchSchema', () => {
  const validMismatch = {
    type: 'text',
    severity: 'high',
    description: 'Display name differs across platforms',
    platforms: ['instagram', 'twitter'],
    recommendation: 'Use a consistent display name on all platforms',
  }

  it('accepts a valid mismatch', () => {
    const result = mismatchSchema.safeParse(validMismatch)
    expect(result.success).toBe(true)
  })

  it.each(['text', 'visual', 'link', 'contact'])(
    'accepts valid mismatch type: %s',
    (type) => {
      const result = mismatchSchema.safeParse({ ...validMismatch, type })
      expect(result.success).toBe(true)
    }
  )

  it.each(['high', 'medium', 'low'])(
    'accepts valid severity: %s',
    (severity) => {
      const result = mismatchSchema.safeParse({ ...validMismatch, severity })
      expect(result.success).toBe(true)
    }
  )

  it('rejects an invalid type', () => {
    const result = mismatchSchema.safeParse({ ...validMismatch, type: 'audio' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid severity', () => {
    const result = mismatchSchema.safeParse({ ...validMismatch, severity: 'critical' })
    expect(result.success).toBe(false)
  })

  it('rejects missing recommendation', () => {
    const { recommendation, ...noRec } = validMismatch
    const result = mismatchSchema.safeParse(noRec)
    expect(result.success).toBe(false)
  })

  it('rejects missing description', () => {
    const { description, ...noDesc } = validMismatch
    const result = mismatchSchema.safeParse(noDesc)
    expect(result.success).toBe(false)
  })
})

describe('completenessCategorySchema', () => {
  it.each([
    'platformCoverage', 'purchasePath', 'socialProof', 'eventsAndShows', 'artistStory',
  ])('accepts valid category: %s', (category) => {
    const result = completenessCategorySchema.safeParse(category)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid category', () => {
    const result = completenessCategorySchema.safeParse('marketing')
    expect(result.success).toBe(false)
  })
})

describe('completenessScoreSchema', () => {
  const validScore = {
    category: 'platformCoverage',
    score: 60,
    summary: 'Missing key platforms',
    details: 'Artist is not on Behance or ArtStation, which are important for visibility.',
  }

  it('accepts a valid completeness score', () => {
    const result = completenessScoreSchema.safeParse(validScore)
    expect(result.success).toBe(true)
  })

  it('accepts score of 0', () => {
    const result = completenessScoreSchema.safeParse({ ...validScore, score: 0 })
    expect(result.success).toBe(true)
  })

  it('accepts score of 100', () => {
    const result = completenessScoreSchema.safeParse({ ...validScore, score: 100 })
    expect(result.success).toBe(true)
  })

  it('rejects score below 0', () => {
    const result = completenessScoreSchema.safeParse({ ...validScore, score: -5 })
    expect(result.success).toBe(false)
  })

  it('rejects score above 100', () => {
    const result = completenessScoreSchema.safeParse({ ...validScore, score: 150 })
    expect(result.success).toBe(false)
  })

  it('rejects missing details field', () => {
    const { details, ...noDetails } = validScore
    const result = completenessScoreSchema.safeParse(noDetails)
    expect(result.success).toBe(false)
  })
})

describe('completenessGapSchema', () => {
  const validGap = {
    category: 'purchasePath',
    severity: 'high',
    description: 'No clear way to purchase artwork',
    platforms: ['website'],
    recommendation: 'Add a shop or commission page to your website',
  }

  it('accepts a valid completeness gap', () => {
    const result = completenessGapSchema.safeParse(validGap)
    expect(result.success).toBe(true)
  })

  it('accepts a gap with optional examples', () => {
    const result = completenessGapSchema.safeParse({
      ...validGap,
      examples: ['Add Etsy shop link', 'Create a pricing page'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts a gap without examples (optional field)', () => {
    const result = completenessGapSchema.safeParse(validGap)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.examples).toBeUndefined()
    }
  })

  it('accepts an empty examples array', () => {
    const result = completenessGapSchema.safeParse({
      ...validGap,
      examples: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid severity', () => {
    const result = completenessGapSchema.safeParse({ ...validGap, severity: 'urgent' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid category', () => {
    const result = completenessGapSchema.safeParse({ ...validGap, category: 'seo' })
    expect(result.success).toBe(false)
  })

  it('rejects missing platforms', () => {
    const { platforms, ...noPlatforms } = validGap
    const result = completenessGapSchema.safeParse(noPlatforms)
    expect(result.success).toBe(false)
  })
})

describe('actionItemSchema', () => {
  const validAction = {
    priority: 1,
    source: 'consistency',
    action: 'Update display name on Twitter to match other platforms',
    platform: 'twitter',
    impact: 'high',
    effort: 'quick',
  }

  it('accepts a valid action item', () => {
    const result = actionItemSchema.safeParse(validAction)
    expect(result.success).toBe(true)
  })

  it('accepts source "completeness"', () => {
    const result = actionItemSchema.safeParse({ ...validAction, source: 'completeness' })
    expect(result.success).toBe(true)
  })

  it.each(['high', 'medium', 'low'])('accepts valid impact: %s', (impact) => {
    const result = actionItemSchema.safeParse({ ...validAction, impact })
    expect(result.success).toBe(true)
  })

  it.each(['quick', 'moderate', 'significant'])('accepts valid effort: %s', (effort) => {
    const result = actionItemSchema.safeParse({ ...validAction, effort })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid source', () => {
    const result = actionItemSchema.safeParse({ ...validAction, source: 'other' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid impact', () => {
    const result = actionItemSchema.safeParse({ ...validAction, impact: 'critical' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid effort', () => {
    const result = actionItemSchema.safeParse({ ...validAction, effort: 'massive' })
    expect(result.success).toBe(false)
  })

  it('rejects a zero priority', () => {
    const result = actionItemSchema.safeParse({ ...validAction, priority: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects a negative priority', () => {
    const result = actionItemSchema.safeParse({ ...validAction, priority: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer priority', () => {
    const result = actionItemSchema.safeParse({ ...validAction, priority: 1.5 })
    expect(result.success).toBe(false)
  })

  it('rejects missing action string', () => {
    const { action, ...noAction } = validAction
    const result = actionItemSchema.safeParse(noAction)
    expect(result.success).toBe(false)
  })
})

describe('brandReportSchema', () => {
  const validReport = {
    summary: 'Your brand presence is moderately consistent but has gaps in completeness.',
    consistency: {
      overallScore: 72,
      categories: [
        {
          category: 'name',
          score: 90,
          summary: 'Name is consistent across platforms',
          platforms: ['instagram', 'twitter', 'website'],
        },
        {
          category: 'bio',
          score: 55,
          summary: 'Bio differs significantly between platforms',
          platforms: ['instagram', 'linkedin'],
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
          details: 'Artist is not present on Behance, which is important for the digital art community.',
        },
      ],
      gaps: [
        {
          category: 'purchasePath',
          severity: 'high',
          description: 'No direct purchase link available',
          platforms: ['website', 'instagram'],
          recommendation: 'Add a shop or commission page',
          examples: ['Link to Etsy', 'Add a pricing page'],
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
      {
        priority: 2,
        source: 'consistency',
        action: 'Update LinkedIn bio',
        platform: 'linkedin',
        impact: 'medium',
        effort: 'quick',
      },
    ],
  }

  it('accepts a full valid brand report', () => {
    const result = brandReportSchema.safeParse(validReport)
    expect(result.success).toBe(true)
  })

  it('accepts a report with empty arrays', () => {
    const result = brandReportSchema.safeParse({
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
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing summary', () => {
    const { summary, ...noSummary } = validReport
    const result = brandReportSchema.safeParse(noSummary)
    expect(result.success).toBe(false)
  })

  it('rejects missing consistency section', () => {
    const { consistency, ...noConsistency } = validReport
    const result = brandReportSchema.safeParse(noConsistency)
    expect(result.success).toBe(false)
  })

  it('rejects missing completeness section', () => {
    const { completeness, ...noCompleteness } = validReport
    const result = brandReportSchema.safeParse(noCompleteness)
    expect(result.success).toBe(false)
  })

  it('rejects missing actionItems', () => {
    const { actionItems, ...noActions } = validReport
    const result = brandReportSchema.safeParse(noActions)
    expect(result.success).toBe(false)
  })

  it('rejects consistency overallScore above 100', () => {
    const result = brandReportSchema.safeParse({
      ...validReport,
      consistency: {
        ...validReport.consistency,
        overallScore: 101,
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects completeness overallScore below 0', () => {
    const result = brandReportSchema.safeParse({
      ...validReport,
      completeness: {
        ...validReport.completeness,
        overallScore: -1,
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid nested consistency category', () => {
    const result = brandReportSchema.safeParse({
      ...validReport,
      consistency: {
        ...validReport.consistency,
        categories: [
          {
            category: 'invalidCategory',
            score: 50,
            summary: 'test',
            platforms: [],
          },
        ],
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid nested mismatch severity', () => {
    const result = brandReportSchema.safeParse({
      ...validReport,
      consistency: {
        ...validReport.consistency,
        mismatches: [
          {
            type: 'text',
            severity: 'critical',
            description: 'test',
            platforms: [],
            recommendation: 'fix it',
          },
        ],
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid nested action item source', () => {
    const result = brandReportSchema.safeParse({
      ...validReport,
      actionItems: [
        {
          priority: 1,
          source: 'invalidSource',
          action: 'Do something',
          platform: 'website',
          impact: 'high',
          effort: 'quick',
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})
