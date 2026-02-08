import { brandReportSchema } from '@/lib/schemas/report.schema'
import type { BrandReport } from '@/lib/schemas/report.schema'

/**
 * Parse Claude's response text into a validated BrandReport.
 * Handles: pure JSON, JSON in markdown code blocks, extraction from mixed content.
 */
export function parseReport(responseText: string): BrandReport {
  // Try to extract JSON from the response
  let jsonStr = responseText.trim()

  // Remove markdown code block wrapping if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7)
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3)
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3)
  }
  jsonStr = jsonStr.trim()

  // If there's no leading {, try to find JSON object in the text
  if (!jsonStr.startsWith('{')) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }
  }

  // Parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    throw new Error(
      `Failed to parse Claude's response as JSON: ${(e as Error).message}`
    )
  }

  // Validate with Zod
  const result = brandReportSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(
      `Claude's response did not match expected schema: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
    )
  }

  return result.data
}
