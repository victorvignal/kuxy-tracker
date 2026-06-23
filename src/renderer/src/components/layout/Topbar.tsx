import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/i18n'
import { NewHabitDialog } from '../habits/NewHabitDialog'
import {
  IconDashboard,
  IconSearch,
  IconPlus,
  IconInvite
} from '../template-icons/TemplateIcon'

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
  const [showNewHabit, setShowNewHabit] = useState(false)

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
      // simple inline feedback — toast padrão não é requisito do template
      alert(t('topbar.invite_copied'))
    } catch {
      // fallback
      alert('https://kuxy.app/download')
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-20 bg-bg border-b border-border flex items-center gap-[18px] shrink-0"
        style={{ padding: '14px 28px', height: 'var(--topbar-height)' }}
      >
        {/* Title com ícone (template: Dashboard icon + name) */}
        <div className="flex items-center gap-2.5">
          <IconDashboard size={20} color="var(--color-text)" />
          <span className="text-[18px] font-bold tracking-tight">{title}</span>
        </div>

        {/* Search bar com atalho ⌘K (template) */}
        <div className="flex-1 max-w-[430px] relative">
          <IconSearch
            size={16}
            color="var(--color-text-subtle)"
            className="absolute left-[14px] top-1/2 -translate-y-1/2"
          />
          <input
            id="topbar-search"
            type="text"
            placeholder={t('common.search')}
            className="w-full bg-bg-card border border-border rounded-[10px] text-[13.5px] text-text placeholder:text-text-subtle outline-none focus:border-border-strong transition-colors"
            style={{ padding: '10px 50px 10px 40px' }}
          />
          <div className="absolute right-[10px] top-1/2 -translate-y-1/2 flex gap-0.5">
            <span className="text-[11px] text-text-subtle border border-border bg-bg rounded-[5px] px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Botão Add (template) */}
        <button
          onClick={() => setShowNewHabit(true)}
          className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] text-[13.5px] font-semibold text-text hover:bg-bg-hover transition-colors"
          style={{ padding: '9px 15px' }}
        >
          {t('common.add')}
          <IconPlus size={15} />
        </button>

        {/* Botão Invite (template) */}
        <button
          onClick={handleInvite}
          className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] text-[13.5px] font-semibold text-text hover:bg-bg-hover transition-colors"
          style={{ padding: '9px 15px' }}
        >
          <IconInvite size={15} />
          {t('topbar.invite')}
        </button>
      </header>

      {showNewHabit && <NewHabitDialog onClose={() => setShowNewHabit(false)} />}
    </>
  )
}