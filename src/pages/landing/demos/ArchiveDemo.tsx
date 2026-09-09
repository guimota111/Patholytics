import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel, DemoReport } from '../SnapSection'

interface DemoLeaf {
  id: string
  folder: string
  icon: string
  label: string
  tags: string[]
  favorite: boolean
  content: string
}

const LEAVES: DemoLeaf[] = [
  {
    id: 'r1',
    folder: 'Gastro',
    icon: '📄',
    label: 'Adenocarcinoma colorretal — peça',
    tags: ['colon', 'cap'],
    favorite: true,
    content: [
      'PRODUTO DE COLECTOMIA:',
      '- Adenocarcinoma de intestino grosso, tipo histológico convencional, grau ___.',
      '- Maior dimensão: ___ cm.',
      '- Invasão: ___ (pT___).',
      '- Margens proximal, distal e radial: livres (menor distância ___ mm).',
      '- Linfonodos: ___/___ comprometidos (pN___).',
      '- Invasão angiolinfática: ___ · Invasão perineural: ___',
    ].join('\n'),
  },
  {
    id: 'r2',
    folder: 'Mama',
    icon: '📄',
    label: 'Carcinoma invasivo — pós-neoadjuvância',
    tags: ['mama', 'rcb'],
    favorite: false,
    content: [
      'PRODUTO DE SEGMENTECTOMIA DE MAMA:',
      '- Leito tumoral com carcinoma residual, tipo não especial, grau ___.',
      '- Maior foco contíguo de carcinoma invasivo: ___ mm (ypT___).',
      '- Leito: ___ × ___ mm; celularidade média ___ %, sendo ___ % in situ.',
      '- Linfonodos: ___/___ (maior metástase ___ mm) — ypN___.',
      '- Residual Cancer Burden: índice ___ (classe RCB-___).',
    ].join('\n'),
  },
  {
    id: 'n1',
    folder: 'Notas',
    icon: '📝',
    label: 'Painel de imuno — carcinoma indiferenciado',
    tags: ['ihq'],
    favorite: false,
    content: [
      'Primeira linha: AE1/AE3, vimentina, S100/SOX10, CD45.',
      'Se citoqueratina +: TTF-1, GATA3, CDX2, PAX8, p40.',
      'Se S100/SOX10 +: HMB45, Melan-A.',
      'Se CD45 +: painel linfoide conforme padrão arquitetural.',
    ].join('\n'),
  },
  {
    id: 'r3',
    folder: 'Próstata',
    icon: '📄',
    label: 'Prostatectomia radical',
    tags: ['prostata', 'gleason'],
    favorite: true,
    content: [
      'PRODUTO DE PROSTATECTOMIA RADICAL:',
      '- Adenocarcinoma acinar, Gleason ___ (Grupo ___).',
      '- Volume tumoral estimado: ___ % da glândula.',
      '- Extensão extraprostática: ___ · Vesículas seminais: ___',
      '- Margem cirúrgica: ___ (extensão ___ mm, Gleason na margem ___).',
      '- Estadiamento: pT___ pN___ .',
    ].join('\n'),
  },
]

export default function ArchiveDemo() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(LEAVES[0].id)
  const [favorites, setFavorites] = useState(() => LEAVES.filter((l) => l.favorite).map((l) => l.id))
  const [copied, setCopied] = useState(false)

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return LEAVES
    return LEAVES.filter((leaf) =>
      [leaf.label, leaf.folder, leaf.content, ...leaf.tags].join(' ').toLowerCase().includes(needle),
    )
  }, [query])

  const selected = LEAVES.find((leaf) => leaf.id === selectedId) ?? results[0] ?? null

  const copy = async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.content)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <DemoFrame>
        <DemoLabel>{t('landing.demo.archive.treeLabel')}</DemoLabel>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('archive.toolbar.search')}
            aria-label={t('archive.toolbar.search')}
            className="h-9 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
        </div>

        <ul className="mt-3 max-h-[16rem] divide-y divide-line overflow-auto rounded-md border border-line bg-surface">
          {results.map((leaf) => {
            const active = selected?.id === leaf.id
            const starred = favorites.includes(leaf.id)
            return (
              <li key={leaf.id} className={cn('flex items-center gap-2 px-3 py-2', active && 'bg-accent-soft/60')}>
                <button
                  type="button"
                  onClick={() => setSelectedId(leaf.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span aria-hidden>{leaf.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{leaf.label}</span>
                    <span className="block truncate text-xs text-ink-faint">
                      {leaf.folder} · {leaf.tags.map((tag) => `#${tag}`).join(' ')}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFavorites((current) =>
                      current.includes(leaf.id) ? current.filter((id) => id !== leaf.id) : [...current, leaf.id],
                    )
                  }
                  aria-label={starred ? t('archive.row.unfavorite') : t('archive.row.favorite')}
                  className={cn('shrink-0 transition-colors', starred ? 'text-accent' : 'text-ink-faint hover:text-ink')}
                >
                  <Star className={cn('size-4', starred && 'fill-current')} aria-hidden />
                </button>
              </li>
            )
          })}
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-faint">{t('landing.demo.archive.noMatch')}</li>
          )}
        </ul>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoLabel>{selected ? selected.label : t('archive.panel.empty')}</DemoLabel>
          <Button type="button" size="sm" variant="secondary" onClick={() => void copy()} disabled={!selected}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? t('archive.panel.copied') : t('archive.panel.copy')}
          </Button>
        </div>
        <DemoReport
          text={selected?.content ?? ''}
          empty={t('archive.panel.empty')}
          className="max-h-[16rem]"
        />
      </DemoFrame>
    </div>
  )
}
