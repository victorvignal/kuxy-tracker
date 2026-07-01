export type DonutSegment = {
  /** Valor absoluto (qualquer unidade, somamos pra achar o total). */
  value: number
  /** Cor hex da fatia. */
  color: string
  /** Label exibido na legenda. */
  label: string
}

type Props = {
  segments: DonutSegment[]
  /** Tamanho em px. Default 110. */
  size?: number
  /** Largura do stroke. Default 14. */
  strokeWidth?: number
  /** Raio do círculo. Default 46 (viewBox 120). */
  radius?: number
  /** Cor do trilho (anel de fundo). Default #1d1d20. */
  trackColor?: string
}

/**
 * Donut/anel SVG monocromático roxo (4 tons), conforme design.
 *
 * Calcula `stroke-dasharray` com a circunferência real `2πr` pra não virar
 * tracejado (gotcha mencionado no spec). Rotação -90deg pra fatia começar no topo.
 *
 * Renderização é determinística: mesma ordem dos segments sempre dá o mesmo anel.
 */
export function Donut({
  segments,
  size = 110,
  strokeWidth = 14,
  radius = 46,
  trackColor = '#1d1d20'
}: Props) {
  const circ = +(2 * Math.PI * radius).toFixed(2)
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1
  let acc = 0

  return (
    <svg
      viewBox="0 0 120 120"
      style={{ width: size, height: size, transform: 'rotate(-90deg)' }}
    >
      {/* trilho */}
      <circle cx="60" cy="60" r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {/* segmentos */}
      {segments.map((s, i) => {
        const frac = s.value / total
        const dash = frac * circ
        const offset = -acc * circ
        acc += frac
        return (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
            strokeDashoffset={offset.toFixed(2)}
          />
        )
      })}
    </svg>
  )
}