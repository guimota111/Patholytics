import { SuitePage } from '@/tools/suites/components/SuiteCalculator'
import { gradingSuite } from '@/tools/grading/registry'

/** /tools/graduacoes e /tools/graduacoes/:calculatorId */
export default function GradingPage() {
  return <SuitePage suite={gradingSuite} />
}
