import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../lib/api'

const CATEGORY_LABELS = {
  WORKING_WELL: "What's working well",
  NOT_WORKING: "What's not working",
  SUGGESTION: 'Suggestion',
  OTHER: 'Other',
}

function formatDate(value) {
  if (!value) return ''
  return value.slice(0, 10)
}

function AdminFeedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .fetchAdminFeedback()
      .then(setFeedback)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggleReviewed(id) {
    try {
      const updated = await api.toggleFeedbackReviewed(id)
      setFeedback((prev) => prev.map((f) => (f.id === id ? updated : f)))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Feedback</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-faint">
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => {
                const name = [f.author.profile?.firstName, f.author.profile?.lastName]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <tr key={f.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 text-text-muted">{name || f.author.email}</td>
                    <td className="px-4 py-3 text-text-muted">{CATEGORY_LABELS[f.category]}</td>
                    <td className="px-4 py-3 text-text">{f.message}</td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(f.createdAt)}</td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 text-text-muted">
                        <input
                          type="checkbox"
                          checked={f.reviewed}
                          onChange={() => handleToggleReviewed(f.id)}
                          className="h-4 w-4 accent-accent"
                        />
                        {f.reviewed ? 'Reviewed' : 'Unreviewed'}
                      </label>
                    </td>
                  </tr>
                )
              })}
              {feedback.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-faint">
                    No feedback submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminFeedback
