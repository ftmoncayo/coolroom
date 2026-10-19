import { Link } from 'react-router-dom'

// Rows inside a Panel/Section. Items are separated by a 1px hairline (none
// after the last) and carry no color of their own - the panel's tint is the
// category cue. Two kinds:
//   NavRow    - tapping the row opens something. Whole row is one pressable
//               target with a trailing chevron and a brief press state.
//   StaticRow - nothing to open; only inline Edit/Delete-style links.

export function RowList({ children }) {
  return <div className="flex flex-col">{children}</div>
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none h-4 w-4 shrink-0 text-text-faint"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4l6 6-6 6" />
    </svg>
  )
}

// The row's link is an empty overlay sibling rather than a wrapping <a>, so
// inline buttons (Connect, Apply, Remove, ...) can sit inside the row
// without being nested in a link. Anything passed as `controls` (below the
// content) or `aside` (right of it) sits above the overlay, so tapping it
// triggers only that control - the row's navigation never fires as well.
export function NavRow({ to, label, meta, aside, controls, children }) {
  return (
    <div className="border-t border-hairline py-1.5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="relative -mx-2 flex items-center gap-3 px-2 py-1.5">
        <div className="min-w-0 flex-1">
          {children}
          {controls && <div className="relative z-10 mt-2">{controls}</div>}
        </div>
        {meta}
        {aside && <div className="relative z-10 shrink-0">{aside}</div>}
        <Chevron />
        <Link
          to={to}
          aria-label={label}
          className="absolute inset-0 rounded-lg transition-colors active:bg-white/5"
        />
      </div>
    </div>
  )
}

export function StaticRow({ children }) {
  return <div className="border-t border-hairline py-3 first:border-t-0 first:pt-0 last:pb-0">{children}</div>
}
