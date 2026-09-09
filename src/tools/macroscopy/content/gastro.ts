import { Activity } from 'lucide-react'
import type { MacroSystem } from '../types'

/** Trato gastrointestinal e órgãos anexos. Roteiros ainda por escrever. */
export const gastro: MacroSystem = {
  id: 'gastrointestinal',
  name: 'Gastrointestinal',
  icon: Activity,
  color: '#ef4444',
  description: 'Protocolo de análise macroscópica do trato gastrointestinal e órgãos anexos.',
  protocols: [],
}
