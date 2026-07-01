import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Bell,
  CreditCard,
  Wallet,
  Users,
  FileText,
  Landmark,
  Globe,
  Settings as SettingsIcon,
  HelpCircle,
  MessageSquare,
  Zap,
  ChevronsUpDown,
  ChevronRight,
  FolderKanban,
  CheckSquare,
  Contact,
  Send,
  Search,
  Receipt,
  Timer,
  Target,
  type LucideIcon
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useProfileStore } from '../../store/useProfile'
import { useT } from '../../lib/i18n'
import { ProfileSwitcher } from './ProfileSwitcher'

type Item = {
  path: string
  /** i18n key. */
  label: string
  Icon: LucideIcon
}

const MAIN_MENU_PERSONAL: Item[] = [
  { path: '/', label: 'nav.dashboard', Icon: LayoutDashboard },
  { path: '/projects', label: 'nav.tasks', Icon: CheckSquare },
  { path: '/calendar', label: 'nav.calendar', Icon: Timer },
  { path: '/notifications', label: 'nav.notifications', Icon: Bell },
  { path: '/earnings', label: 'nav.earnings', Icon: CreditCard },
  { path: '/spending', label: 'nav.spending', Icon: Wallet },
  { path: '/subscriptions', label: 'nav.subscriptions', Icon: Users },
  { path: '/reports', label: 'nav.reports', Icon: FileText },
  { path: '/transactions', label: 'nav.transactions', Icon: Landmark },
  { path: '/performance', label: 'nav.performance', Icon: Globe },
  { path: '/settings', label: 'nav.settings', Icon: SettingsIcon }
]

const MAIN_MENU_PROFESSIONAL: Item[] = [
  { path: '/', label: 'nav.dashboard', Icon: LayoutDashboard },
  { path: '/projects', label: 'nav.projects', Icon: FolderKanban },
  { path: '/calendar', label: 'nav.calendar', Icon: Timer },
  { path: '/notifications', label: 'nav.clients', Icon: Contact },
  { path: '/earnings', label: 'nav.earnings', Icon: CreditCard },
  { path: '/spending', label: 'nav.leads_finder', Icon: Search },
  { path: '/subscriptions', label: 'nav.outreach', Icon: Send },
  { path: '/reports', label: 'nav.receipts', Icon: Receipt },
  { path: '/transactions', label: 'nav.ritmo', Icon: Timer },
  { path: '/performance', label: 'nav.goals', Icon: Target },
  { path: '/settings', label: 'nav.settings', Icon: SettingsIcon }
]

const GENERAL: Item[] = [
  { path: '/settings', label: 'nav.settings', Icon: SettingsIcon },
  { path: '/help', label: 'nav.help', Icon: HelpCircle },
  { path: '/feedback', label: 'nav.feedback', Icon: MessageSquare }
]

// Itens legados do KUXY (não aparecem por default — só se o usuário
// adicionar explicitamente via customização de sidebar do perfil).
const LEGACY_PATH_MAP: Record<string, Item> = {
  '/habits': { path: '/habits', label: 'nav.habits', Icon: LayoutDashboard },
  '/routines': { path: '/routines', label: 'nav.routines', Icon: LayoutDashboard },
  '/calendar': { path: '/calendar', label: 'nav.calendar', Icon: LayoutDashboard },
  '/stats': { path: '/stats', label: 'nav.stats', Icon: LayoutDashboard },
  '/journal': { path: '/journal', label: 'nav.journal', Icon: LayoutDashboard },
  '/focus': { path: '/focus', label: 'nav.focus', Icon: LayoutDashboard },
  '/goals': { path: '/goals', label: 'nav.goals', Icon: LayoutDashboard },
  '/finance': { path: '/finance', label: 'nav.finance', Icon: Wallet },
  '/contacts': { path: '/contacts', label: 'nav.contacts', Icon: LayoutDashboard }
}

