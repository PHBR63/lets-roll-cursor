// @ts-nocheck
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/**
 * Componente de barra de progresso com label e valores
 * Usado para Vida, Energia, Saúde e XP
 */
interface ProgressBarProps {
  label: string
  current: number
  max: number
  variant?: 'life' | 'energy' | 'health' | 'xp'
  showValues?: boolean
  className?: string
}

export function ProgressBar({
  label,
  current,
  max,
  variant = 'xp',
  showValues = true,
  className,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{label}</span>
        {showValues && (
          <span className="text-white font-semibold">
            {current}/{max}
          </span>
        )}
      </div>
      <Progress value={percentage} variant={variant} />
      {variant === 'xp' && (
        <div className="text-xs text-text-secondary text-right">
          {percentage}%
        </div>
      )}
    </div>
  )
}

