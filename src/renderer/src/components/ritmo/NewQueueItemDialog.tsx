import { useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { useQueueItems } from '../../hooks/useRitmo'

/**
 * Modal pra adicionar um item novo à fila do Ritmo.
 *
 * Campos: client (obrigatório), video (obrigatório), priority (high/med/low),
 * dueDate (YYYY-MM-DD), stepsJson (default '[1,1,1,0]' = 3 de 4 steps feitos).
 *
 * Aberto pelo botão "+ Add" do Topbar quando o user está no perfil
 * profissional em /transactions (que renderiza Ritmo).
 */
export function NewQueueItemDialog({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { create } = useQueueItems()
  const [client, setClient] = useState('')
  const [video, setVideo] = useState('')
  const [priority, setPriority] = useState<'high' | 'med' | 'low'>('med')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client.trim() || !video.trim()) return
    setSaving(true)
    try {
      await create({
        client: client.trim(),
        video: video.trim(),
        priority,
        dueDate: dueDate || null,
        position: 0,
        stepsJson: '[1,1,1,0]',
        notes: notes.trim() || null
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
          <h2 className="text-base font-semibold">{t('ritmo.new_queue_item')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-hover text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('ritmo.client')} *</label>
            <input
              autoFocus
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Northwind"
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('ritmo.video')} *</label>
            <input
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="Edição 14"
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('ritmo.priority')}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="high">{t('ritmo.priority_high')}</option>
              <option value="med">{t('ritmo.priority_med')}</option>
              <option value="low">{t('ritmo.priority_low')}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">{t('ritmo.due_date')}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('ritmo.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t('ritmo.notes_placeholder')}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving || !client.trim() || !video.trim()}
            className="btn btn-primary flex-1"
          >
            {saving ? t('common.loading') : t('ritmo.create')}
          </button>
        </div>
      </form>
    </div>
  )
}