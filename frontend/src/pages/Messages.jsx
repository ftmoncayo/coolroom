import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../lib/api'

const POLL_INTERVAL_MS = 8000

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function Messages() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function refresh() {
      api
        .fetchConversations()
        .then(setConversations)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Messages</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        {conversations.length === 0 && (
          <p className="text-sm text-text-faint">
            No conversations yet — message a connection from their profile to start one.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 hover:border-border-strong hover:bg-surface-hover"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className={`text-text ${c.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                  {c.participant.name}
                </span>
                <span className="truncate text-sm text-text-faint">
                  {c.lastMessage ? c.lastMessage.content : 'No messages yet'}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {c.lastMessage && (
                  <span className="text-xs text-text-faint">{formatDateTime(c.lastMessage.createdAt)}</span>
                )}
                {c.unreadCount > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-text">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Messages
