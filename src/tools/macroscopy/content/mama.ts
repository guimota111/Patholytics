import { Ribbon } from 'lucide-react'
import type { MacroSystem } from '../types'

/** Mastectomias, quadrantectomias e demais amostras mamárias. Roteiros ainda por escrever. */
export const mama: MacroSystem = {
  id: 'mama',
  name: 'Mama',
  icon: Ribbon,
  color: '#f97316',
  description: 'Protocolos de mastectomia, quadrantectomia e demais amostras mamárias.',
  protocols: [],
}
