import { useState } from 'react'
import {
  Banknote,
  Video,
  CheckCircle,
  Send,
  Wallet,
  ArrowRight,
  Plus,
  CalendarDays,
  Target,
  ChevronRight,
  Briefcase,
  LayoutGrid
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Donut } from '../components/ui/Donut'
import { Avatar } from '../components/ui/Avatar'

/**
 * Dashboard Profissional — replica 1:1 do template `Tempo Dashboard.dc.html`
 * na seção "DASHBOARD (professional)".
 *
 * Estrutura (na ordem do template):
 *   - Filter row (segmented 30d/3m/1y + Exportar + Novo roxo)
 *   - 4 KPI cards (Faturamento, Projetos ativos, Vídeos, Leads)
 *   - Receita 12 meses (área chart) + Pipeline donut (3 status)
 *   - 3 colunas: Próximas entregas / Funil outreach / Metas do mês
 *   - Tabela "Projetos recentes"
 *
 * Dados: por enquanto FIXOS (mesma estratégia do Dashboard Pessoal). Quando os
 * módulos clients/projects/outreach/goals tiverem dados reais, reconecto.
 */

const TEST_KPIS = {
  monthRevenue: { value: 'R$ 14.200', delta: '+20%', positive: true },
  activeProjects: { value: '12', delta: '3 atrasados', positive: false },
  videosDelivered: { value: '28 / 40', delta: '+6 na semana', positive: true },
  leadsActive: { value: '47', delta: 'no outreach', positive: null }
}

const PIPELINE_TOTAL = 12
const PIPELINE_SEGMENTS = [
  { value: 7, label: 'No prazo', color: '#8b5cf6' },
  { value: 3, label: 'Em andamento', color: '#a78bfa' },
  { value: 2, label: 'Atrasados', color: '#6d4ee0' }
]

const UPCOMING_DELIVERIES = [
  { day: '28', month: 'jun', name: 'Northwind', video: 'Edição 14 — Hero Film', status: 'no-prazo' },
  { day: '30', month: 'jun', name: 'Lumen Studio', video: 'Short Vertical #08', status: 'andamento' },
  { day: '02', month: 'jul', name: 'Brightline', video: 'Documentário Cap. 3', status: 'atrasado' },
  { day: '05', month: 'jul', name: 'Velasco Films', video: 'Reel Cliente Final', status: 'no-prazo' }
] as const

const FUNNEL = [
  { label: 'DMs enviadas', n: '38', width: 100, color: '#8b5cf6' },
  { label: 'Responderam', n: '14', width: 37, color: '#a78bfa' },
  { label: 'Fecharam', n: '2', width: 14, color: '#6d4ee0' }
]

const GOALS = [
  { label: 'Receita Q3', current: 64, target: 100, tone: 'success' as const },
  { label: 'Clientes ativos', current: 12, target: 20, tone: 'warning' as const },
  { label: 'Vídeos Short', current: 18, target: 30, tone: 'progress' as const }
]

const RECENT_PROJECTS = [
  { client: 'Northwind', initial: 'N', av: '#8b5cf6', video: 'Edição 14 — Hero Film', status: 'No prazo', tone: 'success' as const, due: '28 jun', progress: 80 },
  { client: 'Lumen Studio', initial: 'L', av: '#a78bfa', video: 'Short Vertical #08', status: 'Em andamento', tone: 'warning' as const, due: '30 jun', progress: 55 },
  { client: 'Brightline', initial: 'B', av: '#6d4ee0', video: 'Documentário Cap. 3', status: 'Atrasado', tone: 'danger' as const, due: '02 jul', progress: 32 },
  { client: 'Velasco Films', initial: 'V', av: '#4f4193', video: 'Reel Cliente Final', status: 'No prazo', tone: 'success' as const, due: '05 jul', progress: 90 },
  { client: 'Pixel & Co', initial: 'P', av: '#5b6b8c', video: 'Behind the Scenes', status: 'No prazo', tone: 'success' as const, due: '08 jul', progress: 70 },
  { client: 'Atlas Media', initial: 'A', av: '#7a6b9c', video: 'Trailer Festival', status: 'Em andamento', tone: 'warning' as const, due: '12 jul', progress: 45 }
]

