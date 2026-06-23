import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Building2,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Earnings — fontes de receita do usuário.
 *
 * Visual baseado no template `Tempo Dashboard.dc.html`. Mostra 2 stat cards
 * grandes no topo (Total earnings + Monthly recurring) + lista de fontes
 * de receita com avatar (ícone) colorido + nome + sub + valor + trend.
 *
 * Visual replica o card de lista do `Earnings` no template.
 */

type Source = {
  id: string
  name: string
  sub: string
  Icon: LucideIcon
  iconColor: string
  iconBg: string
  amount: string
  change: string
  positive: boolean
}

const SOURCES: Source[] = [
  { id: '1', name: 'Salary — Company XYZ', sub: 'Monthly · Direct deposit', Icon: Briefcase, iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)', amount: 'R$ 7.500', change: '+5%', positive: true },
  { id: '2', name: 'Freelance design', sub: 'Project-based · Pix', Icon: DollarSign, iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', amount: 'R$ 1.800', change: '+12%', positive: true },
  { id: '3', name: 'Stock dividends', sub: 'Quarterly · Brokerage', Icon: TrendingUp, iconColor: '#22d3ee', iconBg: 'rgba(34,211,238,0.12)', amount: 'R$ 420', change: '+8%', positive: true },
  { id: '4', name: 'Rental income', sub: 'Monthly · Tenant', Icon: Building2, iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)', amount: 'R$ 1.200', change: '0%', positive: true },
  { id: '5', name: 'Affiliate program', sub: 'Monthly · Amazon', Icon: ArrowUpRight, iconColor: '#f472b6', iconBg: 'rgba(244,114,182,0.12)', amount: 'R$ 180', change: '+22%', positive: true }
]

export function Earnings() {
  const total = SOURCES.reduce((a, s) => a + parseFloat(s.amount.replace(/[^0-9]/g, '')), 0)
  const monthly = SOURCES.filter((s) => s.sub.startsWith('Monthly')).reduce((a, s) => a + parseFloat(s.amount.replace(/[^0-9]/g, '')), 0)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* 2 stat cards grandes */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Total Earnings (30d)
            </div>
            <div className="text-tmpl-stat mb-2" style={{ color: '#f4f4f6' }}>
              R$ {total.toLocaleString('pt-BR')}
            </div>
            <div className="text-tmpl-label-xs">
              <span className="font-semibold" style={{ color: '#4ade80' }}>
                +8% (R$ 854)
              </span>{' '}
              <span style={{ color: '#7a7a80' }}>· Last 30 Days</span>
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Monthly Recurring
            </div>
            <div className="text-tmpl-stat mb-2" style={{ color: '#f4f4f6' }}>
              R$ {monthly.toLocaleString('pt-BR')}
            </div>
            <div className="text-tmpl-label-xs">
              <span className="font-semibold" style={{ color: '#4ade80' }}>
                +5% (R$ 444)
              </span>{' '}
              <span style={{ color: '#7a7a80' }}>· Last 30 Days</span>
            </div>
          </div>
        </div>

        {/* Lista de fontes */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="flex items-center justify-between mb-[16px]">
            <span className="text-tmpl-card-title" style={{ color: '#f4f4f6' }}>
              {SOURCES.length} Sources
            </span>
            <button
              className="flex items-center gap-[7px] h-[32px] px-3 rounded-[8px] text-tmpl-body-xs font-medium"
              style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
            >
              <Plus size={14} strokeWidth={1.75} />
              Add Source
            </button>
          </div>

          <div className="flex flex-col">
            {SOURCES.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center py-[13px] hover:opacity-95 transition-opacity cursor-pointer"
                style={{ borderBottom: i === SOURCES.length - 1 ? 'none' : '1px solid #161618' }}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mr-[14px]"
                  style={{ background: s.iconBg }}
                >
                  <s.Icon size={16} color={s.iconColor} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-tmpl-body" style={{ color: '#e8e8ea' }}>
                    {s.name}
                  </div>
                  <div className="text-tmpl-label-xs" style={{ color: '#7a7a80' }}>
                    {s.sub}
                  </div>
                </div>
                <div className="w-[100px] text-right shrink-0">
                  <div className="text-tmpl-body font-semibold" style={{ color: '#e8e8ea' }}>
                    {s.amount}
                  </div>
                  <div className="text-tmpl-label-xs" style={{ color: s.positive ? '#4ade80' : '#7a7a80' }}>
                    {s.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}