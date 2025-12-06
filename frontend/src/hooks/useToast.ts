import { toast as sonnerToast } from 'sonner'

/**
 * Hook personalizado para exibir toasts usando Sonner
 * Facilita o uso de notificações em toda a aplicação
 */
export function useToast() {
  return {
    /**
     * Exibe toast de sucesso
     */
    success: (title: string, description?: string) => {
      sonnerToast.success(title, {
        description,
        duration: 3000,
      })
    },
    /**
     * Exibe toast de erro
     */
    error: (title: string, description?: string) => {
      sonnerToast.error(title, {
        description,
        duration: 4000,
      })
    },
    /**
     * Exibe toast de informação
     */
    info: (title: string, description?: string) => {
      sonnerToast.info(title, {
        description,
        duration: 3000,
      })
    },
    /**
     * Exibe toast de aviso
     */
    warning: (title: string, description?: string) => {
      sonnerToast.warning(title, {
        description,
        duration: 3000,
      })
    },
  }
}

