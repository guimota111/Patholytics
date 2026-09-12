import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fieldsFrom, newDraft, type FieldDraft } from '../drafts'
import { MAX_DIMENSION, MIN_DIMENSION, clampDimension, type TmaField } from '../types'
import { TmaFieldsEditor } from './TmaFieldsEditor'

interface TmaSetupProps {
  onStart: (rows: number, cols: number, fields: TmaField[]) => void
}

export function TmaSetup({ onStart }: TmaSetupProps) {
  const { t } = useTranslation()
  const [rows, setRows] = useState('6')
  const [cols, setCols] = useState('8')
  const [drafts, setDrafts] = useState<FieldDraft[]>(() => [newDraft(t('tma.defaultField'))])

  const parsedRows = Number(rows)
  const parsedCols = Number(cols)
  const valid = parsedRows >= MIN_DIMENSION && parsedCols >= MIN_DIMENSION
  const count = valid ? clampDimension(parsedRows) * clampDimension(parsedCols) : 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    onStart(parsedRows, parsedCols, fieldsFrom(drafts))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl rounded-lg border border-line bg-elevated shadow-card">
      <div className="p-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{t('tma.setupTitle')}</h2>
        <p className="mt-1.5 text-sm text-ink-muted">{t('tma.setupHint')}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            className="tabular"
            label={t('tma.rows')}
            value={rows}
            onChange={(event) => setRows(event.target.value)}
          />
          <Input
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            className="tabular"
            label={t('tma.cols')}
            value={cols}
            onChange={(event) => setCols(event.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-line p-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{t('tma.fieldsTitle')}</h2>
        <p className="mt-1.5 text-sm text-ink-muted">{t('tma.fieldsHint')}</p>
        <div className="mt-4">
          <TmaFieldsEditor drafts={drafts} onChange={setDrafts} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
        <p className="tabular text-sm text-ink-faint">
          {count > 0 ? t('tma.coreCount', { cores: count }) : ''}
        </p>
        <Button type="submit" disabled={!valid}>
          {t('tma.buildMap')}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  )
}
