// Accepts whatever the person typed - a bare handle ("@name" or "name"), or
// a full URL - and normalizes it to a clickable profile URL without ever
// rewriting what's stored or shown as the raw value.
export function instagramUrl(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const handle = trimmed.replace(/^@/, '')
  return `https://instagram.com/${handle}`
}

export function instagramHandle(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const match = trimmed.match(/instagram\.com\/([^/?#]+)/i)
  const raw = match ? match[1] : trimmed
  return `@${raw.replace(/^@/, '')}`
}
