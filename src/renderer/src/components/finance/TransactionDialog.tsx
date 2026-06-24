import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { todayStr } from '../../lib/utils'
import type {
  Account,
  Category,
  Transaction
} from '../../types'

interface Props {
  onClose: () => void
  onSaved?: () => void | Promise<void>
  accounts: Account[]
  categories: Category[]
  profileId: number
  /** Quando passado, dialog entra em modo edit */
  transaction?: Transaction
  /** Pré-seleciona o tipo (income/expense) — útil pra abrir direto do "+ Earnings" */
  defaultType?: 'income' | 'expense'
}

/**
 * Dialog pra criar/editar transação.
 *
 * Extraído do Finance.tsx pra ser reutilizável em qualquer página
 * que precise adicionar transaction (Dashboard, Transactions, Earnings, Spending).
 *
 * Campos:
 *   - Tipo (income / expense) — toggle pill
 *   - Valor (em reais, input decimal)
 *   - Descrição
 *   - Account (dropdown)
 *   - Category (filtrado pelo tipo)
 *   - Date
 */
export function TransactionDialog({
  onClose,
  onSaved,
  accounts,
  categories,
  profileId,
  transaction,
  defaultType
}: Props) {
  const t = useT()
  const isEdit = !!transaction

  const [type, setType] = useState<'income' | 'expense'>(
    transaction?.type ?? defaultType ?? 'expense'
  )
  const [amount, setAmount] = useState(
    transaction ? (transaction.amount / 100).toFixed(2).replace('.', ',') : ''
  )
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [accountId, setAccountId] = useState<number>(
    transaction?.accountId ?? accounts[0]?.id ?? 0
  )
  const [categoryId, setCategoryId] = useState<number | null>(
    transaction?.categoryId ?? null
  )
  const [date, setDate] = useState(transaction?.date ?? todayStr())
  const [saving, setSaving] = useState(false)

  const filteredCategories = categories.filter((c) => c.type === type)
  const effectiveCategoryId = categoryId && filteredCategories.find((c) => c.id === categoryId)
    ? categoryId
    : filteredCategories[0]?.id ?? null

  // Esc fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const submit = async () => {
    if (!effectiveCategoryId || !accountId || !amount || !description) return
    const cents = Math.round(parseFloat(amount.replace(',', '.')) * 100)
    if (!Number.isFinite(cents) || cents <= 0) return
    setSaving(true)
    if (isEdit && transaction) {
      await window.api.finance.transactions.update(transaction.id, {
        profileId,
        accountId,
        categoryId: effectiveCategoryId,
        type,
        amount: cents,
        description,
        date
      })
    } else {
      await window.api.finance.transactions.create({
        profileId,
        accountId,
        categoryId: effectiveCategoryId,
        type,
        amount: cents,
        description,
        date,
        notes: null
      })
    }
    setSaving(false)
    await onSaved?.()
  }

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
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex bg-bg-subtle border border-border rounded-lg p-0.5">
          {(['expense', 'income'] as const).map((tt) => (
            <button
              key={tt}
              onClick={() => {
                setType(tt)
                setCategoryId(null)
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
          <label className="text-xs text-text-muted mb-1 block">{t('finance.amount')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle text-sm">
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-bg-subtle border border-border rounded-lg pl-10 pr-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('finance.description')}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ex. Almoço, Salário..."
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:border-accent"
          />
        </div>

        {/* Account + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('finance.account')}</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(Number(e.target.value))}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('finance.category')}</label>
            <select
              value={effectiveCategoryId ?? ''}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('finance.date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={saving || !amount || !description || !effectiveCategoryId}
            className="btn btn-primary flex-1"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}