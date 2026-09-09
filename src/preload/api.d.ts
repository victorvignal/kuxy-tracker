// KUXY preload API type definitions (v0.12.0 — step 4)
// Substitui `any` por tipos unknown/any flexíveis pra permitir divergências
// entre tipos do renderer (`types/index.ts`) e schema do main.
//
// IMPORTANTE: este arquivo delcara a forma de window.api, mas usa `any`
// nos retornos pra evitar conflito com tipos manuais do renderer.
// O renderer continua usando seus tipos locais via casts `as Type[]`.
//
// Quando o renderer migrar pra usar inferência direta do schema (sem casts),
// basta trocar `Promise<any[]>` por `Promise<Type[]>` neste arquivo.

import type {
  NewProfile,
  NewHabit,
  NewCompletion,
  NewRoutine,
  NewJournalEntry,
  NewFocusSession,
  NewAccount,
  NewCategory,
  NewTransaction,
  NewSubscription,
  NewContact,
  NewProject,
  NewProjectMember,
  NewProjectTag,
  NewProjectComment,
  NewProjectSubitem,
  NewGoal,
  NewGoalMilestone,
  NewLead,
  NewQueueItem,
  NewPomodoroSession,
  NewOutreach,
} from '../shared/schema'

// Helper: retorna any[] pra evitar conflito com tipos manuais do renderer
// até migração futura pra inferência completa do schema.
type Row = any
type CrudResource<TInsert> = {
  list: (params?: { profileId?: number; includeArchived?: boolean }) => Promise<Row[]>
  get: (id: number) => Promise<Row | undefined>
  create: (data: TInsert) => Promise<Row>
  update: (id: number, data: Partial<TInsert>) => Promise<Row>
  delete: (id: number) => Promise<{ ok: boolean }>
  archive: (id: number, archived: boolean) => Promise<{ ok: boolean }>
}

// YouTube search result
type YouTubeSearchResult =
  | { ok: true; items: any[] }
  | { ok: false; reason: 'no_api_key'; items: any[] }
  | { ok: false; reason: 'api_error'; status: number; message: string }
  | { ok: false; reason: 'network_error'; message: string }

