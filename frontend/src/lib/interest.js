// "N interested" is hidden on event/training rows until enough people have
// expressed interest - a lone "0 interested" reads as a dead event rather
// than a new one. (Application counts on job rows are different: they're
// actionable for whoever manages the listing, so they stay visible.)
export const INTEREST_VISIBILITY_THRESHOLD = 5

export function shouldShowInterestCount(count) {
  return (count ?? 0) >= INTEREST_VISIBILITY_THRESHOLD
}
