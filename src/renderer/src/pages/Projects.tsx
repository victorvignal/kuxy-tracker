import { useEffect, useState, useCallback } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useProfileStore } from '../store/useProfile'
import { useT } from '../lib/i18n'
import { cn } from '../lib/utils'
import type { Project, ProjectMember, ProjectTag, ProjectSubitem, ProjectStatus } from '../types'
import { ProjectColumn } from '../components/projects/ProjectColumn'
import { NewProjectDialog } from '../components/projects/NewProjectDialog'
import { ProjectSidePanel } from '../components/projects/ProjectSidePanel'
import { ProjectListView } from '../components/projects/ProjectListView'
import { COLUMN_DEFS } from '../components/projects/projectConstants'

type ViewTab = 'board' | 'list' | 'timeline' | 'due_tasks'
const VIEW_TABS: Array<{ id: ViewTab; i18nKey: string }> = [
  { id: 'board', i18nKey: 'projects.board' },
  { id: 'list', i18nKey: 'projects.list' },
  { id: 'timeline', i18nKey: 'projects.timeline' },
  { id: 'due_tasks', i18nKey: 'projects.due_tasks' }
]

/**
 * Página /projects — board Kanban estilo Notion/ClickUp.
 *
 * Apenas disponível no perfil Profissional. Se o perfil ativo não for
 * professional, mostra mensagem de orientação.
 *
 * O board tem 4 colunas: To Do / In Progress / In Review / Completed.
 * Cada card abre um side panel ao clicar (ProjectSidePanel).
 *
 * Drag-and-drop nativo entre colunas — ao soltar, persiste o novo
 * status via IPC.
 */