const PERIOD_OPTIONS = [
  { value: '30', label: '30 dias' },
  { value: '3m', label: '3 meses' },
  { value: '1y', label: '12 meses' }
] as const
type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

const STATUS_COLOR: Record<string, string> = {
  'no-prazo': '#4ade80',
  andamento: '#fbbf24',
  atrasado: '#f87171'
}

export function DashboardPro() {
  const [period, setPeriod] = useState<PeriodValue>('1y')
  const [openLead, setOpenLead] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter row */}
        <div className="flex items-center justify-between mb-[18px]">
          <SegmentedControl<PeriodValue>
            options={PERIOD_OPTIONS as any}
            value={period}
            onChange={setPeriod}
          />
          <div className="flex items-center gap-[10px]">
            <Btn variant="secondary" leftIcon={<ArrowRight size={16} strokeWidth={1.75} style={{ transform: 'rotate(180deg)' }} />}>
              Exportar
            </Btn>
            <Btn variant="primary" leftIcon={<Plus size={16} strokeWidth={1.75} />} onClick={() => setOpenLead(true)}>
              Novo Lead
            </Btn>
          </div>
        </div>

        {/* KPI cards 4x1 (template: ícone em chip 38x38 #1c1c20 + valor 22/700) */}
        <div className="flex gap-[14px] mb-4">
          <ProKpi
            Icon={Banknote}
            label="Faturamento do mês"
            value={TEST_KPIS.monthRevenue.value}
            delta={TEST_KPIS.monthRevenue.delta}
            positive={TEST_KPIS.monthRevenue.positive}
          />
          <ProKpi
            Icon={Video}
            label="Projetos ativos"
            value={TEST_KPIS.activeProjects.value}
            delta={TEST_KPIS.activeProjects.delta}
            positive={TEST_KPIS.activeProjects.positive}
          />
          <ProKpi
            Icon={CheckCircle}
            label="Vídeos entregues"
            value={TEST_KPIS.videosDelivered.value}
            delta={TEST_KPIS.videosDelivered.delta}
            positive={TEST_KPIS.videosDelivered.positive}
          />
          <ProKpi
            Icon={Send}
            label="Leads ativos"
            value={TEST_KPIS.leadsActive.value}
            delta={TEST_KPIS.leadsActive.delta}
            positive={null}
          />
        </div>

        {/* Receita 12m + Pipeline donut */}
        <div className="flex gap-[14px] mb-4">
          <Card className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} color="#4ade80" strokeWidth={1.75} />
                <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                  Faturamento
                </span>
              </div>
              <span className="text-[12px]" style={{ color: '#86868d' }}>últimos 12 meses</span>
            </div>
            <div className="flex items-baseline gap-2.5 mb-0.5">
              <span className="text-[27px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
                R$ 112.400
              </span>
              <span className="text-[12.5px] font-semibold" style={{ color: '#4ade80' }}>+20%</span>
            </div>
            <div className="text-[12.5px] mb-3.5" style={{ color: '#86868d' }}>acumulado no ano</div>
            <ProRevenueChart />
            <div className="flex justify-between mt-2" style={{ fontSize: 10.5, color: '#6a6a70' }}>
              {['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </Card>

          <Card className="shrink-0 flex flex-col" style={{ width: 300 }} padding="18px 20px">
            <div className="flex items-center gap-2 mb-[18px]">
              <LayoutGrid size={16} color="#a78bfa" />
              <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                Pipeline de projetos
              </span>
            </div>
            <div className="flex items-center gap-5 mb-[18px]">
              <div className="relative w-[108px] h-[108px] shrink-0">
                <Donut segments={PIPELINE_SEGMENTS} size={108} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-bold leading-none" style={{ color: '#f4f4f6' }}>
                    {PIPELINE_TOTAL}
                  </span>
                  <span className="text-[9px] mt-0.5" style={{ color: '#86868d' }}>projetos</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {PIPELINE_SEGMENTS.map((s, i) => (
                  <div key={i} className="flex items-center gap-[9px]">
                    <span className="w-[3px] h-[14px] rounded-[2px] shrink-0" style={{ background: s.color }} />
                    <span className="flex-1 text-[12px]" style={{ color: '#b8b8be' }}>{s.label}</span>
                    <span className="text-[12px] font-bold" style={{ color: '#f4f4f6' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <Btn variant="secondary" rightIcon={<ArrowRight size={16} strokeWidth={1.75} />} className="mt-auto h-10">
              Ver Ritmo
            </Btn>
          </Card>
        </div>

        {/* 3 colunas: entregas / outreach / metas */}
        <div className="flex gap-[14px] mb-4 items-stretch">
          {/* Próximas entregas */}
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Próximas entregas</span>
            </div>
            <div className="flex flex-col">
              {UPCOMING_DELIVERIES.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-[11px] py-[9px] px-1.5 rounded-[9px] hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ borderRadius: 9 }}
                >
                  <div className="flex flex-col items-center" style={{ width: 30, flexShrink: 0 }}>
                    <span className="text-[15px] font-bold leading-none" style={{ color: '#f4f4f6' }}>{d.day}</span>
                    <span className="text-[9px] uppercase" style={{ color: '#7a7a80' }}>{d.month}</span>
                  </div>
                  <Avatar name={d.name} initial={d.name.charAt(0)} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: '#f0f0f2' }}>{d.name}</div>
                    <div className="text-[11px] truncate" style={{ color: '#86868d' }}>{d.video}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[d.status] }} />
                </div>
              ))}
            </div>
          </Card>

          {/* Funil outreach */}
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Send size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Funil de outreach</span>
            </div>
            <div className="flex flex-col gap-4">
              {FUNNEL.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px]" style={{ color: '#b8b8be' }}>{f.label}</span>
                    <span className="text-[12px] font-bold" style={{ color: '#f4f4f6' }}>{f.n}</span>
                  </div>
                  <div className="h-1.5 rounded-[3px] overflow-hidden" style={{ background: '#1d1d20' }}>
                    <div
                      className="h-full rounded-[3px]"
                      style={{ width: `${f.width}%`, background: f.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Metas do mês */}
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Metas do mês</span>
            </div>
            <div className="flex flex-col gap-4">
              {GOALS.map((g, i) => {
                const pct = Math.round((g.current / g.target) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px]" style={{ color: '#b8b8be' }}>{g.label}</span>
                      <span className="text-[12px] font-bold" style={{ color: '#f4f4f6' }}>
                        {g.current}/{g.target}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-[3px] overflow-hidden" style={{ background: '#1d1d20' }}>
                      <div
                        className="h-full rounded-[3px]"
                        style={{
                          width: `${pct}%`,
                          background:
                            g.tone === 'success' ? '#4ade80' : g.tone === 'warning' ? '#fbbf24' : '#8b5cf6'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Tabela "Projetos recentes" */}
        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>Projetos recentes</span>
            <Btn variant="secondary" size="sm" rightIcon={<ChevronRight size={14} strokeWidth={1.75} />}>
              Ver todos
            </Btn>
          </div>

          <div
            className="flex items-center px-1.5 pb-2.5"
            style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: 12, fontWeight: 500 }}
          >
            <div style={{ flex: 1.4 }}>Cliente</div>
            <div style={{ flex: 1.6 }}>Vídeo</div>
            <div style={{ width: 110, flexShrink: 0 }}>Status</div>
            <div style={{ width: 90, flexShrink: 0 }}>Prazo</div>
            <div style={{ flex: 1, paddingLeft: 8 }}>Progresso</div>
          </div>

          {RECENT_PROJECTS.map((r, i) => (
            <div
              key={i}
              className="flex items-center px-1.5 py-[11px] hover:opacity-90 transition-opacity"
              style={{ borderBottom: '1px solid #161618', fontSize: 13, color: '#e8e8ea' }}
            >
              <div className="flex items-center gap-[9px] min-w-0" style={{ flex: 1.4 }}>
                <Avatar gradient={r.av} initial={r.initial} size="sm" />
                <span className="font-semibold truncate" style={{ color: '#f0f0f2' }}>{r.client}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0" style={{ flex: 1.6, color: '#b8b8be' }}>
                <Briefcase size={14} color="#a78bfa" strokeWidth={1.75} />
                <span className="truncate">{r.video}</span>
              </div>
              <div style={{ width: 110, flexShrink: 0 }}>
                <Pill tone={r.tone}>{r.status}</Pill>
              </div>
              <div style={{ width: 90, flexShrink: 0, color: '#86868d' }}>{r.due}</div>
              <div className="flex items-center gap-2.5" style={{ flex: 1, paddingLeft: 8 }}>
                <div className="flex-1 h-1.5 rounded-[3px] overflow-hidden" style={{ background: '#1d1d20' }}>
                  <div
                    className="h-full rounded-[3px]"
                    style={{
                      width: `${r.progress}%`,
                      background: r.tone === 'danger' ? '#f87171' : r.tone === 'warning' ? '#fbbf24' : '#8b5cf6'
                    }}
                  />
                </div>
                <span className="text-[12px] font-semibold" style={{ color: '#f4f4f6', minWidth: 32 }}>
                  {r.progress}%
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Modal "Novo Lead" (placeholder; vai ser substituído pelo Outreach real) */}
      {openLead && (
        <div
          onClick={() => setOpenLead(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            style={{ width: 480, padding: '24px 28px' }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[16px] font-semibold" style={{ color: '#f4f4f6' }}>Novo Lead</span>
              <button
                onClick={() => setOpenLead(false)}
                style={{ color: '#9a9aa0', fontSize: 13 }}
              >
                ✕
              </button>
            </div>
            <p className="text-[13px]" style={{ color: '#86868d' }}>
              Formulário virá do módulo Outreach. Por enquanto só abre/fecha.
            </p>
            <div className="flex justify-end mt-6">
              <Btn variant="primary" onClick={() => setOpenLead(false)}>Fechar</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProKpi({
  Icon,
  label,
  value,
  delta,
  positive
}: {
  Icon: typeof Wallet
  label: string
  value: string
  delta: string
  positive: boolean | null
}) {
  const deltaColor = positive === true ? '#4ade80' : positive === false ? '#f87171' : '#86868d'
  return (
    <Card className="flex-1">
      <div className="mb-[14px]">
        <span
          className="inline-flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 10, background: '#1c1c20' }}
        >
          <Icon size={18} color="#a78bfa" strokeWidth={1.75} />
        </span>
      </div>
      <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>{label}</div>
      <div className="text-[22px] font-bold mb-[9px] tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
        {value}
      </div>
      <div className="text-[12px]" style={{ color: '#7a7a80' }}>
        <span style={{ color: deltaColor, fontWeight: 600 }}>{delta}</span>
        {' · este mês'}
      </div>
    </Card>
  )
}

/** Mini revenue chart inline (template: viewBox 460x180, 12 pontos) */
function ProRevenueChart() {
  return (
    <svg viewBox="0 0 460 180" style={{ width: '100%', height: 180, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="rfp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="#1c1c1f" strokeWidth="1">
        <line x1="8" y1="22" x2="452" y2="22" />
        <line x1="8" y1="62" x2="452" y2="62" />
        <line x1="8" y1="102" x2="452" y2="102" />
        <line x1="8" y1="142" x2="452" y2="142" />
      </g>
      <path
        d="M12,140 L50,132 L88,138 L126,112 L164,120 L202,92 L240,104 L278,80 L316,90 L354,58 L392,66 L430,38 L448,30 L448,162 L12,162 Z"
        fill="url(#rfp)"
      />
      <path
        d="M12,140 L50,132 L88,138 L126,112 L164,120 L202,92 L240,104 L278,80 L316,90 L354,58 L392,66 L430,38 L448,30"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}