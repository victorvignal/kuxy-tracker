import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { useProfileStore } from '../../store/useProfile'
import { todayStr } from '../../lib/utils'
import type { Budget, BudgetPeriod, Category } from '../../types'

interface Props {
  onClose: () => void
  onSaved?: () => void
  budget?: Budget
  categories: Category[]
}

const PERIODS: BudgetPeriod[] = ['weekly', 'monthly', 'yearly']

function centsToBRLInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const reais = parseFloat(cleaned)
  if (isNaN(reais)) return 0
  return Math.round(reais * 100)
}

export function BudgetDialog({ onClose, onSaved, budget, categories }: Props) {
  const t = useT()
  const activeId = useProfileStore((s) => s.activeId)
  const profiles = useProfileStore((s) => s.profiles)
  const isEdit = !!budget

  // Só categorias que fazem sentido pra budget (exclui income-type se houver)
  const expenseCategories = categories.filter((c) => c.type === 'expense' || !c.type)

  const [name, setName] = useState(budget?.name ?? '')
  const [amount, setAmount] = useState(centsToBRLInput(budget?.amount ?? 0))
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period ?? 'monthly')
  const [categoryId, setCategoryId] = useState<number | null>(budget?.categoryId ?? null)
  const [alertThreshold, setAlertThreshold] = useState(budget?.alertThreshold ?? 80)
  const [rollover, setRollover] = useState(budget?.rollover ?? false)
  const [startDate, setStartDate] = useState(budget?.startDate ?? todayStr())
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
    if (!categoryId) {
      setError(t('finance.budget.no_category'))
      return
    }
    if (parseBRLToCents(amount) <= 0) {
      setError(t('finance.budget.amount') + ' > 0')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const profileId = budget?.profileId ?? activeId ?? profiles[0]?.id
      if (!profileId) {
        setError('No active profile')
        setSaving(false)
        return
      }
      const payload = {
        profileId,
        categoryId,
        name: name.trim() || null,
        amount: parseBRLToCents(amount),
        period,
        alertThreshold: Math.max(0, Math.min(100, alertThreshold)),
        rollover,
        startDate,
        archived: budget?.archived ?? false
      }
      if (isEdit && budget) {
        await window.api.finance.budgets.update(budget.id, payload)
      } else {
        await window.api.finance.budgets.create(payload)
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
            {isEdit ? t('finance.budget.edit') : t('finance.budget.new')}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text" disabled={saving}>
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
            {t('finance.budget.category')}
          </label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            <option value="">{t('finance.budget.no_category')}</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.budget.amount')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.budget.period')}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {t(`finance.budget.period.${p}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            {t('finance.budget.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mercado mensal"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.budget.alert_threshold')} ({alertThreshold}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              {t('finance.budget.start_date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
          <input
            type="checkbox"
            checked={rollover}
            onChange={(e) => setRollover(e.target.checked)}
            className="accent-accent"
          />
          {t('finance.budget.rollover')}
        </label>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button onClick={onClose} disabled={saving} className="btn btn-secondary text-xs">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !categoryId}
            className="btn btn-primary text-xs"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
