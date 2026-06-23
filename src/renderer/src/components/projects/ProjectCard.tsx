import { Calendar, MessageSquare, Paperclip, BarChart2, MoreHorizontal } from 'lucide-react'
import type { Project, ProjectMember, ProjectTag, ProjectSubitem } from '../../types'
import { cn, fmtDate } from '../../lib/utils'
import { useT } from '../../lib/i18n'
import { AvatarStack } from './AvatarStack'
import { PRIORITY_COLORS, STATUS_COLOR } from './projectConstants'

/**
 * Card de projeto no board Kanban.
 *
 * Layout (de cima pra baixo):
 *   1. Client label (se houver)
 *   2. Emoji + título
 *   3. Tags pill (Web, Saas, etc)
 *   4. Footer: progress %, anexos, comentários, due date + avatares
 *
 * Click abre o side panel. Hover aumenta um tom o background.
 */
export function ProjectCard({
  project,
  members,
  tags,
  subitems,
  onOpen,
  onDragStart
}: {
  project: Project
  members: ProjectMember[]
  tags: ProjectTag[]
  subitems: ProjectSubitem[]
  onOpen: (id: number) => void
  onDragStart?: (e: React.DragEvent, project: Project) => void
}) {
  const t = useT()
  const doneCount = subitems.filter((s) => s.status === 'done').length
  const totalCount = subitems.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : project.progress

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, project)}
      onClick={() => onOpen(project.id)}
      className={cn(
        'bg-bg-card border border-border rounded-md p-3 cursor-pointer',
        'hover:bg-bg-hover hover:border-border-strong transition-colors group',
        'shadow-card'
      )}
    >
      {/* Client */}
      {project.client && (
        <div className="text-[11px] text-text-subtle mb-1.5">{project.client}</div>
      )}

      {/* Emoji + title */}
      <div className="flex items-start gap-1.5 mb-2.5">
        {project.emoji && <span className="text-sm shrink-0 mt-0.5">{project.emoji}</span>}
        <h3 className="text-[13px] font-semibold text-text leading-snug flex-1 min-w-0">
          {project.name}
        </h3>
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-text-subtle hover:text-text p-0.5 -mt-0.5 -mr-0.5 transition-opacity"
          title="More"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{
                background: `${tag.color}1f`, // 12% opacity
                color: tag.color
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Priority dot (decorative top-right replacement of full priority badge) */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: PRIORITY_COLORS[project.priority] }}
          title={t(`projects.priority.${project.priority === 1 ? 'high' : project.priority === 2 ? 'medium' : 'low'}`)}
        />
        <span className="text-[10px] text-text-subtle">
          {t(`projects.priority.${project.priority === 1 ? 'high' : project.priority === 2 ? 'medium' : 'low'}`)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2.5 text-[11px] text-text-subtle">
        {totalCount > 0 && (
          <div className="flex items-center gap-1" title={`${progressPct}%`}>
            <BarChart2 className="w-3 h-3" />
            <span className="tabular-nums">{progressPct}%</span>
          </div>
        )}
        <div className="flex items-center gap-1" title="Attachments">
          <Paperclip className="w-3 h-3" />
          <span className="tabular-nums">0</span>
        </div>
        <div className="flex items-center gap-1" title={t('projects.comments')}>
          <MessageSquare className="w-3 h-3" />
          <span className="tabular-nums">0</span>
        </div>

        <div className="flex-1" />

        {/* Due date */}
        {project.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{fmtDate(project.dueDate, 'MMM d')}</span>
          </div>
        )}

        {/* Avatars */}
        {members.length > 0 && <AvatarStack members={members} max={3} size={18} />}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1 rounded-full bg-bg-subtle mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: STATUS_COLOR[project.status] }}
          />
        </div>
      )}
    </div>
  )
}