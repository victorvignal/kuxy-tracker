// KUXY main process — leads module
// CRUD de leads + integração YouTube Data API v3.

import { ipcMain } from 'electron'
import { and, eq, desc } from 'drizzle-orm'
import { getDbInstance } from '../db'
import { registerCrud } from './registerCrud'
import { getYouTubeApiKey, mockYouTubeResults, deriveCategory, scoreFromKeywords } from '../youtube'
import * as schema from '../../shared/schema'

export function registerLeads(persistDb: () => void): void {
  // Custom list (orderBy score desc, não id)
  ipcMain.handle('leads:list', (_e: unknown, params: { profileId?: number; includeArchived?: boolean } = {}) => {
    const db = getDbInstance() as any
    const conds: any[] = []
    if (params.profileId) conds.push(eq(schema.leads.profileId, params.profileId))
    if (!params.includeArchived) conds.push(eq(schema.leads.archived, false))
    const where = conds.length ? and(...conds) : undefined
    return db.select().from(schema.leads).where(where).orderBy(desc(schema.leads.score)).all()
  })

  // Custom create (seta createdAt/updatedAt explicitamente)
  ipcMain.handle('leads:create', async (_e: unknown, data: any) => {
    const db = getDbInstance() as any
    const result = db.insert(schema.leads).values({ ...data, createdAt: new Date(), updatedAt: new Date() }).returning().get()
    persistDb()
    return result
  })

  // Custom update (seta updatedAt)
  ipcMain.handle('leads:update', async (_e: unknown, id: number, data: any) => {
    const db = getDbInstance() as any
    const result = db.update(schema.leads).set({ ...data, updatedAt: new Date() }).where(eq(schema.leads.id, id)).returning().get()
    persistDb()
    return result
  })

  // archive + delete padrão via registerCrud
  registerCrud({
    prefix: 'leads',
    table: schema.leads,
    hasUpdatedAt: false, // já fazemos update custom
    persistDb,
    skipList: true, // já fazemos list custom (com orderBy score desc)
    skipCreate: true, // já fazemos create custom (com createdAt/updatedAt explicito)
    skipUpdate: true, // já fazemos update custom (com updatedAt explicito)
    skipDelete: true, // pulamos e re-registramos abaixo pra ficar explicito
  })
  // substituímos o delete que pulamos acima
  ipcMain.handle('leads:delete', async (_e: unknown, id: number) => {
    const db = getDbInstance() as any
    db.delete(schema.leads).where(eq(schema.leads.id, id)).run()
    persistDb()
    return { ok: true }
  })

  // ========== YOUTUBE DATA API v3 ==========
  // Se tem key configurada em ~/.kuxy/config.json → chamada real.
  // Sem key → retorna fallback mock (não bloqueia a UI).
  ipcMain.handle('youtube:search', async (_e: unknown, params: { q: string; region?: string; maxResults?: number }) => {
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
          country?: string
          thumbnails?: { default?: { url: string } }
        }
      }> }

      // segunda chamada: channel statistics pra pegar subscriber count
      const channelIds = (data.items || []).map((it) => it.id.channelId).filter(Boolean)
      let statsMap: Record<string, { subscribers: number; videoCount: number }> = {}
      if (channelIds.length) {
        const statsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
        statsUrl.searchParams.set('part', 'statistics')
        channelIds.forEach((id) => statsUrl.searchParams.append('id', id))
        statsUrl.searchParams.set('key', key)
        const statsRes = await fetch(statsUrl.toString())
        if (statsRes.ok) {
          const statsData = await statsRes.json() as { items?: Array<{ id: string, statistics: { subscriberCount?: string, videoCount?: string } }> }
          for (const ch of statsData.items || []) {
            statsMap[ch.id] = {
              subscribers: parseInt(ch.statistics.subscriberCount || '0', 10),
              videoCount: parseInt(ch.statistics.videoCount || '0', 10)
            }
          }
        }
      }

      const items = (data.items || []).map((it) => {
        const stats = statsMap[it.id.channelId] || { subscribers: 0, videoCount: 0 }
        const description = it.snippet.description || ''
        return {
          externalId: it.id.channelId,
          name: it.snippet.title,
          handle: '@' + it.snippet.title.replace(/\s+/g, '').toLowerCase(),
          avatarUrl: it.snippet.thumbnails?.default?.url || '',
          region: it.snippet.country || params.region || '',
          category: deriveCategory(description),
          followers: stats.subscribers,
          score: scoreFromKeywords(description, params.q)
        }
      })

      return { ok: true as const, items }
    } catch (e: any) {
      return { ok: false as const, reason: 'network_error' as const, message: e?.message || String(e) }
    }
  })

  ipcMain.handle('youtube:hasKey', () => !!getYouTubeApiKey())
}
