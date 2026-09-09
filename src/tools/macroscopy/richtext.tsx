/* ==========================================================================
   richtext.tsx — o pouco de formatação que um passo de macroscopia precisa,
   sem editor de texto rico e sem injetar HTML na página.

   Dialeto: `## título`, `- item de lista`, `**negrito**`, linha em branco
   separa parágrafos. Qualquer outra coisa é texto puro — o que o usuário
   digitou aparece como digitou.
   ========================================================================== */

import type { ReactNode } from 'react'

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string }

function parse(source: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
    paragraph = []
  }
  const flushList = () => {
    if (list.length) blocks.push({ kind: 'list', items: list })
    list = []
  }

  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (!line) {
      flushList()
      flushParagraph()
      continue
    }
    const heading = /^#{1,3}\s+(.*)$/.exec(line)
    if (heading) {
      flushList()
      flushParagraph()
      blocks.push({ kind: 'heading', text: heading[1] })
      continue
    }
    const item = /^[-*•]\s+(.*)$/.exec(line)
    if (item) {
      flushParagraph()
      list.push(item[1])
      continue
    }
    flushList()
    paragraph.push(line)
  }
  flushList()
  flushParagraph()
  return blocks
}

/** `**negrito**` vira <strong>; o resto é texto, nunca HTML. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const pattern = /\*\*([^*]+)\*\*/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index))
    out.push(
      <strong key={key++} className="font-semibold text-ink">
        {match[1]}
      </strong>,
    )
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function RichText({ source, className }: { source: string; className?: string }) {
  const blocks = parse(source)
  if (!blocks.length) return null

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h3 key={index} className="mt-5 mb-2 text-sm font-semibold tracking-tight text-ink first:mt-0">
              {inline(block.text)}
            </h3>
          )
        }
        if (block.kind === 'list') {
          return (
            <ul key={index} className="my-2 space-y-1.5">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-muted">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index} className="my-2 text-sm leading-relaxed text-ink-muted">
            {inline(block.text)}
          </p>
        )
      })}
    </div>
  )
}
