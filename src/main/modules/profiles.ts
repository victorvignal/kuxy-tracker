// KUXY main process — profiles module
// CRUD básico + updateSidebarItems custom handler + get individual.

import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerProfiles(persistDb: () => void): void {
  // CRUD básico (list, create, update, archive)
  registerCrud({
    prefix: 'profiles',
    table: schema.profiles,
    persistDb,
    // profiles não tem profileId (é a tabela raiz) nem updatedAt
  })

  // GET individual (não estava no registerCrud genérico)
  ipcMain.handle('profiles:get', (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    return db.select().from(schema.profiles).where(eq(schema.profiles.id, id)).get()
  })

  // updateSidebarItems custom — serializa array pra JSON string
  ipcMain.handle('profiles:updateSidebarItems', async (_e: unknown, id: number, sidebarItems: string[]) => {
    const db = getDbInstance() as any
    const result = db
      .update(schema.profiles)
      .set({ sidebarItems: JSON.stringify(sidebarItems) })
      .where(eq(schema.profiles.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })
}
