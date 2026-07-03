import { useState } from 'react'
import { Plus, Trash2, Receipt as ReceiptIcon, ArrowRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Avatar } from '../components/ui/Avatar'
import { Pill } from '../components/ui/Pill'
import { useT } from '../lib/i18n'

/**
 * Receipts (Profissional) — gerador de invoice + tabela de recibos recentes.
 *
 * Template "Receipts" do `Tempo Dashboard.dc.html`:
 *   - Gerador de invoice (cliente + itens com tempo/valor + total)
 *   - Tabela "Recibos recentes" em largura cheia
 *
 * Layout v0.8.3: split 60/40 — form à esquerda, preview A4 à direita.
 * Preview é funcional (não-pdf, renderizado em CSS) — reflete em tempo
 * real o que tá no form, então o user vê o que vai sair antes de gerar.
 */

type LineItem = {
  id: string
  description: string
  hours: number
  rate: number
}

type Receipt = {
  client: string
  initial: string
  av: string
  no: string
  date: string
  due: string
  total: string
  status: 'paid' | 'pending' | 'overdue'
}

const INITIAL_ITEMS: LineItem[] = [
  { id: '1', description: 'Edição de vídeo 14', hours: 6, rate: 180 },
  { id: '2', description: 'Edição de vídeo 15', hours: 5, rate: 180 }
]

const RECENT: Receipt[] = [
  { client: 'Northwind', initial: 'N', av: '#8b5cf6', no: '#0042', date: '23 jun 2026', due: '07 jul 2026', total: 'R$ 1.980', status: 'paid' },
  { client: 'Lumen Studio', initial: 'L', av: '#a78bfa', no: '#0041', date: '22 jun 2026', due: '06 jul 2026', total: 'R$ 900', status: 'pending' },
  { client: 'Brightline', initial: 'B', av: '#6d4ee0', no: '#0040', date: '20 jun 2026', due: '04 jul 2026', total: 'R$ 2.400', status: 'paid' },
  { client: 'Velasco Films', initial: 'V', av: '#4f4193', no: '#0039', date: '18 jun 2026', due: '02 jul 2026', total: 'R$ 1.100', status: 'overdue' },
  { client: 'Pixel & Co', initial: 'P', av: '#5b6b8c', no: '#0038', date: '15 jun 2026', due: '29 jun 2026', total: 'R$ 920', status: 'paid' }
]

const STATUS_TONE = {
  paid: { tone: 'success' as const, label: 'Pago' },
  pending: { tone: 'warning' as const, label: 'Pendente' },
  overdue: { tone: 'danger' as const, label: 'Atrasado' }
}

const TAX_RATE = 0.06 // ISS simplificado

