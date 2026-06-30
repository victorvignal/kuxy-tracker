import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Building2,
  ArrowUpRight,
  Plus,
  Wallet,
  Clock,
  ArrowRight,
  MoreVertical
} from 'lucide-react'
import { useState } from 'react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { TransactionDialog } from '../components/finance/TransactionDialog'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Avatar } from '../components/ui/Avatar'
import { BarChart, type BarDatum } from '../components/ui/BarChart'

type Source = {
  id: string
  name: string
  sub: string
  iconColor: string
  iconBg: string
  amount: string
  change: string
  positive: boolean
}

const PERSONAL_SOURCES: Source[] = [
  { id: '1', name: 'Salary — Company XYZ', sub: 'Monthly · Direct deposit', iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)', amount: 'R$ 7.500', change: '+5%', positive: true },
  { id: '2', name: 'Freelance design', sub: 'Project-based · Pix', iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', amount: 'R$ 1.800', change: '+12%', positive: true },
  { id: '3', name: 'Stock dividends', sub: 'Quarterly · Brokerage', iconColor: '#22d3ee', iconBg: 'rgba(34,211,238,0.12)', amount: 'R$ 420', change: '+8%', positive: true },
  { id: '4', name: 'Rental income', sub: 'Monthly · Tenant', iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)', amount: 'R$ 1.200', change: '0%', positive: true },
  { id: '5', name: 'Affiliate program', sub: 'Monthly · Amazon', iconColor: '#f472b6', iconBg: 'rgba(244,114,182,0.12)', amount: 'R$ 180', change: '+22%', positive: true }
]

type ProClient = {
  name: string
  initial: string
  total: string
  videoCount: string
  statusLabel: string
  statusTone: 'success' | 'warning' | 'danger'
}

const PRO_TOP_CLIENTS: ProClient[] = [
  { name: 'Northwind', initial: 'N', total: 'R$ 12.450', videoCount: '8 vídeos', statusLabel: 'Em dia', statusTone: 'success' },
  { name: 'Lumen Studio', initial: 'L', total: 'R$ 8.920', videoCount: '5 vídeos', statusLabel: 'Em dia', statusTone: 'success' },
  { name: 'Brightline', initial: 'B', total: 'R$ 6.180', videoCount: '4 vídeos', statusLabel: 'Atrasado', statusTone: 'danger' },
  { name: 'Velasco Films', initial: 'V', total: 'R$ 4.770', videoCount: '3 vídeos', statusLabel: 'A receber', statusTone: 'warning' }
]

const PRO_BAR_DATA: BarDatum[] = [
  { month: 'Jan', height: 38, labelColor: '#7a7a80' },
  { month: 'Fev', height: 52, labelColor: '#7a7a80' },
  { month: 'Mar', height: 88, highlight: true, labelColor: '#f4f4f6' },
  { month: 'Abr', height: 46, labelColor: '#7a7a80' },
  { month: 'Mai', height: 64, labelColor: '#7a7a80' },
  { month: 'Jun', height: 72, labelColor: '#7a7a80' },
  { month: 'Jul', height: 30, labelColor: '#7a7a80' }
]

type RecentRow = {
  client: string
  initial: string
  av: string
  video: string
  dotColor: string
  date: string
  time: string
  amount: string
}

const PRO_RECENT: RecentRow[] = [
  { client: 'Northwind', initial: 'N', av: '#8b5cf6', video: 'Edição 14 — Hero Film', dotColor: '#4ade80', date: '23 jun 2026', time: '4h 22m', amount: 'R$ 1.850' },
  { client: 'Lumen Studio', initial: 'L', av: '#a78bfa', video: 'Short Vertical #08', dotColor: '#fbbf24', date: '22 jun 2026', time: '1h 45m', amount: 'R$ 740' },
  { client: 'Brightline', initial: 'B', av: '#6d4ee0', video: 'Doc Cap. 3', dotColor: '#f87171', date: '20 jun 2026', time: '8h 10m', amount: 'R$ 2.400' },
  { client: 'Velasco Films', initial: 'V', av: '#4f4193', video: 'Reel Final', dotColor: '#4ade80', date: '18 jun 2026', time: '3h 30m', amount: 'R$ 1.100' },
  { client: 'Pixel & Co', initial: 'P', av: '#5b6b8c', video: 'Behind the Scenes', dotColor: '#4ade80', date: '15 jun 2026', time: '2h 15m', amount: 'R$ 920' },
  { client: 'Atlas Media', initial: 'A', av: '#7a6b9c', video: 'Trailer Festival', dotColor: '#fbbf24', date: '12 jun 2026', time: '5h 40m', amount: 'R$ 1.650' }
]

const PRO_PERIOD = [
  { value: 'm', label: 'Mensal' },
  { value: 'a', label: 'Anual', dotColor: '#8b5cf6' }
] as const
type ProPeriod = (typeof PRO_PERIOD)[number]['value']

export function Earnings() {
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()
  const [showDialog, setShowDialog] = useState(false)

  // Perfil Profissional usa a versão rica (template "earnings-pro")
  if (active?.type === 'professional') {
    return <EarningsPro />
  }

  const total = PERSONAL_SOURCES.reduce((a, s) => a + parseFloat(s.amount.replace(/[^0-9]/g, '')), 0)
  const monthly = PERSONAL_SOURCES.filter((s) => s.sub.startsWith('Monthly')).reduce(
    (a, s) => a + parseFloat(s.amount.replace(/[^0-9]/g, '')),
    0
  )

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        <div className="flex gap-[14px] mb-4">
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Total Earnings (30d)</div>
            <div className="text-[22px] font-bold mb-2" style={{ color: '#f4f4f6' }}>R$ {total.toLocaleString('pt-BR')}</div>
            <div className="text-[12px]">
              <span className="font-semibold" style={{ color: '#4ade80' }}>+8% (R$ 854)</span>{' '}
              <span style={{ color: '#7a7a80' }}>· Last 30 Days</span>
            </div>
          </Card>
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Monthly Recurring</div>
            <div className="text-[22px] font-bold mb-2" style={{ color: '#f4f4f6' }}>R$ {monthly.toLocaleString('pt-BR')}</div>
            <div className="text-[12px]">
              <span className="font-semibold" style={{ color: '#4ade80' }}>+5% (R$ 444)</span>{' '}
              <span style={{ color: '#7a7a80' }}>· Last 30 Days</span>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>Income Sources</span>
            <Btn variant="secondary" size="sm" leftIcon={<Plus size={14} strokeWidth={1.75} />}>
              Add Source
            </Btn>
          </div>

          <div
            className="flex items-center px-1.5 pb-2.5"
            style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: 12, fontWeight: 500 }}
          >
            <div style={{ flex: 1 }}>Source</div>
            <div style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>Amount</div>
            <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>Change</div>
          </div>

          {PERSONAL_SOURCES.map((s) => (
            <div
              key={s.id}
              className="flex items-center px-1.5 py-3 hover:opacity-90 transition-opacity"
              style={{ borderBottom: '1px solid #161618', fontSize: 13, color: '#e8e8ea' }}
            >
              <div className="flex items-center gap-2.5" style={{ flex: 1 }}>
                <span
                  className="inline-flex items-center justify-center"
                  style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg }}
                >
                  {iconFor(s.name)}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] truncate" style={{ color: '#e8e8ea' }}>{s.name}</span>
                  <span className="text-[12px] truncate" style={{ color: '#7a7a80' }}>{s.sub}</span>
                </div>
              </div>
              <div style={{ width: 110, flexShrink: 0, textAlign: 'right', color: '#4ade80', fontWeight: 600 }}>
                {s.amount}
              </div>
              <div
                style={{
                  width: 80,
                  flexShrink: 0,
                  textAlign: 'right',
                  color: s.positive ? '#4ade80' : '#7a7a80',
                  fontWeight: 500
                }}
              >
                {s.change}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {showDialog && active && (
              <TransactionDialog
                onClose={() => setShowDialog(false)}
                onSaved={() => setShowDialog(false)}
                accounts={accounts as any}
                categories={categories as any}
                profileId={active.id}
                defaultType="income"
              />
            )}
    </div>
  )
}

