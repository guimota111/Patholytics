import { forwardRef } from 'react'
import { buildOrder, colLabel, coordOf, fillOf, keyOf, rowLabel, type CoreFill, type TmaState } from '../types'

/**
 * O mapa em papel: cabeçalho, a lâmina desenhada e a tabela de respostas.
 * Sempre preto sobre branco — vai para a impressora (PDF) e para o PNG,
 * então o CSS é uma string para poder viajar junto para a janela de impressão.
 */
export const TMA_PAPER_CSS = `
.tma-paper { background:#fff; color:#151a22; font-family:Inter,"Segoe UI",system-ui,sans-serif; font-size:12px; line-height:1.45; padding:36px 40px; width:100%; max-width:820px; margin:0 auto; box-sizing:border-box; }
.tma-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:2px solid #d9dde4; padding-bottom:12px; }
.tma-brand { font-weight:700; font-size:18px; letter-spacing:-0.01em; }
.tma-brand small { font-weight:400; font-size:11px; color:#8a93a3; margin-left:8px; }
.tma-title { font-weight:600; font-size:20px; margin-top:6px; }
.tma-meta { text-align:right; color:#5a6474; font-size:11px; white-space:nowrap; }
.tma-meta div { margin-bottom:2px; }
.tma-section { font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#5a6474; margin:20px 0 8px; }
.tma-map { display:block; max-width:100%; height:auto; }
.tma-legend { display:flex; gap:16px; margin-top:8px; font-size:11px; color:#5a6474; }
.tma-legend span { display:inline-flex; align-items:center; gap:6px; }
.tma-legend i { display:inline-block; width:10px; height:10px; border-radius:999px; border:1px solid #9aa3b2; box-sizing:border-box; }
.tma-legend i.partial { border:1px dashed #6a4cff; background:#f3f0ff; }
.tma-legend i.complete { border-color:#6a4cff; background:#ded7ff; }
.tma-tables { display:grid; gap:16px; align-items:start; }
.tma-tables table { width:100%; border-collapse:collapse; font-size:11px; }
.tma-tables th, .tma-tables td { border:1px solid #d9dde4; padding:3px 6px; text-align:left; vertical-align:top; word-break:break-word; }
.tma-tables th { background:#f4f5f7; font-weight:600; color:#5a6474; font-size:10px; text-transform:uppercase; letter-spacing:0.04em; }
.tma-tables th.coord, .tma-tables td.coord { font-variant-numeric:tabular-nums; font-weight:600; white-space:nowrap; width:1%; }
.tma-tables td.empty { color:#c3c9d3; }
.tma-tables tr { page-break-inside:avoid; break-inside:avoid; }
.tma-tables thead { display:table-header-group; }
.tma-foot { margin-top:20px; font-size:10px; color:#8a93a3; }
`

export interface PaperLabels {
  title: string
  dims: string
  progress: string
  coordinate: string
  empty: string
  partial: string
  complete: string
  footer: string
}

interface TmaPaperProps {
  state: TmaState
  /** Em quantas colunas lado a lado a tabela é dividida. */
  columns: number
  locale: string
  labels: PaperLabels
}

const DOT_FILL: Record<CoreFill, { fill: string; stroke: string; dash?: string }> = {
  empty: { fill: '#ffffff', stroke: '#9aa3b2' },
  partial: { fill: '#f3f0ff', stroke: '#6a4cff', dash: '2 2' },
  complete: { fill: '#ded7ff', stroke: '#6a4cff' },
}

export const TmaPaper = forwardRef<HTMLDivElement, TmaPaperProps>(function TmaPaper({ state, columns, locale, labels }, ref) {
  const order = buildOrder(state.rows, state.cols)
  const multi = state.fields.length > 1
  const chunks = splitEven(order, Math.max(1, columns))
  const date = new Date().toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })

  return (
    <div ref={ref} className="tma-paper">
      <div className="tma-head">
        <div>
          <div className="tma-brand">
            Patholytics<small>patholytics.web.app</small>
          </div>
          <div className="tma-title">{labels.title}</div>
        </div>
        <div className="tma-meta">
          <div>{date}</div>
          <div>{labels.dims}</div>
          <div>{labels.progress}</div>
        </div>
      </div>

      <div className="tma-section">{labels.title}</div>
      <MapSvg state={state} />
      <div className="tma-legend">
        <span>
          <i /> {labels.empty}
        </span>
        {multi && (
          <span>
            <i className="partial" /> {labels.partial}
          </span>
        )}
        <span>
          <i className="complete" /> {labels.complete}
        </span>
      </div>

      <div className="tma-section">{state.fields.map((field) => field.label).join(' · ')}</div>
      <div className="tma-tables" style={{ gridTemplateColumns: `repeat(${chunks.length}, minmax(0, 1fr))` }}>
        {chunks.map((chunk, i) => (
          <table key={i}>
            <thead>
              <tr>
                <th className="coord">{labels.coordinate}</th>
                {state.fields.map((field) => (
                  <th key={field.id}>{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chunk.map(([r, c]) => {
                const answers = state.results[keyOf(r, c)] ?? {}
                return (
                  <tr key={keyOf(r, c)}>
                    <td className="coord">{coordOf(r, c)}</td>
                    {state.fields.map((field) => {
                      const value = (answers[field.id] ?? '').trim()
                      return (
                        <td key={field.id} className={value ? undefined : 'empty'}>
                          {value || '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        ))}
      </div>

      <div className="tma-foot">{labels.footer}</div>
    </div>
  )
})

/** A lâmina: uma bolinha por core, com as letras das linhas e os números das colunas. */
function MapSvg({ state }: { state: TmaState }) {
  const pitch = 22
  const label = 26
  const width = label + state.cols * pitch
  const height = label + state.rows * pitch
  const r = pitch * 0.36

  return (
    <svg
      className="tma-map"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      {Array.from({ length: state.cols }, (_, c) => (
        <text
          key={`c${c}`}
          x={label + c * pitch + pitch / 2}
          y={label - 9}
          textAnchor="middle"
          fontSize="9"
          fill="#8a93a3"
          fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        >
          {colLabel(c)}
        </text>
      ))}
      {Array.from({ length: state.rows }, (_, row) => (
        <g key={`r${row}`}>
          <text
            x={label - 8}
            y={label + row * pitch + pitch / 2 + 3}
            textAnchor="end"
            fontSize="9"
            fill="#8a93a3"
            fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
          >
            {rowLabel(row)}
          </text>
          {Array.from({ length: state.cols }, (_, col) => {
            const style = DOT_FILL[fillOf(state.results[keyOf(row, col)], state.fields)]
            return (
              <circle
                key={keyOf(row, col)}
                cx={label + col * pitch + pitch / 2}
                cy={label + row * pitch + pitch / 2}
                r={r}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={1.2}
                strokeDasharray={style.dash}
              />
            )
          })}
        </g>
      ))}
    </svg>
  )
}

function splitEven<T>(items: T[], parts: number): T[][] {
  if (parts <= 1 || items.length <= parts) return [items]
  const size = Math.ceil(items.length / parts)
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}
