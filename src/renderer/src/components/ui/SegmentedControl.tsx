import { cn } from '../../lib/utils'

export type SegmentOption<T extends string = string> = {
  value: T
  label: string
  /** Bolinha decorativa (estilo "● Anual" do design). */
  dotColor?: string
}

type Props<T extends string> = {
  options: SegmentOption<T>[]
  value: T
  onChange: (next: T) => void
  className?: string
  size?: 'sm' | 'md'
}

/**
 * Segmented control do design novo.
 *
 * Track: bg #121214, borda #202023, raio 9, padding 3.
 * Item ativo: bg #26262a, texto #f4f4f6, peso 600.
 * Item inativo: transparent, texto #86868d.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md'
}: Props<T>) {
  const sizeCfg = {
    sm: { itemPadding: '6px 14px', fontSize: 12.5, gap: 6 },
    md: { itemPadding: '7px 16px', fontSize: 13, gap: 7 }
  }[size]

  return (
    <div
      className={cn('flex rounded-[9px] p-[3px]', className)}
      style={{ background: '#121214', border: '1px solid #202023' }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center cursor-pointer transition-colors"
            style={{
              padding: sizeCfg.itemPadding,
              borderRadius: 6,
              fontSize: sizeCfg.fontSize,
              fontWeight: active ? 600 : 500,
              background: active ? '#26262a' : 'transparent',
              color: active ? '#f4f4f6' : '#86868d',
              gap: sizeCfg.gap
            }}
          >
            {opt.dotColor && (
              <span
                className="inline-block rounded-full"
                style={{ width: 7, height: 7, background: opt.dotColor }}
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}