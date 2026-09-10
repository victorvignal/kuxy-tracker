// KUXY renderer hook — useOutreach
// Hook pra ler/criar/atualizar outreach (mensagens de prospecção).

import { useEffect, useState, useCallback } from 'react'
import { useT } from '../lib/i18n'

type OutreachRow = {
  id: number
  profileId: number
  leadId: number | null
  contactId: number | null
  type: string
  recipientName: string
  recipientHandle: string | null
  subject: string | null
  content: string
  status: 'draft' | 'queued' | 'sent' | 'replied' | 'no_reply' | 'bounced'
  sentAt: number | null
  repliedAt: number | null
  notes: string | null
  archived: boolean
  createdAt: number
  updatedAt: number
}

export function useOutreach(profileId?: number) {
  const t = useT()
  const [items, setItems] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!window.api?.outreach) return
    setLoading(true)
    setError(null)
    try {
      const params: { profileId?: number; includeArchived?: boolean } = {}
      if (profileId !== undefined) params.profileId = profileId
      const data = await window.api.outreach.list(params)
      setItems(data ?? [])
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (data: {
      recipientName: string
      recipientHandle?: string
      type?: 'email' | 'whatsapp' | 'dm' | 'call' | 'other'
      subject?: string
      content: string
      notes?: string
    }) => {
      if (!window.api?.outreach) throw new Error('api not available')
      const payload: any = {
        profileId,
        type: 'email',
        status: 'draft',
        ...data,
      }
      const row = await window.api.outreach.create(payload)
      await refresh()
      return row
    },
    [profileId, refresh]
  )

  const update = useCallback(
    async (id: number, data: Record<string, any>) => {
      if (!window.api?.outreach) throw new Error('api not available')
      const row = await window.api.outreach.update(id, data)
      await refresh()
      return row
    },
    [refresh]
  )

  const archive = useCallback(
    async (id: number, archived = true) => {
      if (!window.api?.outreach) throw new Error('api not available')
      const result = await window.api.outreach.archive(id, archived)
      await refresh()
      return result
    },
    [refresh]
  )

  const deleteRow = useCallback(
    async (id: number) => {
      if (!window.api?.outreach) throw new Error('api not available')
      const result = await window.api.outreach.delete(id)
      await refresh()
      return result
    },
    [refresh]
  )

  const markSent = useCallback(
    async (id: number) => {
      if (!window.api?.outreach) throw new Error('api not available')
      const row = await window.api.outreach.markSent(id)
      await refresh()
      return row
    },
    [refresh]
  )

  const markReplied = useCallback(
    async (id: number) => {
      if (!window.api?.outreach) throw new Error('api not available')
      const row = await window.api.outreach.markReplied(id)
      await refresh()
      return row
    },
    [refresh]
  )

  return {
    items,
    loading,
    error,
    refresh,
    create,
    update,
    archive,
    delete: deleteRow,
    markSent,
    markReplied,
    t,
  }
}
