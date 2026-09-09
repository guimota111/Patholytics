import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, CircleDashed, Info, Snowflake } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { CongForm } from '@/tools/frozen/components/CongForm'
import { ModelosList } from '@/tools/frozen/components/ModelosList'
import { MohsForm } from '@/tools/frozen/components/MohsForm'
import { useFrozen } from '@/tools/frozen/useFrozen'
import { useModelos } from '@/tools/frozen/useModelos'

const TABS = [
  { id: 'cong', icon: Snowflake },
  { id: 'mohs', icon: CircleDashed },
  { id: 'modelos', icon: Bookmark },
] as const

type Tab = (typeof TABS)[number]['id']

export default function FrozenPage() {
  const { t } = useTranslation()
  const frozen = useFrozen()
  const modelos = useModelos()
  const [tab, setTab] = useState<Tab>('cong')

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.frozen.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('frozen.subtitle')}</p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1" aria-label={t('frozen.tabs.label')}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              tab === item.id ? 'bg-elevated text-ink shadow-subtle' : 'text-ink-muted hover:text-ink',
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {t(`frozen.tabs.${item.id}`)}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {!frozen.hydrated ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : tab === 'cong' ? (
          <CongForm frozen={frozen} onSaveModelo={() => modelos.add(frozen.cong)} canSaveModelo={modelos.items !== null} />
        ) : tab === 'mohs' ? (
          <MohsForm frozen={frozen} />
        ) : (
          <ModelosList
            items={modelos.items}
            error={modelos.error}
            onRemove={modelos.remove}
            onUse={(modelo) => {
              frozen.setCong({
                ...frozen.cong,
                pecas: structuredClone(modelo.pecas),
                informesClinicosVisible: modelo.informesClinicosVisible,
                informesClinicos: modelo.informesClinicos,
                patologista: modelo.patologista || frozen.cong.patologista,
              })
              setTab('cong')
            }}
          />
        )}
      </div>

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('frozen.privacy')}
      </p>
    </div>
  )
}
