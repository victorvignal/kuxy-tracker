// KUXY main process — routines module
// routines CRUD + addHabit/removeHabit para tabela pivô routineHabits.

import { ipcMain } from 'electron'
import { and, eq } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerRoutines(persistDb: () => void): void {
  registerCrud({
    prefix: 'routines',
    table: schema.routines,
    hasUpdatedAt: false,
    persistDb,
  })

  // addHabit — insere em routineHabits
  ipcMain.handle('routines:addHabit', async (_e: unknown, routineId: number, habitId: number, order = 0) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.routineHabits).values({ routineId, habitId, order }).returning().get()
    persistDb()
    return result
  })

  // removeHabit — deleta em routineHabits
  ipcMain.handle('routines:removeHabit', async (_e: unknown, routineId: number, habitId: number) => {
    const db = getDbInstance() as any
    db.delete(schema.routineHabits)
      .where(and(eq(schema.routineHabits.routineId, routineId), eq(schema.routineHabits.habitId, habitId)))
      .run()
    persistDb()
    return { ok: true }
  })
}
