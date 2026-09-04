/* ==========================================================================
   exportImage.ts — PNG em proporção A4 com o caso: na macroscopia, a peça
   (tiles), duas vistas do 3D, o mapa das fatias, a tabela das lesões com as
   distâncias e o texto; na laudagem, o RCB (tiles), as grades de cassetes
   coloridas pela celularidade, as vistas 3D e os parâmetros.
   ========================================================================== */

import type { TFunction } from 'i18next'
import { A4, FAINT, FONT, INK, LINE, MONO, MUTED, drawFooter, drawHeader, drawTiles, ellipsize, loadImage, roundRect, toBlob, wrapLines } from '@/lib/canvasReport'
import type { MicroAnalysis } from './analysis'
import { labelSpan } from './cassettes'
import { fmtDims, fmtLen, fmtN, fmtWeight } from './format'
import { closestMargin, lesionSlices, marginDistances, sliceRange, slicesWithLesions } from './geometry'
import { caColor, RCB_CLASS_HEX } from './heat'
import { INK_HEX, lesionColor } from './inks'
import { MARGINS, type MacroState, type MicroState } from './types'

export interface Views {
  anterior: string | null
  slicing: string | null
}

interface Common {
  t: TFunction
  locale: string
  title: string
  views: Views
}

const M = 70
const W = A4.width - 2 * M

