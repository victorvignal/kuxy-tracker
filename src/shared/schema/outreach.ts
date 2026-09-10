import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

/**
 * Outreach (prospecção — v0.12.x feature).
 *
 * Cada outreach é uma mensagem/mensagem planejada pra um lead ou contact.
 * Pode ser e-mail, WhatsApp, DM de rede social, ligação.
 *
 * Status:
 *   - draft      → rascunho, ainda não enviado
 *   - queued     → na fila pra enviar (futuro: integração com scheduler)
 *   - sent       → enviado, sem resposta ainda
 *   - replied    → lead respondeu
 *   - no_reply   → enviado há X dias sem resposta (auto-marcado)
 *   - bounced    → falhou (e-mail bounced, mensagem não entregue)
 *
 * `leadId` é opcional: outreach pode ser feita pra contact (CRM pessoal)
 * ou sem destino específico (template genérico).
 */
export const outreach = sqliteTable('outreach', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  /** Destinatário: ou um lead (prospecção) OU um contact (cliente existente) */
  leadId: integer('lead_id'), // referência futura pra tabela leads (FK criada depois se necessário)
  contactId: integer('contact_id'), // referência futura pra tabela contacts
  /** Canal de comunicação */
  type: text('type').notNull().default('email'), // 'email' | 'whatsapp' | 'dm' | 'call' | 'other'
  /** Nome do destinatário (snapshot — pode ser diferente do contact/lead atual) */
  recipientName: text('recipient_name').notNull(),
  /** Email ou handle (WhatsApp, Instagram, etc) — depende do type */
  recipientHandle: text('recipient_handle'),
  /** Assunto (e-mail) ou primeira linha (mensagem) */
  subject: text('subject'),
  /** Conteúdo completo (markdown suportado) */
  content: text('content').notNull(),
  /** Status do outreach */
  status: text('status').notNull().default('draft'),
  /** Quando foi enviado (null = ainda draft/queued) */
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  /** Quando o destinatário respondeu (null = sem resposta) */
  repliedAt: integer('replied_at', { mode: 'timestamp' }),
  /** Notas internas (não vai pro destinatário) */
  notes: text('notes'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Outreach = typeof outreach.$inferSelect
export type NewOutreach = typeof outreach.$inferInsert
