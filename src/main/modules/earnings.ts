// KUXY main process — earnings module
// Agregado de fontes de receita: soma de transações income agrupadas por categoria.

import { ipcMain } from 'electron'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getDbInstance } from '../db'
import * as schema from '../../shared/schema'

type EarningsSource = {
  /** id da categoria (categories.id) — ou 'uncategorized' se não tem */
  id: number | 'uncategorized'
  name: string
  color: string
  icon: string
  /** total em centavos (mesma moeda do profile, por ora tudo num) */
  total: number
  /** count de transações */
  count: number
  /** avg mensal (centavos/mês) — calculado nos últimos 30 dias */
  monthlyAvg: number
}

export function registerEarnings(): void {
  /**
   * Lista fontes de receita (income transactions agrupadas por categoria)
   * com totais no range.
   *
   * params: { from?: string (YYYY-MM-DD), to?: string, profileId?: number }
   */
  ipcMain.handle('earnings:sources', (_e: unknown, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const db = getDbInstance() as any

    // constrói WHERE
    const conds: any[] = [eq(schema.transactions.type, 'income')]
    if (params.profileId !== undefined) {
      conds.push(eq(schema.transactions.profileId, params.profileId))
    }
    if (params.from) conds.push(gte(schema.transactions.date, params.from))
    if (params.to) conds.push(lte(schema.transactions.date, params.to))

    const transactions = db
      .select()
      .from(schema.transactions)
      .where(and(...conds))
      .all() as any[]

    // busca categorias pra fazer join
    const categories = db.select().from(schema.categories).all() as any[]
    const catMap = new Map<number, any>()
    for (const c of categories) catMap.set(c.id, c)

    // agrupa por categoria
    const byCategory = new Map<number | string, EarningsSource>()

    for (const tx of transactions) {
      const key = tx.categoryId ?? 'uncategorized'
      const cat = catMap.get(tx.categoryId)
      const existing = byCategory.get(key)
      if (existing) {
        existing.total += tx.amount as number
        existing.count += 1
      } else {
        byCategory.set(key, {
          id: cat?.id ?? 'uncategorized',
          name: cat?.name ?? (tx.categoryId == null ? 'Sem categoria' : `Categoria ${tx.categoryId}`),
          color: cat?.color ?? '#737373',
          icon: cat?.icon ?? 'circle',
          total: tx.amount as number,
          count: 1,
          monthlyAvg: 0, // calculado depois
        })
      }
    }

    // calcula média mensal (últimos 30 dias)
    // se o range é >= 30 dias, divide por meses estimados
    let months = 1
    if (params.from && params.to) {
      const from = new Date(params.from)
      const to = new Date(params.to)
      const days = Math.max(1, (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
      months = Math.max(0.5, days / 30)
    }

    const sources: EarningsSource[] = []
    for (const s of byCategory.values()) {
      sources.push({
        ...s,
        monthlyAvg: Math.round(s.total / months),
      })
    }

    // ordena por total desc
    sources.sort((a, b) => b.total - a.total)

    // total geral
    const total = sources.reduce((sum, s) => sum + s.total, 0)
    // monthly total: só "Monthly" — categorias que aparecem todo mês (heurística simples)
    // por simplicidade, monthly = total / months (mesma lógica do monthlyAvg)
    const monthlyTotal = Math.round(total / months)

    return {
      sources,
      total,
      monthlyTotal,
      months,
      transactionCount: transactions.length,
    }
  })
}
