import { toBase64 } from '@/lib/images/toBase64'

describe('toBase64', () => {
  it('converts a blob to a base64 string', async () => {
    const blob = new Blob(['hello world'], { type: 'text/plain' })
    const result = await toBase64(blob)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a string starting with "data:"', async () => {
    const blob = new Blob(['test data'], { type: 'image/jpeg' })
    const result = await toBase64(blob)

    expect(result).toMatch(/^data:/)
  })

  it('includes the correct mime type in the data URL', async () => {
    const blob = new Blob(['test'], { type: 'image/png' })
    const result = await toBase64(blob)

    expect(result).toMatch(/^data:image\/png;base64,/)
  })

  it('rejects on FileReader error', async () => {
    // Mock FileReader to trigger an error
    const originalFileReader = global.FileReader
    const mockFileReader = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      result: null,
      readAsDataURL: jest.fn(function (this: typeof mockFileReader) {
        setTimeout(() => this.onerror?.(), 0)
      }),
    }

    global.FileReader = jest.fn(
      () => mockFileReader
    ) as unknown as typeof FileReader

    const blob = new Blob(['test'], { type: 'image/jpeg' })
    await expect(toBase64(blob)).rejects.toThrow('Failed to read file')

    global.FileReader = originalFileReader
  })
})
