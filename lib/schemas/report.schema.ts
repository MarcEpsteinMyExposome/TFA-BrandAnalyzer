import { z } from 'zod'

// Consistency types
export const consistencyCategorySchema = z.enum([
  'name', 'bio', 'visual', 'contact', 'crossLinks', 'tone'
])

export type ConsistencyCategory = z.infer<typeof consistencyCategorySchema>

export const consistencyScoreSchema = z.object({
  category: consistencyCategorySchema,
  score: z.number().min(0).max(100),
  summary: z.string(),
  platforms: z.array(z.string()),
})

export type ConsistencyScore = z.infer<typeof consistencyScoreSchema>

export const mismatchSchema = z.object({
  type: z.enum(['text', 'visual', 'link', 'contact']),
  severity: z.enum(['high', 'medium', 'low']),
  description: z.string(),
  platforms: z.array(z.string()),
  recommendation: z.string(),
})

export type Mismatch = z.infer<typeof mismatchSchema>

// Completeness types
export const completenessCategorySchema = z.enum([
  'platformCoverage', 'purchasePath', 'socialProof', 'eventsAndShows', 'artistStory'
])

export type CompletenessCategory = z.infer<typeof completenessCategorySchema>

export const completenessScoreSchema = z.object({
  category: completenessCategorySchema,
  score: z.number().min(0).max(100),
  summary: z.string(),
  details: z.string(),
})

export type CompletenessScore = z.infer<typeof completenessScoreSchema>

export const completenessGapSchema = z.object({
  category: completenessCategorySchema,
  severity: z.enum(['high', 'medium', 'low']),
  description: z.string(),
  platforms: z.array(z.string()),
  recommendation: z.string(),
  examples: z.array(z.string()).optional(),
})

export type CompletenessGap = z.infer<typeof completenessGapSchema>

// Action items
export const actionItemSchema = z.object({
  priority: z.number().int().positive(),
  source: z.enum(['consistency', 'completeness']),
  action: z.string(),
  platform: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  effort: z.enum(['quick', 'moderate', 'significant']),
})

export type ActionItem = z.infer<typeof actionItemSchema>

// Full brand report
export const brandReportSchema = z.object({
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
  actionItems: z.array(actionItemSchema),
})

export type BrandReport = z.infer<typeof brandReportSchema>
