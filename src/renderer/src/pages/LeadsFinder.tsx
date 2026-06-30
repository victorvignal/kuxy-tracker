import { useState } from 'react'
import { Search, Plus, MapPin } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Avatar } from '../components/ui/Avatar'

/**
 * Leads Finder (Profissional) — busca de criadores por nicho.
 *
 * Template "Leads Finder" do `Tempo Dashboard.dc.html`:
 *   - Hero search (input grande por nicho)
 *   - Filtros: tamanho do canal, região
 *   - Lista de canais com email aparecendo primeiro
 */

type ChannelResult = {
  name: string
  initial: string
  av: string
  subs: string
  region: string
  category: string
  email?: string
  score: number
}

const RESULTS: ChannelResult[] = [
  { name: 'Marina Reis', initial: 'M', av: '#8b5cf6', subs: '124k', region: 'BR', category: 'Lifestyle', email: 'marina@gmail.com', score: 92 },
  { name: 'Bruno Costa', initial: 'B', av: '#a78bfa', subs: '89k', region: 'BR', category: 'Tech', email: 'bruno@gmail.com', score: 88 },
  { name: 'Carla Mendes', initial: 'C', av: '#6d4ee0', subs: '203k', region: 'BR', category: 'Fitness', score: 81 },
  { name: 'Diego Alves', initial: 'D', av: '#4f4193', subs: '456k', region: 'BR', category: 'Gaming', email: 'diego@gmail.com', score: 78 },
  { name: 'Elisa Prado', initial: 'E', av: '#5b6b8c', subs: '67k', region: 'BR', category: 'Food', score: 75 },
  { name: 'Felipe Sá', initial: 'F', av: '#7a6b9c', subs: '178k', region: 'BR', category: 'Travel', email: 'felipe@gmail.com', score: 71 }
]

export function LeadsFinder() {
  const [query, setQuery] = useState('')
  const [size, setSize] = useState<'all' | 'micro' | 'mid' | 'macro'>('all')
  const [region, setRegion] = useState<'all' | 'BR' | 'US' | 'EU'>('BR')

  // Ordena: quem tem email aparece primeiro
  const sorted = [...RESULTS].sort((a, b) => {
    if (a.email && !b.email) return -1
    if (!a.email && b.email) return 1
    return b.score - a.score
  })

  const withEmail = sorted.filter((r) => r.email).length

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Hero search */}
        <Card className="mb-4" padding="22px 24px">
          <div className="flex items-center gap-2 mb-2">
            <Search size={16} color="#a78bfa" strokeWidth={1.75} />
            <span className="text-[12px] font-semibold" style={{ color: '#a78bfa' }}>YOUTUBE API</span>
          </div>
          <div className="text-[20px] font-semibold mb-4" style={{ color: '#f4f4f6' }}>
            Buscar criadores por nicho
          </div>
          <div
            className="flex items-center gap-2 rounded-[10px] px-4 py-3"
            style={{ background: '#0e0e10', border: '1px solid #232327' }}
          >
            <Search size={18} color="#7a7a80" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: lifestyle, tech review, fitness..."
              className="flex-1 bg-transparent outline-none text-[14px]"
              style={{ color: '#e8e8ea' }}
            />
            <Btn variant="primary" size="sm" leftIcon={<Search size={14} strokeWidth={1.75} />}>
              Buscar
            </Btn>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 mt-4">
            <FilterChips
              label="Tamanho"
              options={[
                { v: 'all' as const, l: 'Todos' },
                { v: 'micro' as const, l: 'Micro (10-100k)' },
                { v: 'mid' as const, l: 'Mid (100-500k)' },
                { v: 'macro' as const, l: 'Macro (500k+)' }
              ]}
              value={size}
              onChange={setSize}
            />
            <FilterChips
              label="Região"
              options={[
                { v: 'all' as const, l: 'Todas' },
                { v: 'BR' as const, l: '🇧🇷 Brasil' },
                { v: 'US' as const, l: '🇺🇸 EUA' },
                { v: 'EU' as const, l: '🇪🇺 Europa' }
              ]}
              value={region}
              onChange={setRegion}
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="flex gap-[14px] mb-4">
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Resultados</div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>{sorted.length} canais</div>
          </Card>
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Com e-mail</div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#4ade80' }}>{withEmail}</div>
            <div className="text-[12px] mt-1" style={{ color: '#7a7a80' }}>
              <span className="font-semibold" style={{ color: '#4ade80' }}>
                {Math.round((withEmail / sorted.length) * 100)}%
              </span>{' '}
              da lista
            </div>
          </Card>
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>Score médio</div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              {Math.round(sorted.reduce((a, r) => a + r.score, 0) / sorted.length)}
            </div>
            <div className="text-[12px] mt-1" style={{ color: '#7a7a80' }}>
              <span style={{ color: '#a78bfa' }}>compatibilidade com seu nicho</span>
            </div>
          </Card>
        </div>

        {/* Lista */}
        <Card padding="14px 16px">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>Resultados</span>
            <span className="text-[12px]" style={{ color: '#86868d' }}>
              ordenado por e-mail disponível
            </span>
          </div>
          {sorted.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2 py-3 rounded-[9px] hover:opacity-90 transition-opacity cursor-pointer"
              style={{ borderBottom: i < sorted.length - 1 ? '1px solid #161618' : 'none' }}
            >
              <Avatar gradient={r.av} initial={r.initial} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: '#f0f0f2' }}>{r.name}</span>
                  {r.email && (
                    <span className="text-[11px] font-semibold" style={{ color: '#4ade80' }}>
                      COM E-MAIL
                    </span>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: '#86868d' }}>
                  {r.email ?? '—'}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px]" style={{ color: '#b8b8be' }}>
                <MapPin size={12} color="#7a7a80" />
                <span>{r.region}</span>
                <span style={{ color: '#7a7a80' }}>·</span>
                <span>{r.category}</span>
                <span style={{ color: '#7a7a80' }}>·</span>
                <span style={{ color: '#a78bfa' }}>{r.subs}</span>
              </div>
              <div
                className="px-2.5 py-1 rounded-md text-[12px] font-semibold"
                style={{
                  background: r.score >= 80 ? 'rgba(74, 222, 128, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                  color: r.score >= 80 ? '#4ade80' : '#8b5cf6'
                }}
              >
                {r.score}
              </div>
              <Btn variant="secondary" size="sm" leftIcon={<Plus size={12} strokeWidth={1.75} />}>
                Add
              </Btn>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string
  options: { v: T; l: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px]" style={{ color: '#86868d' }}>{label}:</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.v}
            onClick={() => onChange(opt.v)}
            className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: value === opt.v ? '#26262a' : 'transparent',
              color: value === opt.v ? '#f4f4f6' : '#86868d',
              border: '1px solid #232327'
            }}
          >
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  )
}