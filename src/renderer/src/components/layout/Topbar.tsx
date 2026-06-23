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
      alert(t('topbar.invite_copied'))
    } catch {
      alert('https://kuxy.app/download')
    }
  }

  return (
    <>
      <header
        className="flex items-center gap-4 border-b shrink-0"
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
          className="flex items-center gap-[9px] rounded-[9px] shrink-0"
          style={{
            width: '300px',
            height: '38px',
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
        <div className="w-px h-6" style={{ background: '#232327' }} />

        {/* Botão Add (38px height, padding 0 14px, border-radius 9px) */}
        <button
          onClick={() => setShowNewHabit(true)}
          className="flex items-center gap-[7px] h-[38px] px-[14px] rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
          style={{
            background: '#161619',
            border: '1px solid #232327',
            color: '#e8e8ea'
          }}
        >
          Add
          <Plus size={16} strokeWidth={1.75} />
        </button>

        {/* Botão Invite (38px height, padding 0 16px, border-radius 9px) */}
        <button
          onClick={handleInvite}
          className="flex items-center gap-[7px] h-[38px] px-4 rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
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
    </>
  )
}