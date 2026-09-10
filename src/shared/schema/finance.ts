import { sqliteTable, text, integer } from './_shared'
import { profiles } from './profiles'

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

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
