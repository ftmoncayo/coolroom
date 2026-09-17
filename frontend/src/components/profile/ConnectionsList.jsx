import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/api'
import { CONTENT_TYPES, contentTypeCardStyle } from '../../lib/contentTypeColors'

function personName(profile) {
  if (!profile) return null
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ')
}

function ConnectionsList() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState('')

  useEffect(() => {
    api
      .fetchConnections()
      .then(setConnections)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove(userId) {
    setError('')
    setRemovingId(userId)
    try {
      await api.removeConnection(userId)
      setConnections((prev) => prev.filter((c) => c.id !== userId))
    } catch (err) {
      setError(err.message)
    } finally {
      setRemovingId('')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && connections.length === 0 && (
        <p className="text-sm text-text-faint">You haven't connected with anyone yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {connections.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded px-3 py-2"
            style={contentTypeCardStyle(CONTENT_TYPES.PEOPLE)}
          >
            <div>
              <Link to={`/profile/${c.id}`} className="text-sm font-medium text-text hover:underline">
                {personName(c.profile) || c.email}
              </Link>
              {c.profile?.professionalTitle && (
                <p className="text-sm text-text-faint">{c.profile.professionalTitle}</p>
              )}
            </div>
            <button
              type="button"
              disabled={removingId === c.id}
              onClick={() => handleRemove(c.id)}
              className="text-sm text-danger hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectionsList
