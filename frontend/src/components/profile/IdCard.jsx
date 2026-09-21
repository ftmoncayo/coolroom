import { locationCountryName, locationString, rightToWorkLabel } from '../../lib/location'

export function initials(profile) {
  const first = profile?.firstName?.[0] || ''
  const last = profile?.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

// The bordered, striped card shell shared by the read-only identity card
// below and its edit-mode form (ProfileDetails) - one shell so the two
// stay visually identical rather than drifting apart over time. A
// translucent white wash over the dark page (not the app's usual solid
// bg-surface) is the point here - it's meant to read like laminated ID
// plastic, not just another dark card.
export function IdCardShell({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
      <div className="h-1.5 bg-badge" aria-hidden="true" />
      <div className="relative p-5 sm:p-6">
        <span className="absolute right-4 top-4 text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">
          Coolroom
        </span>
        {children}
      </div>
    </div>
  )
}

// Fixed square photo frame - badge/license style, not the circular avatar
// used elsewhere. No photo upload exists yet, so this always shows initials.
// Smaller on mobile so it and the name/title column can stay side by side
// (rather than stacking) even at phone width.
export function IdPhotoFrame({ children }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-border-strong bg-bg text-xl font-semibold text-text-muted sm:h-28 sm:w-28 sm:text-2xl">
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-text-faint">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  )
}

// Read-only identity card: photo, name, title, and the identity fields that
// used to be a separate "ID Card" section below the header. Connection
// count, mutual-connections/venues-in-common, and action buttons are
// deliberately NOT part of this card - they render outside it, below.
function IdentityCard({ profile, isOwn, onEdit }) {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')

  return (
    <IdCardShell>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <IdPhotoFrame>{initials(profile)}</IdPhotoFrame>

          <div className="min-w-0 flex-1 pr-14 sm:pr-20">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-text sm:text-3xl">{name || 'Unnamed'}</h1>
              {isOwn && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-sm text-accent hover:text-accent-hover hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            {profile?.professionalTitle && (
              <p className="text-base font-medium text-text-muted">{profile.professionalTitle}</p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Field label="Location" value={locationString(profile)} />
          <Field label="Cultural identity / background" value={profile?.culturalIdentity || '—'} />
          <Field label="Languages spoken" value={profile?.languages || '—'} />
          <Field
            label={rightToWorkLabel(locationCountryName(profile))}
            value={profile?.rightToWork ? 'Yes' : 'No'}
          />
        </dl>
      </div>
    </IdCardShell>
  )
}

export default IdentityCard
