import { locationCountryName, locationString, rightToWorkLabel } from '../../lib/location'

export function initials(profile) {
  const first = profile?.firstName?.[0] || ''
  const last = profile?.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

// The bordered, striped card shell shared by the read-only identity card
// below and its edit-mode form (ProfileDetails) - one shell so the two
// stay visually identical rather than drifting apart over time.
export function IdCardShell({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-1.5 bg-badge" aria-hidden="true" />
      <div className="relative p-5 sm:p-6">
        <span className="absolute right-4 top-4 text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">
          Staffie
        </span>
        {children}
      </div>
    </div>
  )
}

// Fixed square photo frame - badge/license style, not the circular avatar
// used elsewhere. No photo upload exists yet, so this always shows initials.
export function IdPhotoFrame({ children }) {
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-border-strong bg-bg text-2xl font-semibold text-text-muted sm:h-28 sm:w-28">
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <IdPhotoFrame>{initials(profile)}</IdPhotoFrame>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="sm:pr-20">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{name || 'Unnamed'}</h1>
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
      </div>
    </IdCardShell>
  )
}

export default IdentityCard
