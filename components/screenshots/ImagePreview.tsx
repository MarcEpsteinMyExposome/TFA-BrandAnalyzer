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
        className="max-h-40 rounded border border-gray-200 object-contain"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white text-xs hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        aria-label={`Remove ${fileName}`}
      >
        X
      </button>
      <p className="mt-1 max-w-[160px] truncate text-xs text-gray-500">{fileName}</p>
    </div>
  )
}