async function drawViews(ctx: CanvasRenderingContext2D, views: [string, string | null][], top: number, height: number) {
  const vW = (W - 30) / views.length
  for (let i = 0; i < views.length; i++) {
    const [label, src] = views[i]
    const x = M + i * (vW + 30)
    ctx.fillStyle = '#f4f5f7'
    roundRect(ctx, x, top, vW, height, 14)
    ctx.fill()
    if (src) {
      try {
        const img = await loadImage(src)
        const scale = Math.min((vW - 20) / img.width, (height - 44) / img.height)
        const dw = img.width * scale
        const dh = img.height * scale
        ctx.drawImage(img, x + (vW - dw) / 2, top + 8 + (height - 44 - dh) / 2, dw, dh)
      } catch {
        // sem imagem, fica só a caixa com o rótulo
      }
    }
    ctx.fillStyle = MUTED
    ctx.font = `600 19px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(label, x + vW / 2, top + height - 14)
    ctx.textAlign = 'left'
  }
  return top + height
}

function drawSliceStrip(ctx: CanvasRenderingContext2D, map: MacroState, y: number, t: TFunction): number {
  const rows = slicesWithLesions(map)
  const index = new Map(map.lesions.map((l, i) => [l.id, i]))
  const centrals = new Map(map.lesions.map((l) => [l.id, lesionSlices(l, map.slicing, map.specimen.dims).central]))
  const sq = Math.max(28, Math.min(54, Math.floor(W / rows.length) - 8))
  let x = M
  let yy = y
  for (const r of rows) {
    if (x + sq > M + W) {
      x = M
      yy += sq + 10
    }
    const first = r.lesionIds[0]
    ctx.fillStyle = first ? lesionColor(index.get(first) ?? 0) : '#eef0f3'
    roundRect(ctx, x, yy, sq, sq, 8)
    ctx.fill()
    ctx.strokeStyle = LINE
    ctx.lineWidth = 1.5
    roundRect(ctx, x + 1, yy + 1, sq - 2, sq - 2, 7)
    ctx.stroke()
    ctx.fillStyle = first ? '#ffffff' : MUTED
    ctx.font = `600 ${Math.round(sq * 0.4)}px ${MONO}`
    ctx.textAlign = 'center'
    ctx.fillText(String(r.slice), x + sq / 2, yy + sq / 2 + sq * 0.14)
    ctx.textAlign = 'left'
    if (r.lesionIds.some((id) => centrals.get(id) === r.slice)) {
      ctx.fillStyle = INK
      ctx.beginPath()
      ctx.arc(x + sq - 6, yy + 6, 6, 0, Math.PI * 2)
      ctx.fill()
    }
    x += sq + 8
  }
  yy += sq + 12
  ctx.fillStyle = FAINT
  ctx.font = `400 17px ${FONT}`
  ctx.fillText(t('breast.map.direction', { from: t(`breast.margin.${map.slicing.from}`), to: t(`breast.margin.${slicingTo(map)}`) }), M, yy + 14)
  return yy + 34
}

function slicingTo(map: MacroState) {
  const pair = { ml: ['medial', 'lateral'], si: ['inferior', 'superior'], ap: ['posterior', 'anterior'] }[map.slicing.axis]
  return map.slicing.from === pair[0] ? pair[1] : pair[0]
}

/** Texto corrido; se não couber no espaço, a fonte encolhe até 12 px antes de cortar com reticências. */
function drawParagraph(ctx: CanvasRenderingContext2D, text: string, y: number, maxY: number, size = 17): number {
  let chosen = size
  let lines: string[] = []
  for (let s = size; s >= 12; s--) {
    ctx.font = `400 ${s}px ${FONT}`
    lines = wrapLines(ctx, text, W)
    chosen = s
    if (y + lines.length * s * 1.42 <= maxY) break
  }
  ctx.fillStyle = INK
  ctx.font = `400 ${chosen}px ${FONT}`
  const lh = chosen * 1.42
  let yy = y
  for (const line of lines) {
    if (yy + lh > maxY) {
      ctx.fillStyle = FAINT
      ctx.fillText('…', M, yy + lh * 0.8)
      return yy + lh
    }
    ctx.fillStyle = line.startsWith('  ') ? MUTED : INK
    ctx.fillText(line, M, yy + lh * 0.8)
    yy += lh
  }
  return yy
}

export async function renderMacroImage(input: Common & { map: MacroState; text: string }): Promise<Blob> {
  const { map, t, locale, title, views, text } = input
  const canvas = document.createElement('canvas')
  canvas.width = A4.width
  canvas.height = A4.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, A4.width, A4.height)
  const sp = map.specimen
  let y = drawHeader(ctx, {
    margin: M,
    width: W,
    title,
    subtitle: `${t(`breast.specimenType.${sp.type}`)} · ${t(`breast.side.${sp.side}`)} · ${fmtDims(sp.dims, map.units, locale)}`,
    locale,
  })

  const closest = map.lesions[0] ? closestMargin(map.lesions[0], sp.dims) : null
  y = drawTiles(
    ctx,
    [
      { label: t('breast.export.tileWeight'), value: sp.weightGrams !== null ? fmtWeight(sp.weightGrams, locale) : '—', sub: fmtDims(sp.dims, map.units, locale) },
      { label: t('breast.export.tileLesions'), value: String(map.lesions.length), sub: map.lesions.map((l) => fmtDims(l.size, map.units, locale)).join(' · ') },
      {
        label: t('breast.export.tileClosest'),
        value: closest ? fmtLen(closest.mm, map.units, locale) : '—',
        sub: closest ? t(`breast.margin.${closest.margin}`) : '',
        color: closest ? INK_HEX[map.inks[closest.margin]] : undefined,
      },
      { label: t('breast.export.tileSlices'), value: String(map.slicing.count), sub: t('breast.map.direction', { from: t(`breast.margin.${map.slicing.from}`), to: t(`breast.margin.${slicingTo(map)}`) }) },
    ],
    M,
    y,
    W,
  )
  y += 36

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.map.title3d'), M, y + 26)
  y += 40
  y = await drawViews(ctx, [[t('breast.export.anteriorView'), views.anterior], [t('breast.export.slicingView'), views.slicing]], y, 560)
  y += 36

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.map.title2d'), M, y + 26)
  y += 40
  y = drawSliceStrip(ctx, map, y, t)

  // Tabela das lesões.
  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.export.lesionTable'), M, y + 26)
  y += 44
  const headers = [t('breast.lesion.label'), t('breast.lesion.size'), ...MARGINS.map((m) => t(`breast.marginShort.${m}`)), t('breast.export.colSlices')]
  const fr = [0.08, 0.2, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.18]
  const rowH = 34
  let xx = M
  ctx.font = `600 16px ${FONT}`
  ctx.fillStyle = FAINT
  headers.forEach((h, i) => {
    ctx.fillText(h.toUpperCase(), xx + 6, y + 22)
    xx += fr[i] * W
  })
  y += rowH
  for (const [i, l] of map.lesions.entries()) {
    ctx.strokeStyle = LINE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(M, y)
    ctx.lineTo(M + W, y)
    ctx.stroke()
    const dists = marginDistances(l, sp.dims)
    const vals = [
      l.label,
      fmtDims(l.size, map.units, locale),
      ...MARGINS.map((m) => {
        const d = dists.find((x) => x.margin === m)!
        return d.reached ? t('breast.export.reached') : fmtLen(d.mm, map.units, locale)
      }),
      sliceRange(lesionSlices(l, slicing(map), sp.dims)),
    ]
    xx = M
    vals.forEach((v, j) => {
      if (j === 0) {
        ctx.fillStyle = lesionColor(i)
        roundRect(ctx, xx + 4, y + 6, rowH - 12, rowH - 12, 5)
        ctx.fill()
        ctx.fillStyle = INK
        ctx.font = `600 17px ${MONO}`
        ctx.fillText(v, xx + rowH, y + 23)
      } else {
        ctx.fillStyle = INK
        ctx.font = `500 16px ${MONO}`
        ctx.fillText(ellipsize(ctx, v, fr[j] * W - 10), xx + 6, y + 23)
      }
      xx += fr[j] * W
    })
    y += rowH
  }
  y += 30

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.text.title'), M, y + 26)
  y += 42
  drawParagraph(ctx, text, y, A4.height - M - 30, 16)

  drawFooter(ctx, t('breast.export.footer'), M)
  return toBlob(canvas)
}

const slicing = (map: MacroState) => map.slicing

export async function renderMicroImage(input: Common & { state: MicroState; analysis: MicroAnalysis; summary: string }): Promise<Blob> {
  const { state, analysis: a, t, locale, title, views, summary } = input
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, locale)
  const map = state.map
  const canvas = document.createElement('canvas')
  canvas.width = A4.width
  canvas.height = A4.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, A4.width, A4.height)
  let y = drawHeader(ctx, {
    margin: M,
    width: W,
    title,
    subtitle: `${t(`breast.specimenType.${map.specimen.type}`)} · ${t(`breast.side.${map.specimen.side}`)} · ${t('breast.micro.mapSummary', { n: map.slicing.count, from: t(`breast.margin.${map.slicing.from}`) })}`,
    locale,
  })

  const cls = a.invalid ? null : (a.forcedClass ?? a.rcb?.rcbClass ?? null)
  y = drawTiles(
    ctx,
    [
      { label: t('breast.rcb.index'), value: a.rcb && !a.invalid && !a.forcedClass ? n(a.rcb.index, 2) : '—', sub: a.rcb ? t('breast.rcb.terms', { p: n(a.rcb.primaryTerm, 2), nn: n(a.rcb.nodalTerm, 2) }) : '' },
      { label: t('breast.rcb.classLabel'), value: cls ?? '—', sub: cls ? t(`breast.rcb.class.${cls}`) : '', color: cls ? RCB_CLASS_HEX[cls] : undefined },
      { label: t('breast.rcb.bed'), value: a.inputs.d1 !== null && a.inputs.d2 !== null ? `${n(a.inputs.d1, 0)}×${n(a.inputs.d2, 0)}` : '—', sub: `mm · ${t(`breast.rcb.source.${a.sources.d1}`)}` },
      { label: '%CA / %CIS', value: a.inputs.ca !== null ? `${n(a.inputs.ca, 0)} / ${n(a.inputs.cis ?? 0, 0)}` : '—', sub: t(`breast.rcb.source.${a.sources.ca}`) },
      { label: t('breast.rcb.nodesLabel'), value: a.inputs.ln !== null ? `${a.inputs.ln}` : '—', sub: (a.inputs.ln ?? 0) > 0 ? t('breast.rcb.dmetShort', { mm: n(a.inputs.dmet) }) : '' },
      { label: t('breast.rcb.stagingLabel'), value: a.ypT ? `${a.ypT} ${a.ypN}` : a.ypN, sub: a.pcr === null ? '' : a.pcr ? t('breast.rcb.pcrYes') : t('breast.rcb.pcrNo') },
    ],
    M,
    y,
    W,
  )
  y += 36

  // Grades de cassetes por lesão, coloridas pela celularidade.
  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.micro.step2Title'), M, y + 26)
  y += 44
  const sq = 64
  for (const [i, l] of a.lesions.entries()) {
    const p = l.plan
    ctx.fillStyle = lesionColor(i)
    ctx.beginPath()
    ctx.arc(M + 10, y + 12, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = `600 20px ${FONT}`
    ctx.fillText(
      `${t('breast.map.lesionN', { n: p.lesion.label })} · ${labelSpan(p.grid)} (${t('breast.map.sliceN', { n: p.central })})${l.caMean !== null ? ` · ${t('breast.micro.meanShort', { ca: n(l.caMean, 0), cis: n(l.cisMean ?? 0, 0) })}` : ''}`,
      M + 30,
      y + 19,
    )
    y += 34
    const cols = p.lesion.cassettes.cols
    let gx = M
    for (const d of p.grid) {
      const cell = state.cells[d.id]
      const ca = cell?.ca ?? null
      const x = gx + d.col * (sq + 6)
      const yy = y + d.row * (sq + 6)
      ctx.fillStyle = caColor(ca, 'light')
      roundRect(ctx, x, yy, sq, sq, 8)
      ctx.fill()
      ctx.strokeStyle = cell?.margin ? '#e11d48' : cell?.lvi ? '#7c5cff' : LINE
      ctx.lineWidth = cell?.margin || cell?.lvi ? 4 : 1.5
      roundRect(ctx, x + 1, yy + 1, sq - 2, sq - 2, 7)
      ctx.stroke()
      ctx.fillStyle = ca !== null && ca >= 40 ? '#ffffff' : INK
      ctx.font = `600 18px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText(d.label, x + sq / 2, yy + 26)
      ctx.font = `400 15px ${MONO}`
      ctx.fillText(ca === null ? '·' : `${ca}%${(cell?.cis ?? 0) > 0 ? `/${cell?.cis}` : ''}`, x + sq / 2, yy + 48)
      ctx.textAlign = 'left'
    }
    gx += cols * (sq + 6) + 30
    let ox = gx
    for (const d of p.others) {
      const cell = state.cells[d.id]
      const ca = cell?.ca ?? null
      if (ox + sq > M + W) break
      ctx.fillStyle = caColor(ca, 'light')
      roundRect(ctx, ox, y, sq, sq, 8)
      ctx.fill()
      ctx.strokeStyle = cell?.margin ? '#e11d48' : cell?.lvi ? '#7c5cff' : LINE
      ctx.lineWidth = cell?.margin || cell?.lvi ? 4 : 1.5
      roundRect(ctx, ox + 1, y + 1, sq - 2, sq - 2, 7)
      ctx.stroke()
      ctx.fillStyle = ca !== null && ca >= 40 ? '#ffffff' : INK
      ctx.font = `600 16px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText(d.label, ox + sq / 2, y + 24)
      ctx.font = `400 13px ${MONO}`
      ctx.fillText(`${t('breast.export.sliceShort', { n: d.slice })} ${ca === null ? '·' : `${ca}%`}`, ox + sq / 2, y + 46)
      ctx.textAlign = 'left'
      ox += sq + 6
    }
    y += p.lesion.cassettes.rows * (sq + 6) + 18
  }
  y += 10

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.map.title3d'), M, y + 26)
  y += 40
  y = await drawViews(ctx, [[t('breast.export.anteriorView'), views.anterior], [t('breast.export.slicingView'), views.slicing]], y, 400)
  y += 30

  ctx.fillStyle = INK
  ctx.font = `600 26px ${FONT}`
  ctx.fillText(t('breast.rcb.summaryTitle'), M, y + 26)
  y += 42
  drawParagraph(ctx, summary, y, A4.height - M - 30, 15)

  drawFooter(ctx, t('breast.export.footer'), M)
  return toBlob(canvas)
}
