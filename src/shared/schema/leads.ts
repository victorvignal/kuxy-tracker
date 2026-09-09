import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

/**
 * Leads (CRM prospecção — v0.10.0).
 *
 * Diferente de `contacts` (que é CRM de pessoas conhecidas), `leads`
 * guarda canais/creator prospects que vc acha via YouTube Data API
 * (ou qualquer outra fonte futura: Instagram, TikTok). Cada lead tem
 * o ID da fonte externa pra re-sync depois, score de compatibilidade
 * calculado localmente, e campos manuais (email/notes) que vc preenche
 * depois de contatar.
 */
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  /** channelId/username da fonte externa. YouTube: começa com "UC..." */
  externalId: text('external_id').notNull(),
  source: text('source').notNull().default('youtube'),
  name: text('name').notNull(),
  handle: text('handle'),
  avatarUrl: text('avatar_url'),
  /** região ISO (BR, US, etc) */
  region: text('region'),
  /** categoria detectada via keywords (lifestyle, tech, fitness, ...) */
  category: text('category'),
  /** contagem de inscritos/subscribers/followers (depende da fonte) */
  followers: integer('followers').notNull().default(0),
  /** score 0-100 calculado localmente baseado em keywords vs nicho do user */
  score: integer('score').notNull().default(0),
  /** email/contact preenchidos manualmente depois de outreach */
  email: text('email'),
  notes: text('notes'),
  status: text('status').notNull().default('new'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
