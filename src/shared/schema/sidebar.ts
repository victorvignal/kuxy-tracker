/**
 * Itens disponíveis na sidebar. O path é a chave, e cada perfil diz
 * quais itens aparecem nele (via profiles.sidebarItems).
 *
 * NÃO confundir com rotas do React Router — é o mesmo path por
 * coincidência, mas se a sidebar mostrar algo que não é rota
 * (ex: link externo), vira só string livre.
 */
export const SIDEBAR_ITEMS = [
  '/',
  '/habits',
  '/routines',
  '/calendar',
  '/stats',
  '/journal',
  '/focus',
  '/goals',
  '/finance',
  '/projects'
] as const

export type SidebarItem = (typeof SIDEBAR_ITEMS)[number]

/** Defaults sensatos por tipo de perfil. Editáveis depois pelo usuário. */
export const DEFAULT_SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  personal: ['/', '/projects'],
  professional: ['/', '/projects']
}
