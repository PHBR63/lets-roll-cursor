import { useToast as useShadcnToast } from '@/hooks/use-toast'

/**
 * Hook personalizado para exibir toasts
 * Facilita o uso de notificações em toda a aplicação
 */
export function useToast() {
  const { toast } = useShadcnToast()

  return {
    /**
     * Exibe toast de sucesso
     */
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'default',
        className: 'bg-green-600 text-white border-green-500',
      })
    },
    /**
     * Exibe toast de erro
     */
    error: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'destructive',
      })
    },
    /**
     * Exibe toast de informação
     */
    info: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'default',
        className: 'bg-blue-600 text-white border-blue-500',
      })
    },
    /**
     * Exibe toast de aviso
     */
    warning: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'default',
        className: 'bg-yellow-600 text-white border-yellow-500',
      })
    },
  }
}

