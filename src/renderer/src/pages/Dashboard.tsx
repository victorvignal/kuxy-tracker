import { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  ChevronDown,
  Wallet as WalletIcon,
  CreditCard,
  PiggyBank as PiggyIcon,
  FolderKanban,
  LayoutGrid
} from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { AccountDialog } from '../components/finance/AccountDialog'
import { SubscriptionDialog } from '../components/finance/SubscriptionDialog'
import { BudgetDialog } from '../components/finance/BudgetDialog'
import { NewProjectDialog } from '../components/projects/NewProjectDialog'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Donut } from '../components/ui/Donut'
import { RevenueChart } from '../components/ui/RevenueChart'
import { Avatar } from '../components/ui/Avatar'
import { DashboardPro } from './DashboardPro'

// Valores fixos pra comparar com template (não puxam do Finance ainda).
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
    { value: 3200, label: 'Housing', color: '#8b5cf6', display: '3.200' },
    { value: 1850, label: 'Food', color: '#a78bfa', display: '1.850' },
    { value: 1250, label: 'Transport', color: '#6d4ee0', display: '1.250' },
    { value: 999, label: 'Health', color: '#4f4193', display: '999' }
  ]
}

const PERIOD_OPTIONS = [
  { value: '30', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '1y', label: '1 Year' }
] as const
type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

const CONTACT_ROWS = [
  { id: '001', name: 'Maria Silva', avColor: '#f472b6', email: 'maria@gmail.com', status: 'Active', tone: 'success' as const, date: '2025-06-01', source: 'Family' },
  { id: '002', name: 'João Santos', avColor: '#60a5fa', email: 'joao.s@gmail.com', status: 'Active', tone: 'success' as const, date: '2025-05-22', source: 'Friend' },
  { id: '003', name: 'Ana Costa', avColor: '#a78bfa', email: 'ana.costa@outlook.com', status: 'Pending', tone: 'warning' as const, date: '2025-04-15', source: 'Work' },
  { id: '004', name: 'Pedro Lima', avColor: '#34d399', email: 'pedro.lima@gmail.com', status: 'Active', tone: 'success' as const, date: '2025-04-02', source: 'Family' },
  { id: '005', name: 'Carla Souza', avColor: '#fbbf24', email: 'carla.souza@hotmail.com', status: 'Inactive', tone: 'muted' as const, date: '2025-03-20', source: 'Work' },
  { id: '006', name: 'Lucas Rocha', avColor: '#22d3ee', email: 'lucas.r@gmail.com', status: 'Active', tone: 'success' as const, date: '2025-03-11', source: 'Friend' }
]

export function Dashboard() {
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()
  const [period, setPeriod] = useState<PeriodValue>('30')

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

  // Perfil Profissional usa o dashboard rico do design Pro.
  if (active?.type === 'professional') {
    return <DashboardPro />
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Filter row */}
        <div className="flex items-center justify-between mb-[18px]">
          <SegmentedControl<PeriodValue>
            options={PERIOD_OPTIONS as any}
            value={period}
            onChange={setPeriod}
          />
          <div className="flex items-center gap-[10px]">
            <Btn variant="secondary" leftIcon={<Upload size={16} strokeWidth={1.75} />}>
              Export
            </Btn>
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
            label="Monthly Balance"
            value={TEST_VALUES.monthlyBalance.value}
            delta={TEST_VALUES.monthlyBalance.delta}
            positive
          />
          <StatCard
            label="Total Savings"
            value={TEST_VALUES.totalSavings.value}
            delta={TEST_VALUES.totalSavings.delta}
            positive
          />
          <StatCard
            label="Monthly Income"
            value={TEST_VALUES.monthlyIncome.value}
            delta={TEST_VALUES.monthlyIncome.delta}
            positive
          />
          <StatCard
            label="Monthly Expenses"
            value={TEST_VALUES.monthlyExpenses.value}
            delta={TEST_VALUES.monthlyExpenses.delta}
            positive={false}
          />
        </div>

        {/* Middle row: Revenue Flow + Spending Breakdown */}
        <div className="flex gap-4 mb-4">
          {/* Revenue Flow */}
          <Card className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} color="#4ade80" strokeWidth={1.75} />
                <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                  Revenue Flow
                </span>
              </div>
            </div>
            <div className="flex gap-[18px]">
              {/* Hero number + Insight sub-card */}
              <div className="w-[188px] shrink-0">
                <div className="text-[27px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
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
                <Card variant="inset">
                  <div className="text-[13px] font-semibold mb-[6px]" style={{ color: '#f0f0f2' }}>
                    {TEST_VALUES.insightTitle}
                  </div>
                  <div className="text-[11.5px] leading-[1.5] mb-4" style={{ color: '#86868d' }}>
                    {TEST_VALUES.insightText}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[5px]">
                      <span className="w-4 h-[3px] rounded-[2px]" style={{ background: '#7a7a80' }} />
                      <span className="w-2 h-[3px] rounded-[2px]" style={{ background: '#3a3a3e' }} />
                      <span className="w-2 h-[3px] rounded-[2px]" style={{ background: '#3a3a3e' }} />
                    </div>
                    <div className="flex gap-[6px]">
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: '#2e2e32', color: '#9a9aa0' }}>
                        <ChevronLeft size={14} />
                      </span>
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: '#2e2e32', color: '#9a9aa0' }}>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Revenue chart */}
              <div className="flex-1 min-w-0">
                <RevenueChart highlightIndex={10} />
              </div>
            </div>
          </Card>

          {/* Spending Breakdown */}
          <Card
            className="shrink-0 flex flex-col"
            style={{ width: 310 }}
            padding="18px 20px"
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
                <Donut
                  segments={TEST_VALUES.donutItems.map((d) => ({ value: d.value, color: d.color, label: d.label }))}
                />
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
                      {d.display}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Btn variant="secondary" rightIcon={<ChevronRight size={16} strokeWidth={1.75} />} className="mt-auto h-10">
              More details
            </Btn>
          </Card>
        </div>

        {/* Contacts table */}
        <ContactsTable />
      </div>

      {/* Dialogs do "+ New" dropdown */}
      {showAccount && active && <AccountDialog onClose={() => setShowAccount(false)} onSaved={() => setShowAccount(false)} />}
      {showSubscription && active && (
        <SubscriptionDialog onClose={() => setShowSubscription(false)} onSaved={() => setShowSubscription(false)} accounts={accounts as any} categories={categories as any} />
      )}
      {showBudget && active && <BudgetDialog onClose={() => setShowBudget(false)} onSaved={() => setShowBudget(false)} categories={categories as any} />}
      {showProject && active && <NewProjectDialog onClose={() => setShowProject(false)} onCreated={() => setShowProject(false)} profileId={active.id} initialStatus="todo" />}
    </div>
  )
}

