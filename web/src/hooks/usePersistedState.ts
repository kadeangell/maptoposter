import { useState, useCallback } from "react"

const PREFIX = "mtp:"

export function usePersistedState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const fullKey = PREFIX + key

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(fullKey)
      if (!raw) return fallback
      const parsed = JSON.parse(raw)
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(fullKey)
        return fallback
      }
      return parsed.value as T
    } catch {
      return fallback
    }
  })

  const setPersisted = useCallback(
    (value: T) => {
      setState(value)
      localStorage.setItem(fullKey, JSON.stringify({ value, expiry: null }))
    },
    [fullKey],
  )

  return [state, setPersisted]
}
