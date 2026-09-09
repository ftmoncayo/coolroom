import { useEffect, useRef, useState } from 'react'

// Popover width below must match the w-64 on its container - used to decide
// which edge to anchor from before it's rendered (and thus before its real
// width could be measured). Same pattern as LocationScopeFilter: most
// callers place this near the left of their row, but PublicProfile puts it
// in a Section's right-aligned action slot, where left-anchoring would run
// the fixed w-64 popover past the viewport's right edge and widen the page.
const POPOVER_WIDTH = 256
const VIEWPORT_MARGIN = 16

function TagLevelInfo() {
  const [open, setOpen] = useState(false)
  const [align, setAlign] = useState('left')
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleToggle() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const fitsLeftAligned = rect.left + POPOVER_WIDTH <= window.innerWidth - VIEWPORT_MARGIN
      setAlign(fitsLeftAligned ? 'left' : 'right')
    }
    setOpen((prev) => !prev)
  }

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="What do the skill and knowledge tag colors mean?"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] leading-none text-text-faint hover:border-accent hover:text-accent"
      >
        ?
      </button>

      {open && (
        <div
          className={`absolute top-full z-10 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-3 text-xs text-text shadow-lg shadow-black/40 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <p className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 shrink-0 rounded-full border border-border-strong bg-surface" />
            Grey outline = self-declared
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-neutral-700" />
            Dark grey ↑ = Upskilling, gained through training
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <span className="w-3 shrink-0 text-center">✓</span>
            Tick = peer-endorsed
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <span className="w-3 shrink-0 text-center">⭐</span>
            Star = manager-endorsed
          </p>
        </div>
      )}
    </span>
  )
}

export default TagLevelInfo
