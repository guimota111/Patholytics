/* ==========================================================================
   text.ts — miudezas de texto que o laudo de congelação e o da Mohs
   compartilham: listas em português, cassetes com letra, cronômetro de
   isquemia fria, a data por extenso da assinatura.
   ========================================================================== */

import type { Cron, Peca } from './types'

export const pad = (n: number) => String(n).padStart(2, '0')

/** "a, b e c". */
export function joinComma(items: string[]): string {
  if (!items.length) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}

export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

/** "Brasília, 9 de Setembro de 2026." — a linha de data da assinatura. */
export function dataAssinatura(now: Date = new Date()): string {
  return `Brasília, ${now.getDate()} de ${MESES[now.getMonth()]} de ${now.getFullYear()}.`
}

export function dataCurta(now: Date = new Date()): string {
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
}

/* ---- Cassetes ------------------------------------------------------------ */

/** "A" + "4" → "A4"; "A4" → "A4"; vazio → "". */
export function casseteId(letter: string, value: string): string {
  const v = String(value || '').trim()
  if (!v) return ''
  return v.toUpperCase().startsWith(letter.toUpperCase()) ? v : letter + v
}

/** "A4" → "4" para o campo, que mostra a letra à parte. */
export function stripCasseteLetter(letter: string, value: string): string {
  const v = String(value || '')
  return v.toUpperCase().startsWith(letter.toUpperCase()) ? v.slice(letter.length) : v
}

/** Nº de blocos da peça = maior número do mapeamento (mínimo 1). */
export function computeBlocos(peca: Peca): number {
  let max = 0
  for (const c of peca.cassetes) {
    const ref = c.fim && c.fim.trim() ? c.fim : c.inicio
    const n = parseInt(stripCasseteLetter(peca.letter, ref), 10)
    if (!Number.isNaN(n) && n > max) max = n
  }
  return max > 0 ? max : 1
}

/** "A1 a A3" ou "A1". */
export function casseteFaixa(letter: string, c: { inicio: string; fim: string }): string {
  const ini = casseteId(letter, c.inicio)
  const fim = casseteId(letter, c.fim)
  return fim ? `${ini} a ${fim}` : ini
}

/* ---- Cronômetro de isquemia fria ---------------------------------------- */

export function cronElapsedMs(cron: Cron | null | undefined, now: number = Date.now()): number {
  if (!cron || !cron.inicio) return 0
  const fim = cron.formol ? new Date(cron.formol).getTime() : now
  return Math.max(0, fim - new Date(cron.inicio).getTime())
}

/** mm:ss, ou h:mm:ss depois da primeira hora. */
export function fmtCronClock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** Como vai para o laudo: "45 min", "1h 20min". */
export function fmtIsquemia(ms: number): string {
  const min = Math.round(ms / 60000)
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${min} min`
  return m ? `${h}h ${pad(m)}min` : `${h}h`
}

export function fmtHoraCurta(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Linha "Tempo de isquemia fria: …" de uma etapa; vazio sem cronômetro. */
export function isquemiaTexto(cron: Cron | null | undefined, now: number = Date.now()): string {
  if (!cron || !cron.inicio) return ''
  const ms = cronElapsedMs(cron, now)
  if (!cron.formol) return `em andamento (${fmtIsquemia(ms)} até agora)`
  return `${fmtIsquemia(ms)} (congelação ${fmtHoraCurta(cron.inicio)} → formol ${fmtHoraCurta(cron.formol)})`
}

/* ---- Medidas ------------------------------------------------------------- */

export function fmtMedidasX(parts: string[], unidade = 'cm'): string {
  const vals = parts.map((x) => String(x || '').trim())
  if (vals.every((x) => !x)) return `[medidas] ${unidade}`
  return `${vals.map((x) => x || '_').join(' x ')} ${unidade}`
}

export function fmtMedidasPor(parts: string[]): string {
  const vals = parts.map((x) => String(x || '').trim())
  if (vals.every((x) => !x)) return '[medidas] cm'
  return `${vals.map((x) => x || '_').join(' por ')} cm`
}

const NUM_EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte']

export const numeroExtenso = (n: number) => NUM_EXTENSO[n] ?? String(n)

/* ---- Nome de arquivo ----------------------------------------------------- */

export const safeFileName = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '_')
