import { z } from 'zod'

// Consistency types
export const consistencyCategorySchema = z.enum([
  'name', 'bio', 'visual', 'contact', 'crossLinks', 'tone'
])

export type ConsistencyCategory = z.infer<typeof consistencyCategorySchema>

export const consistencyScoreSchema = z.object({
  category: z.string(), // Prefer enum values but accept anything Claude returns
  score: z.number().min(0).max(100),
  summary: z.string(),
  platforms: z.array(z.string()),
})

export type ConsistencyScore = z.infer<typeof consistencyScoreSchema>

export const mismatchSchema = z.object({
  type: z.string(), // Prefer enum values but accept anything Claude returns
  severity: z.string(),
  description: z.string(),
  platforms: z.array(z.string()).default([]),
  recommendation: z.string(),
}).passthrough()

export type Mismatch = z.infer<typeof mismatchSchema>

// Completeness types
export const completenessCategorySchema = z.enum([
  'platformCoverage', 'purchasePath', 'socialProof', 'eventsAndShows', 'artistStory'
])

export type CompletenessCategory = z.infer<typeof completenessCategorySchema>

export const completenessScoreSchema = z.object({
  category: z.string(), // Prefer enum values but accept anything Claude returns
  score: z.number().min(0).max(100),
  summary: z.string(),
  details: z.string(),
})

export type CompletenessScore = z.infer<typeof completenessScoreSchema>

export const completenessGapSchema = z.object({
  category: z.string(), // Prefer enum values but accept anything Claude returns
  severity: z.string(),
  description: z.string(),
  platforms: z.array(z.string()).default([]),
  recommendation: z.string(),
  examples: z.array(z.string()).optional(),
}).passthrough()

export type CompletenessGap = z.infer<typeof completenessGapSchema>

// Executive summary
export const executiveSummarySchema = z.object({
  strengths: z.array(z.string()).default([]),
  quickWins: z.array(z.string()).default([]),
})

export type ExecutiveSummary = z.infer<typeof executiveSummarySchema>

// Resilience types
export const resilienceCategorySchema = z.enum([
  'domainOwnership', 'platformDiversification', 'ctaControl', 'emailListPresence'
])

export type ResilienceCategory = z.infer<typeof resilienceCategorySchema>

export const resilienceScoreSchema = z.object({
  category: z.string(), // Prefer enum values but accept anything Claude returns
  score: z.number().min(0).max(100),
  summary: z.string(),
  details: z.string(),
})

export type ResilienceScore = z.infer<typeof resilienceScoreSchema>

export const resilienceRiskSchema = z.object({
  category: z.string(), // Prefer enum values but accept anything Claude returns
  severity: z.string(),
  description: z.string(),
  platforms: z.array(z.string()).default([]),
  recommendation: z.string(),
}).passthrough()

export type ResilienceRisk = z.infer<typeof resilienceRiskSchema>

// Action items
export const actionItemSchema = z.object({
  priority: z.number(),
  source: z.string(),
  action: z.string(),
  platform: z.string(),
  impact: z.string(),
  effort: z.string(),
}).passthrough()

export type ActionItem = z.infer<typeof actionItemSchema>

// Full brand report
export const brandReportSchema = z.object({
  executiveSummary: executiveSummarySchema.optional().default({ strengths: [], quickWins: [] }),
  summary: z.string(),
  consistency: z.object({
    overallScore: z.number().min(0).max(100),
    categories: z.array(consistencyScoreSchema),
    mismatches: z.array(mismatchSchema),
  }),
  completeness: z.object({
    overallScore: z.number().min(0).max(100),
    categories: z.array(completenessScoreSchema),
    gaps: z.array(completenessGapSchema),
  }),
  resilience: z.object({
    overallScore: z.number().min(0).max(100),
    categories: z.array(resilienceScoreSchema),
    risks: z.array(resilienceRiskSchema),
  }).optional().default({ overallScore: 0, categories: [], risks: [] }),
  actionItems: z.array(actionItemSchema),
})

export type BrandReport = z.infer<typeof brandReportSchema>
