import { cn } from '../../lib/utils'

type Size = 'xs' | 'sm' | 'md' | 'lg'

type Props = {
  name?: string
  /** Gradiente CSS pronto. Se passado, sobrescreve o auto-gerado pelo nome. */
  gradient?: string
  /** Inicial explícita (caso queira forçar diferente do primeiro char do name). */
  initial?: string
  size?: Size
  shape?: 'circle' | 'square'
  className?: string
}

const sizeCfg: Record<Size, { box: number; fontSize: number; radius: number }> = {
  xs: { box: 20, fontSize: 9, radius: 999 },
  sm: { box: 26, fontSize: 10, radius: 999 },
  md: { box: 30, fontSize: 11, radius: 9 },
  lg: { box: 38, fontSize: 13, radius: 11 }
}

// Paleta de gradientes alinhada com o design (subtons roxo/azul/âmbar).
const GRADIENTS = [
  'linear-gradient(135deg, #7a6b9c, #43395c)',
  'linear-gradient(135deg, #5b6b8c, #2c3447)',
  'linear-gradient(135deg, #8b5cf6, #4f4193)',
  'linear-gradient(135deg, #a78bfa, #6d4ee0)',
  'linear-gradient(135deg, #6d4ee0, #4f4193)',
  'linear-gradient(135deg, #5b6b8c, #1c2433)'
]

function hashIndex(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % GRADIENTS.length
}

/**
 * Avatar circular/quadrado com gradiente + inicial branca.
 *
 * Se não receber `gradient`, gera um determinístico a partir de `name` (mesmo
 * nome sempre gera o mesmo gradiente, evitando "shuffle" entre renders).
 */
export function Avatar({ name, gradient, initial, size = 'md', shape = 'circle', className }: Props) {
  const cfg = sizeCfg[size]
  const bg = gradient ?? GRADIENTS[hashIndex(name ?? initial ?? 'default')]
  const text = initial ?? (name ? name.trim().charAt(0).toUpperCase() : '?')
  const radius = shape === 'circle' ? cfg.radius : cfg.radius

  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0 text-white', className)}
      style={{
        width: cfg.box,
        height: cfg.box,
        borderRadius: radius,
        background: bg,
        fontSize: cfg.fontSize,
        fontWeight: 700,
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12)'
      }}
    >
      {text}
    </span>
  )
}