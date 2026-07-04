import initSqlJs, { Database as SqlDatabase, SqlJsStatic } from 'sql.js'
import { drizzle, type SQLJsDatabase } from 'drizzle-orm/sql-js'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'fs'
import * as schema from '../shared/schema'

type DrizzleDb = SQLJsDatabase<typeof schema>

let dbInstance: DrizzleDb | null = null
let rawDb: SqlDatabase | null = null
let dbPath = ''

async function loadSqlJs(): Promise<SqlJsStatic> {
  const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')
  const wasmBinary = readFileSync(wasmPath)
  return initSqlJs({ wasmBinary: wasmBinary as any } as any)
}

function persist() {
  if (!rawDb || !dbPath) return
  const data = rawDb.export()
  writeFileSync(dbPath, Buffer.from(data))
}

function safeExec(sql: string) {
  if (!rawDb) return
  try {
    rawDb.exec(sql)
  } catch {
    // ignore if column/table already exists or migration noop
  }
}

/**
 * Renomeia o arquivo do DB antigo pro novo nome. Só roda na primeira
 * vez que o app abre depois do rename kibo-habit → KUXY. Depois disso,
 * kibo-habit.db não vai mais existir e o renameSync falha silenciosamente.
 *
 * Não tem custo de manter migration de versão pq o DB é local e v0.2.0
 * ainda não foi publicada (não tem users em produção pra quebrar).
 */
function migrateDbFilename(userDataPath: string): string {
  const newPath = join(userDataPath, 'kuxy.db')
  const oldPath = join(userDataPath, 'kibo-habit.db')
  if (!existsSync(newPath) && existsSync(oldPath)) {
    try {
      renameSync(oldPath, newPath)
    } catch {
      // ignore — vai criar fresh
    }
  }
  return newPath
}

