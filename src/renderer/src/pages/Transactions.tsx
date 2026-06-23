import { useState } from 'react'
import {
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Heart,
  Tv,
  Briefcase,
  type LucideIcon
} from 'lucide-react'

/**
 * Transactions — lista de transações (income/expense) com filtros.
 *
 * Estética 1:1 com o dashboard. Cada row tem ícone da categoria (colorido)
 * + nome + categoria + data + valor. Filtros no topo (All / Income / Expense).
 *
 * Valores seed (fixos pra demo). Depois conectamos com useFinanceData.
 */

type TxnType = 'income' | 'expense'

type Row = {
  id: string
  name: string
  category: string
  Icon: LucideIcon
  iconColor: string
  iconBg: string
  date: string
  amount: string
  type: TxnType
}

const ROWS: Row[] = [
  { id: '1', name: 'Salary', category: 'Salary', Icon: Briefcase, iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)', date: 'Jun 1, 2026', amount: 'R$ 7.500', type: 'income' },
  { id: '2', name: 'Rent payment', category: 'Housing', Icon: Home, iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', date: 'Jun 5, 2026', amount: 'R$ 2.200', type: 'expense' },
  { id: '3', name: 'Whole Foods Market', category: 'Food', Icon: ShoppingBag, iconColor: '#f472b6', iconBg: 'rgba(244,114,182,0.12)', date: 'Jun 7, 2026', amount: 'R$ 320', type: 'expense' },
  { id: '4', name: 'Uber', category: 'Transport', Icon: Car, iconColor: '#22d3ee', iconBg: 'rgba(34,211,238,0.12)', date: 'Jun 8, 2026', amount: 'R$ 45', type: 'expense' },
  { id: '5', name: 'Netflix subscription', category: 'Subscriptions', Icon: Tv, iconColor: '#8b5cf6', iconBg: 'rgba(139,92,246,0.12)', date: 'Jun 10, 2026', amount: 'R$ 55', type: 'expense' },
  { id: '6', name: 'Freelance project', category: 'Salary', Icon: Briefcase, iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)', date: 'Jun 12, 2026', amount: 'R$ 1.800', type: 'income' },
  { id: '7', name: 'Coffee shop', category: 'Food', Icon: Coffee, iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)', date: 'Jun 14, 2026', amount: 'R$ 18', type: 'expense' },
  { id: '8', name: 'Gym membership', category: 'Health', Icon: Heart, iconColor: '#f87171', iconBg: 'rgba(248,113,113,0.12)', date: 'Jun 15, 2026', amount: 'R$ 99', type: 'expense' },
  { id: '9', name: 'Stock dividend', category: 'Investments', Icon: ArrowUpRight, iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)', date: 'Jun 18, 2026', amount: 'R$ 420', type: 'income' }
]

export function Transactions() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const rows = ROWS.filter((r) => filter === 'all' || r.type === filter)

  const totalIn = ROWS.filter((r) => r.type === 'income').reduce((a, r) => a + parseFloat(r.amount.replace(/[^0-9]/g, '')), 0)
  const totalOut = ROWS.filter((r) => r.type === 'expense').reduce((a, r) => a + parseFloat(r.amount.replace(/[^0-9]/g, '')), 0)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter row */}
        <div className="flex items-center justify-between mb-[18px]">
          <div
            className="flex rounded-[9px] p-[3px]"
            style={{ background: '#121214', border: '1px solid #202023' }}
          >
            {[
              { key: 'all', label: 'All' },
              { key: 'income', label: 'Income' },
              { key: 'expense', label: 'Expense' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'income' | 'expense')}
                className="px-4 py-[7px] rounded-md text-[13px] font-medium transition-colors"
                style={{
                  background: filter === tab.key ? '#161619' : 'transparent',
                  color: filter === tab.key ? '#f4f4f6' : '#86868d',
                  fontWeight: filter === tab.key ? 600 : 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-[7px] h-[38px] px-[14px] rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
            style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
          >
            <Filter size={16} strokeWidth={1.75} />
            Filters
          </button>
        </div>

        {/* Summary cards (2x1 pequeno) */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={16} color="#4ade80" strokeWidth={2} />
              <span className="text-[12.5px]" style={{ color: '#86868d' }}>
                Total Income
              </span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#4ade80' }}>
              R$ {totalIn.toLocaleString('pt-BR')}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight size={16} color="#f87171" strokeWidth={2} />
              <span className="text-[12.5px]" style={{ color: '#86868d' }}>
                Total Expenses
              </span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f87171' }}>
              R$ {totalOut.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[14px]" style={{ color: '#f4f4f6' }}>
            {rows.length} transactions
          </div>

          <div className="flex flex-col">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center py-[13px] hover:opacity-90 transition-colors"
                style={{
                  borderBottom: i === rows.length - 1 ? 'none' : '1px solid #161618'
                }}
              >
                {/* Avatar com ícone da categoria */}
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mr-[14px]"
                  style={{ background: r.iconBg }}
                >
                  <r.Icon size={16} color={r.iconColor} strokeWidth={1.75} />
                </div>
                {/* Nome + categoria */}
                <div className="flex-1 min-w-0">
                  <div className="text-tmpl-table font-medium" style={{ color: '#e8e8ea' }}>
                    {r.name}
                  </div>
                  <div className="text-tmpl-label-xs" style={{ color: '#7a7a80' }}>
                    {r.category}
                  </div>
                </div>
                {/* Data */}
                <div className="w-[110px] text-tmpl-table shrink-0" style={{ color: '#b8b8be' }}>
                  {r.date}
                </div>
                {/* Valor */}
                <div className="w-[110px] text-right shrink-0">
                  <span
                    className="text-tmpl-table font-semibold"
                    style={{ color: r.type === 'income' ? '#4ade80' : '#f87171' }}
                  >
                    {r.type === 'income' ? '+' : '−'} {r.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}