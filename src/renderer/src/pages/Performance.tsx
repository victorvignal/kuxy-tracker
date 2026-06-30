import { useState } from 'react'
import { TrendingUp, Target, Award, Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { useProfileStore } from '../store/useProfile'
import { Goals } from './Goals'

/**
 * Performance — gráficos de progresso ao longo do tempo.
 *
 * Mostra métricas de performance: savings rate, income growth,
 * goal completion rate, streaks. Usa recharts pra visualização.
 */

const GROWTH_DATA = [
  { month: 'Jan', savings: 3100, goal: 3000 },
  { month: 'Feb', savings: 2900, goal: 3000 },
  { month: 'Mar', savings: 3700, goal: 3200 },
  { month: 'Apr', savings: 3700, goal: 3200 },
  { month: 'May', savings: 4200, goal: 3500 },
  { month: 'Jun', savings: 5100, goal: 4000 }
]

const GOALS = [
  { id: '1', name: 'Save R$ 5.000/month', current: 5100, target: 5000, pct: 100, color: '#4ade80' },
  { id: '2', name: 'Reduce food spending to R$ 900', current: 980, target: 900, pct: 92, color: '#a78bfa' },
  { id: '3', name: 'Maintain 90% budget adherence', current: 87, target: 90, pct: 97, color: '#22d3ee' },
  { id: '4', name: 'Grow income 10% this quarter', current: 8, target: 10, pct: 80, color: '#fbbf24' }
]

export function Performance() {
  const active = useProfileStore((s) => s.getActive())

  // Profissional = Goals (metas + anéis KPI + marcos)
  if (active?.type === 'professional') {
    return <Goals />
  }

  const [period, setPeriod] = useState<0 | 1 | 2>(1)

  const avgSavings = Math.round(GROWTH_DATA.reduce((a, d) => a + d.savings, 0) / GROWTH_DATA.length)
  const avgGoalPct = Math.round(GOALS.reduce((a, g) => a + g.pct, 0) / GOALS.length)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter */}
        <div className="flex items-center justify-end mb-[18px]">
          <div
            className="flex rounded-[9px] p-[3px]"
            style={{ background: '#121214', border: '1px solid #202023' }}
          >
            {([{ key: 0, label: 'Week' }, { key: 1, label: 'Month' }, { key: 2, label: 'Year' }] as const).map((tab) => (
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

        {/* 3 stat cards */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} color="#4ade80" strokeWidth={1.75} />
              <span className="text-tmpl-body" style={{ color: '#86868d' }}>Avg Savings (6m)</span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#4ade80' }}>
              R$ {avgSavings.toLocaleString('pt-BR')}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-tmpl-body" style={{ color: '#86868d' }}>Goal Completion</span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#a78bfa' }}>
              {avgGoalPct}%
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} color="#fbbf24" strokeWidth={1.75} />
              <span className="text-tmpl-body" style={{ color: '#86868d' }}>Current Streak</span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#fbbf24' }}>
              12 days
            </div>
          </div>
        </div>

        {/* Savings vs Goal chart */}
        <div
          className="rounded-[14px] p-[18px] mb-4"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[16px]" style={{ color: '#f4f4f6' }}>
            Monthly Savings vs Goal
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={GROWTH_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
                dataKey="savings"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="goal"
                stroke="#6b6b72"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-[7px]">
              <span className="w-3 h-[3px] rounded-full" style={{ background: '#4ade80' }} />
              <span className="text-tmpl-label-xs" style={{ color: '#86868d' }}>Actual Savings</span>
            </div>
            <div className="flex items-center gap-[7px]">
              <span className="w-3 h-[3px] rounded-full" style={{ background: '#6b6b72' }} />
              <span className="text-tmpl-label-xs" style={{ color: '#86868d' }}>Goal</span>
            </div>
          </div>
        </div>

        {/* Goals progress */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[14px]" style={{ color: '#f4f4f6' }}>
            Goals Progress
          </div>
          <div className="flex flex-col gap-4">
            {GOALS.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-[6px]">
                  <div className="flex items-center gap-2">
                    <Target size={13} color={g.color} strokeWidth={1.75} />
                    <span className="text-tmpl-body" style={{ color: '#e8e8ea' }}>
                      {g.name}
                    </span>
                  </div>
                  <span
                    className="text-tmpl-badge font-semibold"
                    style={{ color: g.color, background: `${g.color}1a` }}
                  >
                    {g.pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1f22' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${g.pct}%`, background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
