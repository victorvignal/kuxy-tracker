import { useEffect, useState, useCallback } from 'react'
import {
  Tv, Music, Cloud, Smartphone, Heart, Zap, CreditCard, Calendar,
  Plus, Pause, Play, Trash2
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useFinanceData } from '../hooks/useFinanceData'
import { SubscriptionDialog } from '../components/finance/SubscriptionDialog'
import type { Subscription, SubscriptionInterval, Account, Category } from '../types'

/**
 * Subscriptions — lista de assinaturas recorrentes.
 *
 * Carrega via window.api.finance.subscriptions.list filtrado pelo perfil ativo.
 * Cada card mostra avatar (ícone da categoria), nome + plano, valor mensal,
 * próx. cobrança, badge de status.
 *
 * Botão "+ Add Subscription" no topo abre SubscriptionDialog.
 * Botão de pause/play/archive em cada card (vai pra archive).
 */

const ICON_MAP: Record<string, LucideIcon> = {
  tv: Tv, music: Music, cloud: Cloud, smartphone: Smartphone,
  heart: Heart, zap: Zap, credit: CreditCard, calendar: Calendar
}

const STATUS_STYLE = {
  active: { fg: '#4ade80', bg: 'rgba(74,222,128,0.12)', label: 'Active' },
  ending: { fg: '#facc15', bg: 'rgba(250,204,21,0.12)', label: 'Ending Soon' },
  paused: { fg: '#9a9aa0', bg: 'rgba(154,154,160,0.12)', label: 'Paused' }
} as const

function statusFromSub(s: Subscription): keyof typeof STATUS_STYLE {
  if (!s.active) return 'paused'
  // Ending soon = vence em <=7 dias
  const days = Math.ceil((new Date(s.nextBilling).getTime() - Date.now()) / 86400000)
  if (days <= 7) return 'ending'
  return 'active'
}

function intervalLabel(i: SubscriptionInterval): string {
  return i === 'monthly' ? '/mês' : i === 'yearly' ? '/ano' : '/sem'
}

export function Subscriptions() {
  const active = useProfileStore((s) => s.getActive())
  const { accounts, categories } = useFinanceData()

  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const list = (await window.api.finance.subscriptions.list({ profileId: active.id })) as Subscription[]
    setSubs(list)
    setLoading(false)
  }, [active?.id])

  useEffect(() => {
    load()
  }, [load])

  const total = subs.reduce((a, s) => a + s.amount, 0)
  const activeCount = subs.filter((s) => s.active).length

  const handleNew = () => {
    setEditing(null)
    setShowDialog(true)
  }

  const handleEdit = (s: Subscription) => {
    setEditing(s)
    setShowDialog(true)
  }

  const handleTogglePause = async (s: Subscription) => {
    if (!active) return
    await window.api.finance.subscriptions.update(s.id, { active: !s.active })
    await load()
  }

  const handleDelete = async (s: Subscription) => {
    if (!confirm(`Excluir ${s.name}?`)) return
    if (!active) return
    await window.api.finance.subscriptions.delete(s.id)
    await load()
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Summary */}
        <div className="flex gap-[14px] mb-4">
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Monthly Total
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f4f4f6' }}>
              R$ {(total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className="flex-1 rounded-[14px] p-[18px]"
            style={{ background: '#141416', border: '1px solid #1f1f22' }}
          >
            <div className="text-tmpl-body mb-[6px]" style={{ color: '#86868d' }}>
              Active Subscriptions
            </div>
            <div className="text-tmpl-stat" style={{ color: '#f4f4f6' }}>
              {activeCount}
            </div>
          </div>
        </div>

        {/* List */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="flex items-center justify-between mb-[14px]">
            <span className="text-tmpl-card-title" style={{ color: '#f4f4f6' }}>
              {subs.length} {subs.length === 1 ? 'Subscription' : 'Subscriptions'}
            </span>
            <button
              onClick={handleNew}
              disabled={accounts.length === 0}
              title={accounts.length === 0 ? 'Crie uma conta primeiro' : 'Nova assinatura'}
              className="flex items-center gap-[7px] h-[34px] px-[14px] rounded-[9px] text-[12.5px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#a78bfa', color: '#0a0a0b' }}
            >
              <Plus size={14} strokeWidth={2} />
              Add Subscription
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-text-muted text-sm">
              Carregando...
            </div>
          ) : subs.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">
              Nenhuma assinatura. Clique em <span className="font-semibold">Add Subscription</span> pra começar.
            </div>
          ) : (
            <div className="flex flex-col">
              {subs.map((s, i) => {
                const st = STATUS_STYLE[statusFromSub(s)]
                // Resolve ícone pela categoria (se houver)
                const cat = categories.find((c) => c.id === s.categoryId)
                const Icon = (cat?.icon && ICON_MAP[cat.icon]) || CreditCard
                const color = cat?.color || '#a78bfa'

                return (
                  <div
                    key={s.id}
                    className="group flex items-center py-[13px] cursor-pointer hover:opacity-95 transition-opacity"
                    style={{ borderBottom: i === subs.length - 1 ? 'none' : '1px solid #161618' }}
                    onClick={() => handleEdit(s)}
                  >
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mr-[14px]"
                      style={{ background: `${color}1f` }}
                    >
                      <Icon size={16} color={color} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-tmpl-body font-medium" style={{ color: '#e8e8ea' }}>
                          {s.name}
                        </span>
                        <span
                          className="inline-block py-[2px] px-[8px] rounded-[6px] text-[10px] font-semibold"
                          style={{ background: st.bg, color: st.fg }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="text-tmpl-label-xs" style={{ color: '#7a7a80' }}>
                        {s.notes || intervalLabel(s.interval)}
                      </div>
                    </div>
                    <div className="text-right shrink-0 mr-3">
                      <div className="text-tmpl-body font-semibold" style={{ color: '#e8e8ea' }}>
                        R$ {(s.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <span className="text-[11px] font-normal ml-1" style={{ color: '#7a7a80' }}>
                          {intervalLabel(s.interval)}
                        </span>
                      </div>
                      <div className="text-tmpl-label-xs" style={{ color: '#7a7a80' }}>
                        Próx: {formatNextDate(s.nextBilling)}
                      </div>
                    </div>

                    {/* Action buttons (aparecem on hover) */}
                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleTogglePause(s)}
                        title={s.active ? 'Pausar' : 'Reativar'}
                        className="p-1.5 rounded hover:opacity-80"
                        style={{ color: '#9a9aa0' }}
                      >
                        {s.active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
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
        <SubscriptionDialog
          onClose={() => {
            setShowDialog(false)
            setEditing(null)
          }}
          onSaved={() => {
            setShowDialog(false)
            setEditing(null)
            load()
          }}
          subscription={editing ?? undefined}
          accounts={accounts as unknown as Account[]}
          categories={categories as unknown as Category[]}
        />
      )}
    </div>
  )
}

function formatNextDate(iso: string): string {
  try {
    const [y, m, d] = iso.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch {
    return iso
  }
}