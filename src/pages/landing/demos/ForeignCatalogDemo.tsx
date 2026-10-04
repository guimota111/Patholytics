import { CatalogDemo } from './CatalogDemo'

/** No corpo estranho, o que orienta é a clínica e como o material se comporta. */
const FACETS = [
  'birrefringente',
  'nao-birrefringente',
  'pigmentado',
  'cristal',
  'estetico',
  'protese',
  'cirurgia-previa',
  'embolizacao',
  'aspiracao',
  'ingestao',
  'mimico-tumor',
  'contaminante',
]

export default function ForeignCatalogDemo() {
  return <CatalogDemo catalogId="foreign" facetIds={FACETS} />
}
