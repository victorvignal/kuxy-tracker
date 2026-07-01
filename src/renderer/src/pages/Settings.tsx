import { useEffect, useState } from 'react'
import {
  Bell,
  Database,
  Palette,
  Info,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  User
} from 'lucide-react'
import { cn, formatNumber } from '../lib/utils'
import { useT, useLangStore } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import { useSettingsStore, ACCENT_VARS, type AccentColor } from '../store/useSettings'

type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'up-to-date' }
  | { state: 'available'; version: string }
  | { state: 'downloading'; percent: number; transferred: number; total: number; bytesPerSecond: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }

type TabId = 'appearance' | 'notifications' | 'data' | 'updates' | 'profile' | 'about'

const SECTIONS: Array<{ id: TabId; labelKey: string; icon: typeof Bell }> = [
  { id: 'appearance', labelKey: 'settings.appearance', icon: Palette },
  { id: 'notifications', labelKey: 'settings.notifications', icon: Bell },
  { id: 'profile', labelKey: 'settings.profile', icon: User },
  { id: 'data', labelKey: 'settings.data', icon: Database },
  { id: 'updates', labelKey: 'settings.updates', icon: RefreshCw },
  { id: 'about', labelKey: 'settings.about', icon: Info }
]

/**
 * Hub de Settings. Seis seções:
 *   1. Appearance    → language, theme, accent
 *   2. Notifications → daily reminder, streak warning, weekly report + reminder time
 *   3. Profile       → mostra perfil ativo, conta perfis, link pro ProfileSwitcher
 *   4. Data & Backup → export JSON (real), import (preview-only por enquanto)
 *   5. Updates       → auto-update (já existia)
 *   6. About         → versão, storage, contagem de perfis
 *
 * Persistência:
 *   - Aparência + notif → useSettingsStore (zustand + localStorage)
 *   - Idioma → useLangStore (já existia)
 *   - Profile → DB via window.api.profiles (já existia)
 *   - Updates/About → read-only
 *
 * A aba ativa é lida de ?tab=X pra deep linking funcionar
 * (Settings/profile → /settings?tab=profile, /settings/billing → mantém em settings).
 */
export function Settings() {
  const t = useT()

  // Lê ?tab=X pra deep link entre sub-rotas
  const initialTab = (() => {
    if (typeof window === 'undefined') return 'appearance' as TabId
    const sp = new URLSearchParams(window.location.search)
    const raw = sp.get('tab')
    if (raw && SECTIONS.some((s) => s.id === raw)) return raw as TabId
    return 'appearance' as TabId
  })()
  const [active, setActive] = useState<TabId>(initialTab)

  return (
    <div className="p-6 max-w-5xl mx-auto flex gap-6">
      <aside className="w-56 shrink-0">
        <div className="px-3 mb-3">
          <h1 className="text-lg font-semibold tracking-tight">{t('settings.title')}</h1>
        </div>
        <nav className="space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                active === s.id
                  ? 'bg-bg-hover text-text'
                  : 'text-text-muted hover:text-text hover:bg-bg-hover/60'
              )}
            >
              <s.icon className="w-4 h-4" />
              {t(s.labelKey)}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 card p-6">
        {active === 'appearance' && <AppearanceSection />}
        {active === 'notifications' && <NotificationsSection />}
        {active === 'profile' && <ProfileSection />}
        {active === 'data' && <DataSection />}
        {active === 'updates' && <UpdatesSection />}
        {active === 'about' && <AboutSection />}
      </div>
    </div>
  )
}

// ─── Appearance ────────────────────────────────────────────────────────────

const ACCENT_SWATCH: Array<{ id: AccentColor; hex: string }> = [
  { id: 'violet', hex: ACCENT_VARS.violet['--color-accent'] },
  { id: 'blue', hex: ACCENT_VARS.blue['--color-accent'] },
  { id: 'green', hex: ACCENT_VARS.green['--color-accent'] },
  { id: 'amber', hex: ACCENT_VARS.amber['--color-accent'] },
  { id: 'pink', hex: ACCENT_VARS.pink['--color-accent'] }
]

