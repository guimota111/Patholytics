import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { congIsquemiaTexto, hospitalNome, inclusaoFrase, pecaCassetesLinhas, pecaCorpo, resultadoLinhas } from '../congText'
import {
  ampCasseteEntries,
  buildAmpResultLines,
  buildMohsCassetes,
  buildPrincipalResultLines,
  fragCasseteName,
  isquemiaLine,
  mohsAmpCorpo,
  mohsPecaCorpo,
  principalCasseteEntries,
} from '../mohs'
import { dataAssinatura, safeFileName } from '../text'
import type { CongDoc, MohsDoc, MohsFrag } from '../types'
import type { ExportKind } from './ExportCard'
import { MohsDiagram } from './MohsDiagram'

/** O laudo em papel: Georgia sobre branco, sempre — vai para a impressora e para o PNG. */
const LAUDO_CSS = `
.laudo-doc { background:#fff; color:#1a1a1a; font-family:'Georgia','Times New Roman',serif; font-size:14px; line-height:1.6; padding:44px 48px; width:100%; max-width:740px; margin:0 auto; box-sizing:border-box; }
.laudo-hospital { text-align:center; font-weight:700; font-size:16px; margin-bottom:18px; text-transform:uppercase; letter-spacing:0.5px; }
.laudo-meta { margin-bottom:18px; }
.laudo-meta div { margin-bottom:2px; }
.laudo-title { font-weight:700; text-transform:uppercase; margin:20px 0 10px; font-size:14px; border-bottom:1px solid #333; padding-bottom:4px; }
.laudo-peca { margin-bottom:14px; }
.laudo-peca-desc { text-align:justify; white-space:pre-line; }
.laudo-cassete { margin-left:18px; font-size:13px; }
.laudo-result { margin-bottom:10px; }
.laudo-result-list { margin:0; padding-left:26px; }
.laudo-result-list li { text-align:justify; }
.laudo-date { margin-top:28px; }
.laudo-sign { margin-top:44px; text-align:center; }
.laudo-sign-line { border-top:1px solid #333; width:300px; margin:0 auto 5px; }
.laudo-isquemia { margin-left:18px; font-size:13px; font-style:italic; color:#333; }
.laudo-diagramas { display:flex; flex-wrap:wrap; gap:16px; margin:10px 0 4px 18px; }
.laudo-diagrama { text-align:center; }
.laudo-diagrama-cap { font-size:11px; color:#444; margin-top:1px; font-family:Arial,Helvetica,sans-serif; }
.laudo-diagrama svg { width:150px; height:150px; }
`

interface ExportModalProps {
  kind: ExportKind
  doc: CongDoc | MohsDoc
  now: number
  fileBase: string
  onClose: () => void
}

