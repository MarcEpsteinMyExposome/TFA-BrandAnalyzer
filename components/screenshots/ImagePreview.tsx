'use client'

interface ImagePreviewProps {
  src: string
  fileName: string
  onRemove: () => void
}

export default function ImagePreview({ src, fileName, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={`Screenshot: ${fileName}`}
        className="max-h-40 max-w-full rounded border border-gray-200 object-contain"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 touch-manipulation"
        style={{ minWidth: '44px', minHeight: '44px', padding: '10px', margin: '-10px' }}
        aria-label={`Remove ${fileName}`}
      >
        X
      </button>
      <p className="mt-1 max-w-[200px] sm:max-w-[160px] truncate text-xs text-gray-500">{fileName}</p>
    </div>
  )
}
