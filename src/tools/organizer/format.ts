export type CountdownLevel = 'ok' | 'warn' | 'overdue'

export interface Countdown {
  text: string
  level: CountdownLevel
}

/** Ultimas horas antes do prazo entram em ambar. */
const WARN_WINDOW_MS = 3 * 60 * 60 * 1000

/**
 * Contagem regressiva ate o prazo. Segundos so aparecem na ultima hora — num
 * prazo de dias eles seriam ruido. Vencido conta para cima, com sinal.
 */
export function formatCountdown(deadline: number, now: number = Date.now()): Countdown {
  const diff = deadline - now
  const overdue = diff <= 0
  const seconds = Math.floor(Math.abs(diff) / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, '0')

  let text: string
  if (days > 0) text = `${days}d ${pad(hours)}h`
  else if (hours > 0) text = `${hours}h ${pad(minutes)}m`
  else text = `${minutes}m ${pad(seconds % 60)}s`

  if (overdue) return { text: `+${text}`, level: 'overdue' }
  return { text, level: diff <= WARN_WINDOW_MS ? 'warn' : 'ok' }
}

/**
 * Uma caixa so para prazo, porque na pratica ele chega das duas formas: como
 * duracao ("3d", "2d4h", "45m") e como data ("25/12", "25/12/2026 14:30",
 * "2026-12-25"). Hora solta ("14:30") vale hoje, ou amanha se ja passou.
 * Retorna null quando nao reconhece nada.
 */
export function parseDeadlineInput(raw: string, now: number = Date.now()): number | null {
  const value = raw.trim().toLowerCase()
  if (!value) return null

  const relative = /^(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/.exec(value)
  if (relative && (relative[1] || relative[2] || relative[3])) {
    const minutes =
      Number(relative[1] ?? 0) * 24 * 60 + Number(relative[2] ?? 0) * 60 + Number(relative[3] ?? 0)
    return now + minutes * 60 * 1000
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[t ](\d{1,2}):(\d{2}))?$/.exec(value)
  if (iso) {
    const date = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      Number(iso[4] ?? 23),
      Number(iso[5] ?? 59),
    )
    return Number.isNaN(date.getTime()) ? null : date.getTime()
  }

  const dmy = /^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?(?:\s+(\d{1,2}):(\d{2}))?$/.exec(value)
  if (dmy) {
    const reference = new Date(now)
    const rawYear = dmy[3] ? Number(dmy[3]) : reference.getFullYear()
    const year = rawYear < 100 ? 2000 + rawYear : rawYear
    const date = new Date(
      year,
      Number(dmy[2]) - 1,
      Number(dmy[1]),
      Number(dmy[4] ?? 23),
      Number(dmy[5] ?? 59),
    )
    return Number.isNaN(date.getTime()) ? null : date.getTime()
  }

  const clock = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (clock) {
    const date = new Date(now)
    date.setHours(Number(clock[1]), Number(clock[2]), 0, 0)
    if (date.getTime() <= now) date.setDate(date.getDate() + 1)
    return date.getTime()
  }

  return null
}

/** Como o prazo volta para a caixa de edicao: data e hora completas. */
export function deadlineToInput(deadline: number | null): string {
  if (!deadline) return ''
  const date = new Date(deadline)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatStamp(ms: number, locale: string): string {
  return new Date(ms).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(ms: number, locale: string): string {
  return new Date(ms).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
}

/** Tags entram digitadas: separadas por virgula, sem repetir, sem vazias. */
export function parseTags(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(',')) {
    const tag = part.trim().slice(0, 24)
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
  }
  return out.slice(0, 12)
}
