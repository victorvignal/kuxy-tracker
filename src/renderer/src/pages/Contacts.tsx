import { useState } from 'react'
import { Trash2, Edit2, X } from 'lucide-react'
import { useT } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import { useContacts, type Contact, type ContactStatus, type ContactSource } from '../hooks/useContacts'
import { IconExport, ChevronDown } from '../components/template-icons/TemplateIcon'

/**
 * Contacts (v0.9.0) — CRUD real persistido em DB.
 *
 * Substitui a versão mock (v0.4–v0.8.x) que tinha SEED hardcoded e
 * nenhum botão funcional. Agora lista, cria, edita, arquiva e deleta
 * via `useContacts` hook → window.api.contacts.* → IPC → drizzle/SQLite.
 */

const COLORS = [
  '#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24',
  '#22d3ee', '#fb923c', '#f87171', '#a3e635', '#c084fc'
]

const STATUS_OPTIONS: ContactStatus[] = ['active', 'pending', 'inactive']
const SOURCE_OPTIONS: ContactSource[] = ['family', 'friend', 'work', 'other']

export function Contacts() {
  const t = useT()
  const active = useProfileStore((s) => s.getActive())
  const { contacts, loading, create, update, archive, remove } = useContacts()
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)

  const toggle = (id: number) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }))

  const toggleAll = () => {
    const next = !selectAll
    const map: Record<number, boolean> = {}
    contacts.forEach((c) => (map[c.id] = next))
    setSelected(map)
    setSelectAll(next)
  }

  const title = `${contacts.length} ${t('contacts.title')}`

  const handleDelete = async (c: Contact) => {
    if (!confirm(t('contacts.confirm_delete', { name: c.name }))) return
    await remove(c.id)
  }

  const handleArchive = async (c: Contact) => {
    await archive(c.id, !c.archived)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
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
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] px-[14px] py-[9px] text-tmpl-body font-semibold text-text hover:bg-bg-hover transition-colors"
        >
          {t('contacts.new')}
          <span className="w-px h-4 bg-border" />
          <ChevronDown size={14} color="var(--color-text-muted)" />
        </button>
      </div>

      <div className="px-7 pt-5 pb-10">
        <div className="bg-bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="px-[22px] pt-5 pb-3.5 text-tmpl-title-md">{title}</div>

          <div
            className="grid items-center px-[22px] pb-2.5 border-b border-border text-tmpl-label-xs text-text-muted font-medium"
            style={{ gridTemplateColumns: '44px 56px 1.5fr 1.9fr 110px 120px 90px 80px' }}
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
            <span></span>
          </div>

          {loading && contacts.length === 0 ? (
            <div className="px-[22px] py-10 text-center text-text-muted text-sm">
              {t('common.loading')}
            </div>
          ) : contacts.length === 0 ? (
            <div className="px-[22px] py-10 text-center text-text-muted text-sm">
              {t('contacts.empty')}
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="grid items-center px-[22px] py-[13px] border-b border-border text-tmpl-body hover:bg-bg-hover transition-colors"
                style={{ gridTemplateColumns: '44px 56px 1.5fr 1.9fr 110px 120px 90px 80px' }}
              >
                <input
                  type="checkbox"
                  checked={!!selected[c.id]}
                  onChange={() => toggle(c.id)}
                  className="cursor-pointer"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <span className="text-text-muted">{c.id}</span>
                <div className="flex items-center gap-[11px] min-w-0">
                  <span
                    className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold text-white"
                    style={{ background: c.color }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium truncate">{c.name}</span>
                </div>
                <span className="text-text-muted truncate">{c.email ?? '—'}</span>
                <span>
                  <StatusPill status={c.status} />
                </span>
                <span className="text-text-muted">{formatDate(c.createdAt)}</span>
                <span className="font-semibold" style={{ color: 'var(--color-accent-light)' }}>
                  {t(`contacts.source.${c.source}`)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(c)}
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-bg-hover/60"
                    title={t('common.edit')}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleArchive(c)}
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-bg-hover/60 text-[10px]"
                    title={c.archived ? t('contacts.unarchive') : t('contacts.archive')}
                  >
                    {c.archived ? '↩' : '⌐'}
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1 rounded text-text-muted hover:text-danger hover:bg-bg-hover/60"
                    title={t('common.delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(creating || editing) && active && (
        <ContactDialog
          contact={editing}
          profileId={active.id}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSubmit={async (data) => {
            if (editing) {
              await update(editing.id, data)
            } else {
              await create(data)
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function formatDate(d: string | number): string {
  const date = typeof d === 'number' ? new Date(d) : new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toISOString().slice(0, 10)
}

const STATUS_STYLES: Record<ContactStatus, { bg: string; fg: string }> = {
  active: {
    bg: 'color-mix(in oklab, var(--color-success), transparent 86%)',
    fg: 'var(--color-success)'
  },
  pending: {
    bg: 'color-mix(in oklab, var(--color-warning), transparent 86%)',
    fg: 'var(--color-warning)'
  },
  inactive: { bg: 'var(--color-bg-hover)', fg: 'var(--color-text-muted)' }
}

function StatusPill({ status }: { status: ContactStatus }) {
  const t = useT()
  const st = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-tmpl-label-xs font-semibold"
      style={{ background: st.bg, color: st.fg }}
    >
      {t(`contacts.status.${status}`)}
    </span>
  )
}

function ContactDialog({
  contact,
  profileId,
  onClose,
  onSubmit
}: {
  contact: Contact | null
  profileId: number
  onClose: () => void
  onSubmit: (data: Omit<Contact, 'id' | 'archived' | 'createdAt' | 'updatedAt'>) => Promise<void>
}) {
  const t = useT()
  const [name, setName] = useState(contact?.name ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [color, setColor] = useState(contact?.color ?? COLORS[0])
  const [status, setStatus] = useState<ContactStatus>(contact?.status ?? 'active')
  const [source, setSource] = useState<ContactSource>(contact?.source ?? 'other')
  const [notes, setNotes] = useState(contact?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        profileId,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        color,
        status,
        source,
        notes: notes.trim() || null
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-scrim)' }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-3 shadow-pop"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {contact ? t('contacts.edit') : t('contacts.new')}
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('contacts.col_name')} *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('contacts.col_email')}</label>
            <input
              type="email"
              value={email ?? ''}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('contacts.phone')}</label>
            <input
              type="tel"
              value={phone ?? ''}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('contacts.col_status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContactStatus)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`contacts.status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('contacts.col_source')}</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ContactSource)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`contacts.source.${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('common.color')}</label>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c ? 'border-text scale-110' : 'border-transparent'
                }`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('contacts.notes')}</label>
          <textarea
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn btn-primary flex-1"
          >
            {saving ? t('common.loading') : contact ? t('common.save') : t('contacts.create')}
          </button>
        </div>
      </form>
    </div>
  )
}