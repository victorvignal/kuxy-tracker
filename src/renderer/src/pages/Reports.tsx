import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts'

/**
 * Reports — agregação mensal/semanal de receitas e despesas.
 *
 * Mostra charts de linha (tendência 6 meses) + barras (por categoria)
 * usando recharts. Visual 1:1 com template.
 */

const LINE_DATA = [
  { month: 'Jan', income: 6200, expenses: 3100 },
  { month: 'Feb', income: 5800, expenses: 2900 },
  { month: 'Mar', income: 7100, expenses: 3400 },
  { month: 'Apr', income: 6900, expenses: 3200 },
  { month: 'May', income: 7800, expenses: 3600 },
  { month: 'Jun', income: 9300, expenses: 4200 }
]

const BAR_DATA = [
  { category: 'Housing', spent: 3200, budget: 3200, color: '#a78bfa' },
  { category: 'Food', spent: 980, budget: 900, color: '#f472b6' },
  { category: 'Transport', spent: 450, budget: 400, color: '#22d3ee' },
  { category: 'Health', spent: 250, budget: 300, color: '#f87171' },
  { category: 'Subscriptions', spent: 312, budget: 350, color: '#8b5cf6' }
]

export function Reports() {
  const [period, setPeriod] = useState<0 | 1 | 2>(1) // 0=week, 1=month, 2=year

  const totalIncome = LINE_DATA.reduce((a, d) => a + d.income, 0)
  const totalExpenses = LINE_DATA.reduce((a, d) => a + d.expenses, 0)
  const net = totalIncome - totalExpenses

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter tabs */}
        <div className="flex items-center justify-end mb-[18px]">
          <div
            className="flex rounded-[9px] p-[3px]"
            style={{ background: '#121214', border: '1px solid #202023' }}
          >
            {([
              { key: 0, label: 'Week' },
              { key: 1, label: 'Month' },
              { key: 2, label: 'Year' }
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className="px-4 py-[7px] rounded-md text-[13px] font-medium transition-colors"
                style={{
                  background: period === tab.key ? '#161619' : 'transparent',
                  color: period === tab.key ? '#f4f4f6' : '#86868d',
                  fontWeight: period === tab.key ? 600 : 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} color="#4ade80" strokeWidth={2} />
              <span className="text-tmpl-body" style={{ color: '#86868d' }}>Total Income (6m)</span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#4ade80' }}>
              R$ {totalIncome.toLocaleString('pt-BR')}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} color="#f87171" strokeWidth={2} />
              <span className="text-tmpl-body" style={{ color: '#86868d' }}>Total Expenses (6m)</span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f87171' }}>
              R$ {totalExpenses.toLocaleString('pt-BR')}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} color="#a78bfa" strokeWidth={2} />
              <span className="text-tmpl-body" style={{ color: '#86868d' }}>Net Savings (6m)</span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#a78bfa' }}>
              R$ {net.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Line chart — Income vs Expenses */}
        <div
          className="rounded-[14px] p-[18px] mb-4"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[16px]" style={{ color: '#f4f4f6' }}>
            Income vs Expenses
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={LINE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#1c1c1f" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6a6a70', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6a6a70', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1d',
                  border: '1px solid #2a2a2e',
                  borderRadius: 8,
                  color: '#e8e8ea',
                  fontSize: 13
                }}
                formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, '']}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#4ade80' }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#f87171' }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-[7px]">
              <span className="w-3 h-[3px] rounded-full" style={{ background: '#4ade80' }} />
              <span className="text-tmpl-label-xs" style={{ color: '#86868d' }}>Income</span>
            </div>
            <div className="flex items-center gap-[7px]">
              <span className="w-3 h-[3px] rounded-full" style={{ background: '#f87171' }} />
              <span className="text-tmpl-label-xs" style={{ color: '#86868d' }}>Expenses</span>
            </div>
          </div>
        </div>

        {/* Bar chart — Spending by category */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[16px]" style={{ color: '#f4f4f6' }}>
            Spending by Category
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BAR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#1c1c1f" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: '#6a6a70', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6a6a70', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1d',
                  border: '1px solid #2a2a2e',
                  borderRadius: 8,
                  color: '#e8e8ea',
                  fontSize: 13
                }}
                formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, '']}
              />
              <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                {BAR_DATA.map((d, i) => (
                  <Bar key={i} dataKey="spent" fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}