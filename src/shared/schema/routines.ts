import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

export const routines = sqliteTable('routines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  timeOfDay: text('time_of_day').notNull().default('morning'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Routine = typeof routines.$inferSelect
export type NewRoutine = typeof routines.$inferInsert
