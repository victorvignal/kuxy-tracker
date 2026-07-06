import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutGrid,
  Search,
  Plus,
  Send
} from 'lucide-react'
import { useT } from '../../lib/i18n'
import { NewHabitDialog } from '../habits/NewHabitDialog'
import { NewProjectDialog } from '../projects/NewProjectDialog'
import { SubscriptionDialog } from '../finance/SubscriptionDialog'
import { AccountDialog } from '../finance/AccountDialog'
import { BudgetDialog } from '../finance/BudgetDialog'
import { useProfileStore } from '../../store/useProfile'
import { useFinanceData } from '../../hooks/useFinanceData'

const TITLE_KEYS_BY_PROFILE: Record<string, Record<'personal' | 'professional', string>> = {
  '/': { personal: 'nav.dashboard', professional: 'nav.dashboard' },
  '/notifications': { personal: 'nav.notifications', professional: 'nav.clients' },
  '/earnings': { personal: 'nav.earnings', professional: 'nav.earnings' },
  '/spending': { personal: 'nav.spending', professional: 'nav.leads_finder' },
  '/subscriptions': { personal: 'nav.subscriptions', professional: 'nav.outreach' },
  '/reports': { personal: 'nav.reports', professional: 'nav.receipts' },
  '/transactions': { personal: 'nav.transactions', professional: 'nav.ritmo' },
  '/performance': { personal: 'nav.performance', professional: 'nav.goals' },
  '/more': { personal: 'nav.more', professional: 'nav.more' },
  '/contacts': { personal: 'nav.contacts', professional: 'nav.contacts' },
  '/help': { personal: 'nav.help', professional: 'nav.help' },
  '/feedback': { personal: 'nav.feedback', professional: 'nav.feedback' },
  '/habits': { personal: 'nav.habits', professional: 'nav.habits' },
  '/routines': { personal: 'nav.routines', professional: 'nav.routines' },
  '/calendar': { personal: 'nav.calendar', professional: 'nav.calendar' },
  '/stats': { personal: 'nav.stats', professional: 'nav.stats' },
  '/journal': { personal: 'nav.journal', professional: 'nav.journal' },
  '/focus': { personal: 'nav.focus', professional: 'nav.focus' },
  '/goals': { personal: 'nav.goals', professional: 'nav.goals' },
  '/finance': { personal: 'nav.finance', professional: 'nav.finance' },
  '/projects': { personal: 'nav.tasks', professional: 'nav.projects' },
  '/settings': { personal: 'nav.settings', professional: 'nav.settings' }
}

