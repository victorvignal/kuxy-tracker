import { useState } from 'react'
import { Send, Plus, X, MoreHorizontal } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'
import { Avatar } from '../components/ui/Avatar'

/**
 * Outreach (Profissional) — prospecção de criadores.
 *
 * Template "Outreach" do `Tempo Dashboard.dc.html`:
 *   - 4 stat cards (DMs enviadas / taxa resposta / leads ativos / fechados)
 *   - Filtros por subnicho (chips) + status (segmented control)
 *   - Tabela de leads com canal, status, último contato
 *   - Modal "Novo Lead" (placeholder)
 */

type LeadStatus = 'pendente' | 'enviado' | 'respondeu' | 'fechou' | 'ignorou'

type Lead = {
  name: string
  initial: string
  av: string
  niche: string
  channel: string
  followers: string
  status: LeadStatus
  lastContact: string
  email?: string
}

const PRO_LEADS: Lead[] = [
  { name: 'Marina Reis', initial: 'M', av: '#8b5cf6', niche: 'Lifestyle', channel: 'YouTube', followers: '124k', status: 'respondeu', lastContact: '23 jun', email: 'marina@gmail.com' },
  { name: 'Bruno Costa', initial: 'B', av: '#a78bfa', niche: 'Tech', channel: 'YouTube', followers: '89k', status: 'enviado', lastContact: '22 jun', email: 'bruno@gmail.com' },
  { name: 'Carla Mendes', initial: 'C', av: '#6d4ee0', niche: 'Fitness', channel: 'TikTok', followers: '203k', status: 'pendente', lastContact: '—' },
  { name: 'Diego Alves', initial: 'D', av: '#4f4193', niche: 'Gaming', channel: 'YouTube', followers: '456k', status: 'fechou', lastContact: '20 jun', email: 'diego@gmail.com' },
  { name: 'Elisa Prado', initial: 'E', av: '#5b6b8c', niche: 'Food', channel: 'Instagram', followers: '67k', status: 'ignorou', lastContact: '18 jun' },
  { name: 'Felipe Sá', initial: 'F', av: '#7a6b9c', niche: 'Travel', channel: 'YouTube', followers: '178k', status: 'enviado', lastContact: '17 jun', email: 'felipe@gmail.com' },
  { name: 'Gabriela N.', initial: 'G', av: '#22d3ee', niche: 'Beauty', channel: 'TikTok', followers: '312k', status: 'pendente', lastContact: '—' },
  { name: 'Hugo Lima', initial: 'H', av: '#fbbf24', niche: 'Business', channel: 'YouTube', followers: '95k', status: 'respondeu', lastContact: '15 jun', email: 'hugo@gmail.com' }
]

const STATUS_TONE: Record<LeadStatus, { tone: 'warning' | 'info' | 'success' | 'danger' | 'muted'; label: string }> = {
  pendente: { tone: 'muted', label: 'PENDENTE' },
  enviado: { tone: 'info', label: 'ENVIADO' },
  respondeu: { tone: 'warning', label: 'RESPONDEU' },
  fechou: { tone: 'success', label: 'FECHOU' },
  ignorou: { tone: 'danger', label: 'IGNOROU' }
}

const NICHE_CHIPS = ['Todos', 'Lifestyle', 'Tech', 'Fitness', 'Gaming', 'Food', 'Travel', 'Beauty', 'Business']

