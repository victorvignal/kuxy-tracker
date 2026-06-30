import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { TransactionDialog } from '../components/finance/TransactionDialog'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { ProgressBar } from '../components/ui/ProgressBar'
import { LeadsFinder } from './LeadsFinder'
import type { Account, Category as CategoryT } from '../types'

/**
 * Spending Pessoal — replica 1:1 do template `spending-fix.png`:
 *   - 2 KPI cards (Monthly Expenses + Budget Remaining, este em verde)
 *   - Lista de barras de progresso por categoria (roxo, monocromático)
 *
 * Sem donut (esse vive no Dashboard Pessoal como "Spending Breakdown").
 * Sem gráfico rico (esse vive no Earnings Pro).
 */

type CategoryRow = {
  id: string
  name: string
  spent: number
  budget: number
}

const CATEGORIES: CategoryRow[] = [
  { id: '1', name: 'Housing', spent: 1420, budget: 1500 },
  { id: '2', name: 'Food', spent: 850, budget: 900 },
  { id: '3', name: 'Transport', spent: 680, budget: 700 },
  { id: '4', name: 'Health', spent: 620, budget: 600 }
]

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
] as const
type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

// Cor por categoria — monocromático roxo conforme spec (apenas sinal verde/vermelho).
const COLORS = ['#8b5cf6', '#a78bfa', '#6d4ee0', '#4f4193']

export function Spending() {
  const active = useProfileStore((s) => s.getActive())

  // Profissional = Leads Finder (busca criadores via "API YouTube")
  if (active?.type === 'professional') {
    return <LeadsFinder />
  }

  const { accounts, categories } = useFinanceData()
  const [showDialog, setShowDialog] = useState(false)
  const [filter, setFilter] = useState<PeriodValue>('month')

  const totalSpent = CATEGORIES.reduce((a, c) => a + c.spent, 0)
  const totalBudget = CATEGORIES.reduce((a, c) => a + c.budget, 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter row */}
        <div className="flex items-center justify-between mb-[18px]">
          <SegmentedControl<PeriodValue>
            options={PERIOD_OPTIONS as any}
            value={filter}
            onChange={setFilter}
          />
          <Btn variant="secondary" leftIcon={<Plus size={16} strokeWidth={1.75} />}>
            Nova despesa
          </Btn>
        </div>

        {/* 2 KPIs */}
        <div className="flex gap-[14px] mb-4">
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Monthly Expenses</div>
            <div className="text-[28px] font-bold mb-2 tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              R$ {totalSpent.toLocaleString('pt-BR')}
            </div>
            <div className="text-[12px]" style={{ color: '#7a7a80' }}>
              <span className="font-semibold" style={{ color: '#4ade80' }}>+5%</span>
              {' · Last 30 Days'}
            </div>
          </Card>
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Budget Remaining</div>
            <div className="text-[28px] font-bold mb-2 tracking-[-.01em]" style={{ color: '#4ade80' }}>
              R$ {remaining.toLocaleString('pt-BR')}
            </div>
            <div className="text-[12px]" style={{ color: '#7a7a80' }}>
              <span className="font-semibold" style={{ color: '#4ade80' }}>de R$ {totalBudget.toLocaleString('pt-BR')}</span>
              {' · restante'}
            </div>
          </Card>
        </div>

        {/* Lista de barras */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
              Spending Categories
            </span>
            <span className="text-[12px]" style={{ color: '#86868d' }}>
              {CATEGORIES.length} categorias
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {CATEGORIES.map((c, i) => {
              const pct = Math.min(100, Math.round((c.spent / c.budget) * 100))
              const over = c.spent > c.budget
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px]" style={{ color: '#e8e8ea' }}>{c.name}</span>
                    <span className="text-[13px]" style={{ color: '#86868d' }}>
                      {pct}%
                      <span className="ml-2" style={{ color: '#7a7a80' }}>
                        R$ {c.spent.toLocaleString('pt-BR')} / {c.budget.toLocaleString('pt-BR')}
                      </span>
                    </span>
                  </div>
                  <ProgressBar value={pct} color={over ? '#f87171' : COLORS[i]} height={6} />
                </div>
              )
            })}
          </div>
        </Card>
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