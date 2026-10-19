import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/api'
import Section from '../Section'
import { RowList, StaticRow } from '../SectionRows'

function PendingManagerRequests({ venueId }) {
  const [nominations, setNominations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState('')

  function refresh() {
    return api.fetchVenueNominationsForVenue(venueId).then(setNominations)
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId])

  async function handleApprove(id) {
    setError('')
    setActionId(id)
    try {
      await api.approveVenueManagerNomination(id)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId('')
    }
  }

  async function handleDecline(id) {
    setError('')
    setActionId(id)
    try {
      await api.declineVenueManagerNomination(id)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId('')
    }
  }

  return (
    <Section title="Pending Manager Requests">
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && nominations.length === 0 && (
        <p className="text-sm text-text-faint">No pending requests.</p>
      )}
      <RowList>
        {nominations.map((nomination) => (
          <StaticRow key={nomination.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-text">
                  <Link
                    to={`/profile/${nomination.nominee?.id}`}
                    className="font-medium text-success hover:text-success-hover hover:underline"
                  >
                    {nomination.nominee?.name}
                  </Link>{' '}
                  wants to manage this venue
                </p>
                <p className="mt-1 text-sm text-text-faint">{nomination.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(nomination.id)}
                  disabled={actionId === nomination.id}
                  className="rounded bg-success px-3 py-1.5 text-sm font-medium text-accent-text hover:brightness-110 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline(nomination.id)}
                  disabled={actionId === nomination.id}
                  className="rounded border border-border-strong px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          </StaticRow>
        ))}
      </RowList>
    </Section>
  )
}

export default PendingManagerRequests
