import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, X } from 'lucide-react'
import { Condition } from '@/types/ordemParanormal'

/**
 * Componente para timer de condições temporárias
 * Permite definir duração para condições que expiram automaticamente
 */
interface ConditionTimerProps {
  condition: Condition
  duration: number // Duração em rodadas
  onExpire: () => void
  onRemove: () => void
}

export function ConditionTimer({ condition, duration, onExpire, onRemove }: ConditionTimerProps) {
  const [remaining, setRemaining] = useState(duration)

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 60000) // 1 minuto = 1 rodada (ajustável)

    return () => clearInterval(timer)
  }, [remaining, onExpire])

  const formatTime = (rounds: number) => {
    if (rounds <= 0) return 'Expirado'
    return `${rounds} rodada${rounds !== 1 ? 's' : ''}`
  }

  return (
    <Badge
      variant="destructive"
      className="flex items-center gap-1 px-2 py-1"
    >
      <Clock className="w-3 h-3" />
      <span>{formatTime(remaining)}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-destructive/80 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  )
}

