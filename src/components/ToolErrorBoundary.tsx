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
