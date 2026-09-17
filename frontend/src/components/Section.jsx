// One accent color per content area (Skills & Knowledge Bank, Experience,
// Information, People & Connections, Jobs & Events, Venues & Businesses) so
// the same category always reads the same color wherever it appears. Tier
// tags (self-declared/upskilling/tick/star) are deliberately excluded from
// this system and stay monochrome.
const TONE_CLASSES = {
  skills: 'text-section-skills',
  experience: 'text-section-experience',
  information: 'text-section-information',
  people: 'text-section-people',
  jobs: 'text-section-jobs',
  venues: 'text-section-venues',
}

const TONE_DOT_CLASSES = {
  skills: 'bg-section-skills',
  experience: 'bg-section-experience',
  information: 'bg-section-information',
  people: 'bg-section-people',
  jobs: 'bg-section-jobs',
  venues: 'bg-section-venues',
}

// Plain, unboxed section block used across Profile/Venue/Home: an all-caps
// heading with no card/border wrapper, matching how Recent Activity already
// rendered before this became the standard everywhere.
function Section({ id, title, tone, action, children }) {
  const titleClass = tone ? TONE_CLASSES[tone] : 'text-text'
  const dotClass = tone ? TONE_DOT_CLASSES[tone] : null

  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`flex items-center gap-2 text-xl font-semibold uppercase tracking-wide ${titleClass}`}>
          {dotClass && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export default Section
