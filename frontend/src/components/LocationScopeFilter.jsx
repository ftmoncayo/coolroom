import { useEffect, useRef, useState } from 'react'
import LocationCascade from './LocationCascade'
import { locationSelectionLabel } from '../lib/location'

// Location-scope filter control: a collapsed summary button ("Location:
// Melbourne") that expands into a Country -> State -> City cascade (the
// same one used to set a Profile's own location, minus Suburb - suburb is
// descriptive data only and is never a valid filter level, see
// resolveLocationScope). Selecting any level filters to that level (deepest
// wins); "All locations" clears the filter entirely.
//
// `selection`-shaped props may still carry a `suburb` (the caller's own
// location can be suburb-precision) but it's intentionally not read here -
// scopeFromSelection already collapses it to that suburb's parent city.
// Popover width below must match the w-72 on its container - used to decide
// which edge to anchor from before it's rendered (and thus before its real
// width could be measured).
const POPOVER_WIDTH = 288
const VIEWPORT_MARGIN = 16

function LocationScopeFilter({ country, state, city, onChange, label = 'Location' }) {
  const [open, setOpen] = useState(false)
  // Left-anchored (under the button's left edge) by default, matching every
  // caller that places this near the left of its row. Some callers (e.g.
  // Dashboard's section headers) put it at the right end of a
  // justify-between row instead - there, anchoring left would run the fixed
  // w-72 popover past the viewport's right edge and widen the whole page.
  // Recomputed on each open from the button's actual position rather than
  // assumed from layout, since the same component can't otherwise tell which
  // case it's in.
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

  function handleCountryChange(newCountry) {
    onChange({ country: newCountry, state: null, city: null, suburb: null })
  }
  function handleStateChange(newState) {
    onChange({ country, state: newState, city: null, suburb: null })
  }
  function handleCityChange(newCity) {
    onChange({ country, state, city: newCity, suburb: null })
  }
  function handleClear() {
    onChange({ country: null, state: null, city: null, suburb: null })
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        className="rounded border border-border-strong px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
      >
        {label}: {locationSelectionLabel({ country, state, city })}
      </button>
      {open && (
        <div
          className={`absolute z-10 mt-1 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <LocationCascade
            country={country}
            state={state}
            city={city}
            onCountryChange={handleCountryChange}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
            showSuburb={false}
          />
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={handleClear} className="text-accent hover:text-accent-hover hover:underline">
              All locations
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationScopeFilter
