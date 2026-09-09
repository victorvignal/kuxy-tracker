import { useEffect, useState, useCallback } from 'react'
import { useProfileStore } from '../store/useProfile'

export type QueueItem = {
  id: number
  profileId: number
  client: string
  video: string
  priority: 'high' | 'med' | 'low'
  dueDate: string | null
  position: number
  archived: boolean
  /** JSON array of 4 booleans: [corte, sound, color, export] */
  stepsJson: string
  notes: string | null
  createdAt: string | number
  updatedAt: string | number
}

export type QueueItemInput = Omit<QueueItem, 'id' | 'archived' | 'createdAt' | 'updatedAt'>

export type PomodoroSession = {
  id: number
  profileId: number
  queueItemId: number | null
  durationSec: number
  plannedSec: number
  completed: boolean
  startedAt: string | number
  endedAt: string | number
}

/**
 * Hook CRUD de queue_items (Ritmo — perfil Profissional).
 * Espelha o padrão de useLeads/useGoals. Filtra por profileId e
 * por archived=false (use { includeArchived: true } via list direto).
 */
export function useQueueItems() {
  const activeProfile = useProfileStore((s) => s.getActive())
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!activeProfile) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const list = (await window.api.queue.list({ profileId: activeProfile.id })) as QueueItem[]
    setItems(list)
    setLoading(false)
  }, [activeProfile?.id])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: Omit<QueueItemInput, 'profileId'>) => {
      const result = await window.api.queue.create({
        ...input,
        profileId: activeProfile!.id
      } as QueueItemInput & { profileId: number })
      await reload()
      return result
    },
    [activeProfile?.id, reload]
  )

  const update = useCallback(
    async (id: number, data: Partial<QueueItemInput>) => {
      const result = await window.api.queue.update(id, data)
      await reload()
      return result
    },
    [reload]
  )

  const archive = useCallback(
    async (id: number, archived = true) => {
      await window.api.queue.archive(id, archived)
      await reload()
    },
    [reload]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.api.queue.delete(id)
      await reload()
    },
    [reload]
  )

  return { items, loading, reload, create, update, archive, remove }
}

/**
 * Hook de leitura de pomodoro_sessions — usado pra heatmap, streak
 * e meta diária na página Ritmo. Não faz CRUD completo (só create
 * é exposto via api.pomodoro.create — editar/deletar sessão não faz
 * sentido no MVP).
 */
export function usePomodoroSessions(params?: { from?: number; to?: number }) {
  const activeProfile = useProfileStore((s) => s.getActive())
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!activeProfile) {
      setSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const list = (await window.api.pomodoro.list({
      profileId: activeProfile.id,
      from: params?.from,
      to: params?.to
    })) as PomodoroSession[]
    setSessions(list)
    setLoading(false)
  }, [activeProfile?.id, params?.from, params?.to])

  useEffect(() => {
    reload()
  }, [reload])

  return { sessions, loading, reload }
}