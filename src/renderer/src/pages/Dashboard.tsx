import { useState, useEffect, useRef } from 'react'
import { useT } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Receipt,
  LayoutGrid,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Upload,
  ChevronDown,
  CreditCard,
  Wallet as WalletIcon,
  PiggyBank as PiggyIcon,
  FolderKanban,
  type LucideIcon
} from 'lucide-react'
import { AccountDialog } from '../components/finance/AccountDialog'
import { SubscriptionDialog } from '../components/finance/SubscriptionDialog'
import { BudgetDialog } from '../components/finance/BudgetDialog'
import { NewProjectDialog } from '../components/projects/NewProjectDialog'
// (não usa fmtBRL — valores são fixos pra comparar com template)

/**
 * Dashboard Pessoal — réplica 1:1 do template
 * (C:\Users\vigna\Downloads\design\Tempo Dashboard.dc.html).
 *
 * Os valores mostrados são FIXOS/aleatórios (não puxam do Finance module)
 * pra permitir comparação direta com o template durante a iteração de design.
 * Quando o design estiver aprovado, reconecto com useFinanceData.
 *
 * Estrutura (na ordem do template):
 *  - Filter row (30 Days / 3 Months / 1 Year tabs + Export + New ▾)
 *  - Stat cards 4x1 (Monthly Balance / Total Savings / Monthly Income / Monthly Expenses)
 *  - Middle row: Revenue Flow (flex:1) + Spending Breakdown (width: 310px)
 *  - Contacts table
 */

const TEST_VALUES = {
  monthlyBalance: { value: 'R$ 9.999', delta: '+12% (R$ 1.080)' },
  totalSavings: { value: 'R$ 14.999', delta: '+8% (R$ 1.110)' },
  monthlyIncome: { value: 'R$ 7.499', delta: '+5% (R$ 357)' },
  monthlyExpenses: { value: 'R$ 3.299', delta: '-3% (R$ 102)' },
  revenueTotal: 'R$ 49.999',
  revenueSub: 'Total Balance',
  revenueChange: '+12% (R$ 5.454)',
  insightTitle: 'Savings Goal On Track!',
  insightText: 'You saved 32% of your income this month, exceeding the 25% target.',
  donutTotal: '7.299',
  donutItems: [
    { label: 'Housing', value: '3.200', color: '#8b5cf6' },
    { label: 'Food', value: '1.850', color: '#6d4ee0' },
    { label: 'Transport', value: '1.250', color: '#a78bfa' },
    { label: 'Health', value: '999', color: '#4f4193' }
  ]
}

// ---- Donut chart: 4 segmentos hardcoded do template (valores reais acima) ----
function Donut({ segments }: { segments: typeof TEST_VALUES.donutItems }) {
  const r = 46
  const circ = +(2 * Math.PI * r).toFixed(2) // ~289.03
  const total = segments.reduce((acc, s) => acc + parseFloat(s.value.replace(/\./g, '')), 0)
  let acc = 0
  return (
    <svg viewBox="0 0 120 120" style={{ width: 110, height: 110, transform: 'rotate(-90deg)' }}>
      {segments.map((s, i) => {
        const val = parseFloat(s.value.replace(/\./g, ''))
        const frac = val / total
        const dash = frac * circ
        const seg = {
          dasharray: `${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`,
          offset: (-acc * circ).toFixed(2)
        }
        acc += frac
        void i
        return (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={seg.dasharray}
            strokeDashoffset={seg.offset}
          />
        )
      })}
    </svg>
  )
}

// ---- Stat card (template: 22px valor / 13px label) ----
function StatCard({
  Icon,
  label,
  value,
  delta,
  positive
}: {
  Icon: LucideIcon
  label: string
  value: string
  delta: string
  positive: boolean
}) {
  return (
    <div
      className="flex-1 rounded-[14px] p-[18px]"
      style={{ background: '#141416', border: '1px solid #1f1f22' }}
    >
      <div className="mb-[14px]">
        <Icon size={18} color="#86868d" strokeWidth={1.75} />
      </div>
      <div className="text-[13px] mb-[6px]" style={{ color: '#86868d' }}>
        {label}
      </div>
      <div
        className="text-[22px] font-bold mb-[9px]"
        style={{ color: '#f4f4f6' }}
      >
        {value}
      </div>
      <div className="text-[12px]" style={{ color: '#7a7a80' }}>
        <span style={{ color: positive ? '#4ade80' : '#f87171', fontWeight: 600 }}>{delta}</span>
        {' · Last 30 Days'}
      </div>
    </div>
  )
}

