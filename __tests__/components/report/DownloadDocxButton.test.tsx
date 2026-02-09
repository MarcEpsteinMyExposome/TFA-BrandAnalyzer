import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DownloadDocxButton from '@/components/report/DownloadDocxButton'
import { downloadDocx } from '@/lib/export/generateDocx'
import { createMockBrandReport, createMockPlatformEntry } from '@/lib/testing/mockData'

jest.mock('@/lib/export/generateDocx', () => ({
  downloadDocx: jest.fn().mockResolvedValue(undefined),
}))

describe('DownloadDocxButton', () => {
  const mockReport = createMockBrandReport()
  const mockPlatforms = [
    createMockPlatformEntry(),
    createMockPlatformEntry({
      platform: 'instagram',
      url: 'https://instagram.com/artist',
      fetchable: false,
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Download Report (.docx)" button', () => {
    render(<DownloadDocxButton report={mockReport} platforms={mockPlatforms} />)
    expect(
      screen.getByRole('button', { name: /download report as word document/i })
    ).toHaveTextContent('Download Report (.docx)')
  })

  it('button has correct aria-label', () => {
    render(<DownloadDocxButton report={mockReport} platforms={mockPlatforms} />)
    expect(
      screen.getByRole('button', { name: 'Download report as Word document' })
    ).toBeInTheDocument()
  })

  it('calls downloadDocx with report and platforms when clicked', async () => {
    const user = userEvent.setup()
    render(<DownloadDocxButton report={mockReport} platforms={mockPlatforms} />)

    await user.click(
      screen.getByRole('button', { name: /download report as word document/i })
    )

    expect(downloadDocx).toHaveBeenCalledTimes(1)
    expect(downloadDocx).toHaveBeenCalledWith(mockReport, mockPlatforms)
  })

  it('shows "Generating..." while loading', async () => {
    const user = userEvent.setup()
    let resolveDownload!: () => void
    ;(downloadDocx as jest.Mock).mockImplementationOnce(
      () => new Promise<void>((resolve) => { resolveDownload = resolve })
    )

    render(<DownloadDocxButton report={mockReport} platforms={mockPlatforms} />)
    const button = screen.getByRole('button', {
      name: /download report as word document/i,
    })

    await user.click(button)

    expect(button).toHaveTextContent('Generating...')
    expect(button).toBeDisabled()

    resolveDownload()

    await waitFor(() => {
      expect(button).toHaveTextContent('Download Report (.docx)')
      expect(button).not.toBeDisabled()
    })
  })

  it('shows error message when downloadDocx throws', async () => {
    const user = userEvent.setup()
    ;(downloadDocx as jest.Mock).mockRejectedValueOnce(
      new Error('Generation failed')
    )

    render(<DownloadDocxButton report={mockReport} platforms={mockPlatforms} />)

    await user.click(
      screen.getByRole('button', { name: /download report as word document/i })
    )

    await waitFor(() => {
      expect(screen.getByText('Generation failed')).toBeInTheDocument()
    })
  })

  it('error message has role="alert"', async () => {
    const user = userEvent.setup()
    ;(downloadDocx as jest.Mock).mockRejectedValueOnce(
      new Error('Generation failed')
    )

    render(<DownloadDocxButton report={mockReport} platforms={mockPlatforms} />)

    await user.click(
      screen.getByRole('button', { name: /download report as word document/i })
    )

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Generation failed')
    })
  })
})
