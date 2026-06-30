import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Largura do panel em px. Default 660 (design target Pro). */
  width?: number
  /** Label do header (ex: "Client Drive"). */
  headerLabel?: string
  /** Título grande (com wavy underline vermelho aplicado se `titleWavy`). */
  title?: string
  /** Aplica sublinhado wavy vermelho no título (estilo painel cliente). */
  titleWavy?: boolean
  /** Botões extras no header (à direita do close). */
  headerActions?: ReactNode
}

/**
 * Side panel estilo Notion do design novo.
 *
 * Overlay `rgba(0,0,0,.5)` cobre o main + panel 660px à direita com bg #0c0c0e
 * e borda esquerda #1f1f22. Header tem botão fechar (X em chip 30×30).
 *
 * Side panel cliente (Pro) usa titleWavy para dar o destaque vermelho ondulado.
 */
export function SidePanel({
  open,
  onClose,
  children,
  width = 660,
  headerLabel,
  title,
  titleWavy = false,
  headerActions
}: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 60
        }}
      />
      {/* panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          background: '#0c0c0e',
          borderLeft: '1px solid #1f1f22',
          boxShadow: '-30px 0 60px rgba(0, 0, 0, 0.5)',
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid #161619',
            flexShrink: 0
          }}
        >
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              color: '#9a9aa0',
              background: 'transparent'
            }}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
          {headerLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#7a7a80' }}>
              {headerLabel}
            </div>
          )}
          <div style={{ flex: 1 }} />
          {headerActions}
        </div>

        {/* conteúdo scrollável */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '34px 56px 40px' }}>
          {title && (
            <h2
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: '#f4f4f6',
                letterSpacing: '-0.02em',
                margin: 0,
                marginBottom: 24,
                ...(titleWavy
                  ? {
                      textDecoration: 'underline wavy #ef4444',
                      textDecorationSkipInk: 'none',
                      textUnderlineOffset: 8,
                      textDecorationThickness: '1.5px'
                    }
                  : {})
              }}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </>
  )
}