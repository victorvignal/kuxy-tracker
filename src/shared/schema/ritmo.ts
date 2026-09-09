import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

/**
 * Itens da fila priorizada do Ritmo (Profissional).
 * Cada item representa um job de edição vinculado a um cliente,
 * com prioridade e prazo. Steps (Corte/Sound/Color/Export) ficam
 * denormalizados em `stepsJson` (array de boolean) pra evitar
 * tabela à parte no MVP.
 */
export const queueItems = sqliteTable('queue_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  client: text('client').notNull(),
  video: text('video').notNull(),
  priority: text('priority').notNull().default('med'), // 'high' | 'med' | 'low'
  dueDate: text('due_date'), // YYYY-MM-DD
  position: integer('position').notNull().default(0),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  stepsJson: text('steps_json').notNull().default('[true,true,true,false]'), // [corte,sound,color,export]
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Sessões de pomodoro concluídas (ou interrompidas).
 * Cada vez que o timer do Ritmo termina ou é parado, registra aqui
 * pra calcular heatmap, streak e meta diária.
 */
export const pomodoroSessions = sqliteTable('pomodoro_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  queueItemId: integer('queue_item_id').references(() => queueItems.id, { onDelete: 'set null' }),
  durationSec: integer('duration_sec').notNull(), // duração efetiva (pode ser < 1500 se parou)
  plannedSec: integer('planned_sec').notNull().default(1500), // duração planejada (default 25min)
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }).notNull()
})

export type QueueItem = typeof queueItems.$inferSelect
export type NewQueueItem = typeof queueItems.$inferInsert
export type PomodoroSession = typeof pomodoroSessions.$inferSelect
export type NewPomodoroSession = typeof pomodoroSessions.$inferInsert