export function Receipts() {
  const t = useT()
  const [client, setClient] = useState('Northwind')
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS)
  const today = new Date()
  const due = new Date(today)
  due.setDate(due.getDate() + 14)
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  const subtotal = items.reduce((acc, it) => acc + it.hours * it.rate, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const fmtBRL = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Layout split: form (60%) + preview A4 (40%) */}
        <div className="flex gap-4 mb-4">
          {/* Form de geração à esquerda */}
          <div className="flex-1 min-w-0">
            <Card padding="22px 24px">
              <div className="flex items-center gap-2 mb-5">
                <ReceiptIcon size={18} color="#a78bfa" strokeWidth={1.75} />
                <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                  {t('receipts.new')}
                </span>
              </div>

              <div className="flex gap-3 mb-5">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-[12px] font-medium" style={{ color: '#86868d' }}>
                    {t('receipts.client')}
                  </span>
                  <input
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="px-3 py-2 rounded-[8px] text-[13px] outline-none"
                    style={{
                      background: '#0e0e10',
                      border: '1px solid #232327',
                      color: '#e8e8ea'
                    }}
                  />
                </label>
              </div>

              {/* Tabela de itens */}
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ border: '1px solid #1d1d20', background: '#0e0e10' }}
              >
                <div
                  className="flex items-center px-3 py-2.5"
                  style={{
                    borderBottom: '1px solid #1d1d20',
                    color: '#7a7a80',
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  <div style={{ flex: 1 }}>{t('receipts.col.description')}</div>
                  <div style={{ width: 70, flexShrink: 0, textAlign: 'right' }}>
                    {t('receipts.col.hours')}
                  </div>
                  <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}>
                    {t('receipts.col.rate')}
                  </div>
                  <div style={{ width: 100, flexShrink: 0, textAlign: 'right' }}>
                    {t('receipts.col.total')}
                  </div>
                  <div style={{ width: 32, flexShrink: 0 }}></div>
                </div>
                {items.map((it, i) => (
                  <div
                    key={it.id}
                    className="flex items-center px-3 py-2"
                    style={{
                      borderBottom: i < items.length - 1 ? '1px solid #161618' : 'none',
                      fontSize: 13,
                      color: '#e8e8ea'
                    }}
                  >
                    <input
                      value={it.description}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, description: e.target.value } : p
                          )
                        )
                      }
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: '#e8e8ea' }}
                    />
                    <input
                      type="number"
                      value={it.hours}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, hours: parseFloat(e.target.value) || 0 } : p
                          )
                        )
                      }
                      className="w-[60px] text-right bg-transparent outline-none"
                      style={{ color: '#e8e8ea' }}
                    />
                    <input
                      type="number"
                      value={it.rate}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, rate: parseFloat(e.target.value) || 0 } : p
                          )
                        )
                      }
                      className="w-[80px] text-right bg-transparent outline-none mr-2"
                      style={{ color: '#e8e8ea' }}
                    />
                    <span
                      className="w-[100px] text-right font-semibold"
                      style={{ color: '#f4f4f6' }}
                    >
                      R$ {fmtBRL(it.hours * it.rate)}
                    </span>
                    <button
                      onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                      className="w-8 text-right"
                      style={{ color: '#6a6a70' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <Btn
                variant="ghost"
                size="sm"
                leftIcon={<Plus size={14} strokeWidth={1.75} />}
                className="mt-2"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { id: String(Date.now()), description: 'Novo item', hours: 1, rate: 150 }
                  ])
                }
              >
                {t('receipts.add_item')}
              </Btn>

              {/* Totais */}
              <div className="flex justify-end mt-5">
                <div className="w-[260px] flex flex-col gap-2">
                  <div
                    className="flex items-center justify-between text-[13px]"
                    style={{ color: '#b8b8be' }}
                  >
                    <span>{t('receipts.subtotal')}</span>
                    <span>R$ {fmtBRL(subtotal)}</span>
                  </div>
                  <div
                    className="flex items-center justify-between text-[13px]"
                    style={{ color: '#b8b8be' }}
                  >
                    <span>{t('receipts.tax')}</span>
                    <span>R$ {fmtBRL(tax)}</span>
                  </div>
                  <div
                    className="flex items-center justify-between pt-2 mt-1"
                    style={{ borderTop: '1px solid #232327', color: '#f4f4f6' }}
                  >
                    <span className="text-[14px] font-semibold">{t('receipts.total')}</span>
                    <span className="text-[20px] font-bold tracking-[-.01em]">
                      R$ {fmtBRL(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Btn variant="secondary">{t('receipts.cancel')}</Btn>
                <Btn variant="primary" rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                  {t('receipts.generate')}
                </Btn>
              </div>
            </Card>
          </div>

          {/* Preview A4 à direita — proporção 210x297mm, fit-to-container */}
          <div className="shrink-0" style={{ width: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium" style={{ color: '#86868d' }}>
                {t('receipts.preview')}
              </span>
              <span className="text-[11px]" style={{ color: '#6a6a70' }}>
                A4
              </span>
            </div>
            <InvoicePreview
              client={client || '—'}
              items={items}
              subtotal={subtotal}
              tax={tax}
              total={total}
              date={fmtDate(today)}
              due={fmtDate(due)}
              fmtBRL={fmtBRL}
            />
          </div>
        </div>

        {/* Recibos recentes */}
        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
              {t('receipts.recent')}
            </span>
            <Btn
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}
            >
              {t('receipts.view_all')}
            </Btn>
          </div>
          <div
            className="flex items-center px-1.5 pb-2.5"
            style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: 12, fontWeight: 500 }}
          >
            <div style={{ width: 80, flexShrink: 0 }}>Nº</div>
            <div style={{ flex: 1.3 }}>{t('receipts.col.client')}</div>
            <div style={{ width: 120, flexShrink: 0 }}>{t('receipts.col.date')}</div>
            <div style={{ width: 120, flexShrink: 0 }}>{t('receipts.col.due')}</div>
            <div style={{ width: 120, flexShrink: 0 }}>{t('receipts.col.status')}</div>
            <div style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>
              {t('receipts.col.total')}
            </div>
          </div>
          {RECENT.map((r, i) => {
            const { tone, label } = STATUS_TONE[r.status]
            return (
              <div
                key={i}
                className="flex items-center px-1.5 py-3 hover:opacity-90 transition-opacity"
                style={{ borderBottom: '1px solid #161618', fontSize: 13, color: '#e8e8ea' }}
              >
                <div style={{ width: 80, flexShrink: 0, color: '#9a9aa0' }}>{r.no}</div>
                <div className="flex items-center gap-[9px] min-w-0" style={{ flex: 1.3 }}>
                  <Avatar gradient={r.av} initial={r.initial} size="sm" />
                  <span className="font-semibold truncate" style={{ color: '#f0f0f2' }}>
                    {r.client}
                  </span>
                </div>
                <div style={{ width: 120, flexShrink: 0, color: '#86868d' }}>{r.date}</div>
                <div style={{ width: 120, flexShrink: 0, color: '#b8b8be' }}>{r.due}</div>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <Pill tone={tone}>{label}</Pill>
                </div>
                <div
                  style={{
                    width: 110,
                    flexShrink: 0,
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#f4f4f6'
                  }}
                >
                  {r.total}
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}

/**
 * Preview A4 do recibo (paper-style).
 *
 * Renderiza um "papel" com sombra sutil e proporção A4. Não é PDF —
 * é só a pré-visualização visual do que vai sair. Os valores vêm
 * direto do state do form, então atualiza em tempo real.
 */
function InvoicePreview({
  client,
  items,
  subtotal,
  tax,
  total,
  date,
  due,
  fmtBRL
}: {
  client: string
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  date: string
  due: string
  fmtBRL: (n: number) => string
}) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        background: '#f8f8f9',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
        aspectRatio: '210 / 297',
        color: '#1a1a1d'
      }}
    >
      <div className="h-full flex flex-col p-5 text-[10px]">
        {/* Header: brand + número */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[13px] font-bold tracking-tight" style={{ color: '#0a0a0f' }}>
              KUXY
            </div>
            <div style={{ color: '#6a6a70', fontSize: 9 }}>Recibo de serviço</div>
          </div>
          <div className="text-right">
            <div style={{ color: '#6a6a70', fontSize: 9 }}>Recibo</div>
            <div className="font-semibold" style={{ color: '#0a0a0f' }}>
              #0043
            </div>
          </div>
        </div>

        {/* Cliente + datas */}
        <div
          className="flex justify-between mb-4 pb-3"
          style={{ borderBottom: '1px solid #d4d4d8' }}
        >
          <div>
            <div style={{ color: '#6a6a70', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Para
            </div>
            <div className="font-semibold mt-0.5" style={{ color: '#0a0a0f' }}>
              {client}
            </div>
          </div>
          <div className="text-right">
            <div style={{ color: '#6a6a70', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Data
            </div>
            <div className="font-semibold mt-0.5" style={{ color: '#0a0a0f' }}>
              {date}
            </div>
            <div style={{ color: '#6a6a70', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
              Vencimento
            </div>
            <div className="font-semibold" style={{ color: '#0a0a0f' }}>
              {due}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex pb-1.5"
            style={{
              borderBottom: '1.5px solid #1a1a1d',
              color: '#6a6a70',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3
            }}
          >
            <div className="flex-1">Descrição</div>
            <div className="w-[40px] text-right">Horas</div>
            <div className="w-[60px] text-right">Valor/h</div>
            <div className="w-[70px] text-right">Total</div>
          </div>
          {items.slice(0, 6).map((it, i) => (
            <div
              key={i}
              className="flex py-1.5"
              style={{ borderBottom: '1px solid #e4e4e7' }}
            >
              <div className="flex-1 truncate" style={{ color: '#0a0a0f' }}>
                {it.description || '—'}
              </div>
              <div className="w-[40px] text-right" style={{ color: '#3a3a40' }}>
                {it.hours}
              </div>
              <div className="w-[60px] text-right" style={{ color: '#3a3a40' }}>
                R$ {fmtBRL(it.rate)}
              </div>
              <div className="w-[70px] text-right font-semibold" style={{ color: '#0a0a0f' }}>
                R$ {fmtBRL(it.hours * it.rate)}
              </div>
            </div>
          ))}
          {items.length > 6 && (
            <div className="py-1.5 text-center" style={{ color: '#9a9aa0' }}>
              +{items.length - 6} {items.length - 6 === 1 ? 'item' : 'itens'}
            </div>
          )}
        </div>

        {/* Totais */}
        <div className="mt-auto pt-3" style={{ borderTop: '1.5px solid #1a1a1d' }}>
          <div className="flex justify-between mb-1" style={{ color: '#3a3a40' }}>
            <span>Subtotal</span>
            <span>R$ {fmtBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-1.5" style={{ color: '#3a3a40' }}>
            <span>ISS (6%)</span>
            <span>R$ {fmtBRL(tax)}</span>
          </div>
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: '1px solid #d4d4d8' }}
          >
            <span className="font-semibold" style={{ color: '#0a0a0f' }}>
              Total
            </span>
            <span className="text-[13px] font-bold" style={{ color: '#0a0a0f' }}>
              R$ {fmtBRL(total)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-3 pt-2 text-center"
          style={{ borderTop: '1px solid #e4e4e7', color: '#9a9aa0', fontSize: 8 }}
        >
          Gerado via KUXY · {date}
        </div>
      </div>
    </div>
  )
}