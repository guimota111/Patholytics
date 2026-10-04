import { SuitePage } from '@/tools/suites/components/SuiteCalculator'
import { scoresSuite } from '@/tools/scores/registry'

/** /tools/escores e /tools/escores/:calculatorId */
export default function ScoresPage() {
  return <SuitePage suite={scoresSuite} />
}
