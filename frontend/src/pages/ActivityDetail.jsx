import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../lib/api'
import ActivityItem from '../components/ActivityItem'

function ActivityDetail() {
  const { id } = useParams()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .fetchActivityById(id)
      .then(setActivity)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return null

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Activity</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        {activity && <ActivityItem activity={activity} />}
      </div>
    </div>
  )
}

export default ActivityDetail
