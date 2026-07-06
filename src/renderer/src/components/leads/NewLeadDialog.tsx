import { useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { useLeads } from '../../hooks/useLeads'

/**
 * Modal pra criar um lead novo. Aberto pelo botão "+ Add" do Topbar
 * quando o usuário está no perfil profissional em /spending (LeadsFinder)
 * ou em outras rotas onde faz sentido adicionar lead manual.
 *
 * Pra editar um lead existente, use EditLeadDialog dentro do LeadsFinder
 * (inline com mais campos visíveis).
 */
export function NewLeadDialog({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { create } = useLeads()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await create({
        externalId: `manual-${Date.now()}`,
        source: 'manual',
        name: name.trim(),
        handle: handle.trim() || null,
        avatarUrl: null,
        region: null,
        category: category.trim() || null,
        followers: 0,
        score: 0,
        email: email.trim() || null,
        notes: notes.trim() || null,
        status: 'new'
      })
      onClose()
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
          <h2 className="text-base font-semibold">{t('leads.new')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-hover text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('leads.name')} *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('leads.name_placeholder')}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('leads.handle')}</label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@handle"
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('leads.category')}</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Lifestyle"
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('leads.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@dominio.com"
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('leads.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t('leads.notes_placeholder')}
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
            {saving ? t('common.loading') : t('leads.create')}
          </button>
        </div>
      </form>
    </div>
  )
}