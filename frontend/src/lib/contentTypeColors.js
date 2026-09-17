// Single source of truth for every "content type" color used across the
// app - Jobs, Events, Training, People, Skills/Knowledge/Certifications,
// Experience. Nothing else should hardcode one of these colors: import
// from here so a value changed once changes everywhere that type renders.
//
// Deliberately excludes identity/bio-style content (About, ID Card, Our
// Story & Culture, posts, connection/signup activity) - those aren't
// category-able lists and stay in the app's plain, uncolored treatment.

function hexToRgba(hex, alpha) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Background tint alpha: translucent, not a solid fill - a wash over the
// existing dark surface rather than an opaque card, per standard dark-mode
// practice, so normal text colors stay legible on top of it.
const TINT_ALPHA = 0.16

// The only place these hex values live. Muted/desaturated on purpose -
// this is not the vibrant-palette exploration, it's the toned-down system
// meant to sit quietly behind normal text.
const ACCENTS = {
  JOB: '#cfa459',
  EVENT: '#c66453',
  TRAINING: '#49aba8',
  PEOPLE: '#6472b4',
  SKILL_KNOWLEDGE_CERT: '#6e9f56',
  EXPERIENCE: '#946042',
}

export const CONTENT_TYPES = Object.freeze(
  Object.fromEntries(Object.keys(ACCENTS).map((key) => [key, key])),
)

export function getContentTypeColor(type) {
  const accent = ACCENTS[type]
  return accent ? { accent, tint: hexToRgba(accent, TINT_ALPHA) } : null
}

// Style for a card/row: a translucent tint background plus a stronger
// accent-colored left edge. Spread onto the element's `style` prop.
export function contentTypeCardStyle(type) {
  const color = getContentTypeColor(type)
  return color ? { backgroundColor: color.tint, borderLeft: `3px solid ${color.accent}` } : undefined
}

// Style for a section heading or small marker (dot/icon): just the
// stronger accent as a text color.
export function contentTypeAccentStyle(type) {
  const color = getContentTypeColor(type)
  return color ? { color: color.accent } : undefined
}

// Event vs. Training is the one piece of "which content type is this"
// logic that isn't a static prop - every list mixing the two needs it, so
// it lives here rather than being re-implemented per page.
export function isTrainingEvent(event) {
  return (event?.category?.name || '').trim().toLowerCase() === 'training'
}

export function getEventContentType(event) {
  return isTrainingEvent(event) ? CONTENT_TYPES.TRAINING : CONTENT_TYPES.EVENT
}
