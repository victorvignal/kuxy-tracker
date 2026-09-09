// KUXY main process — outreach module
// Mensagens de prospecção no perfil Profissional.

import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerOutreach(persistDb: () => void): void {
  // CRUD padrão
  registerCrud({
    prefix: 'outreach',
    table: schema.outreach,
    hasUpdatedAt: true,
    persistDb,
  })

  // GET individual
  ipcMain.handle('outreach:get', (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    return db.select().from(schema.outreach).where(eq(schema.outreach.id, id)).get()
  })

  // MARK SENT — atualiza status pra 'sent' + sentAt
  ipcMain.handle('outreach:markSent', async (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    const result = db
      .update(schema.outreach)
      .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.outreach.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  // MARK REPLIED — atualiza status pra 'replied' + repliedAt
  ipcMain.handle('outreach:markReplied', async (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    const result = db
      .update(schema.outreach)
      .set({ status: 'replied', repliedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.outreach.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })
}
