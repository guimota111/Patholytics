/* ==========================================================================
   exportImage.ts — monta um PNG em proporção A4 com o resumo do caso:
   tiles (volume, Gleason, grupo, padrões 4 e 5), o mapa dos cassetes por
   grupo, a tabela por cassete e duas vistas do modelo 3D. O mapeamento é o
   protagonista: o restante se ajusta ao espaço que sobra.
   ========================================================================== */

import type { TFunction } from 'i18next'
import type { Analysis, CellResult } from './analysis'
import { fmtN, gleasonText } from './format'
import { cellColor, EPE_HEX, MARGIN_HEX, PATTERN_HEX } from './heat'
import { groupColor } from './mapping'
import type { CaseState } from './types'
import { A4, ACCENT, ACCENT_SOFT, FAINT, FONT, INK, LINE, MONO, MUTED, drawLogoMark, ellipsize, loadImage, roundRect } from '@/lib/canvasReport'

export { A4 } from '@/lib/canvasReport'

export interface ExportInput {
  state: CaseState
  analysis: Analysis
  views: { anterior: string | null; posterior: string | null }
  t: TFunction
  locale: string
  title: string
}

export async function renderCaseImage(input: ExportInput): Promise<Blob> {
  const { state, analysis: a, t, locale, title } = input
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, locale)
  const canvas = document.createElement('canvas')
  canvas.width = A4.width
  canvas.height = A4.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const M = 70
  const W = A4.width - 2 * M
  let y = M

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, A4.width, A4.height)

  // ---- Cabeçalho: marca do Patholytics à esquerda, data à direita
  ctx.textBaseline = 'alphabetic'
  drawLogoMark(ctx, M + 26, y + 26, 24)
  ctx.fillStyle = INK
  ctx.font = `700 34px ${FONT}`
  ctx.fillText('Patholytics', M + 64, y + 38)
  ctx.fillStyle = FAINT
  ctx.font = `400 18px ${FONT}`
  ctx.fillText('patholytics.web.app', M + 64 + ctx.measureText('Patholytics').width * 1.9 + 16, y + 38)
  ctx.fillStyle = MUTED
  ctx.font = `400 20px ${FONT}`
  const dateText = new Date().toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })
  ctx.textAlign = 'right'
  ctx.fillText(dateText, M + W, y + 38)
  ctx.textAlign = 'left'
  y += 62
  ctx.strokeStyle = LINE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(M, y)
  ctx.lineTo(M + W, y)
  ctx.stroke()
  y += 22
  ctx.fillStyle = INK
  ctx.font = `600 36px ${FONT}`
  ctx.fillText(title, M, y + 34)
  y += 50
  ctx.fillStyle = MUTED
  ctx.font = `400 21px ${FONT}`
  ctx.fillText(
    t('prostate.summary.grid', { cells: state.mapping.total, groups: state.mapping.groups.length, prostate: a.prostateCells }),
    M,
    y + 22,
  )
  y += 52

  // ---- Tiles
  const g = a.gleason
  const cribText =
    a.cribriformOfG4 === null
      ? t('prostate.export.cribUnknown')
      : a.cribriformOfG4 > 0
        ? t('prostate.export.cribYes', { pct: n(a.cribriformOfG4) })
        : t('prostate.export.cribNo')
  const tiles: { label: string; value: string; sub: string; color?: string }[] = [
    { label: t('prostate.results.volume'), value: `${n(a.volumePct)}%`, sub: a.tumorGrams !== null ? `≈ ${n(a.tumorGrams, 2)} g` : t('prostate.results.involved', { n: a.involvedCells, total: a.prostateCells }) },
    { label: 'Gleason', value: g ? gleasonText(g) : '—', sub: g?.tertiary ? t('prostate.results.tertiaryShort', { p: g.tertiary.pattern }) : '' },
    { label: t('prostate.export.gradeGroup'), value: g ? String(g.gradeGroup) : '—', sub: 'ISUP / OMS' },
    { label: t('prostate.results.g4'), value: a.shares ? `${n(a.shares.p4)}%` : '—', sub: cribText, color: PATTERN_HEX[4] },
    { label: t('prostate.results.g5'), value: a.shares ? `${n(a.shares.p5)}%` : '—', sub: '', color: PATTERN_HEX[5] },
  ]
  const tileGap = 16
  const tileW = (W - tileGap * (tiles.length - 1)) / tiles.length
  const tileH = 150
  tiles.forEach((tile, i) => {
    const x = M + i * (tileW + tileGap)
    ctx.fillStyle = ACCENT_SOFT
    roundRect(ctx, x, y, tileW, tileH, 14)
    ctx.fill()
    if (tile.color) {
      ctx.fillStyle = tile.color
      roundRect(ctx, x, y, 12, tileH, 6)
      ctx.fill()
    }
    ctx.fillStyle = MUTED
    ctx.font = `600 18px ${FONT}`
    ctx.fillText(tile.label.toUpperCase(), x + 26, y + 38)
    ctx.fillStyle = ACCENT
    ctx.font = `700 52px ${MONO}`
    ctx.fillText(tile.value, x + 26, y + 96)
    ctx.fillStyle = MUTED
    ctx.font = `400 19px ${FONT}`
    ctx.fillText(ellipsize(ctx, tile.sub, tileW - 40), x + 26, y + 130)
  })
  y += tileH + 40

  // ---- Mapa dos cassetes (protagonista)
  const groups = state.mapping.groups
  const rowsMap: { name: string; meta: string; color: string; cells: CellResult[] }[] = groups.map((grp, i) => ({
    name: grp.name || t('prostate.mapping.namePlaceholder'),
    meta: [
      grp.side !== 'B' ? t(`prostate.side.${grp.side}`) : '',
      grp.tissue === 'prostate' && grp.region !== 'whole' ? t(`prostate.region.${grp.region}`) : '',
      grp.tissue === 'prostate' ? t(`prostate.span.${grp.span}`) : t(`prostate.tissue.${grp.tissue}`),
    ]
      .filter(Boolean)
      .join(' · '),
    color: groupColor(i),
    cells: a.cells.filter((c) => c.cell.group?.id === grp.id),
  }))
  const unmapped = a.cells.filter((c) => !c.cell.group)
  if (unmapped.length) rowsMap.push({ name: t('prostate.unmappedGroup'), meta: '', color: FAINT, cells: unmapped })

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('prostate.map.title2d'), M, y + 26)
  y += 44
  const maxCells = Math.max(1, ...rowsMap.map((r) => r.cells.length))
  const labelW = 380
  const sq = Math.max(30, Math.min(56, Math.floor((W - labelW - 20) / maxCells) - 8))
  const rowH = sq + 18
  for (const row of rowsMap) {
    ctx.fillStyle = row.color
    ctx.beginPath()
    ctx.arc(M + 10, y + rowH / 2, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = `600 21px ${FONT}`
    ctx.fillText(ellipsize(ctx, row.name, labelW - 40), M + 30, y + rowH / 2 - (row.meta ? 4 : -7))
    if (row.meta) {
      ctx.fillStyle = FAINT
      ctx.font = `400 17px ${FONT}`
      ctx.fillText(ellipsize(ctx, row.meta, labelW - 40), M + 30, y + rowH / 2 + 18)
    }
    row.cells.forEach((cr, i) => {
      const x = M + labelW + i * (sq + 8)
      const cy = y + 9
      ctx.fillStyle = cellColor(cr.worst, cr.tumor, 'light')
      roundRect(ctx, x, cy, sq, sq, 8)
      ctx.fill()
      ctx.strokeStyle = cr.data.margin ? MARGIN_HEX : LINE
      ctx.lineWidth = cr.data.margin ? 5 : 1.5
      roundRect(ctx, x + 1, cy + 1, sq - 2, sq - 2, 7)
      ctx.stroke()
      if (cr.data.epe !== 'none') {
        ctx.fillStyle = EPE_HEX
        ctx.beginPath()
        ctx.arc(x + sq - 6, cy + 6, 7, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = cr.tumor > 0 ? '#111' : MUTED
      ctx.font = `600 ${Math.round(sq * 0.4)}px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText(cr.cell.label, x + sq / 2, cy + sq / 2 + sq * 0.14)
      ctx.textAlign = 'left'
    })
    y += rowH
  }
  // legenda
  y += 6
  ctx.font = `400 17px ${FONT}`
  let lx = M
  const legend: [string, string][] = [
    [PATTERN_HEX[3], t('prostate.map.legendPattern', { p: 3 })],
    [PATTERN_HEX[4], t('prostate.map.legendPattern', { p: 4 })],
    [PATTERN_HEX[5], t('prostate.map.legendPattern', { p: 5 })],
    [MARGIN_HEX, t('prostate.map.legendMargin')],
    [EPE_HEX, t('prostate.map.legendEpe')],
  ]
  for (const [color, label] of legend) {
    ctx.fillStyle = color
    roundRect(ctx, lx, y + 4, 16, 16, 4)
    ctx.fill()
    ctx.fillStyle = MUTED
    ctx.fillText(label, lx + 24, y + 18)
    lx += 24 + ctx.measureText(label).width + 28
  }
  ctx.fillStyle = FAINT
  ctx.fillText(t('prostate.export.colorHint'), lx + 10, y + 18)
  y += 44

  // ---- Espaço restante: tabela + 3D
  const bottom = A4.height - M
  const viewsH = 420
  const tableTop = y + 44
  const tableAvail = bottom - viewsH - 40 - tableTop
  const cells = a.cells
  const cols2 = cells.length > 24
  const colW = cols2 ? (W - 30) / 2 : W
  const perCol = cols2 ? Math.ceil(cells.length / 2) : cells.length
  const rowHt = Math.max(20, Math.min(30, Math.floor(tableAvail / (perCol + 1))))

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('prostate.export.tableTitle'), M, y + 26)
  y = tableTop

  const headers = [t('prostate.table.cassette'), t('prostate.mapping.name'), t('prostate.export.colTumor'), 'G4', 'G5', t('prostate.table.margin'), t('prostate.table.epe'), 'Gleason']
  const fr = [0.1, 0.28, 0.1, 0.08, 0.08, 0.11, 0.09, 0.16]
  const drawTable = (x0: number, rows: CellResult[], y0: number) => {
    let yy = y0
    ctx.font = `600 ${Math.round(rowHt * 0.5)}px ${FONT}`
    ctx.fillStyle = FAINT
    let xx = x0
    headers.forEach((h, i) => {
      ctx.fillText(h.toUpperCase(), xx + 6, yy + rowHt * 0.68)
      xx += fr[i] * colW
    })
    yy += rowHt
    ctx.strokeStyle = LINE
    ctx.lineWidth = 1
    for (const r of rows) {
      ctx.beginPath()
      ctx.moveTo(x0, yy)
      ctx.lineTo(x0 + colW, yy)
      ctx.stroke()
      xx = x0
      const vals = [
        r.cell.label,
        r.cell.group?.name ?? t('prostate.unmappedGroup'),
        r.tumor > 0 || r.data.tumor !== null ? n(r.tumor, 0) : '',
        r.data.g4 !== null ? n(r.data.g4, 0) : '',
        r.data.g5 !== null ? n(r.data.g5, 0) : '',
        r.data.margin ? (r.data.marginMm !== null ? `${n(r.data.marginMm)} mm` : '✓') : '',
        r.data.epe === 'none' ? '' : r.data.epe === 'focal' ? t('prostate.export.epeFocal') : t('prostate.export.epeEstablished'),
        r.gleason ? `${gleasonText(r.gleason)} · GG${r.gleason.gradeGroup}` : '',
      ]
      vals.forEach((v, i) => {
        if (i === 0) {
          ctx.fillStyle = cellColor(r.worst, r.tumor, 'light')
          roundRect(ctx, xx + 4, yy + 4, rowHt - 8, rowHt - 8, 5)
          ctx.fill()
          ctx.fillStyle = INK
          ctx.font = `600 ${Math.round(rowHt * 0.55)}px ${MONO}`
          ctx.fillText(v, xx + rowHt + 2, yy + rowHt * 0.7)
        } else {
          ctx.fillStyle = i === 5 && v ? MARGIN_HEX : i === 6 && v ? EPE_HEX : i === 1 ? MUTED : INK
          ctx.font = `${i === 1 ? 400 : 500} ${Math.round(rowHt * 0.52)}px ${i === 1 ? FONT : MONO}`
          ctx.fillText(ellipsize(ctx, v, fr[i] * colW - 10), xx + 6, yy + rowHt * 0.7)
        }
        xx += fr[i] * colW
      })
      yy += rowHt
    }
    return yy
  }
  const yEnd1 = drawTable(M, cells.slice(0, perCol), y)
  const yEnd2 = cols2 ? drawTable(M + colW + 30, cells.slice(perCol), y) : y
  y = Math.max(yEnd1, yEnd2) + 30

  // ---- Vistas 3D
  const viewTop = Math.max(y, bottom - viewsH)
  const vH = bottom - viewTop - 30
  const vW = (W - 30) / 2
  const views: [string, string | null][] = [
    [t('prostate.export.anteriorView'), input.views.anterior],
    [t('prostate.export.posteriorView'), input.views.posterior],
  ]
  for (let i = 0; i < views.length; i++) {
    const [label, src] = views[i]
    const x = M + i * (vW + 30)
    ctx.fillStyle = '#f4f5f7'
    roundRect(ctx, x, viewTop, vW, vH, 14)
    ctx.fill()
    if (src) {
      try {
        const img = await loadImage(src)
        const scale = Math.min((vW - 20) / img.width, (vH - 44) / img.height)
        const dw = img.width * scale
        const dh = img.height * scale
        ctx.drawImage(img, x + (vW - dw) / 2, viewTop + 8 + (vH - 44 - dh) / 2, dw, dh)
      } catch {
        // sem imagem, fica só a caixa com o rótulo
      }
    }
    ctx.fillStyle = MUTED
    ctx.font = `600 19px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(label, x + vW / 2, viewTop + vH - 14)
    ctx.textAlign = 'left'
  }

  // ---- Rodapé
  ctx.fillStyle = FAINT
  ctx.font = `400 15px ${FONT}`
  ctx.fillText(t('prostate.export.footer'), M, A4.height - 28)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
