import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Hammer, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { RichText } from '../richtext'
import type { GuideNode } from '../types'

/**
 * O roteiro como ele é usado na bancada: um passo por vez, foto em cima,
 * texto embaixo, e o dedo no botão de avançar.
 */
export function StepViewer({ protocol, systemName }: { protocol: GuideNode; systemName: string }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const steps = protocol.steps.filter((step) => step.text.trim() || step.image)

  // Trocar de peça recomeça do primeiro passo.
  useEffect(() => setCurrent(0), [protocol.id])

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-line bg-elevated text-ink-faint">
          <Hammer className="size-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-ink">{t('macroscopy.emptyTitle')}</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">
          {t('macroscopy.emptyBody', { name: protocol.name })}
        </p>
      </div>
    )
  }

  const index = Math.min(current, steps.length - 1)
  const step = steps[index]

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-elevated shadow-card">
      {step.image && (
        <figure className="border-b border-line bg-surface">
          <img
            src={step.image}
            alt={step.caption || t('macroscopy.stepImageAlt', { n: index + 1 })}
            className="mx-auto max-h-[26rem] w-full object-contain"
          />
          {step.caption && (
            <figcaption className="border-t border-line px-4 py-2 text-center text-xs text-ink-faint">
              {step.caption}
            </figcaption>
          )}
        </figure>
      )}

      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-semibold tracking-wider text-ink-faint uppercase">
          <Layers className="size-3.5" aria-hidden />
          {t('macroscopy.stepOf', { current: index + 1, total: steps.length })}
        </p>

        <p className="mt-1 text-center text-xs text-ink-faint">
          {systemName} · {protocol.name}
        </p>

        <RichText source={step.text} className="mx-auto mt-5 max-w-2xl" />

        <div className="mt-6 flex justify-center gap-2">
          {steps.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={t('macroscopy.goToStep', { n: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
              className={cn(
                'size-2.5 rounded-full transition-colors',
                i === index ? 'bg-accent' : 'bg-line-strong hover:bg-accent/50',
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex border-t border-line bg-surface">
        <Button
          type="button"
          variant="ghost"
          className="flex-1 rounded-none py-6"
          disabled={index === 0}
          onClick={() => setCurrent(index - 1)}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('macroscopy.previous')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="flex-1 rounded-none border-l border-line py-6"
          disabled={index >= steps.length - 1}
          onClick={() => setCurrent(index + 1)}
        >
          {t('macroscopy.next')}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
