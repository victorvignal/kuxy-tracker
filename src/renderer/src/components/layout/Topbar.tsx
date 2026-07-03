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

const TITLE_KEYS: Record<string, string> = {
  '/': 'nav.dashboard',
  '/notifications': 'nav.notifications',
  '/earnings': 'nav.earnings',
  '/spending': 'nav.spending',
  '/subscriptions': 'nav.subscriptions',
  '/reports': 'nav.reports',
  '/transactions': 'nav.transactions',
  '/performance': 'nav.performance',
  '/more': 'nav.more',
  '/contacts': 'nav.contacts',
  '/help': 'nav.help',
  '/feedback': 'nav.feedback',
  '/habits': 'nav.habits',
  '/routines': 'nav.routines',
  '/calendar': 'nav.calendar',
  '/stats': 'nav.stats',
  '/journal': 'nav.journal',
  '/focus': 'nav.focus',
  '/goals': 'nav.goals',
  '/finance': 'nav.finance',
  '/projects': 'nav.projects',
  '/settings': 'nav.settings'
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
  const addHandler: (() => void) | null = (() => {
      switch (location.pathname) {
        case '/habits':
        case '/calendar':
          return () => setShowNewHabit(true)
        case '/projects':
          return () => setShowNewProject(true)
        case '/subscriptions':
          return () => setShowNewSubscription(true)
        case '/finance':
        case '/transactions':
          return () => setShowNewAccount(true)
        case '/earnings':
        case '/spending':
          return () => setShowNewBudget(true)
        default:
          return null
      }
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

  const title = t(TITLE_KEYS[location.pathname] ?? 'app.name')

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