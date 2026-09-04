/* ==========================================================================
   canvasReport.ts — primitivas para os relatórios em PNG (proporção A4) que
   as ferramentas de bancada exportam: cabeçalho com a marca, caixas,
   reticências, quebra de linha e rodapé. Cada ferramenta desenha o miolo.
   ========================================================================== */

/** A4 a ~200 dpi. */
export const A4 = { width: 1654, height: 2339 }

export const FONT = 'Inter, "Segoe UI", system-ui, sans-serif'
export const MONO = '"JetBrains Mono", Consolas, monospace'
export const INK = '#151a22'
export const MUTED = '#5a6474'
export const FAINT = '#8a93a3'
export const LINE = '#d9dde4'
export const ACCENT = '#4a2fd1'
export const ACCENT_SOFT = '#ece8ff'

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed'))
    img.src = src
  })
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** A marca do Patholytics (anel de íris com o campo central), como no site. */
export function drawLogoMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.strokeStyle = ACCENT
  ctx.fillStyle = ACCENT
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.4
  ctx.lineWidth = r * 0.14
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.6
  for (const [dx, dy] of [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * r * 0.72, cy + dy * r * 0.72)
    ctx.lineTo(cx + dx * r, cy + dy * r)
    ctx.stroke()
  }
  ctx.restore()
}

export function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let s = text
  while (s.length > 1 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1)
  return s + '…'
}

/** Quebra um parágrafo em linhas que cabem em `maxWidth` com a fonte atual. */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    if (!para.trim()) {
      out.push('')
      continue
    }
    const words = para.split(/\s+/)
    let line = ''
    for (const w of words) {
      const probe = line ? `${line} ${w}` : w
      if (ctx.measureText(probe).width <= maxWidth || !line) line = probe
      else {
        out.push(line)
        line = w
      }
    }
    if (line) out.push(line)
  }
  return out
}

/** Cabeçalho padrão: marca, endereço, data e título. Devolve o y seguinte. */
export function drawHeader(
  ctx: CanvasRenderingContext2D,
  opts: { margin: number; width: number; title: string; subtitle?: string; locale: string },
): number {
  const { margin: M, width: W, title, subtitle, locale } = opts
  let y = M
  ctx.textBaseline = 'alphabetic'
  drawLogoMark(ctx, M + 26, y + 26, 24)
  ctx.fillStyle = INK
  ctx.font = `700 34px ${FONT}`
  ctx.fillText('Patholytics', M + 64, y + 38)
  const brandW = ctx.measureText('Patholytics').width
  ctx.fillStyle = FAINT
  ctx.font = `400 18px ${FONT}`
  ctx.fillText('patholytics.web.app', M + 64 + brandW + 18, y + 38)
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
  if (subtitle) {
    ctx.fillStyle = MUTED
    ctx.font = `400 21px ${FONT}`
    ctx.fillText(ellipsize(ctx, subtitle, W), M, y + 22)
    y += 36
  }
  return y + 16
}

export function drawFooter(ctx: CanvasRenderingContext2D, text: string, margin: number) {
  ctx.fillStyle = FAINT
  ctx.font = `400 15px ${FONT}`
  ctx.fillText(text, margin, A4.height - 28)
}

/** Fileira de "tiles" de destaque, como na tela. Devolve o y seguinte. */
export function drawTiles(
  ctx: CanvasRenderingContext2D,
  tiles: { label: string; value: string; sub?: string; color?: string }[],
  x0: number,
  y: number,
  width: number,
  height = 150,
): number {
  const gap = 16
  const tileW = (width - gap * (tiles.length - 1)) / tiles.length
  tiles.forEach((tile, i) => {
    const x = x0 + i * (tileW + gap)
    ctx.fillStyle = ACCENT_SOFT
    roundRect(ctx, x, y, tileW, height, 14)
    ctx.fill()
    if (tile.color) {
      ctx.fillStyle = tile.color
      roundRect(ctx, x, y, 12, height, 6)
      ctx.fill()
    }
    ctx.fillStyle = MUTED
    ctx.font = `600 18px ${FONT}`
    ctx.fillText(ellipsize(ctx, tile.label.toUpperCase(), tileW - 40), x + 26, y + 38)
    ctx.fillStyle = ACCENT
    const big = tile.value.length > 12 ? 24 : tile.value.length > 9 ? 28 : tile.value.length > 6 ? 40 : 52
    ctx.font = `700 ${big}px ${MONO}`
    ctx.fillText(ellipsize(ctx, tile.value, tileW - 40), x + 26, y + 96)
    ctx.fillStyle = MUTED
    ctx.font = `400 19px ${FONT}`
    ctx.fillText(ellipsize(ctx, tile.sub ?? '', tileW - 40), x + 26, y + 130)
  })
  return y + height
}

export function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

/** Baixa um blob com o nome dado. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
