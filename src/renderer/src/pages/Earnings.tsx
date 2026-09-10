import { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Building2,
  ArrowUpRight,
  Plus,
  Circle,
  type LucideIcon
} from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { useEarnings } from '../hooks/useEarnings'
import { TransactionDialog } from '../components/finance/TransactionDialog'
import type { Account, Category } from '../types'

/**
 * Earnings — fontes de receita do usuário.
 *
 * v0.13: lê transactions WHERE type='income' GROUP BY categoryId.
 * Substitui o array SOURCES mock por dados reais do DB.
 *
 * Cada "source" = categoria com transações income somadas.
 * Ícone/cor derivado do category.icon/category.color.
 */

// Mapeia category.icon (string) para componente Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  laptop: DollarSign,
  home: Building2,
  repeat: ArrowUpRight,
  circle: Circle
}

function pickIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Circle
}

// Helper: centavos → "R$ 1.234,56"
function formatBRL(cents: number): string {
  const reais = cents / 100
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function Earnings() {
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()
  const { data, loading, error, refresh } = useEarnings(active?.id)
  const [showDialog, setShowDialog] = useState(false)

  // quando cria transação nova, refetch (atualiza lista de fontes)
  useEffect(() => {
    refresh()
  }, [refresh])

  // deriva dados: usa hook + computa stats simples
  const sources = data?.sources ?? []
  const total = data?.total ?? 0 // centavos
  const monthlyTotal = data?.monthlyTotal ?? 0
  const months = data?.months ?? 1
  const txCount = data?.transactionCount ?? 0

  // última transação pra mostrar "último update"
  const lastUpdate = useMemo(() => {
    if (!sources.length || !data) return null
    return data
  }, [data, sources])

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">

        {/* Banner com estado */}
        {loading && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-[13px]"
            style={{ background: '#121214', border: '1px solid #1f1f22', color: '#86868d' }}
          >
            Carregando fontes de receita do banco...
          </div>
        )}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-[13px]"
            style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}
          >
            <strong>Erro ao carregar earnings:</strong> {error}
          </div>
        )}

        {/* 2 stat cards grandes */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Total Earnings
            </div>
            <div className="text-tmpl-stat mb-2" style={{ color: '#f4f4f6' }}>
              {formatBRL(total)}
            </div>
            <div className="text-tmpl-label-xs">
              <span style={{ color: '#7a7a80' }}>
                {txCount} transações · {sources.length} {sources.length === 1 ? 'categoria' : 'categorias'}
              </span>
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Média Mensal
            </div>
            <div className="text-tmpl-stat mb-2" style={{ color: '#f4f4f6' }}>
              {formatBRL(monthlyTotal)}
            </div>
            <div className="text-tmpl-label-xs">
              <span style={{ color: '#7a7a80' }}>
                {months.toFixed(1)} meses no agregado
              </span>
            </div>
          </div>
        </div>

        {/* Lista de fontes */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="flex items-center justify-between mb-[16px]">
            <span className="text-tmpl-card-title" style={{ color: '#f4f4f6' }}>
              {sources.length} {sources.length === 1 ? 'Source' : 'Sources'}
            </span>
            <button
              onClick={() => setShowDialog(true)}
              disabled={accounts.length === 0 || categories.filter((c) => c.type === 'income').length === 0}
              title={
                accounts.length === 0
                  ? 'Crie uma conta primeiro'
                  : categories.filter((c) => c.type === 'income').length === 0
                  ? 'Crie uma categoria income primeiro'
                  : 'Nova receita'
              }
              className="flex items-center gap-[7px] h-[32px] px-3 rounded-[8px] text-tmpl-body-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
            >
              <Plus size={14} strokeWidth={1.75} />
              Add Source
            </button>
          </div>

          {sources.length === 0 ? (
            <div className="py-8 text-center" style={{ color: '#7a7a80' }}>
              {loading ? '...' : 'Nenhuma transação income ainda. Clica em "Add Source" pra começar.'}
            </div>
          ) : (
            <div className="flex flex-col">
              {sources.map((s, i) => {
                const Icon = pickIcon(s.icon)
                const iconBg = s.color + '22' // alpha ~13%
                return (
                  <div
                    key={String(s.id)}
                    className="flex items-center py-[13px] hover:opacity-95 transition-opacity"
                    style={{ borderBottom: i === sources.length - 1 ? 'none' : '1px solid #161618' }}
                  >
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mr-[14px]"
                      style={{ background: iconBg }}
                    >
                      <Icon size={16} color={s.color} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-tmpl-body" style={{ color: '#e8e8ea' }}>
                        {s.name}
                      </div>
                      <div className="text-tmpl-label-xs" style={{ color: '#7a7a80' }}>
                        {s.count} {s.count === 1 ? 'transação' : 'transações'} · {formatBRL(s.monthlyAvg)}/mês
                      </div>
                    </div>
                    <div className="w-[120px] text-right shrink-0">
                      <div className="text-tmpl-body font-semibold" style={{ color: '#e8e8ea' }}>
                        {formatBRL(s.total)}
                      </div>
                      <div className="text-tmpl-label-xs" style={{ color: '#4ade80' }}>
                        {((s.total / Math.max(total, 1)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {lastUpdate && (
          <div className="mt-3 text-tmpl-label-xs text-center" style={{ color: '#5a5a60' }}>
            Última atualização: agora · {txCount} transações processadas
          </div>
        )}
      </div>

      {showDialog && active && (
        <TransactionDialog
          onClose={() => setShowDialog(false)}
          onSaved={() => {
            setShowDialog(false)
            refresh()
          }}
          accounts={accounts as unknown as Account[]}
          categories={categories as unknown as Category[]}
          profileId={active.id}
          defaultType="income"
        />
      )}
    </div>
  )
}