function SidebarItem({ item, t }: { item: Item; t: (k: string) => string }) {
  const Icon = item.Icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-[11px] px-3 py-[9px] rounded-lg text-[14px] font-medium transition-colors group',
          isActive ? 'text-text' : 'text-text-subtle hover:text-text'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r transition-opacity"
            style={{
              background: 'var(--color-accent-line)',
              opacity: isActive ? 1 : 0
            }}
          />
          <Icon size={18} strokeWidth={1.75} />
          <span>{t(item.label)}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const t = useT()
  const navigate = useNavigate()
  const active = useProfileStore((s) => s.getActive())

  const mainMenu = active?.type === 'professional' ? MAIN_MENU_PROFESSIONAL : MAIN_MENU_PERSONAL

  const templatePaths = new Set([...mainMenu.map((i) => i.path), ...GENERAL.map((i) => i.path)])
  const allowedLegacy =
    active?.sidebarItems?.filter((p) => !templatePaths.has(p) && LEGACY_PATH_MAP[p]) ?? []

  return (
    <aside
      className="shrink-0 border-r border-[#1b1b1e] flex flex-col h-screen"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--color-bg-subtle)',
        padding: '22px 16px 16px'
      }}
    >
      {/* Profile switcher — dropdown com lista de perfis + criar/editar */}
      <div className="relative mb-[26px]">
        <ProfileSwitcher />
      </div>

      {/* Main Menu heading (12px/500) */}
      <div className="flex items-center gap-[5px] px-2 mb-2" style={{ color: '#6a6a70' }}>
        <span className="text-[12px] font-medium">{t('sidebar.main_menu')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <nav className="flex flex-col gap-[1px]">
        {mainMenu.map((item) => (
          <SidebarItem key={item.path} item={item} t={t} />
        ))}
      </nav>

      {/* Itens legados permitidos pelo perfil (default = vazio) */}
      {allowedLegacy.length > 0 && (
        <>
          <div className="flex items-center gap-[5px] px-2 mt-[18px] mb-2" style={{ color: '#6a6a70' }}>
            <span className="text-[12px] font-medium">{t('sidebar.legacy')}</span>
          </div>
          <nav className="flex flex-col gap-[1px]">
            {allowedLegacy.map((path) => {
              const item = LEGACY_PATH_MAP[path]
              return <SidebarItem key={path} item={item} t={t} />
            })}
          </nav>
        </>
      )}

      {/* General heading (12px/500) */}
      <div className="flex items-center gap-[5px] px-2 mt-[18px] mb-2" style={{ color: '#6a6a70' }}>
        <span className="text-[12px] font-medium">{t('nav.general')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <nav className="flex flex-col gap-[1px]">
        {GENERAL.map((item) => (
          <SidebarItem key={item.path} item={item} t={t} />
        ))}
      </nav>

      {/* Trial card — gradient 165deg + border #232327 + border-radius 14px */}
      <div className="mt-auto relative overflow-hidden p-4 rounded-[14px] border border-[#232327]"
        style={{ background: 'linear-gradient(165deg, #161619, #101012)' }}>
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center mb-[14px]"
          style={{ background: '#202024' }}
        >
          <Zap size={18} strokeWidth={0} fill="#cbd5e1" />
        </div>
        <div className="text-[15px] font-semibold mb-[10px]" style={{ color: '#f4f4f6' }}>
          Free Trial Version
        </div>
        <div className="h-[5px] rounded-[3px] overflow-hidden mb-[10px]" style={{ background: '#26262a' }}>
          <div
            className="h-full rounded-[3px]"
            style={{ width: '62%', background: '#6b6b72' }}
          />
        </div>
        <div className="text-[12px] leading-[1.45] mb-[13px]" style={{ color: '#86868d' }}>
          {t('sidebar.trial_body', { days: 4 })}
        </div>
        <div className="flex items-center gap-[6px] text-[13px] font-medium cursor-pointer" style={{ color: '#e8e8ea' }}>
          {t('sidebar.trial_cta')}
          <ChevronRight size={14} />
        </div>
      </div>

      {/* User button — avatar 34x34 gradient azul + nome + email + chevrons */}
      <div
        className="flex items-center gap-[10px] mt-3 px-2 py-2 rounded-[12px] cursor-pointer hover:bg-bg transition-colors"
        style={{ border: '1px solid #1d1d20' }}
        onClick={() => navigate('/settings/profile')}
      >
        <div
          className="w-[34px] h-[34px] rounded-full shrink-0"
          style={{ background: 'linear-gradient(135deg, #5b6b8c, #2c3447)' }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold truncate" style={{ color: '#f0f0f2' }}>
            Nero Design
          </div>
          <div
            className="text-[11px] truncate"
            style={{ color: '#7a7a80' }}
          >
            neroodesigner@gmail.com
          </div>
        </div>
        <ChevronsUpDown size={16} color="#6a6a70" />
      </div>
    </aside>
  )
}