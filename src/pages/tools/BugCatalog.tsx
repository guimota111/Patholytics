import { CatalogPage } from '@/tools/catalog/components/CatalogPage'
import { CATALOGS } from '@/tools/catalog/content'

/** Catálogo de bichos: `/tools/bichos` e `/tools/bichos/:entryId`. */
export default function BugCatalogPage() {
  return <CatalogPage catalog={CATALOGS.bugs} />
}
