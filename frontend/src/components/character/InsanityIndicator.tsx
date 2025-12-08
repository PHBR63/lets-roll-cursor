// @ts-nocheck
/**
 * Componente de feedback visual para estados de insanidade
 * Versão melhorada com mais detalhes e integração com useInsanityState
 */
import { useInsanityState } from '@/hooks/useInsanityState'
import { AlertTriangle, Brain, Zap, CheckCircle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsanityIndicatorProps {
  currentSAN: number
  maxSAN: number
  /**
   * Se deve mostrar descrição detalhada
   */
  showDescription?: boolean
  /**
   * Tamanho do indicador
   */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Componente de feedback visual para estados de insanidade
 * Mostra cor, ícone e animação baseados no nível de SAN
 */
export function InsanityIndicator({ 
  currentSAN, 
  maxSAN, 
  showDescription = false,
  size = 'md',
  className 
}: InsanityIndicatorProps) {
  const insanityState = useInsanityState(currentSAN, maxSAN)

  const Icon = {
    NORMAL: CheckCircle,
    ABALADO_MENTAL: Brain,
    PERTURBADO: Zap,
    ENLOUQUECENDO: AlertTriangle,
    TOTALMENTE_INSANO: Eye,
  }[insanityState.state]

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-3 py-2 rounded-lg border transition-all relative overflow-hidden',
        sizeClasses[size],
        insanityState.pulse && 'animate-pulse',
        className
      )}
      style={{
        backgroundColor: `${insanityState.color}15`,
        borderColor: `${insanityState.color}40`,
        color: insanityState.color,
      }}
      title={insanityState.description}
    >
      {/* Glow effect de fundo */}
      {insanityState.intensity > 0 && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${insanityState.glowColor} 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      )}

      <div className="flex items-center gap-2 relative z-10">
        <Icon 
          className={cn(
            iconSizeClasses[size],
            insanityState.pulse && 'animate-pulse'
          )} 
        />
        <span className="font-semibold">{insanityState.message}</span>
        {insanityState.severity > 0 && (
          <span className="text-xs opacity-70">
            ({Math.round(insanityState.percentage)}%)
          </span>
        )}
      </div>

      {showDescription && (
        <p className="text-xs opacity-80 relative z-10 mt-1">
          {insanityState.description}
        </p>
      )}
    </div>
  )
}

