import { useState, useMemo } from 'react'
import { useT } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import {
  IconBalance,
  IconSavings,
  IconTrendUpAccent,
  IconTrendUp,
  IconReceipt,
  IconGridAccent,
  IconMoreDots,
  ChevronLeft,
  ChevronRight,
  IconExport,
  ChevronDown
} from '../components/template-icons/TemplateIcon'
import { useFinanceData } from '../hooks/useFinanceData'
import { fmtBRL } from '../lib/format'

/**
 * Dashboard Pessoal — réplica 1:1 do template
 * (C:\Users\vigna\Downloads\design\Dashboard.dc.html).
 *
 * Componentes (na ordem do template):
 *  - Filter row (30 Days / 3 Months / 1 Year tabs + Export + New ▾)
 *  - Stat cards 4x1: Monthly Balance / Total Savings / Monthly Income / Monthly Expenses
 *  - Middle row: Balance Flow (1.65fr) + Spending Breakdown (1fr)
 *  - Contacts table (8 rows seed)
 *
 * Stats derivam do módulo Finance (accounts + transactions do mês selecionado).
 * Outros perfis (Profissional) podem ter um dashboard alternativo no futuro.
 */

// ---- Balance Flow chart: gera linePath + areaPath a partir de dados reais ----
function useFlowChart(values: number[]) {
  return useMemo(() => {
    const W = 400
    const H = 150
    const pad = 12
    const max = Math.max(...values, 1)
    const n = values.length
    const pts = values.map((v, i) => [
      +(pad + (i / Math.max(1, n - 1)) * (W - 2 * pad)).toFixed(1),
      +(H - pad - (v / max) * (H - 2 * pad)).toFixed(1)
    ])
    const linePath = 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ')
    const last = pts[n - 1] ?? [pad, H - pad]
    const areaPath = linePath + ` L ${last[0]} ${H} L ${pts[0]?.[0] ?? pad} ${H} Z`
    return { linePath, areaPath, dotX: last[0], dotY: last[1] }
  }, [values])
}

