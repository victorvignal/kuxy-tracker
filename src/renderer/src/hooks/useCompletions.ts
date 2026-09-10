// KUXY renderer hook — useCompletions
// Hook pra ler/toggle/set completions de hábitos.

import { useEffect, useState, useCallback } from 'react'

export type Completion = {
  habitId: number
  date: string // YYYY-MM-DD
  count: number
  value: number
  note: string | null
  createdAt: number
}

export function useCompletions(profileId: number | undefined, range: { from: string; to: string }) {
  const [items, setItems] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!window.api?.completions || profileId === undefined) return
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.completions.list({
        from: range.from,
        to: range.to,
        profileId,
      })
      setItems(data ?? [])
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [profileId, range.from, range.to])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggle = useCallback(
    async (habitId: number, date: string, value = 1) => {
      if (!window.api?.completions) throw new Error('api not available')
      const result = await window.api.completions.toggle(habitId, date, value)
      await refresh()
      return result
    },
    [refresh]
  )

  const set = useCallback(
    async (habitId: number, date: string, count: number, value?: number) => {
      if (!window.api?.completions) throw new Error('api not available')
      const result = await window.api.completions.set(habitId, date, count, value)
      await refresh()
      return result
    },
    [refresh]
  )

  return { items, loading, error, refresh, toggle, set }
}

// helper: agrupa completions por data
export function groupByDate(items: Completion[]): Map<string, Completion[]> {
  const m = new Map<string, Completion[]>()
  for (const c of items) {
    if (!m.has(c.date)) m.set(c.date, [])
    m.get(c.date)!.push(c)
  }
  return m
}
