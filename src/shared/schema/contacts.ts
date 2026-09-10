import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

/**
 * Contacts (CRM pessoal/profissional — v0.9.0).
 *
 * Substitui o SEED hardcoded que estava em Contacts.tsx. Cada contato
 * pertence a um profile, com nome, email, phone opcional, cor pra avatar,
 * status (active/pending/inactive), source (family/friend/work/other),
 * notes livres, e archived pra soft delete (preserva histórico).
 */
export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  color: text('color').notNull().default('#a78bfa'),
  status: text('status').notNull().default('active'),
  source: text('source').notNull().default('other'),
  notes: text('notes'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
