export function levelLabel(level) {
  return level === 'UPSKILLING' ? 'Upskilling' : `Level ${level}`
}

// Display order wherever tiered skills/knowledge areas are listed together:
// manager-endorsed (star) first, then peer-endorsed (tick), then Upskilling,
// then self-declared last.
const LEVEL_RANK = { 3: 0, 2: 1, UPSKILLING: 2, 1: 3 }

export function sortByLevel(items) {
  return [...items].sort((a, b) => (LEVEL_RANK[a.level] ?? 4) - (LEVEL_RANK[b.level] ?? 4))
}
