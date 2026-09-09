import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'
import { useNotifications } from '../context/NotificationsContext'
import ReportButton from '../components/ReportButton'

const POLL_INTERVAL_MS = 4000

function formatTime(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function MessageThread() {
  const { id } = useParams()
  const { user } = useAuth()
  const { refreshUnreadMessageCount } = useMessages()
  const { refreshUnreadCount } = useNotifications()
  const [participant, setParticipant] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    function refresh() {
      api
        .fetchMessages(id)
        .then((data) => {
          if (cancelled) return
          setParticipant(data.conversation.participant)
          setMessages(data.messages)
          // Fetching the thread is also what marks its messages read and
          // resolves the MESSAGE notification for it (see GET
          // .../messages), so both nav badges need to catch up too.
          refreshUnreadMessageCount()
          refreshUnreadCount()
        })
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false))
    }
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!draft.trim()) return
    setError('')
    setSending(true)
    try {
      const message = await api.sendMessage(id, draft)
      setMessages((prev) => [...prev, message])
      setDraft('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-screen flex-col bg-bg px-4 py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text">{participant?.name}</h1>
          <Link to="/messages" className="text-sm text-accent hover:text-accent-hover hover:underline">
            Back to messages
          </Link>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-surface p-4">
          {messages.length === 0 && (
            <p className="text-sm text-text-faint">No messages yet — say hello.</p>
          )}
          {messages.map((m) => {
            const mine = m.senderUserId === user.id
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    mine ? 'bg-accent text-accent-text' : 'bg-bg text-text'
                  }`}
                >
                  {m.content}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-text-faint">{formatTime(m.createdAt)}</span>
                  {!mine && <ReportButton targetType="MESSAGE" targetId={m.id} />}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 rounded border border-border-strong bg-surface px-3 py-2 text-text focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageThread
