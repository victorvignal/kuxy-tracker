import { useState } from 'react'
import type { ReactNode } from 'react'

export type BarDatum = {
  /** Label do eixo X (ex: 'Jan', 'Fev'). */
  month: string
  /** Altura relativa 0-100. */
  height: number
  /** Cor da barra. Default = #26262a (inativa). */
  color?: string
  /** Cor do gradient da barra (substitui `color` quando presente). */
  gradient?: string
  /** Se true, barra destacada com tooltip e dot no topo. */
  highlight?: boolean
  /** Conteúdo do tooltip (se highlight=true). Aceita string ou JSX. */
  tooltip?: ReactNode
  /** Cor do label do mês (default #7a7a80 inativa, #f4f4f6 ativa). */
  labelColor?: string
}

type Props = {
  data: BarDatum[]
  /** Altura total da área de barras em px. Default 208 (design target). */
  height?: number
  /** Eixo Y: array de ticks de cima pra baixo (ex: ['50k','40k','30k','20k','10k','0k']). */
  yTicks?: string[]
  /** Largura máxima de cada barra em px. Default 44. */
  maxBarWidth?: number
}

/**
 * BarChart roxo do design Earnings Pro.
 *
 * - Barras inativas: bg #26262a, raio `9 9 4 4`.
 * - Barra ativa: gradient `linear-gradient(180deg, #8b5cf6, #c4b5fd)` + dot
 *   14px no topo (#8b5cf6 com borda 3px #141416).
 * - Tooltip flutuante acima da barra ativa (bg #1b1b1e, borda #2a2a2e, raio 11,
 *   shadow `0 14px 28px rgba(0,0,0,.5)`).
 * - Eixo Y à esquerda com labels 11px #6a6a70, padding-bottom 26 (espaço p/ label X).
 */
export function BarChart({ data, height = 208, yTicks, maxBarWidth = 44 }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const activeIdx = hoverIdx ?? data.findIndex((b) => b.highlight)

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* Eixo Y */}
      {yTicks && yTicks.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height,
            fontSize: 11,
            color: '#6a6a70',
            textAlign: 'right',
            paddingBottom: 26
          }}
        >
          {yTicks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      )}

      {/* Barras */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 10,
            height
          }}
        >
          {data.map((b, i) => {
            const isActive = i === activeIdx
            const bg = b.gradient
              ? b.gradient
              : b.color ?? (b.highlight ? 'linear-gradient(180deg, #8b5cf6, #c4b5fd)' : '#26262a')
            return (
              <div
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {isActive && b.tooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `calc(${b.height}% + 22px)`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1b1b1e',
                      border: '1px solid #2a2a2e',
                      borderRadius: 11,
                      padding: '10px 13px',
                      whiteSpace: 'nowrap',
                      zIndex: 6,
                      boxShadow: '0 14px 28px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {b.tooltip}
                  </div>
                )}
                <div
                  style={{
                    width: '100%',
                    maxWidth: maxBarWidth,
                    height: `${b.height}%`,
                    borderRadius: '9px 9px 4px 4px',
                    background: bg,
                    position: 'relative'
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -7,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        border: '3px solid #141416'
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Labels X */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 11 }}>
          {data.map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                color: b.labelColor ?? (b.highlight ? '#f4f4f6' : '#7a7a80')
              }}
            >
              {b.month}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}