import { CatalogPage } from '@/tools/catalog/components/CatalogPage'
import { CATALOGS } from '@/tools/catalog/content'

/** Catálogo de corpos estranhos: `/tools/corpos-estranhos` e `/tools/corpos-estranhos/:entryId`. */
export default function ForeignCatalogPage() {
  return <CatalogPage catalog={CATALOGS.foreign} />
}
