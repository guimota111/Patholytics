import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, RotateCw } from 'lucide-react'
import { MohsDiagram } from '@/tools/frozen/components/MohsDiagram'
import {
  MOHS_TINTAS,
  buildDivisoes,
  buildPrincipalResultLines,
  buildTintasFrase,
  defaultMohsPrincipal,
  normDeg,
  relabelDivisoes,
} from '@/tools/frozen/mohs'
import type { MohsPrincipal, MohsShape } from '@/tools/frozen/types'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel, DemoReport } from '../SnapSection'

const DIVISION_OPTIONS = [2, 4, 6, 8]
const TUMOR_AT_START = 1

/** Peça já pintada: cada quadrante com a sua tinta, na ordem do relógio. */
function paint(principal: MohsPrincipal): MohsPrincipal {
  return {
    ...principal,
    divisoes: principal.divisoes.map((division, index) => ({
      ...division,
      cor: MOHS_TINTAS[index % MOHS_TINTAS.length].nome,
    })),
  }
}

function start(): MohsPrincipal {
  const base = paint(defaultMohsPrincipal())
  return {
    ...base,
    divisoes: base.divisoes.map((d, i) => (i === TUMOR_AT_START ? { ...d, tumor: true } : d)),
  }
}

/**
 * O esquemático da cirurgia de Mohs: a peça vista de cima com o relógio em
 * volta. Gire o eixo de corte, divida em mais quadrantes e clique no que tem
 * tumor — os rótulos em horas e as frases do laudo se refazem sozinhos.
 */
export default function MohsDemo() {
  const { t } = useTranslation()
  const [piece, setPiece] = useState<MohsPrincipal>(start)

  const rotate = (delta: number) =>
    setPiece((current) => {
      const rotated = { ...current, rotacao: normDeg(current.rotacao + delta) }
      return { ...rotated, divisoes: relabelDivisoes(rotated).divisoes }
    })

  const setShape = (shape: MohsShape) =>
    setPiece((current) =>
      paint({
        ...current,
        shape,
        divisoes: buildDivisoes(shape, current.divisoes.length, 1, current.rotacao),
      }),
    )

  const setCount = (count: number) =>
    setPiece((current) =>
      paint({
        ...current,
        numDivisoes: count,
        divisoes: buildDivisoes(current.shape, count, 1, current.rotacao),
      }),
    )

  const toggleTumor = (index: number) =>
    setPiece((current) => ({
      ...current,
      divisoes: current.divisoes.map((d, i) => (i === index ? { ...d, tumor: !d.tumor } : d)),
    }))

  const report = useMemo(() => {
    const lines = [buildTintasFrase(piece), ...buildPrincipalResultLines(piece, t('landing.demo.mohs.tumorType'))]
    return lines.filter(Boolean).join('\n\n')
  }, [piece, t])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.mohs.pieceLabel')}</DemoLabel>

        <MohsDiagram frag={piece} onToggleTumor={toggleTumor} />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => rotate(-15)}
            aria-label={t('landing.demo.mohs.rotateBack')}
            title={t('landing.demo.mohs.rotateBack')}
            className="flex size-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden />
          </button>
          <span className="tabular w-20 text-center text-sm text-ink-muted">{piece.rotacao}°</span>
          <button
            type="button"
            onClick={() => rotate(15)}
            aria-label={t('landing.demo.mohs.rotateForward')}
            title={t('landing.demo.mohs.rotateForward')}
            className="flex size-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <RotateCw className="size-4" aria-hidden />
          </button>

          <span className="mx-1 h-6 w-px bg-line" aria-hidden />

          {(['circle', 'halfmoon'] as MohsShape[]).map((shape) => (
            <Pill key={shape} active={piece.shape === shape} onClick={() => setShape(shape)}>
              {t(`landing.demo.mohs.shape.${shape}`)}
            </Pill>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {DIVISION_OPTIONS.map((count) => (
            <Pill key={count} active={piece.divisoes.length === count} onClick={() => setCount(count)}>
              {t('landing.demo.mohs.divisions', { count })}
            </Pill>
          ))}
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">{t('landing.demo.mohs.hint')}</p>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.mohs.cassettesLabel')}</DemoLabel>
        <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          {piece.divisoes.map((division, index) => (
            <li key={index} className="flex items-center gap-2.5 bg-surface px-3 py-2">
              <span
                className="size-3.5 shrink-0 rounded-full border border-line-strong"
                style={{ background: MOHS_TINTAS.find((tint) => tint.nome === division.cor)?.hex ?? 'transparent' }}
                aria-hidden
              />
              <span className="tabular min-w-0 flex-1 truncate text-sm text-ink">{division.label}</span>
              <span className="tabular shrink-0 text-xs text-ink-faint">
                {piece.letter}
                {division.cassete}
              </span>
              {division.tumor && (
                <span className="shrink-0 rounded border border-danger/40 bg-danger-soft px-1.5 py-0.5 text-[0.6875rem] font-medium text-danger">
                  {t('landing.demo.mohs.tumor')}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex-1">
          <DemoLabel>{t('landing.demo.mohs.reportLabel')}</DemoLabel>
          <DemoReport text={report} empty={t('landing.demo.emptyReport')} className="max-h-[14rem]" />
        </div>
      </DemoFrame>
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
