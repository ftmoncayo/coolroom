import { useState } from 'react'
import Modal from './Modal'
import * as api from '../lib/api'

const REASONS = [
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'OTHER', label: 'Other' },
]

function ReportButton({ targetType, targetId, label = 'Report', className }) {
  const [open, setOpen] = useState(false)
  const [reasonCategory, setReasonCategory] = useState(REASONS[0].value)
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function openModal() {
    setSubmitted(false)
    setError('')
    setDetail('')
    setReasonCategory(REASONS[0].value)
    setOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.submitReport(targetType, targetId, reasonCategory, detail)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={className || 'text-xs text-text-faint hover:text-danger hover:underline'}
      >
        {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Report">
        {submitted ? (
          <p className="text-sm text-text">Thanks — this has been reported to the team.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-sm text-danger">{error}</p>}
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Reason
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="rounded border border-border-strong bg-bg px-3 py-2 text-text focus:border-accent"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Details (optional)
              <textarea
                rows={3}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="rounded border border-border-strong bg-bg px-3 py-2 text-text focus:border-accent"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </form>
        )}
      </Modal>
    </>
  )
}

export default ReportButton
