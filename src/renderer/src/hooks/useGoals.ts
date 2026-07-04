import { useEffect, useState, useCallback } from 'react'
import { useProfileStore } from '../store/useProfile'

export type GoalType = 'revenue' | 'clients' | 'videos' | 'rate' | 'custom'
export type GoalPeriod = 'month' | 'quarter' | 'year'
export type GoalStatus = 'on_track' | 'at_risk' | 'overdue' | 'done'

export type Goal = {
  id: number
  profileId: number
  name: string
  type: GoalType
  target: number
  current: number
  period: GoalPeriod
  deadline: string | null
  status: GoalStatus
  icon: string | null
  color: string
  archived: boolean
  createdAt: string | number
  updatedAt: string | number
}

export type GoalInput = Omit<Goal, 'id' | 'archived' | 'createdAt' | 'updatedAt'>

/**
 * Hook CRUD de goals (metas), filtrado pelo perfil ativo.
 * Espelha useContacts/useLeads — mesmo padrão, separados pra evoluir independente.
 */
export function useGoals() {
  const activeProfile = useProfileStore((s) => s.getActive())
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!activeProfile) {
      setGoals([])
      setLoading(false)
      return
    }
    setLoading(true)
    const list = (await window.api.goals.list({ profileId: activeProfile.id })) as Goal[]
    setGoals(list)
    setLoading(false)
  }, [activeProfile?.id])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: Omit<GoalInput, 'profileId'>) => {
      const result = await window.api.goals.create({
        ...input,
        profileId: activeProfile!.id
      } as GoalInput & { profileId: number })
      await reload()
      return result
    },
    [activeProfile?.id, reload]
  )

  const update = useCallback(
    async (id: number, data: Partial<GoalInput>) => {
      const result = await window.api.goals.update(id, data)
      await reload()
      return result
    },
    [reload]
  )

  const archive = useCallback(
    async (id: number, archived = true) => {
      await window.api.goals.archive(id, archived)
      await reload()
    },
    [reload]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.api.goals.delete(id)
      await reload()
    },
    [reload]
  )

  return { goals, loading, reload, create, update, archive, remove }
}

export type MilestoneStatus = 'on_track' | 'at_risk' | 'overdue' | 'done'

export type Milestone = {
  id: number
  goalId: number
  label: string
  target: number
  current: number
  deadline: string | null
  achievedAt: string | null
  status: MilestoneStatus
  createdAt: string | number
}

export type MilestoneInput = Omit<Milestone, 'id' | 'createdAt' | 'achievedAt'>

/**
 * Hook CRUD de milestones (sub-metas dentro de um goal).
 * Filtra por goalId pra UI efficiency.
 */
export function useMilestones(goalId?: number) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const list = (await window.api.milestones.list({ goalId })) as Milestone[]
    setMilestones(list)
    setLoading(false)
  }, [goalId])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: MilestoneInput) => {
      const result = await window.api.milestones.create(input)
      await reload()
      return result
    },
    [reload]
  )

  const update = useCallback(
    async (id: number, data: Partial<MilestoneInput>) => {
      const result = await window.api.milestones.update(id, data)
      await reload()
      return result
    },
    [reload]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.api.milestones.delete(id)
      await reload()
    },
    [reload]
  )

  return { milestones, loading, reload, create, update, remove }
}