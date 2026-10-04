import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BookMarked, Info, Library, Trophy } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { isCurator } from '@/lib/curator'
import { ArchiveExplorer } from '@/tools/archive/components/ArchiveExplorer'
import { SaveToLibraryDialog } from '@/tools/archive/components/SaveToLibraryDialog'
import { copyToLibrary, creditOf, findExistingCopy } from '@/tools/archive/copy'
import { catalogRights, LIBRARY_RIGHTS } from '@/tools/archive/permissions'
import { CATALOG_SPACE, librarySpace } from '@/tools/archive/service'
import type { ArchiveNode } from '@/tools/archive/types'
import { useArchiveSpace } from '@/tools/archive/useArchive'

type Tab = 'catalog' | 'library'

export default function ReportArchivePage() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const uid = user?.uid ?? null
  const curator = isCurator(user)

  const [tab, setTab] = useState<Tab>('catalog')
  const [saving, setSaving] = useState<ArchiveNode | null>(null)

  /* O nome que assina o que a pessoa publicar. É um retrato do momento: mudar
     o nome no perfil depois não reescreve o crédito do que já foi publicado. */
  const signature = useMemo(
    () =>
      uid ? { uid, name: profile?.displayName || user?.displayName || t('archive.shared.anonymous') } : null,
    [uid, profile?.displayName, user?.displayName, t],
  )

  const catalog = useArchiveSpace(CATALOG_SPACE, signature)
  const library = useArchiveSpace(uid ? librarySpace(uid) : null)

  const catalogRightsValue = useMemo(() => catalogRights(uid, curator), [uid, curator])

  /** O que já foi trazido do catálogo, para a estrela saber que está salvo. */
  const savedSourceIds = useMemo(
    () => new Set(library.nodes.map((n) => n.sourceId).filter(Boolean)),
    [library.nodes],
  )

  const tabs: { id: Tab; label: string; icon: typeof Library }[] = [
    { id: 'catalog', label: t('archive.tabs.catalog'), icon: BookMarked },
    { id: 'library', label: t('archive.tabs.library'), icon: Library },
  ]

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.reportArchive.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-ink-muted">{t('archive.subtitle')}</p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex gap-1 rounded-md border border-line bg-surface p-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors',
                tab === item.id ? 'bg-elevated font-medium text-ink shadow-card' : 'text-ink-muted hover:text-ink',
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
        <Link
          to="/tools/archive/colaboradores"
          className="ml-auto inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-2 hover:text-accent hover:underline"
        >
          <Trophy className="size-4" aria-hidden />
          {t('archive.contributors.link')}
        </Link>
      </div>

      {/* As duas abas ficam montadas: alternar não perde a pasta aberta nem a busca. */}
      <div className="mt-5" hidden={tab !== 'catalog'}>
        <ArchiveExplorer
          archive={catalog}
          rights={catalogRightsValue}
          shared
          savedSourceIds={savedSourceIds}
          onSaveToLibrary={setSaving}
          notice={
            <p className="mt-3 rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
              {t(curator ? 'archive.shared.bannerCurator' : 'archive.shared.banner')}
            </p>
          }
        />
      </div>

      <div className="mt-5" hidden={tab !== 'library'}>
        <ArchiveExplorer archive={library} rights={LIBRARY_RIGHTS} shared={false} />
      </div>

      {saving && uid && (
        <SaveToLibraryDialog
          node={saving}
          credit={creditOf(saving)}
          index={library.index}
          existing={findExistingCopy(library.nodes, saving.id)}
          onSave={(parentId) => copyToLibrary(uid, saving, parentId)}
          onClose={() => setSaving(null)}
        />
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('archive.privacy')}
      </p>
    </div>
  )
}
