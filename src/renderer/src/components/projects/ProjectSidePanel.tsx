import { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import { fmtDate } from '../../lib/utils'
import { useT } from '../../lib/i18n'
import type {
  Project,
  ProjectMember,
  ProjectTag,
  ProjectSubitem,
  ProjectComment,
  ProjectSubitemStatus,
  ProjectStatus,
  ProjectPriority
} from '../../types'
import { AvatarStack } from './AvatarStack'
import {
  STATUS_COLOR,
  SUBITEM_STATUS_DEFS,
  calcProgressFromSubitems
} from './projectConstants'

/**
 * Side panel estilo Notion — abre à direita quando clicamos num card.
 *
 * Estrutura:
 *   - Header: emoji + nome + close
 *   - Status badge (colorido)
 *   - Properties list (label | valor)
 *   - Comments
 *   - Sub-items table (sub-tabs)
 *
 * Props atualizam via IPC sempre que o projeto muda no DB.
 */
export function ProjectSidePanel({
  project,
  members,
  tags,
  subitems,
  onClose,
  onUpdated
}: {
  project: Project | null
  members: ProjectMember[]
  tags: ProjectTag[]
  subitems: ProjectSubitem[]
  profileId: number
  onClose: () => void
  onUpdated: () => void
}) {
  const t = useT()
  const [comments, setComments] = useState<ProjectComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [showExtraProps, setShowExtraProps] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(project?.name ?? '')

  // Edit state
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'todo')
  const [priority, setPriority] = useState(project?.priority ?? 2)
  const [notes, setNotes] = useState(project?.notes ?? '')
  const [youtube, setYoutube] = useState(project?.youtubeUrl ?? '')
  const [googleDrive, setGoogleDrive] = useState(project?.googleDriveUrl ?? '')
  const [tiktok, setTiktok] = useState(project?.tiktokUrl ?? '')
  const [person, setPerson] = useState(project?.person ?? '')
  const [dueDate, setDueDate] = useState(project?.dueDate ?? '')

  // Sub-items
  const [newSubitem, setNewSubitem] = useState('')
  const [addingSubitem, setAddingSubitem] = useState(false)
  const [subitemStatuses, setSubitemStatuses] = useState<Map<number, ProjectSubitemStatus>>(new Map())

  // Members
  const [newMemberName, setNewMemberName] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  // Tags
  const [newTagLabel, setNewTagLabel] = useState('')
  const [addingTag, setAddingTag] = useState(false)

  // Load comments
  useEffect(() => {
    if (!project) return
    window.api.projects.comments.list(project.id).then(setComments)
  }, [project?.id])

  // Sync local state quando project mudar
  useEffect(() => {
    if (!project) return
    setStatus(project.status)
    setPriority(project.priority)
    setNotes(project.notes ?? '')
    setYoutube(project.youtubeUrl ?? '')
    setGoogleDrive(project.googleDriveUrl ?? '')
    setTiktok(project.tiktokUrl ?? '')
    setPerson(project.person ?? '')
    setDueDate(project.dueDate ?? '')
    setNameValue(project.name)
    setSubitemStatuses(new Map(subitems.map((s) => [s.id, s.status])))
  }, [project?.id])

  if (!project) return null

  const saveField = async (field: string, value: any) => {
    await window.api.projects.update(project.id, { [field]: value })
    onUpdated()
  }

  // --- Comments ---
  const submitComment = async () => {
    if (!newComment.trim()) return
    setAddingComment(true)
    await window.api.projects.comments.add(project.id, newComment.trim())
    setNewComment('')
    const updated = await window.api.projects.comments.list(project.id)
    setComments(updated)
    setAddingComment(false)
  }

  const deleteComment = async (id: number) => {
    await window.api.projects.comments.delete(id)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  // --- Sub-items ---
  const addSubitem = async () => {
    if (!newSubitem.trim()) return
    setAddingSubitem(true)
    await window.api.projects.subitems.add(project.id, {
      name: newSubitem.trim(),
      thumbnailUrl: null,
      status: 'idea',
      dueDate: null,
      postDate: null,
      sortOrder: subitems.length
    })
    setNewSubitem('')
    setAddingSubitem(false)
    onUpdated()
  }

  const updateSubitemStatus = async (id: number, newStatus: ProjectSubitemStatus) => {
    setSubitemStatuses((prev) => new Map(prev).set(id, newStatus))
    await window.api.projects.subitems.update(id, { status: newStatus })
    // Update parent progress
    const updated = await window.api.projects.subitems.list(project.id)
    const done = updated.filter((s) => s.status === 'done').length
    const pct = Math.round((done / updated.length) * 100)
    await window.api.projects.update(project.id, { progress: pct })
    onUpdated()
  }

  const deleteSubitem = async (id: number) => {
    await window.api.projects.subitems.delete(id)
    onUpdated()
  }

  // --- Members ---
  const addMember = async () => {
    if (!newMemberName.trim()) return
    setAddingMember(true)
    await window.api.projects.members.add(project.id, {
      name: newMemberName.trim(),
      initials: newMemberName.trim().slice(0, 2).toUpperCase(),
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
    })
    setNewMemberName('')
    setAddingMember(false)
    onUpdated()
  }

  const removeMember = async (id: number) => {
    await window.api.projects.members.remove(id)
    onUpdated()
  }

  // --- Tags ---
  const addTag = async () => {
    if (!newTagLabel.trim()) return
    setAddingTag(true)
    await window.api.projects.tags.add(project.id, {
      label: newTagLabel.trim(),
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
    })
    setNewTagLabel('')
    setAddingTag(false)
    onUpdated()
  }

  const removeTag = async (id: number) => {
    await window.api.projects.tags.remove(id)
    onUpdated()
  }

  const progress = calcProgressFromSubitems(subitems)

  return (
    <>
      {/* Overlay escura atrás */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[520px] bg-bg-card border-l border-border shadow-pop flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-border flex items-start gap-3">
          <span className="text-2xl mt-0.5 shrink-0">{project.emoji ?? '📁'}</span>
          {editingName ? (
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={() => {
                setEditingName(false)
                if (nameValue.trim() && nameValue !== project.name) {
                  saveField('name', nameValue.trim())
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingName(false)
                  if (nameValue.trim()) saveField('name', nameValue.trim())
                }
              }}
              className="flex-1 text-xl font-semibold bg-bg-subtle border border-border rounded px-2 py-1 text-text focus:outline-none focus:border-accent"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setEditingName(true)}
              className="flex-1 text-xl font-semibold text-text cursor-text hover:bg-bg-hover rounded px-2 py-1 -mx-2 -my-1 transition-colors"
            >
              {project.name}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-bg-hover text-text-muted mt-0.5"
            title={t('projects.close_panel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* (status badge movido pra dentro das properties, abaixo) */}

          {/* Properties */}
          <div className="px-5 py-3 border-b border-border space-y-2.5">
            {/* Status row — pill colorido estilo Notion */}
            <PropRow label={t('projects.column.todo').replace('To Do', 'Status')}>
              <div className="relative group">
                <select
                  value={status}
                  onChange={(e) => {
                    const v = e.target.value as ProjectStatus
                    setStatus(v)
                    saveField('status', v)
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {(['todo', 'in_progress', 'in_review', 'completed'] as ProjectStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {t(`projects.column.${s === 'in_progress' ? 'in_progress' : s === 'in_review' ? 'in_review' : s}`)}
                    </option>
                  ))}
                </select>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    background: `${STATUS_COLOR[status]}26`,
                    color: STATUS_COLOR[status]
                  }}
                >
                  {t(`projects.column.${status === 'in_progress' ? 'in_progress' : status === 'in_review' ? 'in_review' : status === 'completed' ? 'completed' : 'todo'}`)}
                </span>
              </div>
            </PropRow>

            {/* Notes */}
            <PropRow label={t('projects.notes')}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => saveField('notes', notes)}
                rows={2}
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent resize-none"
                placeholder="Notes..."
              />
            </PropRow>

            {/* YouTube */}
            <PropRow label={t('projects.youtube')}>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                onBlur={() => saveField('youtubeUrl', youtube)}
                placeholder="https://youtube.com/..."
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
              />
            </PropRow>

            {/* Google Drive */}
            <PropRow label={t('projects.google_drive')}>
              <input
                type="url"
                value={googleDrive}
                onChange={(e) => setGoogleDrive(e.target.value)}
                onBlur={() => saveField('googleDriveUrl', googleDrive)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-[#4285f4] focus:outline-none focus:border-accent"
              />
            </PropRow>

            {/* TikTok */}
            <PropRow label={t('projects.tiktok')}>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                onBlur={() => saveField('tiktokUrl', tiktok)}
                placeholder="@username"
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
              />
            </PropRow>

            {/* Priority */}
            <PropRow label="Priority">
              <select
                value={priority}
                onChange={(e) => {
                  const v = Number(e.target.value) as ProjectPriority
                  setPriority(v)
                  saveField('priority', v)
                }}
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
              >
                <option value={1}>{t('projects.priority.high')}</option>
                <option value={2}>{t('projects.priority.medium')}</option>
                <option value={3}>{t('projects.priority.low')}</option>
              </select>
            </PropRow>

            {/* Person */}
            <PropRow label={t('projects.person')}>
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                onBlur={() => saveField('person', person)}
                placeholder="Responsible"
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
              />
            </PropRow>

            {/* Due date */}
            <PropRow label={t('projects.due')}>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  saveField('dueDate', e.target.value)
                }}
                className="w-full bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
              />
            </PropRow>

            {/* Team */}
            <PropRow label={t('projects.team')}>
              <div className="space-y-1.5">
                {members.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <AvatarStack members={members} max={10} size={22} />
                    {members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => removeMember(m.id)}
                        className="text-[10px] text-text-subtle hover:text-danger ml-1"
                      >
                        ×
                      </button>
                    ))}
                  </div>
                )}
                {addingMember ? (
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addMember()
                        if (e.key === 'Escape') { setAddingMember(false); setNewMemberName('') }
                      }}
                      placeholder="Name"
                      className="flex-1 bg-bg-subtle border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                    />
                    <button onClick={addMember} className="btn btn-primary text-[10px] py-1 px-2">Add</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingMember(true)}
                    className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-accent"
                  >
                    <Plus className="w-3 h-3" />
                    {t('projects.members.add')}
                  </button>
                )}
              </div>
            </PropRow>

            {/* Tags */}
            <PropRow label="Tags">
              <div className="space-y-1.5">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: `${tag.color}1f`, color: tag.color }}
                      >
                        {tag.label}
                        <button
                          onClick={() => removeTag(tag.id)}
                          className="hover:opacity-70 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {addingTag ? (
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={newTagLabel}
                      onChange={(e) => setNewTagLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTag()
                        if (e.key === 'Escape') { setAddingTag(false); setNewTagLabel('') }
                      }}
                      placeholder="Label"
                      className="flex-1 bg-bg-subtle border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                    />
                    <button onClick={addTag} className="btn btn-primary text-[10px] py-1 px-2">Add</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTag(true)}
                    className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-accent"
                  >
                    <Plus className="w-3 h-3" />
                    {t('projects.tags.add')}
                  </button>
                )}
              </div>
            </PropRow>

            {/* Extra props toggle */}
            <button
              onClick={() => setShowExtraProps((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-text transition-colors pt-1"
            >
              {showExtraProps ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {t('projects.more_properties')}
            </button>

            {showExtraProps && (
              <div className="pl-2 space-y-1.5 border-l border-border">
                <div className="text-[10px] text-text-subtle">Client: {project.client ?? '—'}</div>
                <div className="text-[10px] text-text-subtle">Progress: {progress}%</div>
                <div className="text-[10px] text-text-subtle">Created: {fmtDate(String(project.createdAt))}</div>
              </div>
            )}
          </div>

          {/* Comments (Notion: vem ANTES das sub-items) */}
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              {t('projects.comments')}
            </h3>

            {comments.length === 0 ? (
              <p className="text-xs text-text-subtle mb-3">{t('common.empty')}</p>
            ) : (
              <div className="space-y-3 mb-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2 group">
                    <div
                      className="w-6 h-6 rounded-full bg-accent/30 text-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                    >
                      {c.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-text">{c.author}</span>
                        <span className="text-[10px] text-text-subtle">
                          {fmtDate(String(c.createdAt), 'MMM d, yyyy')}
                        </span>
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-subtle hover:text-danger p-0.5 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-text leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitComment() }}
                placeholder={t('projects.comment_placeholder')}
                className="flex-1 bg-bg-subtle border border-border rounded-lg px-3 py-2 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-accent"
              />
              <button
                onClick={submitComment}
                disabled={addingComment || !newComment.trim()}
                className="btn btn-primary text-xs"
              >
                {t('projects.add_comment')}
              </button>
            </div>
          </div>

          {/* Sub-items */}
          {subitems.length > 0 && (
            <div className="px-5 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text">{t('projects.subitems')}</h3>
                <span className="text-xs text-text-subtle tabular-nums">CONTAGEM {subitems.length}</span>
              </div>

              {/* Sub-items table */}
              <div className="space-y-1">
                {subitems.map((si) => {
                  const siStatus = subitemStatuses.get(si.id) ?? si.status
                  const siDef = SUBITEM_STATUS_DEFS.find((d) => d.id === siStatus)
                  return (
                    <div
                      key={si.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-bg-hover group"
                    >
                      {si.thumbnailUrl ? (
                        <img
                          src={si.thumbnailUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-bg-subtle shrink-0 flex items-center justify-center text-[10px] text-text-subtle">
                          {si.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-text truncate">{si.name}</div>
                        {si.dueDate && (
                          <div className="text-[10px] text-text-subtle">{fmtDate(si.dueDate, 'MMM d')}</div>
                        )}
                      </div>
                      <select
                        value={siStatus}
                        onChange={(e) => updateSubitemStatus(si.id, e.target.value as ProjectSubitemStatus)}
                        className="text-[10px] rounded px-1 py-0.5 border border-transparent focus:outline-none"
                        style={{
                          background: `${siDef?.color ?? '#666'}1f`,
                          color: siDef?.color ?? '#666'
                        }}
                      >
                        {SUBITEM_STATUS_DEFS.map((d) => (
                          <option key={d.id} value={d.id}>{t(d.i18nKey)}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteSubitem(si.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-subtle hover:text-danger p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Add sub-item */}
              {addingSubitem ? (
                <div className="flex gap-1 mt-2">
                  <input
                    autoFocus
                    value={newSubitem}
                    onChange={(e) => setNewSubitem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addSubitem()
                      if (e.key === 'Escape') { setAddingSubitem(false); setNewSubitem('') }
                    }}
                    placeholder={t('projects.subitem.placeholder')}
                    className="flex-1 bg-bg-subtle border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                  />
                  <button onClick={addSubitem} className="btn btn-primary text-[10px] py-1 px-2">
                    {t('common.add')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubitem(true)}
                  className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-accent mt-2"
                >
                  <Plus className="w-3 h-3" />
                  {t('projects.subitem.add')}
                </button>
              )}
            </div>
          )}

          {/* Sub-items empty state - offer to add */}
          {subitems.length === 0 && (
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text mb-2">{t('projects.subitems')}</h3>
              {addingSubitem ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={newSubitem}
                    onChange={(e) => setNewSubitem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addSubitem()
                      if (e.key === 'Escape') { setAddingSubitem(false); setNewSubitem('') }
                    }}
                    placeholder={t('projects.subitem.placeholder')}
                    className="flex-1 bg-bg-subtle border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                  />
                  <button onClick={addSubitem} className="btn btn-primary text-[10px] py-1 px-2">
                    {t('common.add')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubitem(true)}
                  className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-accent"
                >
                  <Plus className="w-3 h-3" />
                  {t('projects.subitem.add')}
                </button>
              )}
            </div>
          )}

          {/* Sub-tabs estilo Notion (placeholder por enquanto — Calendário/Atividade/etc) */}
          <div className="px-5 pt-3 pb-2 flex items-center gap-1 border-b border-border">
            <button className="text-[11px] px-2 py-1 rounded text-text font-medium bg-bg-hover">
              {project.name}
            </button>
            <button className="text-[11px] px-2 py-1 rounded text-text-subtle hover:text-text hover:bg-bg-hover transition-colors">
              Calendar
            </button>
            <button className="text-[11px] px-2 py-1 rounded text-text-subtle hover:text-text hover:bg-bg-hover transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] text-text-subtle w-24 shrink-0 pt-1">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
