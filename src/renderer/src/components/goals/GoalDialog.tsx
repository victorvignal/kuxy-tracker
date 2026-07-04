import { useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import type { Goal, GoalType, GoalPeriod, GoalStatus } from '../../hooks/useGoals'

const COLORS = [
  '#a78bfa', '#22d3ee', '#4ade80', '#fbbf24', '#f472b6', '#60a5fa', '#fb923c', '#a3e635'
]

const TYPE_OPTIONS: { v: GoalType; icon: string }[] = [
  { v: 'revenue', icon: '💰' },
  { v: 'clients', icon: '👥' },
  { v: 'videos', icon: '🎬' },
  { v: 'rate', icon: '📈' },
  { v: 'custom', icon: '⭐' }
]

const PERIOD_OPTIONS: GoalPeriod[] = ['month', 'quarter', 'year']
const STATUS_OPTIONS: GoalStatus[] = ['on_track', 'at_risk', 'overdue', 'done']

interface Props {
  goal: Goal | null
  profileId: number
  onClose: () => void
  onSubmit: (data: Omit<Goal, 'id' | 'archived' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

/**
 * Modal de criar/editar meta. Extraído de Goals.tsx pra seguir o
 * mesmo padrão dos outros Dialogs (ContactDialog, etc).
 */
export function GoalDialog({ goal, profileId, onClose, onSubmit }: Props) {
  const t = useT()
  const [name, setName] = useState(goal?.name ?? '')
  const [type, setType] = useState<GoalType>(goal?.type ?? 'custom')
  const [target, setTarget] = useState(goal?.target ?? 0)
  const [current, setCurrent] = useState(goal?.current ?? 0)
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? 'month')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? 'on_track')
  const [color, setColor] = useState(goal?.color ?? '#a78bfa')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        profileId,
        name: name.trim(),
        type,
        target: Number(target) || 0,
        current: Number(current) || 0,
        period,
        deadline: deadline || null,
        status,
        icon: null,
        color
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-scrim)' }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-3 shadow-pop"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {goal ? t('goals.edit') : t('goals.new')}
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.name')} *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.type')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GoalType)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.icon} {t(`goals.types.${o.v}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.period')}</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {t(`goals.period.${p}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.target')}</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.current')}</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(parseInt(e.target.value) || 0)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.deadline')}</label>
            <input
              type="date"
              value={deadline ?? ''}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalStatus)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`goals.status.${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('goals.fields.color')}</label>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-text scale-110' : 'border-transparent'}`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn btn-primary flex-1"
          >
            {saving ? t('common.loading') : goal ? t('common.save') : t('goals.new')}
          </button>
        </div>
      </form>
    </div>
  )
}