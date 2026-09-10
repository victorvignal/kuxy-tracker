// KUXY main process — projects module
// projects + members + tags + comments + subitems (5 tabelas).

import { ipcMain } from 'electron'
import { and, eq } from 'drizzle-orm'
import { getDbInstance } from '../db'
import * as schema from '../../shared/schema'

// Helpers genéricos para tabelas com projectId
function listByProjectId(table: any, projectId: number, orderBy?: any) {
  const db = getDbInstance() as any
  const q = db.select().from(table).where(eq(table.projectId, projectId))
  return orderBy ? q.orderBy(orderBy).all() : q.all()
}

function addByProjectId(table: any, projectId: number, data: any, persistDb: () => void, extra: any = {}) {
  const db = getDbInstance() as any
  const result = db.insert(table).values({ ...data, ...extra, projectId, createdAt: new Date() }).returning().get()
  persistDb()
  return result
}

function removeById(table: any, id: number, persistDb: () => void) {
  const db = getDbInstance() as any
  db.delete(table).where(eq(table.id, id)).run()
  persistDb()
  return { ok: true }
}

export function registerProjects(persistDb: () => void): void {
  // ========== PROJECTS ==========
  // Projects tem list/create/update/archive custom (seta updatedAt, etc)
  // + reorder handler exclusivo. Não usa registerCrud (skip tudo).

  ipcMain.handle('projects:list', (_e: unknown, params: { profileId?: number; includeArchived?: boolean } = {}) => {
    const db = getDbInstance() as any
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.projects.profileId, params.profileId))
    if (!params.includeArchived) conds.push(eq(schema.projects.archived, false))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.projects).where(where).orderBy(schema.projects.sortOrder).all()
  })

  ipcMain.handle('projects:get', (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    return db.select().from(schema.projects).where(eq(schema.projects.id, id)).get()
  })

  ipcMain.handle('projects:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.projects).values({ ...data, createdAt: new Date(), updatedAt: new Date() }).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('projects:update', async (_e: unknown, id: number, data: any) => {
    const db = getDbInstance() as any
    const result = db.update(schema.projects).set({ ...data, updatedAt: new Date() }).where(eq(schema.projects.id, id)).returning().get()
    persistDb()
    return result
  })

  ipcMain.handle('projects:archive', async (_e: unknown, id: number, archived: boolean) => {
    const db = getDbInstance() as any
    db.update(schema.projects).set({ archived, updatedAt: new Date() }).where(eq(schema.projects.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // REORDER: bulk update de status + sortOrder (drag/drop do Kanban)
  ipcMain.handle('projects:reorder', async (_e: unknown, params: { id: number; status: string; sortOrder: number }[]) => {
    const db = getDbInstance() as any
    const now = new Date()
    for (const item of params) {
      db.update(schema.projects).set({ status: item.status, sortOrder: item.sortOrder, updatedAt: now }).where(eq(schema.projects.id, item.id)).run()
    }
    persistDb()
    return { ok: true }
  })

  // ========== MEMBERS ==========
  ipcMain.handle('project_members:list', (_e: unknown, projectId: number) => listByProjectId(schema.projectMembers, projectId))
  ipcMain.handle('project_members:add', async (_e: unknown, projectId: number, member: any) => addByProjectId(schema.projectMembers, projectId, member, persistDb))
  ipcMain.handle('project_members:remove', async (_e: unknown, id: number) => removeById(schema.projectMembers, id, persistDb))

  // ========== TAGS ==========
  ipcMain.handle('project_tags:list', (_e: unknown, projectId: number) => listByProjectId(schema.projectTags, projectId))
  ipcMain.handle('project_tags:add', async (_e: unknown, projectId: number, tag: any) => addByProjectId(schema.projectTags, projectId, tag, persistDb))
  ipcMain.handle('project_tags:remove', async (_e: unknown, id: number) => removeById(schema.projectTags, id, persistDb))

  // ========== COMMENTS ==========
  ipcMain.handle('project_comments:list', (_e: unknown, projectId: number) => {
    const db = getDbInstance() as any
    return db.select().from(schema.projectComments).where(eq(schema.projectComments.projectId, projectId)).orderBy(schema.projectComments.createdAt).all()
  })
  ipcMain.handle('project_comments:add', async (_e: unknown, projectId: number, content: string, author = 'You') => {
    const db = getDbInstance() as any
    const result = db.insert(schema.projectComments).values({ projectId, content, author, createdAt: new Date() }).returning().get()
    persistDb()
    return result
  })
  ipcMain.handle('project_comments:delete', async (_e: unknown, id: number) => removeById(schema.projectComments, id, persistDb))

  // ========== SUBITEMS ==========
  ipcMain.handle('project_subitems:list', (_e: unknown, projectId: number) => {
    const db = getDbInstance() as any
    return db.select().from(schema.projectSubitems).where(eq(schema.projectSubitems.projectId, projectId)).orderBy(schema.projectSubitems.sortOrder).all()
  })
  ipcMain.handle('project_subitems:add', async (_e: unknown, projectId: number, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.projectSubitems).values({ ...data, projectId, createdAt: new Date() }).returning().get()
    persistDb()
    return result
  })
  ipcMain.handle('project_subitems:update', async (_e: unknown, id: number, data: any) => {
    const db = getDbInstance() as any
    const result = db.update(schema.projectSubitems).set(data).where(eq(schema.projectSubitems.id, id)).returning().get()
    persistDb()
    return result
  })
  ipcMain.handle('project_subitems:delete', async (_e: unknown, id: number) => removeById(schema.projectSubitems, id, persistDb))
}
