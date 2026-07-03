import { useEffect, useState, useCallback } from 'react'
import { useProfileStore } from '../store/useProfile'

export type ContactStatus = 'active' | 'pending' | 'inactive'
export type ContactSource = 'family' | 'friend' | 'work' | 'other'

export type Contact = {
  id: number
  profileId: number
  name: string
  email: string | null
  phone: string | null
  color: string
  status: ContactStatus
  source: ContactSource
  notes: string | null
  archived: boolean
  createdAt: string | number
  updatedAt: string | number
}

export type ContactInput = Omit<Contact, 'id' | 'archived' | 'createdAt' | 'updatedAt'>

/**
 * Hook CRUD de contatos, filtrado pelo perfil ativo.
 *
 * Padrão idêntico ao `useFinanceData`: carrega na montagem, expõe
 * setters que persistem via IPC e recarregam a lista.
 */
export function useContacts() {
  const activeProfile = useProfileStore((s) => s.getActive())
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!activeProfile) {
      setContacts([])
      setLoading(false)
      return
    }
    setLoading(true)
    const list = (await window.api.contacts.list({ profileId: activeProfile.id })) as Contact[]
    setContacts(list)
    setLoading(false)
  }, [activeProfile?.id])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: Omit<ContactInput, 'profileId'>) => {
      const result = await window.api.contacts.create({
        ...input,
        profileId: activeProfile!.id
      } as ContactInput & { profileId: number })
      await reload()
      return result
    },
    [activeProfile?.id, reload]
  )

  const update = useCallback(
    async (id: number, data: Partial<ContactInput>) => {
      const result = await window.api.contacts.update(id, data)
      await reload()
      return result
    },
    [reload]
  )

  const archive = useCallback(
    async (id: number, archived = true) => {
      await window.api.contacts.archive(id, archived)
      await reload()
    },
    [reload]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.api.contacts.delete(id)
      await reload()
    },
    [reload]
  )

  return { contacts, loading, reload, create, update, archive, remove }
}