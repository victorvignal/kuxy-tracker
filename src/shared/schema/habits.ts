import { sqliteTable, text, integer, primaryKey } from './_shared'
import { profiles } from './profiles'
import { routines } from './routines'

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon').default('circle'),
  color: text('color').default('#a855f7'),
  category: text('category'),
  recurrence: text('recurrence').notNull().default('{"type":"daily"}'),
  target: integer('target').default(1),
  unit: text('unit'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export const completions = sqliteTable(
  'completions',
  {
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    count: integer('count').notNull().default(1),
    value: integer('value').default(0),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
  },
  (t) => ({
    pk: primaryKey({ columns: [t.habitId, t.date] })
  })
)

/**
 * Tabela pivô routine_habits (N:N).
 * Mantida aqui porque o ciclo depende de routines (import circular evitado
 * via ordem: habits -> routines -> habits, OK porque routines não usa habits
 * direto, só routineHabits usa ambos).
 */
export const routineHabits = sqliteTable(
  'routine_habits',
  {
    routineId: integer('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0)
  },
  (t) => ({
    pk: primaryKey({ columns: [t.routineId, t.habitId] })
  })
)

export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type Completion = typeof completions.$inferSelect
export type NewCompletion = typeof completions.$inferInsert
