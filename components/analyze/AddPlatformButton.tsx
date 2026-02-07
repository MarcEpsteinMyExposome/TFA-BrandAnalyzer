'use client'

import { useState, useRef, useEffect } from 'react'
import { PLATFORM_LIST } from '@/lib/platforms/registry'
import type { PlatformId } from '@/lib/platforms/types'
import Button from '@/components/ui/Button'

interface AddPlatformButtonProps {
  onAdd: (platformId: PlatformId) => void
  existingPlatforms: PlatformId[]
}

export default function AddPlatformButton({
  onAdd,
  existingPlatforms,
}: AddPlatformButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter out 'other' and 'website' from main list; they're handled separately
  const selectablePlatforms = PLATFORM_LIST.filter(
    (p) => p.id !== 'other' && p.id !== 'website'
  )

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function handleSelect(platformId: PlatformId) {
    onAdd(platformId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        variant="secondary"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        + Add Platform
      </Button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Select a platform"
          className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          {selectablePlatforms.map((platform) => {
            const isDisabled = existingPlatforms.includes(platform.id)

            return (
              <li
                key={platform.id}
                role="option"
                aria-selected={false}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && handleSelect(platform.id)}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  isDisabled
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {platform.name}
              </li>
            )
          })}

          {/* Divider */}
          <li role="separator" className="border-t border-gray-200 my-1" />

          {/* Custom URL option */}
          <li
            role="option"
            aria-selected={false}
            onClick={() => handleSelect('website')}
            className="px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100"
          >
            Custom URL
          </li>
        </ul>
      )}
    </div>
  )
}
