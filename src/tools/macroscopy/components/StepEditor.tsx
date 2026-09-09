import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { prepareImage } from '../image'
import { MAX_STEPS, type GuideNode, type Step } from '../types'

interface StepEditorProps {
  protocol: GuideNode
  onChange: (steps: Step[]) => void
}

const newStep = (): Step => ({ id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text: '', image: '', caption: '' })

/** Escrever o roteiro: um cartão por passo, texto e foto, na ordem da bancada. */
export function StepEditor({ protocol, onChange }: StepEditorProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState<string | null>(null)
  const [tooBig, setTooBig] = useState(false)
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})
  const steps = protocol.steps

  const patch = (id: string, next: Partial<Step>) =>
    onChange(steps.map((step) => (step.id === id ? { ...step, ...next } : step)))

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const pickImage = async (id: string, file: File | undefined) => {
    if (!file) return
    setBusy(id)
    setTooBig(false)
    try {
      const dataUrl = await prepareImage(file)
      if (dataUrl) patch(id, { image: dataUrl })
      else setTooBig(true)
    } catch {
      setTooBig(true)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      {tooBig && <p className="text-sm text-danger">{t('macroscopy.imageTooBig')}</p>}

      {steps.map((step, index) => (
        <section key={step.id} className="rounded-lg border border-line bg-elevated shadow-subtle">
          <header className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="tabular text-xs font-semibold tracking-wider text-ink-faint uppercase">
              {t('macroscopy.stepN', { n: index + 1 })}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0} aria-label={t('macroscopy.moveUp')}>
                <ArrowUp className="size-4" aria-hidden />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => move(index, 1)} disabled={index === steps.length - 1} aria-label={t('macroscopy.moveDown')}>
                <ArrowDown className="size-4" aria-hidden />
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => onChange(steps.filter((s) => s.id !== step.id))} aria-label={t('macroscopy.removeStep')}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </header>

          <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="space-y-2">
              <textarea
                value={step.text}
                onChange={(event) => patch(step.id, { text: event.target.value })}
                rows={7}
                placeholder={t('macroscopy.textPlaceholder')}
                aria-label={t('macroscopy.stepText', { n: index + 1 })}
                className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
              />
              <p className="text-xs text-ink-faint">{t('macroscopy.syntaxHint')}</p>
            </div>

            <div className="space-y-2">
              {step.image ? (
                <div className="space-y-2">
                  <img src={step.image} alt="" className="max-h-40 w-full rounded-md border border-line object-contain" />
                  <input
                    value={step.caption}
                    onChange={(event) => patch(step.id, { caption: event.target.value })}
                    placeholder={t('macroscopy.captionPlaceholder')}
                    aria-label={t('macroscopy.caption')}
                    className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => patch(step.id, { image: '', caption: '' })}>
                    <X className="size-4" aria-hidden />
                    {t('macroscopy.removeImage')}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  disabled={busy === step.id}
                  onClick={() => inputs.current[step.id]?.click()}
                >
                  {busy === step.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
                  {t('macroscopy.addImage')}
                </Button>
              )}
              <input
                ref={(el) => {
                  inputs.current[step.id] = el
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void pickImage(step.id, event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>
          </div>
        </section>
      ))}

      <Button
        type="button"
        variant="secondary"
        disabled={steps.length >= MAX_STEPS}
        onClick={() => onChange([...steps, newStep()])}
      >
        <Plus className="size-4" aria-hidden />
        {t('macroscopy.addStep')}
      </Button>
    </div>
  )
}
