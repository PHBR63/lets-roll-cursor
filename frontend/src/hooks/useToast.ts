import { toast as sonnerToast } from 'sonner'
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'

/**
 * Opções avançadas para toast
 */
export interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  onDismiss?: () => void
  icon?: React.ReactNode
  loading?: boolean
}

/**
 * Hook personalizado para exibir toasts usando Sonner
 * Facilita o uso de notificações em toda a aplicação
 */
export function useToast() {
  return {
    /**
     * Exibe toast de sucesso
     */
    success: (title: string, options?: ToastOptions) => {
      sonnerToast.success(title, {
        description: options?.description,
        duration: options?.duration || 3000,
        action: options?.action,
        cancel: options?.cancel,
        onDismiss: options?.onDismiss,
        icon: options?.icon || <CheckCircle2 className="w-5 h-5 text-green-500" />,
      })
    },
    /**
     * Exibe toast de erro
     */
    error: (title: string, options?: ToastOptions) => {
      sonnerToast.error(title, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
        cancel: options?.cancel,
        onDismiss: options?.onDismiss,
        icon: options?.icon || <XCircle className="w-5 h-5 text-red-500" />,
      })
    },
    /**
     * Exibe toast de informação
     */
    info: (title: string, options?: ToastOptions) => {
      sonnerToast.info(title, {
        description: options?.description,
        duration: options?.duration || 3000,
        action: options?.action,
        cancel: options?.cancel,
        onDismiss: options?.onDismiss,
        icon: options?.icon || <Info className="w-5 h-5 text-blue-500" />,
      })
    },
    /**
     * Exibe toast de aviso
     */
    warning: (title: string, options?: ToastOptions) => {
      sonnerToast.warning(title, {
        description: options?.description,
        duration: options?.duration || 3000,
        action: options?.action,
        cancel: options?.cancel,
        onDismiss: options?.onDismiss,
        icon: options?.icon || <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      })
    },
    /**
     * Exibe toast de loading
     */
    loading: (title: string, options?: ToastOptions) => {
      return sonnerToast.loading(title, {
        description: options?.description,
        icon: <Loader2 className="w-5 h-5 animate-spin text-accent" />,
        duration: Infinity, // Não fecha automaticamente
      })
    },
    /**
     * Exibe toast com ação de desfazer
     */
    withUndo: (
      title: string,
      onUndo: () => void,
      options?: Omit<ToastOptions, 'action'>
    ) => {
      sonnerToast.success(title, {
        description: options?.description,
        duration: 5000,
        action: {
          label: 'Desfazer',
          onClick: onUndo,
        },
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        ...options,
      })
    },
    /**
     * Promise toast - mostra loading e atualiza com resultado
     */
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      })
    },
    /**
     * Dismiss toast específico
     */
    dismiss: (toastId: string | number) => {
      sonnerToast.dismiss(toastId)
    },
  }
}

