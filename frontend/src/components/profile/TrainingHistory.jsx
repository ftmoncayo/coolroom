import { useEffect, useState } from 'react'
import * as api from '../../lib/api'
import { NavRow, RowList } from '../SectionRows'

function formatDate(value) {
  if (!value) return ''
  return value.slice(0, 10)
}

const STATUS_LABELS = {
  INTERESTED: 'Interested',
  ATTENDED: 'Attended',
}

// DID_NOT_ATTEND rows never reach here — GET /api/profile/training excludes
// them entirely, not just hides them client-side.
function TrainingHistory() {
  const [training, setTraining] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .fetchTraining()
      .then(setTraining)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && training.length === 0 && (
        <p className="text-sm text-text-faint">No training or events yet.</p>
      )}
      <RowList>
        {training.map((t) => (
          <NavRow
            key={t.id}
            to={`/events/${t.event.id}`}
            label={t.event.title}
            meta={
              <span className="shrink-0 rounded border border-border-strong px-2 py-0.5 text-xs text-text-muted">
                {STATUS_LABELS[t.status]}
              </span>
            }
          >
            <p className="text-sm font-medium text-text">{t.event.title}</p>
            <p className="text-sm text-text-faint">
              {t.event.category.name} · {formatDate(t.event.startAt)}
            </p>
          </NavRow>
        ))}
      </RowList>
    </>
  )
}

export default TrainingHistory
