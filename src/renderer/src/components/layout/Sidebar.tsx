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
  CalendarDays,
  Clock4,
  Target,
  Timer,
  BarChart3,
  BookOpen,
  Repeat,
  ListChecks,
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
  { path: '/calendar', label: 'nav.calendar', Icon: CalendarDays },
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
  { path: '/calendar', label: 'nav.calendar', Icon: CalendarDays },
  { path: '/notifications', label: 'nav.clients', Icon: Contact },
  { path: '/earnings', label: 'nav.earnings', Icon: CreditCard },
  { path: '/spending', label: 'nav.leads_finder', Icon: Search },
  { path: '/subscriptions', label: 'nav.outreach', Icon: Send },
  { path: '/reports', label: 'nav.receipts', Icon: Receipt },
  { path: '/transactions', label: 'nav.ritmo', Icon: Clock4 },
  { path: '/performance', label: 'nav.goals', Icon: Target },
  { path: '/settings', label: 'nav.settings', Icon: SettingsIcon }
]

const GENERAL: Item[] = [
  { path: '/help', label: 'nav.help', Icon: HelpCircle },
  { path: '/feedback', label: 'nav.feedback', Icon: MessageSquare }
]

// Itens legados do KUXY (não aparecem por default — só se o usuário
// adicionar explicitamente via customização de sidebar do perfil).
const LEGACY_PATH_MAP: Record<string, Item> = {
  '/habits': { path: '/habits', label: 'nav.habits', Icon: ListChecks },
  '/routines': { path: '/routines', label: 'nav.routines', Icon: Repeat },
  '/calendar': { path: '/calendar', label: 'nav.calendar', Icon: CalendarDays },
  '/stats': { path: '/stats', label: 'nav.stats', Icon: BarChart3 },
  '/journal': { path: '/journal', label: 'nav.journal', Icon: BookOpen },
  '/focus': { path: '/focus', label: 'nav.focus', Icon: Timer },
  '/goals': { path: '/goals', label: 'nav.goals', Icon: Target },
  '/finance': { path: '/finance', label: 'nav.finance', Icon: Wallet },
  '/contacts': { path: '/contacts', label: 'nav.contacts', Icon: Users }
}

// Defaults antigos do v0.4.x–v0.8.1. Perfis criados nessas versões têm
// sidebarItems = LEGACY_DEFAULT_* e vão aparecer com todos os itens
// legacy na sidebar. Consideramos "não-customizado" se o array é
// literalmente igual ao default antigo → filtramos fora pra não
// poluir a UI. Se o user realmente quis um subset desses, vai ter
// editado o form (que normaliza pra `DEFAULT_SIDEBAR_ITEMS[type]`
// ou explicitamente selecionou itens).
const LEGACY_DEFAULT_PERSONAL = new Set([
  '/', '/habits', '/routines', '/calendar', '/journal', '/focus', '/goals', '/finance'
])
const LEGACY_DEFAULT_PROFESSIONAL = new Set([
  '/', '/habits', '/stats', '/journal', '/focus', '/goals', '/finance', '/projects'
])

function isLegacyDefault(sidebarItems: string[], type: string): boolean {
  const legacy = type === 'professional' ? LEGACY_DEFAULT_PROFESSIONAL : LEGACY_DEFAULT_PERSONAL
  if (sidebarItems.length !== legacy.size) return false
  for (const p of sidebarItems) if (!legacy.has(p)) return false
  return true
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

  // Filtra items legados do perfil. Se o perfil ainda tem o default
  // antigo (LEGACY_DEFAULT_*) salvo no DB, considera como "não-customizado"
  // e ignora tudo (a sidebar fica limpa, sem seção Legacy).
  // Se o user editou explicitamente, mantém os itens extras marcados.
  const profileIsLegacyDefault =
    !!active?.sidebarItems && active.sidebarItems.length > 0 &&
    isLegacyDefault(active.sidebarItems, active.type || 'personal')

  const allowedLegacy = profileIsLegacyDefault
    ? []
    : active?.sidebarItems?.filter((p) => !templatePaths.has(p) && LEGACY_PATH_MAP[p]) ?? []

  return (
    <aside
      className="shrink-0 border-r border-[#1b1b1e] flex flex-col h-screen overflow-y-auto"
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
          {t('sidebar.trial_title')}
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

      {/* User button — avatar + nome do perfil + descrição + chevrons */}
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
            {active?.name || t('profile.select')}
          </div>
          <div
            className="text-[11px] truncate"
            style={{ color: '#7a7a80' }}
          >
            {active?.description || t('profile.default_name')}
          </div>
        </div>
        <ChevronsUpDown size={16} color="#6a6a70" />
      </div>
    </aside>
  )
}