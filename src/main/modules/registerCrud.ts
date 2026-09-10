// KUXY main process — generic CRUD IPC registrar
// Reduz ~70 ipcMain.handle pra chamadas declarativas.
//
// Uso:
//
//   registerCrud({
//     prefix: 'contacts',
//     table: schema.contacts,
//     hasProfileId: true,
//     hasUpdatedAt: true,
//     persistDb,
//   })
//
//   // gera automaticamente:
//   // - contacts:list   (params: { profileId?, includeArchived? })
//   // - contacts:create (data)
//   // - contacts:update (id, data)
//   // - contacts:archive (id, archived)     [só se table tem archived]
//   // - contacts:delete (id)                [skipDelete:true pra omitir]

import { ipcMain } from 'electron'
import { eq, and } from 'drizzle-orm'
import { getDbInstance } from '../db'

interface RegisterCrudOptions {
  /** Prefixo dos channels: contacts → 'contacts:list' etc. */
  prefix: string
  /** Tabela drizzle. */
  table: any
  /** Se a tabela tem updatedAt (seta no create/update). */
  hasUpdatedAt?: boolean
  /** Callback de persistência (write to disk). Obrigatório pra writes. */
  persistDb: () => void
  /** Se omitir `delete` (alguns módulos não têm delete direto). */
  skipDelete?: boolean
  /** Se omitir `list` (módulo define list custom). */
  skipList?: boolean
  /** Se omitir `create` (módulo define create custom). */
  skipCreate?: boolean
  /** Se omitir `update` (módulo define update custom). */
  skipUpdate?: boolean
  /** Se omitir `archive` (módulo define archive custom — só gera se tabela tem archived). */
  skipArchive?: boolean
}

export function registerCrud(opts: RegisterCrudOptions): void {
  const { prefix, table, hasUpdatedAt, persistDb, skipDelete, skipList, skipCreate, skipUpdate, skipArchive } = opts
  const t = table
  const hasArchived = !!t.archived
  const hasProfileIdCol = !!t.profileId
  const hasUpdatedAtCol = !!t.updatedAt
  const hasCreatedAtCol = !!t.createdAt

  // LIST (skipList: true pula — caller define custom)
  if (!skipList) {
    ipcMain.handle(`${prefix}:list`, (_e: unknown, params: { profileId?: number; includeArchived?: boolean } = {}) => {
      const db = getDbInstance() as any
      const conditions: any[] = []
      if (hasArchived && !params.includeArchived) {
        conditions.push(eq(t.archived, false))
      }
      if (hasProfileIdCol && params.profileId !== undefined) {
        conditions.push(eq(t.profileId, params.profileId))
      }
      const where = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions)
      return where ? db.select().from(t).where(where).all() : db.select().from(t).all()
    })
  }

  // CREATE (skipCreate: true pula — caller define custom)
  if (!skipCreate) {
    ipcMain.handle(`${prefix}:create`, async (_e: unknown, data: any) => {
      const db = getDbInstance() as any
      const insertData = { ...data }
      if (hasCreatedAtCol && hasUpdatedAt && !insertData.createdAt) insertData.createdAt = new Date()
      if (hasUpdatedAtCol && hasUpdatedAt) insertData.updatedAt = new Date()
      const result = db.insert(t).values(insertData).returning().get()
      persistDb()
      return result
    })
  }

  // UPDATE (skipUpdate: true pula — caller define custom)
  if (!skipUpdate) {
    ipcMain.handle(`${prefix}:update`, async (_e: unknown, id: number, data: any) => {
      const db = getDbInstance() as any
      const updateData = { ...data }
      if (hasUpdatedAtCol && hasUpdatedAt) updateData.updatedAt = new Date()
      const result = db.update(t).set(updateData).where(eq(t.id, id)).returning().get()
      persistDb()
      return result
    })
  }

  // ARCHIVE (skipArchive: true pula — caller define custom)
  if (hasArchived && !skipArchive) {
    ipcMain.handle(`${prefix}:archive`, async (_e: unknown, id: number, archived: boolean) => {
      const db = getDbInstance() as any
      db.update(t).set({ archived }).where(eq(t.id, id)).run()
      persistDb()
      return { ok: true }
    })
  }

  // DELETE (skipDelete: true pula — caller define custom)
  if (!skipDelete) {
    ipcMain.handle(`${prefix}:delete`, async (_e: unknown, id: number) => {
      const db = getDbInstance() as any
      db.delete(t).where(eq(t.id, id)).run()
      persistDb()
      return { ok: true }
    })
  }
}
