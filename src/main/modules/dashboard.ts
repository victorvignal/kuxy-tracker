// KUXY main process — dashboard module
// Visão geral agregada pra página Dashboard.

import { ipcMain } from 'electron'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { getDbInstance } from '../db'
import * as schema from '../../shared/schema'

export function registerDashboard(): void {
  ipcMain.handle('dashboard:overview', (_e: unknown, params: { from: string; to: string; profileId?: number }) => {
    const db = getDbInstance() as any
    const conditions: any[] = []
    if (params.profileId) {
      const habitIds = db
        .select({ id: schema.habits.id })
        .from(schema.habits)
        .where(eq(schema.habits.profileId, params.profileId))
        .all()
        .map((r: any) => r.id)
      if (habitIds.length === 0) {
        return { habits: [], completions: [], focusSeconds: 0 }
      }
      const inConds = habitIds.map((id: number) => eq(schema.completions.habitId, id))
      conditions.push(sql`(${sql.join(inConds, sql`, `)})`)
    }
    conditions.push(gte(schema.completions.date, params.from))
    conditions.push(lte(schema.completions.date, params.to))
    const completionsInRange = db.select().from(schema.completions).where(and(...conditions)).all()

    const habits = params.profileId
      ? db.select().from(schema.habits).where(and(eq(schema.habits.archived, false), eq(schema.habits.profileId, params.profileId))).all()
      : db.select().from(schema.habits).where(eq(schema.habits.archived, false)).all()

    const focusConds: any[] = [eq(schema.focusSessions.status, 'completed')]
    if (params.profileId) focusConds.push(eq(schema.focusSessions.profileId, params.profileId))
    focusConds.push(gte(schema.focusSessions.startedAt, new Date(params.from)))
    focusConds.push(lte(schema.focusSessions.startedAt, new Date(params.to)))
    const totals = db
      .select({ total: sql<number>`COALESCE(SUM(${schema.focusSessions.duration}), 0)` })
      .from(schema.focusSessions)
      .where(and(...focusConds))
      .get()

    return {
      habits,
      completions: completionsInRange,
      focusSeconds: totals?.total ?? 0
    }
  })
}