function AppearanceSection() {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const themePref = useSettingsStore((s) => s.themePref)
  const setThemePref = useSettingsStore((s) => s.setThemePref)
  const accent = useSettingsStore((s) => s.accent)
  const setAccent = useSettingsStore((s) => s.setAccent)

  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{t('settings.appearance')}</h2>
      <p className="text-xs text-text-muted mb-5">{t('app.tagline')}</p>

      <Setting label={t('settings.language')} hint={t('settings.language_hint')}>
        <LangToggle lang={lang} setLang={setLang} />
      </Setting>

      <Setting label={t('settings.theme')} hint={t('settings.theme_hint')}>
        <div className="flex gap-1.5">
          {(['dark', 'light'] as const).map((th) => (
            <button
              key={th}
              onClick={() => setThemePref(th)}
              disabled={th === 'light'}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md border transition-colors',
                themePref === th
                  ? 'bg-accent-soft border-accent text-text'
                  : 'border-border text-text-muted hover:text-text',
                th === 'light' && 'opacity-50 cursor-not-allowed'
              )}
            >
              {t(`settings.theme_${th}`)}
            </button>
          ))}
        </div>
      </Setting>

      <Setting label={t('settings.accent')} hint="Used for highlights and active states">
        <div className="flex gap-2">
          {ACCENT_SWATCH.map((c) => (
            <button
              key={c.id}
              onClick={() => setAccent(c.id)}
              title={t(`settings.accent.${c.id}`)}
              aria-label={t(`settings.accent.${c.id}`)}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-transform',
                accent === c.id ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              )}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </Setting>
    </div>
  )
}

function LangToggle({ lang, setLang }: { lang: string; setLang: (l: 'en' | 'pt-BR') => void }) {
  const t = useT()
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setLang('en')}
        className={cn(
          'text-xs px-2.5 py-1 rounded-md border transition-colors',
          lang === 'en'
            ? 'bg-accent-soft border-accent text-text'
            : 'border-border text-text-muted hover:text-text'
        )}
      >
        {t('settings.lang.en')}
      </button>
      <button
        onClick={() => setLang('pt-BR')}
        className={cn(
          'text-xs px-2.5 py-1 rounded-md border transition-colors',
          lang === 'pt-BR'
            ? 'bg-accent-soft border-accent text-text'
            : 'border-border text-text-muted hover:text-text'
        )}
      >
        {t('settings.lang.pt-BR')}
      </button>
    </div>
  )
}

// ─── Notifications ─────────────────────────────────────────────────────────

function NotificationsSection() {
  const t = useT()
  const dailyReminder = useSettingsStore((s) => s.notifyDailyReminder)
  const setDailyReminder = useSettingsStore((s) => s.setNotifyDailyReminder)
  const streakWarning = useSettingsStore((s) => s.notifyStreakWarning)
  const setStreakWarning = useSettingsStore((s) => s.setNotifyStreakWarning)
  const weeklyReport = useSettingsStore((s) => s.notifyWeeklyReport)
  const setWeeklyReport = useSettingsStore((s) => s.setNotifyWeeklyReport)
  const reminderTime = useSettingsStore((s) => s.reminderTime)
  const setReminderTime = useSettingsStore((s) => s.setReminderTime)

  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{t('settings.notifications')}</h2>
      <p className="text-xs text-text-muted mb-5">{t('settings.notif_hint')}</p>

      <Setting label={t('settings.daily_reminder')} hint={t('settings.daily_reminder_hint')}>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            disabled={!dailyReminder}
            className="input w-32 disabled:opacity-40"
          />
          <Toggle checked={dailyReminder} onChange={setDailyReminder} />
        </div>
      </Setting>

      <Setting label={t('settings.streak_warning')} hint={t('settings.streak_warning_hint')}>
        <Toggle checked={streakWarning} onChange={setStreakWarning} />
      </Setting>

      <Setting label={t('settings.weekly_report')} hint={t('settings.weekly_report_hint')}>
        <Toggle checked={weeklyReport} onChange={setWeeklyReport} />
      </Setting>
    </div>
  )
}

// ─── Profile ───────────────────────────────────────────────────────────────

function ProfileSection() {
  const t = useT()
  const active = useProfileStore((s) => s.getActive())
  const profileCount = useProfileStore((s) => s.profiles.length)

  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{t('settings.profile')}</h2>
      <p className="text-xs text-text-muted mb-5">{t('settings.profile_hint')}</p>

      <Setting label={t('settings.profile_section')} hint={t('settings.profile_manage_hint')}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: active?.color ?? '#a855f7' }}
          >
            <User className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{active?.name ?? t('profile.select')}</div>
            <div className="text-[11px] text-text-muted">
              {formatNumber(profileCount)} {t('settings.profile_count')}
            </div>
          </div>
        </div>
      </Setting>

      <div className="mt-5 p-3 rounded-lg border border-border bg-bg-subtle text-xs text-text-muted">
        {t('settings.profile_manage_hint')}
      </div>
    </div>
  )
}

// ─── Data & Backup ─────────────────────────────────────────────────────────

