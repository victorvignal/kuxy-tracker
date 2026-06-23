import type { ProjectMember } from '../../types'
import { cn } from '../../lib/utils'

/**
 * Stack horizontal de avatares com overlap (estilo Notion).
 * Mostra até `max` avatares; o resto vira "+N".
 *
 * Cada avatar é um círculo com iniciais (2 letras max) e cor de fundo
 * vinda do membro. Click fica por conta do parent.
 */
export function AvatarStack({
  members,
  max = 4,
  size = 20,
  onClick
}: {
  members: ProjectMember[]
  max?: number
  size?: number
  onClick?: (e: React.MouseEvent) => void
}) {
  const visible = members.slice(0, max)
  const overflow = Math.max(0, members.length - max)
  const fontSize = Math.round(size * 0.45)

  return (
    <div
      className="flex items-center"
      style={{ marginLeft: size > 0 ? 0 : 0 }}
      onClick={onClick}
    >
      {visible.map((m, i) => (
        <div
          key={m.id}
          className={cn(
            'rounded-full border-2 border-bg-card flex items-center justify-center text-white font-semibold shrink-0',
            i > 0 && '-ml-1.5'
          )}
          title={m.name}
          style={{
            width: size,
            height: size,
            background: m.color,
            fontSize
          }}
        >
          {m.initials ?? m.name.slice(0, 2).toUpperCase()}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="rounded-full border-2 border-bg-card bg-bg-subtle text-text-muted flex items-center justify-center font-medium shrink-0 -ml-1.5"
          style={{ width: size, height: size, fontSize }}
          title={`+${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}