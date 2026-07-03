import { useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import type { Contact, ContactStatus, ContactSource } from '../../hooks/useContacts'

const COLORS = [
  '#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24',
  '#22d3ee', '#fb923c', '#f87171', '#a3e635', '#c084fc'
]

const STATUS_OPTIONS: ContactStatus[] = ['active', 'pending', 'inactive']
const SOURCE_OPTIONS: ContactSource[] = ['family', 'friend', 'work', 'other']

export type ContactInput = Omit<Contact, 'id' | 'archived' | 'createdAt' | 'updatedAt'>

interface Props {
  contact: Contact | null
  profileId: number
  onClose: () => void
  onSubmit: (data: ContactInput) => Promise<void>
}

/**
 * Modal de criar/editar contato. Extraído de Contacts.tsx pra seguir
 * o mesmo padrão dos outros Dialogs do app (AccountDialog, BudgetDialog,
 * TransactionDialog em `components/finance/`).
 *
 * Single source of truth do form de contato. Reutiliza Contact/ContactStatus/
 * ContactSource de `useContacts` — não duplica tipos.
 */
export function ContactDialog({ contact, profileId, onClose, onSubmit }: Props) {
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