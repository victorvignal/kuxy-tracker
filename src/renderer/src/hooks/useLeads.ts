import { useEffect, useState, useCallback } from 'react'
import { useProfileStore } from '../store/useProfile'

export type LeadStatus = 'new' | 'contacted' | 'replied' | 'converted' | 'rejected'

export type Lead = {
  id: number
  profileId: number
  externalId: string
  source: string
  name: string
  handle: string | null
  avatarUrl: string | null
  region: string | null
  category: string | null
  followers: number
  score: number
  email: string | null
  notes: string | null
  status: LeadStatus
  archived: boolean
  createdAt: string | number
  updatedAt: string | number
}

export type LeadInput = Omit<Lead, 'id' | 'archived' | 'createdAt' | 'updatedAt'>

/**
 * Hook CRUD de leads (prospecção), filtrado pelo perfil ativo.
 * Espelha useContacts — mesmo padrão, separados pra evoluir independente.
 */
export function useLeads() {
  const activeProfile = useProfileStore((s) => s.getActive())
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!activeProfile) {
      setLeads([])
      setLoading(false)
      return
    }
    setLoading(true)
    const list = (await window.api.leads.list({ profileId: activeProfile.id })) as Lead[]
    setLeads(list)
    setLoading(false)
  }, [activeProfile?.id])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: Omit<LeadInput, 'profileId'>) => {
      const result = await window.api.leads.create({
        ...input,
        profileId: activeProfile!.id
      } as LeadInput & { profileId: number })
      await reload()
      return result
    },
    [activeProfile?.id, reload]
  )

  const update = useCallback(
    async (id: number, data: Partial<LeadInput>) => {
      const result = await window.api.leads.update(id, data)
      await reload()
      return result
    },
    [reload]
  )

  const archive = useCallback(
    async (id: number, archived = true) => {
      await window.api.leads.archive(id, archived)
      await reload()
    },
    [reload]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.api.leads.delete(id)
      await reload()
    },
    [reload]
  )

  return { leads, loading, reload, create, update, archive, remove }
}