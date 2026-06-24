import { useState } from 'react'
import { Plus, ChevronDown, Flag, MoreHorizontal, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import type {
  Project,
  ProjectMember,
  ProjectTag,
  ProjectSubitem
} from '../../types'
import { STATUS_COLOR, PRIORITY_COLORS } from './projectConstants'
import { AvatarStack } from './AvatarStack'

type FilterTab = 'all' | 'mine' | 'archived'
const FILTER_TABS: Array<{ id: FilterTab; label: string }> = [
  { id: 'all', label: 'All Projects' },
  { id: 'mine', label: 'Mine' },
  { id: 'archived', label: 'Archived' }
]

/**
 * List view estilo Partner Boards do Notion.
 *
 * Layout:
 *   - Header com tabs (All / Mine / Archived) + botão Add
 *   - Tabela com linhas: emoji+name | client | status pill | priority |
 *     team avatars | due date | ações
 *   - Click na linha → onOpenProject(id) (abre side panel)
 *   - Linha selecionada fica com accent line à esquerda
 *   - "+ Add row" no fim (estilo Notion inline)
 */
export function ProjectListView({
  projects,
  membersByProject,
  tagsByProject,
  subitemsByProject,
  selectedId,
  onOpenProject,
  onAddProject,
  onDeleteProject
}: {
  projects: Project[]
  membersByProject: Map<number, ProjectMember[]>
  tagsByProject: Map<number, ProjectTag[]>
  subitemsByProject: Map<number, ProjectSubitem[]>
  selectedId: number | null
  profileId: number
  onOpenProject: (id: number) => void
  onAddProject: () => void
  onDeleteProject: (id: number) => void
}) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [hoverId, setHoverId] = useState<number | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  // Filter
  const filtered = filter === 'archived' ? [] : projects

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6 max-w-[1100px] mx-auto">
        {/* Header: title + tabs + add */}
        <div className="flex items-center justify-between mb-[14px]">
          <div className="flex items-end gap-5">
            <h1 className="text-[22px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              Partner Boards
            </h1>
            <span className="text-[12px] pb-1.5" style={{ color: '#7a7a80' }}>
              {filtered.length} {filtered.length === 1 ? 'projeto' : 'projetos'}
            </span>
          </div>

          <div className="flex items-center gap-[10px]">
            <div
              className="flex items-center h-[34px] rounded-[9px] overflow-hidden"
              style={{ background: '#121214', border: '1px solid #232327' }}
            >
              <button className="px-[12px] h-full text-[12.5px] font-medium flex items-center gap-1.5" style={{ color: '#cfcfd4' }}>
                <Plus size={14} strokeWidth={2} />
                New row
              </button>
              <span className="h-full w-px" style={{ background: '#232327' }} />
              <button className="px-[9px] h-full flex items-center" style={{ color: '#9a9aa0' }}>
                <ChevronDown size={14} strokeWidth={1.75} />
              </button>
            </div>
            <button
              onClick={onAddProject}
              className="flex items-center gap-[6px] h-[34px] px-[14px] rounded-[9px] text-[12.5px] font-medium transition-opacity hover:opacity-90"
              style={{ background: '#a78bfa', color: '#0a0a0b' }}
            >
              <Plus size={14} strokeWidth={2} />
              New project
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-3 border-b" style={{ borderColor: '#1d1d20' }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-3 py-2 text-[12.5px] font-medium transition-colors relative',
                filter === tab.id ? 'text-text' : 'text-text-muted hover:text-text'
              )}
            >
              {tab.label}
              {filter === tab.id && (
                <span
                  className="absolute left-0 right-0 bottom-[-1px] h-[2px] rounded-t"
                  style={{ background: '#a78bfa' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-[12px] overflow-hidden"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          {/* Header row */}
          <div
            className="flex items-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#7a7a80', borderBottom: '1px solid #1d1d20', background: '#161618' }}
          >
            <div className="flex-1 min-w-0 pl-2">Name</div>
            <div className="w-[140px] shrink-0">Client</div>
            <div className="w-[130px] shrink-0">Status</div>
            <div className="w-[60px] shrink-0 text-center">Priority</div>
            <div className="w-[110px] shrink-0">Team</div>
            <div className="w-[100px] shrink-0">Due date</div>
            <div className="w-[40px] shrink-0" />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-text-muted text-sm">
              Nenhum projeto. Clique em <span className="font-semibold">New project</span> pra começar.
            </div>
          ) : (
            filtered.map((p) => {
              const members = membersByProject.get(p.id) ?? []
              const tags = tagsByProject.get(p.id) ?? []
              const subitems = subitemsByProject.get(p.id) ?? []
              void tags
              const isSelected = selectedId === p.id
              const isHover = hoverId === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => {
                    setHoverId(null)
                    setActiveMenu(null)
                  }}
                  className="relative flex items-center px-3 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: isSelected
                      ? 'rgba(167, 139, 250, 0.08)'
                      : isHover
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'transparent',
                    borderBottom: '1px solid #161618'
                  }}
                >
                  {/* Accent line à esquerda quando selecionado */}
                  {isSelected && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ background: '#a78bfa' }}
                    />
                  )}

                  {/* Name (emoji + name + tags) */}
                  <div className="flex-1 min-w-0 pl-2 flex items-center gap-2">
                    <span className="text-base shrink-0">{p.emoji ?? '📁'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: '#e8e8ea' }}>
                        {p.name}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {tags.slice(0, 3).map((tg) => (
                            <span
                              key={tg.id}
                              className="text-[9.5px] px-1.5 py-px rounded font-semibold"
                              style={{
                                background: `${tg.color}1f`,
                                color: tg.color
                              }}
                            >
                              {tg.label}
                            </span>
                          ))}
                          {subitems.length > 0 && (
                            <span className="text-[9.5px]" style={{ color: '#7a7a80' }}>
                              · {subitems.length} items
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client */}
                  <div className="w-[140px] shrink-0 text-[12px] truncate" style={{ color: '#9a9aa0' }}>
                    {p.client ?? '—'}
                  </div>

                  {/* Status pill */}
                  <div className="w-[130px] shrink-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold"
                      style={{
                        background: `${STATUS_COLOR[p.status]}26`,
                        color: STATUS_COLOR[p.status]
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_COLOR[p.status] }}
                      />
                      {p.status === 'in_progress'
                        ? 'In Progress'
                        : p.status === 'in_review'
                          ? 'In Review'
                          : p.status === 'completed'
                            ? 'Completed'
                            : 'To Do'}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="w-[60px] shrink-0 flex justify-center">
                    <Flag
                      size={13}
                      fill={PRIORITY_COLORS[p.priority]}
                      color={PRIORITY_COLORS[p.priority]}
                      strokeWidth={1.75}
                    />
                  </div>

                  {/* Team avatars */}
                  <div className="w-[110px] shrink-0">
                    <AvatarStack members={members} max={3} size={20} />
                  </div>

                  {/* Due date */}
                  <div className="w-[100px] shrink-0 text-[12px]" style={{ color: '#9a9aa0' }}>
                    {p.dueDate ? formatDateShort(p.dueDate) : '—'}
                  </div>

                  {/* Actions menu (3-dot) */}
                  <div className="w-[40px] shrink-0 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenu(activeMenu === p.id ? null : p.id)
                      }}
                      className={cn(
                        'p-1 rounded transition-opacity',
                        isHover || activeMenu === p.id ? 'opacity-100' : 'opacity-0'
                      )}
                      style={{ color: '#7a7a80' }}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {activeMenu === p.id && (
                      <div
                        className="absolute right-3 top-[calc(100%-4px)] z-10 w-[160px] rounded-md shadow-pop overflow-hidden"
                        style={{ background: '#1a1a1d', border: '1px solid #2a2a2e' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onDeleteProject(p.id)
                            setActiveMenu(null)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:opacity-80"
                          style={{ color: '#f87171' }}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* "+ Add row" footer (estilo Notion) */}
          <button
            onClick={onAddProject}
            className="w-full flex items-center gap-2 px-5 py-2.5 text-[12.5px] hover:opacity-100 opacity-60 transition-opacity"
            style={{ color: '#9a9aa0' }}
          >
            <Plus size={14} strokeWidth={2} />
            New row
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDateShort(d: string): string {
  // YYYY-MM-DD → "Jun 29"
  try {
    const [y, m, day] = d.split('-').map(Number)
    const date = new Date(y, m - 1, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}