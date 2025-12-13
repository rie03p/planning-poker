import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write errors
    }
  }, [key, value])

  const remove = useCallback(() => {
    localStorage.removeItem(key)
    setValue(initialValue)
  }, [key, initialValue])

  return {
    value,
    setValue,
    remove,
  }
}
