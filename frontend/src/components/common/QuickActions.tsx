// @ts-nocheck
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Edit, Eye, MoreVertical } from 'lucide-react'

/**
 * Props das ações rápidas
 */
interface QuickActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onMore?: () => void
  variant?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * Componente de ações rápidas para mobile
 * Botões otimizados para toque
 */
export function QuickActions({
  onEdit,
  onDelete,
  onView,
  onMore,
  variant = 'horizontal',
  className = '',
}: QuickActionsProps) {
  const buttonSize = 'h-10 w-10' // 40x40px - tamanho mínimo recomendado para toque

  return (
    <div
      className={`flex gap-2 ${
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      {onView && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onView}
          className={`${buttonSize} touch-manipulation`}
          title="Ver detalhes"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onEdit}
          className={`${buttonSize} touch-manipulation`}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className={`${buttonSize} touch-manipulation text-red-400 hover:text-red-500`}
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {onMore && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onMore}
          className={`${buttonSize} touch-manipulation`}
          title="Mais opções"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

