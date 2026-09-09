import { sqliteTable, text, integer } from './_shared'

/**
 * Perfis são o agrupamento principal do app. Cada perfil tem seus próprios
 * hábitos, rotinas, diário, sessões de foco, etc.
 *
 * `slug` é a chave de identificação semântica (personal, professional, custom).
 * `sidebarItems` é JSON array de paths permitidos na sidebar pra esse perfil.
 *   Ex: ["/", "/habits", "/journal"] esconde Rotinas/Calendário/Stats/Foco/Metas
 *
 * Profiles foram renomeados de workspaces em v0.2.0. Mantemos compat com DBs
 * antigos via migration no db.ts (renomeia tabela e coluna workspace_id).
 */
export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull().default('personal'),
  color: text('color').notNull().default('#a855f7'),
  icon: text('icon').notNull().default('user'),
  description: text('description'),
  sidebarItems: text('sidebar_items').notNull().default('["/","/habits","/routines","/calendar","/stats","/journal","/focus","/goals"]'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
