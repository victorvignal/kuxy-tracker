// KUXY renderer hook — useEarnings
// Hook pra ler fontes de receita (income transactions agrupadas por categoria).

import { useEffect, useState, useCallback } from 'react'

export type EarningsSource = {
  id: number | 'uncategorized'
  name: string
  color: string
  icon: string
  total: number
  count: number
  monthlyAvg: number
}

export type EarningsData = {
  sources: EarningsSource[]
  total: number
  monthlyTotal: number
  months: number
  transactionCount: number
}

export function useEarnings(profileId?: number, opts?: { from?: string; to?: string }) {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!window.api?.earnings) return
    setLoading(true)
    setError(null)
    try {
      const params: { from?: string; to?: string; profileId?: number } = {}
      if (profileId !== undefined) params.profileId = profileId
      if (opts?.from) params.from = opts.from
      if (opts?.to) params.to = opts.to
      const result = await window.api.earnings.sources(params)
      setData(result)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [profileId, opts?.from, opts?.to])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}
