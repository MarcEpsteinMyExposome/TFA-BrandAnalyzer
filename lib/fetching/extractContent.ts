import * as cheerio from 'cheerio'
import type { ExtractedContent } from '@/lib/schemas/platform.schema'

/**
 * Extract structured content from raw HTML using cheerio.
 * Pulls out title, description, headings, links, images, colors, and text content.
 */
export function extractContent(html: string, url: string): ExtractedContent {
  const $ = cheerio.load(html)

  // Title: og:title, <title>, or first <h1>
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    ''

  // Description: og:description, meta description
  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    ''

  // Headings (h1, h2, h3)
  const headings: string[] = []
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim()
    if (text) headings.push(text)
  })

  // Images: profile photo, cover image, og image
  const ogImage = $('meta[property="og:image"]').attr('content') || undefined
  const profilePhoto =
    ogImage || $('link[rel="icon"]').attr('href') || undefined
  const coverImage = ogImage || undefined

  // Outbound links (external only, deduplicated)
  const links: string[] = []
  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {
    // If the URL is invalid, skip hostname filtering
  }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (href && href.startsWith('http') && (!hostname || !href.includes(hostname))) {
      links.push(href)
    }
  })
  const uniqueLinks = [...new Set(links)].slice(0, 50)

  // Colors from meta theme-color
  const colors: string[] = []
  const themeColor = $('meta[name="theme-color"]').attr('content')
  if (themeColor) colors.push(themeColor)

  // Text content: strip scripts/styles/nav, get body text, truncate
  $('script, style, nav, footer, header').remove()
  const textContent = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000)

  return {
    title: title.trim(),
    description: description.trim(),
    headings: headings.slice(0, 20),
    links: uniqueLinks,
    images: {
      profilePhoto,
      coverImage,
      ogImage,
    },
    colors,
    textContent,
  }
}
