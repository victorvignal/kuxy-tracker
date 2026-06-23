import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useProfileStore } from '../../store/useProfile'
import { useT } from '../../lib/i18n'
import { ProfileSwitcher } from './ProfileSwitcher'
import {
  BrandLogo,
  IconDashboard,
  IconNotification,
  IconEarnings,
  IconSpending,
  IconSubscriptions,
  IconReports,
  IconTransactions,
  IconPerformance,
  IconMoreDots,
  IconSettings,
  IconHelp,
  IconFeedback,
  ChevronDoubleDown,
  ArrowRight
} from '../template-icons/TemplateIcon'

type Item = {
  path: string
  labelKey: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any
}

const MAIN_MENU: Item[] = [
  { path: '/', labelKey: 'nav.dashboard', Icon: IconDashboard },
  { path: '/notifications', labelKey: 'nav.notifications', Icon: IconNotification },
  { path: '/earnings', labelKey: 'nav.earnings', Icon: IconEarnings },
  { path: '/spending', labelKey: 'nav.spending', Icon: IconSpending },
  { path: '/subscriptions', labelKey: 'nav.subscriptions', Icon: IconSubscriptions },
  { path: '/reports', labelKey: 'nav.reports', Icon: IconReports },
  { path: '/transactions', labelKey: 'nav.transactions', Icon: IconTransactions },
  { path: '/performance', labelKey: 'nav.performance', Icon: IconPerformance },
  { path: '/more', labelKey: 'nav.more', Icon: IconMoreDots }
]

const GENERAL: Item[] = [
  { path: '/settings', labelKey: 'nav.settings', Icon: IconSettings },
  { path: '/help', labelKey: 'nav.help', Icon: IconHelp },
  { path: '/feedback', labelKey: 'nav.feedback', Icon: IconFeedback }
]

// Mapas legado → novo: rotas que existiam no KUXY antigo mas não no template.
// Mantidas no mapa de paths pra que deep links e bookmarks não quebrem,
// mas só aparecem se o perfil permitir explicitamente (default = false).
const LEGACY_PATH_MAP: Record<string, Item> = {
  '/habits': { path: '/habits', labelKey: 'nav.habits', Icon: IconPerformance },
  '/routines': { path: '/routines', labelKey: 'nav.routines', Icon: IconPerformance },
  '/calendar': { path: '/calendar', labelKey: 'nav.calendar', Icon: IconPerformance },
  '/stats': { path: '/stats', labelKey: 'nav.stats', Icon: IconPerformance },
  '/journal': { path: '/journal', labelKey: 'nav.journal', Icon: IconPerformance },
  '/focus': { path: '/focus', labelKey: 'nav.focus', Icon: IconPerformance },
  '/goals': { path: '/goals', labelKey: 'nav.goals', Icon: IconPerformance },
  '/finance': { path: '/finance', labelKey: 'nav.finance', Icon: IconSpending },
  '/projects': { path: '/projects', labelKey: 'nav.projects', Icon: IconPerformance },
  '/contacts': { path: '/contacts', labelKey: 'nav.contacts', Icon: IconPerformance }
}

