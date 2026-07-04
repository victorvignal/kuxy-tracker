import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
import { getDb, persistDb, getDbInstance } from './db'
import { initAutoUpdater, checkForUpdates, quitAndInstall } from './updater'
import * as schema from '../shared/schema'
import { getYouTubeApiKey, mockYouTubeResults, deriveCategory, scoreFromKeywords } from './youtube'

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0f',
    // No macOS, 'hiddenInset' deixa a traffic light flutuante e o
    // Electron cuida do inset sozinho. No Windows, a barra nativa
    // do Windows (28px) sobrepõe o conteúdo do Topbar se não
    // compensarmos. Solução padrão: 'hidden' + titleBarOverlay —
    // a barra nativa some e o renderer recebe as CSS vars
    // --title-bar-height (28px) e --title-bar-overlay-color
    // pra preencher o espaço com a cor do app.
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      height: 38,
      color: '#0a0a0f',
      symbolColor: '#cfcfd4'
    },
    title: 'KUXY',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
      mainWindow.show()
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    })

    mainWindow.webContents.on('console-message', (_e, level, msg, line, source) => {
      console.log(`[renderer console:${level}]`, msg, `@${source}:${line}`)
    })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function registerIpc(): void {
  const db = getDbInstance() as any

  // Workspaces
  ipcMain.handle('profiles:list', () => {
    return db.select().from(schema.profiles).where(eq(schema.profiles.archived, false)).all()
  })

  ipcMain.handle('profiles:get', (_e, id: number) => {
    return db.select().from(schema.profiles).where(eq(schema.profiles.id, id)).get()
  })

  ipcMain.handle('profiles:create', async (_e, data: schema.NewProfile) => {
    const result = db.insert(schema.profiles).values({ ...data, createdAt: new Date() }).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('profiles:update', async (_e, id: number, data: Partial<schema.NewProfile>) => {
    const result = db.update(schema.profiles).set(data).where(eq(schema.profiles.id, id)).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('profiles:updateSidebarItems', async (_e, id: number, sidebarItems: string[]) => {
    const result = db
      .update(schema.profiles)
      .set({ sidebarItems: JSON.stringify(sidebarItems) })
      .where(eq(schema.profiles.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('profiles:archive', async (_e, id: number, archived: boolean) => {
    db.update(schema.profiles)
      .set({ archived })
      .where(eq(schema.profiles.id, id))
      .run()
    persistDb()
    return { ok: true }
  })

  // Habits
  ipcMain.handle('habits:list', (_e, params: { profileId?: number } = {}) => {
    if (params.profileId) {
      return db
        .select()
        .from(schema.habits)
        .where(and(eq(schema.habits.archived, false), eq(schema.habits.profileId, params.profileId)))
        .all()
    }
    return db.select().from(schema.habits).where(eq(schema.habits.archived, false)).all()
  })

  ipcMain.handle('habits:get', (_e, id: number) => {
    return db.select().from(schema.habits).where(eq(schema.habits.id, id)).get()
  })

  ipcMain.handle('habits:create', async (_e, data: schema.NewHabit) => {
    const result = db
      .insert(schema.habits)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('habits:update', async (_e, id: number, data: Partial<schema.NewHabit>) => {
    const result = db
      .update(schema.habits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.habits.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('habits:delete', async (_e, id: number) => {
    db.delete(schema.habits).where(eq(schema.habits.id, id)).run()
    persistDb()
    return { ok: true }
  })

  ipcMain.handle('habits:archive', async (_e, id: number, archived: boolean) => {
    db.update(schema.habits)
      .set({ archived, updatedAt: new Date() })
      .where(eq(schema.habits.id, id))
      .run()
    persistDb()
    return { ok: true }
  })

  // Completions
  ipcMain.handle('completions:list', (_e, params: { from?: string; to?: string; habitId?: number; profileId?: number } = {}) => {
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.completions.date, params.from))
    if (params.to) conditions.push(lte(schema.completions.date, params.to))
    if (params.habitId) conditions.push(eq(schema.completions.habitId, params.habitId))
    if (params.profileId) {
      const habitIds = db
        .select({ id: schema.habits.id })
        .from(schema.habits)
        .where(eq(schema.habits.profileId, params.profileId))
        .all()
        .map((r: any) => r.id)
      if (habitIds.length === 0) return []
      // IN clause via simple OR
      const inConds = habitIds.map((id: number) => eq(schema.completions.habitId, id))
      conditions.push(sql`(${sql.join(inConds, sql`, `)})`)
    }
    const where = conditions.length ? and(...conditions) : undefined
    return db.select().from(schema.completions).where(where).all()
  })

  ipcMain.handle('completions:toggle', async (_e, habitId: number, date: string, value = 1) => {
    const existing = db
      .select()
      .from(schema.completions)
      .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
      .get()

    if (existing) {
      db.delete(schema.completions)
        .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
        .run()
      persistDb()
      return { toggled: false }
    } else {
      db.insert(schema.completions)
        .values({ habitId, date, count: 1, value, createdAt: new Date() })
        .run()
      persistDb()
      return { toggled: true }
    }
  })

  ipcMain.handle('completions:set', async (_e, habitId: number, date: string, count: number, value?: number) => {
    const existing = db
      .select()
      .from(schema.completions)
      .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
      .get()

    if (count <= 0) {
      if (existing) {
        db.delete(schema.completions)
          .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
          .run()
      }
      persistDb()
      return { ok: true }
    }

    if (existing) {
      db.update(schema.completions)
        .set({ count, value: value ?? existing.value })
        .where(and(eq(schema.completions.habitId, habitId), eq(schema.completions.date, date)))
        .run()
    } else {
      db.insert(schema.completions)
        .values({ habitId, date, count, value: value ?? 0, createdAt: new Date() })
        .run()
    }
    persistDb()
    return { ok: true }
  })

  // Routines
  ipcMain.handle('routines:list', (_e, params: { profileId?: number } = {}) => {
    if (params.profileId) {
      return db
        .select()
        .from(schema.routines)
        .where(and(eq(schema.routines.archived, false), eq(schema.routines.profileId, params.profileId)))
        .all()
    }
    return db.select().from(schema.routines).where(eq(schema.routines.archived, false)).all()
  })

  ipcMain.handle('routines:create', async (_e, data: schema.NewRoutine) => {
    const result = db
      .insert(schema.routines)
      .values({ ...data, createdAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('routines:delete', async (_e, id: number) => {
    db.delete(schema.routines).where(eq(schema.routines.id, id)).run()
    persistDb()
    return { ok: true }
  })

  ipcMain.handle('routines:addHabit', async (_e, routineId: number, habitId: number, order = 0) => {
    db.insert(schema.routineHabits).values({ routineId, habitId, order }).run()
    persistDb()
    return { ok: true }
  })

  ipcMain.handle('routines:removeHabit', async (_e, routineId: number, habitId: number) => {
    db.delete(schema.routineHabits)
      .where(and(eq(schema.routineHabits.routineId, routineId), eq(schema.routineHabits.habitId, habitId)))
      .run()
    persistDb()
    return { ok: true }
  })

  // Journal
  ipcMain.handle('journal:list', (_e, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.journalEntries.date, params.from))
    if (params.to) conditions.push(lte(schema.journalEntries.date, params.to))
    if (params.profileId) conditions.push(eq(schema.journalEntries.profileId, params.profileId))
    const where = conditions.length ? and(...conditions) : undefined
    return db
      .select()
      .from(schema.journalEntries)
      .where(where)
      .orderBy(desc(schema.journalEntries.date))
      .all()
  })

  ipcMain.handle('journal:upsert', async (_e, data: schema.NewJournalEntry) => {
    const existing = db
      .select()
      .from(schema.journalEntries)
      .where(eq(schema.journalEntries.date, data.date))
      .get()

    let result
    if (existing) {
      result = db
        .update(schema.journalEntries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.journalEntries.date, data.date))
        .returning()
        .get()
    } else {
      result = db
        .insert(schema.journalEntries)
        .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
        .returning()
        .get()
    }
    persistDb()
    return result
  })

  // Focus
  ipcMain.handle('focus:create', async (_e, data: schema.NewFocusSession) => {
    const result = db.insert(schema.focusSessions).values(data).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('focus:list', (_e, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const conditions: any[] = []
    if (params.from) conditions.push(gte(schema.focusSessions.startedAt, new Date(params.from)))
    if (params.to) conditions.push(lte(schema.focusSessions.startedAt, new Date(params.to)))
    if (params.profileId) conditions.push(eq(schema.focusSessions.profileId, params.profileId))
    const where = conditions.length ? and(...conditions) : undefined
    return db
      .select()
      .from(schema.focusSessions)
      .where(where)
      .orderBy(desc(schema.focusSessions.startedAt))
      .all()
  })

  ipcMain.handle('focus:totals', (_e, params: { from?: string; to?: string; profileId?: number } = {}) => {
    const conditions: any[] = [eq(schema.focusSessions.status, 'completed')]
    if (params.from) conditions.push(gte(schema.focusSessions.startedAt, new Date(params.from)))
    if (params.to) conditions.push(lte(schema.focusSessions.startedAt, new Date(params.to)))
    if (params.profileId) conditions.push(eq(schema.focusSessions.profileId, params.profileId))
    const result = db
      .select({ total: sql<number>`COALESCE(SUM(${schema.focusSessions.duration}), 0)` })
      .from(schema.focusSessions)
      .where(and(...conditions))
      .get()
    return result?.total ?? 0
  })

  // Dashboard
  ipcMain.handle('dashboard:overview', (_e, params: { from: string; to: string; profileId?: number }) => {
    const conditions: any[] = []
    if (params.profileId) {
      const habitIds = db
        .select({ id: schema.habits.id })
        .from(schema.habits)
        .where(eq(schema.habits.profileId, params.profileId))
        .all()
        .map((r: any) => r.id)
      if (habitIds.length === 0) {
        return { habits: [], completions: [], focusSeconds: 0 }
      }
      const inConds = habitIds.map((id: number) => eq(schema.completions.habitId, id))
      conditions.push(sql`(${sql.join(inConds, sql`, `)})`)
    }
    conditions.push(gte(schema.completions.date, params.from))
    conditions.push(lte(schema.completions.date, params.to))
    const completionsInRange = db.select().from(schema.completions).where(and(...conditions)).all()

    const habits = params.profileId
      ? db
          .select()
          .from(schema.habits)
          .where(and(eq(schema.habits.archived, false), eq(schema.habits.profileId, params.profileId)))
          .all()
      : db.select().from(schema.habits).where(eq(schema.habits.archived, false)).all()

    const focusConds: any[] = [eq(schema.focusSessions.status, 'completed')]
    if (params.profileId) focusConds.push(eq(schema.focusSessions.profileId, params.profileId))
    focusConds.push(gte(schema.focusSessions.startedAt, new Date(params.from)))
    focusConds.push(lte(schema.focusSessions.startedAt, new Date(params.to)))
    const totals = db
      .select({ total: sql<number>`COALESCE(SUM(${schema.focusSessions.duration}), 0)` })
      .from(schema.focusSessions)
      .where(and(...focusConds))
      .get()

    return {
      habits,
      completions: completionsInRange,
      focusSeconds: totals?.total ?? 0
    }
  })

  // Updates
  ipcMain.handle('update:getVersion', () => app.getVersion())

  // Renderer usa isso pra saber se o botão de "verificar atualizações"
  // deve ficar habilitado. window.process não existe no renderer (contextIsolation),
  // então precisa vir do main via IPC.
  ipcMain.handle('app:isDev', () => !app.isPackaged)

  ipcMain.handle('update:check', async () => {
    return checkForUpdates()
  })

  ipcMain.handle('update:install', () => {
    quitAndInstall()
  })

  // ============================================================
  // FINANCE (v0.3.0)
  // ============================================================

  // --- Accounts ---
  ipcMain.handle('accounts:list', (_e, params: { profileId?: number; includeArchived?: boolean } = {}) => {
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.accounts.profileId, params.profileId))
    if (!params.includeArchived) conds.push(eq(schema.accounts.archived, false))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.accounts).where(where).orderBy(schema.accounts.name).all()
  })

  ipcMain.handle('accounts:create', async (_e, data: schema.NewAccount) => {
    const result = db
      .insert(schema.accounts)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('accounts:update', async (_e, id: number, data: Partial<schema.NewAccount>) => {
    const result = db
      .update(schema.accounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.accounts.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('accounts:archive', async (_e, id: number, archived: boolean) => {
      db.update(schema.accounts)
        .set({ archived, updatedAt: new Date() })
        .where(eq(schema.accounts.id, id))
        .run()
      persistDb()
      return { ok: true }
    })

    // --- Contacts (CRM pessoal/profissional — v0.9.0) ---
    ipcMain.handle('contacts:list', (_e, params: { profileId?: number; includeArchived?: boolean } = {}) => {
      const conds: any[] = []
      if (params.profileId) conds.push(eq(schema.contacts.profileId, params.profileId))
      if (!params.includeArchived) conds.push(eq(schema.contacts.archived, false))
      const where = conds.length ? and(...conds) : undefined
      return db.select().from(schema.contacts).where(where).orderBy(schema.contacts.name).all()
    })

    ipcMain.handle('contacts:create', async (_e, data: schema.NewContact) => {
      const result = db
        .insert(schema.contacts)
        .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
        .returning()
        .get()
      persistDb()
      return result
    })

    ipcMain.handle('contacts:update', async (_e, id: number, data: Partial<schema.NewContact>) => {
      const result = db
        .update(schema.contacts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.contacts.id, id))
        .returning()
        .get()
      persistDb()
      return result
    })

    ipcMain.handle('contacts:archive', async (_e, id: number, archived: boolean) => {
      db.update(schema.contacts)
        .set({ archived, updatedAt: new Date() })
        .where(eq(schema.contacts.id, id))
        .run()
      persistDb()
      return { ok: true }
    })

    ipcMain.handle('contacts:delete', async (_e, id: number) => {
        db.delete(schema.contacts).where(eq(schema.contacts.id, id)).run()
        persistDb()
        return { ok: true }
      })

      // --- Leads (v0.10.0) — prospecção via YouTube Data API ---
      ipcMain.handle('leads:list', (_e, params: { profileId?: number; includeArchived?: boolean } = {}) => {
        const conds: any[] = []
        if (params.profileId) conds.push(eq(schema.leads.profileId, params.profileId))
        if (!params.includeArchived) conds.push(eq(schema.leads.archived, false))
        const where = conds.length ? and(...conds) : undefined
        return db.select().from(schema.leads).where(where).orderBy(desc(schema.leads.score)).all()
      })

      ipcMain.handle('leads:create', async (_e, data: schema.NewLead) => {
        const result = db
          .insert(schema.leads)
          .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
          .returning()
          .get()
        persistDb()
        return result
      })

      ipcMain.handle('leads:update', async (_e, id: number, data: Partial<schema.NewLead>) => {
        const result = db
          .update(schema.leads)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.leads.id, id))
          .returning()
          .get()
        persistDb()
        return result
      })

      ipcMain.handle('leads:archive', async (_e, id: number, archived: boolean) => {
        db.update(schema.leads)
          .set({ archived, updatedAt: new Date() })
          .where(eq(schema.leads.id, id))
          .run()
        persistDb()
        return { ok: true }
      })

      ipcMain.handle('leads:delete', async (_e, id: number) => {
        db.delete(schema.leads).where(eq(schema.leads.id, id)).run()
        persistDb()
        return { ok: true }
      })

      // --- YouTube Data API v3 (v0.10.0) ---
      // Se tem key configurada em ~/.kuxy/config.json → chamada real.
      // Sem key → retorna fallback mock (não bloqueia a UI).
      ipcMain.handle('youtube:search', async (_e, params: { q: string; region?: string; maxResults?: number }) => {
        const key = getYouTubeApiKey()
        if (!key) {
          return {
            ok: false as const,
            reason: 'no_api_key' as const,
            items: mockYouTubeResults(params.q)
          }
        }
        try {
          const url = new URL('https://www.googleapis.com/youtube/v3/search')
          url.searchParams.set('part', 'snippet')
          url.searchParams.set('type', 'channel')
          url.searchParams.set('q', params.q)
          url.searchParams.set('maxResults', String(params.maxResults ?? 20))
          if (params.region) url.searchParams.set('regionCode', params.region)
          url.searchParams.set('key', key)
          const res = await fetch(url.toString())
          if (!res.ok) {
            const text = await res.text()
            return { ok: false as const, reason: 'api_error' as const, status: res.status, message: text }
          }
          const data = await res.json() as { items?: Array<{
            id: { channelId: string }
            snippet: {
              title: string
              description: string
              thumbnails: { default?: { url: string } }
              country?: string
            }
          }> }
          // 2ª chamada pra pegar stats (subscribers) de cada channel
          const ids = (data.items ?? []).map((i) => i.id.channelId).join(',')
          let stats: Record<string, { subscriberCount?: string }> = {}
          if (ids) {
            const statsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
            statsUrl.searchParams.set('part', 'statistics')
            statsUrl.searchParams.set('id', ids)
            statsUrl.searchParams.set('key', key)
            const sr = await fetch(statsUrl.toString())
            if (sr.ok) {
              const sd = await sr.json() as { items?: Array<{ id: string; statistics: { subscriberCount?: string } }> }
              stats = Object.fromEntries((sd.items ?? []).map((c) => [c.id, c.statistics]))
            }
          }
          const items = (data.items ?? []).map((i) => ({
            externalId: i.id.channelId,
            name: i.snippet.title,
            handle: '@' + i.snippet.title.toLowerCase().replace(/\s+/g, ''),
            avatarUrl: i.snippet.thumbnails.default?.url ?? null,
            region: i.snippet.country ?? null,
            category: deriveCategory(i.snippet.title + ' ' + i.snippet.description),
            followers: parseInt(stats[i.id.channelId]?.subscriberCount ?? '0', 10),
            score: scoreFromKeywords(i.snippet.title + ' ' + i.snippet.description, params.q)
          }))
          return { ok: true as const, items }
        } catch (e: any) {
          return { ok: false as const, reason: 'network_error' as const, message: String(e?.message ?? e) }
        }
      })

      ipcMain.handle('youtube:hasKey', () => !!getYouTubeApiKey())

  // --- Goals (Metas — v0.11.0) ---
  ipcMain.handle('goals:list', (_e, params: { profileId?: number; includeArchived?: boolean } = {}) => {
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.goals.profileId, params.profileId))
    if (!params.includeArchived) conds.push(eq(schema.goals.archived, false))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.goals).where(where).orderBy(schema.goals.createdAt).all()
  })

  ipcMain.handle('goals:create', async (_e, data: schema.NewGoal) => {
    const result = db
      .insert(schema.goals)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('goals:update', async (_e, id: number, data: Partial<schema.NewGoal>) => {
    const result = db
      .update(schema.goals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.goals.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('goals:archive', async (_e, id: number, archived: boolean) => {
    db.update(schema.goals)
      .set({ archived, updatedAt: new Date() })
      .where(eq(schema.goals.id, id))
      .run()
    persistDb()
    return { ok: true }
  })

  ipcMain.handle('goals:delete', async (_e, id: number) => {
    db.delete(schema.goals).where(eq(schema.goals.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // --- Milestones (v0.11.0) ---
  ipcMain.handle('milestones:list', (_e, params: { goalId?: number } = {}) => {
    const conds: any[] = []
    if (params.goalId) conds.push(eq(schema.goalMilestones.goalId, params.goalId))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.goalMilestones).where(where).orderBy(schema.goalMilestones.deadline).all()
  })

  ipcMain.handle('milestones:create', async (_e, data: schema.NewGoalMilestone) => {
    const result = db
      .insert(schema.goalMilestones)
      .values({ ...data, createdAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('milestones:update', async (_e, id: number, data: Partial<schema.NewGoalMilestone>) => {
    const result = db
      .update(schema.goalMilestones)
      .set(data)
      .where(eq(schema.goalMilestones.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('milestones:delete', async (_e, id: number) => {
    db.delete(schema.goalMilestones).where(eq(schema.goalMilestones.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // --- Categories ---
  ipcMain.handle('categories:list', (_e, params: { profileId?: number; type?: 'income' | 'expense' } = {}) => {
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.categories.profileId, params.profileId))
    if (params.type) conds.push(eq(schema.categories.type, params.type))
    conds.push(eq(schema.categories.archived, false))
    return db.select().from(schema.categories).where(and(...conds)).orderBy(schema.categories.name).all()
  })

  ipcMain.handle('categories:create', async (_e, data: schema.NewCategory) => {
    const result = db
      .insert(schema.categories)
      .values({ ...data, createdAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  // --- Transactions ---
  ipcMain.handle('transactions:list', (_e, params: { profileId?: number; from?: string; to?: string; type?: 'income' | 'expense'; limit?: number } = {}) => {
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.transactions.profileId, params.profileId))
    if (params.from) conds.push(gte(schema.transactions.date, params.from))
    if (params.to) conds.push(lte(schema.transactions.date, params.to))
    if (params.type) conds.push(eq(schema.transactions.type, params.type))
    const where = conds.length ? and(...conds) : undefined
    return db
      .select()
      .from(schema.transactions)
      .where(where)
      .orderBy(desc(schema.transactions.date))
      .limit(params.limit ?? 500)
      .all()
  })

  ipcMain.handle('transactions:create', async (_e, data: schema.NewTransaction) => {
    const result = db
      .insert(schema.transactions)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .returning()
      .get()
    // Atualiza o saldo da conta: income soma, expense subtrai
    const delta = data.type === 'income' ? data.amount : -data.amount
    db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
      delta,
      Date.now(),
      data.accountId
    ])
    persistDb()
    return result
  })

  ipcMain.handle('transactions:update', async (_e, id: number, data: Partial<schema.NewTransaction>) => {
    // Se mudou amount/type/accountId, ajustar saldo
    if (data.amount !== undefined || data.type !== undefined || data.accountId !== undefined) {
      const old = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get()
      if (old) {
        // Reverte o efeito antigo
        const revert = old.type === 'income' ? -old.amount : old.amount
        db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
          revert,
          Date.now(),
          old.accountId
        ])
        // Aplica o novo (se accountId não foi passado, mantém o mesmo)
        const newType = data.type ?? old.type
        const newAmount = data.amount ?? old.amount
        const newAccountId = data.accountId ?? old.accountId
        const apply = newType === 'income' ? newAmount : -newAmount
        db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
          apply,
          Date.now(),
          newAccountId
        ])
      }
    }
    const result = db
      .update(schema.transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.transactions.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('transactions:delete', async (_e, id: number) => {
    const t = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get()
    if (t) {
      const revert = t.type === 'income' ? -t.amount : t.amount
      db.run(`UPDATE accounts SET balance = balance + (?), updated_at = ? WHERE id = ?`, [
        revert,
        Date.now(),
        t.accountId
      ])
    }
    db.delete(schema.transactions).where(eq(schema.transactions.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // Overview agregado pro dashboard financeiro
  ipcMain.handle('finance:overview', (_e, params: { from: string; to: string; profileId?: number }) => {
    const conds: any[] = [
      gte(schema.transactions.date, params.from),
      lte(schema.transactions.date, params.to)
    ]
    if (params.profileId) conds.push(eq(schema.transactions.profileId, params.profileId))

    const txs = db.select().from(schema.transactions).where(and(...conds)).all()

    let income = 0
    let expense = 0
    for (const t of txs) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }

    const accConds: any[] = [eq(schema.accounts.archived, false)]
    if (params.profileId) accConds.push(eq(schema.accounts.profileId, params.profileId))
    const accs = db.select().from(schema.accounts).where(and(...accConds)).all()
    const totalBalance = accs.reduce((sum, a) => sum + a.balance, 0)

    return {
      income,
      expense,
      net: income - expense,
      totalBalance,
      transactionCount: txs.length
    }
  })

  // --- Subscriptions ---
  ipcMain.handle('subscriptions:list', (_e, params: { profileId?: number; activeOnly?: boolean } = {}) => {
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.subscriptions.profileId, params.profileId))
    if (params.activeOnly) conds.push(eq(schema.subscriptions.active, true))
    return db.select().from(schema.subscriptions).where(conds.length ? and(...conds) : undefined).all()
  })

  ipcMain.handle('subscriptions:create', async (_e, data: schema.NewSubscription) => {
    const result = db
      .insert(schema.subscriptions)
      .values({ ...data, createdAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('subscriptions:update', async (_e, id: number, data: Partial<schema.NewSubscription>) => {
    const result = db
      .update(schema.subscriptions)
      .set(data)
      .where(eq(schema.subscriptions.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('subscriptions:delete', async (_e, id: number) => {
    db.delete(schema.subscriptions).where(eq(schema.subscriptions.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // ============================================================
  // PROJECTS (v0.4.0) — board Kanban estilo Notion no perfil Profissional
  // ============================================================

  // --- Projects ---
  ipcMain.handle('projects:list', (_e, params: { profileId?: number; includeArchived?: boolean } = {}) => {
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.projects.profileId, params.profileId))
    if (!params.includeArchived) conds.push(eq(schema.projects.archived, false))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.projects).where(where).orderBy(schema.projects.sortOrder).all()
  })

  ipcMain.handle('projects:get', (_e, id: number) => {
    return db.select().from(schema.projects).where(eq(schema.projects.id, id)).get()
  })

  ipcMain.handle('projects:create', async (_e, data: schema.NewProject) => {
    const result = db
      .insert(schema.projects)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('projects:update', async (_e, id: number, data: Partial<schema.NewProject>) => {
    const result = db
      .update(schema.projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('projects:archive', async (_e, id: number, archived: boolean) => {
    db.update(schema.projects)
      .set({ archived, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .run()
    persistDb()
    return { ok: true }
  })

  ipcMain.handle('projects:reorder', async (_e, params: { id: number; status: string; sortOrder: number }[]) => {
    const now = new Date()
    for (const item of params) {
      db.update(schema.projects)
        .set({ status: item.status, sortOrder: item.sortOrder, updatedAt: now })
        .where(eq(schema.projects.id, item.id))
        .run()
    }
    persistDb()
    return { ok: true }
  })

  // --- Members ---
  ipcMain.handle('project_members:list', (_e, projectId: number) => {
    return db.select().from(schema.projectMembers).where(eq(schema.projectMembers.projectId, projectId)).all()
  })

  ipcMain.handle('project_members:add', async (_e, projectId: number, member: Omit<schema.NewProjectMember, 'projectId'>) => {
    const result = db.insert(schema.projectMembers).values({ ...member, projectId }).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('project_members:remove', async (_e, id: number) => {
    db.delete(schema.projectMembers).where(eq(schema.projectMembers.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // --- Tags ---
  ipcMain.handle('project_tags:list', (_e, projectId: number) => {
    return db.select().from(schema.projectTags).where(eq(schema.projectTags.projectId, projectId)).all()
  })

  ipcMain.handle('project_tags:add', async (_e, projectId: number, tag: Omit<schema.NewProjectTag, 'projectId'>) => {
    const result = db.insert(schema.projectTags).values({ ...tag, projectId }).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('project_tags:remove', async (_e, id: number) => {
    db.delete(schema.projectTags).where(eq(schema.projectTags.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // --- Comments ---
  ipcMain.handle('project_comments:list', (_e, projectId: number) => {
    return db
      .select()
      .from(schema.projectComments)
      .where(eq(schema.projectComments.projectId, projectId))
      .orderBy(schema.projectComments.createdAt)
      .all()
  })

  ipcMain.handle('project_comments:add', async (_e, projectId: number, content: string, author = 'You') => {
    const result = db
      .insert(schema.projectComments)
      .values({ projectId, content, author, createdAt: new Date() })
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('project_comments:delete', async (_e, id: number) => {
    db.delete(schema.projectComments).where(eq(schema.projectComments.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // --- Subitems ---
  ipcMain.handle('project_subitems:list', (_e, projectId: number) => {
    return db
      .select()
      .from(schema.projectSubitems)
      .where(eq(schema.projectSubitems.projectId, projectId))
      .orderBy(schema.projectSubitems.sortOrder)
      .all()
  })

  ipcMain.handle('project_subitems:add', async (_e, projectId: number, data: Omit<schema.NewProjectSubitem, 'projectId'>) => {
    const result = db.insert(schema.projectSubitems).values({ ...data, projectId, createdAt: new Date() }).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('project_subitems:update', async (_e, id: number, data: Partial<schema.NewProjectSubitem>) => {
    const result = db
      .update(schema.projectSubitems)
      .set(data)
      .where(eq(schema.projectSubitems.id, id))
      .returning()
      .get()
    persistDb()
    return result
  })

  ipcMain.handle('project_subitems:delete', async (_e, id: number) => {
    db.delete(schema.projectSubitems).where(eq(schema.projectSubitems.id, id)).run()
    persistDb()
    return { ok: true }
  })
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('app.kuxy.desktop')
  app.setName('KUXY')

  app.on('browser-window-created', (_e, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await getDb()
  registerIpc()
  const win = createWindow()

  // Inicia checagem de updates (só roda em produção, ver updater.ts)
  initAutoUpdater(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