export function Dashboard() {
  const t = useT()
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()
  const [period, setPeriod] = useState<0 | 1 | 2>(0)

  // Dropdown state do "+ New"
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const newMenuRef = useRef<HTMLDivElement>(null)

  // Dialogs
  const [showAccount, setShowAccount] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [showBudget, setShowBudget] = useState(false)
  const [showProject, setShowProject] = useState(false)

  useEffect(() => {
    if (!newMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setNewMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [newMenuOpen])

  const handleNewAction = (action: 'account' | 'subscription' | 'budget' | 'project') => {
    setNewMenuOpen(false)
    if (action === 'account') setShowAccount(true)
    else if (action === 'subscription') setShowSubscription(true)
    else if (action === 'budget') setShowBudget(true)
    else if (action === 'project') setShowProject(true)
  }

  // Se for perfil Profissional, mostra placeholder simples
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
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter row */}
        <div className="flex items-center justify-between mb-[18px]">
          <div
            className="flex rounded-[9px] p-[3px]"
            style={{ background: '#121214', border: '1px solid #202023' }}
          >
            {(['30 Days', '3 Months', '1 Year'] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => setPeriod(i as 0 | 1 | 2)}
                className="px-4 py-[7px] rounded-md text-[13px] font-medium transition-colors"
                style={{
                  background: period === i ? '#161619' : 'transparent',
                  color: period === i ? '#f4f4f6' : '#86868d',
                  fontWeight: period === i ? 600 : 500
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-[10px]">
            <button
              className="flex items-center gap-[7px] h-[38px] px-[14px] rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
              style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
            >
              <Upload size={16} strokeWidth={1.75} />
              Export
            </button>
            <div className="relative" ref={newMenuRef}>
              <div
                className="flex items-center h-[38px] rounded-[9px] overflow-hidden"
                style={{ background: '#161619', border: '1px solid #232327' }}
              >
                <button
                  onClick={() => setNewMenuOpen((o) => !o)}
                  className="px-[14px] h-full text-[13px] font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#e8e8ea' }}
                >
                  New
                </button>
                <span className="h-full w-px" style={{ background: '#232327' }} />
                <button
                  onClick={() => setNewMenuOpen((o) => !o)}
                  className="px-[9px] h-full flex items-center hover:opacity-80 transition-opacity"
                  style={{ color: '#9a9aa0' }}
                >
                  <ChevronDown size={16} strokeWidth={1.75} />
                </button>
              </div>

              {newMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+6px)] z-50 w-[220px] rounded-[12px] overflow-hidden shadow-pop"
                  style={{ background: '#161619', border: '1px solid #232327' }}
                >
                  <button
                    onClick={() => handleNewAction('account')}
                    className="w-full flex items-center gap-[10px] px-[14px] py-[10px] text-[13px] text-left hover:opacity-80 transition-opacity"
                    style={{ color: '#e8e8ea' }}
                  >
                    <WalletIcon size={15} color="#a78bfa" strokeWidth={1.75} />
                    <span>New Account</span>
                  </button>
                  <button
                    onClick={() => handleNewAction('subscription')}
                    className="w-full flex items-center gap-[10px] px-[14px] py-[10px] text-[13px] text-left hover:opacity-80 transition-opacity"
                    style={{ color: '#e8e8ea' }}
                  >
                    <CreditCard size={15} color="#4ade80" strokeWidth={1.75} />
                    <span>New Subscription</span>
                  </button>
                  <button
                    onClick={() => handleNewAction('budget')}
                    className="w-full flex items-center gap-[10px] px-[14px] py-[10px] text-[13px] text-left hover:opacity-80 transition-opacity"
                    style={{ color: '#e8e8ea' }}
                  >
                    <PiggyIcon size={15} color="#facc15" strokeWidth={1.75} />
                    <span>New Budget</span>
                  </button>
                  <span className="block h-px mx-[10px]" style={{ background: '#232327' }} />
                  <button
                    onClick={() => handleNewAction('project')}
                    className="w-full flex items-center gap-[10px] px-[14px] py-[10px] text-[13px] text-left hover:opacity-80 transition-opacity"
                    style={{ color: '#e8e8ea' }}
                  >
                    <FolderKanban size={15} color="#60a5fa" strokeWidth={1.75} />
                    <span>New Project</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards 4x1 */}
        <div className="flex gap-[14px] mb-4">
          <StatCard
            Icon={Wallet}
            label="Monthly Balance"
            value={TEST_VALUES.monthlyBalance.value}
            delta={TEST_VALUES.monthlyBalance.delta}
            positive
          />
          <StatCard
            Icon={PiggyBank}
            label="Total Savings"
            value={TEST_VALUES.totalSavings.value}
            delta={TEST_VALUES.totalSavings.delta}
            positive
          />
          <StatCard
            Icon={TrendingUp}
            label="Monthly Income"
            value={TEST_VALUES.monthlyIncome.value}
            delta={TEST_VALUES.monthlyIncome.delta}
            positive
          />
          <StatCard
            Icon={Receipt}
            label="Monthly Expenses"
            value={TEST_VALUES.monthlyExpenses.value}
            delta={TEST_VALUES.monthlyExpenses.delta}
            positive={false}
          />
        </div>

        {/* Middle row: Revenue Flow + Spending Breakdown */}
        <div className="flex gap-4 mb-4">
          {/* Revenue Flow — flex:1 */}
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} color="#4ade80" strokeWidth={1.75} />
                <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                  Revenue Flow
                </span>
              </div>
              <MoreHorizontal size={18} color="#6a6a70" />
            </div>
            <div className="flex gap-[18px]">
              {/* Sub-card Revenue text + Insight */}
              <div className="w-[188px] shrink-0">
                <div
                  className="text-[27px] font-bold tracking-[-.01em]"
                  style={{ color: '#f4f4f6' }}
                >
                  {TEST_VALUES.revenueTotal}
                </div>
                <div className="text-[13px] my-[5px]" style={{ color: '#86868d' }}>
                  {TEST_VALUES.revenueSub}
                </div>
                <div className="text-[12px] mb-[18px]" style={{ color: '#7a7a80' }}>
                  <span className="font-semibold" style={{ color: '#4ade80' }}>
                    {TEST_VALUES.revenueChange}
                  </span>
                  {' · Last 30 Days'}
                </div>
                {/* Insight sub-card */}
                <div
                  className="rounded-[12px] p-[14px]"
                  style={{ background: '#1b1b1e', border: '1px solid #26262a' }}
                >
                  <div className="text-[13px] font-semibold mb-[6px]" style={{ color: '#f0f0f2' }}>
                    {TEST_VALUES.insightTitle}
                  </div>
                  <div
                    className="text-[11.5px] leading-[1.5] mb-4"
                    style={{ color: '#86868d' }}
                  >
                    {TEST_VALUES.insightText}
                  </div>
                  <div className="flex items-center justify-between">
                    {/* Dots slider */}
                    <div className="flex items-center gap-[5px]">
                      <span className="w-4 h-[3px] rounded-[2px]" style={{ background: '#7a7a80' }} />
                      <span className="w-2 h-[3px] rounded-[2px]" style={{ background: '#3a3a3e' }} />
                      <span className="w-2 h-[3px] rounded-[2px]" style={{ background: '#3a3a3e' }} />
                    </div>
                    {/* Prev/Next buttons */}
                    <div className="flex gap-[6px]">
                      <span
                        className="w-6 h-6 rounded-full border flex items-center justify-center"
                        style={{ borderColor: '#2e2e32', color: '#9a9aa0' }}
                      >
                        <ChevronLeft size={14} />
                      </span>
                      <span
                        className="w-6 h-6 rounded-full border flex items-center justify-center"
                        style={{ borderColor: '#2e2e32', color: '#9a9aa0' }}
                      >
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart SVG (template: viewBox 460x200) */}
              <div className="flex-1 min-w-0">
                <svg viewBox="0 0 460 200" style={{ width: '100%', height: 200, display: 'block' }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="rf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines horizontais */}
                  <g stroke="#1c1c1f" strokeWidth="1">
                    <line x1="40" y1="24" x2="452" y2="24" />
                    <line x1="40" y1="62" x2="452" y2="62" />
                    <line x1="40" y1="100" x2="452" y2="100" />
                    <line x1="40" y1="138" x2="452" y2="138" />
                    <line x1="40" y1="172" x2="452" y2="172" />
                  </g>
                  {/* Area fill */}
                  <path
                    d="M45,150 L75,140 L100,148 L125,120 L150,130 L175,100 L200,112 L225,95 L255,105 L280,78 L300,92 L320,70 L345,82 L365,55 L390,68 L415,40 L445,30 L445,172 L45,172 Z"
                    fill="url(#rf)"
                  />
                  {/* Line */}
                  <path
                    d="M45,150 L75,140 L100,148 L125,120 L150,130 L175,100 L200,112 L225,95 L255,105 L280,78 L300,92 L320,70 L345,82 L365,55 L390,68 L415,40 L445,30"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Dot indicator + dashed vertical line */}
                  <line x1="300" y1="78" x2="300" y2="172" stroke="#6b6b72" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="300" cy="92" r="4.5" fill="#0a0a0b" stroke="#8b5cf6" strokeWidth="2.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Spending Breakdown — width 310px */}
          <div
            className="shrink-0 rounded-[14px] p-[18px] flex flex-col"
            style={{ width: 310, background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center justify-between mb-[18px]">
              <div className="flex items-center gap-2">
                <LayoutGrid size={16} color="#a78bfa" />
                <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                  Spending Breakdown
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 mb-5">
              <div className="relative w-[110px] h-[110px] shrink-0">
                <Donut segments={TEST_VALUES.donutItems} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[21px] font-bold leading-none" style={{ color: '#f4f4f6' }}>
                    {TEST_VALUES.donutTotal}
                  </div>
                  <div className="text-[9px] mt-[2px]" style={{ color: '#86868d' }}>
                    Total Spent
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {TEST_VALUES.donutItems.map((d, i) => (
                  <div key={i} className="flex items-center gap-[9px]">
                    <span className="w-[3px] h-[14px] rounded-[2px] shrink-0" style={{ background: d.color }} />
                    <span className="flex-1 text-[12px]" style={{ color: '#b8b8be' }}>
                      {d.label}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: '#f4f4f6' }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="mt-auto flex items-center justify-center gap-2 h-10 rounded-[10px] text-[13px] font-medium transition-colors hover:opacity-90"
              style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
            >
              More details
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Contacts table — placeholder visual (Contacts.tsx separado) */}
        <ContactsTable />
      </div>

      {/* Dialogs do "+ New" dropdown */}
      {showAccount && active && (
        <AccountDialog
          onClose={() => setShowAccount(false)}
          onSaved={() => setShowAccount(false)}
        />
      )}
      {showSubscription && active && (
        <SubscriptionDialog
          onClose={() => setShowSubscription(false)}
          onSaved={() => setShowSubscription(false)}
          accounts={accounts as any}
          categories={categories as any}
        />
      )}
      {showBudget && active && (
        <BudgetDialog
          onClose={() => setShowBudget(false)}
          onSaved={() => setShowBudget(false)}
          categories={categories as any}
        />
      )}
      {showProject && active && (
        <NewProjectDialog
          onClose={() => setShowProject(false)}
          onCreated={() => setShowProject(false)}
          profileId={active.id}
          initialStatus="todo"
        />
      )}
    </div>
  )
}

function ContactsTable() {
  const rows = [
    { id: '001', name: 'Maria Silva', av: '#f472b6', email: 'maria@gmail.com', status: 'Active', stBg: 'rgba(74,222,128,0.12)', stFg: '#4ade80', date: '2025-06-01', source: 'Family', srcColor: '#a78bfa' },
    { id: '002', name: 'João Santos', av: '#60a5fa', email: 'joao.s@gmail.com', status: 'Active', stBg: 'rgba(74,222,128,0.12)', stFg: '#4ade80', date: '2025-05-22', source: 'Friend', srcColor: '#a78bfa' },
    { id: '003', name: 'Ana Costa', av: '#a78bfa', email: 'ana.costa@outlook.com', status: 'Pending', stBg: 'rgba(250,204,21,0.12)', stFg: '#facc15', date: '2025-04-15', source: 'Work', srcColor: '#a78bfa' },
    { id: '004', name: 'Pedro Lima', av: '#34d399', email: 'pedro.lima@gmail.com', status: 'Active', stBg: 'rgba(74,222,128,0.12)', stFg: '#4ade80', date: '2025-04-02', source: 'Family', srcColor: '#a78bfa' },
    { id: '005', name: 'Carla Souza', av: '#fbbf24', email: 'carla.souza@hotmail.com', status: 'Inactive', stBg: 'rgba(122,122,128,0.12)', stFg: '#7a7a80', date: '2025-03-20', source: 'Work', srcColor: '#a78bfa' },
    { id: '006', name: 'Lucas Rocha', av: '#22d3ee', email: 'lucas.r@gmail.com', status: 'Active', stBg: 'rgba(74,222,128,0.12)', stFg: '#4ade80', date: '2025-03-11', source: 'Friend', srcColor: '#a78bfa' }
  ]

  return (
    <div
      className="rounded-[14px] p-[18px]"
      style={{ background: '#141416', border: '1px solid #1f1f22' }}
    >
      <div className="text-[15px] font-semibold mb-[14px]" style={{ color: '#f4f4f6' }}>
        6 Personal Contacts
      </div>

      {/* Header row */}
      <div
        className="flex items-center px-[6px] pb-[11px]"
        style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: '12px', fontWeight: 500 }}
      >
        <div className="w-[30px] shrink-0">
          <span
            className="inline-block w-[15px] h-[15px] rounded-[4px]"
            style={{ border: '1.5px solid #3a3a3e' }}
          />
        </div>
        <div className="w-[80px] shrink-0">ID</div>
        <div className="flex-1">Name</div>
        <div style={{ flex: 1.3 }}>Email</div>
        <div className="w-[100px] shrink-0">Status</div>
        <div className="w-[110px] shrink-0">Date</div>
        <div className="w-[100px] shrink-0">Source</div>
      </div>

      {/* Rows */}
      {rows.map((r) => (
        <div
          key={r.id}
          className="flex items-center px-[6px] py-[11px] hover:opacity-90 transition-colors"
          style={{ borderBottom: '1px solid #161618', fontSize: '13px', color: '#e8e8ea' }}
        >
          <div className="w-[30px] shrink-0">
            <span
              className="inline-block w-[15px] h-[15px] rounded-[4px]"
              style={{ border: '1.5px solid #3a3a3e' }}
            />
          </div>
          <div className="w-[80px] shrink-0" style={{ color: '#9a9aa0' }}>
            {r.id}
          </div>
          <div className="flex-1 flex items-center gap-[9px]">
            <span
              className="w-6 h-6 rounded-full shrink-0"
              style={{ background: r.av }}
            />
            {r.name}
          </div>
          <div style={{ flex: 1.3, color: '#9a9aa0' }}>{r.email}</div>
          <div className="w-[100px] shrink-0">
            <span
              className="inline-block py-[3px] px-[10px] rounded-[6px]"
              style={{ fontSize: '11.5px', fontWeight: 500, background: r.stBg, color: r.stFg }}
            >
              {r.status}
            </span>
          </div>
          <div className="w-[110px] shrink-0" style={{ color: '#b8b8be' }}>
            {r.date}
          </div>
          <div className="w-[100px] shrink-0" style={{ fontSize: '12.5px', fontWeight: 500, color: r.srcColor }}>
            {r.source}
          </div>
        </div>
      ))}
    </div>
  )
}