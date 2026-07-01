type Props = {
  /** 0-100. */
  value: number
  /** Cor do preenchimento. Default accent roxo. */
  color?: string
  /** Altura do trilho. Default 6 (design target). */
  height?: number
  /** Cor do trilho. Default #1d1d20. */
  trackColor?: string
  className?: string
}

/**
 * Barra de progresso do design novo.
 *
 * Trilho: bg #1d1d20, raio 3 (ou 4 se height >= 8).
 * Preenchimento: roxo #8b5cf6 (ou cor custom).
 */
export function ProgressBar({ value, color = '#8b5cf6', height = 6, trackColor = '#1d1d20', className }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={className}
      style={{
        height,
        borderRadius: height >= 8 ? 4 : 3,
        background: trackColor,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: 'inherit',
          background: color,
          transition: 'width 0.3s ease'
        }}
      />
    </div>
  )
}