import { Plus, MoreHorizontal } from 'lucide-react'
import type { Project, ProjectMember, ProjectTag, ProjectSubitem, ProjectStatus } from '../../types'
import { cn } from '../../lib/utils'
import { useT } from '../../lib/i18n'
import { ProjectCard } from './ProjectCard'

/**
 * Coluna do board Kanban.
 *
 * - Header: accent bar lateral (cor da coluna) + nome + count + actions
 * - Body: stack de ProjectCard
 * - "+ Add" no fim (abre dialog pra criar projeto nessa coluna)
 *
 * Suporta drop de drag-and-drop pra mover cards entre colunas.
 */
export function ProjectColumn({
  status,
  i18nKey,
  color,
  projects,
  membersByProject,
  tagsByProject,
  subitemsByProject,
  onOpenProject,
  onAddProject,
  onDragStart,
  onDrop,
  onDragOver
}: {
  status: ProjectStatus
  i18nKey: string
  color: string
  projects: Project[]
  membersByProject: Map<number, ProjectMember[]>
  tagsByProject: Map<number, ProjectTag[]>
  subitemsByProject: Map<number, ProjectSubitem[]>
  onOpenProject: (id: number) => void
  onAddProject: (status: ProjectStatus) => void
  onDragStart: (e: React.DragEvent, project: Project) => void
  onDrop: (e: React.DragEvent, status: ProjectStatus) => void
  onDragOver: (e: React.DragEvent) => void
}) {
  const t = useT()

  return (
    <div
      className="w-[300px] shrink-0 flex flex-col bg-bg-subtle/40 rounded-xl border border-border"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <div
          className="w-1 h-4 rounded-full shrink-0"
          style={{ background: color }}
        />
        <h2 className="text-[13px] font-semibold text-text flex-1 min-w-0">
          {t(i18nKey)}
        </h2>
        <span className="text-[11px] text-text-subtle tabular-nums">
          {projects.length}
        </span>
        <button
          className="p-1 rounded hover:bg-bg-hover text-text-subtle hover:text-text transition-colors"
          title="More"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAddProject(status)}
          className="p-1 rounded hover:bg-bg-hover text-text-subtle hover:text-text transition-colors"
          title={t('projects.add_card')}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {projects.length === 0 ? (
          <div className="py-6 text-center text-text-subtle text-xs">
            {t('projects.empty_column')}
          </div>
        ) : (
          projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              members={membersByProject.get(p.id) ?? []}
              tags={tagsByProject.get(p.id) ?? []}
              subitems={subitemsByProject.get(p.id) ?? []}
              onOpen={onOpenProject}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>

      {/* Footer add */}
      <button
        onClick={() => onAddProject(status)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-[12px] text-text-subtle',
          'hover:text-text hover:bg-bg-hover/50 transition-colors border-t border-border'
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t('projects.add_card')}</span>
      </button>
    </div>
  )
}