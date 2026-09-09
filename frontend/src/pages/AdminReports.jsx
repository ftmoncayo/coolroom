import { useEffect, useState } from 'react'
import * as api from '../lib/api'

const REASON_LABELS = {
  HARASSMENT: 'Harassment',
  SPAM: 'Spam',
  INAPPROPRIATE: 'Inappropriate content',
  OTHER: 'Other',
}

const TARGET_LABELS = {
  MESSAGE: 'Message',
  POST: 'Post',
  NOTICE: 'Notice',
  COMMENT: 'Comment',
  PROFILE: 'Profile',
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [blockedReportIds, setBlockedReportIds] = useState(() => new Set())

  useEffect(() => {
    api
      .fetchAdminReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleResolve(id) {
    setError('')
    setBusyId(id)
    try {
      const updated = await api.resolveReport(id)
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  async function handleBlock(report) {
    setError('')
    setBusyId(report.id)
    try {
      await api.blockUser(report.targetAuthorUserId)
      setBlockedReportIds((prev) => new Set(prev).add(report.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  async function handleDeleteContent(id) {
    setError('')
    setBusyId(id)
    try {
      const updated = await api.deleteReportedContent(id)
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status, targetDeleted: true, targetPreview: null } : r)),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Reports</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-faint">
                <th className="px-4 py-3 font-medium">Reporter</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-3 text-text-muted">{r.reporter.name}</td>
                  <td className="px-4 py-3 text-text">
                    <span className="text-xs text-text-faint">{TARGET_LABELS[r.targetType]}</span>
                    <p className="mt-0.5 whitespace-pre-wrap">
                      {r.targetDeleted ? (
                        <span className="italic text-text-faint">Content no longer exists</span>
                      ) : (
                        r.targetPreview
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{REASON_LABELS[r.reasonCategory]}</td>
                  <td className="px-4 py-3 text-text-muted">{r.detail || '—'}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.status === 'RESOLVED' ? 'text-text-muted' : 'font-medium text-danger'
                      }
                    >
                      {r.status === 'RESOLVED' ? 'Resolved' : 'Open'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => handleResolve(r.id)}
                        className="text-xs text-accent hover:underline disabled:opacity-50"
                      >
                        {r.status === 'RESOLVED' ? 'Reopen' : 'Resolve'}
                      </button>
                      {r.targetAuthorUserId && (
                        <button
                          type="button"
                          disabled={busyId === r.id || blockedReportIds.has(r.id)}
                          onClick={() => handleBlock(r)}
                          className="text-xs text-danger hover:underline disabled:opacity-50"
                        >
                          {blockedReportIds.has(r.id) ? 'Blocked' : 'Block user'}
                        </button>
                      )}
                      {r.targetType !== 'PROFILE' && !r.targetDeleted && (
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleDeleteContent(r.id)}
                          className="text-xs text-danger hover:underline disabled:opacity-50"
                        >
                          Delete content
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-text-faint">
                    No reports.
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

export default AdminReports
