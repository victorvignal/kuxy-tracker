import { useState, useMemo } from 'react'
import { useT } from '../lib/i18n'
import { IconExport, ChevronDown } from '../components/template-icons/TemplateIcon'

/**
 * Página Contacts — réplica 1:1 da tabela "124 Personal Contacts" do template
 * Pessoal Dashboard. Estado local (sem DB) por enquanto; pode evoluir pra
 * CRUD persistido em release futura.
 */

type Status = 'Active' | 'Pending' | 'Inactive'
type Source = 'Family' | 'Friend' | 'Work'

type Contact = {
  id: string
  name: string
  email: string
  color: string
  status: Status
  date: string
  source: Source
}

const STATUS_STYLES: Record<Status, { bg: string; fg: string }> = {
  Active: {
    bg: 'color-mix(in oklab, var(--color-success), transparent 86%)',
    fg: 'var(--color-success)'
  },
  Pending: {
    bg: 'color-mix(in oklab, var(--color-warning), transparent 86%)',
    fg: 'var(--color-warning)'
  },
  Inactive: { bg: 'var(--color-bg-hover)', fg: 'var(--color-text-muted)' }
}

const SEED: Contact[] = [
  { id: '001', name: 'Maria Silva', email: 'maria@gmail.com', color: '#f472b6', status: 'Active', date: '2025-06-01', source: 'Family' },
  { id: '002', name: 'João Santos', email: 'joao.s@gmail.com', color: '#60a5fa', status: 'Active', date: '2025-05-22', source: 'Friend' },
  { id: '003', name: 'Ana Costa', email: 'ana.costa@outlook.com', color: '#a78bfa', status: 'Pending', date: '2025-04-15', source: 'Work' },
  { id: '004', name: 'Pedro Lima', email: 'pedro.lima@gmail.com', color: '#34d399', status: 'Active', date: '2025-04-02', source: 'Family' },
  { id: '005', name: 'Carla Souza', email: 'carla.souza@hotmail.com', color: '#fbbf24', status: 'Inactive', date: '2025-03-20', source: 'Work' },
  { id: '006', name: 'Lucas Rocha', email: 'lucas.r@gmail.com', color: '#22d3ee', status: 'Active', date: '2025-03-11', source: 'Friend' },
  { id: '007', name: 'Beatriz Alves', email: 'bia.alves@gmail.com', color: '#fb923c', status: 'Pending', date: '2025-02-28', source: 'Work' },
  { id: '008', name: 'Rafael Dias', email: 'rafael.dias@outlook.com', color: '#f87171', status: 'Active', date: '2025-02-10', source: 'Family' }
]

export function Contacts() {
  const t = useT()
  const [contacts] = useState<Contact[]>(SEED)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))

  const toggleAll = () => {
    const next = !selectAll
    const map: Record<string, boolean> = {}
    contacts.forEach((c) => (map[c.id] = next))
    setSelected(map)
    setSelectAll(next)
  }

  const count = contacts.length
  const title = `${count} ${t('contacts.title')}`

  const newBtn = useMemo(
    () => (
      <button className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] px-[14px] py-[9px] text-tmpl-body font-semibold text-text hover:bg-bg-hover transition-colors">
        {t('contacts.new')}
        <span className="w-px h-4 bg-border" />
        <ChevronDown size={14} color="var(--color-text-muted)" />
      </button>
    ),
    [t]
  )

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      {/* Filter row */}
      <div className="flex items-center gap-[14px] px-7 pt-6">
        <div className="flex gap-0.5 bg-bg-card border border-border rounded-[11px] p-1">
          {['contacts.tab_30d', 'contacts.tab_3m', 'contacts.tab_1y'].map((key) => (
            <button
              key={key}
              className="px-4 py-1.5 rounded-md text-tmpl-body-sm font-medium text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
            >
              {t(key)}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] px-[15px] py-[9px] text-tmpl-body font-semibold text-text hover:bg-bg-hover transition-colors">
          <IconExport size={15} />
          {t('common.export')}
        </button>
        {newBtn}
      </div>

      {/* Table card */}
      <div className="px-7 pt-5 pb-10">
        <div className="bg-bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="px-[22px] pt-5 pb-3.5 text-tmpl-title-md">{title}</div>
          {/* Header row */}
          <div
            className="grid items-center px-[22px] pb-2.5 border-b border-border text-tmpl-label-xs text-text-muted font-medium"
            style={{ gridTemplateColumns: '44px 56px 1.5fr 1.9fr 110px 120px 90px' }}
          >
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleAll}
              className="cursor-pointer"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span>ID</span>
            <span>{t('contacts.col_name')}</span>
            <span>{t('contacts.col_email')}</span>
            <span>{t('contacts.col_status')}</span>
            <span>{t('contacts.col_date')}</span>
            <span>{t('contacts.col_source')}</span>
          </div>

          {/* Rows */}
          {contacts.map((c) => {
            const st = STATUS_STYLES[c.status]
            return (
              <div
                key={c.id}
                className="grid items-center px-[22px] py-[13px] border-b border-border text-tmpl-body hover:bg-bg-hover transition-colors"
                style={{ gridTemplateColumns: '44px 56px 1.5fr 1.9fr 110px 120px 90px' }}
              >
                <input
                  type="checkbox"
                  checked={!!selected[c.id]}
                  onChange={() => toggle(c.id)}
                  className="cursor-pointer"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <span className="text-text-muted">{c.id}</span>
                <div className="flex items-center gap-[11px]">
                  <span
                    className="w-[26px] h-[26px] rounded-full shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="font-medium">{c.name}</span>
                </div>
                <span className="text-text-muted truncate">{c.email}</span>
                <span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-tmpl-label-xs font-semibold"
                    style={{ background: st.bg, color: st.fg }}
                  >
                    {c.status}
                  </span>
                </span>
                <span className="text-text-muted">{c.date}</span>
                <span className="font-semibold" style={{ color: 'var(--color-accent-light)' }}>
                  {c.source}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}