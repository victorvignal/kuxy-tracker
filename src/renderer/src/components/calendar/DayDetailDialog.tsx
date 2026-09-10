// KUXY renderer — DayDetailDialog
// Dialog que abre quando clica num dia do Calendar.
// Lista os hábitos do dia + botão "Toggle" pra cada um.

import { useState, useMemo } from 'react'
import { Check, Plus } from 'lucide-react'
import { useCompletions } from '../../hooks/useCompletions'

type Habit = {
  id: number
  name: string
  icon: string
  color: string
  archived: boolean
}

export function DayDetailDialog({
  date, // 'YYYY-MM-DD'
  habits,
  profileId,
  onClose,
}: {
  date: string
  habits: Habit[]
  profileId: number
  onClose: () => void
}) {
  const year = date.slice(0, 4)
  const month = date.slice(5, 7)
  const day = date.slice(8, 10)

  const { items, toggle, loading } = useCompletions(profileId, { from: date, to: date })

  // mapa: habitId → count do dia
  const completed = useMemo(() => {
    const m = new Map<number, number>()
    for (const c of items) m.set(c.habitId, (m.get(c.habitId) ?? 0) + c.count)
    return m
  }, [items])

  const habitsAtivos = habits.filter((h) => !h.archived)

  const [pending, setPending] = useState<number | null>(null)

  async function handleToggle(habitId: number) {
    setPending(habitId)
    try {
      await toggle(habitId, date)
    } finally {
      setPending(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="card max-w-md w-full p-5"
        style={{ background: 'var(--color-bg-elevated, #141416)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">
              {day}/{month}/{year}
            </h3>
            <p className="text-xs text-text-subtle mt-0.5">
              {habitsAtivos.length} {habitsAtivos.length === 1 ? 'hábito ativo' : 'hábitos ativos'}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1 rounded text-text-muted hover:text-text">
            ✕
          </button>
        </div>

        {habitsAtivos.length === 0 ? (
          <div className="py-8 text-center text-text-subtle text-sm">
            Nenhum hábito ativo. Cria um hábito primeiro.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
            {habitsAtivos.map((h) => {
              const count = completed.get(h.id) ?? 0
              const isPending = pending === h.id
              return (
                <button
                  key={h.id}
                  onClick={() => handleToggle(h.id)}
                  disabled={isPending || loading}
                  className="flex items-center gap-3 p-2.5 rounded-lg border transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: count > 0 ? `${h.color}22` : 'transparent',
                    borderColor: count > 0 ? `${h.color}55` : 'var(--color-border, #232327)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${h.color}33` }}
                  >
                    {count > 0 ? (
                      <Check size={14} color={h.color} strokeWidth={2.5} />
                    ) : (
                      <Plus size={14} color={h.color} strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--color-text, #f4f4f6)' }}>
                      {h.name}
                    </div>
                    <div className="text-[10px] text-text-subtle">
                      {count === 0 ? 'Não feito' : count === 1 ? '1x' : `${count}x`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-[11px] text-text-subtle">
            Clica num hábito pra toggle.
          </p>
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
