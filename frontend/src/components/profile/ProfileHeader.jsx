import { locationString } from '../../lib/location'
import { instagramUrl, instagramHandle } from '../../lib/instagram'

function initials(profile) {
  const first = profile?.firstName?.[0] || ''
  const last = profile?.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

// One compact header row (photo/placeholder, name, location, title,
// connection count, actions) replacing what used to be a separate boxed ID
// Card section just for identity - the ID Card below now only carries Right
// to work / Cultural identity, everything else lives here.
function ProfileHeader({ profile, connectionsCount, isOwn, onEdit, extraStat, children }) {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-lg font-semibold text-text-muted"
        aria-hidden="true"
      >
        {initials(profile)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-text">{name || 'Unnamed'}</h1>
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
        {profile?.professionalTitle && <p className="text-sm text-text-muted">{profile.professionalTitle}</p>}
        <p className="text-sm text-text-faint">{locationString(profile)}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-faint">
          <span>
            {connectionsCount ?? 0} connection{connectionsCount === 1 ? '' : 's'}
          </span>
          {profile?.instagram && (
            <a
              href={instagramUrl(profile.instagram)}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover hover:underline"
            >
              {instagramHandle(profile.instagram)}
            </a>
          )}
        </div>
        {extraStat && <p className="text-sm text-text-faint">{extraStat}</p>}
      </div>

      {children && <div className="flex shrink-0 flex-wrap items-center gap-3">{children}</div>}
    </div>
  )
}

export default ProfileHeader