export function Topbar() {
  const location = useLocation()
  const t = useT()
  const activeProfile = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()
  const [showNewHabit, setShowNewHabit] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewSubscription, setShowNewSubscription] = useState(false)
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [showNewBudget, setShowNewBudget] = useState(false)

  // Mapeia rota atual → dialog que o "+ Add" deve abrir.
  // Se não houver dialog pra rota, o botão fica escondido (não faz sentido
  // criar nada em /notifications, /reports estáticos, etc).
  const isPro = activeProfile?.type === 'professional'
  const addHandler: (() => void) | null = (() => {
    const path = location.pathname
    if (path === '/habits' || path === '/calendar') return () => setShowNewHabit(true)
    if (path === '/projects') return () => setShowNewProject(true)
    // Em perfil professional, /subscriptions → Outreach (sem dialog externo)
    if (path === '/subscriptions' && !isPro) return () => setShowNewSubscription(true)
    // Em perfil personal, /transactions → Transações, /finance → Finance
    if (!isPro && (path === '/finance' || path === '/transactions')) return () => setShowNewAccount(true)
    // Em perfil personal, /earnings e /spending → Budget
    if (!isPro && (path === '/earnings' || path === '/spending')) return () => setShowNewBudget(true)
    return null
  })()

  // ⌘K / Ctrl+K → foca a search bar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const el = document.getElementById('topbar-search') as HTMLInputElement | null
        el?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const titleKeys = TITLE_KEYS_BY_PROFILE[location.pathname]
  const titleKey = titleKeys?.[activeProfile?.type === 'professional' ? 'professional' : 'personal']
  const title = t(titleKey ?? 'app.name')

  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText('https://kuxy.app/download')
      alert(t('topbar.invite_copied'))
    } catch {
      alert('https://kuxy.app/download')
    }
  }

  return (
      <>
        {/* Drag region: o Topbar inteiro é arrastável, mas os botões
            explicitamente desativam isso pra continuar clicáveis.
            No Windows, titleBarStyle:'hidden' + titleBarOverlay (definido
            em main/index.ts) reserva 38px no topo. O AppShell dá o
            padding-top pra essa área ficar abaixo da barra nativa do
            Windows. Aqui o Topbar ocupa só os 38px abaixo. */}
        <header
                  className="app-drag flex items-center gap-4 border-b shrink-0"
                  style={{
                    height: '38px',
                    padding: '0 24px',
                    background: 'var(--color-bg)',
                    borderColor: '#161619'
                  }}
                >
          {/* Title com ícone LayoutGrid 20px */}
          <div className="flex items-center gap-[9px] flex-1 min-w-0">
            <LayoutGrid size={20} color="#cfcfd4" strokeWidth={1.75} />
            <span
              className="text-[17px] font-semibold tracking-[-.01em]"
              style={{ color: '#f4f4f6' }}
            >
              {title}
            </span>
          </div>

          {/* Search bar 300x38 com ícone dentro + ⌘K à direita */}
          <div
                      className="app-no-drag flex items-center gap-[9px] rounded-[9px] shrink-0"
                      style={{
                        width: '300px',
                        height: '30px',
                        padding: '0 12px',
                        background: '#121214',
                        border: '1px solid #232327',
                        color: '#7a7a80'
                      }}
                    >
            <Search size={16} strokeWidth={1.75} />
            <input
              id="topbar-search"
              type="text"
              placeholder={t('common.search')}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-text placeholder:text-text-subtle-2"
            />
            <span
              className="text-[11px] border rounded-[5px] px-1.5 py-px"
              style={{ borderColor: '#2a2a2e', color: '#6a6a70' }}
            >
              ⌘K
            </span>
          </div>

          {/* Divisor */}
          <div className="app-no-drag w-px h-6" style={{ background: '#232327' }} />

          {/* Botão Add — contextual à rota */}
          {addHandler && (
            <button
                          onClick={addHandler}
                          className="app-no-drag flex items-center gap-[7px] h-[30px] px-[14px] rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
                          style={{
                            background: '#161619',
                            border: '1px solid #232327',
                            color: '#e8e8ea'
                          }}
                        >
              Add
              <Plus size={16} strokeWidth={1.75} />
            </button>
          )}

          {/* Botão Invite */}
          <button
                      onClick={handleInvite}
                      className="app-no-drag flex items-center gap-[7px] h-[30px] px-4 rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
                      style={{
                        background: '#161619',
                        border: '1px solid #232327',
                        color: '#e8e8ea'
                      }}
                    >
            <Send size={16} strokeWidth={1.75} />
            Invite
          </button>
        </header>

      {showNewHabit && <NewHabitDialog onClose={() => setShowNewHabit(false)} />}

      {showNewProject && activeProfile && (
        <NewProjectDialog
          onClose={() => setShowNewProject(false)}
          onCreated={() => setShowNewProject(false)}
          profileId={activeProfile.id}
          initialStatus="todo"
        />
      )}

      {showNewSubscription && activeProfile && (
        <SubscriptionDialog
          onClose={() => setShowNewSubscription(false)}
          onSaved={() => setShowNewSubscription(false)}
          accounts={accounts as any}
          categories={categories as any}
        />
      )}

      {showNewAccount && activeProfile && (
        <AccountDialog
          onClose={() => setShowNewAccount(false)}
          onSaved={() => setShowNewAccount(false)}
        />
      )}

      {showNewBudget && activeProfile && (
        <BudgetDialog
          onClose={() => setShowNewBudget(false)}
          onSaved={() => setShowNewBudget(false)}
          categories={categories as any}
        />
      )}
    </>
  )
}