import { Tv, Music, Cloud, Smartphone, Heart, Zap, CreditCard, Calendar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Subscriptions — lista de assinaturas recorrentes.
 *
 * Visual 1:1 com template. Card por assinatura com avatar colorido
 * (ícone da categoria), nome + plano, valor mensal, próx. cobrança,
 * badge de status (Active / Ending soon / Paused).
 */

type Sub = {
  id: string
  name: string
  plan: string
  Icon: LucideIcon
  color: string
  bg: string
  amount: number
  nextDate: string
  status: 'active' | 'ending' | 'paused'
}

const SUBS: Sub[] = [
  { id: '1', name: 'Netflix', plan: 'Premium', Icon: Tv, color: '#f87171', bg: 'rgba(248,113,113,0.12)', amount: 55, nextDate: 'Jun 26', status: 'active' },
  { id: '2', name: 'Spotify', plan: 'Family', Icon: Music, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', amount: 22, nextDate: 'Jul 10', status: 'active' },
  { id: '3', name: 'iCloud', plan: '200GB', Icon: Cloud, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', amount: 35, nextDate: 'Jul 5', status: 'active' },
  { id: '4', name: 'Phone plan', plan: 'Unlimited', Icon: Smartphone, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', amount: 89, nextDate: 'Jul 1', status: 'active' },
  { id: '5', name: 'Gym', plan: 'Annual', Icon: Heart, color: '#f472b6', bg: 'rgba(244,114,182,0.12)', amount: 99, nextDate: 'Jun 30', status: 'ending' },
  { id: '6', name: 'Adobe CC', plan: 'All Apps', Icon: Zap, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', amount: 140, nextDate: 'Jul 15', status: 'paused' }
]

const STATUS_STYLE = {
  active: { fg: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  ending: { fg: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  paused: { fg: '#9a9aa0', bg: 'rgba(154,154,160,0.12)' }
} as const

export function Subscriptions() {
  const total = SUBS.reduce((a, s) => a + s.amount, 0)
  const activeCount = SUBS.filter((s) => s.status !== 'paused').length

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Summary */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Monthly Total
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f4f4f6' }}>
              R$ {total.toLocaleString('pt-BR')}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Active Subscriptions
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f4f4f6' }}>
              {activeCount}
            </div>
          </div>
        </div>

        {/* List */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[14px]" style={{ color: '#f4f4f6' }}>
            {SUBS.length} Subscriptions
          </div>

          <div className="flex flex-col">
            {SUBS.map((s, i) => {
              const st = STATUS_STYLE[s.status]
              return (
                <div
                  key={s.id}
                  className="flex items-center py-[13px] hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ borderBottom: i === SUBS.length - 1 ? 'none' : '1px solid #161618' }}
                >
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mr-[14px]"
                    style={{ background: s.bg }}
                  >
                    <s.Icon size={16} color={s.color} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-tmpl-body font-medium" style={{ color: '#e8e8ea' }}>
                        {s.name}
                      </span>
                      <span
                        className="text-tmpl-badge"
                        style={{ color: st.fg, background: st.bg }}
                      >
                        {s.status === 'active' ? 'Active' : s.status === 'ending' ? 'Ending soon' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-[2px]">
                      <div className="flex items-center gap-[4px]">
                        <CreditCard size={11} color="#6a6a70" strokeWidth={1.75} />
                        <span className="text-tmpl-label-xs" style={{ color: '#6a6a70' }}>
                          {s.plan}
                        </span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        <Calendar size={11} color="#6a6a70" strokeWidth={1.75} />
                        <span className="text-tmpl-label-xs" style={{ color: '#6a6a70' }}>
                          {s.nextDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-tmpl-body font-semibold" style={{ color: '#e8e8ea' }}>
                      R$ {s.amount.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-tmpl-label-xs" style={{ color: '#6a6a70' }}>
                      /month
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total footer */}
          <div
            className="mt-4 pt-4 flex items-center justify-between"
            style={{ borderTop: '1px solid #1f1f22' }}
          >
            <span className="text-tmpl-body font-semibold" style={{ color: '#e8e8ea' }}>
              Monthly Total
            </span>
            <span className="text-tmpl-stat" style={{ color: '#f4f4f6' }}>
              R$ {total.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}