function StatCard({
  label,
  value,
  delta,
  positive
}: {
  label: string
  value: string
  delta: string
  positive: boolean
}) {
  return (
    <Card className="flex-1">
      <div className="text-[13px] mb-[6px]" style={{ color: '#86868d' }}>
        {label}
      </div>
      <div className="text-[22px] font-bold mb-[9px]" style={{ color: '#f4f4f6' }}>
        {value}
      </div>
      <div className="text-[12px]" style={{ color: '#7a7a80' }}>
        <span style={{ color: positive ? '#4ade80' : '#f87171', fontWeight: 600 }}>{delta}</span>
        {' · Last 30 Days'}
      </div>
    </Card>
  )
}

function ContactsTable() {
  return (
    <Card>
      <div className="text-[15px] font-semibold mb-[14px]" style={{ color: '#f4f4f6' }}>
        {CONTACT_ROWS.length} Personal Contacts
      </div>
      <div
        className="flex items-center px-[6px] pb-[11px]"
        style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: 12, fontWeight: 500 }}
      >
        <div style={{ width: 30, flexShrink: 0 }}>
          <span className="inline-block w-[15px] h-[15px] rounded-[4px]" style={{ border: '1.5px solid #3a3a3e' }} />
        </div>
        <div style={{ width: 80, flexShrink: 0 }}>ID</div>
        <div style={{ flex: 1 }}>Name</div>
        <div style={{ flex: 1.3 }}>Email</div>
        <div style={{ width: 100, flexShrink: 0 }}>Status</div>
        <div style={{ width: 110, flexShrink: 0 }}>Date</div>
        <div style={{ width: 100, flexShrink: 0 }}>Source</div>
      </div>

      {CONTACT_ROWS.map((r) => (
        <div
          key={r.id}
          className="flex items-center px-[6px] py-[11px] hover:opacity-90 transition-colors"
          style={{ borderBottom: '1px solid #161618', fontSize: 13, color: '#e8e8ea' }}
        >
          <div style={{ width: 30, flexShrink: 0 }}>
            <span className="inline-block w-[15px] h-[15px] rounded-[4px]" style={{ border: '1.5px solid #3a3a3e' }} />
          </div>
          <div style={{ width: 80, flexShrink: 0, color: '#9a9aa0' }}>{r.id}</div>
          <div className="flex items-center gap-[9px]" style={{ flex: 1 }}>
            <Avatar gradient={r.avColor} initial={r.name.charAt(0)} size="sm" />
            {r.name}
          </div>
          <div style={{ flex: 1.3, color: '#9a9aa0' }}>{r.email}</div>
          <div style={{ width: 100, flexShrink: 0 }}>
            <Pill tone={r.tone} dot={false}>
              {r.status}
            </Pill>
          </div>
          <div style={{ width: 110, flexShrink: 0, color: '#b8b8be' }}>{r.date}</div>
          <div style={{ width: 100, flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: '#a78bfa' }}>{r.source}</div>
        </div>
      ))}
    </Card>
  )
}