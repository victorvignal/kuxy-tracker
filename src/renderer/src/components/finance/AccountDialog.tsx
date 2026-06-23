import { useEffect, useState } from 'react'
import { X, Archive, ArchiveRestore } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { useProfileStore } from '../../store/useProfile'
import { cn } from '../../lib/utils'
import type { Account } from '../../types'

interface Props {
  onClose: () => void
  onSaved?: () => void
  /** Quando passado, o dialog entra em modo de edicao */
  account?: Account
}

const COLORS = [
  '#a855f7',
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
  '#64748b'
]

const ICONS = ['wallet', 'credit-card', 'banknote', 'piggy-bank', 'trending-up', 'building']

const TYPES = ['checking', 'savings', 'credit', 'investment', 'cash'] as const
type AccountType = (typeof TYPES)[number]

// Converte string de input (ex: "123,45" ou "123.45") pra centavos (int)
function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const reais = parseFloat(cleaned)
  if (isNaN(reais)) return 0
  return Math.round(reais * 100)
}

// Converte centavos pra string no formato "123,45" pra input
function centsToBRLInput(cents: number): string {
  const reais = cents / 100
  return reais.toFixed(2).replace('.', ',')
}

export function AccountDialog({ onClose, onSaved, account }: Props) {
  const t = useT()
  const activeId = useProfileStore((s) => s.activeId)
  const profiles = useProfileStore((s) => s.profiles)
  const isEdit = !!account

  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>((account?.type as AccountType) ?? 'checking')
  const [balance, setBalance] = useState(centsToBRLInput(account?.balance ?? 0))
  const [color, setColor] = useState(account?.color ?? COLORS[0])
  const [icon, setIcon] = useState(account?.icon ?? ICONS[0])
  const [archived] = useState(account?.archived ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Esc fecha o dialog
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('finance.account.name') + ' ?')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const profileId = account?.profileId ?? activeId ?? profiles[0]?.id
      if (!profileId) {
        setError('No active profile')
        setSaving(false)
        return
      }
      const payload = {
        profileId: profileId,
        name: name.trim(),
        type,
        balance: parseBRLToCents(balance),
        currency: 'BRL',
        color,
        icon
      }
      if (isEdit && account) {
        await window.api.finance.accounts.update(account.id, { ...payload, archived })
      } else {
        await window.api.finance.accounts.create(payload)
      }
      onSaved?.()
      onClose()
    } catch (e) {
      setError(String(e))
      setSaving(false)
    }
  }

  const handleArchiveToggle = async () => {
    if (!account) return
    setSaving(true)
    try {
      await window.api.finance.accounts.archive(account.id, !archived)
      onSaved?.()
      onClose()
    } catch (e) {
      setError(String(e))
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {isEdit ? t('finance.account.edit') : t('finance.account.new')}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text"
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            {t('finance.account.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Nubank, Itaú, Carteira"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            {t('finance.account.type')}
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {TYPES.map((tt) => (
              <button
                key={tt}
                onClick={() => setType(tt)}
                className={cn(
                  'px-2 py-1.5 text-xs font-medium rounded-md border transition-colors',
                  type === tt
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border text-text-muted hover:text-text hover:border-border-strong'
                )}
              >
                {t(`finance.account.${tt}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            {t('finance.account.balance')}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0,00"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1.5 block">
            {t('finance.account.color')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  color === c
                    ? 'border-text scale-110'
                    : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1.5 block">
            {t('finance.account.icon')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md border transition-colors font-mono',
                  icon === ic
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border text-text-muted hover:text-text'
                )}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          {isEdit ? (
            <button
              onClick={handleArchiveToggle}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
            >
              {archived ? (
                <>
                  <ArchiveRestore className="w-3.5 h-3.5" />
                  {t('common.unarchive')}
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  {t('common.archive')}
                </>
              )}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="btn btn-secondary text-xs"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="btn btn-primary text-xs"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
