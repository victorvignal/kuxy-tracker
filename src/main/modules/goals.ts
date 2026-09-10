// KUXY main process — goals module
// goals + goalMilestones CRUD.

import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerGoals(persistDb: () => void): void {
  registerCrud({
    prefix: 'goals',
    table: schema.goals,
    hasUpdatedAt: true,
    persistDb,
  })

  // goalMilestones CRUD separado (não é pivô, tem CRUD próprio)
  // skipList: usamos list custom (filtra por goalId)
  registerCrud({
    prefix: 'milestones',
    table: schema.goalMilestones,
    hasUpdatedAt: false,
    persistDb,
    skipList: true,
  })

  // milestones:list filtra por goalId
  ipcMain.handle('milestones:list', (_e: unknown, params: { goalId?: number } = {}) => {
    const db = getDbInstance() as any
    if (params.goalId === undefined) return db.select().from(schema.goalMilestones).all()
    return db.select().from(schema.goalMilestones).where(eq(schema.goalMilestones.goalId, params.goalId)).all()
  })
}
