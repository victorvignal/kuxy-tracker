import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  NewHabit,
  NewRoutine,
  NewJournalEntry,
  NewFocusSession,
  NewProfile,
  NewAccount,
  NewCategory,
  NewTransaction,
  NewSubscription,
  NewProject,
  NewProjectMember,
  NewProjectTag,
  NewProjectSubitem
} from '../shared/schema'

const api = {
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list') as Promise<any[]>,
    get: (id: number) => ipcRenderer.invoke('profiles:get', id) as Promise<any>,
    create: (data: NewProfile) => ipcRenderer.invoke('profiles:create', data) as Promise<any>,
    update: (id: number, data: Partial<NewProfile>) =>
      ipcRenderer.invoke('profiles:update', id, data) as Promise<any>,
    updateSidebarItems: (id: number, sidebarItems: string[]) =>
      ipcRenderer.invoke('profiles:updateSidebarItems', id, sidebarItems) as Promise<any>,
    archive: (id: number, archived: boolean) =>
      ipcRenderer.invoke('profiles:archive', id, archived) as Promise<{ ok: boolean }>
  },
  habits: {
    list: (params?: { profileId?: number }) =>
      ipcRenderer.invoke('habits:list', params || {}) as Promise<any[]>,
    get: (id: number) => ipcRenderer.invoke('habits:get', id) as Promise<any>,
    create: (data: NewHabit) => ipcRenderer.invoke('habits:create', data) as Promise<any>,
    update: (id: number, data: Partial<NewHabit>) =>
      ipcRenderer.invoke('habits:update', id, data) as Promise<any>,
    delete: (id: number) => ipcRenderer.invoke('habits:delete', id) as Promise<{ ok: boolean }>,
    archive: (id: number, archived: boolean) =>
      ipcRenderer.invoke('habits:archive', id, archived) as Promise<{ ok: boolean }>
  },
  completions: {
    list: (params: { from?: string; to?: string; habitId?: number; profileId?: number } = {}) =>
      ipcRenderer.invoke('completions:list', params) as Promise<any[]>,
    toggle: (habitId: number, date: string, value?: number) =>
      ipcRenderer.invoke('completions:toggle', habitId, date, value) as Promise<{ toggled: boolean }>,
    set: (habitId: number, date: string, count: number, value?: number) =>
      ipcRenderer.invoke('completions:set', habitId, date, count, value) as Promise<{ ok: boolean }>
  },
  routines: {
    list: (params?: { profileId?: number }) =>
      ipcRenderer.invoke('routines:list', params || {}) as Promise<any[]>,
    create: (data: NewRoutine) => ipcRenderer.invoke('routines:create', data) as Promise<any>,
    delete: (id: number) => ipcRenderer.invoke('routines:delete', id) as Promise<{ ok: boolean }>,
    addHabit: (routineId: number, habitId: number, order?: number) =>
      ipcRenderer.invoke('routines:addHabit', routineId, habitId, order) as Promise<{ ok: boolean }>,
    removeHabit: (routineId: number, habitId: number) =>
      ipcRenderer.invoke('routines:removeHabit', routineId, habitId) as Promise<{ ok: boolean }>
  },
  journal: {
    list: (params: { from?: string; to?: string; profileId?: number } = {}) =>
      ipcRenderer.invoke('journal:list', params) as Promise<any[]>,
    upsert: (data: NewJournalEntry) =>
      ipcRenderer.invoke('journal:upsert', data) as Promise<any>
  },
  focus: {
    create: (data: NewFocusSession) =>
      ipcRenderer.invoke('focus:create', data) as Promise<any>,
    list: (params: { from?: string; to?: string; profileId?: number } = {}) =>
      ipcRenderer.invoke('focus:list', params) as Promise<any[]>,
    totals: (params: { from?: string; to?: string; profileId?: number } = {}) =>
      ipcRenderer.invoke('focus:totals', params) as Promise<number>
  },
  dashboard: {
    overview: (params: { from: string; to: string; profileId?: number }) =>
      ipcRenderer.invoke('dashboard:overview', params) as Promise<{
        habits: any[]
        completions: any[]
        focusSeconds: number
      }>
  },
  update: {
    getVersion: () => ipcRenderer.invoke('update:getVersion') as Promise<string>,
    check: () =>
      ipcRenderer.invoke('update:check') as Promise<{ currentVersion: string }>,
    install: () => ipcRenderer.invoke('update:install') as Promise<void>,
    onStatus: (cb: (status: UpdateStatus) => void) => {
      const listener = (_e: unknown, status: UpdateStatus) => cb(status)
      ipcRenderer.on('update:status', listener)
      return () => ipcRenderer.removeListener('update:status', listener)
    }
  },
  finance: {
    accounts: {
      list: (params?: { profileId?: number; includeArchived?: boolean }) =>
        ipcRenderer.invoke('accounts:list', params || {}) as Promise<any[]>,
      create: (data: NewAccount) => ipcRenderer.invoke('accounts:create', data) as Promise<any>,
      update: (id: number, data: Partial<NewAccount>) =>
        ipcRenderer.invoke('accounts:update', id, data) as Promise<any>,
      archive: (id: number, archived: boolean) =>
        ipcRenderer.invoke('accounts:archive', id, archived) as Promise<{ ok: boolean }>
    },
    categories: {
      list: (params?: { profileId?: number; type?: 'income' | 'expense' }) =>
        ipcRenderer.invoke('categories:list', params || {}) as Promise<any[]>,
      create: (data: NewCategory) => ipcRenderer.invoke('categories:create', data) as Promise<any>
    },
    transactions: {
      list: (params?: { profileId?: number; from?: string; to?: string; type?: 'income' | 'expense'; limit?: number }) =>
        ipcRenderer.invoke('transactions:list', params || {}) as Promise<any[]>,
      create: (data: NewTransaction) =>
        ipcRenderer.invoke('transactions:create', data) as Promise<any>,
      update: (id: number, data: Partial<NewTransaction>) =>
        ipcRenderer.invoke('transactions:update', id, data) as Promise<any>,
      delete: (id: number) =>
        ipcRenderer.invoke('transactions:delete', id) as Promise<{ ok: boolean }>
    },
    subscriptions: {
      list: (params?: { profileId?: number; activeOnly?: boolean }) =>
        ipcRenderer.invoke('subscriptions:list', params || {}) as Promise<any[]>,
      create: (data: NewSubscription) =>
        ipcRenderer.invoke('subscriptions:create', data) as Promise<any>,
      update: (id: number, data: Partial<NewSubscription>) =>
        ipcRenderer.invoke('subscriptions:update', id, data) as Promise<any>,
      delete: (id: number) =>
        ipcRenderer.invoke('subscriptions:delete', id) as Promise<{ ok: boolean }>
    },
    overview: (params: { from: string; to: string; profileId?: number }) =>
      ipcRenderer.invoke('finance:overview', params) as Promise<{
        income: number
        expense: number
        net: number
        totalBalance: number
        transactionCount: number
      }>
  },
  projects: {
    list: (params?: { profileId?: number; includeArchived?: boolean }) =>
      ipcRenderer.invoke('projects:list', params || {}) as Promise<any[]>,
    get: (id: number) => ipcRenderer.invoke('projects:get', id) as Promise<any>,
    create: (data: NewProject) => ipcRenderer.invoke('projects:create', data) as Promise<any>,
    update: (id: number, data: Partial<NewProject>) =>
      ipcRenderer.invoke('projects:update', id, data) as Promise<any>,
    archive: (id: number, archived: boolean) =>
      ipcRenderer.invoke('projects:archive', id, archived) as Promise<{ ok: boolean }>,
    reorder: (params: { id: number; status: string; sortOrder: number }[]) =>
      ipcRenderer.invoke('projects:reorder', params) as Promise<{ ok: boolean }>,
    members: {
      list: (projectId: number) =>
        ipcRenderer.invoke('project_members:list', projectId) as Promise<any[]>,
      add: (projectId: number, member: Omit<NewProjectMember, 'projectId'>) =>
        ipcRenderer.invoke('project_members:add', projectId, member) as Promise<any>,
      remove: (id: number) =>
        ipcRenderer.invoke('project_members:remove', id) as Promise<{ ok: boolean }>
    },
    tags: {
      list: (projectId: number) =>
        ipcRenderer.invoke('project_tags:list', projectId) as Promise<any[]>,
      add: (projectId: number, tag: Omit<NewProjectTag, 'projectId'>) =>
        ipcRenderer.invoke('project_tags:add', projectId, tag) as Promise<any>,
      remove: (id: number) =>
        ipcRenderer.invoke('project_tags:remove', id) as Promise<{ ok: boolean }>
    },
    comments: {
      list: (projectId: number) =>
        ipcRenderer.invoke('project_comments:list', projectId) as Promise<any[]>,
      add: (projectId: number, content: string, author?: string) =>
        ipcRenderer.invoke('project_comments:add', projectId, content, author) as Promise<any>,
      delete: (id: number) =>
        ipcRenderer.invoke('project_comments:delete', id) as Promise<{ ok: boolean }>
    },
    subitems: {
      list: (projectId: number) =>
        ipcRenderer.invoke('project_subitems:list', projectId) as Promise<any[]>,
      add: (projectId: number, data: Omit<NewProjectSubitem, 'projectId'>) =>
        ipcRenderer.invoke('project_subitems:add', projectId, data) as Promise<any>,
      update: (id: number, data: Partial<NewProjectSubitem>) =>
        ipcRenderer.invoke('project_subitems:update', id, data) as Promise<any>,
      delete: (id: number) =>
        ipcRenderer.invoke('project_subitems:delete', id) as Promise<{ ok: boolean }>
    }
  }
}

export type UpdateStatus =
  | { state: 'checking' }
  | { state: 'available'; version: string; releaseDate?: string; releaseNotes?: string }
  | { state: 'downloading'; percent: number; transferred: number; total: number; bytesPerSecond: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }
  | { state: 'up-to-date' }

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}

export type Api = typeof api