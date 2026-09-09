import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { selectClass, Toggle } from '@/components/ui/fields'
import { computeBill, pieceFromSpecimen, type CasePiece } from '@/tools/billing/case'
import { CODES } from '@/tools/billing/codes'
import { SPECIMEN_BY_ID } from '@/tools/billing/specimens'
import { DemoFrame, DemoLabel } from '../SnapSection'

/** Peças com margens, peças extras e linfonodos — onde a conta costuma escapar. */
const DEMO_SPECIMENS = ['prostatectomia', 'mastectomia', 'colectomia', 'histerectomiaEndometrio']

export default function BillingDemo() {
  const { t } = useTranslation()
  const [specimenId, setSpecimenId] = useState(DEMO_SPECIMENS[0])
  const [pieces, setPieces] = useState<Record<string, CasePiece>>(() => ({
    [DEMO_SPECIMENS[0]]: pieceFromSpecimen(SPECIMEN_BY_ID[DEMO_SPECIMENS[0]]),
  }))

  const piece = pieces[specimenId] ?? pieceFromSpecimen(SPECIMEN_BY_ID[specimenId])
  const bill = useMemo(() => computeBill({ pieces: [piece], blocks: [], billed: {} }), [piece])

  const toggle = (structureId: string, on: boolean) =>
    setPieces((current) => ({
      ...current,
      [specimenId]: {
        ...piece,
        structures: piece.structures.map((st) => (st.id === structureId ? { ...st, on } : st)),
      },
    }))

  const pick = (id: string) => {
    setSpecimenId(id)
    setPieces((current) => (current[id] ? current : { ...current, [id]: pieceFromSpecimen(SPECIMEN_BY_ID[id]) }))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.billing.pieceLabel')}</DemoLabel>
        <select
          value={specimenId}
          onChange={(event) => pick(event.target.value)}
          className={selectClass}
          aria-label={t('landing.demo.billing.pieceLabel')}
        >
          {DEMO_SPECIMENS.map((id) => (
            <option key={id} value={id}>
              {SPECIMEN_BY_ID[id].label}
            </option>
          ))}
        </select>

        <p className="mt-3 text-xs leading-relaxed text-ink-faint">{t('landing.demo.billing.hint')}</p>

        <ul className="mt-3 max-h-[17rem] min-h-[10rem] flex-1 space-y-1.5 overflow-auto rounded-md border border-line bg-surface px-3.5 py-3">
          {piece.structures.map((structure) => (
            <li key={structure.id}>
              <Toggle
                checked={structure.on}
                onChange={(on) => toggle(structure.id, on)}
                label={
                  <span className="text-sm">
                    {structure.label}
                    <span className="ml-1.5 text-xs text-ink-faint">{t(`billing.${kindKey(structure.kind)}`)}</span>
                  </span>
                }
              />
            </li>
          ))}
          {piece.structures.length === 0 && (
            <li className="text-sm text-ink-faint">{t('landing.demo.billing.noStructures')}</li>
          )}
        </ul>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('billing.shouldTitle')}</DemoLabel>
        <p className="tabular text-base leading-snug font-bold break-words text-accent-ink">
          {bill.lines.map((line) => `${CODES[line.code].code} × ${line.qty}`).join('  +  ') || '—'}
        </p>

        <ul className="mt-3 max-h-[17rem] min-h-[10rem] flex-1 space-y-2.5 overflow-auto rounded-md border border-line bg-surface px-3.5 py-3">
          {bill.lines.map((line) => (
            <li key={line.code}>
              <div className="flex items-baseline gap-2">
                <span className="tabular text-sm font-semibold text-ink">{CODES[line.code].code}</span>
                <span className="tabular text-sm font-bold text-accent-ink">× {line.qty}</span>
              </div>
              <p className="text-xs leading-relaxed text-ink">{CODES[line.code].name}</p>
              <p className="text-xs leading-relaxed text-ink-muted">{line.reasons.join(' · ')}</p>
            </li>
          ))}
        </ul>

        {bill.warnings.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs leading-relaxed text-danger">
            {bill.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </DemoFrame>
    </div>
  )
}

const kindKey = (kind: string) => (kind === 'margin' ? 'margins' : kind === 'nodes' ? 'nodes' : 'extras')
