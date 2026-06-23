import { useState } from 'react'
import { X } from 'lucide-react'
import { } from '../../lib/utils'
import { useT } from '../../lib/i18n'
import type { ProjectStatus, ProjectPriority } from '../../types'

/**
 * Dialog pra criar um novo projeto. Status inicial vem do botão "+ Add"
 * da coluna (todo, in_progress, etc), e pode ser editado.
 *
 * Não tem campos pra tudo — só o essencial:
 * emoji, nome, client, status, priority, dueDate.
 * Demais coisas (members, tags, links, subitems) são editáveis depois
 * via side panel.
 */
export function NewProjectDialog({
  onClose,
  onCreated,
  profileId,
  initialStatus
}: {
  onClose: () => void
  onCreated: (projectId: number) => void
  profileId: number
  initialStatus: ProjectStatus
}) {
  const t = useT()
  const [emoji, setEmoji] = useState('📁')
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [status, setStatus] = useState<ProjectStatus>(initialStatus)
  const [priority, setPriority] = useState<ProjectPriority>(2)
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim()) return
    setSaving(true)
    const result = await window.api.projects.create({
      profileId,
      emoji,
      name: name.trim(),
      client: client.trim() || null,
      description: null,
      status,
      priority,
      progress: 0,
      sortOrder: 0,
      dueDate: dueDate || null,
      person: null,
      youtubeUrl: null,
      googleDriveUrl: null,
      tiktokUrl: null,
      notes: null,
      archived: false
    })
    setSaving(false)
    if (result?.id) {
      onCreated(result.id)
    } else {
      onClose()
    }
  }

  const EMOJI_PRESETS = ['📁', '🎬', '🚀', '💼', '🎨', '📱', '🌐', '📝', '📊', '✨', '🔥', '💡']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-scrim)' }}
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-4 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t('projects.new')}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Emoji + Name */}
        <div className="flex gap-2">
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Emoji</label>
            <button
              onClick={() => {
                // Simples: rotaciona pelos presets
                const idx = EMOJI_PRESETS.indexOf(emoji)
                const next = EMOJI_PRESETS[(idx + 1) % EMOJI_PRESETS.length]
                setEmoji(next)
              }}
              className="w-12 h-10 bg-bg-subtle border border-border rounded-lg text-lg flex items-center justify-center hover:bg-bg-hover transition-colors"
              title="Click to change"
            >
              {emoji}
            </button>
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-text-muted mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
        </div>

        {/* Client */}
        <div>
          <label className="text-[11px] text-text-muted mb-1 block">
            {t('projects.client')}
          </label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="e.g. Stellar, Taskez"
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:border-accent"
          />
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="todo">{t('projects.column.todo')}</option>
              <option value="in_progress">{t('projects.column.in_progress')}</option>
              <option value="in_review">{t('projects.column.in_review')}</option>
              <option value="completed">{t('projects.column.completed')}</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as ProjectPriority)}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value={1}>{t('projects.priority.high')}</option>
              <option value={2}>{t('projects.priority.medium')}</option>
              <option value={3}>{t('projects.priority.low')}</option>
            </select>
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="text-[11px] text-text-muted mb-1 block">
            {t('projects.due')}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={saving || !name.trim()}
            className="btn btn-primary flex-1"
          >
            {saving ? t('common.loading') : t('projects.create')}
          </button>
        </div>
      </div>
    </div>
  )
}