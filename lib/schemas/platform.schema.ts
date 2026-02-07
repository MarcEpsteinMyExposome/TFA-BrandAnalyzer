import { z } from 'zod'

// Platform IDs
export const platformIdSchema = z.enum([
  'website', 'linkedin', 'behance', 'deviantart', 'etsy',
  'instagram', 'tiktok', 'facebook', 'twitter', 'pinterest',
  'artstation', 'youtube', 'threads', 'other'
])

export type PlatformId = z.infer<typeof platformIdSchema>

// Uploaded image (screenshot)
export const uploadedImageSchema = z.object({
  data: z.string(),                    // base64 encoded image data
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  fileName: z.string(),
  fileSize: z.number().positive(),     // bytes
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
})

export type UploadedImage = z.infer<typeof uploadedImageSchema>

// Extracted content from fetched pages
export const extractedContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  headings: z.array(z.string()),
  links: z.array(z.string()),
  images: z.object({
    profilePhoto: z.string().optional(),
    coverImage: z.string().optional(),
    ogImage: z.string().optional(),
  }),
  colors: z.array(z.string()),
  textContent: z.string(),
  rawHtml: z.string().optional(),
})

export type ExtractedContent = z.infer<typeof extractedContentSchema>

// Fetch status
export const fetchStatusSchema = z.enum(['pending', 'fetching', 'success', 'error'])

export type FetchStatus = z.infer<typeof fetchStatusSchema>

// Platform entry (what the user inputs + fetch results)
export const platformEntrySchema = z.object({
  platform: platformIdSchema,
  url: z.string().min(1),
  fetchable: z.boolean(),
  fetchStatus: fetchStatusSchema,
  fetchedContent: extractedContentSchema.optional(),
  screenshot: uploadedImageSchema.optional(),
  fetchError: z.string().optional(),
})

export type PlatformEntry = z.infer<typeof platformEntrySchema>
