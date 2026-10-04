import { CatalogDemo } from './CatalogDemo'

/** As morfologias que mais aparecem na dúvida da bancada. */
const FACETS = [
  'hifa-septada',
  'hifa-nao-septada',
  'pseudo-hifa',
  'brotamento-base-estreita',
  'brotamento-base-larga',
  'brotamento-multiplo',
  'capsula',
  'esferula',
  'intracelular',
  'pigmentado',
  'ovo',
  'larva',
]

export default function BugCatalogDemo() {
  return <CatalogDemo catalogId="bugs" facetIds={FACETS} />
}
