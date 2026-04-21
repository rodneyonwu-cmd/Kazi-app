import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let cachedIds = null
let inflight = null

async function fetchIds(getToken) {
  try {
    const token = await getToken()
    if (!token) return []
    const res = await fetch(`${API_URL}/api/providers?page=1&limit=25`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const json = await res.json()
    const data = Array.isArray(json) ? json : (json.providers || json.data || [])
    return data.map((p) => p.id).filter(Boolean)
  } catch {
    return []
  }
}

export default function useProviderIds() {
  const { getToken } = useAuth()
  const [ids, setIds] = useState(cachedIds || [])

  useEffect(() => {
    if (cachedIds) return
    if (!inflight) {
      inflight = fetchIds(getToken).then((result) => {
        cachedIds = result
        return result
      })
    }
    inflight.then((result) => setIds(result))
  }, [getToken])

  return ids
}

export function resolveProviderId(mockId, realIds) {
  if (!realIds || realIds.length === 0) return mockId
  let h = 0
  const s = String(mockId || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return realIds[h % realIds.length]
}
