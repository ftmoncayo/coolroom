import { contentTypeAccentStyle, contentTypeContainerStyle } from '../lib/contentTypeColors'

// The one rounded container every list/detail section and list page is
// built from. With a `contentType` it takes that category's tint (from
// lib/contentTypeColors, so an Events panel is the same on every screen);
// without one it's the neutral, untinted panel. No overflow clipping, so
// popovers opened from inside (location filter, tag-level info) aren't cut.
export function Panel({ id, contentType, className = '', children }) {
  return (
    <div
      id={id}
      className={`rounded-[20px] p-4 sm:p-5 ${contentType ? '' : 'bg-panel'} ${className}`}
      style={contentType ? contentTypeContainerStyle(contentType) : undefined}
    >
      {children}
    </div>
  )
}

// A titled section: heading row plus content inside a single Panel. A
// `contentType` (one of CONTENT_TYPES) makes it a category section - tinted
// panel, colored dot and heading - and is the ONLY color cue; rows inside
// are neutral (see SectionRows). No contentType: plain white heading in the
// neutral panel (About, Recent Activity, Our Story & Culture, ...).
function Section({ id, title, contentType, action, children }) {
  const accentStyle = contentType ? contentTypeAccentStyle(contentType) : null

  return (
    <Panel id={id} contentType={contentType} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          className="flex items-center gap-2 text-xl font-semibold uppercase tracking-wide text-text"
          style={accentStyle}
        >
          {accentStyle && (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accentStyle.color }} aria-hidden="true" />
          )}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Panel>
  )
}

export default Section
