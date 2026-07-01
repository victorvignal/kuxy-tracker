type Props = {
  /** Largura do SVG (responsivo via width 100%). Default viewBox 460x200. */
  width?: number
  height?: number
  /** Pontos da linha. Aceita pares (x,y) em pixels do viewBox. */
  points?: Array<[number, number]>
  /** Se fornecido, exibe dot + linha tracejada vertical no índice. */
  highlightIndex?: number
}

/**
 * Revenue/Area chart roxo do design (Dashboard Pessoal "Balance Flow").
 *
 * SVG com:
 * - 5 linhas horizontais de grid (#1c1c1f)
 * - Path de área com gradient roxo (#8b5cf6 0.28 alpha → 0 alpha)
 * - Linha sólida por cima (#8b5cf6 2px)
 * - Highlight opcional: dot roxo no ponto + linha tracejada vertical (#6b6b72)
 *
 * Pontos default seguem o template do design (15 pontos, formato "salto crescente").
 */
export function RevenueChart({
  width = 460,
  height = 200,
  points = DEFAULT_POINTS,
  highlightIndex
}: Props) {
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1][0]},${height - 28} L${points[0][0]},${height - 28} Z`
  const highlight = highlightIndex != null ? points[highlightIndex] : null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid */}
      <g stroke="#1c1c1f" strokeWidth="1">
        <line x1={width * 0.1} y1={height * 0.12} x2={width * 0.98} y2={height * 0.12} />
        <line x1={width * 0.1} y1={height * 0.31} x2={width * 0.98} y2={height * 0.31} />
        <line x1={width * 0.1} y1={height * 0.5} x2={width * 0.98} y2={height * 0.5} />
        <line x1={width * 0.1} y1={height * 0.69} x2={width * 0.98} y2={height * 0.69} />
        <line x1={width * 0.1} y1={height * 0.86} x2={width * 0.98} y2={height * 0.86} />
      </g>
      {/* area */}
      <path d={areaPath} fill="url(#revenue-fill)" />
      {/* line */}
      <path
        d={linePath}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* highlight */}
      {highlight && (
        <>
          <line
            x1={highlight[0]}
            y1={highlight[1]}
            x2={highlight[0]}
            y2={height - 28}
            stroke="#6b6b72"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle cx={highlight[0]} cy={highlight[1] + 14} r={4.5} fill="#0a0a0b" stroke="#8b5cf6" strokeWidth={2.5} />
        </>
      )}
    </svg>
  )
}

// Pontos default que imitam o template (salto crescente).
const DEFAULT_POINTS: Array<[number, number]> = [
  [45, 150],
  [75, 140],
  [100, 148],
  [125, 120],
  [150, 130],
  [175, 100],
  [200, 112],
  [225, 95],
  [255, 105],
  [280, 78],
  [300, 92],
  [320, 70],
  [345, 82],
  [365, 55],
  [390, 68],
  [415, 40],
  [445, 30]
]