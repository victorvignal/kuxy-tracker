import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'inset' | 'hero'

type Props = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  variant?: Variant
  /** padding (CSS-like shorthand). Default = p-[18px] (design target). */
  padding?: string
}

/**
 * Card base do design novo (dark roxo).
 *
 * Variant default: bg #141416, borda #1f1f22, raio 14px, padding 18/20.
 * Variant inset:   bg #1b1b1e, borda #26262a, raio 12px (sub-card dentro de card).
 * Variant hero:    gradient roxo #8b5cf6→#6d28d9, sem borda, raio 16px (Earnings Pro "Total recebido").
 */
export function Card({
  children,
  variant = 'default',
  padding,
  className,
  style,
  ...rest
}: Props) {
  const base = {
    default: {
      background: '#141416',
      border: '1px solid #1f1f22',
      borderRadius: 14,
      padding: padding ?? '18px 20px'
    },
    inset: {
      background: '#1b1b1e',
      border: '1px solid #26262a',
      borderRadius: 12,
      padding: padding ?? '14px'
    },
    hero: {
      background: 'linear-gradient(150deg, #8b5cf6, #6d28d9)',
      border: 'none',
      borderRadius: 16,
      padding: padding ?? '17px 19px',
      boxShadow: '0 12px 30px rgba(109, 40, 217, 0.32)'
    }
  }[variant]

  return (
    <div
      {...rest}
      className={cn(className)}
      style={{ ...base, ...style }}
    >
      {children}
    </div>
  )
}