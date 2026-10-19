import { useEffect, useState } from 'react'
import * as api from '../../lib/api'
import { NavRow, RowList } from '../SectionRows'

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
    <>
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && connections.length === 0 && (
        <p className="text-sm text-text-faint">You haven't connected with anyone yet.</p>
      )}

      <RowList>
        {connections.map((c) => {
          const name = personName(c.profile) || c.email
          return (
            <NavRow
              key={c.id}
              to={`/profile/${c.id}`}
              label={name}
              aside={
                <button
                  type="button"
                  disabled={removingId === c.id}
                  onClick={() => handleRemove(c.id)}
                  className="text-sm text-danger hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              }
            >
              <p className="text-sm font-medium text-text">{name}</p>
              {c.profile?.professionalTitle && (
                <p className="text-sm text-text-faint">{c.profile.professionalTitle}</p>
              )}
            </NavRow>
          )
        })}
      </RowList>
    </>
  )
}

export default ConnectionsList
