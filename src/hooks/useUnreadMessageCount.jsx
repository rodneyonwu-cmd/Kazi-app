import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const UnreadContext = createContext({ count: 0, refresh: () => {} })

export function UnreadMessageProvider({ children }) {
  const { getToken } = useAuth()
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch(`${API_URL}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setCount(data.count || 0)
    } catch {}
  }, [getToken])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <UnreadContext.Provider value={{ count, refresh }}>
      {children}
    </UnreadContext.Provider>
  )
}

export default function useUnreadMessageCount() {
  return useContext(UnreadContext)
}
