import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'accent' | 'muted' | 'progress'

type Props = {
  children: ReactNode
  tone?: Tone
  /** Mostra bolinha à esquerda. Default true. */
  dot?: boolean
  /** Variant "light" (bg rgba + texto cheio) vs "outline" (só texto). */
  variant?: 'light' | 'outline'
  className?: string
}

/**
 * Pill de status do design novo (Notion-style).
 *
 * Usado em tabelas, cards, side panel (status de projeto, "On Track", "Late", etc).
 *
 * Tones mapeiam pra cores hex do design:
 *   success = #4ade80, danger = #f87171, warning = #fbbf24 (#f59e0b pro panel),
 *   info = #60a5fa, accent = #8b5cf6, muted = #86868d, progress = #4f4193
 */
export function Pill({ children, tone = 'muted', dot = true, variant = 'light', className }: Props) {
  const palette = {
    success: { fg: '#4ade80', bg: 'rgba(74, 222, 128, 0.16)', dot: '#4ade80' },
    danger: { fg: '#f87171', bg: 'rgba(248, 113, 113, 0.14)', dot: '#f87171' },
    warning: { fg: '#fbbf24', bg: 'rgba(245, 158, 11, 0.16)', dot: '#fbbf24' },
    info: { fg: '#60a5fa', bg: 'rgba(96, 165, 250, 0.16)', dot: '#60a5fa' },
    accent: { fg: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.16)', dot: '#8b5cf6' },
    muted: { fg: '#86868d', bg: 'rgba(134, 134, 141, 0.16)', dot: '#86868d' },
    progress: { fg: '#a78bfa', bg: 'rgba(167, 139, 250, 0.14)', dot: '#a78bfa' }
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        className
      )}
      style={{
        padding: variant === 'outline' ? '3px 10px' : '4px 10px',
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 600,
        background: variant === 'outline' ? 'transparent' : palette.bg,
        color: palette.fg,
        border: variant === 'outline' ? `1px solid ${palette.fg}40` : 'none'
      }}
    >
      {dot && (
        <span
          className="inline-block rounded-full shrink-0"
          style={{ width: 6, height: 6, background: palette.dot }}
        />
      )}
      {children}
    </span>
  )
}