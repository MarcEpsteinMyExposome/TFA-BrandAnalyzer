import { generateDocx, downloadDocx } from '@/lib/export/generateDocx'
import { saveAs } from 'file-saver'
import {
  createMockBrandReport,
  createMockPlatformEntry,
} from '@/lib/testing/mockData'
import type { BrandReport } from '@/lib/schemas/report.schema'

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

describe('generateDocx', () => {
  it('returns a Blob', async () => {
    const report = createMockBrandReport()
    const platforms = [createMockPlatformEntry()]

    const result = await generateDocx(report, platforms)

    expect(result).toBeInstanceOf(Blob)
  })

  it('returns a Blob with correct MIME type', async () => {
    const report = createMockBrandReport()
    const platforms = [createMockPlatformEntry()]

    const result = await generateDocx(report, platforms)

    expect(result.type).toBe(DOCX_MIME_TYPE)
  })

  it('handles empty report (empty arrays, minimal data)', async () => {
    const emptyReport: BrandReport = {
      summary: '',
      consistency: {
        overallScore: 0,
        categories: [],
        mismatches: [],
      },
      completeness: {
        overallScore: 0,
        categories: [],
        gaps: [],
      },
      actionItems: [],
    }

    const result = await generateDocx(emptyReport, [])

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
  })

  it('handles report with no action items', async () => {
    const report = createMockBrandReport({
      actionItems: [],
    })
    const platforms = [createMockPlatformEntry()]

    const result = await generateDocx(report, platforms)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
  })

  it('handles report with no mismatches', async () => {
    const report = createMockBrandReport()
    // Override consistency to have no mismatches
    report.consistency.mismatches = []
    const platforms = [createMockPlatformEntry()]

    const result = await generateDocx(report, platforms)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
  })

  it('handles report with no gaps', async () => {
    const report = createMockBrandReport()
    // Override completeness to have no gaps
    report.completeness.gaps = []
    const platforms = [createMockPlatformEntry()]

    const result = await generateDocx(report, platforms)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
  })

  it('handles empty platforms array', async () => {
    const report = createMockBrandReport()

    const result = await generateDocx(report, [])

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
  })

  it('embeds screenshot thumbnails when platforms have screenshots', async () => {
    const report = createMockBrandReport()
    // 1x1 red PNG as minimal valid base64 image
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const platforms = [
      createMockPlatformEntry({
        platform: 'instagram',
        screenshots: [
          {
            data: tinyPng,
            mimeType: 'image/png',
            fileName: 'instagram-profile.png',
            fileSize: 100,
            width: 400,
            height: 300,
          },
        ],
      }),
    ]

    const result = await generateDocx(report, platforms)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
    // The blob should be larger than one without screenshots
    const noScreenshotResult = await generateDocx(report, [
      createMockPlatformEntry({ platform: 'instagram' }),
    ])
    expect(result.size).toBeGreaterThan(noScreenshotResult.size)
  })

  it('handles invalid screenshot data gracefully', async () => {
    const report = createMockBrandReport()
    const platforms = [
      createMockPlatformEntry({
        platform: 'instagram',
        screenshots: [
          {
            data: 'not-valid-base64!!!',
            mimeType: 'image/png',
            fileName: 'broken.png',
            fileSize: 50,
          },
        ],
      }),
    ]

    // Should not throw — falls back to text placeholder
    const result = await generateDocx(report, platforms)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe(DOCX_MIME_TYPE)
  })
})

describe('downloadDocx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls file-saver saveAs with correct filename pattern', async () => {
    // Fix the date to 2025-03-15 for predictable filename
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const report = createMockBrandReport()
    const platforms = [createMockPlatformEntry()]

    await downloadDocx(report, platforms)

    expect(saveAs).toHaveBeenCalledTimes(1)
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'brand-health-report-2025-03-15.docx'
    )

    jest.useRealTimers()
  })

  it('generates filename with current date in YYYY-MM-DD format', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-09T08:30:00Z'))

    const report = createMockBrandReport()
    const platforms = [createMockPlatformEntry()]

    await downloadDocx(report, platforms)

    const mockSaveAs = saveAs as jest.Mock
    const [, filename] = mockSaveAs.mock.calls[0]
    expect(filename).toBe('brand-health-report-2026-01-09.docx')

    jest.useRealTimers()
  })
})
