import { Target, Calendar } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'

/**
 * Goals (Profissional) — metas de negócio com anéis KPI + timeline de marcos.
 *
 * Template "Goals" do `Tempo Dashboard.dc.html`:
 *   - Hero do objetivo anual (anel grande)
 *   - 4 anéis de KPI (Retention / Receita por cliente / Tempo de resposta / NPS)
 *   - Lista de metas ativas (com semáforo: on-track / at-risk / late)
 *   - Timeline de marcos (milestones)
 */

type Goal = {
  id: string
  title: string
  current: number
  target: number
  unit: string
  status: 'on-track' | 'at-risk' | 'late'
  due: string
}

const GOALS: Goal[] = [
  { id: '1', title: 'Faturamento Q3', current: 84, target: 100, unit: 'k', status: 'on-track', due: '30 set' },
  { id: '2', title: 'Clientes ativos', current: 12, target: 20, unit: '', status: 'at-risk', due: '31 dez' },
  { id: '3', title: 'Vídeos Short', current: 18, target: 30, unit: '', status: 'on-track', due: '31 ago' },
  { id: '4', title: 'Vídeos Longform', current: 4, target: 10, unit: '', status: 'late', due: '30 set' },
  { id: '5', title: 'NPS Score', current: 72, target: 80, unit: '', status: 'on-track', due: '31 dez' }
]

const STATUS_TONE = {
  'on-track': { tone: 'success' as const, label: 'No prazo' },
  'at-risk': { tone: 'warning' as const, label: 'Em risco' },
  late: { tone: 'danger' as const, label: 'Atrasado' }
}

type Milestone = { date: string; label: string; done: boolean }

const MILESTONES: Milestone[] = [
  { date: '15 jun', label: 'Lançamento canal Northwind', done: true },
  { date: '22 jun', label: '100k seguidores Brightline', done: true },
  { date: '30 jun', label: 'Vídeo #14 finalizado', done: false },
  { date: '15 jul', label: 'Meta de receita Q3 50%', done: false },
  { date: '31 jul', label: 'Cliente #20 assinado', done: false }
]

const KPIS = [
  { label: 'Client Retention', value: '94%', color: '#8b5cf6', note: 'Last 12 months' },
  { label: 'Revenue per Client', value: 'R$ 1.15k', color: '#4ade80', note: 'Monthly average' },
  { label: 'Avg Response Time', value: '2.3h', color: '#a78bfa', note: 'Support tickets' },
  { label: 'NPS Score', value: '72', color: '#6d4ee0', note: 'Last quarter' }
]

export function Goals() {
  // Goal anual (hero): Receita 2026
  const yearGoalPct = 56

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Hero goal */}
        <Card className="mb-4" padding="26px 28px">
          <div className="flex items-center gap-6">
            <div className="relative" style={{ width: 140, height: 140 }}>
              <svg viewBox="0 0 120 120" style={{ width: 140, height: 140, transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="46" fill="none" stroke="#1d1d20" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="url(#goal-grad)"
                  strokeWidth="12"
                  strokeDasharray={`${(yearGoalPct / 100) * 289} 289`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="goal-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6d4ee0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
                  {yearGoalPct}%
                </span>
                <span style={{ color: '#86868d', fontSize: 10 }}>de 2026</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[12px] mb-1" style={{ color: '#a78bfa' }}>OBJETIVO ANUAL</div>
              <div className="text-[22px] font-bold mb-1 tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
                R$ 200.000 de faturamento
              </div>
              <div className="text-[13px] mb-3" style={{ color: '#86868d' }}>
                R$ 112.400 alcançados · R$ 87.600 restantes
              </div>
              <div className="flex items-center gap-2">
                <Pill tone="success">No prazo</Pill>
                <span className="text-[12px]" style={{ color: '#7a7a80' }}>6 meses restantes</span>
              </div>
            </div>
            <Btn variant="primary" leftIcon={<Target size={14} strokeWidth={1.75} />}>
              Editar meta
            </Btn>
          </div>
        </Card>

        {/* 4 KPIs (anéis pequenos) */}
        <div className="flex gap-[14px] mb-4">
          {KPIS.map((k, i) => (
            <Card key={i} className="flex-1" padding="16px 18px">
              <div className="flex items-center gap-3">
                <div className="relative" style={{ width: 60, height: 60 }}>
                  <svg viewBox="0 0 60 60" style={{ width: 60, height: 60, transform: 'rotate(-90deg)' }}>
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#1d1d20" strokeWidth="6" />
                    <circle
                      cx="30"
                      cy="30"
                      r="22"
                      fill="none"
                      stroke={k.color}
                      strokeWidth="6"
                      strokeDasharray={`${(parseFloat(k.value) / 100) * 138} 138`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold" style={{ color: '#f4f4f6' }}>{k.value}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: '#e8e8ea' }}>{k.label}</div>
                  <div className="text-[11px]" style={{ color: '#7a7a80' }}>{k.note}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Metas ativas + Timeline */}
        <div className="flex gap-[14px] items-stretch">
          {/* Lista de metas */}
          <Card className="flex-1" padding="18px 20px">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Metas ativas</span>
              <span className="ml-auto text-[11px]" style={{ color: '#7a7a80' }}>{GOALS.length} no total</span>
            </div>
            <div className="flex flex-col">
              {GOALS.map((g, i) => {
                const { tone, label } = STATUS_TONE[g.status]
                const pct = Math.min(100, Math.round((g.current / g.target) * 100))
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 py-3 px-2 hover:opacity-90 transition-opacity"
                    style={{ borderBottom: i < GOALS.length - 1 ? '1px solid #161618' : 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate" style={{ color: '#f0f0f2' }}>{g.title}</div>
                      <div className="text-[11px]" style={{ color: '#7a7a80' }}>
                        {g.current}{g.unit} de {g.target}{g.unit} · vence {g.due}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[100px] h-1.5 rounded-full overflow-hidden" style={{ background: '#1d1d20' }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${pct}%`,
                            background: tone === 'success' ? '#4ade80' : tone === 'warning' ? '#fbbf24' : '#f87171',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-bold w-[36px] text-right" style={{ color: '#f4f4f6' }}>
                        {pct}%
                      </span>
                      <Pill tone={tone} dot={false}>{label}</Pill>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Timeline de marcos */}
          <Card className="flex-1" padding="18px 20px">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Marcos</span>
            </div>
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-2 bottom-2 w-px" style={{ background: '#232327' }} />
              {MILESTONES.map((m, i) => (
                <div key={i} className="relative flex items-start gap-3 mb-3 last:mb-0">
                  <span
                    className="absolute -left-[14px] top-1 w-3 h-3 rounded-full"
                    style={{
                      background: m.done ? '#8b5cf6' : '#0a0a0b',
                      border: `2px solid ${m.done ? '#8b5cf6' : '#3a3a3e'}`
                    }}
                  />
                  <div className="flex-1 ml-3">
                    <div className="text-[11px]" style={{ color: '#7a7a80' }}>{m.date}</div>
                    <div
                      className="text-[13px]"
                      style={{ color: m.done ? '#86868d' : '#f0f0f2', textDecoration: m.done ? 'line-through' : 'none' }}
                    >
                      {m.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}