declare global {
  interface Window {
    api: {
      // ========== PERFIS ==========
      profiles: CrudResource<NewProfile> & {
        updateSidebarItems: (id: number, sidebarItems: string[]) => Promise<Row>
      }

      // ========== HABITS ==========
      habits: CrudResource<NewHabit>
      completions: {
        list: (params?: { from?: string; to?: string; habitId?: number; profileId?: number }) => Promise<Row[]>
        toggle: (habitId: number, date: string, value?: number) => Promise<Row>
        set: (habitId: number, date: string, count: number, value?: number) => Promise<Row>
      }

      // ========== ROUTINES ==========
      routines: {
        list: (params?: { profileId?: number }) => Promise<Row[]>
        create: (data: NewRoutine) => Promise<Row>
        delete: (id: number) => Promise<{ ok: boolean }>
        addHabit: (routineId: number, habitId: number, order?: number) => Promise<{ ok: boolean }>
        removeHabit: (routineId: number, habitId: number) => Promise<{ ok: boolean }>
      }

      // ========== JOURNAL ==========
      journal: {
        list: (params?: { from?: string; to?: string; profileId?: number }) => Promise<Row[]>
        upsert: (data: NewJournalEntry) => Promise<Row>
      }

      // ========== FOCUS ==========
      focus: {
        create: (data: NewFocusSession) => Promise<Row>
        list: (params?: { from?: string; to?: string; profileId?: number }) => Promise<Row[]>
        totals: (params?: { from?: string; to?: string; profileId?: number }) => Promise<Record<string, number>>
      }

      // ========== DASHBOARD ==========
      dashboard: {
        overview: (params: { from: string; to: string; profileId?: number }) => Promise<{
          habits: any[]
          completions: any[]
          focusSeconds: number
        }>
      }

      // ========== UPDATE / APP ==========
      update: {
        getVersion: () => Promise<string>
        check: () => Promise<{ currentVersion: string }>
        install: () => Promise<void>
        onStatus: (listener: (status: any) => void) => () => void
      }
      app: {
        isDev: () => Promise<boolean>
      }

      // ========== FINANCE ==========
      finance: {
        accounts: CrudResource<NewAccount>
        categories: {
          list: (params?: { profileId?: number; type?: 'income' | 'expense' }) => Promise<Row[]>
          create: (data: NewCategory) => Promise<Row>
        }
        transactions: {
          list: (params?: { profileId?: number; from?: string; to?: string; type?: 'income' | 'expense'; limit?: number }) => Promise<Row[]>
          create: (data: NewTransaction) => Promise<Row>
          update: (id: number, data: Partial<NewTransaction>) => Promise<Row>
          delete: (id: number) => Promise<{ ok: boolean }>
        }
        subscriptions: CrudResource<NewSubscription>
        overview: (params: { from: string; to: string; profileId?: number }) => Promise<{
          income: number
          expense: number
          net: number
          totalBalance: number
          transactionCount: number
        }>
        // budgets existe no preload mas ainda não migrado pro main — declarado pra não quebrar renderer
        budgets: any
      }

      // ========== PROJECTS ==========
      projects: {
        list: (params?: { profileId?: number; includeArchived?: boolean }) => Promise<Row[]>
        get: (id: number) => Promise<Row | undefined>
        create: (data: NewProject) => Promise<Row>
        update: (id: number, data: Partial<NewProject>) => Promise<Row>
        archive: (id: number, archived: boolean) => Promise<{ ok: boolean }>
        reorder: (params: { id: number; status: string; sortOrder: number }[]) => Promise<{ ok: boolean }>
        members: {
          list: (projectId: number) => Promise<Row[]>
          add: (projectId: number, member: Omit<NewProjectMember, 'projectId'>) => Promise<Row>
          remove: (id: number) => Promise<{ ok: boolean }>
        }
        tags: {
          list: (projectId: number) => Promise<Row[]>
          add: (projectId: number, tag: Omit<NewProjectTag, 'projectId'>) => Promise<Row>
          remove: (id: number) => Promise<{ ok: boolean }>
        }
        comments: {
          list: (projectId: number) => Promise<Row[]>
          add: (projectId: number, content: string, author?: string) => Promise<Row>
          delete: (id: number) => Promise<{ ok: boolean }>
        }
        subitems: {
          list: (projectId: number) => Promise<Row[]>
          add: (projectId: number, data: Omit<NewProjectSubitem, 'projectId'>) => Promise<Row>
          update: (id: number, data: Partial<NewProjectSubitem>) => Promise<Row>
          delete: (id: number) => Promise<{ ok: boolean }>
        }
      }

      // ========== CONTACTS ==========
      contacts: CrudResource<NewContact>

      // ========== LEADS ==========
      leads: {
        list: (params?: { profileId?: number; includeArchived?: boolean }) => Promise<Row[]>
        create: (data: NewLead) => Promise<Row>
        update: (id: number, data: Partial<NewLead>) => Promise<Row>
        archive: (id: number, archived: boolean) => Promise<{ ok: boolean }>
        delete: (id: number) => Promise<{ ok: boolean }>
      }
      youtube: {
        search: (params: { q: string; region?: string; maxResults?: number }) => Promise<YouTubeSearchResult>
        hasKey: () => Promise<boolean>
      }

      // ========== GOALS ==========
      goals: CrudResource<NewGoal>
      milestones: {
        list: (params?: { goalId?: number }) => Promise<Row[]>
        create: (data: NewGoalMilestone) => Promise<Row>
        update: (id: number, data: Partial<NewGoalMilestone>) => Promise<Row>
        delete: (id: number) => Promise<{ ok: boolean }>
      }

      // ========== RITMO (v0.11.5) ==========
      queue: {
        list: (params?: { profileId?: number; includeArchived?: boolean }) => Promise<Row[]>
        create: (data: NewQueueItem) => Promise<Row>
        update: (id: number, data: Partial<NewQueueItem>) => Promise<Row>
        archive: (id: number, archived: boolean) => Promise<{ ok: boolean }>
        delete: (id: number) => Promise<{ ok: boolean }>
      }
      pomodoro: {
        list: (params?: { profileId?: number; from?: number; to?: number }) => Promise<Row[]>
        create: (data: NewPomodoroSession) => Promise<Row>
      }

      // ========== OUTREACH (v0.12.x) ==========
      outreach: CrudResource<NewOutreach> & {
        markSent: (id: number) => Promise<Row>
        markReplied: (id: number) => Promise<Row>
      }
    }
  }
}

export {}
