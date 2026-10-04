import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Construction, Lock } from 'lucide-react'
import { isShipped, type Tool } from '@/data/tools'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

interface ToolCardProps {
  tool: Tool
  /** Marketing surfaces drop the interactive affordances entirely. */
  variant?: 'dashboard' | 'preview'
}

export function ToolCard({ tool, variant = 'dashboard' }: ToolCardProps) {
  const { t } = useTranslation()
  const Icon = tool.icon
  const isAvailable = isShipped(tool)
  const preview = tool.status === 'preview'

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border',
            isAvailable
              ? 'border-accent/30 bg-accent-soft text-accent'
              : 'border-line bg-surface text-ink-faint',
          )}
        >
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>

        {isAvailable ? (
          <span className="flex items-center gap-2">
            {preview && (
              <Badge className="border-warning/40 bg-warning-soft text-warning normal-case tracking-normal">
                <Construction className="size-3" aria-hidden />
                {t('common.underConstruction')}
              </Badge>
            )}
            <ArrowUpRight
              className="size-4 text-ink-faint transition-colors group-hover:text-accent"
              aria-hidden
            />
          </span>
        ) : (
          <Badge>
            <Lock className="size-3" aria-hidden />
            {t('common.comingSoon')}
          </Badge>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <h3
          className={cn(
            'text-sm font-semibold tracking-tight',
            isAvailable ? 'text-ink' : 'text-ink-muted',
          )}
        >
          {t(`tools.${tool.i18nKey}.name`)}
        </h3>
        <p className="text-sm leading-relaxed text-ink-faint">
          {t(`tools.${tool.i18nKey}.description`)}
        </p>
      </div>
    </>
  )

  const shell = cn(
    'group flex h-full flex-col rounded-lg border p-5 text-left transition-colors duration-150',
    isAvailable
      ? 'border-line bg-elevated shadow-card hover:border-accent/40 hover:bg-raised'
      : 'border-line/70 bg-surface/60',
    !isAvailable && variant === 'dashboard' && 'cursor-not-allowed select-none',
  )

  if (isAvailable && tool.path) {
    return (
      <Link to={tool.path} className={shell}>
        {body}
      </Link>
    )
  }

  return (
    <div className={shell} aria-disabled="true">
      {body}
    </div>
  )
}
