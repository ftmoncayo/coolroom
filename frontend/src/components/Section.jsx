import { contentTypeAccentStyle } from '../lib/contentTypeColors'

// Plain, unboxed section block used across Profile/Venue/Home: an all-caps
// heading with no card/border wrapper, matching how Recent Activity already
// rendered before this became the standard everywhere. `contentType` (one
// of CONTENT_TYPES from lib/contentTypeColors) colors the heading and adds
// a marker dot for category-able lists (Jobs, Events, Training, People,
// Skills/Knowledge/Certifications, Experience); identity/bio-style sections
// (About, ID Card, Our Story & Culture) pass no contentType and stay plain.
//
// `topRule`: a thin divider above the heading, colored to match this
// section (or a neutral border tone when there's no contentType) - staged
// behind this prop (default off) so it can be rolled out page by page
// rather than everywhere at once. Home is first; see Dashboard.jsx.
function Section({ id, title, contentType, topRule = false, action, children }) {
  const accentStyle = contentType ? contentTypeAccentStyle(contentType) : null

  return (
    <div id={id} className="flex flex-col gap-3">
      {topRule && (
        <div
          className="h-px w-full bg-border-strong"
          style={accentStyle ? { backgroundColor: accentStyle.color } : undefined}
          aria-hidden="true"
        />
      )}
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
    </div>
  )
}

export default Section