/**
 * Estratégia de export/import:
 *   - Export → itera nas APIs de list() e junta tudo num único JSON.
 *     Baixa via Blob + a[download]. Real, sem IPC novo.
 *   - Import → abre arquivo, parseia, mostra preview de contagem por
 *     entidade. Persistência real depende de IPCs de bulk-create que
 *     não temos — então por enquanto só lê e mostra. Honesto.
 *   - Reset → sem IPC de wipe. Marcado como WIP, sem botão destrutivo.
 */
function DataSection() {
  const t = useT()
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [importPreview, setImportPreview] = useState<{
    filename: string
    counts: Record<string, number>
    total: number
  } | null>(null)
  const [importErr, setImportErr] = useState<string | null>(null)

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    setExportMsg(null)
    try {
      const api = window.api
      const dump: Record<string, any[]> = {}
      let total = 0

      // Lista todas as entities. Cada list é tolerante a ausência
      // de perfil ativo (passa {}).
      const tasks: Array<[string, Promise<any[]>]> = [
        ['profiles', api.profiles.list()],
        ['habits', api.habits.list({})],
        ['routines', api.routines.list({})],
        ['journal', api.journal.list({})],
        ['focus', api.focus.list({})],
        ['accounts', api.finance.accounts.list({})],
        ['categories', api.finance.categories.list({})],
        ['transactions', api.finance.transactions.list({})],
        ['subscriptions', api.finance.subscriptions.list({})],
        ['budgets', api.finance.budgets.list({})],
        ['projects', api.projects.list({})]
      ]
      for (const [key, p] of tasks) {
        try {
          const rows = await p
          dump[key] = rows
          total += rows.length
        } catch (e) {
          // entity pode falhar (ex: habits:list inválido) — segue
          console.warn(`[export] skip ${key}:`, e)
          dump[key] = []
        }
      }

      const blob = new Blob([JSON.stringify(dump, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      a.href = url
      a.download = `kuxy-export-${stamp}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setExportMsg(t('settings.export_json_done', { count: total }))
    } catch (e) {
      setExportMsg(`Error: ${String(e)}`)
    } finally {
      setExporting(false)
    }
  }

  const handleImportFile = (file: File) => {
    setImportErr(null)
    setImportPreview(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        const data = JSON.parse(text)
        if (typeof data !== 'object' || data === null) {
          setImportErr('Invalid JSON: expected an object')
          return
        }
        const counts: Record<string, number> = {}
        let total = 0
        for (const [k, v] of Object.entries(data)) {
          if (Array.isArray(v)) {
            counts[k] = v.length
            total += v.length
          }
        }
        setImportPreview({ filename: file.name, counts, total })
      } catch (e) {
        setImportErr(`Invalid JSON: ${String(e)}`)
      }
    }
    reader.onerror = () => setImportErr('Could not read file')
    reader.readAsText(file)
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{t('settings.data')}</h2>
      <p className="text-xs text-text-muted mb-5">{t('settings.data_hint')}</p>

      <div className="space-y-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn btn-secondary w-full justify-start disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>{t('settings.export_json')}</span>
        </button>
        {exportMsg && (
          <div className="text-[11px] text-success flex items-center gap-1.5 px-1">
            <CheckCircle2 className="w-3 h-3" /> {exportMsg}
          </div>
        )}

        <label className="btn btn-secondary w-full justify-start cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>{t('settings.import_json')}</span>
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportFile(f)
              e.target.value = ''
            }}
          />
        </label>
        {importPreview && (
          <div className="text-[11px] text-text-muted px-1 leading-relaxed border border-border rounded-md p-2 bg-bg-subtle">
            <div className="font-medium text-text mb-1">{importPreview.filename}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {Object.entries(importPreview.counts).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-text-subtle">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-border text-text">
              {t('settings.import_json_done', { count: importPreview.total })}
            </div>
            <div className="mt-1 text-warning">{t('settings.import_json_warn')}</div>
          </div>
        )}
        {importErr && (
          <div className="text-[11px] text-danger flex items-center gap-1.5 px-1">
            <AlertCircle className="w-3 h-3" /> {importErr}
          </div>
        )}

        <div className="pt-3 mt-3 border-t border-border">
          <div className="text-[11px] font-semibold text-danger uppercase tracking-wider mb-2 px-1">
            {t('settings.danger_zone')}
          </div>
          <button
            disabled
            title="Reset will be enabled when bulk-delete IPC ships"
            className="btn btn-secondary w-full justify-start opacity-50 cursor-not-allowed"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('settings.reset')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Updates ───────────────────────────────────────────────────────────────

function UpdatesSection() {
  const t = useT()
  const [version, setVersion] = useState('—')
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.api?.update) return
    window.api.update.getVersion().then(setVersion).catch(() => {})
    window.api.isDev?.().then(setIsDev).catch(() => {})
    const off = window.api.update.onStatus((s) => setStatus(s as UpdateStatus))
    return () => {
      if (typeof off === 'function') off()
    }
  }, [])

  const handleCheck = async () => {
    if (!window.api?.update) return
    setStatus({ state: 'checking' })
    try {
      await window.api.update.check()
    } catch (e) {
      setStatus({ state: 'error', message: String(e) })
    }
  }

  const handleInstall = () => {
    if (!window.api?.update) return
    window.api.update.install()
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{t('settings.updates')}</h2>
      <p className="text-xs text-text-muted mb-5">{t('settings.updates_hint')}</p>

      <p className="text-sm mb-3">
        {t('updates.current_version')}: <span className="text-text font-medium">v{version}</span>
      </p>

      {isDev && (
        <div className="text-xs text-text-muted bg-bg-subtle border border-border rounded-lg p-3 mb-4">
          {t('updates.dev_hint')}
        </div>
      )}

      <UpdateStatusView status={status} t={t} />

      <div className="flex gap-2 mt-5">
        <button
          onClick={handleCheck}
          disabled={status.state === 'checking' || status.state === 'downloading' || isDev}
          className="btn btn-secondary"
        >
          {status.state === 'checking' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {t('updates.check')}
        </button>

        {status.state === 'downloaded' && (
          <button onClick={handleInstall} className="btn btn-primary">
            <Download className="w-4 h-4" />
            {t('updates.install_now')}
          </button>
        )}
      </div>

      <p className="text-[11px] text-text-muted mt-5 leading-relaxed">{t('updates.smartscreen_hint')}</p>
    </div>
  )
}

function UpdateStatusView({
  status,
  t
}: {
  status: UpdateStatus
  t: (k: string, vars?: Record<string, string | number>) => string
}) {
  if (status.state === 'idle') {
    return <div className="text-sm text-text-muted">{t('updates.up_to_date')}</div>
  }
  if (status.state === 'checking') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
        <span>{t('updates.checking')}</span>
      </div>
    )
  }
  if (status.state === 'up-to-date') {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <CheckCircle2 className="w-4 h-4" />
        <span>{t('updates.up_to_date')}</span>
      </div>
    )
  }
  if (status.state === 'available') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Download className="w-4 h-4 text-accent" />
          <span>{t('updates.available', { version: status.version })}</span>
        </div>
        <div className="text-xs text-text-muted">{t('updates.available_hint')}</div>
      </div>
    )
  }
  if (status.state === 'downloading') {
    const percent = Math.round(status.percent ?? 0)
    const mb = (n: number) => (n / 1024 / 1024).toFixed(1)
    const speed = ((status.bytesPerSecond ?? 0) / 1024 / 1024).toFixed(2)
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('updates.downloading', { percent })}</span>
          <span className="text-xs text-text-muted">
            {mb(status.transferred)} / {mb(status.total)} MB · {speed} MB/s
          </span>
        </div>
        <div className="w-full h-1.5 bg-bg-subtle rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all duration-200" style={{ width: `${percent}%` }} />
        </div>
      </div>
    )
  }
  if (status.state === 'downloaded') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('updates.downloaded', { version: status.version })}</span>
        </div>
        <div className="text-xs text-text-muted">{t('updates.downloaded_hint')}</div>
      </div>
    )
  }
  if (status.state === 'error') {
    return (
      <div className="flex items-start gap-2 text-sm text-danger">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <div className="font-medium">{t('updates.error')}</div>
          <div className="text-xs text-text-muted mt-0.5">{status.message}</div>
        </div>
      </div>
    )
  }
  return null
}

// ─── About ─────────────────────────────────────────────────────────────────

function AboutSection() {
  const t = useT()
  const [version, setVersion] = useState('—')
  const [profileCount, setProfileCount] = useState(0)
  const profileCountStore = useProfileStore((s) => s.profiles.length)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.api?.update?.getVersion) {
      window.api.update.getVersion().then(setVersion).catch(() => {})
    }
    // Espelha o count do store (default = 0; carrega do DB)
    setProfileCount(profileCountStore)
  }, [profileCountStore])

  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{t('settings.about')}</h2>
      <p className="text-xs text-text-muted mb-5">{t('app.name')}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Version</span>
          <span>v{version}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Storage</span>
          <span>Local SQLite</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Profiles</span>
          <span>{formatNumber(profileCount)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── shared atoms ──────────────────────────────────────────────────────────

function Setting({
  label,
  hint,
  children
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-text-muted mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={cn(
        'w-10 h-6 rounded-full transition-colors relative',
        checked ? 'bg-accent' : 'bg-bg-subtle border border-border'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