export function Projects() {
  const t = useT()
  const activeId = useProfileStore((s) => s.activeId)
  const profiles = useProfileStore((s) => s.profiles)
  const activeProfile = profiles.find((p) => p.id === activeId)

  const [projects, setProjects] = useState<Project[]>([])
  const [membersByProject, setMembersByProject] = useState<Map<number, ProjectMember[]>>(new Map())
  const [tagsByProject, setTagsByProject] = useState<Map<number, ProjectTag[]>>(new Map())
  const [subitemsByProject, setSubitemsByProject] = useState<Map<number, ProjectSubitem[]>>(new Map())

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [viewTab, setViewTab] = useState<ViewTab>('board')
  const [showNew, setShowNew] = useState(false)
  const [newInitialStatus, setNewInitialStatus] = useState<ProjectStatus>('todo')

  // Drag state
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!activeProfile) return
    const all: Project[] = await window.api.projects.list({ profileId: activeProfile.id })

    // Parallel load de members, tags, subitems pra cada projeto
    const projectIds = all.map((p) => p.id)
    const [members, tags, subitems] = await Promise.all([
      projectIds.length
        ? (await Promise.all(projectIds.map((id) => window.api.projects.members.list(id)))).flat()
        : [],
      projectIds.length
        ? (await Promise.all(projectIds.map((id) => window.api.projects.tags.list(id)))).flat()
        : [],
      projectIds.length
        ? (await Promise.all(projectIds.map((id) => window.api.projects.subitems.list(id)))).flat()
        : []
    ])

    setProjects(all)

    // Index by projectId
    const mbP = new Map<number, ProjectMember[]>()
    for (const m of members) {
      mbP.set(m.projectId, [...(mbP.get(m.projectId) ?? []), m])
    }
    setMembersByProject(mbP)

    const tbP = new Map<number, ProjectTag[]>()
    for (const tg of tags) {
      tbP.set(tg.projectId, [...(tbP.get(tg.projectId) ?? []), tg])
    }
    setTagsByProject(tbP)

    const sbP = new Map<number, ProjectSubitem[]>()
    for (const si of subitems) {
      sbP.set(si.projectId, [...(sbP.get(si.projectId) ?? []), si])
    }
    setSubitemsByProject(sbP)
  }, [activeProfile?.id])

  useEffect(() => {
    load()
  }, [load])

  // --- Drag handlers ---
  const handleDragStart = useCallback((e: React.DragEvent, project: Project) => {
    setDraggingId(project.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(project.id))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, _status: ProjectStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: ProjectStatus) => {
      e.preventDefault()
      if (!draggingId) return

      const project = projects.find((p) => p.id === draggingId)
      if (!project) return

      // Se não mudou de coluna, não faz nada
      if (project.status === targetStatus) {
        setDraggingId(null)
        return
      }

      // Atualiza localmente (optimistic)
      setProjects((prev) =>
        prev.map((p) =>
          p.id === draggingId ? { ...p, status: targetStatus } : p
        )
      )
      setDraggingId(null)

      // Persiste no backend
      await window.api.projects.update(draggingId, { status: targetStatus })
    },
    [draggingId, projects]
  )

  const handleAddProject = (status: ProjectStatus) => {
    setNewInitialStatus(status)
    setShowNew(true)
  }

  const handleProjectCreated = async (projectId: number) => {
    setShowNew(false)
    await load()
    setSelectedId(projectId)
  }

  const handleOpenProject = (id: number) => {
    setSelectedId(id)
  }

  const handleClosePanel = () => {
    setSelectedId(null)
  }

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null

  const isProfessional = activeProfile?.type === 'professional'

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex items-end justify-between gap-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('projects.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('projects.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View tabs */}
          <div className="flex bg-bg-subtle border border-border rounded-lg p-0.5">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  viewTab === tab.id
                    ? 'bg-bg-hover text-text'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {tab.id === 'board' ? t(tab.i18nKey) :
                 tab.id === 'list' ? t(tab.i18nKey) :
                 tab.id === 'timeline' ? t(tab.i18nKey) :
                 t(tab.i18nKey)}
              </button>
            ))}
          </div>

          <button className="btn btn-ghost">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => handleAddProject('todo')}
            className="btn btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('projects.new')}</span>
          </button>
        </div>
      </div>

      {/* Board */}
      {viewTab === 'board' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          {!isProfessional ? (
            <div className="flex items-center justify-center h-full text-text-muted text-sm">
              Projects are only available on the Professional profile.
            </div>
          ) : (
            <div className="flex gap-4 p-6 h-full">
              {COLUMN_DEFS.map((col) => {
                const colProjects = projects.filter((p) => p.status === col.id)
                return (
                  <ProjectColumn
                    key={col.id}
                    status={col.id}
                    i18nKey={col.i18nKey}
                    color={col.color}
                    projects={colProjects}
                    membersByProject={membersByProject}
                    tagsByProject={tagsByProject}
                    subitemsByProject={subitemsByProject}
                    onOpenProject={handleOpenProject}
                    onAddProject={handleAddProject}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {viewTab === 'list' && activeProfile && (
        <ProjectListView
          projects={projects}
          membersByProject={membersByProject}
          tagsByProject={tagsByProject}
          subitemsByProject={subitemsByProject}
          selectedId={selectedId}
          profileId={activeProfile.id}
          onOpenProject={handleOpenProject}
          onAddProject={() => handleAddProject('todo')}
          onDeleteProject={async (id) => {
            if (!confirm(t('projects.confirm_delete'))) return
            await window.api.projects.archive(id, true)
            if (selectedId === id) handleClosePanel()
            await load()
          }}
        />
      )}

      {viewTab !== 'board' && viewTab !== 'list' && (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm p-6">
          {viewTab === 'timeline' && 'Timeline view — coming soon'}
          {viewTab === 'due_tasks' && 'Due tasks — coming soon'}
        </div>
      )}

      {/* New project dialog */}
      {showNew && activeProfile && (
        <NewProjectDialog
          onClose={() => setShowNew(false)}
          onCreated={handleProjectCreated}
          profileId={activeProfile.id}
          initialStatus={newInitialStatus}
        />
      )}

      {/* Side panel */}
      {selectedId && activeProfile && (
        <ProjectSidePanel
          project={selectedProject}
          members={membersByProject.get(selectedId) ?? []}
          tags={tagsByProject.get(selectedId) ?? []}
          subitems={subitemsByProject.get(selectedId) ?? []}
          profileId={activeProfile.id}
          onClose={handleClosePanel}
          onUpdated={load}
        />
      )}
    </div>
  )
}
