// KUXY main process — finance module
// categories + transactions + subscriptions + finance:overview.
// Transactions tem side-effect em accounts.balance.

import { ipcMain } from 'electron'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerFinance(persistDb: () => void): void {
  // ========== CATEGORIES ==========
  ipcMain.handle('categories:list', (_e: unknown, params: { profileId?: number; type?: 'income' | 'expense' } = {}) => {
    const db = getDbInstance() as any
    const conds: any[] = []
    if (params.profileId !== undefined) conds.push(eq(schema.categories.profileId, params.profileId))
    if (params.type) conds.push(eq(schema.categories.type, params.type))
    conds.push(eq(schema.categories.archived, false))
    return db.select().from(schema.categories).where(and(...conds)).orderBy(schema.categories.name).all()
  })

  ipcMain.handle('categories:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.categories).values({ ...data, createdAt: new Date() }).returning().get()
    persistDb()
    return result
  })

  // ========== TRANSACTIONS ==========
  // list padrão via registerCrud-like custom (filtros específicos)
  ipcMain.handle('transactions:list', (_e: unknown, params: { profileId?: number; from?: string; to?: string; type?: 'income' | 'expense'; limit?: number } = {}) => {
    const db = getDbInstance() as any
    const conds: any[] = []
    if (params.profileId !== undefined) conds.push(eq(schema.transactions.profileId, params.profileId))
    if (params.from) conds.push(gte(schema.transactions.date, params.from))
    if (params.to) conds.push(lte(schema.transactions.date, params.to))
    if (params.type) conds.push(eq(schema.transactions.type, params.type))
    const baseQuery = db.select().from(schema.transactions).where(conds.length ? and(...conds) : undefined).orderBy(schema.transactions.date)
    return params.limit ? baseQuery.limit(params.limit).all() : baseQuery.all()
  })

  // CREATE: cria transação + atualiza balance da conta
  ipcMain.handle('transactions:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.transactions).values({ ...data, createdAt: new Date(), updatedAt: new Date() }).returning().get()
    if (result) {
      const delta = data.type === 'income' ? data.amount : -data.amount
      db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
        delta,
        Date.now(),
        data.accountId
      ])
    }
    persistDb()
    return result
  })

  // UPDATE: reverte balance antigo + aplica novo se accountId/type/amount mudou
  ipcMain.handle('transactions:update', async (_e: unknown, id: number, data: any) => {
    const db = getDbInstance() as any
    const old = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get()
    if (old) {
      // reverter balance da conta antiga
      const revert = old.type === 'income' ? -old.amount : old.amount
      db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
        revert,
        Date.now(),
        old.accountId
      ])
      // aplicar novo
      const newType = data.type ?? old.type
      const newAmount = data.amount ?? old.amount
      const newAccountId = data.accountId ?? old.accountId
      const apply = newType === 'income' ? newAmount : -newAmount
      db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
        apply,
        Date.now(),
        newAccountId
      ])
    }
    const result = db.update(schema.transactions).set({ ...data, updatedAt: new Date() }).where(eq(schema.transactions.id, id)).returning().get()
    persistDb()
    return result
  })

  // DELETE: reverte balance + deleta
  ipcMain.handle('transactions:delete', async (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    const t = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get()
    if (t) {
      const revert = t.type === 'income' ? -t.amount : t.amount
      db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
        revert,
        Date.now(),
        t.accountId
      ])
    }
    db.delete(schema.transactions).where(eq(schema.transactions.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // OVERVIEW: agregado pra dashboard financeiro
  ipcMain.handle('finance:overview', (_e: unknown, params: { from: string; to: string; profileId?: number }) => {
    const db = getDbInstance() as any
    const conds: any[] = [
      gte(schema.transactions.date, params.from),
      lte(schema.transactions.date, params.to)
    ]
    if (params.profileId) conds.push(eq(schema.transactions.profileId, params.profileId))

    const txs = db.select().from(schema.transactions).where(and(...conds)).all()

    let income = 0
    let expense = 0
    for (const t of txs) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }

    const accConds: any[] = [eq(schema.accounts.archived, false)]
    if (params.profileId) accConds.push(eq(schema.accounts.profileId, params.profileId))
    const accs = db.select().from(schema.accounts).where(and(...accConds)).all()
    const totalBalance = accs.reduce((sum: number, a: any) => sum + a.balance, 0)

    return {
      income,
      expense,
      net: income - expense,
      totalBalance,
      transactionCount: txs.length
    }
  })

  // ========== SUBSCRIPTIONS ==========
  registerCrud({
    prefix: 'subscriptions',
    table: schema.subscriptions,
    hasUpdatedAt: false,
    persistDb,
    skipDelete: false,
  })
}
