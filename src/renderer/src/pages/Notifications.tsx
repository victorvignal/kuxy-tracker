import { useState } from 'react'
import { Briefcase, LayoutGrid, ArrowRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Avatar } from '../components/ui/Avatar'
import { useProfileStore } from '../store/useProfile'

/**
 * Notifications (Pessoal) + Clients (Profissional) — consolidados por perfil.
 *
 * Pessoal: lista simples de pessoas (Contacts).
 * Profissional: visão de clientes com canais, tags e projetos. Template
 * "Clients" do `Tempo Dashboard.dc.html`:
 *   - 3 stat cards (Clientes ativos / Projetos no prazo / Receita média)
 *   - Grid de cards por cliente (avatar + nome + canais YouTube/TikTok/Drive + tags)
 *   - Botão "Ver insights →"
 */

type Client = {
  name: string
  initial: string
  av: string
  status: 'on-track' | 'at-risk' | 'late'
  youtube: string
  tiktok: string
  drive: string
  tags: string[]
  videos: number
  revenue: string
}

const PRO_CLIENTS: Client[] = [
  {
    name: 'Northwind',
    initial: 'N',
    av: '#8b5cf6',
    status: 'on-track',
    youtube: 'northwind.co',
    tiktok: '@northwind',
    drive: 'drive.google.com/northwind',
    tags: ['Long-form', 'Documentary'],
    videos: 14,
    revenue: 'R$ 28.5k'
  },
  {
    name: 'Lumen Studio',
    initial: 'L',
    av: '#a78bfa',
    status: 'on-track',
    youtube: 'lumen.studio',
    tiktok: '@lumenstudio',
    drive: 'drive.google.com/lumen',
    tags: ['Shorts', 'Vertical'],
    videos: 22,
    revenue: 'R$ 18.2k'
  },
  {
    name: 'Brightline',
    initial: 'B',
    av: '#6d4ee0',
    status: 'at-risk',
    youtube: 'brightline.tv',
    tiktok: '@brightline',
    drive: 'drive.google.com/brightline',
    tags: ['Long-form'],
    videos: 8,
    revenue: 'R$ 12.8k'
  },
  {
    name: 'Velasco Films',
    initial: 'V',
    av: '#4f4193',
    status: 'on-track',
    youtube: 'velasco.films',
    tiktok: '@velasco',
    drive: 'drive.google.com/velasco',
    tags: ['Reels', 'Vertical'],
    videos: 11,
    revenue: 'R$ 9.4k'
  },
  {
    name: 'Pixel & Co',
    initial: 'P',
    av: '#5b6b8c',
    status: 'late',
    youtube: 'pixelco.io',
    tiktok: '@pixelco',
    drive: 'drive.google.com/pixel',
    tags: ['Documentary', 'Long-form'],
    videos: 5,
    revenue: 'R$ 6.1k'
  },
  {
    name: 'Atlas Media',
    initial: 'A',
    av: '#7a6b9c',
    status: 'on-track',
    youtube: 'atlas.media',
    tiktok: '@atlasmedia',
    drive: 'drive.google.com/atlas',
    tags: ['Shorts'],
    videos: 17,
    revenue: 'R$ 14.7k'
  }
]

const STATUS_TONE = {
  'on-track': { tone: 'success' as const, label: 'No prazo' },
  'at-risk': { tone: 'warning' as const, label: 'Em risco' },
  late: { tone: 'danger' as const, label: 'Atrasado' }
}

export function Notifications() {
  const active = useProfileStore((s) => s.getActive())

  // Profissional = Clients (visão densa de clientes do negócio)
  if (active?.type === 'professional') {
    return <ClientsPro />
  }

  // Pessoal = lista simples de pessoas (placeholder do template)
  return <NotificationsPersonal />
}

