import type { ProjectStatus, ProjectPriority, ProjectSubitemStatus } from '../../types'

/**
 * Definições das colunas do Kanban.
 * Cada coluna tem accent color (barrinha lateral + dot) e status mapeado.
 *
 * Cores escolhidas pra contrastar bem no dark theme do KUXY:
 * - todo:        azul (#5b8def) — neutro, frio
 * - in_progress: laranja (#f59e0b) — quente, ação
 * - in_review:   roxo (#a78bfa) — alinhado com accent
 * - completed:   verde (#22c55e) — sucesso
 */
export const COLUMN_DEFS: Array<{
  id: ProjectStatus
  i18nKey: string
  color: string
}> = [
  { id: 'todo', i18nKey: 'projects.column.todo', color: '#5b8def' },
  { id: 'in_progress', i18nKey: 'projects.column.in_progress', color: '#f59e0b' },
  { id: 'in_review', i18nKey: 'projects.column.in_review', color: '#a78bfa' },
  { id: 'completed', i18nKey: 'projects.column.completed', color: '#22c55e' }
]

/** Cor por prioridade (badge pequeno no card). */
export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  1: '#f87171', // high - vermelho
  2: '#facc15', // medium - amarelo
  3: '#22d3ee' // low - azul claro
}

/** Paleta de cores pra tags pill dos cards. */
export const TAG_COLORS: Record<string, string> = {
  web: '#5b8def',
  saas: '#f59e0b',
  mobile: '#a78bfa',
  design: '#f472b6',
  video: '#22c55e',
  default: '#8b5cf6'
}

/** Definições pros status dos sub-items. */
export const SUBITEM_STATUS_DEFS: Array<{
  id: ProjectSubitemStatus
  i18nKey: string
  color: string
}> = [
  { id: 'idea', i18nKey: 'projects.subitem.idea', color: '#f87171' },
  { id: 'working', i18nKey: 'projects.subitem.working', color: '#f59e0b' },
  { id: 'editor', i18nKey: 'projects.subitem.editor', color: '#a78bfa' },
  { id: 'done', i18nKey: 'projects.subitem.done', color: '#22c55e' }
]

/** Cor por status de projeto (alias pra COLUMN_DEFS pra usos fora do board). */
export const STATUS_COLOR: Record<ProjectStatus, string> = {
  todo: '#5b8def',
  in_progress: '#f59e0b',
  in_review: '#a78bfa',
  completed: '#22c55e'
}

/** Calcula progresso agregado a partir dos sub-items. */
export function calcProgressFromSubitems(
  subitems: Array<{ status: ProjectSubitemStatus }>
): number {
  if (subitems.length === 0) return 0
  const done = subitems.filter((s) => s.status === 'done').length
  return Math.round((done / subitems.length) * 100)
}