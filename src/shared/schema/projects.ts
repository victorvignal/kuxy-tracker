import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

/**
 * Projetos são o agrupamento principal do módulo Projects (board Kanban
 * estilo Notion/ClickUp, disponível no perfil Profissional).
 *
 * `emoji` é o ícone visual que aparece no card e no header do side panel
 * (ex: "🎬", "🚀"). `name` é o nome principal.
 *
 * `status` mapeia direto pra coluna do Kanban:
 *   - 'todo'        → To Do
 *   - 'in_progress' → In Progress
 *   - 'in_review'   → In Review
 *   - 'completed'   → Completed
 *
 * `priority` é 1 (alta), 2 (média), 3 (baixa).
 *
 * `sortOrder` controla a posição do card dentro da coluna. Atualizado
 * quando o user arrasta o card pra cima/baixo.
 *
 * `client` é um label livre (Stellar, Taskez, Tekashi STB, etc).
 *
 * `youtubeUrl`, `googleDriveUrl`, `tiktokUrl` são links externos comuns
 * no workflow do Victor. Todos nullable.
 *
 * `progress` é 0-100 (%). Atualizado pelos sub-items automaticamente
 * quando esses mudam de status (cliente pode sobrescrever manual).
 */
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  emoji: text('emoji').default('📁'),
  name: text('name').notNull(),
  client: text('client'),
  description: text('description'),
  status: text('status').notNull().default('todo'),
  priority: integer('priority').notNull().default(2),
  progress: integer('progress').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  dueDate: text('due_date'),
  person: text('person'),
  youtubeUrl: text('youtube_url'),
  googleDriveUrl: text('google_drive_url'),
  tiktokUrl: text('tiktok_url'),
  notes: text('notes'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Membros atribuídos a um projeto. Não tem FK pra uma tabela `people` —
 * é denormalizado (nome + initials + cor), igual no Notion. Mais simples
 * pra MVP e não precisa de CRUD separado de "pessoas".
 */
export const projectMembers = sqliteTable('project_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  initials: text('initials'),
  color: text('color').notNull().default('#8b5cf6')
})

/**
 * Tags pill dos cards (Web, Saas, Mobile, etc). Cada projeto pode ter N
 * tags. Cor por tag.
 */
export const projectTags = sqliteTable('project_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color').notNull().default('#8b5cf6')
})

/**
 * Comentários nos projetos (estilo Notion). Sem threads por enquanto —
 * flat list, autor + texto + data. Autor é string livre (não FK pra
 * users) porque o KUXY é single-user local.
 */
export const projectComments = sqliteTable('project_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  author: text('author').notNull().default('You'),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Sub-itens de um projeto (videos, tasks, deliverables). Cada um tem
 * seu próprio status independente e datas de due/post. Visíveis dentro
 * do side panel do projeto, estilo a tabela "TekashiSTB - [M3] #19" do
 * Notion.
 *
 * Status possíveis: 'idea' (Needs Idea), 'working' (Working On),
 * 'editor' (Needs Editor), 'done'.
 */
export const projectSubitems = sqliteTable('project_subitems', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  status: text('status').notNull().default('idea'),
  dueDate: text('due_date'),
  postDate: text('post_date'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectMember = typeof projectMembers.$inferSelect
export type NewProjectMember = typeof projectMembers.$inferInsert
export type ProjectTag = typeof projectTags.$inferSelect
export type NewProjectTag = typeof projectTags.$inferInsert
export type ProjectComment = typeof projectComments.$inferSelect
export type NewProjectComment = typeof projectComments.$inferInsert
export type ProjectSubitem = typeof projectSubitems.$inferSelect
export type NewProjectSubitem = typeof projectSubitems.$inferInsert
