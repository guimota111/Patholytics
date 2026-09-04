import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardPaste, Download, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MoreSection } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { labelSpan, planCassettes } from '../cassettes'
import { fmtDims } from '../format'
import { decodeMapCode } from '../storage'
import type { MacroState } from '../types'
import { InkFields } from './InkFields'
import { LesionEditor } from './LesionEditor'
import { SlicingFields } from './SlicingFields'
import { SpecimenFields } from './SpecimenFields'

interface MapBuilderProps {
  map: MacroState
  setMap: (patch: Partial<MacroState> | ((m: MacroState) => MacroState)) => void
  onReplace: (map: MacroState) => void
  onImportLocal: () => void
  hasLocalMacro: boolean
  selectedLesion: string | null
  onSelectLesion: (id: string | null) => void
}

/**
 * Passo 1 da laudagem: reconstruir o mapa da macroscopia — colando o código
 * que o macroscopista gerou, importando a macro feita neste navegador, ou
 * descrevendo a peça, as lesões e os cortes à mão (os mesmos editores da
 * macro, sem os campos descritivos).
 */
export function MapBuilder({ map, setMap, onReplace, onImportLocal, hasLocalMacro, selectedLesion, onSelectLesion }: MapBuilderProps) {
  const { t, i18n } = useTranslation()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const setMapFn = (fn: (m: MacroState) => MacroState) => setMap(fn)

  const paste = () => {
    const decoded = decodeMapCode(code)
    if (!decoded) {
      setStatus('error')
      return
    }
    onReplace(decoded)
    setStatus('ok')
    setCode('')
  }

  const plans = planCassettes(map)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-1.5">
          <label htmlFor="breast-map-code" className="block text-sm font-medium text-ink">
            {t('breast.micro.paste')}
          </label>
          <div className="flex gap-2">
            <input
              id="breast-map-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setStatus('idle')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') paste()
              }}
              placeholder={t('breast.micro.pastePlaceholder')}
              className={cn(
                'tabular h-10 w-full rounded-md border bg-surface px-3 text-xs text-ink placeholder:text-ink-faint hover:border-line-strong',
                status === 'error' ? 'border-danger' : 'border-line',
              )}
            />
            <Button type="button" onClick={paste} disabled={!code.trim()}>
              <ClipboardPaste className="size-4" aria-hidden />
              {t('breast.micro.import')}
            </Button>
          </div>
          <p className={cn('text-xs', status === 'error' ? 'text-danger' : status === 'ok' ? 'text-success' : 'text-ink-faint')}>
            {status === 'error' ? t('breast.micro.pasteError') : status === 'ok' ? t('breast.micro.pasteOk') : t('breast.micro.pasteHint')}
          </p>
        </div>
        {hasLocalMacro && (
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={onImportLocal}>
              <Download className="size-4" aria-hidden />
              {t('breast.micro.importFromMacro')}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-line bg-surface px-4 py-3 text-sm">
        <p className="font-medium text-ink">
          {t(`breast.specimenType.${map.specimen.type}`)} · {t(`breast.side.${map.specimen.side}`)} · {fmtDims(map.specimen.dims, 'mm', i18n.language)}
        </p>
        <p className="tabular mt-1 text-xs text-ink-muted">
          {t('breast.micro.mapSummary', { n: map.slicing.count, from: t(`breast.margin.${map.slicing.from}`) })}
          {plans.map((p) => (
            <span key={p.lesion.id}>
              {' · '}
              {t('breast.map.lesionN', { n: p.lesion.label })}: {labelSpan(p.grid)} ({t('breast.map.sliceN', { n: p.central })})
              {p.others.length > 0 && ` + ${labelSpan(p.others)}`}
            </span>
          ))}
        </p>
      </div>

      <MoreSection label={t('breast.micro.editMap')}>
        <div className="space-y-6">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <PencilLine className="size-4 text-accent" aria-hidden />
              {t('breast.macro.step1Title')}
            </p>
            <SpecimenFields specimen={map.specimen} onChange={(patch) => setMapFn((m) => ({ ...m, specimen: { ...m.specimen, ...patch } }))} compact />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">{t('breast.macro.step2Title')}</p>
            <InkFields inks={map.inks} onChange={(margin, ink) => setMapFn((m) => ({ ...m, inks: { ...m.inks, [margin]: ink } }))} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">{t('breast.macro.step4Title')}</p>
            <SlicingFields map={map} setMap={setMapFn} compact />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">{t('breast.macro.step3Title')}</p>
            <LesionEditor map={map} setMap={setMapFn} selected={selectedLesion} onSelect={onSelectLesion} compact />
          </div>
        </div>
      </MoreSection>
    </div>
  )
}