function ClientsPro() {
  const [tab, setTab] = useState<'Overview' | 'Team' | 'Projects' | 'Insights'>('Overview')

  const total = PRO_CLIENTS.length
  const onTrack = PRO_CLIENTS.filter((c) => c.status === 'on-track').length
  const avgRevenue = (
    PRO_CLIENTS.reduce((acc, c) => acc + parseFloat(c.revenue.replace(/[^0-9]/g, '')), 0) / total
  ).toFixed(1)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Header: tabs + ações */}
        <div className="flex items-center justify-between mb-[18px]">
          <SegmentedControl
            options={[
              { value: 'Overview' as const, label: 'Overview' },
              { value: 'Team' as const, label: 'Team' },
              { value: 'Projects' as const, label: 'Projects' },
              { value: 'Insights' as const, label: 'Insights' }
            ]}
            value={tab}
            onChange={setTab}
          />
          <div className="flex items-center gap-[10px]">
            <Btn variant="secondary" size="sm" leftIcon={<ArrowRight size={14} strokeWidth={1.75} style={{ transform: 'rotate(180deg)' }} />}>
              Exportar
            </Btn>
            <Btn variant="primary" size="sm" leftIcon={<Briefcase size={14} strokeWidth={1.75} />}>
              Novo cliente
            </Btn>
          </div>
        </div>

        {/* 3 stat cards */}
        <div className="flex gap-[14px] mb-4">
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#1c1c20' }}
              >
                <Briefcase size={18} color="#a78bfa" strokeWidth={1.75} />
              </span>
            </div>
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Clientes ativos</div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>{total}</div>
            <div className="text-[12px] mt-2">
              <span className="font-semibold" style={{ color: '#4ade80' }}>+2 este mês</span>
            </div>
          </Card>
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#1c1c20' }}
              >
                <LayoutGrid size={18} color="#a78bfa" strokeWidth={1.75} />
              </span>
            </div>
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>No prazo</div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#4ade80' }}>
              {onTrack}/{total}
            </div>
            <div className="text-[12px] mt-2">
              <span className="font-semibold" style={{ color: '#4ade80' }}>
                {Math.round((onTrack / total) * 100)}%
              </span>{' '}
              <span style={{ color: '#7a7a80' }}>taxa de sucesso</span>
            </div>
          </Card>
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#1c1c20' }}
              >
                <ArrowRight size={18} color="#a78bfa" strokeWidth={1.75} />
              </span>
            </div>
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Receita média / cliente</div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>R$ {avgRevenue}k</div>
            <div className="text-[12px] mt-2">
              <span className="font-semibold" style={{ color: '#4ade80' }}>+8% vs. mês anterior</span>
            </div>
          </Card>
        </div>

        {/* Grid de clientes */}
        <div className="grid grid-cols-2 gap-[14px]">
          {PRO_CLIENTS.map((c, i) => {
            const { tone, label } = STATUS_TONE[c.status]
            return (
              <Card key={i} padding="16px 18px" className="cursor-pointer hover:opacity-90 transition-opacity">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-[10px] min-w-0">
                    <Avatar gradient={c.av} initial={c.initial} size="md" shape="circle" />
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold truncate" style={{ color: '#f4f4f6' }}>
                        {c.name}
                      </div>
                      <div className="text-[11px]" style={{ color: '#7a7a80' }}>
                        {c.videos} vídeos · {c.revenue}
                      </div>
                    </div>
                  </div>
                  <Pill tone={tone}>{label}</Pill>
                </div>
                <div className="flex flex-col gap-2 text-[12px]" style={{ color: '#b8b8be' }}>
                  <ChannelLink label="YouTube" value={c.youtube} />
                  <ChannelLink label="TikTok" value={c.tiktok} />
                  <ChannelLink label="Drive" value={c.drive} accent />
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {c.tags.map((t, j) => (
                    <Pill key={j} tone="muted" dot={false}>
                      {t}
                    </Pill>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ChannelLink({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: '#6a6a70', width: 50 }}>{label}</span>
      <span
        className="truncate"
        style={{
          color: accent ? '#8b5cf6' : '#e8e8ea',
          textDecoration: accent ? 'underline rgba(139, 92, 246, 0.45)' : 'none'
        }}
      >
        {value}
      </span>
    </div>
  )
}

function NotificationsPersonal() {
  // Placeholder simples — versão pessoal não tem design rico no template.
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        <Card>
          <div className="text-[15px] font-semibold mb-2" style={{ color: '#f4f4f6' }}>
            Notificações pessoais
          </div>
          <div className="text-[13px]" style={{ color: '#86868d' }}>
            Use o menu lateral pra abrir a página <strong>Contacts</strong> com seus contatos pessoais.
          </div>
        </Card>
      </div>
    </div>
  )
}