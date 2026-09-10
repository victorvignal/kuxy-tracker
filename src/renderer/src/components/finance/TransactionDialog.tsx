import { useEffect, useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useT } from '../../lib/i18n'

type Account = { id: number; name: string; archived?: boolean }
type Category = { id: number; name: string; type: 'income' | 'expense'; archived?: boolean }
type Transaction = {
  id: number
  profileId?: number
  accountId: number
  categoryId: number
  type: 'income' | 'expense'
  amount: number // centavos
  description: string
  date: string // YYYY-MM-DD
  notes?: string | null
}

type Props = {
  transaction?: Transaction | null
  accounts: Account[]
  categories: Category[]
  profileId: number
  defaultType?: 'income' | 'expense'
  onClose: () => void
  onSaved?: () => Promise<void> | void
}

type FieldErrors = {
  amount?: string
  description?: string
  accountId?: string
  categoryId?: string
  date?: string
  general?: string
}

const MAX_AMOUNT_REAIS = 9_999_999.99
const MIN_DESCRIPTION_CHARS = 3
const MAX_DESCRIPTION_CHARS = 200
const MAX_FUTURE_DAYS = 365 // até 1 ano no futuro é ok (planned income/expense)

export function TransactionDialog({
  transaction,
  accounts,
  categories,
  profileId,
  defaultType = 'expense',
  onClose,
  onSaved,
}: Props) {
  const t = useT()
  const isEdit = !!transaction

  // === form state ===
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? defaultType)
  const [amount, setAmount] = useState(transaction ? (transaction.amount / 100).toFixed(2).replace('.', ',') : '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [accountId, setAccountId] = useState<number | ''>(transaction?.accountId ?? '')
  const [categoryId, setCategoryId] = useState<number | ''>(transaction?.categoryId ?? '')
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().slice(0, 10))

  // === ui state ===
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type && !c.archived),
    [categories, type]
  )

  // se accountId não bate com nada (ex: account arquivado), limpa
  const effectiveAccountId = useMemo(() => {
    if (accountId && accounts.some((a) => a.id === accountId && !a.archived)) return accountId
    return accounts.find((a) => !a.archived)?.id ?? ''
  }, [accountId, accounts])

  // se categoryId não bate com tipo atual, limpa
  const effectiveCategoryId = useMemo(() => {
    if (categoryId && filteredCategories.some((c) => c.id === categoryId)) return categoryId
    return filteredCategories[0]?.id ?? ''
  }, [categoryId, filteredCategories])

  // Esc fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  // === validação ===
  const validate = (): FieldErrors => {
    const e: FieldErrors = {}

    // amount
    if (!amount || amount.trim() === '') {
      e.amount = t('finance.error.amount_required')
    } else {
      const numStr = amount.replace(',', '.').trim()
      const cents = Math.round(parseFloat(numStr) * 100)
      if (!Number.isFinite(cents) || cents <= 0) {
        e.amount = t('finance.error.amount_invalid')
      } else if (parseFloat(numStr) > MAX_AMOUNT_REAIS) {
        e.amount = t('finance.error.amount_too_big')
      } else if (cents < 1) {
        // menos de R$ 0,01
        e.amount = t('finance.error.amount_too_small')
      }
    }

    // description
    if (!description.trim()) {
      e.description = t('finance.error.description_required')
    } else if (description.trim().length < MIN_DESCRIPTION_CHARS) {
      e.description = t('finance.error.description_too_short').replace('{min}', String(MIN_DESCRIPTION_CHARS))
    } else if (description.length > MAX_DESCRIPTION_CHARS) {
      e.description = t('finance.error.description_too_long').replace('{max}', String(MAX_DESCRIPTION_CHARS))
    }

    // account
    if (!effectiveAccountId) {
      e.accountId = t('finance.error.account_required')
    }

    // category
    if (!effectiveCategoryId) {
      e.categoryId = t('finance.error.category_required')
    }

    // date
    if (!date) {
      e.date = t('finance.error.date_required')
    } else {
      // valida formato YYYY-MM-DD
      const dateRe = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRe.test(date)) {
        e.date = t('finance.error.date_invalid')
      } else {
        // valida que data não tá muito no futuro
        const parsed = new Date(date)
        if (Number.isNaN(parsed.getTime())) {
          e.date = t('finance.error.date_invalid')
        } else {
          const diffMs = parsed.getTime() - Date.now()
          const diffDays = diffMs / (1000 * 60 * 60 * 24)
          if (diffDays > MAX_FUTURE_DAYS) {
            e.date = t('finance.error.date_too_far_future')
          }
        }
      }
    }

    return e
  }

  const submit = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // marca primeiro campo com erro pra dar foco
      const firstErrorField = ['amount', 'description', 'accountId', 'categoryId', 'date'].find(
        (k) => e[k as keyof FieldErrors]
      )
      if (firstErrorField) {
        const el = document.getElementById(`tx-${firstErrorField}`)
        el?.focus()
      }
      return
    }

    const numStr = amount.replace(',', '.').trim()
    const cents = Math.round(parseFloat(numStr) * 100)

    setSaving(true)
    setErrors({})
    try {
      if (isEdit && transaction) {
        await window.api.finance.transactions.update(transaction.id, {
          profileId,
          accountId: Number(effectiveAccountId),
          categoryId: Number(effectiveCategoryId),
          type,
          amount: cents,
          description: description.trim(),
          date,
        })
      } else {
        await window.api.finance.transactions.create({
          profileId,
          accountId: Number(effectiveAccountId),
          categoryId: Number(effectiveCategoryId),
          type,
          amount: cents,
          description: description.trim(),
          date,
          notes: null,
        })
      }
      await onSaved?.()
    } catch (err: any) {
      setErrors({ general: err?.message ?? String(err) })
      setSaving(false)
    }
  }

  // helpers pra aplicar erro visual (border vermelho) nos inputs
  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full bg-bg-subtle border rounded-lg px-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:border-accent transition-colors',
      hasError ? 'border-danger focus:border-danger' : 'border-border'
    )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-scrim)' }}
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-4 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {isEdit ? t('finance.edit_transaction') : t('finance.new_transaction')}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted" aria-label={t('common.close')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* general error banner */}
        {errors.general && (
          <div
            className="rounded-lg p-3 text-xs"
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            role="alert"
          >
            {errors.general}
          </div>
        )}

        {/* Type toggle */}
        <div className="flex bg-bg-subtle border border-border rounded-lg p-0.5">
          {(['expense', 'income'] as const).map((tt) => (
            <button
              key={tt}
              type="button"
              onClick={() => {
                setType(tt)
                setCategoryId('')
                setErrors((prev) => ({ ...prev, categoryId: undefined }))
              }}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                type === tt
                  ? tt === 'income'
                    ? 'bg-success/15 text-success'
                    : 'bg-danger/15 text-danger'
                  : 'text-text-muted hover:text-text'
              )}
            >
              {tt === 'income' ? t('finance.type.income') : t('finance.type.expense')}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="tx-amount" className="text-xs text-text-muted mb-1 block">
            {t('finance.amount')} <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle text-sm">
              R$
            </span>
            <input
              id="tx-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
              }}
              placeholder="0,00"
              className={cn(inputClass(!!errors.amount), 'pl-10')}
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'tx-amount-err' : undefined}
              autoFocus
            />
          </div>
          {errors.amount && (
            <p id="tx-amount-err" className="text-xs mt-1 text-danger" role="alert">
              {errors.amount}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="tx-description" className="text-xs text-text-muted mb-1 block">
            {t('finance.description')} <span className="text-danger">*</span>
          </label>
          <input
            id="tx-description"
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
            }}
            placeholder="ex. Almoço, Salário..."
            maxLength={MAX_DESCRIPTION_CHARS}
            className={inputClass(!!errors.description)}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'tx-description-err' : undefined}
          />
          {errors.description && (
            <p id="tx-description-err" className="text-xs mt-1 text-danger" role="alert">
              {errors.description}
            </p>
          )}
          {!errors.description && (
            <p className="text-[10px] mt-0.5 text-text-subtle text-right">
              {description.length}/{MAX_DESCRIPTION_CHARS}
            </p>
          )}
        </div>

        {/* Account + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tx-accountId" className="text-xs text-text-muted mb-1 block">
              {t('finance.account')} <span className="text-danger">*</span>
            </label>
            <select
              id="tx-accountId"
              value={effectiveAccountId}
              onChange={(e) => {
                setAccountId(Number(e.target.value))
                if (errors.accountId) setErrors((prev) => ({ ...prev, accountId: undefined }))
              }}
              className={inputClass(!!errors.accountId)}
              aria-invalid={!!errors.accountId}
            >
              <option value="" disabled>
                {accounts.length === 0 ? '—' : t('finance.select_account')}
              </option>
              {accounts
                .filter((a) => !a.archived)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
            {errors.accountId && (
              <p className="text-xs mt-1 text-danger" role="alert">
                {errors.accountId}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="tx-categoryId" className="text-xs text-text-muted mb-1 block">
              {t('finance.category')} <span className="text-danger">*</span>
            </label>
            <select
              id="tx-categoryId"
              value={effectiveCategoryId}
              onChange={(e) => {
                setCategoryId(Number(e.target.value))
                if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }))
              }}
              className={inputClass(!!errors.categoryId)}
              aria-invalid={!!errors.categoryId}
            >
              <option value="" disabled>
                {filteredCategories.length === 0 ? '—' : t('finance.select_category')}
              </option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs mt-1 text-danger" role="alert">
                {errors.categoryId}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="tx-date" className="text-xs text-text-muted mb-1 block">
            {t('finance.date')} <span className="text-danger">*</span>
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }))
            }}
            className={inputClass(!!errors.date)}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'tx-date-err' : undefined}
          />
          {errors.date && (
            <p id="tx-date-err" className="text-xs mt-1 text-danger" role="alert">
              {errors.date}
            </p>
          )}
        </div>

        {accounts.length === 0 && (
          <div
            className="rounded-lg p-3 text-xs"
            style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--color-warning)' }}
          >
            {t('finance.no_accounts_hint')}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn btn-ghost flex-1" disabled={saving}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
