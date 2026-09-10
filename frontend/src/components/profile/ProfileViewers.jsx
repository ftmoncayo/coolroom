import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/api'

function formatDate(value) {
  if (!value) return ''
  return value.slice(0, 10)
}

// Own-profile only - never shown on PublicProfile. `browseAnonymously` is
// passed down from the already-loaded profile rather than re-derived here,
// since GET /api/profile/me/viewers itself enforces the reciprocity rule
// (an empty `viewers` array either way, this just picks the right message).
function ProfileViewers({ browseAnonymously }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .fetchProfileViewers()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!data) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        {data.totalCount === 0
          ? 'No one has viewed your profile in the last 30 days.'
          : `${data.totalCount} view${data.totalCount === 1 ? '' : 's'} in the last 30 days.`}
      </p>

      {browseAnonymously && data.totalCount > 0 && (
        <p className="text-sm text-text-faint">
          You're browsing anonymously, so your own viewers are hidden too — turn that off to see who's
          named.
        </p>
      )}

      {!browseAnonymously && data.viewers.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.viewers.map((v, i) =>
            v.anonymous ? (
              <div key={i} className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2">
                <span className="text-sm text-text-faint">Someone</span>
                <span className="text-xs text-text-faint">{formatDate(v.viewedAt)}</span>
              </div>
            ) : (
              <div
                key={v.viewer?.id || i}
                className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2"
              >
                <Link
                  to={`/profile/${v.viewer.id}`}
                  className="text-sm font-medium text-text hover:text-accent hover:underline"
                >
                  {[v.viewer.profile?.firstName, v.viewer.profile?.lastName].filter(Boolean).join(' ') ||
                    v.viewer.email}
                </Link>
                <span className="text-xs text-text-faint">{formatDate(v.viewedAt)}</span>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileViewers
