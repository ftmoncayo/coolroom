import { useEffect, useState } from 'react'
import * as api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import ConnectionButton from '../ConnectionButton'
import { NavRow, RowList } from '../SectionRows'

function personName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ')
}

function formatDate(value) {
  if (!value) return ''
  return value.slice(0, 10)
}

function WorkerRow({ worker, showEndDate, currentUserId, onChange }) {
  function updateStatus(changes) {
    onChange({ ...worker, ...changes })
  }

  async function handleConnect() {
    const request = await api.requestConnection(worker.id)
    updateStatus({ connectionStatus: request.status === 'PENDING' ? 'pending-sent' : worker.connectionStatus })
  }

  async function handleAccept() {
    await api.acceptConnectionRequest(worker.connectionRequestId)
    updateStatus({ connectionStatus: 'connected' })
  }

  async function handleDecline() {
    await api.declineConnectionRequest(worker.connectionRequestId)
    updateStatus({ connectionStatus: 'none', connectionRequestId: null })
  }

  const name = personName(worker.profile) || worker.email

  return (
    <NavRow
      to={`/profile/${worker.id}`}
      label={name}
      aside={
        worker.id !== currentUserId && (
          <ConnectionButton
            status={worker.connectionStatus}
            onConnect={handleConnect}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )
      }
    >
      <p className="text-sm font-medium text-text">{name}</p>
      <p className="text-sm text-text-faint">
        {worker.roleTitle}
        {showEndDate && worker.endDate ? ` · until ${formatDate(worker.endDate)}` : ''}
      </p>
    </NavRow>
  )
}

function VenueWorkers({ venueId }) {
  const { user } = useAuth()
  const [current, setCurrent] = useState([])
  const [previous, setPrevious] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .fetchVenueWorkers(venueId)
      .then((data) => {
        setCurrent(data.current)
        setPrevious(data.previous)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [venueId])

  function handleCurrentChange(updated) {
    setCurrent((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
  }

  function handlePreviousChange(updated) {
    setPrevious((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
  }

  return (
    <>
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium text-text-faint">Current</h3>
          <div className="mt-2">
            {!loading && current.length === 0 && (
              <p className="text-sm text-text-faint">No one currently works here.</p>
            )}
            <RowList>
              {current.map((w) => (
                <WorkerRow key={w.id} worker={w} currentUserId={user?.id} onChange={handleCurrentChange} />
              ))}
            </RowList>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-faint">Previous</h3>
          <div className="mt-2">
            {!loading && previous.length === 0 && (
              <p className="text-sm text-text-faint">No previous workers logged yet.</p>
            )}
            <RowList>
              {previous.map((w) => (
                <WorkerRow
                  key={w.id}
                  worker={w}
                  showEndDate
                  currentUserId={user?.id}
                  onChange={handlePreviousChange}
                />
              ))}
            </RowList>
          </div>
        </div>
      </div>
    </>
  )
}

export default VenueWorkers
