// KUXY main process — ritmo module
// queueItems + pomodoroSessions (v0.11.5).

import { ipcMain } from 'electron'
import { and, eq, desc, gte, lte } from 'drizzle-orm'
import { getDbInstance } from '../db'
import * as schema from '../../shared/schema'

export function registerRitmo(persistDb: () => void): void {
  // queueItems CRUD — list filtrada por archived padrão, orderBy createdAt desc?
  // mantém comportamento: list filtrada archived + profileId
  ipcMain.handle('queue:list', (_e: unknown, params: { profileId?: number; includeArchived?: boolean } = {}) => {
    const db = getDbInstance() as any
    const conds: any[] = []
    if (!params.includeArchived) conds.push(eq(schema.queueItems.archived, false))
    if (params.profileId !== undefined) conds.push(eq(schema.queueItems.profileId, params.profileId))
    return db.select().from(schema.queueItems).where(conds.length ? and(...conds) : undefined).all()
  })

  ipcMain.handle('queue:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.queueItems).values({ ...data, createdAt: new Date(), updatedAt: new Date() }).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('queue:update', async (_e: unknown, id: number, data: any) => {
    const db = getDbInstance() as any
    const result = db.update(schema.queueItems).set({ ...data, updatedAt: new Date() }).where(eq(schema.queueItems.id, id)).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('queue:archive', async (_e: unknown, id: number, archived: boolean) => {
    const db = getDbInstance() as any
    db.update(schema.queueItems).set({ archived, updatedAt: new Date() }).where(eq(schema.queueItems.id, id)).run()
    persistDb()
    return { ok: true }
  })

  ipcMain.handle('queue:delete', async (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    db.delete(schema.queueItems).where(eq(schema.queueItems.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // ========== POMODORO ==========
  ipcMain.handle('pomodoro:list', (_e: unknown, params: { profileId?: number; from?: number; to?: number } = {}) => {
    const db = getDbInstance() as any
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.pomodoroSessions.profileId, params.profileId))
    if (params.from) conds.push(gte(schema.pomodoroSessions.startedAt, new Date(params.from)))
    if (params.to) conds.push(lte(schema.pomodoroSessions.startedAt, new Date(params.to)))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.pomodoroSessions).where(where).orderBy(desc(schema.pomodoroSessions.startedAt)).all()
  })

  ipcMain.handle('pomodoro:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.pomodoroSessions).values(data).returning().get()
    persistDb()
    return result
  })
}
