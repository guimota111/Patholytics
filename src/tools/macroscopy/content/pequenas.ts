import { Microscope } from 'lucide-react'
import type { MacroSystem } from '../types'

/** Pequenas peças e biópsias cirúrgicas. Roteiros ainda por escrever. */
export const pequenas: MacroSystem = {
  id: 'pequenas-pecas',
  name: 'Pequenas peças',
  icon: Microscope,
  color: '#14b8a6',
  description: 'Protocolo de análise macroscópica de pequenas peças e biópsias cirúrgicas.',
  protocols: [],
}