export function ExportModal({ kind, doc, now, fileBase, onClose }: ExportModalProps) {
  const { t } = useTranslation()
  const paper = useRef<HTMLDivElement>(null)
  const [withDiagrams, setWithDiagrams] = useState(true)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const print = () => {
    const node = paper.current
    if (!node) return
    const w = window.open('', '_blank', 'width=820,height=1000')
    if (!w) {
      setFailed(true)
      return
    }
    w.document.write(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${safeFileName(fileBase)}</title><style>${LAUDO_CSS}@page{margin:14mm;} body{margin:0;background:#fff;} .laudo-peca,.laudo-result,.laudo-diagramas{page-break-inside:avoid;}</style></head><body>${node.outerHTML}</body></html>`,
    )
    w.document.close()
    w.focus()
    setTimeout(() => {
      try {
        w.print()
      } catch {
        // a janela pode ter sido fechada
      }
    }, 400)
  }

  const saveImage = async () => {
    const node = paper.current
    if (!node) return
    setBusy(true)
    setFailed(false)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${safeFileName(fileBase)}.png`
      a.click()
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={t('frozen.paper.title')} onClose={onClose} wide>
      <style>{LAUDO_CSS}</style>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={print}>
          <Printer className="size-4" aria-hidden />
          {t('frozen.paper.print')}
        </Button>
        <Button type="button" size="sm" variant="secondary" loading={busy} onClick={() => void saveImage()}>
          <ImageIcon className="size-4" aria-hidden />
          {t('frozen.paper.image')}
        </Button>
        {kind === 'mohs' && <Toggle checked={withDiagrams} onChange={setWithDiagrams} label={t('frozen.paper.diagrams')} />}
      </div>
      {failed && <p className="mt-2 text-sm text-danger">{t('frozen.paper.failed')}</p>}
      <div className="mt-4 overflow-auto rounded-md border border-line bg-[#e5e7eb] p-3">
        <div ref={paper} className="laudo-doc">
          {kind === 'cong' ? <CongPaper doc={doc as CongDoc} now={now} /> : <MohsPaper doc={doc as MohsDoc} now={now} withDiagrams={withDiagrams} />}
        </div>
      </div>
    </Modal>
  )
}

function CongPaper({ doc, now }: { doc: CongDoc; now: number }) {
  const isquemia = congIsquemiaTexto(doc, now)
  return (
    <>
      <div className="laudo-hospital">{hospitalNome(doc.hospital) || '[Hospital]'}</div>
      <div className="laudo-meta">
        <div>
          <strong>Paciente:</strong> {doc.paciente || '[Paciente]'}
        </div>
        <div>
          <strong>Cirurgião:</strong> {doc.cirurgiao || '[Cirurgião]'}
        </div>
        <div>
          <strong>Patologista:</strong> {doc.patologista || '[Patologista]'}
        </div>
        {isquemia && (
          <div>
            <strong>Tempo de isquemia fria:</strong> {isquemia}
          </div>
        )}
        {doc.informesClinicosVisible && doc.informesClinicos.trim() && (
          <div style={{ whiteSpace: 'pre-line' }}>
            <strong>Informes clínicos:</strong> {doc.informesClinicos.trim()}
          </div>
        )}
      </div>
      <div className="laudo-title">Exame Transoperatório (Congelação)</div>
      {doc.pecas.map((p) => (
        <div key={p.letter} className="laudo-peca">
          <div className="laudo-peca-desc">
            <strong>
              {p.letter}) {p.nome || '[Nome da Peça]'}:
            </strong>{' '}
            {pecaCorpo(p)} {inclusaoFrase(p)}
          </div>
          {pecaCassetesLinhas(p).map((line, i) => (
            <div key={i} className="laudo-cassete">
              {line}
            </div>
          ))}
        </div>
      ))}
      <div className="laudo-title">Resultado do Exame de Congelação</div>
      {doc.pecas.map((p) => (
        <div key={p.letter} className="laudo-result">
          <div>
            <strong>
              {p.letter}) {p.nome || '[Nome da Peça]'}:
            </strong>
          </div>
          <ul className="laudo-result-list">
            {resultadoLinhas(p).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ))}
      <Signature date={dataAssinatura(new Date(now))} name={doc.patologista ? `Dr(a). ${doc.patologista}` : '[Patologista]'} />
    </>
  )
}

function MohsPaper({ doc, now, withDiagrams }: { doc: MohsDoc; now: number; withDiagrams: boolean }) {
  const p = doc.pecaPrincipal
  const isqP = isquemiaLine(p, now)
  return (
    <>
      <div className="laudo-hospital">{doc.hospital || '[Hospital]'}</div>
      <div className="laudo-meta">
        <div>
          <strong>Paciente:</strong> {doc.paciente || '[Paciente]'}
        </div>
        <div>
          <strong>Cirurgião:</strong> {doc.cirurgiao || '[Cirurgião]'}
        </div>
        <div>
          <strong>Patologistas:</strong> {doc.patologistas || '[Patologistas]'}
        </div>
        {doc.informeClinicoVisible && doc.informeClinico.trim() && (
          <div style={{ whiteSpace: 'pre-line' }}>
            <strong>Informe clínico:</strong> {doc.informeClinico.trim()}
          </div>
        )}
      </div>
      <div className="laudo-title">Exame Transoperatório (Congelação)</div>
      <div className="laudo-peca">
        <div className="laudo-peca-desc">
          <strong>
            {p.letter}) {p.nome || '[Nome da Peça]'}:
          </strong>{' '}
          {mohsPecaCorpo(p)}
        </div>
        {buildMohsCassetes(p.letter, principalCasseteEntries(p), false, p.debulkingNome).map((line, i) => (
          <div key={i} className="laudo-cassete">
            {line}
          </div>
        ))}
        {isqP && <div className="laudo-isquemia">{isqP}</div>}
        {withDiagrams && <Diagramas frags={[p]} />}
      </div>
      {doc.ampliacoes.map((amp) => {
        const isqA = isquemiaLine(amp, now)
        return (
          <div key={amp.letter} className="laudo-peca">
            <div className="laudo-peca-desc">
              <strong>
                {amp.letter}) {amp.nome || '[Nome da Ampliação]'}:
              </strong>{' '}
              {mohsAmpCorpo(amp)}
            </div>
            {buildMohsCassetes(amp.letter, ampCasseteEntries(amp), amp.fragmentos.length > 1, null, amp.fragmentos.map(fragCasseteName)).map((line, i) => (
              <div key={i} className="laudo-cassete">
                {line}
              </div>
            ))}
            {isqA && <div className="laudo-isquemia">{isqA}</div>}
            {withDiagrams && <Diagramas frags={amp.fragmentos} />}
          </div>
        )
      })}
      <div className="laudo-title">Resultado do Exame de Congelação</div>
      <div className="laudo-result">
        <div>
          <strong>
            {p.letter}) {p.nome || '[Nome da Peça]'}:
          </strong>
        </div>
        <ul className="laudo-result-list">
          {buildPrincipalResultLines(p, doc.tipoTumor).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
      {doc.ampliacoes.map((amp) => (
        <div key={amp.letter} className="laudo-result">
          <div>
            <strong>
              {amp.letter}) {amp.nome || '[Nome da Ampliação]'}:
            </strong>
          </div>
          <ul className="laudo-result-list">
            {buildAmpResultLines(amp, doc.tipoTumor).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ))}
      <Signature date={dataAssinatura(new Date(now))} name={doc.patologistas ? `Dr(a). ${doc.patologistas}` : '[Patologista]'} />
    </>
  )
}

function Diagramas({ frags }: { frags: MohsFrag[] }) {
  const multi = frags.length > 1
  return (
    <div className="laudo-diagramas">
      {frags.map((f, i) => {
        const cap = f.nome && f.nome.trim() ? f.nome.trim() : multi ? `Fragmento ${i + 1}` : ''
        return (
          <div key={i} className="laudo-diagrama">
            <MohsDiagram frag={f} paper />
            {cap && <div className="laudo-diagrama-cap">{cap}</div>}
          </div>
        )
      })}
    </div>
  )
}

function Signature({ date, name }: { date: string; name: string }) {
  return (
    <>
      <div className="laudo-date">{date}</div>
      <div className="laudo-sign">
        <div className="laudo-sign-line" />
        {name}
      </div>
    </>
  )
}
