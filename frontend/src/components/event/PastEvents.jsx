import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/api'
import { NavRow, RowList } from '../SectionRows'

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Visible to everyone as view-only; canEdit adds per-event Edit and
// Duplicate actions for that venue/business's managers/admin.
function PastEvents({ ownerType, ownerId, canEdit }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .fetchEvents({ ownerType, ownerId, when: 'past', scope: null })
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [ownerType, ownerId])

  const newEventPath =
    ownerType === 'VENUE' ? `/venues/${ownerId}/events/new` : `/businesses/${ownerId}/events/new`

  if (loading) return null

  return (
    <>
      {error && <p className="text-sm text-danger">{error}</p>}
      {events.length === 0 && <p className="text-sm text-text-faint">No past events yet.</p>}
      <RowList>
        {events.map((event) => (
          <NavRow
            key={event.id}
            to={`/events/${event.id}`}
            label={event.title}
            aside={
              canEdit && (
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    to={`/events/${event.id}?edit=true`}
                    className="text-accent hover:text-accent-hover hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`${newEventPath}?duplicateFrom=${event.id}`}
                    className="text-accent hover:text-accent-hover hover:underline"
                  >
                    Duplicate
                  </Link>
                </div>
              )
            }
          >
            <p className="font-medium text-text">{event.title}</p>
            <p className="text-sm text-text-faint">
              {formatDateTime(event.startAt)} · {event.category.name}
            </p>
          </NavRow>
        ))}
      </RowList>
    </>
  )
}

export default PastEvents
