// KUXY main process — journal module
// journal_entries: list + upsert custom (não tem CRUD padrão completo).

import { ipcMain } from 'electron'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getDbInstance } from '../db'
import * as schema from '../../shared/schema'

export function registerJournal(persistDb: () => void): void {
  // list com filtros
  ipcMain.handle('journal:list', (_e: unknown, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const db = getDbInstance() as any
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.journalEntries.date, params.from))
    if (params.to) conditions.push(lte(schema.journalEntries.date, params.to))
    if (params.profileId !== undefined) conditions.push(eq(schema.journalEntries.profileId, params.profileId))
    return conditions.length === 0
      ? db.select().from(schema.journalEntries).all()
      : db.select().from(schema.journalEntries).where(and(...conditions)).all()
  })

  // upsert — date é unique, então UPDATE se existe, INSERT se não
  ipcMain.handle('journal:upsert', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const existing = db
      .select()
      .from(schema.journalEntries)
      .where(eq(schema.journalEntries.date, data.date))
      .get()
    if (existing) {
      const result = db
        .update(schema.journalEntries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.journalEntries.date, data.date))
        .returning()
        .get()
      persistDb()
      return result
    } else {
      const result = db
        .insert(schema.journalEntries)
        .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
        .returning()
        .get()
      persistDb()
      return result
    }
  })
}