export async function getDb(): Promise<DrizzleDb> {
  if (dbInstance) return dbInstance

  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }

  dbPath = migrateDbFilename(userDataPath)

  const SQL = await loadSqlJs()
  let initialData: Uint8Array | undefined
  if (existsSync(dbPath)) {
    initialData = new Uint8Array(readFileSync(dbPath))
  }
  rawDb = new SQL.Database(initialData)

  // Profiles (sempre presente) — substitui o antigo `workspaces`
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'personal',
      color TEXT NOT NULL DEFAULT '#a855f7',
      icon TEXT NOT NULL DEFAULT 'user',
      description TEXT,
      sidebar_items TEXT NOT NULL DEFAULT '["/","/habits","/routines","/calendar","/stats","/journal","/focus","/goals"]',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `)

  // Migration: rename `workspaces` → `profiles` se existir de uma versão antiga.
  // Como `workspaces` e `profiles` têm o mesmo shape (com adição de sidebar_items),
  // basta renomear a tabela e adicionar a coluna nova.
  safeExec(`ALTER TABLE workspaces RENAME TO profiles`)
  safeExec(`ALTER TABLE profiles ADD COLUMN sidebar_items TEXT NOT NULL DEFAULT '["/","/habits","/routines","/calendar","/stats","/journal","/focus","/goals"]'`)
  safeExec(`ALTER TABLE profiles ADD COLUMN description TEXT`)

  // Seeds default — Pessoal (full sidebar) + Profissional (subset focado em produtividade)
  const profileCount = rawDb.exec(`SELECT COUNT(*) as c FROM profiles`)[0]
  const count = profileCount?.values?.[0]?.[0] as number
  if (!count) {
    const now = Date.now()
    rawDb.exec(`
      INSERT INTO profiles (name, slug, type, color, icon, sidebar_items, archived, created_at)
      VALUES
        ('Pessoal', 'personal', 'personal', '#8b5cf6', 'user',
         '["/","/habits","/routines","/calendar","/journal","/focus","/goals","/finance"]', 0, ${now}),
        ('Profissional', 'professional', 'professional', '#3b82f6', 'briefcase',
         '["/","/habits","/stats","/journal","/focus","/goals","/finance"]', 0, ${now});
    `)
  }

  // Outras tabelas — agora referenciam profiles em vez de workspaces
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'circle',
      color TEXT DEFAULT '#a855f7',
      category TEXT,
      recurrence TEXT NOT NULL DEFAULT '{"type":"daily"}',
      target INTEGER DEFAULT 1,
      unit TEXT,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS completions (
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      value INTEGER DEFAULT 0,
      note TEXT,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      time_of_day TEXT NOT NULL DEFAULT 'morning',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routine_habits (
      routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      "order" INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (routine_id, habit_id)
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      date TEXT NOT NULL UNIQUE,
      mood INTEGER,
      energy INTEGER,
      content TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      habit_id INTEGER REFERENCES habits(id) ON DELETE SET NULL,
      duration INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      status TEXT NOT NULL DEFAULT 'completed'
    );

    CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
    CREATE INDEX IF NOT EXISTS idx_focus_started ON focus_sessions(started_at);

    -- Finance module (v0.3.0)
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'checking',
      balance INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'BRL',
      color TEXT NOT NULL DEFAULT '#8b5cf6',
      icon TEXT NOT NULL DEFAULT 'wallet',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#8b5cf6',
      icon TEXT NOT NULL DEFAULT 'circle',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
      account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      interval TEXT NOT NULL DEFAULT 'monthly',
      next_billing TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    -- Projects module (v0.4.0) — board Kanban estilo Notion no perfil Profissional
    CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
          emoji TEXT DEFAULT '📁',
          name TEXT NOT NULL,
          client TEXT,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'todo',
          priority INTEGER NOT NULL DEFAULT 2,
          progress INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          due_date TEXT,
          person TEXT,
          youtube_url TEXT,
          google_drive_url TEXT,
          tiktok_url TEXT,
          notes TEXT,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        -- Contacts (CRM pessoal/profissional — v0.9.0)
                -- Substitui o SEED hardcoded que estava em Contacts.tsx. Cada contato
                -- pertence a um profile, tem nome, email, phone opcional, cor pra avatar,
                -- status (active/pending/inactive), source (family/friend/work/other),
                -- notes livres, e archived pra soft delete (mantém histórico).
                CREATE TABLE IF NOT EXISTS contacts (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
                  name TEXT NOT NULL,
                  email TEXT,
                  phone TEXT,
                  color TEXT NOT NULL DEFAULT '#a78bfa',
                  status TEXT NOT NULL DEFAULT 'active',
                  source TEXT NOT NULL DEFAULT 'other',
                  notes TEXT,
                  archived INTEGER NOT NULL DEFAULT 0,
                  created_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                );

    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      initials TEXT,
      color TEXT NOT NULL DEFAULT '#8b5cf6'
    );

    CREATE TABLE IF NOT EXISTS project_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#8b5cf6'
    );

    CREATE TABLE IF NOT EXISTS project_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      author TEXT NOT NULL DEFAULT 'You',
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_subitems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      thumbnail_url TEXT,
      status TEXT NOT NULL DEFAULT 'idea',
      due_date TEXT,
      post_date TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_profile ON transactions(profile_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_profile ON accounts(profile_id);
        CREATE INDEX IF NOT EXISTS idx_categories_profile ON categories(profile_id);
        CREATE INDEX IF NOT EXISTS idx_contacts_profile ON contacts(profile_id);

    -- Leads (prospecção via YouTube — v0.10.0)
    -- Cada lead é um canal/creator prospectado. externalId é o ID da
    -- plataforma (YouTube: UC...). Email/notes ficam null até vc
    -- contatar e preencher manualmente (YouTube API não expõe email).
    CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
          external_id TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'youtube',
          name TEXT NOT NULL,
          handle TEXT,
          avatar_url TEXT,
          region TEXT,
          category TEXT,
          followers INTEGER NOT NULL DEFAULT 0,
          score INTEGER NOT NULL DEFAULT 0,
          email TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          archived INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_leads_profile ON leads(profile_id);
        CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);

        -- Goals (Metas v0.11.0)
                -- Cada goal é uma meta rastreável (faturamento, clientes, vídeos, etc).
                -- current é manual; status é on_track/at_risk/overdue/done.
                -- Cálculo de % é feito no UI (current/target).
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'custom',
          target INTEGER NOT NULL DEFAULT 0,
          current INTEGER NOT NULL DEFAULT 0,
          period TEXT NOT NULL DEFAULT 'month',
          deadline TEXT,
          status TEXT NOT NULL DEFAULT 'on_track',
          icon TEXT DEFAULT 'target',
          color TEXT NOT NULL DEFAULT '#a78bfa',
          archived INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_goals_profile ON goals(profile_id);

        -- Milestones são sub-metas dentro de um goal (ex: "Atingir R$10k
        -- em um único mês" dentro de "Faturamento do ano").
        CREATE TABLE IF NOT EXISTS goal_milestones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
          label TEXT NOT NULL,
          target INTEGER NOT NULL DEFAULT 0,
          current INTEGER NOT NULL DEFAULT 0,
          deadline TEXT,
          achieved_at TEXT,
          status TEXT NOT NULL DEFAULT 'on_track',
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_milestones_goal ON goal_milestones(goal_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON subscriptions(profile_id);
    CREATE INDEX IF NOT EXISTS idx_projects_profile_status ON projects(profile_id, status, sort_order);
    CREATE INDEX IF NOT EXISTS idx_subitems_project ON project_subitems(project_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_members_project ON project_members(project_id);
    CREATE INDEX IF NOT EXISTS idx_tags_project ON project_tags(project_id);
    CREATE INDEX IF NOT EXISTS idx_comments_project ON project_comments(project_id);
  `)

  // Seed default categories + a checking account per profile, caso a tabela
  // esteja vazia. Sem isso o Finance começa vazio e o usuário teria que
  // criar tudo na mão (ruim pra first-run UX).
  const profilesList = rawDb.exec(`SELECT id, slug FROM profiles`)[0]
  const profileRows = (profilesList?.values ?? []) as Array<[number, string]>
  for (const [pid, slug] of profileRows) {
    const catCount = rawDb.exec(`SELECT COUNT(*) as c FROM categories WHERE profile_id = ${pid}`)[0]
    const c = (catCount?.values?.[0]?.[0] as number) ?? 0
    if (!c) {
      const now = Date.now()
      const seeds = [
        ['Salário', 'income', '#4ade80', 'briefcase'],
        ['Freelance', 'income', '#22d3ee', 'laptop'],
        ['Investimentos', 'income', '#a78bfa', 'trending-up'],
        ['Moradia', 'expense', '#8b5cf6', 'home'],
        ['Alimentação', 'expense', '#f87171', 'utensils'],
        ['Transporte', 'expense', '#facc15', 'car'],
        ['Saúde', 'expense', '#22d3ee', 'heart-pulse'],
        ['Lazer', 'expense', '#c084fc', 'gamepad-2'],
        ['Educação', 'expense', '#6d4ee0', 'book-open'],
        ['Assinaturas', 'expense', '#a78bfa', 'repeat']
      ]
      for (const [name, type, color, icon] of seeds) {
        rawDb.run(
          `INSERT INTO categories (profile_id, name, type, color, icon, archived, created_at)
           VALUES (?, ?, ?, ?, ?, 0, ?)`,
          [pid, name, type, color, icon, now]
        )
      }
    }
    const accCount = rawDb.exec(`SELECT COUNT(*) as c FROM accounts WHERE profile_id = ${pid}`)[0]
        const a = (accCount?.values?.[0]?.[0] as number) ?? 0
        if (!a) {
          const now = Date.now()
          const isPersonal = slug === 'personal'
          rawDb.run(
            `INSERT INTO accounts (profile_id, name, type, balance, currency, color, icon, archived, created_at, updated_at)
             VALUES (?, ?, ?, 0, 'BRL', ?, ?, 0, ?, ?)`,
            [pid, isPersonal ? 'Conta corrente' : 'Conta PJ', 'checking', isPersonal ? '#8b5cf6' : '#3b82f6', 'wallet', now, now]
          )
        }

        // Seed 4 goals padrão por profile (Faturamento/Clientes/Vídeos/Taxa).
        // Mesma lógica das accounts: só insere se a tabela de goals
        // estiver vazia. Goals já existentes (de DBs mais novos) não são
        // duplicados. v0.11.0 — esses são os valores que aparecem no design.
        const goalCount = rawDb.exec(`SELECT COUNT(*) as c FROM goals WHERE profile_id = ${pid}`)[0]
        const g = (goalCount?.values?.[0]?.[0] as number) ?? 0
        if (!g) {
          const now = Date.now()
          // Calcula deadline fim do mês pra metas mensais e fim do ano pra anuais
          const nowDate = new Date()
          const endOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).toISOString().slice(0, 10)
          const endOfYear = new Date(nowDate.getFullYear(), 11, 31).toISOString().slice(0, 10)
          // Defaults do design Figma: R$ 20k mês / 5 clientes mês / 40 vídeos mês / 40% taxa mês
          // + objetivo do ano R$ 112.400
          const goalSeeds: Array<[string, string, number, number, string, string, string, string]> = [
            // [name, type, target, current, period, deadline, status, icon]
            ['Faturamento do mês', 'revenue', 20000, 14200, 'month', endOfMonth, 'on_track', 'dollar-sign'],
            ['Novos clientes', 'clients', 5, 3, 'month', endOfMonth, 'at_risk', 'user-plus'],
            ['Vídeos entregues', 'videos', 40, 28, 'month', endOfMonth, 'on_track', 'video'],
            ['Taxa de fechamento', 'rate', 40, 32, 'month', endOfMonth, 'at_risk', 'percent'],
            ['Objetivo do ano', 'revenue', 112400, 70000, 'year', endOfYear, 'on_track', 'trending-up']
          ]
          for (const [name, type, target, current, period, deadline, status, icon] of goalSeeds) {
            rawDb.run(
              `INSERT INTO goals (profile_id, name, type, target, current, period, deadline, status, icon, color, archived, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
              [pid, name, type, target, current, period, deadline, status, icon, '#a78bfa', now, now]
            )
          }

          // Milestones de exemplo pra cada goal principal
          const goals = rawDb.exec(`SELECT id, name FROM goals WHERE profile_id = ${pid} AND period = 'month'`)[0]
          const goalList = (goals?.values ?? []) as Array<[number, string]>
          const milestoneSeeds: Array<[number, string, number, number, string, string]> = [
            // [goalId, label, target, current, deadline, status]
            ...goalList.flatMap(([gid, gname]): Array<[number, string, number, number, string, string]> => {
              if (gname.includes('Faturamento')) {
                return [
                  [gid, 'Atingir R$ 20k de faturamento', 20000, 14200, endOfMonth, 'on_track'],
                  [gid, 'Fechar 2 clientes de Lifesteal SMP', 2, 1, endOfMonth, 'at_risk'],
                  [gid, 'Enviar 50 DMs de prospecção', 50, 38, endOfMonth, 'on_track'],
                  [gid, 'Reduzir edição média p/ 2h', 2, 3.5, endOfMonth, 'at_risk']
                ]
              }
              if (gname.includes('clientes')) {
                return [[gid, 'Onboarding de 5 novos clientes', 5, 3, endOfMonth, 'at_risk']]
              }
              if (gname.includes('Vídeos')) {
                return [[gid, 'Entregar 40 vídeos no mês', 40, 28, endOfMonth, 'on_track']]
              }
              if (gname.includes('Taxa')) {
                return [[gid, 'Subir taxa de fechamento para 40%', 40, 32, endOfMonth, 'at_risk']]
              }
              return []
            })
          ]
          for (const [gid, label, target, current, deadline, status] of milestoneSeeds) {
            rawDb.run(
              `INSERT INTO goal_milestones (goal_id, label, target, current, deadline, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [gid, label, target, current, deadline, status, now]
            )
          }
        }
      }

  // Migrations: renomeia workspace_id → profile_id nas tabelas que existirem
  // de um DB antigo. Como sqlite não tem RENAME COLUMN nativo, recriamos a
  // tabela com a coluna nova e copiamos os dados. Como o profile_id default
  // já é 1 e vamos apontar tudo pro Pessoal via backfill abaixo, isso fica
  // seguro — só não funciona pra DBs que tinham profiles além do id=1.
  const renameWorkspaceCol = (table: string) => {
    // tenta criar coluna profile_id se ainda não existir
    safeExec(`ALTER TABLE ${table} ADD COLUMN profile_id INTEGER NOT NULL DEFAULT 1 REFERENCES profiles(id) ON DELETE CASCADE`)
    // copia valor de workspace_id pra profile_id se workspace_id existir
    safeExec(`UPDATE ${table} SET profile_id = workspace_id WHERE workspace_id IS NOT NULL`)
  }
  renameWorkspaceCol('habits')
  renameWorkspaceCol('routines')
  renameWorkspaceCol('journal_entries')
  renameWorkspaceCol('focus_sessions')

  // Backfill qualquer linha órfã pro perfil Pessoal
  const personal = rawDb.exec(`SELECT id FROM profiles WHERE slug='personal' LIMIT 1`)[0]
  const personalId = personal?.values?.[0]?.[0] as number
  if (personalId) {
    safeExec(`UPDATE habits SET profile_id = ${personalId} WHERE profile_id NOT IN (SELECT id FROM profiles)`)
    safeExec(`UPDATE routines SET profile_id = ${personalId} WHERE profile_id NOT IN (SELECT id FROM profiles)`)
    safeExec(`UPDATE journal_entries SET profile_id = ${personalId} WHERE profile_id NOT IN (SELECT id FROM profiles)`)
    safeExec(`UPDATE focus_sessions SET profile_id = ${personalId} WHERE profile_id NOT IN (SELECT id FROM profiles)`)
  }

  // Migration: adiciona /projects ao sidebar_items do perfil Profissional
  // pra users que já tinham o app instalado antes desse módulo existir.
  // Sem isso, o item só apareceria pra profiles criados depois do deploy.
  const profProfile = rawDb.exec(`SELECT id, sidebar_items FROM profiles WHERE slug='professional' LIMIT 1`)[0]
  const profRow = profProfile?.values?.[0]
  if (profRow) {
    const profId = profRow[0] as number
    const items = JSON.parse((profRow[1] as string) || '[]') as string[]
    if (!items.includes('/projects')) {
      items.push('/projects')
      rawDb.run(`UPDATE profiles SET sidebar_items = ? WHERE id = ?`, [JSON.stringify(items), profId])
    }
  }

  dbInstance = drizzle(rawDb, { schema })
  return dbInstance
}

export function persistDb() {
  persist()
}

export function getDbInstance(): DrizzleDb {
  if (!dbInstance) {
    throw new Error('DB not initialized. Call getDb() in app.whenReady() first.')
  }
  return dbInstance
}