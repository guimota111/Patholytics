import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Info } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'

export const MANUAL_PATH = '/tools/macroscopia'

/** Manual › Sistema › Peça — o caminho até a página atual. */
export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('macroscopy.breadcrumbLabel')} className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <ChevronRight className="size-3.5" aria-hidden />}
          {item.to ? (
            <Link to={item.to} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}

/** Nota de rodapé comum às três páginas do manual. */
export function ManualFooter() {
  const { t } = useTranslation()

  return (
    <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {t('macroscopy.footer')}
    </p>
  )
}

/** URL de sistema ou peça que não existe no manual. */
export function MissingNote() {
  const { t } = useTranslation()

  return (
    <div className="shell py-10">
      <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
        <h1 className="text-sm font-semibold text-ink">{t('macroscopy.missingTitle')}</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">{t('macroscopy.missingBody')}</p>
        <div className="mt-5 flex justify-center">
          <ButtonLink to={MANUAL_PATH} variant="secondary">
            {t('macroscopy.backToManual')}
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