export function Outreach() {
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [niche, setNiche] = useState('Todos')
  const [showNew, setShowNew] = useState(false)

  const filtered = PRO_LEADS.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    if (niche !== 'Todos' && l.niche !== niche) return false
    return true
  })

  const dmCount = PRO_LEADS.length * 4
  const responseRate = 38
  const activeLeads = PRO_LEADS.filter((l) => l.status !== 'ignorou' && l.status !== 'fechou').length
  const closed = PRO_LEADS.filter((l) => l.status === 'fechou').length

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* 4 stat cards */}
        <div className="flex gap-[14px] mb-4">
          <OutreachStat label="DMs enviadas" value={String(dmCount)} delta="este mês" positive />
          <OutreachStat label="Taxa de resposta" value={`${responseRate}%`} delta="vs. mês anterior" positive={null} />
          <OutreachStat label="Leads ativos" value={String(activeLeads)} delta="em conversa" positive />
          <OutreachStat label="Fechados" value={String(closed)} delta="este mês" positive />
        </div>

        {/* Filtros */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {NICHE_CHIPS.map((n) => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
                style={{
                  background: n === niche ? '#26262a' : 'transparent',
                  color: n === niche ? '#f4f4f6' : '#86868d',
                  border: n === niche ? '1px solid #3a3a3e' : '1px solid #232327'
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-[9px] p-[3px]" style={{ background: '#121214', border: '1px solid #202023' }}>
              {(['all', 'pendente', 'enviado', 'respondeu', 'fechou', 'ignorou'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                  style={{
                    background: statusFilter === s ? '#26262a' : 'transparent',
                    color: statusFilter === s ? '#f4f4f6' : '#86868d',
                    fontWeight: statusFilter === s ? 600 : 500
                  }}
                >
                  {s === 'all' ? 'Todos' : STATUS_TONE[s].label}
                </button>
              ))}
            </div>
            <div className="text-[12px]" style={{ color: '#86868d' }}>
              {filtered.length} leads
            </div>
          </div>
        </Card>

        {/* Tabela de leads */}
        <Card>
          <div
            className="flex items-center px-1.5 pb-2.5"
            style={{ borderBottom: '1px solid #1d1d20', color: '#7a7a80', fontSize: 12, fontWeight: 500 }}
          >
            <div style={{ flex: 1.5 }}>Criador</div>
            <div style={{ flex: 1 }}>Nicho</div>
            <div style={{ width: 110, flexShrink: 0 }}>Canal</div>
            <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}>Seguidores</div>
            <div style={{ width: 120, flexShrink: 0 }}>Status</div>
            <div style={{ width: 90, flexShrink: 0 }}>Último contato</div>
            <div style={{ width: 40, flexShrink: 0 }}></div>
          </div>
          {filtered.map((l, i) => {
            const { tone, label } = STATUS_TONE[l.status]
            return (
              <div
                key={i}
                className="flex items-center px-1.5 py-3 hover:opacity-90 transition-opacity"
                style={{ borderBottom: '1px solid #161618', fontSize: 13, color: '#e8e8ea' }}
              >
                <div className="flex items-center gap-[10px] min-w-0" style={{ flex: 1.5 }}>
                  <Avatar gradient={l.av} initial={l.initial} size="sm" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: '#f0f0f2' }}>{l.name}</div>
                    {l.email && (
                      <div className="text-[11px] truncate" style={{ color: '#7a7a80' }}>{l.email}</div>
                    )}
                  </div>
                </div>
                <div style={{ flex: 1, color: '#b8b8be' }}>{l.niche}</div>
                <div style={{ width: 110, flexShrink: 0, color: '#9a9aa0' }}>{l.channel}</div>
                <div style={{ width: 90, flexShrink: 0, textAlign: 'right', color: '#b8b8be' }}>{l.followers}</div>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <Pill tone={tone}>{label}</Pill>
                </div>
                <div style={{ width: 90, flexShrink: 0, color: '#86868d' }}>{l.lastContact}</div>
                <div style={{ width: 40, flexShrink: 0, color: '#6a6a70', textAlign: 'right', cursor: 'pointer' }}>
                  <MoreHorizontal size={16} />
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      {/* Modal Novo Lead */}
      {showNew && (
        <div
          onClick={() => setShowNew(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Card onClick={(e) => e.stopPropagation()} style={{ width: 480, padding: '24px 28px' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-[16px] font-semibold" style={{ color: '#f4f4f6' }}>Novo Lead</span>
              <button onClick={() => setShowNew(false)} style={{ color: '#9a9aa0' }}>
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <LeadInput label="Nome" placeholder="Ex: Marina Reis" />
              <LeadInput label="Canal" placeholder="YouTube" />
              <LeadInput label="Email" placeholder="email@dominio.com" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Btn variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Btn>
              <Btn variant="primary" onClick={() => setShowNew(false)} leftIcon={<Send size={14} />}>
                Adicionar
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Botão flutuante "Novo Lead" */}
      <button
        onClick={() => setShowNew(true)}
        className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full"
        style={{
          background: '#8b5cf6',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
          zIndex: 10
        }}
      >
        <Plus size={16} strokeWidth={2.5} /> Novo Lead
      </button>
    </div>
  )
}

function OutreachStat({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean | null }) {
  const color = positive === true ? '#4ade80' : positive === false ? '#f87171' : '#86868d'
  return (
    <Card className="flex-1">
      <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>{label}</div>
      <div className="text-[22px] font-bold mb-2 tracking-[-.01em]" style={{ color: '#f4f4f6' }}>{value}</div>
      <div className="text-[12px]" style={{ color: '#7a7a80' }}>
        <span style={{ color, fontWeight: 600 }}>{delta}</span>
      </div>
    </Card>
  )
}

function LeadInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium" style={{ color: '#86868d' }}>{label}</span>
      <input
        placeholder={placeholder}
        className="px-3 py-2 rounded-[8px] text-[13px] outline-none"
        style={{
          background: '#0e0e10',
          border: '1px solid #232327',
          color: '#e8e8ea'
        }}
      />
    </label>
  )
}