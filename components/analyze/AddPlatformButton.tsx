'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Filter out 'other' and 'website' from main list; they're handled separately
  const selectablePlatforms = PLATFORM_LIST.filter(
    (p) => p.id !== 'other' && p.id !== 'website'
  )

  // Build the full options list including the "Custom URL" option at the end
  const allOptions = [
    ...selectablePlatforms.map((p) => ({
      id: p.id,
      name: p.name,
      disabled: existingPlatforms.includes(p.id),
    })),
    { id: 'website' as PlatformId, name: 'Custom URL', disabled: false },
  ]

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

  // Focus the list when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.focus()
      setFocusedIndex(0)
    }
    if (!isOpen) {
      setFocusedIndex(-1)
    }
  }, [isOpen])

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const options = listRef.current.querySelectorAll<HTMLLIElement>('[role="option"]')
      const el = options[focusedIndex]
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusedIndex])

  function handleSelect(platformId: PlatformId) {
    onAdd(platformId)
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setFocusedIndex((prev) => {
            let next = prev + 1
            if (next >= allOptions.length) next = 0
            return next
          })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setFocusedIndex((prev) => {
            let next = prev - 1
            if (next < 0) next = allOptions.length - 1
            return next
          })
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < allOptions.length) {
            const option = allOptions[focusedIndex]
            if (!option.disabled) {
              handleSelect(option.id)
            }
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          setIsOpen(false)
          buttonRef.current?.focus()
          break
        }
        case 'Home': {
          e.preventDefault()
          setFocusedIndex(0)
          break
        }
        case 'End': {
          e.preventDefault()
          setFocusedIndex(allOptions.length - 1)
          break
        }
      }
    },
    [allOptions, focusedIndex]
  )

  // Track which option index we're rendering (skipping separator)
  let optionIndex = 0

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        ref={buttonRef}
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
          ref={listRef}
          role="listbox"
          aria-label="Select a platform"
          aria-activedescendant={
            focusedIndex >= 0 ? `platform-option-${allOptions[focusedIndex]?.id}` : undefined
          }
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto focus:outline-none"
        >
          {selectablePlatforms.map((platform) => {
            const isDisabled = existingPlatforms.includes(platform.id)
            const currentIndex = optionIndex
            optionIndex++

            return (
              <li
                key={platform.id}
                id={`platform-option-${platform.id}`}
                role="option"
                aria-selected={focusedIndex === currentIndex}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && handleSelect(platform.id)}
                className={`px-3 py-3 text-sm cursor-pointer min-h-[44px] flex items-center ${
                  isDisabled
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : focusedIndex === currentIndex
                      ? 'text-gray-900 bg-gray-100'
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
          {(() => {
            const currentIndex = optionIndex
            return (
              <li
                id="platform-option-website"
                role="option"
                aria-selected={focusedIndex === currentIndex}
                onClick={() => handleSelect('website')}
                className={`px-3 py-3 text-sm cursor-pointer min-h-[44px] flex items-center ${
                  focusedIndex === currentIndex
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Custom URL
              </li>
            )
          })()}
        </ul>
      )}
    </div>
  )
}
