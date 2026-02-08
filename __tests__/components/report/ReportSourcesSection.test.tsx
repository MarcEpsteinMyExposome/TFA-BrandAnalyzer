import { render, screen } from '@testing-library/react'
import ReportSourcesSection from '@/components/report/ReportSourcesSection'
import {
  createMockPlatformEntry,
  createMockExtractedContent,
  createMockUploadedImage,
} from '@/lib/testing/mockData'

describe('ReportSourcesSection', () => {
  it('renders nothing when platforms array is empty', () => {
    const { container } = render(<ReportSourcesSection platforms={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the Data Sources heading', () => {
    const platforms = [createMockPlatformEntry()]
    render(<ReportSourcesSection platforms={platforms} />)
    expect(
      screen.getByRole('heading', { name: /data sources/i })
    ).toBeInTheDocument()
  })

  it('renders platform names and URLs', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/janeartist',
      }),
      createMockPlatformEntry({
        platform: 'etsy',
        url: 'https://etsy.com/shop/janeartist',
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)

    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Etsy')).toBeInTheDocument()
    expect(
      screen.getByText('https://instagram.com/janeartist')
    ).toBeInTheDocument()
    expect(
      screen.getByText('https://etsy.com/shop/janeartist')
    ).toBeInTheDocument()
  })

  it('shows "Auto-fetched" badge for platforms with fetchedContent', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'website',
        url: 'https://example.com',
        fetchStatus: 'success',
        fetchedContent: createMockExtractedContent(),
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)
    expect(screen.getByText('Auto-fetched')).toBeInTheDocument()
  })

  it('shows fetched content summary with title and truncated description', () => {
    const longDescription =
      'This is a very long description that should be truncated to approximately one hundred characters so that it fits neatly in the summary area.'
    const platforms = [
      createMockPlatformEntry({
        platform: 'website',
        url: 'https://example.com',
        fetchStatus: 'success',
        fetchedContent: createMockExtractedContent({
          title: 'My Art Portfolio',
          description: longDescription,
        }),
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)
    expect(screen.getByText('My Art Portfolio')).toBeInTheDocument()
    // Description should be truncated (100 chars + ellipsis)
    const descriptionEl = screen.getByText(/This is a very long description/)
    expect(descriptionEl.textContent).toContain('...')
    expect(descriptionEl.textContent!.length).toBeLessThanOrEqual(104)
  })

  it('shows "Screenshot" badge for platforms with screenshots but no fetched content', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/artist',
        fetchable: false,
        fetchStatus: 'pending',
        screenshots: [createMockUploadedImage()],
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)
    expect(screen.getByText('Screenshot')).toBeInTheDocument()
  })

  it('renders screenshot thumbnails with correct alt text', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/artist',
        fetchable: false,
        fetchStatus: 'pending',
        screenshots: [
          createMockUploadedImage({ fileName: 'profile.png' }),
          createMockUploadedImage({ fileName: 'feed.png' }),
        ],
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)

    const thumbnails = screen.getAllByRole('img')
    expect(thumbnails).toHaveLength(2)
    expect(thumbnails[0]).toHaveAttribute('alt', 'Instagram screenshot 1')
    expect(thumbnails[1]).toHaveAttribute('alt', 'Instagram screenshot 2')
  })

  it('shows "URL only" badge for platforms with neither fetched content nor screenshots', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'behance',
        url: 'https://behance.net/artist',
        fetchStatus: 'pending',
        screenshots: [],
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)
    expect(screen.getByText('URL only')).toBeInTheDocument()
  })

  it('renders URLs as clickable links with target="_blank"', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'website',
        url: 'https://example.com',
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)

    const link = screen.getByRole('link', { name: 'https://example.com' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders multiple platforms with different source types', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'website',
        url: 'https://example.com',
        fetchStatus: 'success',
        fetchedContent: createMockExtractedContent(),
      }),
      createMockPlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/artist',
        fetchable: false,
        fetchStatus: 'pending',
        screenshots: [createMockUploadedImage()],
      }),
      createMockPlatformEntry({
        platform: 'linkedin',
        url: 'https://linkedin.com/in/artist',
        fetchStatus: 'error',
        screenshots: [],
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)

    expect(screen.getByText('Auto-fetched')).toBeInTheDocument()
    expect(screen.getByText('Screenshot')).toBeInTheDocument()
    expect(screen.getByText('URL only')).toBeInTheDocument()
  })

  it('prefers "Auto-fetched" badge when platform has both fetched content and screenshots', () => {
    const platforms = [
      createMockPlatformEntry({
        platform: 'website',
        url: 'https://example.com',
        fetchStatus: 'success',
        fetchedContent: createMockExtractedContent(),
        screenshots: [createMockUploadedImage()],
      }),
    ]
    render(<ReportSourcesSection platforms={platforms} />)
    expect(screen.getByText('Auto-fetched')).toBeInTheDocument()
    // Should also show the screenshot thumbnail
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