export function Sidebar() {
  const t = useT()
  const navigate = useNavigate()
  const active = useProfileStore((s) => s.getActive())

  // Itens do template (sidebar nova) + itens legados permitidos pelo perfil.
  // Default = só os itens do template. Itens antigos ficam disponíveis se o
  // usuário adicionar via customização de sidebar do perfil.
  const templatePaths = new Set([...MAIN_MENU.map((i) => i.path), ...GENERAL.map((i) => i.path)])
  const allowedLegacy =
    active?.sidebarItems?.filter((p) => !templatePaths.has(p) && LEGACY_PATH_MAP[p]) ?? []

  return (
    <aside
      className="w-sidebar shrink-0 border-r border-border bg-bg-subtle flex flex-col h-screen"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Brand / Profile switcher (template: 18px 16px 14px padding) */}
      <div className="px-4 pt-[18px] pb-[14px]">
        <button
          onClick={() => navigate('/settings/profiles')}
          className="flex items-center gap-[11px] w-full bg-transparent hover:bg-bg-hover rounded-md py-1 px-1.5 transition-colors"
        >
          <span className="w-[34px] h-[34px] rounded-lg bg-black border border-border-strong flex items-center justify-center shrink-0">
            <BrandLogo size={17} />
          </span>
          <span className="text-base font-bold tracking-tight flex-1 text-left text-text">
            {active?.name ?? t('profile.default_name')}
          </span>
          <ChevronDoubleDown size={15} color="var(--color-text-subtle)" />
        </button>
      </div>

      {/* Nav scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {/* Main Menu heading */}
        <div className="flex items-center gap-1.5 px-2 pt-1.5 pb-2 text-text-subtle text-[11px] font-semibold uppercase tracking-wider">
          <span>{t('sidebar.main_menu')}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <nav className="flex flex-col gap-0.5">
          {MAIN_MENU.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-[11px] px-[11px] py-[9px] rounded-lg text-[13.5px] font-medium transition-colors',
                  isActive
                    ? 'bg-bg-hover text-text'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text'
                )
              }
            >
              <item.Icon size={17} color="currentColor" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Itens legados permitidos pelo perfil (default = vazio) */}
        {allowedLegacy.length > 0 && (
          <>
            <div className="flex items-center gap-1.5 px-2 pt-4 pb-2 text-text-subtle text-[11px] font-semibold uppercase tracking-wider">
              <span>{t('sidebar.legacy')}</span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {allowedLegacy.map((path) => {
                const item = LEGACY_PATH_MAP[path]
                return (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-[11px] px-[11px] py-[9px] rounded-lg text-[13.5px] font-medium transition-colors',
                        isActive
                          ? 'bg-bg-hover text-text'
                          : 'text-text-muted hover:bg-bg-hover hover:text-text'
                      )
                    }
                  >
                    <item.Icon size={17} color="currentColor" />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                )
              })}
            </nav>
          </>
        )}

        {/* General heading */}
        <div className="flex items-center gap-1.5 px-2 pt-[18px] pb-2 text-text-subtle text-[11px] font-semibold uppercase tracking-wider">
          <span>{t('sidebar.general')}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <nav className="flex flex-col gap-0.5">
          {GENERAL.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-[11px] px-[11px] py-[9px] rounded-lg text-[13.5px] font-medium transition-colors',
                  isActive
                    ? 'bg-bg-hover text-text'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text'
                )
              }
            >
              <item.Icon size={17} color="currentColor" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Trial card (template: gradient border + progress bar + Select plan) */}
      <div className="p-3">
        <div
          className="rounded-2xl border border-border p-[14px]"
          style={{ background: 'linear-gradient(160deg, var(--color-accent-soft), transparent)' }}
        >
          <span className="w-8 h-8 rounded-lg bg-bg-card border border-border-strong flex items-center justify-center">
            <BrandLogo size={15} />
          </span>
          <div className="text-[14px] font-semibold mt-3 text-text">Free Trial Version</div>
          <div className="h-[5px] rounded-full bg-border-strong mt-2.5 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: '42%' }}
            />
          </div>
          <div className="text-xs text-text-muted leading-snug mt-2.5">
            {t('sidebar.trial_body', { days: 4 })}
          </div>
          <button
            onClick={() => navigate('/settings/billing')}
            className="flex items-center gap-1.5 bg-transparent border-none p-0 mt-2.5 text-text text-[13px] font-semibold cursor-pointer hover:opacity-80"
          >
            {t('sidebar.trial_cta')}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Profile button (template: gradient avatar + name + chevron double) */}
      <div className="px-3 pb-3 pt-1.5">
        <button
          onClick={() => navigate('/settings/profile')}
          className="flex items-center gap-2.5 w-full bg-bg-card border border-border rounded-xl py-2 px-[11px] hover:bg-bg-hover transition-colors"
        >
          <span
            className="w-7 h-7 rounded-full shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
          />
          <span className="text-[13px] font-semibold flex-1 text-left text-text">
            Victor Vignal
          </span>
          <ChevronDoubleDown size={14} color="var(--color-text-subtle)" />
        </button>
      </div>

      {/* ProfileSwitcher modal trigger (hidden, used by Topbar button via store) */}
      <ProfileSwitcher />
    </aside>
  )
}