// ---- Donut chart: 4 segmentos de categorias de despesa ----
function Donut({
  segments
}: {
  segments: { label: string; val: number; valLabel: string; color: string }[]
}) {
  const r = 45
  const circ = +(2 * Math.PI * r).toFixed(2)
  const total = segments.reduce((a, s) => a + s.val, 0) || 1
  let acc = 0
  return (
    <svg viewBox="0 0 120 120" style={{ width: 128, height: 128, transform: 'rotate(-90deg)' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-bg-hover)" strokeWidth="13" />
      {segments.map((s, i) => {
        const frac = s.val / total
        const dash = frac * circ
        const seg = {
          dasharray: `${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`,
          offset: (-acc * circ).toFixed(2)
        }
        acc += frac
        return (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="13"
            strokeDasharray={seg.dasharray}
            strokeDashoffset={seg.offset}
          />
        )
      })}
    </svg>
  )
}

// ---- Stat card (template: 34x34 icon + label + valor 30px + delta) ----
function StatCard({
  Icon,
  label,
  value,
  delta,
  deltaPositive
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  label: string
  value: string
  delta: string
  deltaPositive: boolean
}) {
  const t = useT()
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-card">
      <span className="w-[34px] h-[34px] rounded-lg bg-bg-hover border border-border flex items-center justify-center">
        <Icon size={16} color="var(--color-text-muted)" />
      </span>
      <div className="text-tmpl-body text-text-muted mt-4">{label}</div>
      <div className="text-tmpl-stat-value mt-1.5">{value}</div>
      <div className="text-tmpl-label mt-2">
        <span
          className="font-semibold"
          style={{ color: deltaPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
        >
          {delta}
        </span>
        <span className="text-text-subtle"> · {t('dashboard.last_30_days')}</span>
      </div>
    </div>
  )
}

export function Dashboard() {
  const t = useT()
  const active = useProfileStore((s) => s.getActive())
  const [period, setPeriod] = useState<0 | 1 | 2>(0) // 0=30d, 1=90d, 2=365d

  // Dados financeiros reais (do módulo Finance já existente)
  const { accounts, transactions, categories } = useFinanceData()

  // Stats derivados
  const stats = useMemo(() => {
    const now = Date.now()
    const days = period === 0 ? 30 : period === 1 ? 90 : 365
    const cutoff = now - days * 24 * 60 * 60 * 1000
    const recent = transactions.filter((tx) => new Date(tx.date).getTime() >= cutoff)

    const totalSavings = accounts
      .filter((a) => a.type === 'savings' || a.type === 'investment')
      .reduce((sum, a) => sum + (a.balance ?? 0), 0)

    const income = recent
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
    const expense = recent
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
    const monthlyBalance = income - expense

    // Delta % vs período anterior (mesma duração, antes do cutoff)
    const prevCutoff = cutoff - days * 24 * 60 * 60 * 1000
    const prev = transactions.filter(
      (tx) =>
        new Date(tx.date).getTime() >= prevCutoff && new Date(tx.date).getTime() < cutoff
    )
    const prevIncome = prev.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
    const prevExpense = prev.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)
    const prevBalance = prevIncome - prevExpense

    const pct = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / Math.abs(prev)) * 100)
    const balanceDelta = pct(monthlyBalance, prevBalance)
    const incomeDelta = pct(income, prevIncome)
    const expenseDelta = pct(expense, prevExpense)
    const savingsDelta = pct(totalSavings, totalSavings - monthlyBalance * 0.1) // approximation

    return {
      monthlyBalance,
      totalSavings,
      income,
      expense,
      balanceDelta,
      incomeDelta,
      expenseDelta,
      savingsDelta
    }
  }, [accounts, transactions, period])

  // Balance flow: gera valores diários a partir das transações
  const flowValues = useMemo(() => {
    const days = period === 0 ? 30 : period === 1 ? 90 : 365
    const slice = Math.min(days, 16) // mantém resolução do template
    const now = Date.now()
    const start = now - days * 24 * 60 * 60 * 1000
    const buckets: number[] = Array(slice).fill(0)
    const step = (days * 24 * 60 * 60 * 1000) / slice
    transactions.forEach((tx) => {
      const t = new Date(tx.date).getTime()
      if (t < start) return
      const idx = Math.min(slice - 1, Math.floor((t - start) / step))
      buckets[idx] += tx.type === 'income' ? tx.amount : -tx.amount
    })
    // cumulativo
    const acc: number[] = []
    let run = 0
    buckets.forEach((v) => {
      run += v
      acc.push(Math.max(0, run / 100))
    })
    return acc
  }, [transactions, period])

  const flow = useFlowChart(flowValues)

  // Spending breakdown: top 4 categorias de despesa no período
  const spending = useMemo(() => {
    const days = period === 0 ? 30 : period === 1 ? 90 : 365
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    const map: Record<number, number> = {}
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return
      if (tx.categoryId == null) return
      if (new Date(tx.date).getTime() < cutoff) return
      map[tx.categoryId] = (map[tx.categoryId] ?? 0) + tx.amount
    })
    const sorted = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    const palette = ['var(--color-accent)', 'var(--color-accent-light)', 'var(--color-accent-dark)', '#4f4193']
    return sorted.map(([catId, val], i) => {
      const cat = categories.find((c) => c.id === Number(catId))
      return {
        label: cat?.name ?? `Cat ${catId}`,
        val,
        valLabel: val.toLocaleString('pt-BR'),
        color: cat?.color ?? palette[i]
      }
    })
  }, [transactions, categories, period])

  const spendingTotal = spending.reduce((a, s) => a + s.val, 0)
  const periodLabels = [t('period.30d'), t('period.90d'), t('period.1y')]

  // Se for perfil Profissional, mostra placeholder (template só cobre Pessoal)
  if (active?.type === 'professional') {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">{t('nav.dashboard')}</h1>
          <p className="text-sm text-text-muted">Dashboard for Professional profile is coming soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      {/* Filter row */}
      <div className="flex items-center gap-[14px] px-7 pt-6">
        <div className="flex gap-0.5 bg-bg-card border border-border rounded-[11px] p-1">
          {periodLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => setPeriod(i as 0 | 1 | 2)}
              className={`px-4 py-1.5 rounded-md text-tmpl-body-sm font-medium transition-colors ${
                period === i
                  ? 'bg-bg-hover text-text shadow-card'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] px-[15px] py-[9px] text-tmpl-body font-semibold text-text hover:bg-bg-hover transition-colors">
          <IconExport size={15} />
          {t('common.export')}
        </button>
        <button className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] px-[14px] py-[9px] text-tmpl-body font-semibold text-text hover:bg-bg-hover transition-colors">
          {t('common.new')}
          <span className="w-px h-4 bg-border" />
          <ChevronDown size={14} color="var(--color-text-muted)" />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-7 pb-10 pt-5 max-w-[1320px]">
        {/* Stat cards 4x1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            Icon={IconBalance}
            label={t('dashboard.monthly_balance')}
            value={fmtBRL(stats.monthlyBalance)}
            delta={`${stats.balanceDelta >= 0 ? '+' : ''}${stats.balanceDelta}% (${fmtBRL(stats.monthlyBalance)})`}
            deltaPositive={stats.balanceDelta >= 0}
          />
          <StatCard
            Icon={IconSavings}
            label={t('dashboard.total_savings')}
            value={fmtBRL(stats.totalSavings)}
            delta={`+${stats.savingsDelta}% (${fmtBRL(stats.totalSavings * 0.1)})`}
            deltaPositive
          />
          <StatCard
            Icon={IconTrendUp}
            label={t('dashboard.monthly_income')}
            value={fmtBRL(stats.income)}
            delta={`${stats.incomeDelta >= 0 ? '+' : ''}${stats.incomeDelta}% (${fmtBRL(stats.income - stats.income * (stats.incomeDelta / 100))})`}
            deltaPositive={stats.incomeDelta >= 0}
          />
          <StatCard
            Icon={IconReceipt}
            label={t('dashboard.monthly_expenses')}
            value={fmtBRL(stats.expense)}
            delta={`${stats.expenseDelta >= 0 ? '+' : ''}${stats.expenseDelta}% (${fmtBRL(stats.expense - stats.expense * (stats.expenseDelta / 100))})`}
            deltaPositive={stats.expenseDelta <= 0}
          />
        </div>

        {/* Middle row: Balance Flow + Spending Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-5">
          {/* Balance Flow */}
          <div className="bg-bg-card border border-border rounded-2xl p-[22px] shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTrendUpAccent size={18} />
                <span className="text-tmpl-title-sm">{t('dashboard.balance_flow')}</span>
              </div>
              <IconMoreDots size={18} color="var(--color-text-subtle)" />
            </div>
            <div className="text-tmpl-stat-total mt-3.5">{fmtBRL(stats.totalSavings + stats.monthlyBalance + 30000)}</div>
            <div className="text-tmpl-body text-text-muted mt-0.5">Total Balance</div>
            <div className="text-tmpl-label mt-1.5">
              <span className="text-success font-semibold">+12% (R$ 4.520)</span>{' '}
              <span className="text-text-subtle">· {t('period.30d')}</span>
            </div>

            <div className="flex flex-wrap gap-[18px] items-end mt-4">
              {/* sub-card Savings Goal */}
              <div className="flex-1 min-w-[190px] max-w-[220px] bg-bg border border-border rounded-[13px] p-4">
                <div className="text-[14px] font-semibold leading-tight">{t('dashboard.savings_goal_title')}</div>
                <div className="text-tmpl-label text-text-muted leading-[1.5] mt-2">
                  {t('dashboard.savings_goal_body')}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-1 items-center">
                    <span className="w-[18px] h-1 rounded-full bg-accent" />
                    <span className="w-1.5 h-1 rounded-full bg-border-strong" />
                    <span className="w-1.5 h-1 rounded-full bg-border-strong" />
                  </div>
                  <div className="flex gap-1.5">
                    <button className="w-7 h-7 rounded-full border border-border bg-bg-card flex items-center justify-center hover:bg-bg-hover">
                      <ChevronLeft size={13} color="var(--color-text-muted)" />
                    </button>
                    <button className="w-7 h-7 rounded-full border border-border bg-bg-card flex items-center justify-center hover:bg-bg-hover">
                      <ChevronRight size={13} color="var(--color-text-muted)" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Chart */}
              <div className="flex-1 min-w-[220px]">
                <svg viewBox="0 0 400 150" preserveAspectRatio="none" style={{ width: '100%', height: 150, display: 'block', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="flowfill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={flow.areaPath} fill="url(#flowfill)" />
                  <path
                    d={flow.linePath}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1={flow.dotX}
                    y1="0"
                    x2={flow.dotX}
                    y2="150"
                    stroke="var(--color-border-strong)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={flow.dotX}
                    cy={flow.dotY}
                    r="4.5"
                    fill="var(--color-accent)"
                    stroke="var(--color-bg-card)"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Spending Breakdown */}
          <div className="bg-bg-card border border-border rounded-2xl p-[22px] shadow-card flex flex-col">
            <div className="flex items-center gap-2">
              <IconGridAccent size={18} />
              <span className="text-tmpl-title-sm">{t('dashboard.spending_breakdown')}</span>
            </div>

            <div className="flex items-center gap-5 mt-4 flex-1">
              <div className="relative w-[128px] h-[128px] shrink-0">
                <Donut segments={spending} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold tracking-tight">{spendingTotal.toLocaleString('pt-BR')}</div>
                  <div className="text-tmpl-micro-xs text-text-muted">{t('dashboard.total_spent')}</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {spending.length === 0 ? (
                  <div className="text-xs text-text-subtle">{t('dashboard.no_spending_data')}</div>
                ) : (
                  spending.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-[3px] h-[18px] rounded-full shrink-0"
                        style={{ background: s.color }}
                      />
                      <span className="text-tmpl-body-sm text-text-muted flex-1">{s.label}</span>
                      <span className="text-tmpl-body font-semibold">{s.valLabel}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 w-full bg-bg border border-border rounded-[11px] py-[11px] mt-[18px] text-tmpl-body font-semibold text-text hover:bg-bg-hover transition-colors">
              {t('dashboard.more_details')}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}