// KUXY main process — focus module
// focus_sessions: create + list + totals.

import { ipcMain } from 'electron'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getDbInstance } from '../db'
import * as schema from '../../shared/schema'

export function registerFocus(persistDb: () => void): void {
  // CREATE
  ipcMain.handle('focus:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.focusSessions).values(data).returning().get()
    persistDb()
    return result
  })

  // LIST
  ipcMain.handle('focus:list', (_e: unknown, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const db = getDbInstance() as any
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.focusSessions.startedAt, new Date(params.from)))
    if (params.to) conditions.push(lte(schema.focusSessions.startedAt, new Date(params.to)))
    if (params.profileId !== undefined) conditions.push(eq(schema.focusSessions.profileId, params.profileId))
    return conditions.length === 0
      ? db.select().from(schema.focusSessions).all()
      : db.select().from(schema.focusSessions).where(and(...conditions)).all()
  })

  // TOTALS — soma de duration por dia
  ipcMain.handle('focus:totals', (_e: unknown, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const db = getDbInstance() as any
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.focusSessions.startedAt, new Date(params.from)))
    if (params.to) conditions.push(lte(schema.focusSessions.startedAt, new Date(params.to)))
    if (params.profileId !== undefined) conditions.push(eq(schema.focusSessions.profileId, params.profileId))
    const where = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions)
    const rows = where
      ? db.select({ startedAt: schema.focusSessions.startedAt, duration: schema.focusSessions.duration })
          .from(schema.focusSessions)
          .where(where)
          .all()
      : db.select({ startedAt: schema.focusSessions.startedAt, duration: schema.focusSessions.duration })
          .from(schema.focusSessions)
          .all()
    // agrupa por dia
    const totals: Record<string, number> = {}
    for (const r of rows) {
      const day = new Date(r.startedAt as Date).toISOString().slice(0, 10)
      totals[day] = (totals[day] || 0) + (r.duration as number)
    }
    return totals
  })
}
