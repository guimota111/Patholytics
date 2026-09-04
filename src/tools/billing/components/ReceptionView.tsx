import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Copy, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StepCard } from '@/components/ui/didactic'
import { CODES } from '../codes'
import { BASES, type Specimen } from '../specimens'
import { MaterialPicker } from './MaterialPicker'
import { Stepper } from './controls'

/**
 * Recepção: dá entrada pelo nome do material e pelo número de frascos.
 * Margens, peças extras e linfonodos não entram aqui — quem sabe disso é
 * o patologista, depois da macroscopia.
 */
export function ReceptionView() {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<Specimen | null>(null)
  const [flasks, setFlasks] = useState(1)
  const [copied, setCopied] = useState(false)

  const start = (sp: Specimen) => {
    setPicked(sp)
    setFlasks(sp.flasks ?? 1)
    setCopied(false)
  }

  if (!picked)
    return (
      <StepCard number={1} title={t('billing.receptionStep1')} hint={t('billing.receptionStep1Hint')}>
        <MaterialPicker onPick={start} autoFocus />
      </StepCard>
    )

  const base = BASES[picked.base]
  const code = CODES[base.code]
  const text = `${code.code} × ${flasks} — ${code.name}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => setPicked(null)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('billing.otherMaterial')}
      </button>

      <section className="rounded-xl border-2 border-line bg-elevated shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{picked.label}</h2>
          <label className="flex items-center gap-2.5 text-sm text-ink-muted">
            {base.flaskLabel}
            <Stepper value={flasks} onChange={setFlasks} min={1} max={40} label={base.flaskLabel} />
          </label>
        </header>

        <div className="px-5 py-5">
          <div className="rounded-xl border-2 border-accent/40 bg-accent-soft px-5 py-5">
            <p className="text-xs font-semibold tracking-wider text-accent-ink uppercase">{t('billing.receptionResult')}</p>
            <p className="tabular mt-1.5 text-3xl font-bold text-accent-ink">
              {code.code} <span className="text-2xl">× {flasks}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{code.name}</p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            {picked.receptionNote ?? t('billing.receptionDefaultNote')}
          </p>

          <div className="mt-5">
            <Button type="button" size="sm" onClick={() => void copy()}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t('billing.copied') : t('billing.copy')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
