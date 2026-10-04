/* eslint-disable react-refresh/only-export-components -- error boundaries precisam ser classes */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  /** Trocar a chave (ex.: a rota) zera o erro e tenta renderizar de novo. */
  resetKey: string
  children: ReactNode
}

interface State {
  error: Error | null
}

const STALE_RELOAD_KEY = 'patholytics.staleChunkReload'

/**
 * Depois de um deploy, a aba que ficou aberta ainda aponta para os chunks
 * antigos; o hosting responde o index.html no lugar do JS que não existe
 * mais, e o `import()` da rota falha. Foi o que deixou usuários numa tela em
 * branco no /dashboard logo após o login — recarregar resolvia. Aqui a
 * recarga é automática, uma vez só, para não entrar em loop se a falha for
 * outra.
 */
export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Importing a module script failed|Loading (CSS )?chunk|Unable to preload CSS|MIME type/i.test(message)
}

export function reloadOnceForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(STALE_RELOAD_KEY) ?? 0)
    if (Date.now() - last < 60_000) return false
    sessionStorage.setItem(STALE_RELOAD_KEY, String(Date.now()))
  } catch {
    // sem sessionStorage, recarrega mesmo assim — o pior caso é um refresh a mais
  }
  window.location.reload()
  return true
}

/**
 * Um erro de renderização dentro de uma ferramenta não pode apagar a tela
 * inteira: aqui ele vira uma mensagem com botão de recarregar, e fica no
 * console para diagnóstico. Os dados persistidos não são tocados.
 */
export class ToolErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Tool crashed:', error, info.componentStack)
    if (isStaleChunkError(error)) reloadOnceForStaleChunk()
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (this.state.error) return <CrashNotice error={this.state.error} />
    return this.props.children
  }
}

function CrashNotice({ error }: { error: Error }) {
  const { t } = useTranslation()
  return (
    <div className="shell py-16">
      <div className="mx-auto max-w-xl rounded-lg border border-danger/40 bg-danger-soft px-6 py-6">
        <p className="flex items-center gap-2 text-base font-semibold text-danger">
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          {t('common.errorTitle')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">{t('common.errorBody')}</p>
        <pre className="mt-3 max-h-32 overflow-auto rounded-md bg-elevated px-3 py-2 text-xs text-ink-muted">{error.message}</pre>
        <Button type="button" size="sm" className="mt-4" onClick={() => window.location.reload()}>
          <RotateCcw className="size-4" aria-hidden />
          {t('common.reload')}
        </Button>
      </div>
    </div>
  )
}
