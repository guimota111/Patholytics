/* ==========================================================================
   congText.ts — o laudo de congelação em texto, do cabeçalho à assinatura.
   Função pura: recebe o documento, devolve as linhas.
   ========================================================================== */

import { casseteFaixa, computeBlocos, dataAssinatura, isquemiaTexto } from './text'
import { HOSPITAIS, type CongDoc, type Modelo, type Peca } from './types'

export const FRASE_RECEBIMENTO = 'o material foi recebido a fresco para exame de congelação e consiste em'

export function hospitalNome(key: string): string {
  return HOSPITAIS.find((h) => h.key === key)?.nome ?? key ?? ''
}

/** O tempo digitado ganha do cronômetro — é a saída para quando esqueceram de apertar. */
export function congIsquemiaTexto(doc: CongDoc, now: number = Date.now()): string {
  const manual = String(doc.isquemiaFria || '').trim()
  if (manual) return manual
  return isquemiaTexto(doc.isquemiaCron, now)
}

export function inclusaoFrase(peca: Peca): string {
  const inc = peca.tudoIncluido
    ? 'Todo material foi enviado para exame histológico'
    : 'Material parcialmente enviado para exame histológico'
  return `${inc} - ${computeBlocos(peca)}B/${peca.fragmentos || 'V'}F.`
}

export function pecaCorpo(peca: Peca): string {
  const macro = (peca.macroscopia || '').trim()
  return peca.fraseRecebimento !== false ? `${FRASE_RECEBIMENTO} ${macro}`.trim() : macro
}

export function pecaCassetesLinhas(peca: Peca): string[] {
  return peca.cassetes.map((c) => `${casseteFaixa(peca.letter, c)} – ${c.descricao || ''}`)
}

export function resultadoLinhas(peca: Peca): string[] {
  const res = (peca.resultado || '').trim()
  return res ? res.split('\n') : ['[Resultado]']
}

export function buildCongText(doc: CongDoc, now: Date = new Date()): string {
  const lines: string[] = []
  lines.push(hospitalNome(doc.hospital) || '[Hospital]')
  lines.push(`Paciente: ${doc.paciente || '[Paciente]'}`)
  lines.push(`Cirurgião: ${doc.cirurgiao || '[Cirurgião]'}`)
  lines.push(`Patologista: ${doc.patologista || '[Patologista]'}`)
  const isquemia = congIsquemiaTexto(doc, now.getTime())
  if (isquemia) lines.push(`Tempo de isquemia fria: ${isquemia}`)
  if (doc.informesClinicosVisible && doc.informesClinicos.trim()) {
    lines.push(`Informes clínicos: ${doc.informesClinicos.trim()}`)
  }
  lines.push('')
  lines.push('EXAME TRANSOPERATÓRIO (CONGELAÇÃO)')
  for (const p of doc.pecas) {
    lines.push('')
    lines.push(`${p.letter}) ${p.nome || '[Nome da Peça]'}: ${pecaCorpo(p)} ${inclusaoFrase(p)}`)
    lines.push(...pecaCassetesLinhas(p))
  }
  lines.push('')
  lines.push('Resultado do exame de congelação')
  for (const p of doc.pecas) {
    lines.push(`${p.letter}) ${p.nome || '[Nome da Peça]'}: `)
    for (const line of resultadoLinhas(p)) lines.push(`- ${line}`)
    lines.push('')
  }
  lines.push(dataAssinatura(now))
  lines.push('')
  lines.push('___________________________________________')
  lines.push(doc.patologista ? `Dr(a). ${doc.patologista}` : '[Patologista]')
  return lines.join('\n')
}

/** Um modelo salvo, mostrado como laudo com os campos do paciente em branco. */
export function buildModeloText(modelo: Modelo, now: Date = new Date()): string {
  const lines: string[] = []
  lines.push('[Hospital]')
  lines.push('Paciente: [Paciente]')
  lines.push('Cirurgião: [Cirurgião]')
  lines.push(`Patologista: ${modelo.patologista || '[Patologista]'}`)
  if (modelo.informesClinicosVisible && modelo.informesClinicos.trim()) {
    lines.push(`Informes clínicos: ${modelo.informesClinicos.trim()}`)
  }
  lines.push('')
  lines.push('EXAME TRANSOPERATÓRIO (CONGELAÇÃO)')
  for (const p of modelo.pecas) {
    lines.push('')
    lines.push(`${p.letter}) ${p.nome || '[Nome da Peça]'}: ${(p.macroscopia || '').trim()} ${inclusaoFrase(p)}`)
    lines.push(...pecaCassetesLinhas(p))
  }
  lines.push('')
  lines.push('Resultado do exame de congelação')
  for (const p of modelo.pecas) {
    lines.push(`${p.letter}) ${p.nome || '[Nome da Peça]'}: `)
    for (const line of resultadoLinhas(p)) lines.push(`- ${line}`)
    lines.push('')
  }
  lines.push(dataAssinatura(now))
  lines.push('')
  lines.push('___________________________________________')
  lines.push(modelo.patologista ? `Dr(a). ${modelo.patologista}` : '[Patologista]')
  return lines.join('\n')
}

export function modeloLabel(modelo: Modelo): string {
  return `${modelo.dateStr} — ${modelo.pecas.map((p) => p.nome || '[Peça]').join(' + ')}`
}

/* ---- E-mail -------------------------------------------------------------- */

const semAcento = (s: string) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
const PALAVRAS_VAZIAS = ['de', 'da', 'do', 'das', 'dos', 'e', 'unidade', 'hospital']

/** "João Carlos da Silva" → "J.C.S." */
export function iniciaisPaciente(nome: string): string {
  const partes = String(nome || '')
    .trim()
    .split(/\s+/)
    .filter((w) => w && !PALAVRAS_VAZIAS.includes(semAcento(w).toLowerCase()))
  if (!partes.length) return ''
  return `${partes.map((w) => w.charAt(0).toUpperCase()).join('.')}.`
}

/** 'HAC'/'HOBRA' saem prontos; um nome escrito vira acrônimo. */
export function siglaHospital(valor: string): string {
  const v = String(valor || '').trim()
  if (!v) return ''
  const up = semAcento(v).toUpperCase()
  if (up === 'HAC' || up === 'HOBRA') return up
  if (/AGUAS\s+CLARAS/.test(up)) return 'HAC'
  if (/LAGO\s+SUL|HOBRA/.test(up)) return 'HOBRA'
  const iniciais = v
    .split(/\s+/)
    .filter((w) => !PALAVRAS_VAZIAS.includes(semAcento(w).toLowerCase()))
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
  return iniciais.slice(0, 6) || up.slice(0, 6)
}
