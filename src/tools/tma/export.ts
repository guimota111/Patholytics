/* ==========================================================================
   export.ts — o mapa lido vira tabela: uma linha por core, uma coluna por
   campo. Daqui saem o texto para a área de transferência (tabulado, cola
   direto na planilha) e o arquivo CSV. Imagem e PDF ficam em TmaPaper.
   ========================================================================== */

import { downloadBlob } from '@/lib/canvasReport'
import { buildOrder, coordOf, hasControls, keyOf, type TmaState } from './types'

export interface TableOptions {
  /** Primeira linha com o nome dos campos. */
  header: boolean
  /** Primeira coluna com a coordenada do core (A1, A2…). */
  coordinate: boolean
  coordinateLabel: string
  /** Cabeçalho da coluna de controle; a coluna só sai quando o mapa tem controles. */
  controlLabel?: string
}

/** A tabela crua, já na ordem de leitura do mapa. Cores vazios viram células vazias. */
export function tableRows(state: TmaState, options: TableOptions): string[][] {
  const rows: string[][] = []
  const withControls = hasControls(state)
  if (options.header) {
    rows.push([
      ...(options.coordinate ? [options.coordinateLabel] : []),
      ...(withControls ? [options.controlLabel ?? 'Controle'] : []),
      ...state.fields.map((field) => field.label),
    ])
  }
  for (const [r, c] of buildOrder(state.rows, state.cols)) {
    const key = keyOf(r, c)
    const answers = state.results[key] ?? {}
    rows.push([
      ...(options.coordinate ? [coordOf(r, c)] : []),
      ...(withControls ? [state.controls[key] ?? ''] : []),
      ...state.fields.map((field) => (answers[field.id] ?? '').trim()),
    ])
  }
  return rows
}

/** Tabulado: cada linha continua casando com sua posição ao colar numa planilha. */
export function tsvText(state: TmaState, options: TableOptions): string {
  return tableRows(state, options)
    .map((row) => row.map((cell) => cell.replace(/[\t\r\n]+/g, ' ')).join('\t'))
    .join('\n')
}

/**
 * CSV com BOM para o Excel reconhecer o UTF-8. O separador segue o idioma:
 * em português o Excel espera ponto e vírgula, porque a vírgula é decimal.
 */
export function csvText(state: TmaState, options: TableOptions, locale: string): string {
  const sep = locale.toLowerCase().startsWith('pt') ? ';' : ','
  const quote = (cell: string) => (/[";,\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)
  return '﻿' + tableRows(state, options).map((row) => row.map(quote).join(sep)).join('\r\n')
}

export function downloadCsv(state: TmaState, options: TableOptions, locale: string, fileBase: string) {
  downloadBlob(new Blob([csvText(state, options, locale)], { type: 'text/csv;charset=utf-8' }), `${fileBase}.csv`)
}

export function fileBaseFor(state: TmaState): string {
  const stamp = new Date().toISOString().slice(0, 10)
  return `tma-${state.rows}x${state.cols}-${stamp}`
}
