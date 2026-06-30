import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /** Tamanho só do ícone (se quiser passar direto um component). */
  iconOnly?: ReactNode
}

/**
 * Botão padrão do design novo.
 *
 * Primary (roxo sólido #8b5cf6): ações principais ("Adicionar", "Novo").
 * Secondary (cinza #161619 + borda #232327): ações neutras ("Export", "Ver todos").
 * Ghost (sem bg/borda): ações inline ("Ver detalhes →").
 *
 * Tamanhos: md (38px, padrão), sm (32px, secundário em headers de card).
 */
export function Btn({
  children,
  variant = 'secondary',
  size = 'md',
  leftIcon,
  rightIcon,
  iconOnly,
  className,
  style,
  ...rest
}: Props) {
  const sizeCfg = {
    md: { height: 38, padding: '0 14px', fontSize: 13, gap: 7, radius: 9 },
    sm: { height: 32, padding: '0 12px', fontSize: 12.5, gap: 6, radius: 9 }
  }[size]

  const variantCfg = {
    primary: { background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 600 },
    secondary: {
      background: '#161619',
      color: '#e8e8ea',
      border: '1px solid #232327',
      fontWeight: 500
    },
    ghost: { background: 'transparent', color: '#cfcfd4', border: 'none', fontWeight: 500 }
  }[variant]

  return (
    <button
      {...rest}
      className={cn(
        'flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer',
        className
      )}
      style={{
        height: sizeCfg.height,
        padding: sizeCfg.padding,
        fontSize: sizeCfg.fontSize,
        borderRadius: sizeCfg.radius,
        gap: sizeCfg.gap,
        ...variantCfg,
        ...style
      }}
    >
      {leftIcon}
      {iconOnly ?? children}
      {rightIcon}
    </button>
  )
}