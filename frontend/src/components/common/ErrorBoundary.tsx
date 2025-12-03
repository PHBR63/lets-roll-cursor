import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Props do Error Boundary
 */
interface Props {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * State do Error Boundary
 */
interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary para capturar erros do React
 * Exibe uma tela de erro amigável ao invés de quebrar a aplicação
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * Atualiza o state quando um erro é capturado
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  /**
   * Registra informações do erro
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  /**
   * Reseta o estado de erro
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * Renderiza fallback customizado ou padrão
   */
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="bg-card border border-card-secondary rounded-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado</h1>
            <p className="text-text-secondary mb-6">
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-text-secondary cursor-pointer mb-2">
                  Detalhes do erro
                </summary>
                <pre className="text-xs text-red-400 bg-red-900/20 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-accent hover:bg-accent/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

