import { useState, useMemo } from 'react'
import {
  Trophy,
  Plus,
  TrendingUp,
  DollarSign,
  UserPlus,
  Video,
  Percent,
  Target,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { useT } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import { useGoals, useMilestones, type Goal, type GoalType, type GoalStatus } from '../hooks/useGoals'
import { GoalDialog } from '../components/goals/GoalDialog'

/**
 * Goals page (v0.11.0) — réplica do design Figma.
 *
 * Layout:
 *  - Top: hero "OBJETIVO DO ANO" (anel grande + valor + faltam + countdown)
 *  - 4 KPI cards do mês: Faturamento / Clientes / Vídeos / Taxa
 *  - Metas ativas: cards com barra de progresso + status + countdown
 *  - Marcos lateral: cards com check
 *
 * Sem auto-tracking no MVP — `current` é manual via dialog de edição.
 * Seeding inicial popula 4 goals padrão por profile (no db.ts).
 */

const TYPE_ICONS: Record<GoalType, typeof Trophy> = {
  revenue: DollarSign,
  clients: UserPlus,
  videos: Video,
  rate: Percent,
  custom: Target
}

const TYPE_COLORS: Record<GoalType, string> = {
  revenue: '#a78bfa',
  clients: '#22d3ee',
  videos: '#4ade80',
  rate: '#fbbf24',
  custom: '#a78bfa'
}

const STATUS_STYLES: Record<GoalStatus, { bg: string; fg: string; label: string }> = {
  on_track: { bg: 'rgba(74, 222, 128, 0.15)', fg: '#4ade80', label: 'goals.status.on_track' },
  at_risk: { bg: 'rgba(251, 191, 36, 0.15)', fg: '#fbbf24', label: 'goals.status.at_risk' },
  overdue: { bg: 'rgba(248, 113, 113, 0.15)', fg: '#f87171', label: 'goals.status.overdue' },
  done: { bg: 'rgba(74, 222, 128, 0.15)', fg: '#4ade80', label: 'goals.status.done' }
}

function formatNumber(n: number, type: GoalType): string {
  if (type === 'revenue') {
    return `R$ ${n.toLocaleString('pt-BR')}`
  }
  if (type === 'rate') return `${n}%`
  return n.toLocaleString('pt-BR')
}

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const target = new Date(deadline)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatRemaining(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d atrasado`
  if (days === 0) return 'hoje'
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months} ${months === 1 ? 'mês' : 'meses'}`
}

export function Goals() {
  const t = useT()
  const active = useProfileStore((s) => s.getActive())
  const { goals, loading, create, update } = useGoals()
  const [editing, setEditing] = useState<Goal | null>(null)
  const [creating, setCreating] = useState(false)

  // Pega o goal "Objetivo do ano" (type=revenue, period=year)
  const yearlyGoal = useMemo(
    () => goals.find((g) => g.period === 'year' && g.type === 'revenue'),
    [goals]
  )

  // 4 KPIs mensais (Faturamento / Clientes / Vídeos / Taxa)
  const monthlyKpis = useMemo(
    () => goals.filter((g) => g.period === 'month').slice(0, 4),
    [goals]
  )

  // Metas ativas — só as mensais (mesma lista dos KPIs mas em formato card)
  const activeGoals = monthlyKpis

  // Marcos: pega os milestones de cada monthly goal
  const { milestones: allMilestones } = useMilestones()

  const handleSubmit = async (data: Omit<Goal, 'id' | 'archived' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create(data)
    }
    setCreating(false)
    setEditing(null)
  }

  if (loading && goals.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-text-muted text-sm">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Top: título + tabs de período + botão Nova meta */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] font-semibold tracking-[-.01em]">{t('goals.title')}</h1>
          <Btn
            variant="primary"
            leftIcon={<Plus size={14} strokeWidth={1.75} />}
            onClick={() => setCreating(true)}
          >
            {t('goals.new')}
          </Btn>
        </div>

        {/* Hero "OBJETIVO DO ANO" */}
        {yearlyGoal && (
          <Card className="mb-4 p-5">
            <div className="flex items-center gap-6">
              <ProgressRing
                value={yearlyGoal.current}
                target={yearlyGoal.target}
                color={TYPE_COLORS[yearlyGoal.type]}
                size={140}
                strokeWidth={14}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Trophy size={14} color={TYPE_COLORS[yearlyGoal.type]} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TYPE_COLORS[yearlyGoal.type] }}>
                    {t('goals.yearly_goal')}
                  </span>
                </div>
                <div className="text-[36px] font-bold tracking-[-.02em] leading-none mb-1.5">
                  {formatNumber(yearlyGoal.current, yearlyGoal.type)}
                </div>
                <div className="text-[12px] text-text-muted mb-3">
                  de {formatNumber(yearlyGoal.target, yearlyGoal.type)}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                  style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a78bfa' }}>
                  <Clock size={11} />
                  {t('goals.remaining', { value: formatRemaining(daysUntil(yearlyGoal.deadline)) })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 4 KPIs mensais */}
        {monthlyKpis.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {monthlyKpis.map((goal) => (
              <KPICard key={goal.id} goal={goal} onUpdate={(current) => update(goal.id, { current })} />
            ))}
          </div>
        )}

        {/* Empty state se sem goals */}
        {goals.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <Target className="w-10 h-10 text-text-subtle mx-auto mb-3" />
            <p className="text-sm text-text-muted max-w-md mx-auto mb-4">{t('goals.empty')}</p>
            <Btn variant="primary" onClick={() => setCreating(true)} leftIcon={<Plus size={14} />}>
              {t('goals.new')}
            </Btn>
          </Card>
        )}

        {/* Metas ativas + Marcos (split) */}
        {activeGoals.length > 0 && (
          <div className="flex gap-4">
            {/* Metas ativas */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} color="#a78bfa" />
                <h2 className="text-[14px] font-semibold">{t('goals.active_goals')}</h2>
                <span className="text-[12px] text-text-muted">· {t('goals.active_goals_subtitle')}</span>
              </div>
              <div className="flex flex-col gap-2">
                {activeGoals.map((goal) => (
                  <ActiveGoalCard key={goal.id} goal={goal} onEdit={() => setEditing(goal)} />
                ))}
              </div>
            </div>

            {/* Marcos lateral */}
            {allMilestones.length > 0 && (
              <div className="w-[280px] shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={14} color="#a78bfa" />
                  <h2 className="text-[14px] font-semibold">{t('goals.milestones')}</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {allMilestones.map((m) => (
                    <MilestoneCard key={m.id} milestone={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(creating || editing) && active && (
        <GoalDialog
          goal={editing}
          profileId={active.id}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

/** Anel de progresso SVG (sem libs externas). */
function ProgressRing({
  value,
  target,
  color,
  size = 120,
  strokeWidth = 10
}: {
  value: number
  target: number
  color: string
  size?: number
  strokeWidth?: number
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f1f22" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[28px] font-bold leading-none" style={{ color }}>
            {Math.round(pct)}%
          </div>
          <div className="text-[10px] text-text-muted mt-1">do ano</div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ goal, onUpdate }: { goal: Goal; onUpdate: (current: number) => void }) {
  const t = useT()
  const Icon = TYPE_ICONS[goal.type] ?? Target
  const color = TYPE_COLORS[goal.type] ?? '#a78bfa'
  const days = daysUntil(goal.deadline)

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon size={14} color={color} strokeWidth={2} />
        </div>
        <div className="text-[12px] text-text-muted truncate">{goal.name}</div>
      </div>
      <div className="flex items-end gap-1.5">
        <div className="text-[20px] font-bold leading-none" style={{ color }}>
          {formatNumber(goal.current, goal.type)}
        </div>
        <div className="text-[11px] text-text-muted pb-0.5">
          / meta {formatNumber(goal.target, goal.type)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ProgressRing value={goal.current} target={goal.target} color={color} size={56} strokeWidth={6} />
        <input
          type="number"
          value={goal.current}
          onChange={(e) => onUpdate(Math.max(0, parseInt(e.target.value) || 0))}
          className="flex-1 bg-bg-subtle border border-border rounded-md px-2 py-1 text-xs text-right focus:outline-none focus:border-accent"
        />
      </div>
      {days !== null && days >= 0 && (
        <div className="text-[10px] text-text-muted">
          {t('goals.remaining', { value: formatRemaining(days) })}
        </div>
      )}
    </div>
  )
}

function ActiveGoalCard({ goal, onEdit }: { goal: Goal; onEdit: () => void }) {
  const t = useT()
  const Icon = TYPE_ICONS[goal.type] ?? Target
  const color = TYPE_COLORS[goal.type] ?? '#a78bfa'
  const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
  const days = daysUntil(goal.deadline)
  const status = STATUS_STYLES[goal.status]
  const Icon2 = goal.status === 'on_track' || goal.status === 'done' ? Check : AlertTriangle

  return (
    <div className="card p-3 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={onEdit}>
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={16} color={color} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[13px] font-semibold truncate">{goal.name}</div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ background: status.bg, color: status.fg }}
            >
              <Icon2 size={9} />
              {t(status.label)}
            </span>
            {days !== null && days >= 0 && (
              <span className="text-[10px] text-text-muted inline-flex items-center gap-0.5">
                <Clock size={9} />
                {days}d
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1d1d20' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: color, transition: 'width 0.4s ease' }}
            />
          </div>
          <span className="text-[10px] font-semibold text-text-muted shrink-0">
            {formatNumber(goal.current, goal.type)} / {formatNumber(goal.target, goal.type)}
          </span>
        </div>
      </div>
    </div>
  )
}

function MilestoneCard({ milestone }: { milestone: { id: number; label: string; status: string; current: number; target: number; deadline: string | null; achievedAt: string | null } }) {
  const achieved = !!milestone.achievedAt
  return (
    <div className="card p-3 flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: achieved ? 'rgba(74, 222, 128, 0.2)' : 'rgba(168, 85, 247, 0.1)',
          color: achieved ? '#4ade80' : '#a78bfa'
        }}
      >
        {achieved ? <Check size={14} strokeWidth={2.5} /> : <span className="text-[10px] font-bold">{Math.round((milestone.current / Math.max(1, milestone.target)) * 100)}%</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[12px] font-semibold leading-tight ${achieved ? 'line-through text-text-muted' : ''}`}>
          {milestone.label}
        </div>
        {milestone.deadline && (
          <div className="text-[10px] text-text-muted mt-0.5">
            {new Date(milestone.deadline).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  )
}