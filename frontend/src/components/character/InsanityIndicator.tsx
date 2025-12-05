import { useMemo } from 'react'
import { AlertTriangle, Brain, Zap, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsanityIndicatorProps {
  currentSAN: number
  maxSAN: number
  className?: string
}

/**
 * Componente de feedback visual para estados de insanidade
 * Mostra cor, ícone e animação baseados no nível de SAN
 */
export function InsanityIndicator({ currentSAN, maxSAN, className }: InsanityIndicatorProps) {
  const insanityState = useMemo(() => {
    if (maxSAN === 0) {
      return {
        state: 'NORMAL' as const,
        severity: 0,
        color: 'green',
        icon: CheckCircle,
        pulse: false,
        message: 'Sanidade normal',
      }
    }

    const percentage = (currentSAN / maxSAN) * 100

    // Totalmente Insano (SAN = 0)
    if (currentSAN <= 0) {
      return {
        state: 'TOTALMENTE_INSANO' as const,
        severity: 4,
        color: 'red',
        icon: AlertTriangle,
        pulse: true,
        message: 'Totalmente Insano! (SAN = 0)',
      }
    }

    // Enlouquecendo (SAN <= 25%)
    if (percentage <= 25) {
      return {
        state: 'ENLOUQUECENDO' as const,
        severity: 3,
        color: 'orange',
        icon: AlertTriangle,
        pulse: true,
        message: `Enlouquecendo! (${Math.round(percentage)}% SAN)`,
      }
    }

    // Perturbado (SAN <= 50%)
    if (percentage <= 50) {
      return {
        state: 'PERTURBADO' as const,
        severity: 2,
        color: 'yellow',
        icon: Zap,
        pulse: false,
        message: `Perturbado mentalmente (${Math.round(percentage)}% SAN)`,
      }
    }

    // Abalado Mentalmente (SAN <= 75%)
    if (percentage <= 75) {
      return {
        state: 'ABALADO_MENTAL' as const,
        severity: 1,
        color: 'blue',
        icon: Brain,
        pulse: false,
        message: `Mentalmente abalado (${Math.round(percentage)}% SAN)`,
      }
    }

    // Normal
    return {
      state: 'NORMAL' as const,
      severity: 0,
      color: 'green',
      icon: CheckCircle,
      pulse: false,
      message: 'Sanidade normal',
    }
  }, [currentSAN, maxSAN])

  const Icon = insanityState.icon

  const colorClasses = {
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
  }

  const pulseClasses = insanityState.pulse
    ? 'animate-pulse'
    : ''

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
        colorClasses[insanityState.color as keyof typeof colorClasses],
        pulseClasses,
        className
      )}
      title={insanityState.message}
    >
      <Icon className={cn('w-4 h-4', insanityState.pulse && 'animate-pulse')} />
      <span className="text-xs font-semibold">{insanityState.message}</span>
    </div>
  )
}

