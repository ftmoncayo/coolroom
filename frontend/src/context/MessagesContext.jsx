import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import * as api from '../lib/api'

const MessagesContext = createContext(null)

// Mirrors NotificationsContext - refreshed on mount/login, and again by
// Messages/MessageThread's own poll ticks (see those pages), rather than
// running an independent interval here.
export function MessagesProvider({ children }) {
  const { user } = useAuth()
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  const refreshUnreadMessageCount = useCallback(() => {
    if (!user) {
      setUnreadMessageCount(0)
      return Promise.resolve()
    }
    return api.fetchUnreadMessageCount().then(setUnreadMessageCount).catch(() => {})
  }, [user])

  useEffect(() => {
    refreshUnreadMessageCount()
  }, [refreshUnreadMessageCount])

  return (
    <MessagesContext.Provider value={{ unreadMessageCount, refreshUnreadMessageCount }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  return useContext(MessagesContext)
}