function iconFor(name: string) {
  const Icon =
    name.startsWith('Salary') ? Briefcase
    : name.startsWith('Freelance') ? DollarSign
    : name.startsWith('Stock') ? TrendingUp
    : name.startsWith('Rental') ? Building2
    : ArrowUpRight
  return <Icon size={16} strokeWidth={1.75} color="#fff" />
}

/**
 * Earnings Profissional — replica 1:1 do `Tempo Dashboard.dc.html` seção earnings-pro:
 *   - 3 hero cards (1 com gradient roxo, 1 amarelo, 1 verde)
 *   - Grid 2×2 "Valores por cliente" + gráfico de barras com tooltip flutuante
 *   - Tabela "Últimos recebimentos"
 */
function EarningsPro() {
  const [period, setPeriod] = useState<ProPeriod>('m')

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Bloco A — 3 hero cards */}
        <div className="flex gap-[14px] mb-4">
          {/* Card 1: gradient roxo */}
          <Card variant="hero" className="flex-1 relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-[11px]">
                <span
                  className="inline-flex items-center justify-center"
                  style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255, 255, 255, 0.18)' }}
                >
                  <Wallet size={18} color="#fff" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: '#fff' }}>Total recebido</div>
                  <div className="text-[11.5px]" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
                    Receita de todos os clientes
                  </div>
                </div>
              </div>
              <MoreVertical size={18} color="rgba(255, 255, 255, 0.7)" />
            </div>
            <div className="flex items-center gap-2.5 mb-[18px]">
              <span className="text-[27px] font-bold tracking-[-.01em]" style={{ color: '#fff' }}>R$ 33.847</span>
              <span
                className="text-[11px] font-semibold"
                style={{ padding: '3px 8px', borderRadius: 7, background: 'rgba(255, 255, 255, 0.22)', color: '#fff' }}
              >
                +12%
              </span>
            </div>
            <div
              className="flex items-center justify-between text-[12.5px] font-medium cursor-pointer"
              style={{ color: '#fff', paddingTop: 13, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              Ver detalhes <ArrowRight size={14} strokeWidth={1.75} />
            </div>
          </Card>

          {/* Card 2: pendentes (amarelo) */}
          <Card className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-[11px]">
                <span
                  className="inline-flex items-center justify-center"
                  style={{ width: 38, height: 38, borderRadius: 11, background: '#1c1c20' }}
                >
                  <Clock size={18} color="#cbd5e1" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>A receber</div>
                  <div className="text-[11.5px]" style={{ color: '#86868d' }}>Pagamentos pendentes</div>
                </div>
              </div>
              <MoreVertical size={18} color="#6a6a70" />
            </div>
            <div className="flex items-center gap-2.5 mb-[18px]">
              <span className="text-[27px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>R$ 8.450</span>
              <Pill tone="warning" dot={false}>5 faturas</Pill>
            </div>
            <div
              className="flex items-center justify-between text-[12.5px] font-medium cursor-pointer"
              style={{ color: '#b8b8be', paddingTop: 13, borderTop: '1px solid #1f1f22' }}
            >
              Ver resumo <ArrowRight size={14} strokeWidth={1.75} />
            </div>
          </Card>

          {/* Card 3: lucro líquido (verde) */}
          <Card className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-[11px]">
                <span
                  className="inline-flex items-center justify-center"
                  style={{ width: 38, height: 38, borderRadius: 11, background: '#1c1c20' }}
                >
                  <TrendingUp size={18} color="#cbd5e1" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Lucro líquido</div>
                  <div className="text-[11.5px]" style={{ color: '#86868d' }}>Após custos do mês</div>
                </div>
              </div>
              <MoreVertical size={18} color="#6a6a70" />
            </div>
            <div className="flex items-center gap-2.5 mb-[18px]">
              <span className="text-[27px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>R$ 22.180</span>
              <Pill tone="success" dot={false}>+8%</Pill>
            </div>
            <div
              className="flex items-center justify-between text-[12.5px] font-medium cursor-pointer"
              style={{ color: '#b8b8be', paddingTop: 13, borderTop: '1px solid #1f1f22' }}
            >
              Analisar <ArrowRight size={14} strokeWidth={1.75} />
            </div>
          </Card>
        </div>

        {/* Bloco B — Valores por cliente + Fluxo de Receita */}
        <div className="flex gap-4 mb-4">
          {/* Grid 2x2 */}
          <Card className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>Valores por cliente</div>
                <div className="text-[12px] mt-0.5" style={{ color: '#86868d' }}>Recebido este mês</div>
              </div>
              <Btn variant="primary" size="sm" leftIcon={<Plus size={14} strokeWidth={1.75} />}>
                Adicionar
              </Btn>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PRO_TOP_CLIENTS.map((c, i) => (
                <Card
                  key={i}
                  padding="13px 14px"
                  style={{ background: '#1a1a1d', border: '1px solid #232327' }}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-[11px]">
                    <div className="flex items-center gap-[9px] min-w-0">
                      <Avatar name={c.name} initial={c.initial} size="sm" shape="circle" />
                      <span className="text-[13px] font-semibold truncate" style={{ color: '#f0f0f2' }}>{c.name}</span>
                    </div>
                    <MoreVertical size={14} color="#6a6a70" />
                  </div>
                  <div className="text-[19px] font-bold tracking-[-.01em] mb-1" style={{ color: '#f4f4f6' }}>
                    {c.total}
                  </div>
                  <div className="text-[11px] mb-2.5" style={{ color: '#7a7a80' }}>{c.videoCount}</div>
                  <Pill tone={c.statusTone} dot={false}>{c.statusLabel}</Pill>
                </Card>
              ))}
            </div>
          </Card>

          {/* Gráfico de barras */}
          <Card className="flex-1 min-w-0 flex flex-col" style={{ flex: 1.12 }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="text-[13px] mb-[7px]" style={{ color: '#86868d' }}>Fluxo de Receita</div>
                <div className="text-[26px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
                  R$ 33.847
                </div>
              </div>
              <SegmentedControl<ProPeriod>
                options={PRO_PERIOD as any}
                value={period}
                onChange={setPeriod}
                size="sm"
              />
            </div>
            <div className="mt-5">
              <BarChart
                data={PRO_BAR_DATA.map((b) => ({
                  ...b,
                  tooltip: (
                    <div>
                      <div className="text-[11px] mb-1.5" style={{ color: '#86868d' }}>23 de jun, 2026</div>
                      <div className="flex items-center justify-between gap-5 mb-1">
                        <span className="text-[11px]" style={{ color: '#9a9aa0' }}>Receita</span>
                        <span className="text-[11px] font-semibold" style={{ color: '#4ade80' }}>R$ 33.847</span>
                      </div>
                      <div className="flex items-center justify-between gap-5">
                        <span className="text-[11px]" style={{ color: '#9a9aa0' }}>Entregas</span>
                        <span className="text-[11px] font-semibold" style={{ color: '#f0f0f2' }}>7 vídeos</span>
                      </div>
                    </div>
                  )
                }))}
                yTicks={['50k', '40k', '30k', '20k', '10k', '0k']}
              />
            </div>
          </Card>
        </div>

        {/* Bloco C — Últimos recebimentos */}
        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>Últimos recebimentos</span>
            <Btn variant="secondary" size="sm" rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
              Ver todos
            </Btn>
          </div>
          <div
            className="flex items-center px-1.5 pb-2.5"
            style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: 12, fontWeight: 500 }}
          >
            <div style={{ flex: 1.4 }}>Cliente</div>
            <div style={{ flex: 1.6 }}>Vídeo</div>
            <div style={{ width: 110, flexShrink: 0 }}>Data</div>
            <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}>Tempo</div>
            <div style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>Recebido</div>
          </div>
          {PRO_RECENT.map((r, i) => (
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
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.dotColor }} />
                <span className="truncate">{r.video}</span>
              </div>
              <div style={{ width: 110, flexShrink: 0, color: '#86868d' }}>{r.date}</div>
              <div style={{ width: 90, flexShrink: 0, textAlign: 'right', color: '#9a9aa0' }}>{r.time}</div>
              <div style={{ width: 110, flexShrink: 0, textAlign: 'right', color: '#4ade80', fontWeight: 600 }}>
                {r.amount}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}