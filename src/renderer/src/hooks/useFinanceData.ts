import { useEffect, useState } from 'react'
import { useProfileStore } from '../store/useProfile'

/**
 * Hook que carrega accounts + categories + transactions do módulo Finance
 * filtrados pelo perfil ativo.
 *
 * Usado pelo Dashboard novo pra derivar stats (Monthly Balance / Income / Expenses)
 * e o gráfico Balance Flow + Spending Breakdown.
 *
 * Substitui a duplicação que existia no Finance.tsx.
 */

type Account = {
  id: number
  profileId: number
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash'
  balance: number
  archived?: boolean
}

type Category = {
  id: number
  profileId: number
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
}

type Transaction = {
  id: number
  profileId: number
  accountId: number
  categoryId: number | null
  type: 'income' | 'expense'
  amount: number
  description?: string
  date: string
}

export function useFinanceData() {
  const activeProfile = useProfileStore((s) => s.getActive())
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const profileId = activeProfile?.id
    if (profileId == null) {
      setAccounts([])
      setCategories([])
      setTransactions([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      window.api.finance.accounts.list({ profileId }),
      window.api.finance.categories.list({ profileId }),
      window.api.finance.transactions.list({ profileId })
    ])
      .then(([a, c, t]) => {
        if (cancelled) return
        setAccounts(a as Account[])
        setCategories(c as Category[])
        setTransactions(t as Transaction[])
      })
      .catch((e) => console.error('[useFinanceData]', e))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [activeProfile?.id])

  return { accounts, categories, transactions, loading }
}