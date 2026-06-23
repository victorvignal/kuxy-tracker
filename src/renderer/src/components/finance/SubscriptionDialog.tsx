import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { useProfileStore } from '../../store/useProfile'
import { todayStr } from '../../lib/utils'
import type { Account, Category, Subscription, SubscriptionInterval } from '../../types'

interface Props {
  onClose: () => void
  onSaved?: () => void
  /** Quando passado, entra em modo edit */
  subscription?: Subscription
  accounts: Account[]
  categories: Category[]
}

const INTERVALS: SubscriptionInterval[] = ['monthly', 'yearly', 'weekly']

function centsToBRLInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const reais = parseFloat(cleaned)
  if (isNaN(reais)) return 0
  return Math.round(reais * 100)
}

export function SubscriptionDialog({
  onClose,
  onSaved,
  subscription,
  accounts,
  categories
}: Props) {
  const t = useT()
  const activeId = useProfileStore((s) => s.activeId)
  const profiles = useProfileStore((s) => s.profiles)
  const isEdit = !!subscription

  const [name, setName] = useState(subscription?.name ?? '')
  const [amount, setAmount] = useState(centsToBRLInput(subscription?.amount ?? 0))
  const [interval, setInterval] = useState<SubscriptionInterval>(
    subscription?.interval ?? 'monthly'
  )
  const [nextBilling, setNextBilling] = useState(
    subscription?.nextBilling ?? todayStr()
  )
  const [accountId, setAccountId] = useState<number | null>(subscription?.accountId ?? null)
  const [categoryId, setCategoryId] = useState<number | null>(subscription?.categoryId ?? null)
  const [notes, setNotes] = useState(subscription?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('finance.subscription.name') + ' ?')
      return
    }
    if (!nextBilling.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setError('Data inválida (use YYYY-MM-DD)')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const profileId = subscription?.profileId ?? activeId ?? profiles[0]?.id
      if (!profileId) {
        setError('No active profile')
        setSaving(false)
        return
      }
      const payload = {
        profileId,
        accountId,
        categoryId,
        name: name.trim(),
        amount: parseBRLToCents(amount),
        currency: 'BRL',
        interval,
        nextBilling,
        active: subscription?.active ?? true,
        notes: notes.trim() || null
      }
      if (isEdit && subscription) {
        await window.api.finance.subscriptions.update(subscription.id, payload)
      } else {
        await window.api.finance.subscriptions.create(payload)
      }
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
        className="bg-bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {isEdit ? t('common.edit') : t('finance.add_subscription')}
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
            {t('finance.subscription.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Netflix, Spotify, GitHub"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.subscription.amount')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.subscription.interval')}
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as SubscriptionInterval)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {INTERVALS.map((iv) => (
                <option key={iv} value={iv}>
                  {t(`finance.billing.${iv}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            {t('finance.subscription.next_billing')}
          </label>
          <input
            type="date"
            value={nextBilling}
            onChange={(e) => setNextBilling(e.target.value)}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.subscription.account')}
            </label>
            <select
              value={accountId ?? ''}
              onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">{t('finance.subscription.no_account')}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.subscription.category')}
            </label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            {t('finance.subscription.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            placeholder="..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button onClick={onClose} disabled={saving} className="btn btn-secondary text-xs">
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
  )
}
