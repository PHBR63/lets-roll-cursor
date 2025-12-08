// @ts-nocheck
import { ReactNode } from 'react'
import { Inbox, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props do Empty State
 */
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Componente para exibir estado vazio
 * Usado quando não há dados para exibir
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-card-secondary flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-text-secondary" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-md mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="bg-accent hover:bg-accent/90">
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Empty State para "não encontrado"
 */
export function NotFoundState({ title = 'Não encontrado', description }: { title?: string; description?: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-text-secondary" />}
      title={title}
      description={description || 'O item que você está procurando não foi encontrado.'}
    />
  )
}

