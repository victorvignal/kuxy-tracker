import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

/**
 * Schema do KUXY.
 *
 * Convenção de nomes:
 *   - Tabelas em snake_case no banco, camelCase no TS (Drizzle cuida)
 *   - IDs auto-increment integer
 *   - Timestamps como integer (ms epoch) com $defaultFn
 *   - Foreign keys com cascade delete
 *   - archived boolean pra soft delete (não apagar hábito que tem histórico)
 */

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

export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  date: text('date').notNull().unique(),
  mood: integer('mood'),
  energy: integer('energy'),
  content: text('content'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export const focusSessions = sqliteTable('focus_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  habitId: integer('habit_id').references(() => habits.id, { onDelete: 'set null' }),
  duration: integer('duration').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status').notNull().default('completed')
})

// ============================================================
// PROJECTS (módulo novo, v0.4.0)
// ============================================================

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

// ============================================================
// FINANCE (módulo novo, v0.3.0)
// ============================================================

/**
 * Contas financeiras. Cada transação e assinatura pertence a uma conta.
 * Tipos suportados: 'checking' (corrente), 'savings' (poupança),
 * 'credit' (cartão de crédito), 'investment' (investimento),
 * 'cash' (dinheiro).
 *
 * `archived` permite esconder contas antigas sem perder histórico.
 */
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull().default('checking'),
  balance: integer('balance').notNull().default(0), // em centavos pra evitar float drift
  currency: text('currency').notNull().default('BRL'),
  color: text('color').notNull().default('#8b5cf6'),
  icon: text('icon').notNull().default('wallet'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Categorias com tipo (receita ou despesa) e cor. Seeds default são criados
 * no db.ts caso a tabela esteja vazia pro perfil Pessoal.
 */
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'income' ou 'expense'
  color: text('color').notNull().default('#8b5cf6'),
  icon: text('icon').notNull().default('circle'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Transações financeiras. Amount em centavos (sempre positivo; o `type`
 * define se é receita ou despesa).
 *
 * `date` é texto YYYY-MM-DD pra alinhar com journal_entries e facilitar
 * agregação por dia sem ter que lidar com timezone.
 */
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  type: text('type').notNull(), // 'income' ou 'expense'
  amount: integer('amount').notNull(), // centavos
  description: text('description').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

/**
 * Assinaturas/recorrências. Diferente de transaction: aqui é uma assinatura
 * que se repete N vezes (Netflix mensal, Gym mensal, etc).
 *
 * `nextBilling` é a próxima data de cobrança. `active` controla se
 * continua gerando提醒 ou não.
 */
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id')
    .notNull()
    .default(1)
    .references(() => profiles.id, { onDelete: 'cascade' }),
  accountId: integer('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  amount: integer('amount').notNull(), // centavos
  currency: text('currency').notNull().default('BRL'),
  interval: text('interval').notNull().default('monthly'), // 'monthly' | 'yearly' | 'weekly'
  nextBilling: text('next_billing').notNull(), // YYYY-MM-DD
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type Completion = typeof completions.$inferSelect
export type NewCompletion = typeof completions.$inferInsert
export type Routine = typeof routines.$inferSelect
export type NewRoutine = typeof routines.$inferInsert
export type JournalEntry = typeof journalEntries.$inferSelect
export type NewJournalEntry = typeof journalEntries.$inferInsert
export type FocusSession = typeof focusSessions.$inferSelect
export type NewFocusSession = typeof focusSessions.$inferInsert
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

// Projects
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

/**
 * Itens disponíveis na sidebar. O path é a chave, e cada perfil diz
 * quais itens aparecem nele (via profiles.sidebarItems).
 *
 * NÃO confundir com rotas do React Router — é o mesmo path por
 * coincidência, mas se a sidebar mostrar algo que não é rota
 * (ex: link externo), vira só string livre.
 */
export const SIDEBAR_ITEMS = [
  '/',
  '/habits',
  '/routines',
  '/calendar',
  '/stats',
  '/journal',
  '/focus',
  '/goals',
  '/finance',
  '/projects'
] as const

export type SidebarItem = (typeof SIDEBAR_ITEMS)[number]

/** Defaults sensatos por tipo de perfil. Editáveis depois pelo usuário. */
export const DEFAULT_SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  personal: ['/', '/projects'],
  professional: ['/', '/projects']
}

/**
 * Categorias seed do módulo Finance. Criadas automaticamente no db.ts
 * caso a tabela esteja vazia pro perfil ativo. Sem isso o usuário
 * começaria com zero categorias e teria que criar tudo na mão.
 */
export const DEFAULT_CATEGORIES: Array<Pick<NewCategory, 'name' | 'type' | 'color' | 'icon'>> = [
  // Receitas
  { name: 'Salário', type: 'income', color: '#4ade80', icon: 'briefcase' },
  { name: 'Freelance', type: 'income', color: '#22d3ee', icon: 'laptop' },
  { name: 'Investimentos', type: 'income', color: '#a78bfa', icon: 'trending-up' },
  // Despesas
  { name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home' },
  { name: 'Alimentação', type: 'expense', color: '#f87171', icon: 'utensils' },
  { name: 'Transporte', type: 'expense', color: '#facc15', icon: 'car' },
  { name: 'Saúde', type: 'expense', color: '#22d3ee', icon: 'heart-pulse' },
  { name: 'Lazer', type: 'expense', color: '#c084fc', icon: 'gamepad-2' },
  { name: 'Educação', type: 'expense', color: '#6d4ee0', icon: 'book-open' },
  { name: 'Assinaturas', type: 'expense', color: '#a78bfa', icon: 'repeat' }
]