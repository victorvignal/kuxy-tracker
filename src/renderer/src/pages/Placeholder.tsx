import { ReactNode } from 'react'
import { useT } from '../lib/i18n'
import { IconDashboard } from '../components/template-icons/TemplateIcon'

/**
 * Placeholder genérico para rotas novas do template Pessoal Dashboard.
 *
 * Substitui o template 1:1 (cada item da sidebar tem que abrir uma página),
 * mas enquanto a página real não é implementada, mostra um hero bonito
 * indicando que está "em construção" — evitando tela em branco e 404.
 *
 * Cada placeholder deve ser substituído por uma página funcional
 * específica nas próximas sprints (Contacts CRUD, Notifications inbox, etc).
 */
export function Placeholder({
  titleKey,
  subtitle,
  Icon
}: {
  titleKey: string
  subtitle?: string
  Icon?: ReactNode
}) {
  const t = useT()
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border mx-auto flex items-center justify-center mb-6">
          {Icon ?? <IconDashboard size={28} color="var(--color-text-muted)" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-text">
          {t(titleKey)}
        </h1>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          {subtitle ?? t('placeholder.body')}
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-xs text-accent font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {t('placeholder.badge')}
        </div>
      </div>
    </div>
  )
}