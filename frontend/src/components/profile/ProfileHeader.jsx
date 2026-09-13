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
    <div className="flex flex-wrap items-center gap-5">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-xl font-semibold text-text-muted"
        aria-hidden="true"
      >
        {initials(profile)}
      </div>

      <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text">{name || 'Unnamed'}</h1>
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
        {extraStat &&
          (Array.isArray(extraStat) ? extraStat : [extraStat]).map((line, i) => (
            <p key={i} className="text-sm text-text-faint">
              {line}
            </p>
          ))}
      </div>

      {children && <div className="flex shrink-0 flex-wrap items-center gap-3">{children}</div>}
    </div>
  )
}

export default ProfileHeader
