// KUXY main process — habits module
// habits CRUD + completions (com handlers custom toggle/set).

import { ipcMain } from 'electron'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerHabits(persistDb: () => void): void {
  // habits CRUD padrão (list filtra archived, hasUpdatedAt, hasCreatedAt)
  registerCrud({
    prefix: 'habits',
    table: schema.habits,
    hasUpdatedAt: true,
    persistDb,
  })

  // GET individual
  ipcMain.handle('habits:get', (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    return db.select().from(schema.habits).where(eq(schema.habits.id, id)).get()
  })

  // ========== COMPLETIONS ==========
  // list com filtros de data e habitId
  ipcMain.handle('completions:list', (_e: unknown, params: { from?: string; to?: string; habitId?: number; profileId?: number } = {}) => {
    const db = getDbInstance() as any
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.completions.date, params.from))
    if (params.to) conditions.push(lte(schema.completions.date, params.to))
    if (params.habitId !== undefined) conditions.push(eq(schema.completions.habitId, params.habitId))
    if (conditions.length === 0) return db.select().from(schema.completions).all()
    return db.select().from(schema.completions).where(and(...conditions)).all()
  })

  // TOGGLE — incrementa count se já existe, cria se não
  ipcMain.handle('completions:toggle', async (_e: unknown, habitId: number, date: string, value = 1) => {
    const db = getDbInstance() as any
    const existing = db
      .select()
      .from(schema.completions)
      .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
      .get()
    if (existing) {
      const newCount = existing.count + 1
      const result = db
        .update(schema.completions)
        .set({ count: newCount, value })
        .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
        .returning()
        .get()
      persistDb()
      return result
    } else {
      const result = db
        .insert(schema.completions)
        .values({ habitId, date, count: 1, value })
        .returning()
        .get()
      persistDb()
      return result
    }
  })

  // SET — força count (substitui)
  ipcMain.handle('completions:set', async (_e: unknown, habitId: number, date: string, count: number, value?: number) => {
    const db = getDbInstance() as any
    const updateData: any = { count }
    if (value !== undefined) updateData.value = value
    const result = db
      .update(schema.completions)
      .set(updateData)
      .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
      .returning()
      .get()
    persistDb()
    return result
  })
}
