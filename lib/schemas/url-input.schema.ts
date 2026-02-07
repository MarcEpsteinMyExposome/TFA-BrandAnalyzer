import { z } from 'zod'

// URL input validation
const urlRegex = /^https?:\/\/.+\..+/

export const urlInputSchema = z.object({
  url: z.string()
    .min(1, 'URL is required')
    .transform((val) => {
      // Add https:// if no protocol
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        return 'https://' + val
      }
      return val
    })
    .pipe(z.string().regex(urlRegex, 'Please enter a valid URL')),
})

export type UrlInput = z.infer<typeof urlInputSchema>

// Validation for the full URL list (at least 2, max 10)
export const urlListSchema = z.object({
  platforms: z.array(z.object({
    url: z.string().min(1),
    platform: z.string(),
  }))
    .min(2, 'Please add at least 2 platforms to analyze')
    .max(10, 'Maximum 10 platforms per analysis'),
})

export type UrlList = z.infer<typeof urlListSchema>
