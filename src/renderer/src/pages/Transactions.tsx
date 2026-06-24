import { useEffect, useState, useCallback } from 'react'
import {
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  Briefcase,
  type LucideIcon
} from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { TransactionDialog } from '../components/finance/TransactionDialog'
import type { Account, Category, Transaction } from '../types'

/**
 * Transactions — lista de transações (income/expense) com filtros.
 *
 * Carrega via window.api.finance.transactions.list filtrado pelo perfil ativo.
 * Filtros: All / Income / Expense.
 *
 * Botão "+ New Transaction" no header abre TransactionDialog.
 * Click na row → abre dialog em modo edit.
 * Delete via hover button.
 */

type FilterType = 'all' | 'income' | 'expense'

export function Transactions() {
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()

  const [txns, setTxns] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const list = (await window.api.finance.transactions.list({ profileId: active.id })) as Transaction[]
    // ordena por data desc
    list.sort((a, b) => (b.date > a.date ? 1 : -1))
    setTxns(list)
    setLoading(false)
  }, [active?.id])

  useEffect(() => {
    load()
  }, [load])

  const filtered = txns.filter((t) => filter === 'all' || t.type === filter)

  const totalIn = txns.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const totalOut = txns.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)

  const handleNew = () => {
    setEditing(null)
    setShowDialog(true)
  }

  const handleEdit = (t: Transaction) => {
    setEditing(t)
    setShowDialog(true)
  }

  const handleDelete = async (t: Transaction) => {
    if (!confirm(`Excluir "${t.description}"?`)) return
    if (!active) return
    await window.api.finance.transactions.delete(t.id)
    await load()
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Header: tabs + Add */}
        <div className="flex items-center justify-between mb-[18px]">
          <div
            className="flex rounded-[9px] p-[3px]"
            style={{ background: '#121214', border: '1px solid #202023' }}
          >
            {[
              { key: 'all', label: 'All' },
              { key: 'income', label: 'Income' },
              { key: 'expense', label: 'Expense' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as FilterType)}
                className="px-4 py-[7px] rounded-md text-[13px] font-medium transition-colors"
                style={{
                  background: filter === tab.key ? '#161619' : 'transparent',
                  color: filter === tab.key ? '#f4f4f6' : '#86868d',
                  fontWeight: filter === tab.key ? 600 : 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              className="flex items-center gap-[7px] h-[38px] px-[14px] rounded-[9px] text-[13px] font-medium transition-colors hover:opacity-90"
              style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
            >
              <Filter size={16} strokeWidth={1.75} />
              Filters
            </button>
            <button
              onClick={handleNew}
              disabled={accounts.length === 0}
              title={accounts.length === 0 ? 'Crie uma conta primeiro' : 'Nova transação'}
              className="flex items-center gap-[7px] h-[38px] px-[14px] rounded-[9px] text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#a78bfa', color: '#0a0a0b' }}
            >
              <Plus size={16} strokeWidth={1.75} />
              New Transaction
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={16} color="#4ade80" strokeWidth={2} />
              <span className="text-[12.5px]" style={{ color: '#86868d' }}>
                Total Income
              </span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#4ade80' }}>
              R$ {(totalIn / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight size={16} color="#f87171" strokeWidth={2} />
              <span className="text-[12.5px]" style={{ color: '#86868d' }}>
                Total Expenses
              </span>
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f87171' }}>
              R$ {(totalOut / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[14px]" style={{ color: '#f4f4f6' }}>
            {filtered.length} {filtered.length === 1 ? 'transação' : 'transações'}
          </div>

          {loading ? (
            <div className="py-12 text-center text-text-muted text-sm">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">
              Nenhuma transação. Clique em <span className="font-semibold">New Transaction</span> pra começar.
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((t, i) => {
                const cat = categories.find((c) => c.id === t.categoryId)
                const Icon: LucideIcon = (cat?.type === 'income' ? Briefcase : ShoppingBag)
                const color = cat?.color || (t.type === 'income' ? '#4ade80' : '#a78bfa')
                return (
                  <div
                    key={t.id}
                    onClick={() => handleEdit(t)}
                    className="group flex items-center py-[13px] cursor-pointer hover:opacity-95 transition-opacity"
                    style={{
                      borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #161618'
                    }}
                  >
                    {/* Avatar com ícone da categoria */}
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mr-[14px]"
                      style={{ background: `${color}1f` }}
                    >
                      <Icon size={16} color={color} strokeWidth={1.75} />
                    </div>
                    {/* Nome + categoria */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: '#e8e8ea' }}>
                        {t.description}
                      </div>
                      <div className="text-[11px]" style={{ color: '#7a7a80' }}>
                        {cat?.name ?? 'Sem categoria'}
                      </div>
                    </div>
                    {/* Data */}
                    <div className="w-[110px] text-[12.5px] shrink-0" style={{ color: '#b8b8be' }}>
                      {formatDate(t.date)}
                    </div>
                    {/* Valor */}
                    <div className="w-[110px] text-right shrink-0">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: t.type === 'income' ? '#4ade80' : '#f87171' }}
                      >
                        {t.type === 'income' ? '+' : '−'} R${' '}
                        {(t.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {/* Actions on hover */}
                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(t)}
                        title="Editar"
                        className="p-1.5 rounded hover:opacity-80"
                        style={{ color: '#9a9aa0' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        title="Excluir"
                        className="p-1.5 rounded hover:opacity-80"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showDialog && active && (
        <TransactionDialog
          onClose={() => {
            setShowDialog(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setShowDialog(false)
            setEditing(null)
            await load()
          }}
          transaction={editing ?? undefined}
          accounts={accounts as unknown as Account[]}
          categories={categories as unknown as Category[]}
          profileId={active.id}
        />
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    const [y, m, d] = iso.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}