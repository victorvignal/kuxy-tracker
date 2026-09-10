import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

/**
 * Goals (Metas — v0.11.0).
 *
 * Cada goal é uma meta rastreável (faturamento, clientes, vídeos, etc).
 * `current` é atualizado manualmente via dialog (sem auto-tracking no MVP —
 * ver `GoalDialog`). `type` categoriza a meta pra ícones/cores.
 * `period` define o range (month/quarter/year) e junto com `deadline`
 * calcula "faltam X dias/meses" no UI.
 */
export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull().default('custom'),
  target: integer('target').notNull().default(0),
  current: integer('current').notNull().default(0),
  period: text('period').notNull().default('month'),
  deadline: text('deadline'),
  status: text('status').notNull().default('on_track'),
  icon: text('icon').default('target'),
  color: text('color').notNull().default('#a78bfa'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Milestones são sub-metas dentro de um goal maior.
 * Ex: goal "Atingir R$120k no ano" pode ter milestones
 * "Atingir R$10k em um único mês" (Apr 2026), "100 vídeos no ano" (Mai 2026).
 */
export const goalMilestones = sqliteTable('goal_milestones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  goalId: integer('goal_id')
    .notNull()
    .references(() => goals.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  target: integer('target').notNull().default(0),
  current: integer('current').notNull().default(0),
  deadline: text('deadline'),
  achievedAt: text('achieved_at'),
  status: text('status').notNull().default('on_track'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
export type GoalMilestone = typeof goalMilestones.$inferSelect
export type NewGoalMilestone = typeof goalMilestones.$inferInsert
