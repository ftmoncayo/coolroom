import { useState } from 'react'
import * as api from '../lib/api'

const CATEGORIES = [
  { value: 'WORKING_WELL', label: "What's working well" },
  { value: 'NOT_WORKING', label: "What's not working" },
  { value: 'SUGGESTION', label: 'A suggestion' },
  { value: 'OTHER', label: 'Something else' },
]

function Feedback() {
  const [category, setCategory] = useState(CATEGORIES[0].value)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.submitFeedback(category, message)
      setMessage('')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Feedback</h1>
        <p className="text-sm text-text-muted">
          Tell us what's working, what's not, or anything else on your mind — it goes straight to the team.
        </p>

        {submitted && (
          <p className="rounded-lg border border-border bg-surface p-4 text-sm text-text">
            Thanks — your feedback has been sent.
          </p>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
        >
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded border border-border-strong bg-bg px-3 py-2 text-text focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Message
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us more..."
              className="rounded border border-border-strong bg-bg px-3 py-2 text-text focus:border-accent"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Feedback
