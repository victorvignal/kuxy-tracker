import { useState } from 'react'
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Heart,
  Tv,
  Plus,
  type LucideIcon
} from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { TransactionDialog } from '../components/finance/TransactionDialog'
import type { Account, Category as CategoryT } from '../types'

/**
 * Spending — breakdown de gastos por categoria (versão nova do Finance).
 *
 * Visual 1:1 com o template. Mostra um donut chart grande + lista de
 * categorias com barra de progresso + valores. Filtros no topo.
 */

type CategoryRow = {
  id: string
  name: string
  Icon: LucideIcon
  color: string
  bg: string
  spent: number
  budget: number
  change: string
}

const CATEGORIES: CategoryRow[] = [
  { id: '1', name: 'Housing', Icon: Home, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', spent: 3200, budget: 3200, change: '0%' },
  { id: '2', name: 'Food', Icon: ShoppingBag, color: '#f472b6', bg: 'rgba(244,114,182,0.12)', spent: 980, budget: 900, change: '+9%' },
  { id: '3', name: 'Transport', Icon: Car, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', spent: 450, budget: 400, change: '+13%' },
  { id: '4', name: 'Health', Icon: Heart, color: '#f87171', bg: 'rgba(248,113,113,0.12)', spent: 250, budget: 300, change: '-17%' },
  { id: '5', name: 'Subscriptions', Icon: Tv, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', spent: 312, budget: 350, change: '-11%' },
  { id: '6', name: 'Coffee', Icon: Coffee, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', spent: 107, budget: 150, change: '-29%' }
]

export function Spending() {
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()
  const [showDialog, setShowDialog] = useState(false)
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('month')

  const totalSpent = CATEGORIES.reduce((a, c) => a + c.spent, 0)
  const totalBudget = CATEGORIES.reduce((a, c) => a + c.budget, 0)
  const pct = Math.round((totalSpent / totalBudget) * 100)

  // Donut segments
  const r = 46
  const circ = +(2 * Math.PI * r).toFixed(2)
  let acc = 0

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-[18px]">
          <div
            className="flex rounded-[9px] p-[3px]"
            style={{ background: '#121214', border: '1px solid #202023' }}
          >
            {([
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'year', label: 'Year' }
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
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
            onClick={() => setShowDialog(true)}
            disabled={accounts.length === 0}
            title={accounts.length === 0 ? 'Crie uma conta primeiro' : 'Nova despesa'}
            className="flex items-center gap-[7px] h-[38px] px-[14px] rounded-[9px] text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
          >
            <Plus size={16} strokeWidth={1.75} />
            Filters
          </button>
        </div>

        {/* Donut + categories */}
        <div className="flex gap-4">
          {/* Donut */}
          <div
            className="shrink-0 rounded-[14px] p-[18px] flex flex-col items-center"
            style={{ width: 310, background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-card-title mb-[18px] self-start" style={{ color: '#f4f4f6' }}>
              Spending Breakdown
            </div>
            <div className="relative w-[110px] h-[110px] mb-5">
              <svg viewBox="0 0 120 120" style={{ width: 110, height: 110, transform: 'rotate(-90deg)' }}>
                {CATEGORIES.map((c, i) => {
                  const frac = c.spent / totalSpent
                  const dash = frac * circ
                  const offset = (-acc * circ).toFixed(2)
                  acc += frac
                  return (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={r}
                      fill="none"
                      stroke={c.color}
                      strokeWidth="14"
                      strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
                      strokeDashoffset={offset}
                    />
                  )
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-tmpl-donut leading-none" style={{ color: '#f4f4f6' }}>
                  R$ {(totalSpent / 1000).toFixed(1).replace('.', ',')}k
                </div>
                <div className="text-tmpl-donut-label" style={{ color: '#86868d' }}>
                  Total Spent
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {CATEGORIES.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center gap-[9px]">
                  <span className="w-[3px] h-[14px] rounded-[2px] shrink-0" style={{ background: c.color }} />
                  <span className="flex-1 text-tmpl-table" style={{ color: '#b8b8be' }}>
                    {c.name}
                  </span>
                  <span className="text-tmpl-table font-bold" style={{ color: '#f4f4f6' }}>
                    R$ {c.spent.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category progress bars */}
          <div className="flex-1 rounded-[14px] p-[18px]" style={{ background: '#141416', border: '1px solid #1f1f22' }}>
            <div className="text-tmpl-card-title mb-[16px]" style={{ color: '#f4f4f6' }}>
              {CATEGORIES.length} Categories
            </div>
            <div className="flex flex-col gap-4">
              {CATEGORIES.map((c) => {
                const pctCat = Math.min(100, Math.round((c.spent / c.budget) * 100))
                const over = c.spent > c.budget
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <div className="flex items-center gap-[9px]">
                        <div
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                          style={{ background: c.bg }}
                        >
                          <c.Icon size={13} color={c.color} strokeWidth={1.75} />
                        </div>
                        <span className="text-tmpl-body" style={{ color: '#e8e8ea' }}>
                          {c.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-tmpl-table" style={{ color: '#9a9aa0' }}>
                          R$ {c.spent.toLocaleString('pt-BR')}
                        </span>
                        <span
                          className="text-tmpl-badge font-semibold"
                          style={{
                            color: over ? '#f87171' : '#4ade80',
                            background: over ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.12)'
                          }}
                        >
                          {c.change}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1f1f22' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pctCat}%`,
                          background: over ? '#f87171' : c.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div
              className="mt-5 pt-4"
              style={{ borderTop: '1px solid #1f1f22' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-tmpl-body font-semibold" style={{ color: '#e8e8ea' }}>
                  Total Spent
                </span>
                <span className="text-tmpl-stat" style={{ color: pct > 100 ? '#f87171' : '#f4f4f6' }}>
                  R$ {totalSpent.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="text-tmpl-label-xs mt-1" style={{ color: '#7a7a80' }}>
                Budget: R$ {totalBudget.toLocaleString('pt-BR')} · {pct}% used
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDialog && active && (
        <TransactionDialog
          onClose={() => setShowDialog(false)}
          onSaved={() => setShowDialog(false)}
          accounts={accounts as unknown as Account[]}
          categories={categories as unknown as CategoryT[]}
          profileId={active.id}
          defaultType="expense"
        />
      )}
    </div>
  )
}