// Keyword-matched against the free-text VenueType name (admin-managed lookup
// data, not a fixed enum) rather than an exact map, so new/synonymous type
// names ("Wine Bar", "Cocktail Bar") still pick up the right icon without
// needing a matching entry added here by hand.
const ICONS = [
  {
    keywords: ['bar', 'pub', 'tavern', 'nightclub', 'club', 'lounge'],
    path: (
      <>
        <path d="M5 3h14l-6 8v7h3v2H8v-2h3v-7L5 3z" />
        <path d="M7.5 6h9" strokeLinecap="round" />
      </>
    ),
  },
  {
    keywords: ['restaurant', 'bistro', 'diner', 'eatery', 'grill'],
    path: (
      <>
        <path d="M7 2v8a2 2 0 0 1-2 2v10" strokeLinecap="round" />
        <path d="M5 2v6M9 2v6" strokeLinecap="round" />
        <path d="M17 2c-1.5 0-3 1.5-3 4v4a2 2 0 0 0 2 2v10" strokeLinecap="round" />
      </>
    ),
  },
  {
    keywords: ['cafe', 'coffee', 'bakery', 'patisserie'],
    path: (
      <>
        <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" />
        <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M8 3c-.5 1 .5 1.5 0 2.5M12 3c-.5 1 .5 1.5 0 2.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    keywords: ['hotel', 'motel', 'resort', 'accommodation', 'lodge'],
    path: (
      <>
        <path d="M3 20V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14" />
        <path d="M9 10h11a1 1 0 0 1 1 1v9" />
        <path d="M3 15h18" />
        <path d="M6 8h.01M6 11h.01" strokeLinecap="round" />
      </>
    ),
  },
  {
    keywords: ['catering', 'event'],
    path: (
      <>
        <path d="M12 3c-4 3-4 6-1 7-1 3-4 3-4 6a5 5 0 0 0 10 0c0-3-3-3-4-6 3-1 3-4-1-7z" />
      </>
    ),
  },
]

const FALLBACK_PATH = (
  <>
    <path d="M4 21V8l8-5 8 5v13" />
    <path d="M9 21v-6h6v6" />
  </>
)

function matchIcon(venueTypeName) {
  const name = (venueTypeName || '').toLowerCase()
  const match = ICONS.find((entry) => entry.keywords.some((k) => name.includes(k)))
  return match?.path || FALLBACK_PATH
}

function VenueTypeIcon({ venueTypeName, className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {matchIcon(venueTypeName)}
    </svg>
  )
}

export default VenueTypeIcon
